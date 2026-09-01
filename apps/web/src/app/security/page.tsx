'use client';

import React, { useState } from 'react';
import {
  TwoFactorSetup,
  SecurityStatus,
  SessionItem,
  AuditLogItem,
  PasswordChangeForm,
} from '@/components/SecurityComponents';

interface Session {
  id: string;
  device: string;
  ipAddress: string;
  lastActive: Date;
  current?: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  device: string;
}

export default function SecurityPage() {
  const [securityStatus, setSecurityStatus] = useState({
    twoFactorEnabled: false,
    sessionEncryption: true,
    passwordLastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    activeSessions: 1,
  });

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      ipAddress: '192.168.1.1',
      lastActive: new Date(),
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      ipAddress: '192.168.1.50',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      action: 'login',
      timestamp: new Date(Date.now() - 60000),
      ipAddress: '192.168.1.1',
      device: 'Chrome on Windows',
    },
    {
      id: '2',
      action: 'profile_update',
      timestamp: new Date(Date.now() - 3600000),
      ipAddress: '192.168.1.1',
      device: 'Chrome on Windows',
    },
    {
      id: '3',
      action: 'login',
      timestamp: new Date(Date.now() - 86400000),
      ipAddress: '192.168.1.50',
      device: 'Safari on iPhone',
    },
  ]);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
  };

  const handlePasswordChangeSuccess = () => {
    setSecurityStatus({
      ...securityStatus,
      passwordLastChanged: new Date(),
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Безопасность
        </h1>
        <p className="text-sm text-neutral-400 mt-2">
          Управляйте безопасностью и конфиденциальностью вашего аккаунта
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Security Status */}
          <SecurityStatus status={securityStatus} />

          {/* Two-Factor Authentication */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Двухфакторная аутентификация (2FA)
            </h2>
            <TwoFactorSetup
              onSetup={(secret) => {
                setSecurityStatus({
                  ...securityStatus,
                  twoFactorEnabled: true,
                });
              }}
            />
          </div>

          {/* Password Management */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Управление паролем
            </h2>
            <PasswordChangeForm onSuccess={handlePasswordChangeSuccess} />
          </div>

          {/* Active Sessions */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Активные сессии ({sessions.length})
            </h2>
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  onRevoke={handleRevokeSession}
                />
              ))}
            </div>
            {sessions.length === 0 && (
              <div className="text-center py-8 bg-neutral-900 border border-neutral-800 rounded-lg">
                <p className="text-neutral-400">Нет активных сессий</p>
              </div>
            )}
          </div>

          {/* Audit Log */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              История активности
            </h2>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <AuditLogItem key={log.id} log={log} />
              ))}
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">
              💡 Советы по безопасности
            </h3>
            <ul className="space-y-2 text-sm text-blue-300">
              <li>• Используйте сильный пароль из букв, цифр и символов</li>
              <li>• Регулярно меняйте пароль, особенно после подозрительной активности</li>
              <li>• Включите двухфакторную аутентификацию для дополнительной защиты</li>
              <li>
                • Проверяйте активные сессии и отзывайте неизвестные устройства
              </li>
              <li>• Не делитесь резервными кодами 2FA с никем</li>
              <li>
                • Регулярно проверяйте историю активности на предмет
                подозрительных входов
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
