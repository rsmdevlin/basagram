'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GroupMember {
  id: string;
  username: string;
  displayName: string;
  role: 'member' | 'moderator' | 'admin';
}

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  membersCount: number;
  creatorId: string;
  createdAt: string;
}

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/groups', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load groups');

        const data = await res.json();
        setGroups(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load groups:', error);
        setIsLoading(false);
      }
    };

    loadGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;

    const loadGroupMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/groups/${selectedGroupId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load members');

        const data = await res.json();
        setMembers(data);
      } catch (error) {
        console.error('Failed to load members:', error);
      }
    };

    loadGroupMembers();
  }, [selectedGroupId]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
        }),
      });

      if (!res.ok) throw new Error('Failed to create group');

      const newGroup = await res.json();
      setGroups([...groups, newGroup]);
      setGroupName('');
      setGroupDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-telegram-text-secondary">Загружаем группы...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-telegram-text">Группы</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-telegram-blue text-white px-6 py-2 rounded-lg hover:bg-telegram-accent transition"
          >
            + Создать группу
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-telegram-bg-hover p-6 rounded-lg mb-6 border border-telegram-border">
            <h2 className="text-lg font-semibold text-telegram-text mb-4">Новая группа</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Название группы"
                className="w-full px-4 py-2 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue"
              />
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Описание группы"
                className="w-full px-4 py-2 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateGroup}
                  className="bg-telegram-blue text-white px-6 py-2 rounded-lg hover:bg-telegram-accent transition"
                >
                  Создать
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-telegram-bg-hover text-telegram-text px-6 py-2 rounded-lg hover:bg-telegram-border transition border border-telegram-border"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={`p-4 rounded-lg border cursor-pointer transition ${
                selectedGroupId === group.id
                  ? 'border-telegram-blue bg-telegram-bg-selected'
                  : 'border-telegram-border hover:bg-telegram-bg-hover'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-telegram-blue flex items-center justify-center text-white font-bold flex-shrink-0">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-telegram-text">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-telegram-text-secondary line-clamp-2">{group.description}</p>
                  )}
                  <p className="text-xs text-telegram-text-secondary mt-2">{group.membersCount} участников</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedGroupId && (
          <div className="mt-6 bg-telegram-bg-hover p-6 rounded-lg border border-telegram-border">
            <h2 className="text-lg font-semibold text-telegram-text mb-4">Участники</h2>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-telegram-text">{member.displayName}</p>
                    <p className="text-xs text-telegram-text-secondary">{member.username}</p>
                  </div>
                  <span className="text-xs bg-telegram-blue text-white px-3 py-1 rounded-full">
                    {member.role === 'admin' ? 'Админ' : member.role === 'moderator' ? 'Модератор' : 'Участник'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
