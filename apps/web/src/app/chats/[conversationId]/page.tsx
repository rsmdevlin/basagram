'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks';
import { SendIcon, AttachIcon, EmojiIcon } from '@basagram/ui';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatPageProps {
  params: {
    conversationId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationName, setConversationName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);

  const conversationId = params.conversationId;

  useEffect(() => {
    loadMessages();
    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${conversationId}?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            content: m.content,
            senderId: m.sender_id,
            senderName: m.display_name,
            timestamp: new Date(m.created_at),
            status: m.status,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.type === 'private' && data.members) {
          const otherMember = data.members.find(
            (m: any) => m.user_id !== (user as any)?.id
          );
          setConversationName(otherMember?.display_name || 'Chat');
        } else {
          setConversationName(data.name || 'Chat');
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const messageToSend = newMessage;
    setNewMessage('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId,
            content: messageToSend,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            content: data.content,
            senderId: data.sender_id,
            senderName: data.display_name,
            timestamp: new Date(data.created_at),
            status: 'sent',
          },
        ]);

        // Mark as read
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${conversationId}/read`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return '⏳';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 bg-neutral-900 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-white">{conversationName}</h2>
        <p className="text-xs text-neutral-500 mt-1">в сети</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-neutral-400">Загрузка сообщений...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-neutral-400">Чат пуст</p>
              <p className="text-sm text-neutral-500 mt-2">
                Напишите первое сообщение
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.senderId === (user as any)?.id ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex flex-col ${
                  msg.senderId === (user as any)?.id
                    ? 'items-end'
                    : 'items-start'
                }`}
              >
                <div
                  className={`
                    px-4 py-2 rounded-lg max-w-sm break-words
                    ${
                      msg.senderId === (user as any)?.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-800 text-neutral-100'
                    }
                  `}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-3 text-xs text-neutral-500">
                  <span>
                    {msg.timestamp.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.senderId === (user as any)?.id && (
                    <span>{getStatusIcon(msg.status)}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {typing && (
          <div className="flex gap-3 text-neutral-500 text-sm">
            <span>пишет</span>
            <span className="animate-bounce">●</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>
              ●
            </span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
              ●
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="px-4 md:px-6 py-4 bg-neutral-900 border-t border-neutral-800">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <button
            type="button"
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
            title="Прикрепить файл"
          >
            <AttachIcon size={20} />
          </button>

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none max-h-32"
            rows={1}
          />

          <button
            type="button"
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
            title="Смайлик"
          >
            <EmojiIcon size={20} />
          </button>

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors text-primary-500 hover:text-white disabled:text-neutral-600 disabled:hover:bg-transparent"
            title="Отправить"
          >
            <SendIcon size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
