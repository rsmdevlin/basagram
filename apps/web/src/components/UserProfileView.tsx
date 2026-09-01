'use client';

import React, { useState, useEffect } from 'react';
import { BackIcon } from '@basagram/ui';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt: Date;
}

interface UserProfileViewProps {
  userId: string;
  onBack?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userId,
  onBack,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${userId}`
      );

      if (!response.ok) {
        throw new Error('Не удалось загрузить профиль');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-neutral-400">Загрузка профиля...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">{error || 'Профиль не найден'}</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <BackIcon size={20} />
          </button>
        )}

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-semibold">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              {profile.displayName}
            </h1>
            <p className="text-neutral-400">@{profile.username}</p>

            {profile.isOnline ? (
              <p className="text-sm text-green-500 mt-2">● в сети</p>
            ) : profile.lastSeen ? (
              <p className="text-sm text-neutral-500 mt-2">
                был онлайн {new Date(profile.lastSeen).toLocaleString('ru-RU')}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="px-6 py-4 border-b border-neutral-800">
          <p className="text-neutral-300">{profile.bio}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 flex gap-3">
        <button className="flex-1 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors">
          Написать сообщение
        </button>
        <button className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors">
          Посмотреть профиль
        </button>
      </div>
    </div>
  );
};
