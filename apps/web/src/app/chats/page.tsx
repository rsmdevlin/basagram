'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import Link from 'next/link';

interface Conversation {
  id: string;
  name?: string;
  type: string;
  lastMessage?: string;
  members?: any[];
}

export default function ChatsPage() {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [token]);

  const loadConversations = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.type === 'private' && conv.members) {
      const otherMember = conv.members.find(
        (m: any) => m.user_id !== (user as any)?.id
      );
      return otherMember?.display_name || 'Direct Chat';
    }
    return conv.name || 'Chat';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-4 z-10">
        <h2 className="text-lg font-semibold text-white mb-4">Мои чаты</h2>
        <input
          type="text"
          placeholder="Поиск чатов..."
          className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-neutral-400">Загрузка чатов...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-neutral-400 mb-2">Нет чатов</p>
            <p className="text-sm text-neutral-500">
              Начните новый чат, чтобы начать общение
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/chats/${conv.id}`}
              className="block px-4 py-3 border-b border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <h3 className="font-semibold text-white truncate">
                {getConversationName(conv)}
              </h3>
              {conv.lastMessage && (
                <p className="text-sm text-neutral-400 truncate mt-1">
                  {conv.lastMessage}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
