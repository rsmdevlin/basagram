export const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePassword = (password: string) => password.length >= 8;

export const registerSchema = { parse: (data: any) => data };
export const loginSchema = { parse: (data: any) => data };
export const updateProfileSchema = { parse: (data: any) => data };

export default {};
