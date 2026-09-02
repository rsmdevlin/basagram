import { Router, Request, Response } from 'express';
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

// Get user settings
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const user = await dbQuery<any>(
      `SELECT u.*, s.* FROM users u
       LEFT JOIN user_settings s ON s.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!user.length) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const u = user[0];
    res.json({
      displayName: u.display_name,
      username: u.username,
      email: u.email,
      phoneNumber: u.phone_number,
      bio: u.bio,
      avatarUrl: u.avatar_url,
      theme: u.theme || 'auto',
      language: u.language || 'ru',
      notificationsEnabled: u.notifications_enabled !== false,
      soundEnabled: u.sound_enabled !== false,
      privacyMode: u.privacy_mode || 'everyone',
      twoFactorEnabled: u.two_factor_enabled || false,
      lastSeen: u.last_seen || 'everyone',
      readReceipts: u.read_receipts !== false,
      typingIndicators: u.typing_indicators !== false,
    });
  } catch (error) {
    console.error('[Settings Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке настроек' });
  }
});

// Update user settings
router.patch('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      displayName,
      bio,
      theme,
      language,
      notificationsEnabled,
      soundEnabled,
      privacyMode,
      lastSeen,
      readReceipts,
      typingIndicators,
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (displayName !== undefined) {
      updates.push('display_name = ?');
      values.push(displayName);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      values.push(userId);
      await dbExecute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // User settings table
    const settingsUpdates: string[] = [];
    const settingsValues: any[] = [];

    if (theme !== undefined) {
      settingsUpdates.push('theme = ?');
      settingsValues.push(theme);
    }
    if (language !== undefined) {
      settingsUpdates.push('language = ?');
      settingsValues.push(language);
    }
    if (notificationsEnabled !== undefined) {
      settingsUpdates.push('notifications_enabled = ?');
      settingsValues.push(notificationsEnabled);
    }
    if (soundEnabled !== undefined) {
      settingsUpdates.push('sound_enabled = ?');
      settingsValues.push(soundEnabled);
    }
    if (privacyMode !== undefined) {
      settingsUpdates.push('privacy_mode = ?');
      settingsValues.push(privacyMode);
    }
    if (lastSeen !== undefined) {
      settingsUpdates.push('last_seen = ?');
      settingsValues.push(lastSeen);
    }
    if (readReceipts !== undefined) {
      settingsUpdates.push('read_receipts = ?');
      settingsValues.push(readReceipts);
    }
    if (typingIndicators !== undefined) {
      settingsUpdates.push('typing_indicators = ?');
      settingsValues.push(typingIndicators);
    }

    if (settingsUpdates.length > 0) {
      settingsUpdates.push('updated_at = NOW()');
      settingsValues.push(userId);

      // Check if settings exist
      const existing = await dbQuery<any>(
        `SELECT id FROM user_settings WHERE user_id = ?`,
        [userId]
      );

      if (existing.length > 0) {
        await dbExecute(
          `UPDATE user_settings SET ${settingsUpdates.join(', ')} WHERE user_id = ?`,
          settingsValues
        );
      } else {
        await dbExecute(
          `INSERT INTO user_settings (user_id, ${settingsUpdates
            .slice(0, -2)
            .map((_, i) => Object.keys(req.body)[i])
            .join(', ')})
           VALUES (?, ${settingsValues.map(() => '?').join(', ')})`,
          [userId, ...settingsValues.slice(0, -1)]
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Settings Update] Error:', error);
    res.status(500).json({ error: 'Ошибка при сохранении настроек' });
  }
});

export default router;
