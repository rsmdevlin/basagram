'use client';

import React, { useState } from 'react';

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
}

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onLogout?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onLogout,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    onSettingsChange({ ...settings, theme });
  };

  const handleLanguageChange = (language: string) => {
    onSettingsChange({ ...settings, language });
  };

  const handleToggle = (key: keyof Settings, value: boolean) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const SettingRow: React.FC<{
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-3 px-4 border-b border-[var(--tg-border)]">
      <label className="text-sm text-[var(--tg-text)]">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-[var(--tg-primary)]' : 'bg-[var(--tg-surface)]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SectionHeader: React.FC<{ title: string; id: string }> = ({ title, id }) => (
    <button
      onClick={() => setExpandedSection(expandedSection === id ? null : id)}
      className="w-full flex items-center justify-between px-4 py-3 bg-[var(--tg-surface)] hover:bg-[var(--tg-border)] transition-colors"
    >
      <h3 className="font-semibold text-[var(--tg-text)]">{title}</h3>
      <span className={`transition-transform ${expandedSection === id ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
  );

  return (
    <div className="w-full max-w-md bg-[var(--tg-bg)] rounded-lg border border-[var(--tg-border)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-[var(--tg-primary)] text-white">
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      {/* Content */}
      <div className="divide-y divide-[var(--tg-border)]">
        {/* Appearance Section */}
        <div>
          <SectionHeader title="🎨 Appearance" id="appearance" />
          {expandedSection === 'appearance' && (
            <div className="px-4 py-3 space-y-3 bg-[var(--tg-surface)] bg-opacity-50">
              <div>
                <label className="text-sm font-medium text-[var(--tg-text)] block mb-2">
                  Theme
                </label>
                <div className="space-y-2">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <label key={theme} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        checked={settings.theme === theme}
                        onChange={(e) => handleThemeChange(e.target.value as any)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-[var(--tg-text)] capitalize">
                        {theme === 'auto' ? 'System' : theme}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--tg-text)] block mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[var(--tg-border)] bg-[var(--tg-bg)] text-[var(--tg-text)] text-sm"
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Section */}
        <div>
          <SectionHeader title="🔔 Notifications" id="notifications" />
          {expandedSection === 'notifications' && (
            <div className="space-y-1">
              <SettingRow
                label="Enable notifications"
                value={settings.notificationsEnabled}
                onChange={(value) => handleToggle('notificationsEnabled', value)}
              />
              <SettingRow
                label="Sound effects"
                value={settings.soundEnabled}
                onChange={(value) => handleToggle('soundEnabled', value)}
              />
            </div>
          )}
        </div>

        {/* Privacy Section */}
        <div>
          <SectionHeader title="🔒 Privacy" id="privacy" />
          {expandedSection === 'privacy' && (
            <div className="space-y-1">
              <SettingRow
                label="Show online status"
                value={settings.showOnlineStatus}
                onChange={(value) => handleToggle('showOnlineStatus', value)}
              />
              <SettingRow
                label="Show last seen"
                value={settings.showLastSeen}
                onChange={(value) => handleToggle('showLastSeen', value)}
              />
            </div>
          )}
        </div>

        {/* Account Section */}
        <div>
          <SectionHeader title="👤 Account" id="account" />
          {expandedSection === 'account' && (
            <div className="px-4 py-3 space-y-2 bg-[var(--tg-surface)] bg-opacity-50">
              <button className="w-full px-4 py-2 rounded-lg border border-[var(--tg-border)] text-[var(--tg-text)] hover:bg-[var(--tg-border)] transition-colors text-sm font-medium">
                Change Password
              </button>
              <button className="w-full px-4 py-2 rounded-lg border border-[var(--tg-border)] text-[var(--tg-text)] hover:bg-[var(--tg-border)] transition-colors text-sm font-medium">
                Two-Factor Authentication
              </button>
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* About Section */}
        <div>
          <SectionHeader title="ℹ️ About" id="about" />
          {expandedSection === 'about' && (
            <div className="px-4 py-3 space-y-2 text-sm text-[var(--tg-text-secondary)]">
              <div className="flex justify-between">
                <span>Version</span>
                <span>0.1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Build</span>
                <span>2026.09.02</span>
              </div>
              <p className="text-xs pt-2">
                Basagram © 2026 — Premium Modern Messenger
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
