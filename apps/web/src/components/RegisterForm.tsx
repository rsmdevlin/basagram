'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
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
          <p className="text-white text-opacity-80">Create Your Account</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--tg-text)] mb-2">Get started</h2>
            <p className="text-[var(--tg-text-secondary)]">Join millions of users</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">✓ Account created successfully! Redirecting to login...</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username input */}
            <div>
              <label className="block text-sm font-medium text-[var(--tg-text)] mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your_username"
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all"
              />
              <p className="text-xs text-[var(--tg-text-tertiary)] mt-1">3-32 characters, letters and numbers only</p>
            </div>

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
              <p className="text-xs text-[var(--tg-text-tertiary)] mt-1">At least 8 characters</p>
            </div>

            {/* Confirm password input */}
            <div>
              <label className="block text-sm font-medium text-[var(--tg-text)] mb-2">
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>

            {/* Terms agreement */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agree"
                required
                className="w-4 h-4 rounded border-[var(--tg-border)] text-[var(--tg-primary)] focus:ring-[var(--tg-primary)] mt-1"
              />
              <label htmlFor="agree" className="text-sm text-[var(--tg-text-secondary)]">
                I agree to the{' '}
                <Link href="/terms" className="text-[var(--tg-primary)] hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[var(--tg-primary)] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full px-4 py-3 rounded-lg bg-[var(--tg-primary)] text-white font-semibold hover:bg-[var(--tg-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : success ? (
                '✓ Account created!'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Sign in link */}
          <div className="text-center pt-4 border-t border-[var(--tg-border)]">
            <p className="text-[var(--tg-text-secondary)]">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--tg-primary)] hover:text-[var(--tg-primary-hover)] font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white text-opacity-70 text-sm">
          <p>Fast, simple, secure messaging</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
