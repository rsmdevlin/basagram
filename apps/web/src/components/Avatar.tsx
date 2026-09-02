'use client';

import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  muted?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

const initialsTextSize = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
};

const getColorFromInitials = (initials: string): string => {
  const colors = [
    'bg-blue-400',
    'bg-green-400',
    'bg-red-400',
    'bg-purple-400',
    'bg-yellow-400',
    'bg-pink-400',
    'bg-indigo-400',
    'bg-orange-400',
  ];
  const code = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  return colors[code % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  initials = '?',
  size = 'md',
  online = false,
  muted = false,
  className = '',
}) => {
  const sizeClass = sizeMap[size];
  const textSizeClass = initialsTextSize[size];
  const bgColor = getColorFromInitials(initials);

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClass} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center font-medium text-white ${
          src ? '' : bgColor
        }`}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`${textSizeClass} font-semibold`}>
            {initials.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Online indicator */}
      {online && (
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-online-pulse ${
            size === 'xs' ? 'w-2 h-2' : size === 'xl' ? 'w-4 h-4' : ''
          }`}
        />
      )}

      {/* Muted indicator */}
      {muted && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-gray-400 rounded-full" />
      )}
    </div>
  );
};

export default Avatar;
