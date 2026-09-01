'use client';

import React, { useState } from 'react';
import { SearchIcon } from '@basagram/ui';
import { ChannelCard, CreateChannelDialog } from '@/components/ChannelComponents';

interface Channel {
  id: string;
  name: string;
  description?: string;
  subscriberCount: number;
  isSubscribed?: boolean;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: '1',
      name: 'новости',
      description: 'Последние новости и обновления',
      subscriberCount: 1245,
      isSubscribed: true,
    },
    {
      id: '2',
      name: 'объявления',
      description: 'Важные объявления для всех',
      subscriberCount: 892,
      isSubscribed: false,
    },
    {
      id: '3',
      name: 'разработка',
      description: 'Обсуждение разработки',
      subscriberCount: 456,
      isSubscribed: true,
    },
    {
      id: '4',
      name: 'дизайн',
      description: 'Дизайн и UX/UI',
      subscriberCount: 234,
      isSubscribed: false,
    },
  ]);

  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateChannel = (name: string, description?: string) => {
    const newChannel: Channel = {
      id: String(channels.length + 1),
      name: name.toLowerCase().replace(/\s+/g, '_'),
      description,
      subscriberCount: 1,
      isSubscribed: true,
    };
    setChannels([newChannel, ...channels]);
  };

  const handleSubscribe = (channelId: string) => {
    setChannels(
      channels.map((c) =>
        c.id === channelId
          ? { ...c, isSubscribed: true, subscriberCount: c.subscriberCount + 1 }
          : c
      )
    );
  };

  const handleUnsubscribe = (channelId: string) => {
    setChannels(
      channels.map((c) =>
        c.id === channelId
          ? { ...c, isSubscribed: false, subscriberCount: c.subscriberCount - 1 }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Каналы</h1>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            + Создать канал
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            placeholder="Поиск каналов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 md:px-6 flex gap-6">
        <button className="px-4 py-3 text-sm font-medium text-white border-b-2 border-primary-600">
          Все каналы
        </button>
        <button className="px-4 py-3 text-sm font-medium text-neutral-400 hover:text-white transition-colors border-b-2 border-transparent">
          Мои подписки
        </button>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto grid gap-4">
          {filteredChannels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400">Каналы не найдены</p>
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                {...channel}
                onSubscribe={() => handleSubscribe(channel.id)}
                onUnsubscribe={() => handleUnsubscribe(channel.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Channel Dialog */}
      <CreateChannelDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateChannel}
      />
    </div>
  );
}
