'use client';

import React, { useState } from 'react';
import { SearchIcon, CloseIcon } from '@basagram/ui';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, members: string[]) => void;
  availableUsers?: Array<{ id: string; name: string; avatar?: string }>;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
  availableUsers = [],
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filteredUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMember = (userId: string) => {
    const updated = new Set(selectedMembers);
    if (updated.has(userId)) {
      updated.delete(userId);
    } else {
      updated.add(userId);
    }
    setSelectedMembers(updated);
  };

  const handleCreate = () => {
    if (groupName.trim()) {
      onCreate(groupName, Array.from(selectedMembers));
      setGroupName('');
      setSelectedMembers(new Set());
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
          <h2 className="text-lg font-semibold text-white">Новая группа</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Group Name */}
        <input
          type="text"
          placeholder="Название группы..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
        />

        {/* Members Search */}
        <div className="relative mb-3">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            placeholder="Добавить участников..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 border border-neutral-700 rounded-lg p-2">
          {filteredUsers.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-4">
              Нет доступных пользователей
            </p>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => toggleMember(user.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  selectedMembers.has(user.id)
                    ? 'bg-primary-600/20 border border-primary-500'
                    : 'hover:bg-neutral-800 border border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm text-white truncate">{user.name}</p>
                {selectedMembers.has(user.id) && (
                  <p className="text-xs text-primary-400 ml-auto">✓</p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Selected count */}
        <p className="text-xs text-neutral-400 mb-4">
          Выбрано: {selectedMembers.size} участник(ов)
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim()}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};

interface GroupMembersListProps {
  members?: Array<{
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    role: 'member' | 'moderator' | 'admin';
    isOnline?: boolean;
  }>;
  currentUserId?: string;
  isAdmin?: boolean;
  onRemoveMember?: (userId: string) => void;
  onChangeRole?: (userId: string, role: string) => void;
}

export const GroupMembersList: React.FC<GroupMembersListProps> = ({
  members = [],
  currentUserId,
  isAdmin,
  onRemoveMember,
  onChangeRole,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-3 px-4 py-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
              {member.displayName.charAt(0).toUpperCase()}
            </div>
            {member.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-neutral-800" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {member.displayName}
              {member.id === currentUserId && (
                <span className="text-xs text-neutral-400 ml-2">(вы)</span>
              )}
            </p>
            <p className="text-xs text-neutral-400">@{member.username}</p>
          </div>

          {/* Role Badge */}
          <div className="text-xs">
            {member.role === 'admin' && (
              <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded">
                Администратор
              </span>
            )}
            {member.role === 'moderator' && (
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded">
                Модератор
              </span>
            )}
            {member.role === 'member' && (
              <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded">
                Участник
              </span>
            )}
          </div>

          {/* Actions (admin only) */}
          {isAdmin && member.id !== currentUserId && (
            <div className="relative">
              <button
                onClick={() =>
                  setOpenMenu(openMenu === member.id ? null : member.id)
                }
                className="p-1 hover:bg-neutral-600 rounded transition-colors"
              >
                ⋮
              </button>

              {openMenu === member.id && (
                <div className="absolute right-0 top-full mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-10 min-w-48">
                  <button
                    onClick={() => {
                      onChangeRole?.(
                        member.id,
                        member.role === 'admin' ? 'member' : 'admin'
                      );
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-800 transition-colors text-white text-sm"
                  >
                    {member.role === 'admin' ? 'Убрать админ' : 'Сделать админом'}
                  </button>
                  <button
                    onClick={() => {
                      onRemoveMember?.(member.id);
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-900 transition-colors text-red-400 text-sm"
                  >
                    Удалить из группы
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface GroupSettingsProps {
  groupName: string;
  memberCount: number;
  isAdmin?: boolean;
  onNameChange?: (name: string) => void;
  onAddMembers?: () => void;
  onLeaveGroup?: () => void;
}

export const GroupSettings: React.FC<GroupSettingsProps> = ({
  groupName,
  memberCount,
  isAdmin,
  onNameChange,
  onAddMembers,
  onLeaveGroup,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(groupName);

  const handleSaveName = () => {
    if (newName.trim() && newName !== groupName) {
      onNameChange?.(newName);
    }
    setIsEditing(false);
    setNewName(groupName);
  };

  return (
    <div className="space-y-4">
      {/* Group Name */}
      <div className="bg-neutral-800 rounded-lg p-4">
        <p className="text-xs font-semibold text-neutral-400 mb-2">НАЗВАНИЕ ГРУППЫ</p>
        {isEditing && isAdmin ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveName}
                className="flex-1 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewName(groupName);
                }}
                className="flex-1 px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{groupName}</h3>
            {isAdmin && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                ✏️
              </button>
            )}
          </div>
        )}
      </div>

      {/* Members Info */}
      <div className="bg-neutral-800 rounded-lg p-4">
        <p className="text-xs font-semibold text-neutral-400 mb-2">УЧАСТНИКИ</p>
        <p className="text-lg font-semibold text-white mb-3">{memberCount} участник(ов)</p>
        {isAdmin && (
          <button
            onClick={onAddMembers}
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
          >
            Добавить участников
          </button>
        )}
      </div>

      {/* Leave Group */}
      <button
        onClick={onLeaveGroup}
        className="w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm rounded-lg transition-colors"
      >
        Покинуть группу
      </button>
    </div>
  );
};
