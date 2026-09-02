'use client';

import React, { useState } from 'react';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline?: boolean;
  isMuted?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export const TelegramConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  onDelete,
  onArchive,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'сейчас';
    if (diffMins < 60) return `${diffMins}м`;
    if (diffHours < 24) return `${diffHours}ч`;
    if (diffDays < 7) return `${diffDays}д`;

    return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#212121]">
      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl mb-2">💬</span>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Нет конверсаций</p>
          </div>
        </div>
      ) : (
        conversations.map((conv) => (
          <div
            key={conv.id}
            className={`flex items-center gap-3 px-2 py-2 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
              selectedId === conv.id ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
            onMouseEnter={() => setHoveredId(conv.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect?.(conv.id)}
          >
            {/* Avatar with online indicator */}
            <div className="relative flex-shrink-0">
              <div className="tg-avatar" style={{ width: '56px', height: '56px' }}>
                {conv.avatar ? (
                  <img src={conv.avatar} alt={conv.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  conv.name.charAt(0).toUpperCase()
                )}
              </div>
              {conv.isOnline && (
                <div className="absolute bottom-0 right-0 online-indicator pulse" />
              )}
            </div>

            {/* Conversation info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-black dark:text-white truncate">
                  {conv.name}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {formatTime(conv.timestamp)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {conv.isMuted ? '🔇' : ''} {conv.lastMessage}
                </p>
                {conv.unreadCount > 0 && (
                  <div className="bg-[#0088cc] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </div>
                )}
              </div>
            </div>

            {/* Action menu on hover */}
            {hoveredId === conv.id && (
              <div className="flex gap-1 flex-shrink-0">
                <button
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive?.(conv.id);
                  }}
                  title="Архивировать"
                >
                  📥
                </button>
                <button
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(conv.id);
                  }}
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TelegramConversationList;
