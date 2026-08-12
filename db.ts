import { getPool, initDb } from './src/db/postgres';

export const pool = {
  query: (text: string, params?: any[]) => {
    const p = getPool();
    if (!p) throw new Error('[PostgreSQL] Database pool not initialized');
    return p.query(text, params);
  },
  connect: async () => {
    const p = getPool();
    if (!p) throw new Error('[PostgreSQL] Database pool not initialized');
    return p.connect();
  }
};

export async function initDatabase() {
  return await initDb();
}

