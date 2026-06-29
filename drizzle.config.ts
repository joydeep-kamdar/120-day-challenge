import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'

// Load .env.local for drizzle-kit (Next.js doesn't load this for CLI tools)
config({ path: '.env.local' })

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
} satisfies Config
