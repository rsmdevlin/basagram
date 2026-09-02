import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

let pool: mysql.Pool;

const getPool = async () => {
  if (!pool) {
    const getDatabaseConfig = () => {
      if (process.env.DATABASE_URL) {
        try {
          const url = new URL(process.env.DATABASE_URL);
          return {
            host: url.hostname,
            port: parseInt(url.port || '3306'),
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1),
          };
        } catch (e) {
          console.error('Failed to parse DATABASE_URL:', e);
        }
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
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};

const dbQuery = async <T = any>(sql: string, params?: any[]): Promise<T[]> => {
  const p = await getPool();
  const connection = await p.getConnection();
  try {
    const [rows] = await connection.query(sql, params || []);
    return rows as T[];
  } finally {
    connection.release();
  }
};

const dbExecute = async (sql: string, params?: any[]): Promise<any> => {
  const p = await getPool();
  const connection = await p.getConnection();
  try {
    const [result] = await connection.execute(sql, params || []);
    return result;
  } finally {
    connection.release();
  }
};

// Search users
router.get('/search', requireAuth, async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json([]);
    }

    const users = await dbQuery<any>(
      `SELECT
        u.id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.is_online
      FROM users u
      WHERE (u.username LIKE ? OR u.display_name LIKE ?)
      AND u.id != ?
      LIMIT 20`,
      [`%${q}%`, `%${q}%`, (req as any).userId]
    );

    res.json(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        avatar: u.avatar_url,
        isOnline: u.is_online,
      }))
    );
  } catch (error) {
    console.error('[Users Search] Error:', error);
    res.status(500).json({ error: 'Ошибка при поиске' });
  }
});

// Get user contacts
router.get('/contacts', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const contacts = await dbQuery<any>(
      `SELECT
        u.id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.is_online,
        c.is_favorite
      FROM contacts c
      LEFT JOIN users u ON u.id = c.contact_id
      WHERE c.user_id = ?
      ORDER BY u.display_name ASC`,
      [userId]
    );

    res.json(
      contacts.map((c) => ({
        id: c.id,
        username: c.username,
        displayName: c.display_name,
        avatar: c.avatar_url,
        isOnline: c.is_online,
        isFavorite: c.is_favorite,
      }))
    );
  } catch (error) {
    console.error('[Contacts Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке контактов' });
  }
});

// Add contact
router.post('/contacts', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { userId: contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: 'Требуется contactId' });
    }

    // Check if already a contact
    const existing = await dbQuery<any>(
      `SELECT id FROM contacts WHERE user_id = ? AND contact_id = ?`,
      [userId, contactId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Уже в контактах' });
    }

    await dbExecute(
      `INSERT INTO contacts (id, user_id, contact_id) VALUES (?, ?, ?)`,
      [uuidv4(), userId, contactId]
    );

    const contact = await dbQuery<any>(
      `SELECT u.* FROM users u WHERE u.id = ?`,
      [contactId]
    );

    if (!contact.length) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const c = contact[0];
    res.status(201).json({
      id: c.id,
      username: c.username,
      displayName: c.display_name,
      avatar: c.avatar_url,
      isOnline: c.is_online,
      isFavorite: false,
    });
  } catch (error) {
    console.error('[Contact Add] Error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении контакта' });
  }
});

// Remove contact
router.delete('/contacts/:contactId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { contactId } = req.params;

    await dbExecute(
      `DELETE FROM contacts WHERE user_id = ? AND contact_id = ?`,
      [userId, contactId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Contact Remove] Error:', error);
    res.status(500).json({ error: 'Ошибка при удалении контакта' });
  }
});

// Toggle favorite
router.patch('/contacts/:contactId/favorite', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { contactId } = req.params;
    const { isFavorite } = req.body;

    await dbExecute(
      `UPDATE contacts SET is_favorite = ? WHERE user_id = ? AND contact_id = ?`,
      [isFavorite ? 1 : 0, userId, contactId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Contact Favorite] Error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении избранного' });
  }
});

export default router;
