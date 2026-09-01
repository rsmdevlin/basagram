'use client';

import React, { useState } from 'react';
import { CloseIcon } from '@basagram/ui';

interface ReplyThreadProps {
  replyingTo?: {
    id: string;
    sender: string;
    content: string;
  };
  onClearReply?: () => void;
}

export const ReplyThread: React.FC<ReplyThreadProps> = ({
  replyingTo,
  onClearReply,
}) => {
  if (!replyingTo) return null;

  return (
    <div className="border-l-2 border-primary-500 bg-neutral-800 px-3 py-2 rounded mb-3 flex items-start gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-primary-400">
          Ответ {replyingTo.sender}
        </p>
        <p className="text-xs text-neutral-300 truncate">
          {replyingTo.content}
        </p>
      </div>
      <button
        onClick={onClearReply}
        className="flex-shrink-0 p-1 hover:bg-neutral-700 rounded transition-colors"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
};

interface MessageThreadProps {
  messageId: string;
  replies?: Array<{
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
  }>;
  isThreadOpen?: boolean;
  onToggleThread?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messageId,
  replies = [],
  isThreadOpen,
  onToggleThread,
}) => {
  if (replies.length === 0) return null;

  return (
    <div className="mt-2 ml-6 border-l border-neutral-700 pl-3">
      <button
        onClick={onToggleThread}
        className="text-xs text-primary-400 hover:text-primary-300 transition-colors mb-2"
      >
        {isThreadOpen ? '▼' : '▶'} {replies.length} ответ(ов)
      </button>

      {isThreadOpen && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <div key={reply.id} className="text-xs bg-neutral-800 rounded p-2">
              <p className="font-semibold text-neutral-300">{reply.sender}</p>
              <p className="text-neutral-400 mt-1">{reply.content}</p>
              <p className="text-neutral-500 mt-1">
                {reply.timestamp.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
