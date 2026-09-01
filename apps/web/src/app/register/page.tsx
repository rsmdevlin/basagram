'use client';

import React, { useState } from 'react';
import { Button, Input } from '@basagram/ui';
import { registerSchema } from '@basagram/validation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Пароли не совпадают' });
      return;
    }

    // Validate with Zod
    const result = registerSchema.safeParse({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка регистрации');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      setSuccess(true);

      // Redirect to home
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Ошибка регистрации',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Basagram</h1>
          <p className="text-neutral-400">Создайте аккаунт</p>
        </div>

        {success ? (
          <div className="bg-green-900 border border-green-700 rounded-lg p-4 text-center">
            <p className="text-green-300 font-medium">✓ Регистрация успешна!</p>
            <p className="text-green-200 text-sm mt-2">Перенаправление...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Имя пользователя"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="username"
              error={errors.username}
              disabled={loading}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              disabled={loading}
            />

            <Input
              label="Ваше имя"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Иван Петров"
              error={errors.displayName}
              disabled={loading}
            />

            <Input
              label="Пароль"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Минимум 8 символов"
              error={errors.password}
              disabled={loading}
            />

            <Input
              label="Подтвердите пароль"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль"
              error={errors.confirmPassword}
              disabled={loading}
            />

            {errors.submit && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-3">
                <p className="text-red-300 text-sm">{errors.submit}</p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Зарегистрироваться
            </Button>

            <p className="text-center text-neutral-400 text-sm">
              Уже есть аккаунт?{' '}
              <a href="/login" className="text-primary-500 hover:text-primary-400">
                Войти
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
