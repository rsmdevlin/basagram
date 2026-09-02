'use client';

import React, { useState } from 'react';
import Avatar from './Avatar';
import Badge from './Badge';

interface ConversationListItem {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: Date | string;
  unreadCount?: number;
  online?: boolean;
  muted?: boolean;
  isPinned?: boolean;
}

interface ConversationListProps {
  conversations: ConversationListItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  onSearch,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const pinnedConversations = conversations.filter((c) => c.isPinned);
  const regularConversations = conversations.filter((c) => !c.isPinned);

  const ConversationRow: React.FC<{ item: ConversationListItem }> = ({ item }) => (
    <button
      onClick={() => onSelect(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2 transition-colors hover:bg-[var(--tg-surface)] ${
        activeId === item.id
          ? 'bg-[var(--tg-surface)] border-l-4 border-[var(--tg-primary)]'
          : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar
          src={item.avatar}
          initials={item.name.substring(0, 2)}
          size="md"
          online={item.online}
        />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-sm truncate text-[var(--tg-text)]">
            {item.name}
          </h3>
          <span className="text-xs text-[var(--tg-text-tertiary)] flex-shrink-0">
            {item.timestamp && formatTime(item.timestamp)}
          </span>
        </div>

        <p className="text-xs text-[var(--tg-text-secondary)] truncate">
          {item.lastMessage || 'No messages yet'}
        </p>
      </div>

      {item.unreadCount ? (
        <Badge count={item.unreadCount} size="sm" />
      ) : null}

      {item.muted && (
        <span className="text-lg flex-shrink-0">🔇</span>
      )}
    </button>
  );

  return (
    <div
      className={`h-screen flex flex-col bg-[var(--tg-bg)] border-r border-[var(--tg-border)] ${className}`}
      style={{ width: '300px', maxWidth: '100%' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--tg-border)]">
        <h1 className="text-2xl font-bold text-[var(--tg-text)] mb-4">Chats</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] border border-[var(--tg-border)] outline-none focus:border-[var(--tg-primary)] transition-colors text-sm"
        />
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Pinned conversations */}
        {pinnedConversations.length > 0 && (
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-[var(--tg-text-tertiary)] uppercase tracking-wider">
              Pinned
            </div>
            {pinnedConversations.map((item) => (
              <ConversationRow key={item.id} item={item} />
            ))}
            <div className="h-px bg-[var(--tg-border)] my-1" />
          </div>
        )}

        {/* Regular conversations */}
        {regularConversations.length > 0 ? (
          regularConversations.map((item) => (
            <ConversationRow key={item.id} item={item} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <span className="text-4xl mb-2">💬</span>
            <p className="text-[var(--tg-text-secondary)] text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
