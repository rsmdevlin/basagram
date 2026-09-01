'use client';

import React, { useState } from 'react';
import {
  SettingsSection,
  Toggle,
  Select,
  BlockList,
  DangerZone,
} from '@/components/SettingsComponents';

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'ru' | 'en';
  notifyMessages: boolean;
  notifyCalls: boolean;
  notifyReactions: boolean;
  notifyMentions: boolean;
  soundEnabled: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowMessages: 'all' | 'contacts' | 'none';
  allowCalls: 'all' | 'contacts' | 'none';
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    language: 'ru',
    notifyMessages: true,
    notifyCalls: true,
    notifyReactions: true,
    notifyMentions: true,
    soundEnabled: true,
    showOnlineStatus: true,
    showLastSeen: true,
    allowMessages: 'all',
    allowCalls: 'all',
  });

  const [blockedUsers, setBlockedUsers] = useState([
    { id: '1', name: 'Спам Бот', username: 'spambot' },
    { id: '2', name: 'Неудачник', username: 'troll' },
  ]);

  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSelect = (key: keyof UserSettings, value: string) => {
    setSettings({ ...settings, [key]: value as any });
  };

  const handleUnblock = (userId: string) => {
    setBlockedUsers(blockedUsers.filter((u) => u.id !== userId));
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  const handleDeleteAccount = () => {
    if (confirm('Вы уверены? Это действие необратимо.')) {
      console.log('Delete account');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Настройки</h1>
        <p className="text-sm text-neutral-400 mt-2">
          Управляйте вашими предпочтениями и приватностью
        </p>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Appearance */}
          <SettingsSection
            title="Оформление"
            description="Настройте внешний вид приложения"
          >
            <div className="space-y-4">
              <Select
                label="Тема"
                value={settings.theme}
                options={[
                  { value: 'light', label: '☀️ Светлая' },
                  { value: 'dark', label: '🌙 Тёмная' },
                  { value: 'auto', label: '🔄 Автоматическая' },
                ]}
                onChange={(v) =>
                  handleSelect('theme', v)
                }
              />
              <Select
                label="Язык"
                value={settings.language}
                options={[
                  { value: 'ru', label: '🇷🇺 Русский' },
                  { value: 'en', label: '🇬🇧 English' },
                ]}
                onChange={(v) =>
                  handleSelect('language', v)
                }
              />
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            title="Уведомления"
            description="Выберите, какие уведомления вы хотите получать"
          >
            <div className="space-y-2">
              <Toggle
                label="Сообщения"
                enabled={settings.notifyMessages}
                onChange={(v) => handleToggle('notifyMessages', v)}
              />
              <Toggle
                label="Звонки"
                enabled={settings.notifyCalls}
                onChange={(v) => handleToggle('notifyCalls', v)}
              />
              <Toggle
                label="Реакции"
                enabled={settings.notifyReactions}
                onChange={(v) => handleToggle('notifyReactions', v)}
              />
              <Toggle
                label="Упоминания"
                enabled={settings.notifyMentions}
                onChange={(v) => handleToggle('notifyMentions', v)}
              />
              <Toggle
                label="Звук"
                enabled={settings.soundEnabled}
                onChange={(v) => handleToggle('soundEnabled', v)}
              />
            </div>
          </SettingsSection>

          {/* Privacy */}
          <SettingsSection
            title="Приватность"
            description="Управляйте вашей приватностью и видимостью"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Toggle
                  label="Показывать статус онлайна"
                  enabled={settings.showOnlineStatus}
                  onChange={(v) => handleToggle('showOnlineStatus', v)}
                />
                <Toggle
                  label="Показывать последний вход"
                  enabled={settings.showLastSeen}
                  onChange={(v) => handleToggle('showLastSeen', v)}
                />
              </div>

              <div className="border-t border-neutral-700 pt-4 space-y-4">
                <Select
                  label="Кто может писать мне сообщения?"
                  value={settings.allowMessages}
                  options={[
                    { value: 'all', label: 'Все' },
                    { value: 'contacts', label: 'Только контакты' },
                    { value: 'none', label: 'Никто' },
                  ]}
                  onChange={(v) =>
                    handleSelect('allowMessages', v)
                  }
                />
                <Select
                  label="Кто может мне звонить?"
                  value={settings.allowCalls}
                  options={[
                    { value: 'all', label: 'Все' },
                    { value: 'contacts', label: 'Только контакты' },
                    { value: 'none', label: 'Никто' },
                  ]}
                  onChange={(v) =>
                    handleSelect('allowCalls', v)
                  }
                />
              </div>
            </div>
          </SettingsSection>

          {/* Blocked Users */}
          <SettingsSection
            title="Заблокированные пользователи"
            description="Управляйте списком заблокированных пользователей"
          >
            <BlockList
              blockedUsers={blockedUsers}
              onUnblock={handleUnblock}
            />
          </SettingsSection>

          {/* Danger Zone */}
          <DangerZone
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  );
}
