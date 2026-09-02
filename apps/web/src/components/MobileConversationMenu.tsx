'use client';

import React, { useState } from 'react';
import Avatar from './Avatar';
import Badge from './Badge';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: any[];
  onSelectConversation: (id: string) => void;
  activeConversationId?: string;
}

export const MobileConversationMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
  activeConversationId,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Slide-out menu */}
      <div
        className={`fixed left-0 top-0 h-screen w-72 bg-[var(--tg-bg)] border-r border-[var(--tg-border)] transform transition-transform duration-300 z-50 md:hidden overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 p-4 border-b border-[var(--tg-border)] bg-[var(--tg-bg)]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[var(--tg-text)]">Chats</h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--tg-surface)] rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full px-3 py-2 rounded-lg bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] border border-[var(--tg-border)] outline-none focus:border-[var(--tg-primary)] transition-colors text-sm"
          />
        </div>

        {/* Conversations list */}
        <div>
          {conversations.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectConversation(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--tg-surface)] ${
                activeConversationId === item.id
                  ? 'bg-[var(--tg-surface)] border-l-4 border-[var(--tg-primary)]'
                  : ''
              }`}
            >
              <Avatar
                src={item.avatar}
                initials={item.name.substring(0, 2)}
                size="md"
                online={item.online}
              />

              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-medium text-sm truncate text-[var(--tg-text)]">
                  {item.name}
                </h3>
                <p className="text-xs text-[var(--tg-text-secondary)] truncate">
                  {item.lastMessage || 'No messages yet'}
                </p>
              </div>

              {item.unreadCount ? (
                <Badge count={item.unreadCount} size="sm" />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileConversationMenu;
