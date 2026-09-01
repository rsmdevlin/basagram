'use client';

import React, { useState } from 'react';
import { CloseIcon, CameraIcon } from '@basagram/ui';

interface CreateStoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (type: 'text' | 'image' | 'video', content?: string, mediaUrl?: string) => void;
}

export const CreateStoryDialog: React.FC<CreateStoryDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [type, setType] = useState<'text' | 'image' | 'video'>('text');
  const [content, setContent] = useState('');

  const handleCreate = () => {
    if (type === 'text' && content.trim()) {
      onCreate('text', content);
      setContent('');
      onClose();
    } else if (type !== 'text') {
      onCreate(type);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Новая история</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Type Selector */}
        <div className="flex gap-2 mb-4">
          {['text', 'image', 'video'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t as 'text' | 'image' | 'video')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {t === 'text' && '📝 Текст'}
              {t === 'image' && '🖼️ Фото'}
              {t === 'video' && '🎬 Видео'}
            </button>
          ))}
        </div>

        {/* Content */}
        {type === 'text' && (
          <textarea
            placeholder="Написать историю..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-4"
            rows={5}
          />
        )}

        {type === 'image' && (
          <div className="mb-4 p-8 border-2 border-dashed border-neutral-700 rounded-lg text-center">
            <CameraIcon size={32} className="mx-auto text-neutral-500 mb-2" />
            <p className="text-sm text-neutral-400">Загрузить фото</p>
          </div>
        )}

        {type === 'video' && (
          <div className="mb-4 p-8 border-2 border-dashed border-neutral-700 rounded-lg text-center">
            <p className="text-2xl mb-2">🎬</p>
            <p className="text-sm text-neutral-400">Загрузить видео</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleCreate}
            disabled={type === 'text' && !content.trim()}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Поделиться
          </button>
        </div>
      </div>
    </div>
  );
};

interface Story {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  type: 'text' | 'image' | 'video';
  content?: string;
  mediaUrl?: string;
  viewCount: number;
  isViewed: boolean;
  reactions?: Array<{ emoji: string; count: number }>;
  createdAt: Date;
}

interface StoryCardProps extends Story {
  onView?: () => void;
  onReact?: (emoji: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  id,
  username,
  displayName,
  avatar,
  type,
  content,
  mediaUrl,
  viewCount,
  isViewed,
  reactions = [],
  createdAt,
  onView,
  onReact,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  const handleClick = () => {
    if (!isViewed) {
      onView?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isViewed
          ? 'bg-neutral-800 border border-neutral-700'
          : 'bg-gradient-to-br from-primary-600 to-primary-700 border-2 border-primary-500'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm ${
          isViewed ? 'bg-neutral-700' : 'bg-primary-500'
        }`}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
          <p className="text-xs text-neutral-300">@{username}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        {type === 'text' && (
          <p className="text-sm text-white line-clamp-3">{content}</p>
        )}
        {type === 'image' && (
          <div className="h-32 bg-neutral-700 rounded flex items-center justify-center">
            🖼️
          </div>
        )}
        {type === 'video' && (
          <div className="h-32 bg-neutral-700 rounded flex items-center justify-center">
            ▶️
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-neutral-300">
        <p>{viewCount} просмотров</p>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions(!showReactions);
            }}
            className="hover:text-white transition-colors"
          >
            😊
          </button>

          {showReactions && (
            <div className="absolute right-0 bottom-full mb-2 bg-neutral-800 rounded-lg p-2 flex gap-1 shadow-lg">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReact?.(emoji);
                    setShowReactions(false);
                  }}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reactions */}
      {reactions.length > 0 && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {reactions.map((r) => (
            <span key={r.emoji} className="text-xs bg-neutral-700/50 px-2 py-1 rounded">
              {r.emoji} {r.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface StoryViewerProps {
  isOpen: boolean;
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReact?: (storyId: string, emoji: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  isOpen,
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onReact,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const story = stories[currentIndex];
  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Story Content */}
      <div className="w-full h-full max-w-md bg-neutral-900 relative flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
              {story.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{story.displayName}</p>
              <p className="text-xs text-neutral-400">@{story.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Story Content */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
          {story.type === 'text' && (
            <div className="text-center">
              <p className="text-2xl text-white break-words">{story.content}</p>
            </div>
          )}
          {story.type === 'image' && (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
              🖼️ Фото
            </div>
          )}
          {story.type === 'video' && (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
              ▶️ Видео
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          {/* View count */}
          <p className="text-xs text-neutral-400">{story.viewCount} просмотров</p>

          {/* Reactions and Navigation */}
          <div className="flex items-center justify-between">
            {/* Reaction button */}
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="px-3 py-1 hover:bg-neutral-800 rounded transition-colors text-sm"
              >
                😊 Реакция
              </button>

              {showReactions && (
                <div className="absolute left-0 bottom-full mb-2 bg-neutral-800 rounded-lg p-2 flex gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact?.(story.id, emoji);
                        setShowReactions(false);
                      }}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              {currentIndex > 0 && (
                <button
                  onClick={onPrev}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
                >
                  ← Назад
                </button>
              )}
              {currentIndex < stories.length - 1 && (
                <button
                  onClick={onNext}
                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 rounded text-sm transition-colors"
                >
                  Далее →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
