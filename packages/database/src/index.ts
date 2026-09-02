import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../../.env.local' });

const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'basagram',
  };
};

const config = getDatabaseConfig();
console.log(`[DB] Connecting to ${config.host}:${config.port}/${config.database}`);

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const query = async <T = any>(sql: string, params?: any[]): Promise<T[]> => {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(sql, params || []);
      return rows as T[];
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[DB] Query error:', sql, error);
    throw error;
  }
};

export const execute = async (sql: string, params?: any[]): Promise<any> => {
  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(sql, params || []);
      return result;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[DB] Execute error:', sql, error);
    throw error;
  }
};

export default pool;
