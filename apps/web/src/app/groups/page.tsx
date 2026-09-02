'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSocket from '../hooks/useSocket';
import MessageBubble from '../components/MessageBubble';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

interface GroupMember {
  id: string;
  username: string;
  displayName: string;
  role: 'member' | 'moderator' | 'admin';
}

interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isEdited?: boolean;
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
  const { socket, isConnected } = useSocket();
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        router.push('/login');
      }
    };

    loadUser();
  }, [router]);

  // Load groups
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

  // Load group members when selected
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

  // Load group messages
  useEffect(() => {
    if (!selectedGroupId) return;

    const loadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/groups/${selectedGroupId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [selectedGroupId]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('group:message:new', (msg: GroupMessage) => {
      if (msg.groupId === selectedGroupId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('group:message:new');
    };
  }, [socket, isConnected, selectedGroupId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedGroupId || !user) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/groups/${selectedGroupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageText }),
      });

      if (res.ok) {
        setMessageText('');
        const newMessage = await res.json();
        socket?.emit('group:message:send', newMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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
    <div className="min-h-screen bg-white md:ml-20">
      <div className="max-w-6xl mx-auto h-screen flex">
        {/* Groups List Sidebar */}
        <div className="w-full md:w-80 border-r border-telegram-border flex flex-col">
          <div className="p-4 border-b border-telegram-border">
            <h1 className="text-xl font-bold text-telegram-text">Группы</h1>
          </div>

          {showCreateForm ? (
            <div className="p-4 border-b border-telegram-border space-y-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Название"
                className="w-full px-3 py-2 border border-telegram-border rounded-lg text-sm focus:outline-none focus:border-telegram-blue"
              />
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Описание"
                className="w-full px-3 py-2 border border-telegram-border rounded-lg text-sm focus:outline-none focus:border-telegram-blue resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 bg-telegram-blue text-white py-2 rounded-lg text-sm hover:bg-telegram-accent transition"
                >
                  Создать
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-telegram-bg-hover text-telegram-text py-2 rounded-lg text-sm border border-telegram-border"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-telegram-border">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-telegram-blue text-white py-2 rounded-lg hover:bg-telegram-accent transition text-sm font-semibold"
              >
                + Создать группу
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {groups.length === 0 ? (
              <div className="p-4 text-center text-telegram-text-secondary text-sm">
                <p>Нет групп</p>
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`p-3 border-b border-telegram-border cursor-pointer transition ${
                    selectedGroupId === group.id ? 'bg-telegram-bg-selected' : 'hover:bg-telegram-bg-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-telegram-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-telegram-text truncate text-sm">{group.name}</p>
                      <p className="text-xs text-telegram-text-secondary">{group.membersCount} участников</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedGroupId ? (
          <div className="hidden md:flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-telegram-border flex items-center justify-between bg-white">
              <h2 className="font-semibold text-telegram-text">
                {groups.find((g) => g.id === selectedGroupId)?.name}
              </h2>
              <span className="text-xs text-telegram-text-secondary">{members.length} участников</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  id={msg.id}
                  content={msg.content}
                  senderId={msg.senderId}
                  senderName={msg.senderName}
                  currentUserId={user?.id || ''}
                  isGroupMessage
                  onAddReaction={(messageId, emoji) => {
                    fetch(
                      `/api/groups/${selectedGroupId}/messages/${messageId}/reactions`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({ emoji }),
                      }
                    ).catch((e) => console.error(e));
                  }}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-telegram-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Сообщение..."
                  className="flex-1 px-4 py-2 border border-telegram-border rounded-full focus:outline-none focus:border-telegram-blue text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-telegram-blue text-white px-6 py-2 rounded-full hover:bg-telegram-accent transition text-sm font-semibold"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-telegram-text-secondary">
            <p>Выберите группу</p>
          </div>
        )}
      </div>
    </div>
  );
}
