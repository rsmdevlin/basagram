import React, { useState } from 'react';
import { SendIcon, AttachIcon, EmojiIcon } from '@basagram/ui';

interface MessageComposerProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 bg-neutral-900 border-t border-neutral-800">
      <div className="flex gap-3">
        {/* Attachments */}
        <button
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
          title="Прикрепить файл"
          disabled={disabled}
        >
          <AttachIcon size={20} />
        </button>

        {/* Message Input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение... (Shift+Enter для новой строки)"
          className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none max-h-32"
          disabled={disabled}
          rows={1}
        />

        {/* Emoji */}
        <button
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
          title="Смайлик"
          disabled={disabled}
        >
          <EmojiIcon size={20} />
        </button>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="p-2 hover:bg-primary-700 rounded-lg transition-colors text-primary-500 hover:text-white disabled:text-neutral-600 disabled:hover:bg-transparent"
          title="Отправить (Enter)"
        >
          <SendIcon size={20} />
        </button>
      </div>
    </div>
  );
};
