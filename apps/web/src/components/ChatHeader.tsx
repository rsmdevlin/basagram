'use client';

import React from 'react';
import Avatar from './Avatar';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  online?: boolean;
  lastSeen?: Date | string;
  memberCount?: number;
  onMenuClick?: () => void;
  onCallClick?: () => void;
  onVideoCallClick?: () => void;
  onSearchClick?: () => void;
  className?: string;
}

const formatLastSeen = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  online = false,
  lastSeen,
  memberCount,
  onMenuClick,
  onCallClick,
  onVideoCallClick,
  onSearchClick,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 bg-[var(--tg-bg)] border-b border-[var(--tg-border)] ${className}`}
    >
      {/* Left side: Avatar + Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar
          src={avatar}
          initials={name.substring(0, 2)}
          size="md"
          online={online}
        />

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-[var(--tg-text)] truncate">
            {name}
          </h2>
          <p className="text-xs text-[var(--tg-text-secondary)]">
            {online ? (
              <span className="text-green-500">● Online</span>
            ) : lastSeen ? (
              `last seen ${formatLastSeen(lastSeen)}`
            ) : memberCount ? (
              `${memberCount} members`
            ) : (
              'Offline'
            )}
          </p>
        </div>
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {onSearchClick && (
          <button
            onClick={onSearchClick}
            className="p-2 rounded-lg hover:bg-[var(--tg-surface)] transition-colors text-[var(--tg-text)]"
            title="Search in chat"
          >
            🔍
          </button>
        )}

        {onCallClick && (
          <button
            onClick={onCallClick}
            className="p-2 rounded-lg hover:bg-[var(--tg-surface)] transition-colors text-[var(--tg-text)]"
            title="Audio call"
          >
            ☎️
          </button>
        )}

        {onVideoCallClick && (
          <button
            onClick={onVideoCallClick}
            className="p-2 rounded-lg hover:bg-[var(--tg-surface)] transition-colors text-[var(--tg-text)]"
            title="Video call"
          >
            📹
          </button>
        )}

        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-[var(--tg-surface)] transition-colors text-[var(--tg-text)]"
            title="More options"
          >
            ⋮
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
