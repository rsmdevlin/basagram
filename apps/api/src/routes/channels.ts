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

// Get all channels for user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const channels = await dbQuery<any>(
      `SELECT
        c.id,
        c.name,
        c.description,
        c.avatar_url,
        c.is_public,
        c.creator_id,
        COUNT(DISTINCT cu.user_id) as subscribers_count,
        c.created_at
      FROM channels c
      LEFT JOIN channel_subscribers cu ON cu.channel_id = c.id
      WHERE c.is_public = TRUE OR c.creator_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json(
      channels.map((ch) => ({
        id: ch.id,
        name: ch.name,
        description: ch.description,
        avatar: ch.avatar_url,
        isPublic: ch.is_public,
        subscribersCount: ch.subscribers_count || 0,
        createdAt: ch.created_at,
      }))
    );
  } catch (error) {
    console.error('[Channels Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке каналов' });
  }
});

// Create channel
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, description, isPublic } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Требуется название канала' });
    }

    const channelId = uuidv4();
    await dbExecute(
      `INSERT INTO channels (id, name, description, creator_id, is_public)
       VALUES (?, ?, ?, ?, ?)`,
      [channelId, name.trim(), description || null, userId, isPublic !== false]
    );

    // Add creator as first subscriber/admin
    await dbExecute(
      `INSERT INTO channel_subscribers (id, channel_id, user_id, role)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), channelId, userId, 'admin']
    );

    res.status(201).json({
      id: channelId,
      name,
      description: description || null,
      isPublic: isPublic !== false,
      subscribersCount: 1,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Channel Create] Error:', error);
    res.status(500).json({ error: 'Ошибка при создании канала' });
  }
});

// Get channel details
router.get('/:channelId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;

    const channel = await dbQuery<any>(
      `SELECT
        c.id,
        c.name,
        c.description,
        c.avatar_url,
        c.is_public,
        c.creator_id,
        COUNT(DISTINCT cu.user_id) as subscribers_count,
        c.created_at
      FROM channels c
      LEFT JOIN channel_subscribers cu ON cu.channel_id = c.id
      WHERE c.id = ?
      GROUP BY c.id`,
      [channelId]
    );

    if (!channel.length) {
      return res.status(404).json({ error: 'Канал не найден' });
    }

    const ch = channel[0];
    res.json({
      id: ch.id,
      name: ch.name,
      description: ch.description,
      avatar: ch.avatar_url,
      isPublic: ch.is_public,
      creatorId: ch.creator_id,
      subscribersCount: ch.subscribers_count || 0,
      createdAt: ch.created_at,
    });
  } catch (error) {
    console.error('[Channel Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке канала' });
  }
});

// Subscribe to channel
router.post('/:channelId/subscribe', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { channelId } = req.params;

    const existing = await dbQuery<any>(
      `SELECT id FROM channel_subscribers
       WHERE channel_id = ? AND user_id = ?`,
      [channelId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Уже подписаны на этот канал' });
    }

    await dbExecute(
      `INSERT INTO channel_subscribers (id, channel_id, user_id, role)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), channelId, userId, 'member']
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Channel Subscribe] Error:', error);
    res.status(500).json({ error: 'Ошибка при подписке на канал' });
  }
});

// Unsubscribe from channel
router.post('/:channelId/unsubscribe', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { channelId } = req.params;

    await dbExecute(
      `DELETE FROM channel_subscribers
       WHERE channel_id = ? AND user_id = ? AND role != ?`,
      [channelId, userId, 'admin']
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Channel Unsubscribe] Error:', error);
    res.status(500).json({ error: 'Ошибка при отписке от канала' });
  }
});

// Get channel posts
router.get('/:channelId/posts', requireAuth, async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;

    const posts = await dbQuery<any>(
      `SELECT
        p.id,
        p.channel_id,
        p.creator_id,
        u.display_name as creator_name,
        p.content,
        p.created_at,
        p.is_pinned,
        COUNT(DISTINCT pr.id) as reactions_count
      FROM channel_posts p
      LEFT JOIN users u ON u.id = p.creator_id
      LEFT JOIN post_reactions pr ON pr.post_id = p.id
      WHERE p.channel_id = ? AND p.is_deleted = FALSE
      GROUP BY p.id
      ORDER BY p.is_pinned DESC, p.created_at DESC`,
      [channelId]
    );

    res.json(
      posts.map((post) => ({
        id: post.id,
        channelId: post.channel_id,
        creatorId: post.creator_id,
        creatorName: post.creator_name,
        content: post.content,
        createdAt: post.created_at,
        isPinned: post.is_pinned,
        reactionsCount: post.reactions_count || 0,
      }))
    );
  } catch (error) {
    console.error('[Channel Posts Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке постов' });
  }
});

// Create channel post
router.post('/:channelId/posts', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { channelId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Пост не может быть пустым' });
    }

    const postId = uuidv4();
    await dbExecute(
      `INSERT INTO channel_posts (id, channel_id, creator_id, content)
       VALUES (?, ?, ?, ?)`,
      [postId, channelId, userId, content.trim()]
    );

    res.status(201).json({
      id: postId,
      channelId,
      creatorId: userId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isPinned: false,
      reactionsCount: 0,
    });
  } catch (error) {
    console.error('[Channel Post Create] Error:', error);
    res.status(500).json({ error: 'Ошибка при создании поста' });
  }
});

// Delete channel post
router.delete('/:channelId/posts/:postId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { postId } = req.params;

    await dbExecute(
      `UPDATE channel_posts SET is_deleted = TRUE, deleted_at = NOW()
       WHERE id = ? AND creator_id = ?`,
      [postId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Channel Post Delete] Error:', error);
    res.status(500).json({ error: 'Ошибка при удалении поста' });
  }
});

export default router;
