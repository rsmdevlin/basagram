'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ConversationList from './ConversationList';
import MobileConversationMenu from './MobileConversationMenu';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import TypingIndicator from './TypingIndicator';
import useSocket from '../hooks/useSocket';
import useApi from '../hooks/useApi';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  conversationId: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'read' | 'failed';
  reactions?: Array<{ emoji: string; count: number; isReacted: boolean }>;
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: Date;
  unreadCount?: number;
  online?: boolean;
  muted?: boolean;
  isPinned?: boolean;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
}

export const TelegramLayout: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { socket, isConnected, emit, on, off } = useSocket();
  const { request: apiRequest } = useApi();

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await apiRequest('/api/users/me');
        if (user) {
          setCurrentUser(user);
          emit('user:online', { userId: user.id });
        }
      } catch (error) {
        console.error('Failed to load current user:', error);
      }
    };

    if (isConnected) {
      loadCurrentUser();
    }
  }, [isConnected, emit, apiRequest]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await apiRequest('/api/conversations');
        if (data && Array.isArray(data)) {
          setConversations(data);
          if (data.length > 0 && !activeConversationId) {
            setActiveConversationId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };

    loadConversations();
  }, [apiRequest, activeConversationId]);

  // Load messages for active conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversationId) return;

      try {
        const data = await apiRequest(`/api/conversations/${activeConversationId}/messages`);
        if (data && Array.isArray(data)) {
          setMessages(data.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })));
          emit('conversation:join', { conversationId: activeConversationId });
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    return () => {
      if (activeConversationId) {
        emit('conversation:leave', { conversationId: activeConversationId });
      }
    };
  }, [activeConversationId, apiRequest, emit]);

  // Socket.io event listeners
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      setMessages((prev) => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp),
      }]);
    };

    const handleTypingIndicator = (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        if (data.isTyping) {
          updated.add(data.userId);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });
    };

    const handleReadReceipt = (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, status: 'read' } : msg
        )
      );
    };

    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    };

    const handleMessageEdited = (data: { messageId: string; content: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, content: data.content } : msg
        )
      );
    };

    const handleReactionAdded = (data: { messageId: string; emoji: string; userId: string }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            const reactions = [...(msg.reactions || [])];
            const existing = reactions.find((r) => r.emoji === data.emoji);
            if (existing) {
              existing.count++;
            } else {
              reactions.push({ emoji: data.emoji, count: 1, isReacted: false });
            }
            return { ...msg, reactions };
          }
          return msg;
        })
      );
    };

    on('message:new', handleNewMessage);
    on('typing:indicator', handleTypingIndicator);
    on('message:read-receipt', handleReadReceipt);
    on('message:deleted', handleMessageDeleted);
    on('message:edited', handleMessageEdited);
    on('reaction:added', handleReactionAdded);

    return () => {
      off('message:new', handleNewMessage);
      off('typing:indicator', handleTypingIndicator);
      off('message:read-receipt', handleReadReceipt);
      off('message:deleted', handleMessageDeleted);
      off('message:edited', handleMessageEdited);
      off('reaction:added', handleReactionAdded);
    };
  }, [on, off]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeConversationId || !currentUser) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      content,
      senderId: currentUser.id,
      senderName: currentUser.name,
      conversationId: activeConversationId,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await apiRequest(`/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        body: { content },
      });

      if (response) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, id: response.id, status: 'sent' }
              : msg
          )
        );

        emit('message:send', {
          id: response.id,
          content,
          senderId: currentUser.id,
          senderName: currentUser.name,
          conversationId: activeConversationId,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        )
      );
    }
  }, [activeConversationId, currentUser, apiRequest, emit]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!activeConversationId) return;
    if (isTyping) {
      emit('typing:start', { conversationId: activeConversationId, userId: currentUser?.id });
    } else {
      emit('typing:stop', { conversationId: activeConversationId, userId: currentUser?.id });
    }
  }, [activeConversationId, currentUser?.id, emit]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Desktop layout (768px+)
  if (!isMobile) {
    return (
      <div className="flex h-screen w-screen bg-[var(--tg-bg)]">
        {/* Left sidebar */}
        <div className="w-[300px] flex flex-col border-r border-[var(--tg-border)]">
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId || undefined}
            onSelect={setActiveConversationId}
          />
        </div>

        {/* Main chat area */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col">
            <ChatHeader
              name={activeConversation.name}
              avatar={activeConversation.avatar}
              online={activeConversation.online}
            />

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-6xl mb-4">💬</span>
                  <p className="text-[var(--tg-text-secondary)]">
                    Start a conversation by sending a message
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    id={msg.id}
                    content={msg.content}
                    sender={{
                      id: msg.senderId,
                      name: msg.senderName,
                    }}
                    timestamp={msg.timestamp}
                    direction={msg.senderId === currentUser?.id ? 'outgoing' : 'incoming'}
                    status={msg.status}
                    reactions={msg.reactions}
                  />
                ))
              )}

              {typingUsers.size > 0 && (
                <TypingIndicator users={Array.from(typingUsers)} />
              )}
            </div>

            <MessageComposer
              onSend={handleSendMessage}
              onTyping={handleTyping}
              disabled={!currentUser}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[var(--tg-bg)]">
            <div className="text-center">
              <span className="text-6xl mb-4 block">📱</span>
              <p className="text-[var(--tg-text-secondary)]">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile layout (<768px)
  return (
    <div className="flex h-screen w-screen bg-[var(--tg-bg)] flex-col">
      {/* Mobile header */}
      {activeConversation ? (
        <>
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--tg-bg)] border-b border-[var(--tg-border)]">
            <button
              onClick={() => setActiveConversationId(null)}
              className="p-2 hover:bg-[var(--tg-surface)] rounded-lg transition-colors text-[var(--tg-text)]"
            >
              ← Back
            </button>
            <ChatHeader
              name={activeConversation.name}
              avatar={activeConversation.avatar}
              online={activeConversation.online}
              className="flex-1 ml-2"
            />
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-6xl mb-4">💬</span>
                <p className="text-[var(--tg-text-secondary)]">
                  Start a conversation by sending a message
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  id={msg.id}
                  content={msg.content}
                  sender={{
                    id: msg.senderId,
                    name: msg.senderName,
                  }}
                  timestamp={msg.timestamp}
                  direction={msg.senderId === currentUser?.id ? 'outgoing' : 'incoming'}
                  status={msg.status}
                  reactions={msg.reactions}
                />
              ))
            )}

            {typingUsers.size > 0 && (
              <TypingIndicator users={Array.from(typingUsers)} />
            )}
          </div>

          {/* Message composer */}
          <MessageComposer
            onSend={handleSendMessage}
            onTyping={handleTyping}
            disabled={!currentUser}
          />
        </>
      ) : (
        <>
          {/* Chat list header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--tg-border)]">
            <h1 className="text-2xl font-bold text-[var(--tg-text)]">Chats</h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-[var(--tg-surface)] rounded-lg transition-colors"
            >
              ☰
            </button>
          </div>

          {/* Conversations list for mobile */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <span className="text-4xl mb-2">💬</span>
                <p className="text-[var(--tg-text-secondary)] text-sm">
                  No conversations yet
                </p>
              </div>
            ) : (
              conversations.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveConversationId(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--tg-surface)] border-b border-[var(--tg-border)]"
                >
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-medium text-sm truncate text-[var(--tg-text)]">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[var(--tg-text-secondary)] truncate">
                      {item.lastMessage || 'No messages yet'}
                    </p>
                  </div>

                  {item.unreadCount ? (
                    <div className="flex-shrink-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {item.unreadCount}
                    </div>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* Mobile menu */}
      <MobileConversationMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        conversations={conversations}
        onSelectConversation={setActiveConversationId}
        activeConversationId={activeConversationId || undefined}
      />
    </div>
  );
};

export default TelegramLayout;

