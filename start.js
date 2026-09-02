import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Basagram Full Stack запускается...\n');

// На Render: PORT=3001 для фронтенда, API на отдельном внутреннем порту
const FRONTEND_PORT = parseInt(process.env.PORT || '3000', 10);
const API_PORT = 3001;

// Если фронтенд просит 3001, используем другой порт для API
const actualApiPort = FRONTEND_PORT === 3001 ? 3002 : 3001;

console.log(`📍 Frontend PORT: ${FRONTEND_PORT}`);
console.log(`📍 API PORT: ${actualApiPort}\n`);

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

dbProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Инициализация БД завершилась с ошибкой');
    process.exit(1);
  }

  // БД готова, запускаем сервисы
  console.log('\n🔄 Запускаем API на порту ' + actualApiPort + '...');
  spawn('node', ['apps/api/dist/index.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, PORT: actualApiPort, NODE_ENV: 'production' }
  });

  // Даём API время на запуск, потом стартуем фронтенд
  setTimeout(() => {
    console.log(`🔄 Запускаем Next.js на порту ${FRONTEND_PORT}...`);
    spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'apps/web'),
      stdio: 'inherit',
      env: { ...process.env, PORT: FRONTEND_PORT, API_URL: `http://localhost:${actualApiPort}`, NODE_ENV: 'production' }
    });
  }, 2000);
});
