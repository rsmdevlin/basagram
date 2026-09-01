import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Create group
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

    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name не предоставлено' });
    }

    // Create conversation
    const conversationId = uuidv4();
    await execute(
      `INSERT INTO conversations
       (id, name, type, created_by_id)
       VALUES (?, ?, 'group', ?)`,
      [conversationId, name, userId]
    );

    // Add creator as admin
    await execute(
      `INSERT INTO conversation_members
       (id, conversation_id, user_id, role)
       VALUES (?, ?, ?, 'admin')`,
      [uuidv4(), conversationId, userId]
    );

    // Add other members as regular members
    if (members && Array.isArray(members)) {
      for (const memberId of members) {
        if (memberId !== userId) {
          await execute(
            `INSERT INTO conversation_members
             (id, conversation_id, user_id, role)
             VALUES (?, ?, ?, 'member')`,
            [uuidv4(), conversationId, memberId]
          );
        }
      }
    }

    // Get full group data
    const group = await query(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );

    const groupMembers = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, cm.role
       FROM conversation_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.conversation_id = ?
       ORDER BY cm.role DESC, u.display_name ASC`,
      [conversationId]
    );

    res.status(201).json({
      id: group[0].id,
      name: group[0].name,
      type: 'group',
      members: groupMembers,
      createdBy: userId,
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Ошибка при создании группы' });
  }
});

// Get group details
router.get('/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const groups = await query(
      'SELECT * FROM conversations WHERE id = ? AND type = ?',
      [conversationId, 'group']
    );

    if (groups.length === 0) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    const members = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_online,
              cm.role, cm.muted_until, cm.joined_at
       FROM conversation_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.conversation_id = ?
       ORDER BY cm.role DESC, u.display_name ASC`,
      [conversationId]
    );

    res.json({
      ...groups[0],
      members,
      memberCount: members.length,
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Ошибка при получении группы' });
  }
});

// Update group info (admin only)
router.put('/:conversationId', async (req: Request, res: Response) => {
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

    const { conversationId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name не предоставлено' });
    }

    // Check if user is admin
    const admin = await query(
      `SELECT role FROM conversation_members
       WHERE conversation_id = ? AND user_id = ? AND role = 'admin'`,
      [conversationId, userId]
    );

    if (admin.length === 0) {
      return res.status(403).json({ error: 'Только администратор может редактировать группу' });
    }

    await execute(
      'UPDATE conversations SET name = ? WHERE id = ?',
      [name, conversationId]
    );

    const updated = await query(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении группы' });
  }
});

// Add member to group
router.post('/:conversationId/members', async (req: Request, res: Response) => {
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

    const { conversationId } = req.params;
    const { userId: newMemberId } = req.body;

    if (!newMemberId) {
      return res.status(400).json({ error: 'userId не предоставлен' });
    }

    // Check if requester is admin
    const admin = await query(
      `SELECT role FROM conversation_members
       WHERE conversation_id = ? AND user_id = ? AND role IN ('admin', 'moderator')`,
      [conversationId, userId]
    );

    if (admin.length === 0) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Check if user already in group
    const existing = await query(
      'SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [conversationId, newMemberId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже в группе' });
    }

    // Add member
    await execute(
      `INSERT INTO conversation_members
       (id, conversation_id, user_id, role)
       VALUES (?, ?, ?, 'member')`,
      [uuidv4(), conversationId, newMemberId]
    );

    const member = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url
       FROM users u WHERE u.id = ?`,
      [newMemberId]
    );

    res.status(201).json(member[0]);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении участника' });
  }
});

// Remove member from group
router.delete('/:conversationId/members/:memberId', async (req: Request, res: Response) => {
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

    const { conversationId, memberId } = req.params;

    // Check if requester is admin or removing themselves
    if (userId !== memberId) {
      const admin = await query(
        `SELECT role FROM conversation_members
         WHERE conversation_id = ? AND user_id = ? AND role IN ('admin', 'moderator')`,
        [conversationId, userId]
      );

      if (admin.length === 0) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
    }

    await execute(
      'DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [conversationId, memberId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Ошибка при удалении участника' });
  }
});

// Change member role (admin only)
router.put('/:conversationId/members/:memberId/role', async (req: Request, res: Response) => {
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

    const { conversationId, memberId } = req.params;
    const { role } = req.body;

    if (!['member', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Неверная роль' });
    }

    // Check if requester is admin
    const admin = await query(
      `SELECT role FROM conversation_members
       WHERE conversation_id = ? AND user_id = ? AND role = 'admin'`,
      [conversationId, userId]
    );

    if (admin.length === 0) {
      return res.status(403).json({ error: 'Только администратор может менять роли' });
    }

    await execute(
      'UPDATE conversation_members SET role = ? WHERE conversation_id = ? AND user_id = ?',
      [role, conversationId, memberId]
    );

    res.json({ success: true, role });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ error: 'Ошибка при изменении роли' });
  }
});

// Mute/unmute group for user
router.post('/:conversationId/mute', async (req: Request, res: Response) => {
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

    const { conversationId } = req.params;
    const { muteUntil } = req.body;

    const mutedUntil = muteUntil
      ? new Date(muteUntil).toISOString().slice(0, 19).replace('T', ' ')
      : null;

    await execute(
      'UPDATE conversation_members SET muted_until = ? WHERE conversation_id = ? AND user_id = ?',
      [mutedUntil, conversationId, userId]
    );

    res.json({ success: true, mutedUntil });
  } catch (error) {
    console.error('Mute group error:', error);
    res.status(500).json({ error: 'Ошибка при отключении уведомлений' });
  }
});

export default router;
