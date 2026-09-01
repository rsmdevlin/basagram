'use client';

import React, { useState } from 'react';
import { MessageActions, ReactionDisplay, MessageEditForm } from './MessageFeatures';

interface MessageReaction {
  emoji: string;
  count: number;
  userIds?: string[];
}

interface MessageProps {
  id: string;
  content: string;
  sender: string;
  isOwn?: boolean;
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  reactions?: MessageReaction[];
  isEdited?: boolean;
  editedAt?: Date;
  replyTo?: { sender: string; content: string };
  onReact?: (emoji: string) => void;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
}

export const Message: React.FC<MessageProps> = ({
  id,
  content,
  sender,
  isOwn,
  timestamp,
  status,
  reactions = [],
  isEdited,
  editedAt,
  replyTo,
  onReact,
  onEdit,
  onDelete,
  onReply,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditSave = (newContent: string) => {
    onEdit?.(newContent);
    setIsEditing(false);
  };

  return (
    <div className={`flex gap-3 mb-4 group ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {sender.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <p className="text-xs text-neutral-500 mb-1 px-3">{sender}</p>
        )}

        {/* Reply Preview */}
        {replyTo && (
          <div className="mb-2 px-3 py-2 bg-neutral-800 rounded-lg border-l-2 border-primary-500 text-xs text-neutral-400">
            <p className="font-semibold text-neutral-300">{replyTo.sender}</p>
            <p className="truncate">{replyTo.content}</p>
          </div>
        )}

        {/* Message Bubble */}
        <div className="relative">
          <div
            className={`
              px-4 py-2 rounded-lg max-w-sm break-words
              ${
                isOwn
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-800 text-neutral-100'
              }
            `}
          >
            {isEditing ? (
              <MessageEditForm
                content={content}
                onSave={handleEditSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <>
                <p className="text-sm">{content}</p>
                {isEdited && (
                  <p className="text-xs opacity-70 mt-1">
                    (ред. {editedAt ? new Date(editedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''})
                  </p>
                )}
              </>
            )}
          </div>

          {/* Action Menu */}
          {!isEditing && (
            <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MessageActions
                messageId={id}
                isOwnMessage={isOwn || false}
                onEdit={() => setIsEditing(true)}
                onDelete={onDelete}
                onReply={onReply}
                onReact={onReact}
              />
            </div>
          )}
        </div>

        {/* Reactions */}
        {!isEditing && reactions.length > 0 && (
          <ReactionDisplay reactions={reactions} onReact={onReact} />
        )}

        {/* Timestamp and Status */}
        <div className="flex items-center gap-2 mt-1 px-3">
          <p className="text-xs text-neutral-500">
            {timestamp
              ? new Date(timestamp).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </p>
          {isOwn && status && (
            <p className="text-xs text-neutral-500">
              {status === 'sending' && '⏳'}
              {status === 'sent' && '✓'}
              {status === 'delivered' && '✓✓'}
              {status === 'read' && '✓✓'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface MessageListProps {
  messages: MessageProps[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-2">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-neutral-400">Чат пуст</p>
            <p className="text-sm text-neutral-500 mt-2">
              Напишите первое сообщение, чтобы начать общение
            </p>
          </div>
        </div>
      ) : (
        messages.map((msg) => <Message key={msg.id} {...msg} />)
      )}
    </div>
  );
};
