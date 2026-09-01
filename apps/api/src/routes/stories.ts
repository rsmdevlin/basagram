import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Create story
router.post('/', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.slice(7);
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ error: 'Неверный токен' });
    }

    const { type, content, mediaUrl } = req.body;

    if (!type || !['text', 'image', 'video'].includes(type)) {
      return res.status(400).json({ error: 'type должен быть text, image или video' });
    }

    if (!content && !mediaUrl) {
      return res.status(400).json({ error: 'Требуется content или mediaUrl' });
    }

    const storyId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await execute(
      `INSERT INTO stories
       (id, user_id, type, content, media_url, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [storyId, userId, type, content || null, mediaUrl || null, expiresAt]
    );

    const story = await query('SELECT * FROM stories WHERE id = ?', [storyId]);

    res.status(201).json({
      ...story[0],
      viewCount: 0,
      reactions: [],
      isViewed: false,
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Ошибка при создании истории' });
  }
});

// Get user stories
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stories = await query(
      `SELECT * FROM stories
       WHERE user_id = ? AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId]
    );

    const storiesWithDetails = await Promise.all(
      stories.map(async (s: any) => {
        const views = await query(
          'SELECT COUNT(*) as count FROM story_views WHERE story_id = ?',
          [s.id]
        );
        const reactions = await query(
          `SELECT emoji, COUNT(*) as count
           FROM story_reactions
           WHERE story_id = ?
           GROUP BY emoji`,
          [s.id]
        );
        return {
          ...s,
          viewCount: views[0].count,
          reactions,
        };
      })
    );

    res.json(storiesWithDetails);
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({ error: 'Ошибка при получении историй' });
  }
});

// View story
router.post('/:storyId/view', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.slice(7);
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ error: 'Неверный токен' });
    }

    const { storyId } = req.params;

    // Check if already viewed
    const existing = await query(
      'SELECT id FROM story_views WHERE story_id = ? AND viewer_id = ?',
      [storyId, userId]
    );

    if (existing.length === 0) {
      await execute(
        `INSERT INTO story_views (id, story_id, viewer_id)
         VALUES (?, ?, ?)`,
        [uuidv4(), storyId, userId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ error: 'Ошибка при просмотре истории' });
  }
});

// Add reaction to story
router.post('/:storyId/reactions', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.slice(7);
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ error: 'Неверный токен' });
    }

    const { storyId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: 'emoji не предоставлен' });
    }

    // Check if reaction already exists
    const existing = await query(
      `SELECT id FROM story_reactions
       WHERE story_id = ? AND user_id = ? AND emoji = ?`,
      [storyId, userId, emoji]
    );

    if (existing.length > 0) {
      // Remove reaction if already exists
      await execute(
        `DELETE FROM story_reactions
         WHERE story_id = ? AND user_id = ? AND emoji = ?`,
        [storyId, userId, emoji]
      );
      return res.json({ action: 'removed' });
    }

    // Add new reaction
    await execute(
      `INSERT INTO story_reactions (id, story_id, user_id, emoji)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), storyId, userId, emoji]
    );

    res.status(201).json({ action: 'added' });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении реакции' });
  }
});

// Get story views
router.get('/:storyId/views', async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;

    const views = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, sv.viewed_at
       FROM story_views sv
       JOIN users u ON sv.viewer_id = u.id
       WHERE sv.story_id = ?
       ORDER BY sv.viewed_at DESC`,
      [storyId]
    );

    res.json(views);
  } catch (error) {
    console.error('Get views error:', error);
    res.status(500).json({ error: 'Ошибка при получении просмотров' });
  }
});

// Delete story
router.delete('/:storyId', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.slice(7);
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ error: 'Неверный токен' });
    }

    const { storyId } = req.params;

    // Verify ownership
    const story = await query(
      'SELECT user_id FROM stories WHERE id = ?',
      [storyId]
    );

    if (story.length === 0 || story[0].user_id !== userId) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    await execute('DELETE FROM stories WHERE id = ?', [storyId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ error: 'Ошибка при удалении истории' });
  }
});

// Get stories feed (for current user's followers)
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.slice(7);
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ error: 'Неверный токен' });
    }

    // Get stories from contacts
    const stories = await query(
      `SELECT s.*, u.username, u.display_name, u.avatar_url
       FROM stories s
       JOIN users u ON s.user_id = u.id
       WHERE (s.user_id = ? OR s.user_id IN (
         SELECT contact_user_id FROM contacts WHERE user_id = ? AND status = 'accepted'
       ))
       AND s.expires_at > NOW()
       ORDER BY s.created_at DESC`,
      [userId, userId]
    );

    const storiesWithDetails = await Promise.all(
      stories.map(async (s: any) => {
        const views = await query(
          'SELECT COUNT(*) as count FROM story_views WHERE story_id = ?',
          [s.id]
        );
        const isViewed = await query(
          'SELECT id FROM story_views WHERE story_id = ? AND viewer_id = ?',
          [s.id, userId]
        );
        const reactions = await query(
          `SELECT emoji, COUNT(*) as count
           FROM story_reactions
           WHERE story_id = ?
           GROUP BY emoji`,
          [s.id]
        );
        return {
          ...s,
          viewCount: views[0].count,
          isViewed: isViewed.length > 0,
          reactions,
        };
      })
    );

    res.json(storiesWithDetails);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Ошибка при получении ленты' });
  }
});

export default router;
