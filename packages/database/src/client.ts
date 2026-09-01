import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL не установлен в .env.local');
}

let pool: mysql.Pool;

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(DATABASE_URL);
  }
  return pool.getConnection();
}

export async function query<T extends mysql.RowDataPacket[]>(
  sql: string,
  values?: any[]
): Promise<T> {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute<T>(sql, values);
    return rows;
  } finally {
    await connection.end();
  }
}

export async function execute(sql: string, values?: any[]) {
  const connection = await getConnection();
  try {
    const result = await connection.execute(sql, values);
    return result;
  } finally {
    await connection.end();
  }
}

export async function transaction<T>(
  callback: (conn: mysql.Connection) => Promise<T>
): Promise<T> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection as mysql.Connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}
