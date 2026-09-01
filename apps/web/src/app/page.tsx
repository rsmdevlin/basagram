'use client';

import React from 'react';
import { RootLayout, ConversationList, ConversationHeader, MessageList, MessageComposer } from '@/components';

const sampleMessages = [
  {
    id: '1',
    content: 'Привет! Как дела?',
    sender: 'Антон',
    isOwn: false,
    timestamp: new Date(Date.now() - 3600000),
    status: 'read' as const,
  },
  {
    id: '2',
    content: 'Привет! Все отлично, спасибо за вопрос',
    sender: 'Ты',
    isOwn: true,
    timestamp: new Date(Date.now() - 3400000),
    status: 'read' as const,
  },
  {
    id: '3',
    content: 'Что нового?',
    sender: 'Антон',
    isOwn: false,
    timestamp: new Date(Date.now() - 3000000),
    status: 'read' as const,
  },
];

const sampleConversations = [
  {
    id: '1',
    name: 'Антон',
    lastMessage: 'Что нового?',
    unreadCount: 0,
  },
  {
    id: '2',
    name: 'Разработчики',
    lastMessage: 'Обсуждение новой фичи',
    unreadCount: 3,
  },
  {
    id: '3',
    name: 'Мама',
    lastMessage: 'Приходи на ужин',
    unreadCount: 1,
  },
];

export default function Home() {
  return (
    <RootLayout>
      <div className="hidden md:flex h-full">
        {/* Desktop Layout: Sidebar + Chat List + Conversation */}
        <ConversationList conversations={sampleConversations} />

        <div className="flex-1 flex flex-col">
          <ConversationHeader name="Антон" isOnline={true} />
          <MessageList messages={sampleMessages} />
          <MessageComposer />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col h-[calc(100vh-56px)]">
        <ConversationList conversations={sampleConversations} />
      </div>
    </RootLayout>
  );
}
