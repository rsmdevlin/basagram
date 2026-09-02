'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from './RegisterForm';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка входа');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  if (showRegister) {
    return <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--tg-primary)] to-[var(--tg-primary-dark)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Basagram</h1>
          <p className="text-white text-opacity-80">Вход в аккаунт</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--tg-text)] mb-2">Добро пожаловать</h2>
            <p className="text-[var(--tg-text-secondary)]">Введите ваши данные для входа</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isLoading}
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
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)] disabled:opacity-50"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-[var(--tg-primary)] text-white font-semibold hover:bg-[var(--tg-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[var(--tg-border)]">
            <p className="text-[var(--tg-text-secondary)]">
              Нет аккаунта?{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="text-[var(--tg-primary)] hover:text-[var(--tg-primary-hover)] font-semibold transition-colors"
              >
                Создать аккаунт
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
