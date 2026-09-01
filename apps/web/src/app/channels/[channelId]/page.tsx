'use client';

import React, { useState } from 'react';
import { Message, MessageList } from '@/components/Message';
import { MessageComposer } from '@/components/MessageComposer';
import { ConversationHeader } from '@/components/ConversationHeader';
import { ChannelHeader } from '@/components/ChannelComponents';

interface ChannelMessage {
  id: string;
  content: string;
  sender: string;
  senderId: string;
  isOwn: boolean;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export default function ChannelPage() {
  const [messages, setMessages] = useState<ChannelMessage[]>([
    {
      id: '1',
      content: 'Добро пожаловать в канал новостей! Здесь вы найдете последние обновления.',
      sender: 'Администратор',
      senderId: 'admin',
      isOwn: false,
      timestamp: new Date(Date.now() - 86400000),
      status: 'read',
    },
    {
      id: '2',
      content: 'Вышло новое обновление приложения с исправлением ошибок и улучшениями производительности.',
      sender: 'Администратор',
      senderId: 'admin',
      isOwn: false,
      timestamp: new Date(Date.now() - 43200000),
      status: 'read',
    },
  ]);

  const [isSubscribed, setIsSubscribed] = useState(true);
  const [channelName] = useState('новости');
  const [subscriberCount] = useState(1245);
  const [description] = useState('Последние новости и обновления');

  const handleSendMessage = (content: string) => {
    if (!isSubscribed) return;

    const newMessage: ChannelMessage = {
      id: String(messages.length + 1),
      content,
      sender: 'Вы',
      senderId: 'current-user',
      isOwn: true,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [
      ...prev,
      {
        ...newMessage,
        status: 'sent',
      },
    ]);
  };

  const handleToggleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950">
      {/* Channel Header */}
      <ChannelHeader
        name={channelName}
        subscriberCount={subscriberCount}
        description={description}
        isSubscribed={isSubscribed}
        onToggleSubscribe={handleToggleSubscribe}
      />

      {/* Messages */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Message List */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-neutral-400">Канал только что создан</p>
                <p className="text-sm text-neutral-500 mt-2">
                  Администраторы начнут публиковать сообщения здесь
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <Message
                key={msg.id}
                id={msg.id}
                content={msg.content}
                sender={msg.sender}
                isOwn={msg.isOwn}
                timestamp={msg.timestamp}
                status={msg.status}
              />
            ))
          )}
        </div>

        {/* Composer (only if subscribed) */}
        {isSubscribed && <MessageComposer onSend={handleSendMessage} disabled={false} />}

        {/* Subscribe Prompt */}
        {!isSubscribed && (
          <div className="px-4 md:px-6 py-4 bg-neutral-900 border-t border-neutral-800 text-center">
            <p className="text-neutral-400 text-sm mb-3">
              Подпишитесь на канал, чтобы видеть все сообщения и комментировать
            </p>
            <button
              onClick={handleToggleSubscribe}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
            >
              + Подписаться на канал
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
