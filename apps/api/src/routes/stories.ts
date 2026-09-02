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

// Get all stories (not expired)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const stories = await dbQuery<any>(
      `SELECT
        s.id,
        s.user_id,
        u.display_name as user_name,
        u.avatar_url as user_avatar,
        s.content,
        s.media_url,
        s.media_type,
        COUNT(DISTINCT sv.id) as views,
        MAX(CASE WHEN sv.user_id = ? THEN 1 ELSE 0 END) as is_viewed,
        DATE_ADD(s.created_at, INTERVAL 24 HOUR) as expires_at,
        s.created_at
      FROM stories s
      LEFT JOIN users u ON u.id = s.user_id
      LEFT JOIN story_views sv ON sv.story_id = s.id
      WHERE s.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY s.id
      ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json(
      stories.map((story) => ({
        id: story.id,
        userId: story.user_id,
        userName: story.user_name,
        userAvatar: story.user_avatar,
        content: story.content,
        mediaUrl: story.media_url,
        mediaType: story.media_type,
        views: story.views || 0,
        isViewed: story.is_viewed === 1,
        expiresAt: story.expires_at,
        createdAt: story.created_at,
      }))
    );
  } catch (error) {
    console.error('[Stories Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке историй' });
  }
});

// Create story
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { content, mediaUrl, mediaType } = req.body;

    if (!content && !mediaUrl) {
      return res.status(400).json({ error: 'Требуется содержимое или медиа' });
    }

    const storyId = uuidv4();
    await dbExecute(
      `INSERT INTO stories (id, user_id, content, media_url, media_type)
       VALUES (?, ?, ?, ?, ?)`,
      [storyId, userId, content || null, mediaUrl || null, mediaType || null]
    );

    const user = await dbQuery<any>(
      `SELECT display_name, avatar_url FROM users WHERE id = ?`,
      [userId]
    );

    res.status(201).json({
      id: storyId,
      userId,
      userName: user[0]?.display_name || 'Unknown',
      userAvatar: user[0]?.avatar_url,
      content,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      views: 0,
      isViewed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Story Create] Error:', error);
    res.status(500).json({ error: 'Ошибка при создании истории' });
  }
});

// Mark story as viewed
router.post('/:storyId/view', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { storyId } = req.params;

    const existing = await dbQuery<any>(
      `SELECT id FROM story_views
       WHERE story_id = ? AND user_id = ?`,
      [storyId, userId]
    );

    if (existing.length === 0) {
      await dbExecute(
        `INSERT INTO story_views (id, story_id, user_id)
         VALUES (?, ?, ?)`,
        [uuidv4(), storyId, userId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Story View] Error:', error);
    res.status(500).json({ error: 'Ошибка при отметке просмотра' });
  }
});

// Delete story
router.delete('/:storyId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { storyId } = req.params;

    await dbExecute(
      `DELETE FROM stories
       WHERE id = ? AND user_id = ?`,
      [storyId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Story Delete] Error:', error);
    res.status(500).json({ error: 'Ошибка при удалении истории' });
  }
});

export default router;
