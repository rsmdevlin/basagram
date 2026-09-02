import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Basagram Full Stack запускается...\n');

// Start backend first
console.log('🔄 Инициализируем БД и запускаем бэкенд...');
const backendProcess = spawn('node', ['apps/api/scripts/init-db.js'], {
  cwd: __dirname,
  stdio: 'inherit',
});

backendProcess.on('error', (err) => {
  console.error('❌ Ошибка при запуске init-db.js:', err);
  process.exit(1);
});

// Wait a bit for DB to initialize, then start backend API
setTimeout(() => {
  console.log('\n🔄 Запускаем API сервер...');
  const apiProcess = spawn('node', ['apps/api/dist/index.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  apiProcess.on('error', (err) => {
    console.error('❌ Ошибка при запуске API:', err);
    process.exit(1);
  });

  // Start frontend
  setTimeout(() => {
    console.log('\n🔄 Запускаем фронтенд...');
    const frontendProcess = spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'apps/web'),
      stdio: 'inherit',
      env: { ...process.env, PORT: 3000, NODE_ENV: 'production' }
    });

    frontendProcess.on('error', (err) => {
      console.error('❌ Ошибка при запуске фронтенда:', err);
      process.exit(1);
    });
  }, 2000);
}, 3000);
