'use client';

import React, { useRef, useState } from 'react';

interface MessageInputProps {
  onSend?: (message: string) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const TelegramMessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  placeholder = 'Сообщение...',
  disabled = false,
  maxLength = 4096,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.slice(0, maxLength);
    setMessage(text);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }

    // Typing indicator
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      onTyping?.(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.length === 0) {
      setIsTyping(false);
      onTyping?.(false);
    } else {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 3000);
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend?.(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping?.(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3 bg-white dark:bg-[#212121] border-t border-gray-200 dark:border-gray-800">
      {/* Attachment button */}
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
        title="Прикрепить файл"
        disabled={disabled}
      >
        📎
      </button>

      {/* Input area */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 flex flex-col">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="resize-none bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm max-h-30 min-h-10"
          rows={1}
        />
        {maxLength > 0 && message.length > maxLength * 0.9 && (
          <span className="text-xs text-orange-500 dark:text-orange-400 mt-1">
            {message.length}/{maxLength}
          </span>
        )}
      </div>

      {/* Emoji button */}
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
        title="Эмодзи"
        disabled={disabled}
      >
        😊
      </button>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className={`p-2 rounded-full transition-all flex-shrink-0 ${
          message.trim() && !disabled
            ? 'bg-[#0088cc] text-white hover:bg-[#005fa3] active:scale-95'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        }`}
        title="Отправить"
      >
        {message.trim() ? '📤' : '🎤'}
      </button>
    </div>
  );
};

export default TelegramMessageInput;
