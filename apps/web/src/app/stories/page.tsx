'use client';

import React, { useState, useEffect } from 'react';

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  views: number;
  isViewed: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [newStoryText, setNewStoryText] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/stories', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load stories');

        const data = await res.json();
        setStories(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load stories:', error);
        setIsLoading(false);
      }
    };

    loadStories();
  }, []);

  const handleCreateStory = async () => {
    if (!newStoryText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newStoryText,
        }),
      });

      if (!res.ok) throw new Error('Failed to create story');

      const newStory = await res.json();
      setStories([newStory, ...stories]);
      setNewStoryText('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  const handleViewStory = async (story: Story) => {
    setSelectedStory(story);

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/stories/${story.id}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to mark story as viewed:', error);
    }
  };

  const isStoryExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-telegram-text-secondary">Загружаем истории...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {selectedStory ? (
        // Story Viewer
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
            <div className="h-full bg-white w-1/3 animate-pulse"></div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setSelectedStory(null)}
            className="absolute top-4 right-4 text-white text-2xl hover:opacity-80 transition"
          >
            ✕
          </button>

          {/* Story Content */}
          <div className="w-full max-w-2xl h-screen md:h-auto md:aspect-video bg-gray-900 flex items-center justify-center relative">
            {selectedStory.mediaUrl ? (
              selectedStory.mediaType === 'video' ? (
                <video
                  src={selectedStory.mediaUrl}
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={selectedStory.mediaUrl}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="text-center">
                <p className="text-white text-2xl">{selectedStory.content}</p>
              </div>
            )}

            {/* Story Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-telegram-blue flex items-center justify-center text-white font-bold flex-shrink-0">
                  {selectedStory.userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-white flex-1">
                  <p className="font-semibold">{selectedStory.userName}</p>
                  <p className="text-xs opacity-75">👁️ {selectedStory.views} просмотров</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:opacity-80 transition">
            ‹
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:opacity-80 transition">
            ›
          </button>
        </div>
      ) : (
        // Stories Grid
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-3xl font-bold text-telegram-text mb-6">Истории</h1>

          {/* Create Story Card */}
          {!showCreateForm ? (
            <div className="mb-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full p-6 rounded-lg border-2 border-dashed border-telegram-border hover:border-telegram-blue transition"
              >
                <div className="text-center">
                  <p className="text-3xl mb-2">➕</p>
                  <p className="text-telegram-text font-semibold">Добавить историю</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="bg-telegram-bg-hover p-6 rounded-lg mb-6 border border-telegram-border">
              <h2 className="text-lg font-semibold text-telegram-text mb-4">Новая история</h2>
              <div className="space-y-4">
                <textarea
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  placeholder="Что-то на уме?"
                  className="w-full px-4 py-3 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue resize-none"
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateStory}
                    className="bg-telegram-blue text-white px-6 py-2 rounded-lg hover:bg-telegram-accent transition font-semibold"
                  >
                    Опубликовать
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="bg-telegram-bg-hover text-telegram-text px-6 py-2 rounded-lg hover:bg-telegram-border transition border border-telegram-border"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-telegram-text-secondary">Нет историй</p>
              </div>
            ) : (
              stories.map((story) => {
                const isExpired = isStoryExpired(story.expiresAt);
                return (
                  <div
                    key={story.id}
                    onClick={() => !isExpired && handleViewStory(story)}
                    className={`relative rounded-lg overflow-hidden cursor-pointer transition transform hover:scale-105 ${
                      isExpired ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {/* Story Thumbnail */}
                    {story.mediaUrl ? (
                      <div className="aspect-video bg-gray-300 relative">
                        <img
                          src={story.mediaUrl}
                          alt={`Story by ${story.userName}`}
                          className="w-full h-full object-cover"
                        />
                        {isExpired && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <p className="text-white font-semibold">Истекла</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-telegram-blue to-telegram-accent flex items-center justify-center p-4">
                        <p className="text-white text-center text-sm break-words line-clamp-4">
                          {story.content}
                        </p>
                        {isExpired && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <p className="text-white font-semibold">Истекла</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* User Info Badge */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-telegram-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {story.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{story.userName}</p>
                          <p className="text-white text-xs opacity-75">
                            {!story.isViewed ? '●' : '○'} {story.views}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Unviewed Indicator */}
                    {!story.isViewed && (
                      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-telegram-blue"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
