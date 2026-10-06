const dotenv = require('dotenv');
const { z } = require('zod');

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_NAME: z.string().default('placement_tracker'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres_password_dev'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Critical Environment Validation Error:');
  console.error(parsedEnv.error.format());
  throw new Error('Invalid application environment configuration.');
}

module.exports = parsedEnv.data;
