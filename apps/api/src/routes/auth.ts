import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import { registerSchema, loginSchema } from '@basagram/validation';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const REFRESH_SECRET = process.env.SESSION_SECRET || 'dev-refresh-secret';

interface UserRow {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  is_online: boolean;
  last_seen?: Date;
  created_at: Date;
  updated_at: Date;
}

// DB Connection Pool
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
    console.log(`[Auth DB] Connecting to ${config.host}:${config.port}/${config.database}`);

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

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Ошибка валидации', details: parsed.error });
    }

    const { username, email, password, displayName } = parsed.data;

    // Check if user exists
    const existing = await dbQuery<UserRow>(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Пользователь уже существует' });
    }

    // Hash password
    const passwordHash = await argon2.hash(password);
    const userId = uuidv4();

    // Create user
    await dbExecute(
      `INSERT INTO users (id, username, display_name, email, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, username, displayName, email, passwordHash]
    );

    // Create tokens
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      user: {
        id: userId,
        username,
        displayName,
        email,
        isOnline: true,
        createdAt: new Date(),
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Ошибка валидации' });
    }

    const { email, password } = parsed.data;

    // Find user
    const users = await dbQuery<UserRow>(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const user = users[0];

    // Verify password
    const isValid = await argon2.verify(user.password_hash as any, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Create tokens
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '30d' });

    // Get full user info
    const fullUsers = await dbQuery<UserRow>(
      'SELECT * FROM users WHERE id = ?',
      [user.id]
    );

    if (fullUsers.length === 0) {
      return res.status(500).json({ error: 'Ошибка при получении пользователя' });
    }

    const fullUser = fullUsers[0];

    res.json({
      user: {
        id: fullUser.id,
        username: fullUser.username,
        displayName: fullUser.display_name,
        email: fullUser.email,
        avatar: fullUser.avatar_url,
        bio: fullUser.bio,
        isOnline: fullUser.is_online,
        createdAt: fullUser.created_at,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token не предоставлен' });
    }

    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { userId: string };
      const token = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ token });
    } catch (error) {
      return res.status(401).json({ error: 'Невалидный refresh token' });
    }
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении токена' });
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const users = await dbQuery<UserRow>(
      'SELECT * FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      avatar: user.avatar_url,
      bio: user.bio,
      isOnline: user.is_online,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({ error: 'Неверный токен' });
  }
});

// Logout
router.post('/logout', async (req: Request, res: Response) => {
  // Client-side logout - just remove token from localStorage
  res.json({ message: 'Логаут успешен' });
});

export default router;
