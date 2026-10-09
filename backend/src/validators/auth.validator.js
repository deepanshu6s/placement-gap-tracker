const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const refreshSchema = z.object({
  refreshToken: z.string()
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema
};
