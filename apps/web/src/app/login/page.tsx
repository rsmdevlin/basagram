'use client';

import React, { useState } from 'react';
import { Button, Input } from '@basagram/ui';
import { loginSchema } from '@basagram/validation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

    // Validate with Zod
    const result = loginSchema.safeParse(formData);

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка входа');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Ошибка входа',
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
          <p className="text-neutral-400">Войдите в ваш аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            label="Пароль"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ваш пароль"
            error={errors.password}
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
            Войти
          </Button>

          <p className="text-center text-neutral-400 text-sm">
            Нет аккаунта?{' '}
            <a href="/register" className="text-primary-500 hover:text-primary-400">
              Зарегистрироваться
            </a>
          </p>

          <button
            type="button"
            className="w-full text-neutral-400 hover:text-neutral-300 text-sm py-2"
          >
            Забыли пароль?
          </button>
        </form>
      </div>
    </div>
  );
}
