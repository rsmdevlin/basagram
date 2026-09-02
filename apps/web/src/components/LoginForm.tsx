'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();

      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirect to home
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--tg-primary)] to-[var(--tg-primary-dark)] px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Basagram</h1>
          <p className="text-white text-opacity-80">Premium Modern Messenger</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--tg-text)] mb-2">Welcome back</h2>
            <p className="text-[var(--tg-text-secondary)]">Sign in to your account</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div>
              <label className="block text-sm font-medium text-[var(--tg-text)] mb-2">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-medium text-[var(--tg-text)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)]"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-[var(--tg-border)] text-[var(--tg-primary)] focus:ring-[var(--tg-primary)]"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-[var(--tg-text-secondary)]">
                Remember me
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-[var(--tg-primary)] text-white font-semibold hover:bg-[var(--tg-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--tg-border)]" />
            <span className="text-sm text-[var(--tg-text-secondary)]">or</span>
            <div className="flex-1 h-px bg-[var(--tg-border)]" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 rounded-lg border border-[var(--tg-border)] hover:bg-[var(--tg-surface)] transition-colors text-sm font-medium">
              Google
            </button>
            <button className="px-4 py-2 rounded-lg border border-[var(--tg-border)] hover:bg-[var(--tg-surface)] transition-colors text-sm font-medium">
              GitHub
            </button>
          </div>

          {/* Sign up link */}
          <div className="text-center pt-4 border-t border-[var(--tg-border)]">
            <p className="text-[var(--tg-text-secondary)]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[var(--tg-primary)] hover:text-[var(--tg-primary-hover)] font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          {/* Forgot password */}
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-[var(--tg-primary)] hover:text-[var(--tg-primary-hover)]">
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white text-opacity-70 text-sm">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
