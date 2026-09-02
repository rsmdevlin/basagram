'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  totalChats: number;
  totalGroups: number;
  totalChannels: number;
  unreadMessages: number;
  missedCalls: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  path: string;
  color: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalChats: 0,
    totalGroups: 0,
    totalChannels: 0,
    unreadMessages: 0,
    missedCalls: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const quickActions: QuickAction[] = [
    { id: 'chats', title: 'Чаты', icon: '💬', path: '/chats', color: 'bg-blue-500' },
    { id: 'groups', title: 'Группы', icon: '👥', path: '/groups', color: 'bg-purple-500' },
    { id: 'channels', title: 'Каналы', icon: '#️⃣', path: '/channels', color: 'bg-indigo-500' },
    { id: 'calls', title: 'Звонки', icon: '📞', path: '/calls', color: 'bg-green-500' },
    { id: 'stories', title: 'Истории', icon: '📖', path: '/stories', color: 'bg-pink-500' },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const userRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) {
          router.push('/login');
          return;
        }

        const userData = await userRes.json();
        setUser(userData);

        // Load stats
        const [chatsRes, groupsRes, channelsRes, callsRes] = await Promise.all([
          fetch('/api/conversations', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/groups', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/channels', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/calls', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const chats = chatsRes.ok ? await chatsRes.json() : [];
        const groups = groupsRes.ok ? await groupsRes.json() : [];
        const channels = channelsRes.ok ? await channelsRes.json() : [];
        const calls = callsRes.ok ? await callsRes.json() : [];

        const unreadMessages = chats.reduce((sum: number, chat: any) => sum + (chat.unreadCount || 0), 0);
        const missedCalls = calls.filter((call: any) => call.status === 'missed').length;

        setStats({
          totalChats: chats.length,
          totalGroups: groups.length,
          totalChannels: channels.length,
          unreadMessages,
          missedCalls,
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load user data:', error);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-telegram-blue to-telegram-accent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загружаем...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-telegram-blue via-telegram-accent to-telegram-blue-light md:ml-20">
      {/* Header */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Добро пожаловать! 👋</h1>
          <p className="text-white text-opacity-90">
            Привет, {user?.displayName || user?.username}!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <p className="text-telegram-text-secondary text-sm font-semibold">Активных чатов</p>
            <p className="text-3xl font-bold text-telegram-text mt-2">{stats.totalChats}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <p className="text-telegram-text-secondary text-sm font-semibold">Групп</p>
            <p className="text-3xl font-bold text-telegram-text mt-2">{stats.totalGroups}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
            <p className="text-telegram-text-secondary text-sm font-semibold">Каналов</p>
            <p className="text-3xl font-bold text-telegram-text mt-2">{stats.totalChannels}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <p className="text-telegram-text-secondary text-sm font-semibold">Непрочитанных</p>
            <p className="text-3xl font-bold text-telegram-text mt-2">{stats.unreadMessages}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
            <p className="text-telegram-text-secondary text-sm font-semibold">Пропущено звонков</p>
            <p className="text-3xl font-bold text-telegram-text mt-2">{stats.missedCalls}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Быстрый доступ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.path}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 p-6 text-center group"
              >
                <div className={`${action.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition`}>
                  {action.icon}
                </div>
                <p className="font-semibold text-telegram-text">{action.title}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-telegram-text mb-4">🚀 Начало работы</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-telegram-blue text-white">
                  1️⃣
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-telegram-text">Начните чат</h3>
                <p className="text-sm text-telegram-text-secondary mt-1">
                  Откройте раздел чатов и создайте новый разговор или откройте существующий
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-telegram-blue text-white">
                  2️⃣
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-telegram-text">Создайте группу</h3>
                <p className="text-sm text-telegram-text-secondary mt-1">
                  Добавьте друзей в группу и начните групповой разговор с контролем доступа
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-telegram-blue text-white">
                  3️⃣
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-telegram-text">Делитесь историями</h3>
                <p className="text-sm text-telegram-text-secondary mt-1">
                  Публикуйте истории на 24 часа и делитесь моментами жизни со всеми
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Link */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 p-6 text-center">
          <p className="text-white mb-4">Хотите настроить свой профиль?</p>
          <Link
            href="/settings"
            className="inline-block bg-white text-telegram-blue px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition"
          >
            Перейти в параметры ⚙️
          </Link>
        </div>
      </div>
    </div>
  );
}
