import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Basagram Full Stack запускается...\n');

// Инициализируем БД
console.log('🔄 Инициализируем БД...');

const dbProcess = spawn('node', ['apps/api/scripts/init-db.js'], {
  cwd: __dirname,
  stdio: 'inherit',
});

dbProcess.on('error', (err) => {
  console.error('❌ Ошибка инициализации БД:', err);
  process.exit(1);
});

// Когда БД готова, запускаем остальное
setTimeout(() => {
  // Запускаем API на 3001
  console.log('\n🔄 Запускаем API...');
  spawn('node', ['apps/api/dist/index.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, PORT: 3001, NODE_ENV: 'production' }
  });

  // Запускаем фронтенд на 3000
  console.log('🔄 Запускаем фронтенд...');
  spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'apps/web'),
    stdio: 'inherit',
    env: { ...process.env, PORT: 3000, NODE_ENV: 'production' }
  });

  // Запускаем прокси на основном PORT
  setTimeout(() => {
    const PORT = process.env.PORT || 3000;
    const app = express();

    console.log(`\n🔄 Запускаем прокси на порту ${PORT}...\n`);

    // Прокси для API запросов
    app.use('/api', createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      },
      logLevel: 'warn'
    }));

    // Прокси для health проверок
    app.use('/health', createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      logLevel: 'warn'
    }));

    // Всё остальное идёт на фронтенд
    app.use(createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      ws: true,
      logLevel: 'warn'
    }));

    app.listen(PORT, () => {
      console.log(`✅ Прокси запущен на порту ${PORT}`);
      console.log(`🎉 Basagram готов! Откройте https://basagrams.onrender.com\n`);
    });
  }, 3000);
}, 3000);
