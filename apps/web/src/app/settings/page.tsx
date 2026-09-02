'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserSettings {
  displayName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  privacyMode: 'everyone' | 'contacts' | 'nobody';
  twoFactorEnabled: boolean;
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  typingIndicators: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'privacy' | 'notifications' | 'appearance' | 'security' | 'blocked'
  >('profile');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load settings');

        const data = await res.json();
        setSettings(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (updatedSettings: Partial<UserSettings>) => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      setSettings({ ...settings, ...updatedSettings });
      setIsSaving(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-telegram-text-secondary">Загружаем настройки...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-telegram-text mb-6">Параметры</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-telegram-border">
          {[
            { id: 'profile', label: 'Профиль' },
            { id: 'privacy', label: 'Конфиденциальность' },
            { id: 'notifications', label: 'Уведомления' },
            { id: 'appearance', label: 'Внешний вид' },
            { id: 'security', label: 'Безопасность' },
            { id: 'blocked', label: 'Заблокированные' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-telegram-blue text-telegram-blue font-semibold'
                  : 'border-transparent text-telegram-text-secondary hover:text-telegram-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-telegram-blue flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {settings.displayName.charAt(0).toUpperCase()}
                </div>
                <button className="bg-telegram-blue text-white px-4 py-2 rounded-lg hover:bg-telegram-accent transition">
                  Изменить фото
                </button>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-telegram-text mb-2">Отображаемое имя</label>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) =>
                    setSettings({ ...settings, displayName: e.target.value })
                  }
                  onBlur={() => handleSave({ displayName: settings.displayName })}
                  className="w-full px-4 py-2 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-telegram-text mb-2">Имя пользователя</label>
                <input
                  type="text"
                  value={settings.username}
                  disabled
                  className="w-full px-4 py-2 border border-telegram-border rounded-lg bg-telegram-bg-hover opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-telegram-text-secondary mt-1">Не может быть изменено</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-telegram-text mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full px-4 py-2 border border-telegram-border rounded-lg bg-telegram-bg-hover opacity-50 cursor-not-allowed"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-telegram-text mb-2">О себе</label>
                <textarea
                  value={settings.bio || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, bio: e.target.value })
                  }
                  onBlur={() => handleSave({ bio: settings.bio })}
                  placeholder="Расскажите о себе"
                  className="w-full px-4 py-2 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <h3 className="font-semibold text-telegram-text mb-3">Кто видит мой последний статус</h3>
                <select
                  value={settings.lastSeen}
                  onChange={(e) => {
                    setSettings({ ...settings, lastSeen: e.target.value as any });
                    handleSave({ lastSeen: e.target.value as any });
                  }}
                  className="w-full px-4 py-2 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue"
                >
                  <option value="everyone">Все</option>
                  <option value="contacts">Только контакты</option>
                  <option value="nobody">Никто</option>
                </select>
              </div>

              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <h3 className="font-semibold text-telegram-text mb-3">Кто может добавить меня в группы</h3>
                <select
                  value={settings.privacyMode}
                  onChange={(e) => {
                    setSettings({ ...settings, privacyMode: e.target.value as any });
                    handleSave({ privacyMode: e.target.value as any });
                  }}
                  className="w-full px-4 py-2 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue"
                >
                  <option value="everyone">Все</option>
                  <option value="contacts">Только контакты</option>
                  <option value="nobody">Никто</option>
                </select>
              </div>

              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.readReceipts}
                    onChange={(e) => {
                      setSettings({ ...settings, readReceipts: e.target.checked });
                      handleSave({ readReceipts: e.target.checked });
                    }}
                    className="w-4 h-4 accent-telegram-blue cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-telegram-text">Отправлять подтверждения прочтения</p>
                    <p className="text-xs text-telegram-text-secondary">Люди будут видеть, когда вы прочли их сообщения</p>
                  </div>
                </label>
              </div>

              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.typingIndicators}
                    onChange={(e) => {
                      setSettings({ ...settings, typingIndicators: e.target.checked });
                      handleSave({ typingIndicators: e.target.checked });
                    }}
                    className="w-4 h-4 accent-telegram-blue cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-telegram-text">Показывать когда я печатаю</p>
                    <p className="text-xs text-telegram-text-secondary">Люди будут видеть "пишет..." когда вы печатаете</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={(e) => {
                      setSettings({ ...settings, notificationsEnabled: e.target.checked });
                      handleSave({ notificationsEnabled: e.target.checked });
                    }}
                    className="w-4 h-4 accent-telegram-blue cursor-pointer"
                  />
                  <p className="font-semibold text-telegram-text">Включить уведомления</p>
                </label>
              </div>

              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => {
                      setSettings({ ...settings, soundEnabled: e.target.checked });
                      handleSave({ soundEnabled: e.target.checked });
                    }}
                    className="w-4 h-4 accent-telegram-blue cursor-pointer"
                  />
                  <p className="font-semibold text-telegram-text">Звук уведомлений</p>
                </label>
              </div>

              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <p className="text-sm text-telegram-text-secondary mb-3">Тип уведомлений:</p>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="radio" name="notifications" defaultChecked className="accent-telegram-blue" />
                  <span className="text-telegram-text">Все сообщения</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="notifications" className="accent-telegram-blue" />
                  <span className="text-telegram-text">Только упоминания</span>
                </label>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <h3 className="font-semibold text-telegram-text mb-3">Тема</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={settings.theme === 'light'}
                      onChange={(e) => {
                        setSettings({ ...settings, theme: e.target.value as any });
                        handleSave({ theme: e.target.value as any });
                      }}
                      className="accent-telegram-blue"
                    />
                    <span className="text-telegram-text">Светлая</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={settings.theme === 'dark'}
                      onChange={(e) => {
                        setSettings({ ...settings, theme: e.target.value as any });
                        handleSave({ theme: e.target.value as any });
                      }}
                      className="accent-telegram-blue"
                    />
                    <span className="text-telegram-text">Тёмная</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value="auto"
                      checked={settings.theme === 'auto'}
                      onChange={(e) => {
                        setSettings({ ...settings, theme: e.target.value as any });
                        handleSave({ theme: e.target.value as any });
                      }}
                      className="accent-telegram-blue"
                    />
                    <span className="text-telegram-text">Авто</span>
                  </label>
                </div>
              </div>

              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <h3 className="font-semibold text-telegram-text mb-3">Язык</h3>
                <select
                  value={settings.language}
                  onChange={(e) => {
                    setSettings({ ...settings, language: e.target.value });
                    handleSave({ language: e.target.value });
                  }}
                  className="w-full px-4 py-2 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <h3 className="font-semibold text-telegram-text mb-3">Двухфакторная аутентификация</h3>
                <p className="text-sm text-telegram-text-secondary mb-4">
                  {settings.twoFactorEnabled
                    ? 'Двухфакторная аутентификация включена'
                    : 'Включите двухфакторную аутентификацию для повышения безопасности'}
                </p>
                <button
                  className={`px-4 py-2 rounded-lg transition ${
                    settings.twoFactorEnabled
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-telegram-blue text-white hover:bg-telegram-accent'
                  }`}
                >
                  {settings.twoFactorEnabled ? 'Отключить' : 'Включить'}
                </button>
              </div>

              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <h3 className="font-semibold text-telegram-text mb-3">Смена пароля</h3>
                <p className="text-sm text-telegram-text-secondary mb-4">Измените ваш пароль для повышения безопасности</p>
                <button className="bg-telegram-blue text-white px-4 py-2 rounded-lg hover:bg-telegram-accent transition">
                  Изменить пароль
                </button>
              </div>

              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <h3 className="font-semibold text-telegram-text mb-3">Активные сеансы</h3>
                <p className="text-sm text-telegram-text-secondary mb-4">Управляйте активными сеансами на всех устройствах</p>
                <button className="bg-telegram-blue text-white px-4 py-2 rounded-lg hover:bg-telegram-accent transition">
                  Просмотреть сеансы
                </button>
              </div>
            </div>
          )}

          {/* Blocked Tab */}
          {activeTab === 'blocked' && (
            <div className="space-y-4">
              <div className="bg-telegram-bg-hover p-4 rounded-lg border border-telegram-border">
                <h3 className="font-semibold text-telegram-text mb-4">Заблокированные пользователи</h3>
                <p className="text-sm text-telegram-text-secondary">Вы не будете получать сообщения от заблокированных пользователей</p>
                {/* TODO: List blocked users */}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="border-t border-telegram-border pt-6">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              Выход
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
