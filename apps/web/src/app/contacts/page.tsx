'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isOnline: boolean;
}

interface Contact {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isOnline: boolean;
  isFavorite: boolean;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contacts' | 'add'>('contacts');
  const [currentUser, setCurrentUser] = useState<any>(null);

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
        setCurrentUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        router.push('/login');
      }
    };

    loadUser();
  }, [router]);

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/contacts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load contacts');

        const data = await res.json();
        setContacts(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load contacts:', error);
        setIsLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Search users
  const handleSearch = async (query: string) => {
    setSearch(query);

    if (!query.trim() || query.length < 2) {
      setUsers([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to search');

      const data = await res.json();
      setUsers(data.filter((u: User) => u.id !== currentUser?.id));
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleAddContact = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to add contact');

      const newContact = await res.json();
      setContacts([...contacts, newContact]);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/conversations/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to create conversation');

      const { id } = await res.json();
      router.push('/chats');
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center md:ml-20">
        <p className="text-telegram-text-secondary">Загружаем контакты...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:ml-20">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-telegram-text mb-6">Контакты</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-telegram-border">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-3 font-semibold transition border-b-2 ${
              activeTab === 'contacts'
                ? 'border-telegram-blue text-telegram-blue'
                : 'border-transparent text-telegram-text-secondary hover:text-telegram-text'
            }`}
          >
            Мои контакты ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-3 font-semibold transition border-b-2 ${
              activeTab === 'add'
                ? 'border-telegram-blue text-telegram-blue'
                : 'border-transparent text-telegram-text-secondary hover:text-telegram-text'
            }`}
          >
            Найти людей
          </button>
        </div>

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-telegram-text-secondary mb-4">Ваш список контактов пуст</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="bg-telegram-blue text-white px-6 py-2 rounded-lg hover:bg-telegram-accent transition"
                >
                  Добавить контакт
                </button>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 bg-telegram-bg-hover rounded-lg border border-telegram-border hover:border-telegram-blue transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-telegram-blue flex items-center justify-center text-white font-bold flex-shrink-0 relative">
                      {contact.displayName.charAt(0).toUpperCase()}
                      {contact.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-telegram-text">{contact.displayName}</p>
                      <p className="text-xs text-telegram-text-secondary">@{contact.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChat(contact.id)}
                    className="bg-telegram-blue text-white px-4 py-2 rounded-lg hover:bg-telegram-accent transition text-sm font-semibold"
                  >
                    Написать
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Contacts Tab */}
        {activeTab === 'add' && (
          <div>
            <div className="mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Поиск по имени или username..."
                className="w-full px-4 py-3 border border-telegram-border rounded-lg focus:outline-none focus:border-telegram-blue"
              />
            </div>

            <div className="space-y-2">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  {search ? (
                    <p className="text-telegram-text-secondary">Никого не найдено</p>
                  ) : (
                    <p className="text-telegram-text-secondary">Начните вводить для поиска</p>
                  )}
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-telegram-bg-hover rounded-lg border border-telegram-border hover:border-telegram-blue transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-avatar-purple flex items-center justify-center text-white font-bold flex-shrink-0 relative">
                        {user.displayName.charAt(0).toUpperCase()}
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-telegram-text">{user.displayName}</p>
                        <p className="text-xs text-telegram-text-secondary">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddContact(user.id)}
                        className="bg-telegram-blue text-white px-4 py-2 rounded-lg hover:bg-telegram-accent transition text-sm font-semibold"
                      >
                        Добавить
                      </button>
                      <button
                        onClick={() => handleStartChat(user.id)}
                        className="bg-telegram-bg-hover text-telegram-text px-4 py-2 rounded-lg hover:bg-telegram-border transition text-sm font-semibold border border-telegram-border"
                      >
                        Чат
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
