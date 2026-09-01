import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Имя пользователя минимум 3 символа').max(30),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен быть минимум 8 символов'),
  displayName: z.string().min(1, 'Введите ваше имя').max(100),
});

// Message schemas
export const messageSchema = z.object({
  content: z.string().min(1, 'Сообщение не может быть пустым').max(5000),
  replyToId: z.string().optional(),
});

// Profile schemas
export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

// Conversation schemas
export const createConversationSchema = z.object({
  name: z.string().optional(),
  memberIds: z.array(z.string()).min(1),
  type: z.enum(['private', 'group']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
