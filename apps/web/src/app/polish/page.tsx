'use client';

import React, { useState } from 'react';
import {
  Skeleton,
  FadeIn,
  SlideIn,
  ErrorBoundary,
  EmptyState,
  Alert,
  LoadingSpinner,
  ConfirmDialog,
} from '@/components/PolishComponents';

export default function PolishPage() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Полировка интерфейса
        </h1>
        <p className="text-neutral-400">
          Плавные анимации, переходы и обработка ошибок
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Animations */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Анимации</h2>
          <div className="space-y-4">
            <div className="animate-fade-in bg-neutral-800 p-4 rounded-lg">
              <p className="text-neutral-300">Fade In</p>
            </div>
            <div className="animate-slide-up bg-neutral-800 p-4 rounded-lg">
              <p className="text-neutral-300">Slide Up</p>
            </div>
            <div className="animate-scale-in bg-neutral-800 p-4 rounded-lg">
              <p className="text-neutral-300">Scale In</p>
            </div>
            <div className="animate-bounce-soft bg-neutral-800 p-4 rounded-lg">
              <p className="text-neutral-300">Bounce Soft</p>
            </div>
          </div>
        </div>

        {/* Loading States */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Состояния загрузки
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="text-neutral-300">Маленький спиннер</span>
            </div>
            <div className="flex items-center gap-3">
              <LoadingSpinner size="md" />
              <span className="text-neutral-300">Средний спиннер</span>
            </div>
            <div className="bg-neutral-800 p-4 rounded-lg">
              <Skeleton count={2} height="h-4" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Уведомления и оповещения
          </h2>
          <div className="space-y-3">
            <Alert
              type="success"
              title="Успешно!"
              message="Действие выполнено успешно"
            />
            <Alert
              type="error"
              title="Ошибка"
              message="Произошла ошибка при выполнении"
            />
            <Alert
              type="warning"
              title="Предупреждение"
              message="Это действие может иметь последствия"
            />
            <Alert
              type="info"
              title="Информация"
              message="Важная информация для вас"
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Пустое состояние
          </h2>
          <EmptyState
            icon="💬"
            title="Нет сообщений"
            description="Начните разговор с другом"
            action={{
              label: 'Начать чат',
              onClick: () => console.log('Start chat'),
            }}
          />
        </div>

        {/* Hover Effects */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Эффекты наведения
          </h2>
          <div className="space-y-3">
            <button className="w-full hover-lift bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition">
              Lift Effect
            </button>
            <button className="w-full hover-scale bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition">
              Scale Effect
            </button>
            <button className="w-full hover-glow bg-neutral-800 text-white px-4 py-2 rounded-lg transition">
              Glow Effect
            </button>
          </div>
        </div>

        {/* Transitions */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Переходы</h2>
          <div className="space-y-3">
            <button className="w-full transition-smooth bg-neutral-800 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
              Color Transition
            </button>
            <button className="w-full transition-fast bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg">
              Fast Transition
            </button>
            <button className="w-full transition-slow bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg">
              Slow Transition
            </button>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setShowConfirmDialog(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-smooth"
        >
          Открыть диалог подтверждения
        </button>
      </div>

      {showConfirmDialog && (
        <ConfirmDialog
          title="Подтверждение действия"
          message="Вы уверены? Это действие может быть необратимо."
          confirmLabel="Удалить"
          cancelLabel="Отмена"
          isDangerous={true}
          onConfirm={() => {
            console.log('Confirmed');
            setShowConfirmDialog(false);
          }}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      {/* Error Boundary Example */}
      <div className="mt-8 max-w-4xl">
        <ErrorBoundary fallback={<div>Пользовательское сообщение об ошибке</div>}>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Error Boundary
            </h2>
            <p className="text-neutral-400">
              Компонент защищен Error Boundary для обработки ошибок
            </p>
          </div>
        </ErrorBoundary>
      </div>

      {/* Polish Best Practices */}
      <div className="mt-8 max-w-4xl bg-blue-900/20 border border-blue-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-400 mb-4">
          ✨ Лучшие практики полировки
        </h2>
        <ul className="text-blue-300 text-sm space-y-2">
          <li>• Используйте плавные анимации для переходов между состояниями</li>
          <li>
            • Добавьте обратную связь при взаимодействии пользователя (hover,
            click)
          </li>
          <li>
            • Обработайте все граничные случаи (пустые состояния, ошибки,
            загрузка)
          </li>
          <li>• Уважайте предпочтения пользователя (prefers-reduced-motion)</li>
          <li>• Используйте консистентные временные интервалы анимаций</li>
          <li>• Добавьте скелетоны загрузки вместо внезапного появления контента</li>
          <li>• Предусмотрите диалоги подтверждения для опасных действий</li>
          <li>• Покажите понятные сообщения об ошибках на русском языке</li>
        </ul>
      </div>
    </div>
  );
}
