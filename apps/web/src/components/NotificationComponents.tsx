'use client';

import React, { useState } from 'react';
import { CloseIcon } from '@basagram/ui';

interface Notification {
  id: string;
  type: 'message' | 'call' | 'reaction' | 'mention' | 'system';
  title: string;
  body?: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationItemProps extends Notification {
  onRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  title,
  body,
  isRead,
  createdAt,
  onRead,
  onDelete,
  onClick,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'message':
        return '💬';
      case 'call':
        return '📞';
      case 'reaction':
        return '❤️';
      case 'mention':
        return '@';
      case 'system':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'message':
        return 'Сообщение';
      case 'call':
        return 'Звонок';
      case 'reaction':
        return 'Реакция';
      case 'mention':
        return 'Упоминание';
      case 'system':
        return 'Система';
      default:
        return 'Уведомление';
    }
  };

  const handleClick = () => {
    if (!isRead) {
      onRead?.(id);
    }
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-lg cursor-pointer transition-all border ${
        isRead
          ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          : 'bg-neutral-800 border-neutral-700 hover:border-primary-500'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getIcon()}</span>
            <p className="text-xs font-semibold text-neutral-400">{getLabel()}</p>
            {!isRead && (
              <span className="w-2 h-2 rounded-full bg-primary-500 ml-auto" />
            )}
          </div>
          <p className={`text-sm font-medium truncate ${isRead ? 'text-neutral-300' : 'text-white'}`}>
            {title}
          </p>
          {body && (
            <p className="text-xs text-neutral-400 truncate mt-1">{body}</p>
          )}
          <p className="text-xs text-neutral-500 mt-2">
            {createdAt.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(id);
          }}
          className="flex-shrink-0 p-1 hover:bg-neutral-700 rounded transition-colors"
        >
          <CloseIcon size={16} />
        </button>
      </div>
    </div>
  );
};

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) =>
    filter === 'unread' ? !n.isRead : true
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Уведомления</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Непрочитанные
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="w-full px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded transition-colors"
          >
            Отметить все как прочитанные
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-neutral-800 max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-neutral-400">
              {filter === 'unread'
                ? 'Нет непрочитанных уведомлений'
                : 'Нет уведомлений'}
            </p>
          </div>
        ) : (
          filtered.map((notification) => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-neutral-800">
          <button
            onClick={onClearAll}
            className="w-full px-3 py-2 text-neutral-400 hover:text-white text-xs transition-colors"
          >
            Очистить все уведомления
          </button>
        </div>
      )}
    </div>
  );
};

interface NotificationBadgeProps {
  count: number;
  isOpen?: boolean;
  onClick?: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  isOpen,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-colors ${
        isOpen
          ? 'bg-neutral-800 text-primary-500'
          : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
      }`}
      title="Уведомления"
    >
      🔔
      {count > 0 && (
        <span className="absolute top-1 right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};
