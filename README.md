# Basagram

Премиум современный мессенджер. Production-quality платформа реал-тайм коммуникации.

## Быстрый старт

```bash
npm install
npm run dev
```

## Структура

```
apps/
  web/          # Next.js фронтенд
  api/          # Node.js бэкенд

packages/
  types/        # Общие TypeScript типы
  ui/           # Компоненты дизайн-системы
  validation/   # Схемы валидации
  utils/        # Общие утилиты
  database/     # БД клиент и миграции
```

## Разработка

- `npm run dev` — Запустить все сервисы
- `npm run type-check` — Проверка TypeScript
- `npm run lint` — ESLint проверка
- `npm run test` — Запустить тесты

## Окружение

Скопируй `.env.example` в `.env.local` и заполни credentials.

## Архитектура

- **Frontend**: React + TypeScript + Next.js
- **Backend**: Node.js + TypeScript + Express
- **База данных**: MySQL (persistent)
- **Cache/Realtime**: Redis
- **Реал-тайм**: WebSocket (Socket.IO)
- **Медиа**: S3-compatible хранилище (Cloudflare R2)
- **Вызовы**: WebRTC с TURN серверами

## Документация

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [DATABASE.md](./docs/DATABASE.md)
- [REALTIME.md](./docs/REALTIME.md)
- [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)
