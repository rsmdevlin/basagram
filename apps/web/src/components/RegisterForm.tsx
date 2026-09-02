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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError('Имя пользователя должно быть минимум 3 символа');
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен быть минимум 8 символов');
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
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--tg-primary)] to-[var(--tg-primary-dark)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Basagram</h1>
          <p className="text-white text-opacity-80">Создайте аккаунт</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--tg-text)] mb-2">Начните общаться</h2>
            <p className="text-[var(--tg-text-secondary)]">Присоединитесь к миллионам пользователей</p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">✓ Аккаунт создан! Переводим на вход...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--tg-text)] mb-2">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                disabled={isLoading || success}
                className="w-full px-4 py-3 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all disabled:opacity-50"
              />
              <p className="text-xs text-[var(--tg-text-tertiary)] mt-1">3-32 символа</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--tg-text)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading || success}
                className="w-full px-4 py-3 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--tg-text)] mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading || success}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || success}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)] disabled:opacity-50"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-[var(--tg-text-tertiary)] mt-1">Минимум 8 символов</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--tg-text)] mb-2">
                Подтвердите пароль
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading || success}
                className="w-full px-4 py-3 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full px-4 py-3 rounded-lg bg-[var(--tg-primary)] text-white font-semibold hover:bg-[var(--tg-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Создание аккаунта...
                </>
              ) : success ? (
                '✓ Аккаунт создан!'
              ) : (
                'Создать аккаунт'
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[var(--tg-border)]">
            <p className="text-[var(--tg-text-secondary)]">
              Уже есть аккаунт?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[var(--tg-primary)] hover:text-[var(--tg-primary-hover)] font-semibold transition-colors"
              >
                Войти
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-8 text-white text-opacity-70 text-sm">
          <p>Быстрое, простое и безопасное общение</p>
        </div>
      </div>
    </div>
  );
}
