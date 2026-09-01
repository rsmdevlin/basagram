'use client';

import React, { useState } from 'react';
import { SearchIcon, CloseIcon } from '@basagram/ui';

interface CreateChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

export const CreateChannelDialog: React.FC<CreateChannelDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name, description || undefined);
      setName('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Новый канал</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-2">
              Название канала
            </label>
            <input
              type="text"
              placeholder="Например: Новости, Объявления..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-2">
              Описание (опционально)
            </label>
            <textarea
              placeholder="Описание канала..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChannelCardProps {
  id: string;
  name: string;
  description?: string;
  subscriberCount: number;
  isSubscribed?: boolean;
  onSubscribe?: () => void;
  onUnsubscribe?: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  id,
  name,
  description,
  subscriberCount,
  isSubscribed,
  onSubscribe,
  onUnsubscribe,
}) => {
  return (
    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-all">
      <div className="flex items-start justify-between gap-3">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">#{name}</h3>
          {description && (
            <p className="text-xs text-neutral-400 truncate mt-1">{description}</p>
          )}
          <p className="text-xs text-neutral-500 mt-2">
            👥 {subscriberCount} подписчиков
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={isSubscribed ? onUnsubscribe : onSubscribe}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            isSubscribed
              ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {isSubscribed ? 'Отписаться' : 'Подписаться'}
        </button>
      </div>
    </div>
  );
};

interface ChannelHeaderProps {
  name: string;
  subscriberCount: number;
  description?: string;
  isSubscribed?: boolean;
  onToggleSubscribe?: () => void;
}

export const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  name,
  subscriberCount,
  description,
  isSubscribed,
  onToggleSubscribe,
}) => {
  return (
    <div className="bg-neutral-900 border-b border-neutral-800 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white">#{name}</h1>
          {description && (
            <p className="text-sm text-neutral-400 mt-2">{description}</p>
          )}
          <p className="text-xs text-neutral-500 mt-3">
            👥 {subscriberCount} подписчиков
          </p>
        </div>

        {/* Subscribe Button */}
        <button
          onClick={onToggleSubscribe}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
            isSubscribed
              ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {isSubscribed ? '✓ Подписан' : '+ Подписаться'}
        </button>
      </div>
    </div>
  );
};
