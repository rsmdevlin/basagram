import mysql from 'mysql2/promise.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://gs348298:eKDxA99Mc2sf@80.242.59.112:3306/gs348298';

// Parse MySQL connection string
function parseConnectionString(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) throw new Error('Invalid DATABASE_URL format');

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
}

async function initializeDatabase() {
  try {
    const config = parseConnectionString(DATABASE_URL);

    console.log('🔌 Подключаемся к БД...');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);

    const connection = await mysql.createConnection(config);
    console.log('✅ Успешно подключено к базе данных!');

    // Read and execute migration - try multiple paths
    let migrationPath = path.join(__dirname, '..', 'migrations', '001_initial_schema.sql');
    console.log(`📂 Ищу миграцию в: ${migrationPath}`);

    if (!fs.existsSync(migrationPath)) {
      migrationPath = path.join(__dirname, '../../apps/api/migrations', '001_initial_schema.sql');
      console.log(`📂 Не найдено, пробую: ${migrationPath}`);
    }

    if (!fs.existsSync(migrationPath)) {
      migrationPath = path.join(process.cwd(), 'apps/api/migrations', '001_initial_schema.sql');
      console.log(`📂 Не найдено, пробую: ${migrationPath}`);
    }

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Файл миграции не найден ни по одному пути!`);
      console.log(`   __dirname: ${__dirname}`);
      console.log(`   cwd: ${process.cwd()}`);
      throw new Error(`Migration file not found at ${migrationPath}`);
    }

    console.log(`✅ Файл миграции найден!`);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());

    console.log(`\n📋 Выполняю ${statements.length} операций миграции...`);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (err) {
          // Ignore "table already exists" errors
          if (!err.message.includes('already exists')) {
            throw err;
          }
        }
      }
    }

    console.log('✅ Миграция выполнена успешно!');
    console.log('✅ Все таблицы созданы!');

    await connection.end();
    console.log('\n🎉 База данных инициализирована и готова к работе!\n');

  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
