'use client';

import React, { useState, useEffect } from 'react';
import { CloseIcon, PhoneIcon, CameraIcon, MicrophoneIcon } from '@basagram/ui';

interface IncomingCallDialogProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar?: string;
  type: 'audio' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallDialog: React.FC<IncomingCallDialogProps> = ({
  isOpen,
  callerName,
  callerAvatar,
  type,
  onAccept,
  onReject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-sm w-full mx-4">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-4xl font-semibold">
            {callerName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Info */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {callerName}
        </h2>
        <p className="text-neutral-400 text-center mb-6">
          {type === 'video' ? '🎥 Видеозвонок' : '📞 Аудиозвонок'}
        </p>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onReject}
            className="flex-1 px-4 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            <PhoneIcon size={20} className="rotate-180" />
            Отклонить
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            {type === 'video' ? (
              <CameraIcon size={20} />
            ) : (
              <PhoneIcon size={20} />
            )}
            Принять
          </button>
        </div>
      </div>
    </div>
  );
};

interface ActiveCallProps {
  callerName: string;
  callType: 'audio' | 'video';
  duration: number;
  onEnd: () => void;
  onMute?: () => void;
  onToggleVideo?: () => void;
  isMuted?: boolean;
  videoEnabled?: boolean;
}

export const ActiveCall: React.FC<ActiveCallProps> = ({
  callerName,
  callType,
  duration,
  onEnd,
  onMute,
  onToggleVideo,
  isMuted,
  videoEnabled,
}) => {
  const [displayDuration, setDisplayDuration] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Video Preview (if video call) */}
      {callType === 'video' && (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">🎥</p>
            <p className="text-white text-lg">Видео трансляция</p>
          </div>
        </div>
      )}

      {/* Call Info */}
      <div className="absolute top-8 left-0 right-0 text-center z-10">
        <h2 className="text-2xl font-bold text-white mb-2">{callerName}</h2>
        <p className="text-neutral-300 text-lg">{formatDuration(displayDuration)}</p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-10">
        {/* Mute Button */}
        <button
          onClick={onMute}
          className={`p-4 rounded-full transition-colors ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-neutral-700 hover:bg-neutral-600'
          }`}
        >
          <MicrophoneIcon size={24} className={isMuted ? 'text-white line-through' : 'text-white'} />
        </button>

        {/* Video Toggle (video calls only) */}
        {callType === 'video' && (
          <button
            onClick={onToggleVideo}
            className={`p-4 rounded-full transition-colors ${
              videoEnabled
                ? 'bg-neutral-700 hover:bg-neutral-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <CameraIcon size={24} className="text-white" />
          </button>
        )}

        {/* End Call Button */}
        <button
          onClick={onEnd}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
        >
          <PhoneIcon size={24} className="text-white rotate-180" />
        </button>
      </div>
    </div>
  );
};

interface CallHistoryItem {
  id: string;
  type: 'audio' | 'video';
  initiatorName: string;
  recipientName: string;
  status: 'ended' | 'missed' | 'rejected';
  duration?: number;
  timestamp: Date;
}

interface CallHistoryProps {
  calls: CallHistoryItem[];
  onCall?: (recipientId: string, type: 'audio' | 'video') => void;
}

export const CallHistory: React.FC<CallHistoryProps> = ({ calls, onCall }) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Не отвечено';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}м ${secs}с`;
  };

  return (
    <div className="space-y-2">
      {calls.map((call) => (
        <div
          key={call.id}
          className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-lg">
                {call.type === 'video' ? '🎥' : '📞'}
              </span>
              <p className="text-sm font-semibold text-white">
                {call.initiatorName}
              </p>
              {call.status === 'missed' && (
                <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">
                  Пропущено
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              {formatDuration(call.duration)} •{' '}
              {call.timestamp.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onCall?.(call.id, call.type)}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {call.type === 'video' ? (
              <CameraIcon size={20} className="text-primary-500" />
            ) : (
              <PhoneIcon size={20} className="text-primary-500" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
};
