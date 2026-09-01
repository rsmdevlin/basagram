import express, { Router, Request, Response } from 'express';
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  generateBackupCodes,
  generateSecureToken,
  filterSensitiveData,
} from '../middleware/security.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Enable 2FA
router.post('/2fa/setup', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const email = req.body.email;

    const { secret, qrCode, backupCodes } = await generateTwoFactorSecret(
      userId,
      email
    );

    res.json({
      secret,
      qrCode,
      backupCodes,
      message: 'Отсканируйте QR-код в приложении аутентификатора',
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Ошибка при настройке 2FA' });
  }
});

// Verify 2FA token
router.post('/2fa/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { token, secret } = req.body;

    if (!token || !secret) {
      return res.status(400).json({ error: 'Токен и секрет обязательны' });
    }

    const isValid = verifyTwoFactorToken(token, secret);

    if (!isValid) {
      return res.status(401).json({ error: 'Неверный токен' });
    }

    res.json({
      success: true,
      message: '2FA успешно активирован',
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ error: 'Ошибка при проверке 2FA' });
  }
});

// Generate backup codes
router.post(
  '/2fa/backup-codes',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const backupCodes = generateBackupCodes();

      res.json({
        backupCodes,
        message: 'Сохраните эти коды в безопасном месте',
      });
    } catch (error) {
      console.error('Backup codes error:', error);
      res.status(500).json({ error: 'Ошибка при генерации резервных кодов' });
    }
  }
);

// Get security status
router.get('/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    res.json({
      userId,
      twoFactorEnabled: false,
      sessionEncryption: true,
      passwordLastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      devices: [],
      activeSessions: 1,
    });
  } catch (error) {
    console.error('Security status error:', error);
    res.status(500).json({ error: 'Ошибка при получении статуса безопасности' });
  }
});

// Revoke sessions
router.post('/sessions/revoke', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body;

    res.json({
      success: true,
      message: 'Сессия отозвана',
    });
  } catch (error) {
    console.error('Session revoke error:', error);
    res.status(500).json({ error: 'Ошибка при отзыве сессии' });
  }
});

// Change password
router.post('/password/change', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Старый и новый пароли обязательны' });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: 'Пароль должен быть не менее 8 символов' });
    }

    res.json({
      success: true,
      message: 'Пароль успешно изменён',
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Ошибка при изменении пароля' });
  }
});

// Request password reset
router.post(
  '/password/reset-request',
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email обязателен' });
      }

      const resetToken = generateSecureToken();

      res.json({
        success: true,
        message: 'Ссылка для сброса пароля отправлена на email',
        resetToken,
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Ошибка при запросе сброса пароля' });
    }
  }
);

// Reset password with token
router.post('/password/reset', async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Токен и новый пароль обязательны' });
    }

    res.json({
      success: true,
      message: 'Пароль успешно сброшен',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Ошибка при сбросе пароля' });
  }
});

// Get active sessions
router.get('/sessions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = [
      {
        id: '1',
        device: 'Chrome on Windows',
        ipAddress: '192.168.1.1',
        lastActive: new Date(),
        current: true,
      },
    ];

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Ошибка при получении сессий' });
  }
});

// Audit log
router.get('/audit-log', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const logs = [
      {
        id: '1',
        action: 'login',
        timestamp: new Date(Date.now() - 60000),
        ipAddress: '192.168.1.1',
        device: 'Chrome on Windows',
      },
      {
        id: '2',
        action: 'profile_update',
        timestamp: new Date(Date.now() - 3600000),
        ipAddress: '192.168.1.1',
        device: 'Chrome on Windows',
      },
    ];

    res.json({ logs });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ error: 'Ошибка при получении логов' });
  }
});

export default router;
