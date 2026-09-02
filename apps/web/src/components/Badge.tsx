'use client';

import React from 'react';

interface BadgeProps {
  count?: number;
  variant?: 'danger' | 'success' | 'warning' | 'info' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  danger: 'bg-red-500 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
  muted: 'bg-gray-400 text-white',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  count,
  variant = 'danger',
  size = 'md',
  className = '',
}) => {
  if (count === 0 || count === undefined) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {displayCount}
    </span>
  );
};

export default Badge;
