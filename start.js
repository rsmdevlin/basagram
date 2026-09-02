import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Basagram Full Stack запускается...\n');

// Основной PORT для прокси
const MAIN_PORT = parseInt(process.env.PORT || '3000', 10);
const API_PORT = 3001;
const FRONTEND_PORT = 3000;

console.log(`📍 Основной PORT: ${MAIN_PORT}`);
console.log(`📍 API PORT: ${API_PORT}`);
console.log(`📍 Frontend PORT: ${FRONTEND_PORT}\n`);

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
  console.log('\n🔄 Запускаем API на порту 3001...');
  spawn('node', ['apps/api/dist/index.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, PORT: API_PORT, NODE_ENV: 'production' }
  });

  // Запускаем фронтенд на 3000 (если это не основной PORT)
  if (MAIN_PORT !== FRONTEND_PORT) {
    console.log(`🔄 Запускаем фронтенд на порту ${FRONTEND_PORT}...`);
    spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'apps/web'),
      stdio: 'inherit',
      env: { ...process.env, PORT: FRONTEND_PORT, NODE_ENV: 'production' }
    });
  }

  // Запускаем прокси на основном PORT
  setTimeout(() => {
    console.log(`\n🔄 Запускаем прокси на порту ${MAIN_PORT}...\n`);

    const server = http.createServer((req, res) => {
      const isApiRequest = req.url.startsWith('/api/') || req.url.startsWith('/health');
      const targetPort = isApiRequest ? API_PORT : (MAIN_PORT === FRONTEND_PORT ? FRONTEND_PORT : FRONTEND_PORT);
      const targetHost = '127.0.0.1';

      const proxyReq = http.request(
        {
          hostname: targetHost,
          port: targetPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        }
      );

      proxyReq.on('error', (err) => {
        console.error(`Proxy error (${targetPort}):`, err.message);
        res.writeHead(503);
        res.end('Service Unavailable');
      });

      req.pipe(proxyReq);
    });

    server.listen(MAIN_PORT, '0.0.0.0', () => {
      console.log(`✅ Прокси запущен на http://0.0.0.0:${MAIN_PORT}`);
      console.log(`🎉 Basagram готов! Откройте https://basagrams.onrender.com\n`);
    });

    server.on('error', (err) => {
      console.error('❌ Ошибка прокси сервера:', err);
      process.exit(1);
    });
  }, 3000);
}, 3000);
