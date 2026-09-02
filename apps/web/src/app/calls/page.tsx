'use client';

import React, { useState, useEffect } from 'react';

interface Call {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  type: 'audio' | 'video';
  duration?: number;
  status: 'incoming' | 'outgoing' | 'missed';
  createdAt: string;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all');

  useEffect(() => {
    const loadCalls = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/calls', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load calls');

        const data = await res.json();
        setCalls(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load calls:', error);
        setIsLoading(false);
      }
    };

    loadCalls();
  }, []);

  const filteredCalls = calls.filter((call) => (filterType === 'all' ? true : call.status === filterType));

  const formatTime = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();

    if (isToday) {
      return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    return d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}с`;
    return `${mins}м ${secs}с`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-telegram-text-secondary">Загружаем звонки...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-telegram-text mb-6">Звонки</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'incoming', 'outgoing', 'missed'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                filterType === type
                  ? 'bg-telegram-blue text-white'
                  : 'bg-telegram-bg-hover text-telegram-text hover:bg-telegram-border'
              }`}
            >
              {type === 'all' && 'Все'}
              {type === 'incoming' && 'Входящие'}
              {type === 'outgoing' && 'Исходящие'}
              {type === 'missed' && 'Пропущенные'}
            </button>
          ))}
        </div>

        {/* Calls List */}
        <div className="space-y-2">
          {filteredCalls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-telegram-text-secondary mb-2">Нет звонков</p>
            </div>
          ) : (
            filteredCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 bg-telegram-bg-hover rounded-lg hover:bg-telegram-border transition border border-telegram-border"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-telegram-blue flex items-center justify-center text-white font-bold flex-shrink-0">
                    {call.participantName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-telegram-text truncate">{call.participantName}</p>
                    <div className="flex items-center gap-2">
                      {/* Status Icon */}
                      <span className="text-xs">
                        {call.status === 'incoming' && '⬇️ Входящий'}
                        {call.status === 'outgoing' && '⬆️ Исходящий'}
                        {call.status === 'missed' && '❌ Пропущенный'}
                      </span>
                      {/* Call Type */}
                      <span className="text-xs text-telegram-text-secondary">
                        {call.type === 'audio' ? '📞 Аудио' : '📹 Видео'}
                      </span>
                      {/* Duration */}
                      {call.duration && (
                        <span className="text-xs text-telegram-text-secondary">
                          • {formatDuration(call.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="text-xs text-telegram-text-secondary flex-shrink-0 ml-2">
                  {formatTime(call.createdAt)}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button className="text-telegram-blue hover:text-telegram-accent transition p-2 rounded-lg hover:bg-white">
                    {call.type === 'audio' ? '📞' : '📹'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
