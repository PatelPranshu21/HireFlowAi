import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isPostgresAvailable = false;

// Initialize Postgres connection pool if DATABASE_URL is available
export function getPool(): pg.Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[PostgreSQL] DATABASE_URL not set. Running in fallback mode (In-Memory / File Store).');
    return null;
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Unexpected error on idle client:', err);
    });

    return pool;
  } catch (err) {
    console.error('[PostgreSQL] Failed to create connection pool:', err);
    return null;
  }
}

export async function initDb(): Promise<boolean> {
  const p = getPool();
  if (!p) {
    isPostgresAvailable = false;
    return false;
  }

  try {
    const client = await p.connect();
    try {
      // Create users table matching all specifications
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          password_hash VARCHAR(255),
          auth_provider VARCHAR(50) NOT NULL DEFAULT 'email',
          provider_id VARCHAR(255),
          onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
          onboarding_completed_at TIMESTAMP,
          profile_data JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_provider ON users(auth_provider, provider_id);
      `);
      isPostgresAvailable = true;
      console.log('[PostgreSQL] Database schema initialized successfully.');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[PostgreSQL] Database connection/initialization error:', err);
    isPostgresAvailable = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isPostgresAvailable;
}

export interface DbUserRecord {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  password_hash: string | null;
  auth_provider: string;
  provider_id: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: Date | string | null;
  profile_data: any;
  created_at: Date | string;
  updated_at: Date | string;
}

export async function dbFindUserByEmail(email: string): Promise<DbUserRecord | null> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;

  try {
    const cleanEmail = email.trim().toLowerCase();
    const res = await p.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
    if (res.rows.length === 0) return null;
    return res.rows[0] as DbUserRecord;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbFindUserByEmail:', err);
    return null;
  }
}

export async function dbFindUserById(id: string): Promise<DbUserRecord | null> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;

  try {
    const res = await p.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0] as DbUserRecord;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbFindUserById:', err);
    return null;
  }
}

export async function dbFindUserByProvider(provider: string, providerId: string): Promise<DbUserRecord | null> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;

  try {
    const res = await p.query(
      'SELECT * FROM users WHERE auth_provider = $1 AND provider_id = $2 LIMIT 1',
      [provider, providerId]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0] as DbUserRecord;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbFindUserByProvider:', err);
    return null;
  }
}

export async function dbCreateUser(data: {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  password_hash?: string | null;
  auth_provider: string;
  provider_id?: string | null;
  onboarding_completed?: boolean;
  profile_data?: any;
}): Promise<DbUserRecord | null> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;

  try {
    const cleanEmail = data.email.trim().toLowerCase();
    const now = new Date();
    const res = await p.query(
      `INSERT INTO users (
        id, email, first_name, last_name, password_hash, auth_provider, provider_id, onboarding_completed, profile_data, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.id,
        cleanEmail,
        data.first_name || null,
        data.last_name || null,
        data.password_hash || null,
        data.auth_provider || 'email',
        data.provider_id || null,
        data.onboarding_completed || false,
        JSON.stringify(data.profile_data || {}),
        now,
        now
      ]
    );
    return res.rows[0] as DbUserRecord;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbCreateUser:', err);
    return null;
  }
}

export async function dbUpdateUserProfile(
  id: string,
  profileData: any,
  additionalUpdates?: {
    first_name?: string;
    last_name?: string;
    onboarding_completed?: boolean;
    auth_provider?: string;
    provider_id?: string;
  }
): Promise<DbUserRecord | null> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;

  try {
    const now = new Date();
    const existing = await dbFindUserById(id);
    if (!existing) return null;

    const mergedProfile = {
      ...(existing.profile_data || {}),
      ...profileData
    };

    const onboardingCompleted =
      additionalUpdates?.onboarding_completed !== undefined
        ? additionalUpdates.onboarding_completed
        : existing.onboarding_completed;

    const onboardingCompletedAt = onboardingCompleted
      ? existing.onboarding_completed_at || now
      : existing.onboarding_completed_at;

    let extractedFirstName = additionalUpdates?.first_name;
    let extractedLastName = additionalUpdates?.last_name;

    if (!extractedFirstName && profileData?.name && profileData.name !== 'Candidate') {
      const parts = profileData.name.trim().split(' ');
      extractedFirstName = parts[0];
      if (parts.length > 1) {
        extractedLastName = parts.slice(1).join(' ');
      }
    }

    const firstName = extractedFirstName || existing.first_name;
    const lastName = extractedLastName || existing.last_name;
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();

    if (fullName) {
      mergedProfile.name = fullName;
    }
    mergedProfile.hasCompletedOnboarding = onboardingCompleted;
    const authProvider = additionalUpdates?.auth_provider || existing.auth_provider;
    const providerId = additionalUpdates?.provider_id || existing.provider_id;

    const res = await p.query(
      `UPDATE users 
       SET profile_data = $1,
           first_name = $2,
           last_name = $3,
           onboarding_completed = $4,
           onboarding_completed_at = $5,
           auth_provider = $6,
           provider_id = $7,
           updated_at = $8
       WHERE id = $9
       RETURNING *`,
      [
        JSON.stringify(mergedProfile),
        firstName,
        lastName,
        onboardingCompleted,
        onboardingCompletedAt,
        authProvider,
        providerId,
        now,
        id
      ]
    );

    return res.rows[0] as DbUserRecord;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbUpdateUserProfile:', err);
    return null;
  }
}
