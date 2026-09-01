'use client';

import React, { useState } from 'react';
import { CreateGroupDialog } from '@/components/GroupComponents';

interface GroupItem {
  id: string;
  name: string;
  memberCount: number;
  lastMessage?: string;
  unreadCount?: number;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([
    {
      id: '1',
      name: 'Разработчики',
      memberCount: 4,
      lastMessage: 'Вы: Спасибо за приглашение!',
      unreadCount: 0,
    },
    {
      id: '2',
      name: 'Дизайнеры',
      memberCount: 6,
      lastMessage: 'Анна: Новые макеты готовы',
      unreadCount: 2,
    },
    {
      id: '3',
      name: 'Маркетинг',
      memberCount: 8,
      lastMessage: 'Федор: Давайте обсудим план',
      unreadCount: 0,
    },
  ]);

  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateGroup = (name: string, members: string[]) => {
    const newGroup: GroupItem = {
      id: String(groups.length + 1),
      name,
      memberCount: members.length + 1,
    };
    setGroups([newGroup, ...groups]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Группы</h1>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            + Новая группа
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Поиск групп..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400">Групп не найдено</p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="mt-4 text-primary-400 hover:text-primary-300 transition-colors"
              >
                Создать первую группу
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <a
                key={group.id}
                href={`/groups/${group.id}`}
                className="block p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:bg-neutral-800/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {group.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {group.name}
                      </h3>
                      {group.unreadCount && group.unreadCount > 0 && (
                        <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full flex-shrink-0">
                          {group.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">
                      👥 {group.memberCount} участников
                    </p>
                    {group.lastMessage && (
                      <p className="text-xs text-neutral-400 truncate">
                        {group.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateGroup}
        availableUsers={[
          { id: '1', name: 'Анна' },
          { id: '2', name: 'Борис' },
          { id: '3', name: 'Вера' },
          { id: '4', name: 'Дмитрий' },
          { id: '5', name: 'Елена' },
        ]}
      />
    </div>
  );
}
