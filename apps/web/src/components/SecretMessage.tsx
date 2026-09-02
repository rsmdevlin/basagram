'use client';

import React, { useEffect, useState } from 'react';

interface SecretMessageProps {
  content: string;
  expiresIn: number; // в секундах
  onExpire?: () => void;
}

export const SecretMessage: React.FC<SecretMessageProps> = ({ content, expiresIn, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(expiresIn);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          onExpire?.();
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onExpire]);

  if (isExpired) {
    return (
      <div className="message-bubble message-bubble-other opacity-50">
        <p className="text-sm text-gray-500 italic">Сообщение было удалено</p>
      </div>
    );
  }

  return (
    <div className="message-bubble message-bubble-other relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
      <p className="text-sm break-words relative z-10 blur-sm hover:blur-none transition-all cursor-pointer">
        {content}
      </p>
      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
        <span className="animate-pulse">🔒</span>
        <span>{timeLeft}с</span>
      </div>
    </div>
  );
};

export default SecretMessage;
