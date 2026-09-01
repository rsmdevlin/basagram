'use client';

import React, { useState } from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-400 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
};

interface ToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  enabled,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && (
          <p className="text-xs text-neutral-400 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary-600' : 'bg-neutral-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

interface SelectProps {
  label: string;
  description?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  description,
  value,
  options,
  onChange,
}) => {
  return (
    <div className="py-3">
      <label className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      {description && (
        <p className="text-xs text-neutral-400 mb-2">{description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface BlockedUserProps {
  id: string;
  name: string;
  username: string;
  onUnblock?: () => void;
}

export const BlockedUserItem: React.FC<BlockedUserProps> = ({
  id,
  name,
  username,
  onUnblock,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-neutral-400">@{username}</p>
      </div>
      <button
        onClick={onUnblock}
        className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs rounded transition-colors"
      >
        Разблокировать
      </button>
    </div>
  );
};

interface BlockListProps {
  blockedUsers: BlockedUserProps[];
  onUnblock?: (userId: string) => void;
}

export const BlockList: React.FC<BlockListProps> = ({
  blockedUsers,
  onUnblock,
}) => {
  if (blockedUsers.length === 0) {
    return (
      <p className="text-sm text-neutral-400 py-4">
        Вы не заблокировали никого
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {blockedUsers.map((user) => (
        <BlockedUserItem
          key={user.id}
          {...user}
          onUnblock={() => onUnblock?.(user.id)}
        />
      ))}
    </div>
  );
};

interface DangerZoneProps {
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export const DangerZone: React.FC<DangerZoneProps> = ({
  onLogout,
  onDeleteAccount,
}) => {
  return (
    <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-red-400 mb-4">Опасная зона</h3>
      <div className="space-y-3">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
        >
          Выход
        </button>
        <button
          onClick={onDeleteAccount}
          className="w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
        >
          Удалить аккаунт
        </button>
      </div>
    </div>
  );
};
