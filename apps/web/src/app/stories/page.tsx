'use client';

import React, { useState } from 'react';
import { CreateStoryDialog, StoryCard, StoryViewer } from '@/components/StoryComponents';

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

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      username: 'anna',
      displayName: 'Анна',
      avatar: '👩‍🦰',
      type: 'text',
      content: 'Отличный день для разработки! ☀️',
      viewCount: 12,
      isViewed: true,
      reactions: [{ emoji: '❤️', count: 3 }, { emoji: '👍', count: 2 }],
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      username: 'boris',
      displayName: 'Борис',
      avatar: '👨‍💼',
      type: 'image',
      viewCount: 8,
      isViewed: false,
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: '3',
      username: 'vera',
      displayName: 'Вера',
      avatar: '👩‍🎨',
      type: 'text',
      content: 'Завершила новый дизайн! Очень довольна результатом 🎨',
      viewCount: 24,
      isViewed: true,
      reactions: [{ emoji: '🔥', count: 5 }],
      createdAt: new Date(Date.now() - 10800000),
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleCreateStory = (
    type: 'text' | 'image' | 'video',
    content?: string,
    mediaUrl?: string
  ) => {
    const newStory: Story = {
      id: String(stories.length + 1),
      username: 'yourname',
      displayName: 'Вы',
      avatar: '👤',
      type,
      content,
      mediaUrl,
      viewCount: 0,
      isViewed: true,
      reactions: [],
      createdAt: new Date(),
    };
    setStories([newStory, ...stories]);
  };

  const handleViewStory = (index: number) => {
    setViewerIndex(index);
    setShowViewer(true);
    // Mark as viewed
    setStories(stories.map((s, i) => (i === index ? { ...s, isViewed: true } : s)));
  };

  const handleReactToStory = (storyId: string, emoji: string) => {
    setStories(
      stories.map((s) => {
        if (s.id === storyId) {
          const reactions = [...(s.reactions || [])];
          const existing = reactions.find((r) => r.emoji === emoji);
          if (existing) {
            existing.count += 1;
          } else {
            reactions.push({ emoji, count: 1 });
          }
          return { ...s, reactions };
        }
        return s;
      })
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Истории</h1>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            + Моя история
          </button>
        </div>

        <p className="text-sm text-neutral-400">
          Временный контент, исчезающий через 24 часа
        </p>
      </div>

      {/* Stories Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-400">Нет историй</p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="mt-4 text-primary-400 hover:text-primary-300 transition-colors"
              >
                Создать первую историю
              </button>
            </div>
          ) : (
            stories.map((story, index) => (
              <div
                key={story.id}
                onClick={() => handleViewStory(index)}
                className="cursor-pointer"
              >
                <StoryCard
                  {...story}
                  onReact={(emoji) => handleReactToStory(story.id, emoji)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Story Viewer */}
      <StoryViewer
        isOpen={showViewer}
        stories={stories}
        currentIndex={viewerIndex}
        onClose={() => setShowViewer(false)}
        onNext={() => setViewerIndex(Math.min(viewerIndex + 1, stories.length - 1))}
        onPrev={() => setViewerIndex(Math.max(viewerIndex - 1, 0))}
        onReact={handleReactToStory}
      />

      {/* Create Story Dialog */}
      <CreateStoryDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateStory}
      />
    </div>
  );
}
