'use client';

import React, { useState, useEffect } from 'react';

interface Channel {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  isPublic: boolean;
  subscribersCount: number;
  createdAt: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/channels', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load channels');

        const data = await res.json();
        setChannels(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load channels:', error);
        setIsLoading(false);
      }
    };

    loadChannels();
  }, []);

  const handleCreateChannel = async () => {
    if (!channelName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: channelName,
          description: channelDescription,
          isPublic,
        }),
      });

      if (!res.ok) throw new Error('Failed to create channel');

      const newChannel = await res.json();
      setChannels([...channels, newChannel]);
      setChannelName('');
      setChannelDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-telegram-text-secondary">Загружаем каналы...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-telegram-text">Каналы</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-telegram-blue text-white px-6 py-2 rounded-lg hover:bg-telegram-accent transition"
          >
            + Создать канал
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-telegram-bg-hover p-6 rounded-lg mb-6 border border-telegram-border">
            <h2 className="text-lg font-semibold text-telegram-text mb-4">Новый канал</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Название канала"
                className="w-full px-4 py-2 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue"
              />
              <textarea
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                placeholder="Описание канала"
                className="w-full px-4 py-2 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue"
                rows={3}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 accent-telegram-blue"
                />
                <span className="text-telegram-text">Публичный канал</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateChannel}
                  className="bg-telegram-blue text-white px-6 py-2 rounded-lg hover:bg-telegram-accent transition"
                >
                  Создать
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-telegram-bg-hover text-telegram-text px-6 py-2 rounded-lg hover:bg-telegram-border transition border border-telegram-border"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setSelectedChannelId(channel.id)}
              className={`p-4 rounded-lg border cursor-pointer transition ${
                selectedChannelId === channel.id
                  ? 'border-telegram-blue bg-telegram-bg-selected'
                  : 'border-telegram-border hover:bg-telegram-bg-hover'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-avatar-blue flex items-center justify-center text-white font-bold flex-shrink-0">
                  #
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-telegram-text">{channel.name}</h3>
                  {channel.description && (
                    <p className="text-sm text-telegram-text-secondary line-clamp-2">{channel.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-telegram-text-secondary">
                    <span>{channel.subscribersCount} подписчиков</span>
                    {channel.isPublic && <span>• Публичный</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
