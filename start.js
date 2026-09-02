import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { URL } from 'url';

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

    console.log(`\n🔄 Запускаем прокси на порту ${PORT}...\n`);

    const server = http.createServer((req, res) => {
      const isApiRequest = req.url.startsWith('/api/') || req.url.startsWith('/health');
      const targetPort = isApiRequest ? 3001 : 3000;
      const targetHost = 'localhost';

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
        console.error('Proxy error:', err);
        res.writeHead(503);
        res.end('Service Unavailable');
      });

      req.pipe(proxyReq);
    });

    server.listen(PORT, () => {
      console.log(`✅ Прокси запущен на порту ${PORT}`);
      console.log(`🎉 Basagram готов! Откройте https://basagrams.onrender.com\n`);
    });

    server.on('error', (err) => {
      console.error('❌ Ошибка прокси сервера:', err);
      process.exit(1);
    });
  }, 3000);
}, 3000);
