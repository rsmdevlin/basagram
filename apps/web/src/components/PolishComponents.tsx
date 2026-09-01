import React, { useState, useEffect } from 'react';

interface SkeletonProps {
  count?: number;
  height?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  height = 'h-4',
  circle = false,
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${height} ${circle ? 'rounded-full' : 'rounded'} bg-neutral-800`}
        />
      ))}
    </div>
  );
};

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0 }) => {
  return (
    <div
      style={{
        animation: `fadeIn 0.3s ease-in-out ${delay}ms forwards`,
        opacity: 0,
      }}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'up',
  delay = 0,
}) => {
  const animationMap = {
    up: 'slideInUp',
    down: 'slideInDown',
    left: 'slideInLeft',
    right: 'slideInRight',
  };

  return (
    <div
      style={{
        animation: `${animationMap[direction]} 0.3s ease-out ${delay}ms forwards`,
        opacity: 0,
      }}
    >
      {children}
    </div>
  );
};

interface TransitionProps {
  children: React.ReactNode;
  show: boolean;
  duration?: number;
}

export const Transition: React.FC<TransitionProps> = ({
  children,
  show,
  duration = 300,
}) => {
  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transition: `opacity ${duration}ms ease-in-out`,
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <p className="text-red-400 font-medium">
              Произошла ошибка при отрисовке этого компонента
            </p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="text-red-300 text-xs mt-2 whitespace-pre-wrap">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-400 text-center mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-smooth"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-green-900/80 border-green-700 text-green-200',
    error: 'bg-red-900/80 border-red-700 text-red-200',
    info: 'bg-blue-900/80 border-blue-700 text-blue-200',
    warning: 'bg-yellow-900/80 border-yellow-700 text-yellow-200',
  };

  return (
    <div
      className={`notification-enter fixed bottom-4 right-4 border rounded-lg px-4 py-3 max-w-sm ${colors[type]} ${
        !isVisible ? 'opacity-0' : 'opacity-100'
      } transition-smooth`}
    >
      {message}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-blue-500',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeMap[size]} ${color} animate-spin-slow`}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
}) => {
  const colors = {
    success: 'bg-green-900/20 border-green-800 text-green-400',
    error: 'bg-red-900/20 border-red-800 text-red-400',
    warning: 'bg-yellow-900/20 border-yellow-800 text-yellow-400',
    info: 'bg-blue-900/20 border-blue-800 text-blue-400',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-4 ${colors[type]}`}>
      <div className="text-xl font-bold">{icons[type]}</div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="opacity-50 hover:opacity-100 transition-smooth"
        >
          ×
        </button>
      )}
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = [];
  const maxPagesToShow = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) pages.push('...');
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 transition-smooth"
      >
        ←
      </button>

      {pages.map((page, i) => (
        <button
          key={i}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-2 rounded-lg transition-smooth ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 transition-smooth"
      >
        →
      </button>
    </div>
  );
};

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="modal-content bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-sm">
        <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
        <p className="text-neutral-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-smooth"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-smooth text-white ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
