import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  MONGO_URI: z.string().url(),
  PREFIX: z.string().default('.'),
  OWNER: z.string().min(1),
  PORT: z.string().transform(Number).default('3000'),
  BOT_NAME: z.string().default('Spectre'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const config = parsed.data;
