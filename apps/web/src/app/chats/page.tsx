'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSocket from '../hooks/useSocket';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  reactions?: Array<{ emoji: string; count: number }>;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function ChatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { socket, isConnected } = useSocket();

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const userData = await res.json();
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load user:', error);
        router.push('/login');
      }
    };

    loadUser();
  }, [router]);

  // Load conversations
  useEffect(() => {
    if (!user || !isConnected) return;

    const loadConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setConversations(data);

        if (data.length > 0 && !selectedConversationId) {
          setSelectedConversationId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };

    loadConversations();
  }, [user, isConnected, selectedConversationId]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversationId) return;

    const loadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/conversations/${selectedConversationId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [selectedConversationId]);

  // Socket.io listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('message:new', (msg: Message) => {
      if (msg.conversationId === selectedConversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('user:typing', (data: { conversationId: string; userId: string }) => {
      // Handle typing indicator
    });

    return () => {
      socket.off('message:new');
      socket.off('user:typing');
    };
  }, [socket, isConnected, selectedConversationId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversationId || !user) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/conversations/${selectedConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageText }),
      });

      if (res.ok) {
        setMessageText('');
        const newMessage = await res.json();
        socket?.emit('message:send', newMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-blue mx-auto mb-4"></div>
          <p className="text-telegram-text-secondary">Загружаем чаты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Left Sidebar - Conversations List */}
        <div className="w-80 border-r border-telegram-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-telegram-border flex items-center justify-between">
            <h1 className="text-xl font-bold text-telegram-text">Telegram</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-telegram-blue hover:text-telegram-accent transition"
            >
              Выход
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-telegram-border">
            <input
              type="text"
              placeholder="Поиск чатов..."
              className="w-full px-4 py-2 bg-telegram-bg-hover rounded-full text-telegram-text placeholder-telegram-text-secondary focus:outline-none"
            />
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-telegram-text-secondary">
                <p>Нет чатов</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`p-3 border-b border-telegram-border cursor-pointer transition ${
                    selectedConversationId === conv.id ? 'bg-telegram-bg-selected' : 'hover:bg-telegram-bg-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-telegram-blue flex items-center justify-center text-white font-bold flex-shrink-0">
                      {conv.participantName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-telegram-text truncate">{conv.participantName}</p>
                      <p className="text-sm text-telegram-text-secondary truncate">{conv.lastMessage || 'Нет сообщений'}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-telegram-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        {selectedConversationId ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-telegram-border flex items-center justify-between bg-white">
              <div>
                <p className="font-semibold text-telegram-text">
                  {conversations.find((c) => c.id === selectedConversationId)?.participantName}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      msg.senderId === user?.id
                        ? 'bg-telegram-blue text-white rounded-br-none'
                        : 'bg-telegram-bg-hover text-telegram-text rounded-bl-none'
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-telegram-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Напишите сообщение..."
                  className="flex-1 px-4 py-2 border border-telegram-border rounded-full focus:outline-none focus:border-telegram-blue"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-telegram-blue text-white px-6 py-2 rounded-full hover:bg-telegram-accent transition font-semibold"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-telegram-text-secondary">
            <p>Выберите чат</p>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="p-4 border-b border-telegram-border flex items-center justify-between bg-white">
          <h1 className="text-lg font-bold text-telegram-text">Telegram</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-telegram-blue text-lg"
            >
              ☰
            </button>
          </div>
        </div>

        {showMobileMenu ? (
          // Mobile Menu
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConversationId(conv.id);
                  setShowMobileMenu(false);
                }}
                className="p-4 border-b border-telegram-border cursor-pointer hover:bg-telegram-bg-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-telegram-blue flex items-center justify-center text-white font-bold">
                    {conv.participantName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-telegram-text">{conv.participantName}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 border-t border-telegram-border">
              <button
                onClick={handleLogout}
                className="w-full text-center py-2 text-telegram-blue hover:text-telegram-accent transition font-semibold"
              >
                Выход
              </button>
            </div>
          </div>
        ) : (
          // Mobile Chat View
          selectedConversationId && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.senderId === user?.id
                          ? 'bg-telegram-blue text-white rounded-br-none'
                          : 'bg-telegram-bg-hover text-telegram-text rounded-bl-none'
                      }`}
                    >
                      <p className="break-words text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-telegram-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Сообщение..."
                    className="flex-1 px-3 py-2 text-sm border border-telegram-border rounded-full focus:outline-none focus:border-telegram-blue"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-telegram-blue text-white px-4 py-2 rounded-full hover:bg-telegram-accent transition text-sm font-semibold"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
