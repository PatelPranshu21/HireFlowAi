import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

export async function initDatabase() {
  if (!process.env.DATABASE_URL && !process.env.PGHOST) {
    console.log('[PostgreSQL] Database connection parameters not set. Skipping DB table creation.');
    return;
  }
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255),
          avatar VARCHAR(512),
          auth_provider VARCHAR(50) DEFAULT 'email',
          google_id VARCHAR(255) UNIQUE,
          linkedin_id VARCHAR(255) UNIQUE,
          title VARCHAR(255),
          experience_level VARCHAR(100),
          phone VARCHAR(50),
          target_role VARCHAR(255),
          onboarding_completed BOOLEAN DEFAULT FALSE,
          has_selected_plan BOOLEAN DEFAULT FALSE,
          subscription_status VARCHAR(50) DEFAULT 'none',
          subscription_plan VARCHAR(50) DEFAULT 'None',
          tier VARCHAR(50) DEFAULT 'Free',
          trial_start_date TIMESTAMPTZ,
          trial_expiry_date TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS user_onboarding (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          skills TEXT[] DEFAULT '{}',
          technologies TEXT[] DEFAULT '{}',
          preferred_roles TEXT[] DEFAULT '{}',
          preferred_companies TEXT[] DEFAULT '{}',
          preferred_cities TEXT[] DEFAULT '{}',
          preferred_industries TEXT[] DEFAULT '{}',
          remote_preference VARCHAR(50) DEFAULT 'Remote',
          expected_salary_min INTEGER DEFAULT 0,
          expected_salary_max INTEGER DEFAULT 0,
          target_industry VARCHAR(255),
          resume_uploaded BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log('Database tables initialized successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn('[PostgreSQL] Database not connected — running with in-memory fallback:', error);
  }
}
