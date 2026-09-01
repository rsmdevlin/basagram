import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Add reaction
router.post('/:messageId/reactions', async (req: Request, res: Response) => {
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

    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: 'emoji не предоставлен' });
    }

    // Check if reaction already exists
    const existing = await query(
      'SELECT id FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
      [messageId, userId, emoji]
    );

    if (existing.length > 0) {
      // Remove reaction if already exists
      await execute(
        'DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
        [messageId, userId, emoji]
      );
      return res.json({ action: 'removed' });
    }

    // Add new reaction
    const reactionId = uuidv4();
    await execute(
      'INSERT INTO reactions (id, message_id, user_id, emoji) VALUES (?, ?, ?, ?)',
      [reactionId, messageId, userId, emoji]
    );

    res.status(201).json({ action: 'added', reactionId });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении реакции' });
  }
});

// Get reactions for message
router.get('/:messageId/reactions', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    const reactions = await query(
      `SELECT emoji, COUNT(*) as count, GROUP_CONCAT(DISTINCT user_id) as userIds
       FROM reactions
       WHERE message_id = ?
       GROUP BY emoji`,
      [messageId]
    );

    res.json(
      reactions.map((r: any) => ({
        emoji: r.emoji,
        count: r.count,
        userIds: r.userIds.split(','),
      }))
    );
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ error: 'Ошибка при получении реакций' });
  }
});

// Edit message
router.put('/:messageId', async (req: Request, res: Response) => {
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

    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content не предоставлен' });
    }

    // Verify ownership
    const messages = await query(
      'SELECT id FROM messages WHERE id = ? AND sender_id = ?',
      [messageId, userId]
    );

    if (messages.length === 0) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    await execute(
      'UPDATE messages SET content = ?, is_edited = TRUE, edited_at = NOW() WHERE id = ?',
      [content, messageId]
    );

    const updated = await query(
      'SELECT * FROM messages WHERE id = ?',
      [messageId]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Ошибка при редактировании сообщения' });
  }
});

// Delete message
router.delete('/:messageId', async (req: Request, res: Response) => {
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

    const { messageId } = req.params;

    // Verify ownership
    const messages = await query(
      'SELECT id FROM messages WHERE id = ? AND sender_id = ?',
      [messageId, userId]
    );

    if (messages.length === 0) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    await execute(
      'UPDATE messages SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ?',
      [messageId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Ошибка при удалении сообщения' });
  }
});

// Create reply
router.post('/:messageId/replies', async (req: Request, res: Response) => {
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

    const { messageId } = req.params;
    const { content, conversationId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content не предоставлен' });
    }

    // Create reply message with reply_to_id
    const replyId = uuidv4();
    await execute(
      `INSERT INTO messages
       (id, conversation_id, sender_id, content, reply_to_id, status)
       VALUES (?, ?, ?, ?, ?, 'sent')`,
      [replyId, conversationId, userId, content, messageId]
    );

    const reply = await query(
      'SELECT * FROM messages WHERE id = ?',
      [replyId]
    );

    res.status(201).json(reply[0]);
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ error: 'Ошибка при создании ответа' });
  }
});

// Get thread replies
router.get('/:messageId/thread', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    const replies = await query(
      `SELECT m.* FROM messages m
       WHERE m.reply_to_id = ? AND m.is_deleted = FALSE
       ORDER BY m.created_at ASC`,
      [messageId]
    );

    res.json(
      replies.map((r: any) => ({
        id: r.id,
        content: r.content,
        senderId: r.sender_id,
        status: r.status,
        createdAt: r.created_at,
        isEdited: r.is_edited,
      }))
    );
  } catch (error) {
    console.error('Get thread replies error:', error);
    res.status(500).json({ error: 'Ошибка при получении ответов' });
  }
});

router.post('/:messageId/pin', async (req: Request, res: Response) => {
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

    const { messageId } = req.params;

    // Verify the user can pin (is admin or sender)
    const messages = await query(
      `SELECT m.* FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE m.id = ? AND (m.sender_id = ? OR c.created_by_id = ?)`,
      [messageId, userId, userId]
    );

    if (messages.length === 0) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Check if already pinned
    const existing = await query(
      'SELECT id FROM pinned_messages WHERE message_id = ?',
      [messageId]
    );

    if (existing.length > 0) {
      // Unpin
      await execute('DELETE FROM pinned_messages WHERE message_id = ?', [
        messageId,
      ]);
      return res.json({ action: 'unpinned' });
    }

    // Pin
    await execute(
      'INSERT INTO pinned_messages (id, message_id) VALUES (?, ?)',
      [uuidv4(), messageId]
    );

    res.json({ action: 'pinned' });
  } catch (error) {
    console.error('Pin message error:', error);
    res.status(500).json({ error: 'Ошибка при закреплении сообщения' });
  }
});

// Forward message
router.post('/:messageId/forward', async (req: Request, res: Response) => {
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

    const { messageId } = req.params;
    const { targetConversationId, caption } = req.body;

    if (!targetConversationId) {
      return res.status(400).json({ error: 'targetConversationId не предоставлен' });
    }

    // Get original message
    const originalMessages = await query(
      'SELECT * FROM messages WHERE id = ? AND is_deleted = FALSE',
      [messageId]
    );

    if (originalMessages.length === 0) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }

    const original = originalMessages[0];

    // Create forwarded message
    const forwardedId = uuidv4();
    const forwardedContent = caption
      ? `${caption}\n\n> ${original.content}`
      : original.content;

    await execute(
      `INSERT INTO messages
       (id, conversation_id, sender_id, content, status)
       VALUES (?, ?, ?, ?, 'sent')`,
      [forwardedId, targetConversationId, userId, forwardedContent]
    );

    // Copy attachments if any
    const attachments = await query(
      'SELECT * FROM message_attachments WHERE message_id = ?',
      [messageId]
    );

    for (const attachment of attachments) {
      await execute(
        `INSERT INTO message_attachments
         (id, message_id, type, url, thumbnail, size, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          forwardedId,
          attachment.type,
          attachment.url,
          attachment.thumbnail,
          attachment.size,
          attachment.mime_type,
        ]
      );
    }

    const forwarded = await query(
      'SELECT * FROM messages WHERE id = ?',
      [forwardedId]
    );

    res.status(201).json({
      ...forwarded[0],
      attachments,
    });
  } catch (error) {
    console.error('Forward message error:', error);
    res.status(500).json({ error: 'Ошибка при пересылке сообщения' });
  }
});




export default router;
