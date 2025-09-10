import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/database.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL
  },
  out: './drizzle'
});