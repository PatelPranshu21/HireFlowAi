import { getPool, initDb } from './src/db/postgres';

export const pool = {
  query: async (text: string, params?: any[]) => {
    const p = getPool();
    if (!p) return { rows: [], rowCount: 0 };
    return p.query(text, params);
  },
  connect: async () => {
    const p = getPool();
    if (!p) {
      return {
        query: async () => ({ rows: [], rowCount: 0 }),
        release: () => {}
      } as any;
    }
    return p.connect();
  }
};

export async function initDatabase() {
  return await initDb();
}

