'use client';

import React, { useState } from 'react';

interface TwoFactorSetupProps {
  onSetup: (secret: string) => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onSetup }) => {
  const [step, setStep] = useState<'intro' | 'scan' | 'verify' | 'backup'>('intro');
  const [qrCode, setQrCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleStartSetup = async () => {
    const response = await fetch('/api/security/2fa/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@basagram.app' }),
    });

    const data = await response.json();
    setQrCode(data.qrCode);
    setBackupCodes(data.backupCodes);
    setStep('scan');
  };

  const handleVerify = async () => {
    const response = await fetch('/api/security/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: verificationCode,
        secret: '2FA_SECRET',
      }),
    });

    if (response.ok) {
      setStep('backup');
    }
  };

  if (step === 'intro') {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Двухфакторная аутентификация
        </h3>
        <p className="text-sm text-neutral-400 mb-4">
          Добавьте дополнительный уровень защиты вашего аккаунта
        </p>
        <button
          onClick={handleStartSetup}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
        >
          Начать настройку
        </button>
      </div>
    );
  }

  if (step === 'scan') {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Отсканируйте QR-код</h3>
        {qrCode && (
          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mx-auto" />
        )}
        <p className="text-sm text-neutral-400">
          Используйте приложение аутентификатора (Google Authenticator, Authy и т.д.)
        </p>
        <input
          type="text"
          placeholder="Введите 6-значный код"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none"
          maxLength={6}
        />
        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
        >
          Проверить код
        </button>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Резервные коды
        </h3>
        <p className="text-sm text-neutral-400">
          Сохраните эти коды в безопасном месте. Используйте их для входа, если потеряете доступ к приложению аутентификатора.
        </p>
        <div className="bg-neutral-950 p-4 rounded-lg space-y-1 font-mono text-sm">
          {backupCodes.map((code, idx) => (
            <div key={idx} className="text-neutral-400">
              {code}
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(backupCodes.join('\n'));
          }}
          className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2 rounded-lg transition"
        >
          Скопировать коды
        </button>
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
        >
          Готово
        </button>
      </div>
    );
  }

  return null;
};

interface SecurityStatusProps {
  status: {
    twoFactorEnabled: boolean;
    sessionEncryption: boolean;
    passwordLastChanged: Date;
    activeSessions: number;
  };
}

export const SecurityStatus: React.FC<SecurityStatusProps> = ({ status }) => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Статус безопасности
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">2FA</span>
          <span
            className={`text-sm font-medium ${
              status.twoFactorEnabled
                ? 'text-green-400'
                : 'text-yellow-400'
            }`}
          >
            {status.twoFactorEnabled ? '✓ Активна' : '✗ Неактивна'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Шифрование сессии</span>
          <span className="text-sm font-medium text-green-400">
            ✓ Активно
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Активные сессии</span>
          <span className="text-sm font-medium text-neutral-300">
            {status.activeSessions}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Пароль изменён</span>
          <span className="text-sm font-medium text-neutral-300">
            {Math.floor((Date.now() - status.passwordLastChanged.getTime()) / (1000 * 60 * 60 * 24))} дней назад
          </span>
        </div>
      </div>
    </div>
  );
};

interface SessionProps {
  session: {
    id: string;
    device: string;
    ipAddress: string;
    lastActive: Date;
    current?: boolean;
  };
  onRevoke: (sessionId: string) => void;
}

export const SessionItem: React.FC<SessionProps> = ({ session, onRevoke }) => {
  return (
    <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-lg border border-neutral-800">
      <div>
        <p className="text-white font-medium">{session.device}</p>
        <p className="text-xs text-neutral-400 mt-1">
          IP: {session.ipAddress} • {new Date(session.lastActive).toLocaleString('ru-RU')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {session.current && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Текущая
          </span>
        )}
        {!session.current && (
          <button
            onClick={() => onRevoke(session.id)}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition"
          >
            Отозвать
          </button>
        )}
      </div>
    </div>
  );
};

interface AuditLogItemProps {
  log: {
    id: string;
    action: string;
    timestamp: Date;
    ipAddress: string;
    device: string;
  };
}

export const AuditLogItem: React.FC<AuditLogItemProps> = ({ log }) => {
  const actionLabels: Record<string, string> = {
    login: 'Вход',
    logout: 'Выход',
    profile_update: 'Обновление профиля',
    password_change: 'Изменение пароля',
    2fa_enable: 'Включение 2FA',
  };

  return (
    <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-lg border border-neutral-800">
      <div>
        <p className="text-white font-medium">
          {actionLabels[log.action] || log.action}
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          {new Date(log.timestamp).toLocaleString('ru-RU')} • {log.device}
        </p>
      </div>
      <span className="text-xs text-neutral-500">{log.ipAddress}</span>
    </div>
  );
};

interface PasswordChangeProps {
  onSuccess: () => void;
}

export const PasswordChangeForm: React.FC<PasswordChangeProps> = ({ onSuccess }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    try {
      const response = await fetch('/api/security/password/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        setError('Ошибка при изменении пароля');
      }
    } catch (err) {
      setError('Ошибка при изменении пароля');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Изменить пароль</h3>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Текущий пароль
        </label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Новый пароль
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Подтвердите пароль
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
      >
        Изменить пароль
      </button>
    </form>
  );
};
