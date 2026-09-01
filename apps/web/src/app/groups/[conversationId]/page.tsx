'use client';

import React, { useState } from 'react';
import { Message, MessageList } from '@/components/Message';
import { MessageComposer } from '@/components/MessageComposer';
import { ConversationHeader } from '@/components/ConversationHeader';
import {
  CreateGroupDialog,
  GroupMembersList,
  GroupSettings,
} from '@/components/GroupComponents';

interface GroupMember {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'member' | 'moderator' | 'admin';
  isOnline?: boolean;
}

interface GroupMessage {
  id: string;
  content: string;
  sender: string;
  senderId: string;
  isOwn: boolean;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export default function GroupPage() {
  const [messages, setMessages] = useState<GroupMessage[]>([
    {
      id: '1',
      content: 'Привет всем! Добро пожаловать в группу!',
      sender: 'Анна',
      senderId: 'user-2',
      isOwn: false,
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
    },
    {
      id: '2',
      content: 'Спасибо за приглашение! Рада быть здесь',
      sender: 'Вы',
      senderId: 'current-user',
      isOwn: true,
      timestamp: new Date(Date.now() - 1800000),
      status: 'read',
    },
  ]);

  const [members, setMembers] = useState<GroupMember[]>([
    {
      id: 'current-user',
      username: 'yourname',
      displayName: 'Вы',
      role: 'member',
      isOnline: true,
    },
    {
      id: 'user-2',
      username: 'anna',
      displayName: 'Анна',
      role: 'admin',
      isOnline: true,
    },
    {
      id: 'user-3',
      username: 'boris',
      displayName: 'Борис',
      role: 'moderator',
      isOnline: false,
    },
    {
      id: 'user-4',
      username: 'vera',
      displayName: 'Вера',
      role: 'member',
      isOnline: true,
    },
  ]);

  const [groupName, setGroupName] = useState('Разработчики');
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentUserId] = useState('current-user');

  const isAdmin = members.find(m => m.id === currentUserId)?.role === 'admin';

  const handleSendMessage = (content: string) => {
    const newMessage: GroupMessage = {
      id: String(messages.length + 1),
      content,
      sender: 'Вы',
      senderId: currentUserId,
      isOwn: true,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [
      ...prev,
      {
        ...newMessage,
        status: 'sent',
      },
    ]);
  };

  const handleRemoveMember = (userId: string) => {
    setMembers(prev => prev.filter(m => m.id !== userId));
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    setMembers(prev =>
      prev.map(m =>
        m.id === userId
          ? { ...m, role: newRole as 'member' | 'moderator' | 'admin' }
          : m
      )
    );
  };

  const handleUpdateGroupName = (newName: string) => {
    setGroupName(newName);
  };

  const handleCreateGroup = (name: string, selectedMembers: string[]) => {
    // Handle group creation - would call API
    console.log('Create group:', name, selectedMembers);
  };

  const handleLeaveGroup = () => {
    // Handle leaving group - would call API
    console.log('Leave group');
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950">
      {/* Header */}
      <ConversationHeader
        title={groupName}
        subtitle={`${members.length} участников`}
        actions={[
          {
            label: '👥',
            onClick: () => setShowSettings(!showSettings),
          },
          {
            label: '⋮',
            onClick: () => setShowSettings(!showSettings),
          },
        ]}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-2">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-neutral-400">Группа создана</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Будьте первым, кто напишет сообщение
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <Message
                  key={msg.id}
                  id={msg.id}
                  content={msg.content}
                  sender={msg.sender}
                  isOwn={msg.isOwn}
                  timestamp={msg.timestamp}
                  status={msg.status}
                />
              ))
            )}
          </div>

          {/* Composer */}
          <MessageComposer onSend={handleSendMessage} />
        </div>

        {/* Sidebar - Group Settings */}
        {showSettings && (
          <div className="w-80 border-l border-neutral-800 bg-neutral-900 overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Информация</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Group Settings */}
              <GroupSettings
                groupName={groupName}
                memberCount={members.length}
                isAdmin={isAdmin}
                onNameChange={handleUpdateGroupName}
                onAddMembers={() => setShowCreateDialog(true)}
                onLeaveGroup={handleLeaveGroup}
              />

              {/* Members */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  Участники ({members.length})
                </h3>
                <GroupMembersList
                  members={members}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onRemoveMember={handleRemoveMember}
                  onChangeRole={handleChangeRole}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateGroup}
        availableUsers={[
          { id: 'user-5', name: 'Дмитрий' },
          { id: 'user-6', name: 'Елена' },
          { id: 'user-7', name: 'Федор' },
        ]}
      />
    </div>
  );
}
