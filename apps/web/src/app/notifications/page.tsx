'use client';

import React, { useState } from 'react';
import { NotificationCenter, NotificationBadge } from '@/components/NotificationComponents';

interface Notification {
  id: string;
  type: 'message' | 'call' | 'reaction' | 'mention' | 'system';
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'Анна отправила сообщение',
      body: 'Привет! Как дела?',
      isRead: false,
      createdAt: new Date(Date.now() - 300000),
    },
    {
      id: '2',
      type: 'reaction',
      title: 'Боpис поставил реакцию ❤️',
      body: 'На ваше сообщение',
      isRead: false,
      createdAt: new Date(Date.now() - 600000),
    },
    {
      id: '3',
      type: 'call',
      title: 'Входящий звонок от Веры',
      body: 'Видеозвонок',
      isRead: true,
      createdAt: new Date(Date.now() - 1800000),
    },
    {
      id: '4',
      type: 'mention',
      title: 'Вас упомянули в комментарии',
      body: '@user сказал: Согласен с тобой',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: '5',
      type: 'system',
      title: 'Ваш профиль обновлён',
      body: 'Изменена фотография профиля',
      isRead: true,
      createdAt: new Date(Date.now() - 7200000),
    },
  ]);

  const [centerOpen, setCenterOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Уведомления
          </h1>
          <NotificationBadge
            count={unreadCount}
            isOpen={centerOpen}
            onClick={() => setCenterOpen(!centerOpen)}
          />
        </div>
        <p className="text-sm text-neutral-400 mt-2">
          Получайте обновления о сообщениях, звонках и реакциях
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🔔</p>
              <p className="text-neutral-400">Нет уведомлений</p>
              <p className="text-sm text-neutral-500 mt-2">
                Когда придёт новое уведомление, оно появится здесь
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notification.isRead
                      ? 'bg-neutral-900 border-neutral-800'
                      : 'bg-neutral-800 border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {notification.type === 'message' && '💬'}
                          {notification.type === 'call' && '📞'}
                          {notification.type === 'reaction' && '❤️'}
                          {notification.type === 'mention' && '@'}
                          {notification.type === 'system' && 'ℹ️'}
                        </span>
                        <p className="text-xs font-semibold text-neutral-400">
                          {notification.type === 'message' && 'Сообщение'}
                          {notification.type === 'call' && 'Звонок'}
                          {notification.type === 'reaction' && 'Реакция'}
                          {notification.type === 'mention' && 'Упоминание'}
                          {notification.type === 'system' && 'Система'}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary-500" />
                        )}
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          notification.isRead
                            ? 'text-neutral-300'
                            : 'text-white'
                        }`}
                      >
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="text-xs text-neutral-400 mt-1">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-xs text-neutral-500 mt-2">
                        {notification.createdAt.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="flex-shrink-0 p-1 hover:bg-neutral-700 rounded transition-colors text-neutral-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Center Popup */}
      {centerOpen && (
        <div className="fixed bottom-8 right-8 z-50 shadow-xl rounded-lg">
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
          />
        </div>
      )}
    </div>
  );
}
