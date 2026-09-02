'use client';

import React, { useState } from 'react';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError('Имя пользователя минимум 3 символа');
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    if (password.length < 8) {
      setError('Пароль минимум 8 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          displayName: username,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка регистрации');
      }

      setSuccess(true);
      setTimeout(() => {
        onSwitchToLogin?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-center text-black">Telegram</h1>
          <p className="text-center text-gray-500 text-sm">Создайте свой аккаунт</p>
        </div>

        {/* Register Card */}
        <div className="space-y-6">
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-700 text-sm">✓ Аккаунт создан! Переходим на вход...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Username Input */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Имя пользователя"
              required
              disabled={isLoading || success}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg text-black placeholder-gray-500 outline-none focus:bg-gray-200 transition-colors disabled:opacity-50"
            />

            {/* Email Input */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              disabled={isLoading || success}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg text-black placeholder-gray-500 outline-none focus:bg-gray-200 transition-colors disabled:opacity-50"
            />

            {/* Password Input */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
              disabled={isLoading || success}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg text-black placeholder-gray-500 outline-none focus:bg-gray-200 transition-colors disabled:opacity-50"
            />

            {/* Confirm Password Input */}
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повтор пароля"
              required
              disabled={isLoading || success}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg text-black placeholder-gray-500 outline-none focus:bg-gray-200 transition-colors disabled:opacity-50"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full py-3 mt-6 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Создание...
                </>
              ) : success ? (
                '✓ Создано!'
              ) : (
                'Создать аккаунт'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-400 text-sm">или</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Уже есть аккаунт?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
              >
                Войти
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 border-t border-gray-200 pt-6">
          <p className="text-gray-500 text-xs">Быстро. Надежно. Безопасно.</p>
        </div>
      </div>
    </div>
  );
}
