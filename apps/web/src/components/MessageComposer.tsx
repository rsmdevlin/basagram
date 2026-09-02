'use client';

import React, { useState, useRef, useEffect } from 'react';

interface MessageComposerProps {
  onSend: (message: string) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onTyping,
  placeholder = 'Type a message...',
  disabled = false,
  className = '',
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Auto-resize textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 3000);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping?.(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
    // Send message on Enter (without shift)
    else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`flex items-end gap-2 px-4 py-3 bg-[var(--tg-bg)] border-t border-[var(--tg-border)] ${className}`}
    >
      {/* Attachment button */}
      <button
        className="p-2 rounded-lg hover:bg-[var(--tg-surface)] transition-colors text-[var(--tg-text)] flex-shrink-0"
        title="Attach file"
        disabled={disabled}
      >
        📎
      </button>

      {/* Emoji button */}
      <button
        className="p-2 rounded-lg hover:bg-[var(--tg-surface)] transition-colors text-[var(--tg-text)] flex-shrink-0"
        title="Emoji"
        disabled={disabled}
      >
        😊
      </button>

      {/* Message input */}
      <div className="flex-1 flex items-center gap-2 bg-[var(--tg-surface)] rounded-lg px-3 py-2 border border-transparent hover:border-[var(--tg-border)] focus-within:border-[var(--tg-primary)] transition-colors">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] outline-none resize-none max-h-30 text-sm"
          rows={1}
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="p-2 rounded-lg bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 font-semibold"
        title="Send message"
      >
        ✈️
      </button>
    </div>
  );
};

export default MessageComposer;
