'use client';

import React, { useState } from 'react';

interface MessageBubbleProps {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date | string;
  direction: 'incoming' | 'outgoing';
  status?: 'sending' | 'sent' | 'read' | 'failed';
  hasReply?: boolean;
  replyContent?: string;
  reactions?: Array<{ emoji: string; count: number; isReacted: boolean }>;
  onReact?: (emoji: string) => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  id,
  content,
  sender,
  timestamp,
  direction,
  status = 'sent',
  hasReply = false,
  replyContent,
  reactions = [],
  onReact,
  onReply,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
  className = '',
}) => {
  const [showActions, setShowActions] = useState(false);

  const isOutgoing = direction === 'outgoing';

  const bubbleStyles = isOutgoing
    ? 'bg-[var(--tg-msg-out-bg)] text-[var(--tg-msg-out-fg)]'
    : 'bg-[var(--tg-msg-in-bg)] text-[var(--tg-msg-in-fg)]';

  const alignment = isOutgoing ? 'flex-row-reverse' : 'flex-row';
  const marginSide = isOutgoing ? 'ml-auto' : 'mr-auto';

  const statusIcons = {
    sending: '⏱',
    sent: '✓',
    read: '✓✓',
    failed: '❌',
  };

  return (
    <div
      className={`flex ${alignment} gap-2 py-1 px-2 group animate-message-bubble ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onSelect}
    >
      {/* Actions menu (on hover) */}
      {showActions && (
        <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
          {onReact && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReact('👍');
              }}
              className="text-lg hover:scale-125 transition-transform"
              title="React"
            >
              😊
            </button>
          )}
          {onReply && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReply();
              }}
              className="text-lg hover:scale-125 transition-transform"
              title="Reply"
            >
              ↩️
            </button>
          )}
          {isOutgoing && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-lg hover:scale-125 transition-transform"
              title="Edit"
            >
              ✏️
            </button>
          )}
          {isOutgoing && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-lg hover:scale-125 transition-transform text-red-500"
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${bubbleStyles} ${marginSide} ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        {/* Reply indicator */}
        {hasReply && replyContent && (
          <div className="text-xs opacity-75 pb-1 mb-1 border-l-2 border-current pl-2 italic">
            {replyContent}
          </div>
        )}

        {/* Message content */}
        <p className="text-sm break-words leading-snug">{content}</p>

        {/* Timestamp and status */}
        <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-70">
          <span>{formatTime(timestamp)}</span>
          {isOutgoing && (
            <span className="text-sm">{statusIcons[status]}</span>
          )}
        </div>

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReact?.(reaction.emoji)}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  reaction.isReacted
                    ? 'bg-blue-200 dark:bg-blue-800'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
