'use client';

import React, { useState } from 'react';
import { SearchIcon, CloseIcon } from '@basagram/ui';

interface ForwardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onForward: (conversationId: string, caption?: string) => void;
  conversations?: Array<{
    id: string;
    name: string;
    avatar?: string;
    type: 'private' | 'group';
    lastMessage?: string;
  }>;
}

export const ForwardDialog: React.FC<ForwardDialogProps> = ({
  isOpen,
  onClose,
  onForward,
  conversations = [],
}) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleForward = () => {
    if (selected) {
      onForward(selected, caption || undefined);
      setSelected(null);
      setCaption('');
      setSearch('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-md p-6 max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Переслать сообщение</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            placeholder="Поиск чата..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selected === conv.id
                  ? 'bg-primary-600/20 border border-primary-500'
                  : 'hover:bg-neutral-800 border border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {conv.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {conv.name}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {conv.type === 'group' ? '👥 Группа' : '👤 Личный'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Caption */}
        {selected && (
          <div className="mb-4">
            <textarea
              placeholder="Добавить комментарий (опционально)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
            />
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
            onClick={handleForward}
            disabled={!selected}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Переслать
          </button>
        </div>
      </div>
    </div>
  );
};
