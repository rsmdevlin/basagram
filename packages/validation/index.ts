export const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePassword = (password: string) => password.length >= 8;

const createSchema = () => ({
  parse: (data: any) => data,
  safeParse: (data: any) => ({
    success: true,
    data,
    error: {
      errors: [] as Array<{ path: (string | number)[]; message: string }>
    }
  }),
});

export const registerSchema = createSchema();
export const loginSchema = createSchema();
export const updateProfileSchema = createSchema();

export default {};
