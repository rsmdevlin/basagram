import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env.local' });

// Parse DATABASE_URL or use individual params
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    // Parse mysql://user:password@host:port/database
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
console.log(`Connecting to database: ${config.host}:${config.port}/${config.database}`);

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  password_hash: string;
  avatar_url?: string;
  bio?: string;
  status?: string;
  is_online: boolean;
  last_seen?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Conversation {
  id: string;
  name?: string;
  type: 'private' | 'group' | 'channel';
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  status: 'sending' | 'sent' | 'read' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  admin_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  admin_id: string;
  created_at: Date;
  updated_at: Date;
}

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
    console.error('Database query error:', sql, params, error);
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
    console.error('Database execute error:', sql, params, error);
    throw error;
  }
};

export const getConnection = async () => {
  return await pool.getConnection();
};

export default pool;
