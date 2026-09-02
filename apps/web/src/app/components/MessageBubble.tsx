'use client';

import React, { useState } from 'react';

interface Reaction {
  emoji: string;
  count: number;
}

interface MessageBubbleProps {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  currentUserId: string;
  reactions?: Reaction[];
  onAddReaction?: (messageId: string, emoji: string) => void;
  isGroupMessage?: boolean;
  isMobile?: boolean;
}

export default function MessageBubble({
  id,
  content,
  senderId,
  senderName,
  currentUserId,
  reactions,
  onAddReaction,
  isGroupMessage,
  isMobile,
}: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const isOwn = senderId === currentUserId;
  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '✨'];

  const handleAddReaction = (emoji: string) => {
    onAddReaction?.(id, emoji);
    setShowReactionPicker(false);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col gap-1">
        <div
          className={`max-w-xs ${isMobile ? '' : 'lg:max-w-md'} px-4 py-2 rounded-2xl group relative ${
            isOwn
              ? 'bg-telegram-blue text-white rounded-br-none'
              : 'bg-telegram-bg-hover text-telegram-text rounded-bl-none'
          }`}
        >
          {isGroupMessage && !isOwn && senderName && (
            <p className="text-xs font-semibold opacity-75 mb-1">{senderName}</p>
          )}
          <p className={`break-words ${isMobile ? 'text-sm' : ''}`}>{content}</p>

          {/* Reaction Picker Button */}
          <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition flex gap-1">
            {showReactionPicker ? (
              <div className="bg-white rounded-lg shadow-lg p-2 border border-telegram-border flex gap-1">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddReaction(emoji)}
                    className="text-lg hover:bg-telegram-bg-hover rounded px-2 py-1 transition"
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={() => setShowReactionPicker(false)}
                  className="text-xs text-telegram-text-secondary hover:text-telegram-text px-2"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowReactionPicker(true)}
                className="bg-white rounded-lg px-2 py-1 text-sm border border-telegram-border hover:bg-telegram-bg-hover transition"
              >
                😊
              </button>
            )}
          </div>
        </div>

        {/* Reactions Display */}
        {reactions && reactions.length > 0 && (
          <div className="flex gap-1 flex-wrap px-1">
            {reactions.map((reaction) => (
              <div
                key={reaction.emoji}
                className={`rounded-full px-2 py-1 text-xs flex items-center gap-1 cursor-pointer transition ${
                  isOwn
                    ? 'bg-telegram-blue bg-opacity-20 border border-telegram-blue'
                    : 'bg-telegram-bg-hover border border-telegram-border hover:bg-telegram-border'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span className={`${isOwn ? 'text-white' : 'text-telegram-text-secondary'}`}>
                  {reaction.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
