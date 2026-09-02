'use client';

import React from 'react';

interface TypingIndicatorProps {
  users: string[];
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  users = [],
  className = '',
}) => {
  if (users.length === 0) return null;

  const getUsersText = (): string => {
    if (users.length === 1) return `${users[0]} is typing`;
    if (users.length === 2) return `${users[0]} and ${users[1]} are typing`;
    return `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]} are typing`;
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-xs text-[var(--tg-text-secondary)] ${className}`}>
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-[var(--tg-text-secondary)] rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-[var(--tg-text-secondary)] rounded-full animate-typing-dot" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-[var(--tg-text-secondary)] rounded-full animate-typing-dot" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getUsersText()}</span>
    </div>
  );
};

export default TypingIndicator;
