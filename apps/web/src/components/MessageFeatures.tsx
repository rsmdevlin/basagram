'use client';

import React, { useState } from 'react';
import { MoreIcon, CheckIcon } from '@basagram/ui';

interface MessageActionsProps {
  messageId: string;
  isOwnMessage: boolean;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
  onReact?: (emoji: string) => void;
  onForward?: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  isOwnMessage,
  onEdit,
  onDelete,
  onReply,
  onReact,
  onForward,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 hover:bg-neutral-700 rounded transition-colors"
      >
        <MoreIcon size={16} />
      </button>

      {/* Context Menu */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-10 min-w-48">
          {/* Reactions */}
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
            }}
            className="w-full text-left px-4 py-2 hover:bg-neutral-700 transition-colors text-white text-sm"
          >
            😊 Добавить реакцию
          </button>

          {/* Reply */}
          <button
            onClick={() => {
              onReply?.();
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-neutral-700 transition-colors text-white text-sm"
          >
            ↩️ Ответить
          </button>

          {/* Forward */}
          <button
            onClick={() => {
              onForward?.();
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-neutral-700 transition-colors text-white text-sm"
          >
            ↪️ Переслать
          </button>

          {/* Divider */}
          {isOwnMessage && <div className="border-t border-neutral-700 my-1" />}

          {/* Edit */}
          {isOwnMessage && (
            <button
              onClick={() => {
                // Trigger edit mode
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-neutral-700 transition-colors text-white text-sm"
            >
              ✏️ Редактировать
            </button>
          )}

          {/* Delete */}
          {isOwnMessage && (
            <button
              onClick={() => {
                onDelete?.();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-900 transition-colors text-red-400 text-sm"
            >
              🗑️ Удалить
            </button>
          )}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 z-10">
          <div className="grid grid-cols-4 gap-2">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact?.(emoji);
                  setShowEmojiPicker(false);
                  setShowMenu(false);
                }}
                className="text-xl hover:bg-neutral-700 p-2 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ReactionDisplayProps {
  reactions?: Array<{ emoji: string; count: number }>;
  onReact?: (emoji: string) => void;
}

export const ReactionDisplay: React.FC<ReactionDisplayProps> = ({
  reactions = [],
  onReact,
}) => {
  if (reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onReact?.(reaction.emoji)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-full text-sm transition-colors"
        >
          <span>{reaction.emoji}</span>
          <span className="text-xs text-neutral-300">{reaction.count}</span>
        </button>
      ))}
      <button
        onClick={() => onReact?.('+')}
        className="px-2 py-1 hover:bg-neutral-700 rounded-full text-sm transition-colors text-neutral-400"
      >
        +
      </button>
    </div>
  );
};

interface MessageEditFormProps {
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}

export const MessageEditForm: React.FC<MessageEditFormProps> = ({
  content,
  onSave,
  onCancel,
}) => {
  const [newContent, setNewContent] = useState(content);

  return (
    <div className="space-y-2 mt-2">
      <textarea
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        rows={3}
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(newContent)}
          className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
        >
          ✓ Сохранить
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded transition-colors"
        >
          ✕ Отмена
        </button>
      </div>
    </div>
  );
};
