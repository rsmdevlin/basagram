'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@basagram/ui';
import { useAuth } from '@/hooks';
import { updateProfileSchema } from '@basagram/validation';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: (user as any).displayName || '',
        bio: (user as any).bio || '',
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const result = updateProfileSchema.safeParse({
      displayName: formData.displayName,
      bio: formData.bio,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/me`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(result.data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления профиля');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Ошибка обновления',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-semibold">
              {(user as any).displayName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {(user as any).displayName}
              </h1>
              <p className="text-neutral-400">@{(user as any).username}</p>
              <p className="text-sm text-green-500 mt-1">● в сети</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-neutral-400">
              Email: <span className="text-white">{(user as any).email}</span>
            </p>
            <p className="text-neutral-400">
              ID: <span className="text-white font-mono">{(user as any).id}</span>
            </p>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Редактировать профиль
          </h2>

          {success && (
            <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6">
              <p className="text-green-300">✓ Профиль обновлен успешно</p>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-300">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Ваше имя"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Иван Петров"
              error={errors.displayName}
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Описание
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Расскажите о себе..."
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={4}
                disabled={loading}
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading}
              >
                Сохранить изменения
              </Button>
              <Button variant="secondary" size="lg" disabled={loading}>
                Отмена
              </Button>
            </div>
          </form>
        </div>

        {/* Other Settings */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Приватность и безопасность
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
              <div>
                <p className="text-white font-medium">Показывать мой статус онлайн</p>
                <p className="text-sm text-neutral-400 mt-1">
                  Другие пользователи смогут видеть когда вы онлайн
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
              <div>
                <p className="text-white font-medium">Показывать время последнего визита</p>
                <p className="text-sm text-neutral-400 mt-1">
                  Другие смогут видеть когда вы были онлайн
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
