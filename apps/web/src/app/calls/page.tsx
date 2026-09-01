'use client';

import React, { useState } from 'react';
import { CallHistory, IncomingCallDialog, ActiveCall } from '@/components/CallComponents';

interface HistoryItem {
  id: string;
  type: 'audio' | 'video';
  initiatorName: string;
  recipientName: string;
  status: 'ended' | 'missed' | 'rejected';
  duration?: number;
  timestamp: Date;
}

export default function CallsPage() {
  const [callHistory, setCallHistory] = useState<HistoryItem[]>([
    {
      id: '1',
      type: 'video',
      initiatorName: 'Вы',
      recipientName: 'Анна',
      status: 'ended',
      duration: 1245,
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: '2',
      type: 'audio',
      initiatorName: 'Борис',
      recipientName: 'Вы',
      status: 'ended',
      duration: 324,
      timestamp: new Date(Date.now() - 172800000),
    },
    {
      id: '3',
      type: 'video',
      initiatorName: 'Вера',
      recipientName: 'Вы',
      status: 'missed',
      timestamp: new Date(Date.now() - 259200000),
    },
    {
      id: '4',
      type: 'audio',
      initiatorName: 'Вы',
      recipientName: 'Дмитрий',
      status: 'ended',
      duration: 789,
      timestamp: new Date(Date.now() - 345600000),
    },
  ]);

  const [incomingCall, setIncomingCall] = useState(false);
  const [activeCall, setActiveCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const handleRejectCall = () => {
    setIncomingCall(false);
  };

  const handleAcceptCall = () => {
    setIncomingCall(false);
    setActiveCall(true);
  };

  const handleEndCall = () => {
    setActiveCall(false);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Не отвечено';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}м ${secs}с`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">История звонков</h1>
        <p className="text-sm text-neutral-400 mt-2">
          Все входящие и исходящие звонки
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {callHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl mb-4">📞</p>
              <p className="text-neutral-400">История звонков пуста</p>
              <p className="text-sm text-neutral-500 mt-2">
                Здесь будут отображаться все входящие и исходящие звонки
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Active Calls Section */}
              <div>
                <h2 className="text-xs font-semibold text-neutral-400 uppercase mb-3 px-4">
                  Активные звонки
                </h2>
                <div className="space-y-2">
                  {/* No active calls in demo */}
                  <p className="text-xs text-neutral-500 px-4">Нет активных звонков</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-800 my-4" />

              {/* Recent Calls */}
              <div>
                <h2 className="text-xs font-semibold text-neutral-400 uppercase mb-3 px-4">
                  Недавние звонки
                </h2>
                <CallHistory calls={callHistory} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Call Dialog */}
      <IncomingCallDialog
        isOpen={incomingCall}
        callerName="Анна"
        type="video"
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      {/* Active Call */}
      {activeCall && (
        <ActiveCall
          callerName="Анна"
          callType="video"
          duration={0}
          isMuted={isMuted}
          videoEnabled={videoEnabled}
          onMute={() => setIsMuted(!isMuted)}
          onToggleVideo={() => setVideoEnabled(!videoEnabled)}
          onEnd={handleEndCall}
        />
      )}

      {/* Floating Call Button */}
      <button
        onClick={() => setIncomingCall(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
        title="Начать звонок"
      >
        📞
      </button>
    </div>
  );
}
