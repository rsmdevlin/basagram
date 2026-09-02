'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ConversationList from './ConversationList';
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

  const { socket, isConnected, emit, on, off } = useSocket();
  const { request: apiRequest } = useApi();

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // Assuming there's a /api/users/me endpoint
        const user = await apiRequest('/api/users/me');
        if (user) {
          setCurrentUser(user);
          // Notify server of online status
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
          // Join the conversation room for real-time updates
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
    // New message received
    const handleNewMessage = (message: any) => {
      setMessages((prev) => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp),
      }]);
    };

    // Typing indicator
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

    // Message read receipt
    const handleReadReceipt = (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, status: 'read' } : msg
        )
      );
    };

    // Message deleted
    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    };

    // Message edited
    const handleMessageEdited = (data: { messageId: string; content: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, content: data.content } : msg
        )
      );
    };

    // Reaction added
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
        // Update message with real ID and status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, id: response.id, status: 'sent' }
              : msg
          )
        );

        // Emit via Socket.io for real-time broadcast
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

  return (
    <div className="flex h-screen w-screen bg-[var(--tg-bg)]">
      {/* Left sidebar - Conversations */}
      <div className="hidden md:flex w-[300px] flex-col border-r border-[var(--tg-border)]">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId || undefined}
          onSelect={setActiveConversationId}
        />
      </div>

      {/* Main chat area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <ChatHeader
            name={activeConversation.name}
            avatar={activeConversation.avatar}
            online={activeConversation.online}
          />

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

            {/* Typing indicator */}
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
};

export default TelegramLayout;
