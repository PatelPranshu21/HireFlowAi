import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isPostgresAvailable = false;

// Initialize Postgres connection pool if DATABASE_URL or host is available
export function getPool(): pg.Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  const host = process.env.PGHOST || process.env.SQL_HOST;
  const user = process.env.PGUSER || process.env.SQL_USER;
  const password = process.env.PGPASSWORD || process.env.SQL_PASSWORD;
  const database = process.env.PGDATABASE || process.env.SQL_DB_NAME;
  const port = process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432;

  if (!connectionString && !host) {
    console.log('[PostgreSQL] No database connection configuration found (DATABASE_URL / PGHOST / SQL_HOST not set).');
    return null;
  }

  try {
    if (connectionString) {
      pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    } else {
      pool = new Pool({
        host,
        user,
        password,
        database,
        port,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Unexpected error on idle client:', err);
    });

    isPostgresAvailable = true;
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
      // 1. Ensure primary 'users' table exists without touching existing data
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          name VARCHAR(255),
          password_hash VARCHAR(255),
          auth_provider VARCHAR(50) NOT NULL DEFAULT 'email',
          provider_id VARCHAR(255),
          google_id VARCHAR(255),
          linkedin_id VARCHAR(255),
          title VARCHAR(255),
          experience_level VARCHAR(100),
          phone VARCHAR(50),
          target_role VARCHAR(255),
          onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
          onboarding_completed_at TIMESTAMPTZ,
          has_selected_plan BOOLEAN DEFAULT FALSE,
          subscription_status VARCHAR(50) DEFAULT 'none',
          subscription_plan VARCHAR(50) DEFAULT 'None',
          tier VARCHAR(50) DEFAULT 'Free',
          trial_start_date TIMESTAMPTZ,
          trial_expiry_date TIMESTAMPTZ,
          profile_data JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_id VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_level VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS target_role VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS has_selected_plan BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'none';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'None';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'Free';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_expiry_date TIMESTAMPTZ;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_data JSONB;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
        ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
      `);

      // 2. Determine actual data type of users.id to prevent FK type mismatch
      const typeRes = await client.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id'
      `);
      let fkType = 'VARCHAR(255)';
      if (typeRes.rows.length > 0 && typeRes.rows[0].data_type === 'uuid') {
        fkType = 'UUID';
      }

      // 3. Create all 9 additional persistent tables referencing users(id) ON DELETE CASCADE
      await client.query(`
        -- Table 2: user_usage
        CREATE TABLE IF NOT EXISTS user_usage (
          id VARCHAR(255) PRIMARY KEY,
          user_id ${fkType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          feature_key VARCHAR(100) NOT NULL,
          used_count INT DEFAULT 0,
          max_limit INT DEFAULT 3,
          reset_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT user_usage_user_feature_key UNIQUE(user_id, feature_key)
        );

        -- Table 3: resumes
        CREATE TABLE IF NOT EXISTS resumes (
          id VARCHAR(255) PRIMARY KEY,
          user_id ${fkType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          file_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(100),
          file_size VARCHAR(100),
          file_url TEXT,
          resume_text TEXT NOT NULL,
          parsed_data JSONB,
          is_primary BOOLEAN DEFAULT TRUE,
          ats_score INT DEFAULT 0,
          version_name VARCHAR(255),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Table 4: resume_versions
        CREATE TABLE IF NOT EXISTS resume_versions (
          id VARCHAR(255) PRIMARY KEY,
          resume_id VARCHAR(255) REFERENCES resumes(id) ON DELETE CASCADE,
          user_id ${fkType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          version_name VARCHAR(255) NOT NULL,
          version_number INT DEFAULT 1,
          resume_text TEXT NOT NULL,
          parsed_data JSONB,
          score INT DEFAULT 0,
          template VARCHAR(100) DEFAULT 'modern_tech',
          jobs_matched_count INT DEFAULT 0,
          file_name VARCHAR(255),
          uploaded_at VARCHAR(100),
          file_size VARCHAR(100),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Table 5: ats_reports
        CREATE TABLE IF NOT EXISTS ats_reports (
          id VARCHAR(255) PRIMARY KEY,
          user_id ${fkType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          resume_id VARCHAR(255) REFERENCES resumes(id) ON DELETE CASCADE,
          target_role VARCHAR(255),
          overall_score INT DEFAULT 0,
          formatting_score INT DEFAULT 0,
          summary TEXT,
          keywords JSONB,
          impact_points JSONB,
          grammar_issues JSONB,
          analysis_data JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Table 6: user_job_applications
        CREATE TABLE IF NOT EXISTS user_job_applications (
          id VARCHAR(255) PRIMARY KEY,
          user_id ${fkType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          job_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          company VARCHAR(255) NOT NULL,
          company_logo TEXT,
          location VARCHAR(255),
          salary VARCHAR(255),
          status VARCHAR(100) DEFAULT 'applied',
          stage VARCHAR(100) DEFAULT 'Applied',
          applied_date VARCHAR(100),
          notes TEXT,
          match_score INT DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Table 7: user_saved_jobs
        CREATE TABLE IF NOT EXISTS user_saved_jobs (
          id VARCHAR(255) PRIMARY KEY,
          user_id ${fkType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          job_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT user_saved_jobs_user_job_key UNIQUE(user_id, job_id)
        );

        -- Table 8: user_interview_sessions
        CREATE TABLE IF NOT EXISTS user_interview_sessions (
          id VARCHAR(255) PRIMARY KEY,
          user_id ${fkType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          topic VARCHAR(255) NOT NULL,
          role VARCHAR(255),
          company VARCHAR(255),
          score INT DEFAULT 0,
          question TEXT,
          answer TEXT,
          star_breakdown JSONB,
          strengths JSONB,
          areas_to_improve JSONB,
          polished_answer TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Table 9: user_calendar_events
        CREATE TABLE IF NOT EXISTS user_calendar_events (
          id VARCHAR(255) PRIMARY KEY,
          user_id ${fkType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          job_id VARCHAR(255),
          event_date VARCHAR(100) NOT NULL,
          event_time VARCHAR(100),
          event_type VARCHAR(100) NOT NULL,
          description TEXT,
          completed BOOLEAN DEFAULT FALSE,
          priority VARCHAR(50) DEFAULT 'medium',
          color_tag VARCHAR(50),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Table 10: user_productivity_data
        CREATE TABLE IF NOT EXISTS user_productivity_data (
          id SERIAL PRIMARY KEY,
          user_id ${fkType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          data_key VARCHAR(100) NOT NULL,
          data_value JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT user_productivity_data_user_key UNIQUE(user_id, data_key)
        );

        -- Table 11: jobs (Real global jobs catalog)
        CREATE TABLE IF NOT EXISTS jobs (
          id VARCHAR(255) PRIMARY KEY,
          external_job_id VARCHAR(255),
          source VARCHAR(100) NOT NULL DEFAULT 'hireflow_ingest',
          company VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL DEFAULT 'India',
          description TEXT NOT NULL,
          url TEXT NOT NULL,
          posted_at VARCHAR(100),
          employment_type VARCHAR(100) DEFAULT 'Full-time',
          experience_required VARCHAR(100) DEFAULT '2+ Years',
          salary VARCHAR(255) DEFAULT 'Competitive',
          skills JSONB NOT NULL DEFAULT '[]',
          tags JSONB NOT NULL DEFAULT '[]',
          responsibilities JSONB DEFAULT '[]',
          requirements JSONB DEFAULT '[]',
          company_logo TEXT,
          company_website TEXT,
          industry VARCHAR(100),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Table 12: job_matches (strictly linked to exact resume_version_id)
        CREATE TABLE IF NOT EXISTS job_matches (
          id VARCHAR(255) PRIMARY KEY,
          user_id ${fkType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          resume_version_id VARCHAR(255) NOT NULL REFERENCES resume_versions(id) ON DELETE CASCADE,
          job_id VARCHAR(255) NOT NULL,
          match_score INT NOT NULL DEFAULT 0,
          similarity_score INT NOT NULL DEFAULT 0,
          skill_match_score INT NOT NULL DEFAULT 0,
          matched_skills JSONB NOT NULL DEFAULT '[]',
          missing_skills JSONB NOT NULL DEFAULT '[]',
          preferred_skills JSONB NOT NULL DEFAULT '[]',
          why_match TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT job_matches_user_version_job UNIQUE(user_id, resume_version_id, job_id)
        );

        -- INDEXES FOR ALL TABLES
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_provider ON users(auth_provider, provider_id);
        CREATE INDEX IF NOT EXISTS idx_user_usage_user ON user_usage(user_id);
        CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);
        CREATE INDEX IF NOT EXISTS idx_resume_versions_user ON resume_versions(user_id);
        CREATE INDEX IF NOT EXISTS idx_ats_reports_user ON ats_reports(user_id);
        CREATE INDEX IF NOT EXISTS idx_job_apps_user ON user_job_applications(user_id);
        CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON user_saved_jobs(user_id);
        CREATE INDEX IF NOT EXISTS idx_interviews_user ON user_interview_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_calendar_user ON user_calendar_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_productivity_user_key ON user_productivity_data(user_id, data_key);
        CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
        CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
        CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);
        CREATE INDEX IF NOT EXISTS idx_job_matches_user_version ON job_matches(user_id, resume_version_id);

        -- Add analysis_data column to resume_versions if missing
        ALTER TABLE resume_versions ADD COLUMN IF NOT EXISTS analysis_data JSONB;
      `);
      isPostgresAvailable = true;
      console.log('[PostgreSQL] All 11 persistent database tables initialized successfully.');
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

export function sanitizePgString(str: any): string {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') {
    str = String(str);
  }
  return str
    .replace(/\u0000/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\\u0000/g, '');
}

export function sanitizePgJson<T = any>(obj: T): T {
  if (obj === null || obj === undefined) {
    return {} as T;
  }

  if (typeof obj === 'string') {
    if (obj.startsWith('PK\x03\x04') || obj.startsWith('%PDF-') || obj.startsWith('PK\u0003\u0004')) {
      return '' as unknown as T;
    }
    return sanitizePgString(obj) as unknown as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Buffer.isBuffer(obj) || obj instanceof Uint8Array || obj instanceof ArrayBuffer) {
    return {} as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizePgJson(item)) as unknown as T;
  }

  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val && (Buffer.isBuffer(val) || val instanceof Uint8Array || val instanceof ArrayBuffer)) {
      continue;
    }

    if (key === 'content' || key === 'resumeText' || key === 'fileText') {
      if (typeof val === 'string' && (val.startsWith('PK\x03\x04') || val.startsWith('%PDF-') || val.startsWith('PK\u0003\u0004'))) {
        continue;
      }
    }

    if (typeof val === 'string') {
      cleaned[key] = sanitizePgString(val);
    } else {
      cleaned[key] = sanitizePgJson(val);
    }
  }

  return cleaned as T;
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
    const cleanEmail = sanitizePgString(data.email.trim().toLowerCase());
    const now = new Date();
    const cleanProfile = sanitizePgJson(data.profile_data || {});

    const res = await p.query(
      `INSERT INTO users (
        id, email, first_name, last_name, password_hash, auth_provider, provider_id, onboarding_completed, profile_data, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.id,
        cleanEmail,
        data.first_name ? sanitizePgString(data.first_name) : null,
        data.last_name ? sanitizePgString(data.last_name) : null,
        data.password_hash || null,
        data.auth_provider || 'email',
        data.provider_id || null,
        data.onboarding_completed || false,
        JSON.stringify(cleanProfile),
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
      ...(profileData || {})
    };

    // Remove raw binary string/buffer entries from profile data
    delete mergedProfile.content;
    if (mergedProfile.resumeVersions && Array.isArray(mergedProfile.resumeVersions)) {
      mergedProfile.resumeVersions = mergedProfile.resumeVersions.map((v: any) => {
        const copy = { ...v };
        if (typeof copy.content === 'string' && (copy.content.startsWith('PK\x03\x04') || copy.content.startsWith('%PDF-') || copy.content.startsWith('PK\u0003\u0004'))) {
          delete copy.content;
        }
        if (typeof copy.resumeText === 'string' && (copy.resumeText.startsWith('PK\x03\x04') || copy.resumeText.startsWith('%PDF-') || copy.resumeText.startsWith('PK\u0003\u0004'))) {
          delete copy.resumeText;
        }
        return sanitizePgJson(copy);
      });
    }

    if (typeof mergedProfile.resumeText === 'string' && (mergedProfile.resumeText.startsWith('PK\x03\x04') || mergedProfile.resumeText.startsWith('%PDF-') || mergedProfile.resumeText.startsWith('PK\u0003\u0004'))) {
      delete mergedProfile.resumeText;
    }

    const cleanMergedProfile = sanitizePgJson(mergedProfile);

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

    const firstName = sanitizePgString(extractedFirstName || existing.first_name || '');
    const lastName = sanitizePgString(extractedLastName || existing.last_name || '');
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      cleanMergedProfile.name = fullName;
    }
    cleanMergedProfile.hasCompletedOnboarding = onboardingCompleted;
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
        JSON.stringify(cleanMergedProfile),
        firstName || null,
        lastName || null,
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

// --- RESUMES & RESUME VERSIONS ---

export async function dbSaveResume(userId: string, resume: {
  id?: string;
  file_name: string;
  file_type?: string;
  file_size?: string;
  file_url?: string;
  resume_text: string;
  parsed_data?: any;
  is_primary?: boolean;
  ats_score?: number;
  version_name?: string;
}): Promise<any> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;
  try {
    const id = resume.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanText = sanitizePgString(resume.resume_text || '');
    const cleanParsed = sanitizePgJson(resume.parsed_data || {});
    const cleanFileName = sanitizePgString(resume.file_name || 'Resume.pdf');
    const cleanVersionName = sanitizePgString(resume.version_name || cleanFileName);

    const res = await p.query(
      `INSERT INTO resumes (id, user_id, file_name, file_type, file_size, file_url, resume_text, parsed_data, is_primary, ats_score, version_name, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       ON CONFLICT (id) DO UPDATE SET
         file_name = EXCLUDED.file_name,
         file_type = EXCLUDED.file_type,
         file_size = EXCLUDED.file_size,
         resume_text = EXCLUDED.resume_text,
         parsed_data = EXCLUDED.parsed_data,
         is_primary = EXCLUDED.is_primary,
         ats_score = EXCLUDED.ats_score,
         version_name = EXCLUDED.version_name,
         updated_at = NOW()
       RETURNING *`,
      [
        id,
        userId,
        cleanFileName,
        resume.file_type || 'PDF',
        resume.file_size || '180 KB',
        resume.file_url || null,
        cleanText,
        JSON.stringify(cleanParsed),
        resume.is_primary !== undefined ? resume.is_primary : true,
        resume.ats_score || 0,
        cleanVersionName
      ]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[PostgreSQL] Error in dbSaveResume:', err);
    return null;
  }
}

export async function dbGetUserResumes(userId: string): Promise<any[]> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return [];
  try {
    const res = await p.query(`SELECT * FROM resumes WHERE user_id = $1 ORDER BY updated_at DESC`, [userId]);
    return res.rows;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetUserResumes:', err);
    return [];
  }
}

export async function dbSaveResumeVersion(userId: string, version: {
  id?: string;
  resume_id?: string;
  version_name: string;
  version_number?: number;
  resume_text: string;
  parsed_data?: any;
  score?: number;
  template?: string;
  jobs_matched_count?: number;
  file_name?: string;
  uploaded_at?: string;
  file_size?: string;
  analysis_data?: any;
}): Promise<any> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;
  try {
    const id = version.id || `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanText = sanitizePgString(version.resume_text || '');
    const cleanParsed = sanitizePgJson(version.parsed_data || {});
    const cleanVersionName = sanitizePgString(version.version_name || 'Resume Version');
    const cleanFileName = sanitizePgString(version.file_name || cleanVersionName);
    const cleanAnalysis = version.analysis_data ? sanitizePgJson(version.analysis_data) : null;

    let resumeId = version.resume_id || null;
    if (!resumeId) {
      const existingParent = await p.query(`SELECT id FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [userId]);
      if (existingParent.rows.length > 0) {
        resumeId = existingParent.rows[0].id;
      } else {
        const newParent = await dbSaveResume(userId, {
          file_name: cleanFileName,
          resume_text: cleanText,
          parsed_data: cleanParsed,
          ats_score: version.score || 0,
          version_name: cleanVersionName
        });
        resumeId = newParent?.id || null;
      }
    }

    console.log(`[RESUME CREATE] userId=${userId} filename=${cleanFileName} resumeVersionId=${id}`);

    const res = await p.query(
      `INSERT INTO resume_versions (
        id, resume_id, user_id, version_name, version_number, resume_text, parsed_data, score, template, jobs_matched_count, file_name, uploaded_at, file_size, analysis_data, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (id) DO UPDATE SET
        version_name = EXCLUDED.version_name,
        resume_text = EXCLUDED.resume_text,
        parsed_data = EXCLUDED.parsed_data,
        score = EXCLUDED.score,
        template = EXCLUDED.template,
        analysis_data = EXCLUDED.analysis_data,
        updated_at = NOW()
      RETURNING *`,
      [
        id,
        resumeId,
        userId,
        cleanVersionName,
        version.version_number || 1,
        cleanText,
        JSON.stringify(cleanParsed),
        version.score || 0,
        version.template || 'modern_tech',
        version.jobs_matched_count || 0,
        cleanFileName,
        version.uploaded_at || new Date().toISOString(),
        version.file_size || '180 KB',
        cleanAnalysis ? JSON.stringify(cleanAnalysis) : null
      ]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[PostgreSQL] Error in dbSaveResumeVersion:', err);
    return null;
  }
}

export async function dbGetResumeVersions(userId: string): Promise<any[]> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return [];
  try {
    const res = await p.query(`SELECT * FROM resume_versions WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
    return res.rows;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetResumeVersions:', err);
    return [];
  }
}

// --- RESUME VERSION UPDATES & DELETION ---

export async function dbUpdateResumeVersionScore(versionId: string, score: number, analysisData?: any): Promise<boolean> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return false;
  try {
    const cleanAnalysis = analysisData ? sanitizePgJson(analysisData) : null;
    await p.query(
      `UPDATE resume_versions SET score = $1, analysis_data = $2, updated_at = NOW() WHERE id = $3`,
      [score, cleanAnalysis ? JSON.stringify(cleanAnalysis) : null, versionId]
    );
    // Also update the corresponding resumes row if linked
    await p.query(
      `UPDATE resumes SET ats_score = $1, updated_at = NOW() WHERE id = (SELECT resume_id FROM resume_versions WHERE id = $2)`,
      [score, versionId]
    );
    return true;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbUpdateResumeVersionScore:', err);
    return false;
  }
}

export async function dbDeleteResumeVersion(param1: string, param2?: string): Promise<boolean> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return false;
  try {
    let userId: string | null = null;
    let versionId: string = param1;
    if (param2) {
      userId = param1;
      versionId = param2;
    }

    // 1. Delete associated job matches for this version
    if (userId) {
      await p.query(`DELETE FROM job_matches WHERE user_id = $1 AND resume_version_id = $2`, [userId, versionId]);
    } else {
      await p.query(`DELETE FROM job_matches WHERE resume_version_id = $1`, [versionId]);
    }

    // 2. Get the linked resume_id before deleting
    const verRes = await p.query(`SELECT resume_id FROM resume_versions WHERE id = $1`, [versionId]);
    const resumeId = verRes.rows[0]?.resume_id;

    // 3. Delete associated ATS reports for this version
    if (userId) {
      await p.query(`DELETE FROM ats_reports WHERE user_id = $1 AND resume_id = $2`, [userId, versionId]);
    } else {
      await p.query(`DELETE FROM ats_reports WHERE resume_id = $1`, [versionId]);
    }
    
    // 4. Delete the resume version record
    if (userId) {
      await p.query(`DELETE FROM resume_versions WHERE id = $1 AND user_id = $2`, [versionId, userId]);
    } else {
      await p.query(`DELETE FROM resume_versions WHERE id = $1`, [versionId]);
    }
    
    // 5. Clean up orphaned resume row if no other versions use it
    if (resumeId) {
      const countRes = await p.query(`SELECT count(*) FROM resume_versions WHERE resume_id = $1`, [resumeId]);
      if (parseInt(countRes.rows[0].count) === 0) {
        await p.query(`DELETE FROM resumes WHERE id = $1`, [resumeId]);
      }
    }
    
    return true;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbDeleteResumeVersion:', err);
    return false;
  }
}

// --- JOB MATCHES (LINKED TO EXACT RESUME VERSION) ---

export interface DbJobRecord {
  id: string;
  external_job_id?: string;
  source: string;
  company: string;
  title: string;
  location: string;
  description: string;
  url: string;
  posted_at?: string;
  employment_type?: string;
  experience_required?: string;
  salary?: string;
  skills: string[];
  tags: string[];
  responsibilities?: string[];
  requirements?: string[];
  company_logo?: string;
  company_website?: string;
  industry?: string;
  is_active?: boolean;
}

export async function dbSaveJobs(jobs: DbJobRecord[]): Promise<number> {
  const p = getPool();
  if (!p || !isPostgresAvailable || !jobs || jobs.length === 0) return 0;
  let count = 0;
  for (const j of jobs) {
    try {
      await p.query(
        `INSERT INTO jobs (
          id, external_job_id, source, company, title, location, description, url,
          posted_at, employment_type, experience_required, salary, skills, tags,
          responsibilities, requirements, company_logo, company_website, industry, is_active, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
        ON CONFLICT (id) DO UPDATE SET
          company = EXCLUDED.company,
          title = EXCLUDED.title,
          location = EXCLUDED.location,
          description = EXCLUDED.description,
          url = EXCLUDED.url,
          posted_at = EXCLUDED.posted_at,
          employment_type = EXCLUDED.employment_type,
          experience_required = EXCLUDED.experience_required,
          salary = EXCLUDED.salary,
          skills = EXCLUDED.skills,
          tags = EXCLUDED.tags,
          responsibilities = EXCLUDED.responsibilities,
          requirements = EXCLUDED.requirements,
          company_logo = EXCLUDED.company_logo,
          company_website = EXCLUDED.company_website,
          industry = EXCLUDED.industry,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()`,
        [
          j.id,
          j.external_job_id || null,
          j.source || 'hireflow_ingest',
          sanitizePgString(j.company),
          sanitizePgString(j.title),
          sanitizePgString(j.location || 'India'),
          sanitizePgString(j.description),
          j.url,
          j.posted_at || 'Recently',
          j.employment_type || 'Full-time',
          j.experience_required || '2+ Years',
          j.salary || 'Competitive',
          JSON.stringify(sanitizePgJson(j.skills || [])),
          JSON.stringify(sanitizePgJson(j.tags || [])),
          JSON.stringify(sanitizePgJson(j.responsibilities || [])),
          JSON.stringify(sanitizePgJson(j.requirements || [])),
          j.company_logo || null,
          j.company_website || null,
          j.industry || null,
          j.is_active !== false
        ]
      );
      count++;
    } catch (err) {
      console.error('[PostgreSQL] Error in dbSaveJobs for job:', j.id, err);
    }
  }
  return count;
}

export async function dbGetAllJobs(): Promise<DbJobRecord[]> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return [];
  try {
    const res = await p.query(`SELECT * FROM jobs WHERE is_active = TRUE ORDER BY created_at DESC`);
    return res.rows.map(r => ({
      id: r.id,
      external_job_id: r.external_job_id,
      source: r.source,
      company: r.company,
      title: r.title,
      location: r.location,
      description: r.description,
      url: r.url,
      posted_at: r.posted_at,
      employment_type: r.employment_type,
      experience_required: r.experience_required,
      salary: r.salary,
      skills: Array.isArray(r.skills) ? r.skills : (typeof r.skills === 'string' ? JSON.parse(r.skills) : []),
      tags: Array.isArray(r.tags) ? r.tags : (typeof r.tags === 'string' ? JSON.parse(r.tags) : []),
      responsibilities: Array.isArray(r.responsibilities) ? r.responsibilities : (typeof r.responsibilities === 'string' ? JSON.parse(r.responsibilities) : []),
      requirements: Array.isArray(r.requirements) ? r.requirements : (typeof r.requirements === 'string' ? JSON.parse(r.requirements) : []),
      company_logo: r.company_logo,
      company_website: r.company_website,
      industry: r.industry,
      is_active: r.is_active
    }));
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetAllJobs:', err);
    return [];
  }
}

export async function dbGetJobById(jobId: string): Promise<DbJobRecord | null> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;
  try {
    const res = await p.query(`SELECT * FROM jobs WHERE id = $1`, [jobId]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      external_job_id: r.external_job_id,
      source: r.source,
      company: r.company,
      title: r.title,
      location: r.location,
      description: r.description,
      url: r.url,
      posted_at: r.posted_at,
      employment_type: r.employment_type,
      experience_required: r.experience_required,
      salary: r.salary,
      skills: Array.isArray(r.skills) ? r.skills : (typeof r.skills === 'string' ? JSON.parse(r.skills) : []),
      tags: Array.isArray(r.tags) ? r.tags : (typeof r.tags === 'string' ? JSON.parse(r.tags) : []),
      responsibilities: Array.isArray(r.responsibilities) ? r.responsibilities : (typeof r.responsibilities === 'string' ? JSON.parse(r.responsibilities) : []),
      requirements: Array.isArray(r.requirements) ? r.requirements : (typeof r.requirements === 'string' ? JSON.parse(r.requirements) : []),
      company_logo: r.company_logo,
      company_website: r.company_website,
      industry: r.industry,
      is_active: r.is_active
    };
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetJobById:', err);
    return null;
  }
}

export interface DbJobMatchRecord {
  id?: string;
  user_id?: string;
  resume_version_id: string;
  job_id: string;
  match_score: number;
  similarity_score?: number;
  skill_match_score?: number;
  matched_skills: string[];
  missing_skills: string[];
  preferred_skills?: string[];
  why_match?: string;
}

export async function dbSaveJobMatches(
  userId: string,
  resumeVersionId: string,
  matches: DbJobMatchRecord[]
): Promise<boolean> {
  const p = getPool();
  if (!p || !isPostgresAvailable || !resumeVersionId) return false;
  try {
    // Validate that resume_version_id actually exists in resume_versions table to prevent FK violations
    const verCheck = await p.query('SELECT id FROM resume_versions WHERE id = $1', [resumeVersionId]);
    if (verCheck.rows.length === 0) {
      console.warn(`[dbSaveJobMatches] Skipping insert: resume_version_id "${resumeVersionId}" not yet present in resume_versions table.`);
      return false;
    }

    // Delete existing matches for this version to ensure clean, isolated state
    await p.query('DELETE FROM job_matches WHERE user_id = $1 AND resume_version_id = $2', [userId, resumeVersionId]);

    for (const m of matches) {
      const matchId = `jm_${userId}_${resumeVersionId}_${m.job_id}`;
      const cleanWhy = sanitizePgString(m.why_match || '');
      await p.query(
        `INSERT INTO job_matches (
          id, user_id, resume_version_id, job_id, match_score, similarity_score, skill_match_score,
          matched_skills, missing_skills, preferred_skills, why_match, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (user_id, resume_version_id, job_id) DO UPDATE SET
          match_score = EXCLUDED.match_score,
          similarity_score = EXCLUDED.similarity_score,
          skill_match_score = EXCLUDED.skill_match_score,
          matched_skills = EXCLUDED.matched_skills,
          missing_skills = EXCLUDED.missing_skills,
          preferred_skills = EXCLUDED.preferred_skills,
          why_match = EXCLUDED.why_match,
          updated_at = NOW()`,
        [
          matchId,
          userId,
          resumeVersionId,
          m.job_id,
          m.match_score || 0,
          m.similarity_score || 0,
          m.skill_match_score || 0,
          JSON.stringify(sanitizePgJson(m.matched_skills || [])),
          JSON.stringify(sanitizePgJson(m.missing_skills || [])),
          JSON.stringify(sanitizePgJson(m.preferred_skills || [])),
          cleanWhy
        ]
      );
    }
    // Update jobs_matched_count in resume_versions table
    await p.query(
      `UPDATE resume_versions SET jobs_matched_count = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`,
      [matches.length, resumeVersionId, userId]
    );
    console.log(`[RESUME JOB MATCH] resumeVersionId=${resumeVersionId} jobCount=${matches.length}`);
    return true;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbSaveJobMatches:', err);
    return false;
  }
}

export async function dbGetJobMatchesForResumeVersion(
  userId: string,
  resumeVersionId: string
): Promise<any[]> {
  const p = getPool();
  if (!p || !isPostgresAvailable || !resumeVersionId) return [];
  try {
    const res = await p.query(
      `SELECT 
        jm.id AS match_id,
        jm.user_id,
        jm.resume_version_id,
        jm.job_id,
        jm.match_score,
        jm.similarity_score,
        jm.skill_match_score,
        jm.matched_skills,
        jm.missing_skills,
        jm.preferred_skills,
        jm.why_match,
        j.company,
        j.title,
        j.location,
        j.description,
        j.url AS apply_url,
        j.posted_at AS posted_date,
        j.employment_type AS job_type,
        j.experience_required,
        j.salary,
        j.skills AS job_skills,
        j.tags,
        j.responsibilities,
        j.requirements,
        j.company_logo,
        j.company_website,
        j.industry,
        j.source
       FROM job_matches jm
       LEFT JOIN jobs j ON jm.job_id = j.id
       WHERE jm.user_id = $1 AND jm.resume_version_id = $2
       ORDER BY jm.match_score DESC`,
      [userId, resumeVersionId]
    );

    return res.rows.map(row => {
      const matchedSkills = Array.isArray(row.matched_skills)
        ? row.matched_skills
        : (typeof row.matched_skills === 'string' ? JSON.parse(row.matched_skills) : []);
      const missingSkills = Array.isArray(row.missing_skills)
        ? row.missing_skills
        : (typeof row.missing_skills === 'string' ? JSON.parse(row.missing_skills) : []);
      const tags = Array.isArray(row.tags)
        ? row.tags
        : (typeof row.tags === 'string' ? JSON.parse(row.tags) : []);
      const jobSkills = Array.isArray(row.job_skills)
        ? row.job_skills
        : (typeof row.job_skills === 'string' ? JSON.parse(row.job_skills) : []);
      const responsibilities = Array.isArray(row.responsibilities)
        ? row.responsibilities
        : (typeof row.responsibilities === 'string' ? JSON.parse(row.responsibilities) : []);
      const requirements = Array.isArray(row.requirements)
        ? row.requirements
        : (typeof row.requirements === 'string' ? JSON.parse(row.requirements) : []);

      let confidence: 'Very High' | 'High' | 'Moderate' | 'Low' = 'Low';
      if (row.match_score >= 88) confidence = 'Very High';
      else if (row.match_score >= 75) confidence = 'High';
      else if (row.match_score >= 50) confidence = 'Moderate';

      // Skip orphaned matches where the job record no longer exists
      if (!row.company && !row.title) {
        return null;
      }

      return {
        id: row.job_id,
        company: row.company,
        title: row.title,
        location: row.location || '',
        description: row.description || '',
        salary: row.salary || '',
        salaryRange: row.salary || '',
        matchScore: row.match_score,
        matchConfidence: confidence,
        similarityScore: row.similarity_score,
        skillMatchScore: row.skill_match_score,
        requiredSkills: jobSkills.length > 0 ? jobSkills : matchedSkills,
        matchedSkills: matchedSkills,
        missingSkills: missingSkills,
        recommendationReason: row.why_match || 'Strong match based on your skills and experience.',
        tags: tags.length > 0 ? tags : matchedSkills,
        responsibilities,
        requirements,
        experienceRequired: row.experience_required || '',
        jobType: row.job_type || 'Full-Time',
        companyLogo: row.company_logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(row.company || '')}`,
        companyWebsite: row.company_website || row.apply_url || '',
        companyDescription: `${row.company} is hiring software professionals in India.`,
        applyUrl: row.apply_url || '',
        applicationUrl: row.apply_url || '',
        postedDate: row.posted_date || 'Recently',
        source: row.source || 'HireFlow Direct',
        industry: row.industry || ''
      };
    }).filter(Boolean);
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetJobMatchesForResumeVersion:', err);
    return [];
  }
}

export async function dbDeleteJobMatchesForResumeVersion(
  userId: string,
  resumeVersionId: string
): Promise<boolean> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return false;
  try {
    await p.query(
      `DELETE FROM job_matches WHERE user_id = $1 AND resume_version_id = $2`,
      [userId, resumeVersionId]
    );
    return true;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbDeleteJobMatchesForResumeVersion:', err);
    return false;
  }
}

// --- ATS REPORTS ---

export async function dbGetAtsReportForResume(userId: string, resumeVersionId: string): Promise<any> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;
  try {
    const res = await p.query(
      `SELECT * FROM ats_reports WHERE user_id = $1 AND resume_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [userId, resumeVersionId]
    );
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetAtsReportForResume:', err);
    return null;
  }
}

export async function dbSaveAtsReport(userId: string, report: {
  id?: string;
  resume_id?: string;
  target_role?: string;
  overall_score?: number;
  formatting_score?: number;
  summary?: string;
  keywords?: any;
  impact_points?: any;
  grammar_issues?: any;
  analysis_data?: any;
}): Promise<any> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;
  try {
    let finalResumeId: string | null = null;
    
    if (report.resume_id) {
      // 1. Check if report.resume_id is directly a valid id in resumes table
      const resCheck = await p.query('SELECT id FROM resumes WHERE id = $1', [report.resume_id]);
      if (resCheck.rows.length > 0) {
        finalResumeId = resCheck.rows[0].id;
      } else {
        // 2. Check if report.resume_id is a resume_version_id with an associated parent resume
        const verRes = await p.query('SELECT resume_id FROM resume_versions WHERE id = $1', [report.resume_id]);
        if (verRes.rows.length > 0 && verRes.rows[0].resume_id) {
          finalResumeId = verRes.rows[0].resume_id;
        } else {
          // 3. Fallback: lookup user's latest resume in resumes table
          const userRes = await p.query('SELECT id FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
          finalResumeId = userRes.rows.length > 0 ? userRes.rows[0].id : null;
        }
      }
    } else {
      const userRes = await p.query('SELECT id FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
      finalResumeId = userRes.rows.length > 0 ? userRes.rows[0].id : null;
    }

    const id = report.id || `ats_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await p.query(
      `INSERT INTO ats_reports (
        id, user_id, resume_id, target_role, overall_score, formatting_score, summary, keywords, impact_points, grammar_issues, analysis_data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *`,
      [
        id,
        userId,
        finalResumeId,
        report.target_role || 'Software Engineer',
        report.overall_score || 0,
        report.formatting_score || 0,
        report.summary || '',
        JSON.stringify(report.keywords || []),
        JSON.stringify(report.impact_points || []),
        JSON.stringify(report.grammar_issues || []),
        JSON.stringify(report.analysis_data || report)
      ]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[PostgreSQL] Error in dbSaveAtsReport:', err);
    return null;
  }
}

export async function dbGetAtsReports(userId: string): Promise<any[]> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return [];
  try {
    const res = await p.query(`SELECT * FROM ats_reports WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
    return res.rows;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetAtsReports:', err);
    return [];
  }
}

// --- JOB APPLICATIONS & SAVED JOBS ---

export async function dbSaveJobApplication(userId: string, app: {
  id?: string;
  job_id: string;
  title: string;
  company: string;
  company_logo?: string;
  location?: string;
  salary?: string;
  status?: string;
  stage?: string;
  applied_date?: string;
  notes?: string;
  match_score?: number;
}): Promise<any> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;
  try {
    const id = app.id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await p.query(
      `INSERT INTO user_job_applications (
        id, user_id, job_id, title, company, company_logo, location, salary, status, stage, applied_date, notes, match_score, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        stage = EXCLUDED.stage,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *`,
      [
        id,
        userId,
        app.job_id,
        app.title,
        app.company,
        app.company_logo || null,
        app.location || 'Remote',
        app.salary || '$120,000 - $160,000',
        app.status || 'applied',
        app.stage || 'Applied',
        app.applied_date || new Date().toISOString().split('T')[0],
        app.notes || '',
        app.match_score || 0
      ]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[PostgreSQL] Error in dbSaveJobApplication:', err);
    return null;
  }
}

export async function dbGetUserJobApplications(userId: string): Promise<any[]> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return [];
  try {
    const res = await p.query(`SELECT * FROM user_job_applications WHERE user_id = $1 ORDER BY updated_at DESC`, [userId]);
    return res.rows;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetUserJobApplications:', err);
    return [];
  }
}

export async function dbSaveSavedJob(userId: string, jobId: string): Promise<boolean> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return false;
  try {
    const id = `sj_${userId}_${jobId}`;
    await p.query(
      `INSERT INTO user_saved_jobs (id, user_id, job_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, job_id) DO NOTHING`,
      [id, userId, jobId]
    );
    return true;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbSaveSavedJob:', err);
    return false;
  }
}

export async function dbRemoveSavedJob(userId: string, jobId: string): Promise<boolean> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return false;
  try {
    await p.query(`DELETE FROM user_saved_jobs WHERE user_id = $1 AND job_id = $2`, [userId, jobId]);
    return true;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbRemoveSavedJob:', err);
    return false;
  }
}

export async function dbGetUserSavedJobs(userId: string): Promise<string[]> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return [];
  try {
    const res = await p.query(`SELECT job_id FROM user_saved_jobs WHERE user_id = $1`, [userId]);
    return res.rows.map(r => r.job_id);
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetUserSavedJobs:', err);
    return [];
  }
}

// --- INTERVIEWS ---

export async function dbSaveInterviewSession(userId: string, session: {
  id?: string;
  topic: string;
  role?: string;
  company?: string;
  score?: number;
  question?: string;
  answer?: string;
  star_breakdown?: any;
  strengths?: any;
  areas_to_improve?: any;
  polished_answer?: string;
}): Promise<any> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;
  try {
    const id = session.id || `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await p.query(
      `INSERT INTO user_interview_sessions (
        id, user_id, topic, role, company, score, question, answer, star_breakdown, strengths, areas_to_improve, polished_answer, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *`,
      [
        id,
        userId,
        session.topic,
        session.role || 'Software Engineer',
        session.company || 'Tech Target',
        session.score || 0,
        session.question || '',
        session.answer || '',
        JSON.stringify(session.star_breakdown || {}),
        JSON.stringify(session.strengths || []),
        JSON.stringify(session.areas_to_improve || []),
        session.polished_answer || ''
      ]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[PostgreSQL] Error in dbSaveInterviewSession:', err);
    return null;
  }
}

export async function dbGetUserInterviewSessions(userId: string): Promise<any[]> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return [];
  try {
    const res = await p.query(`SELECT * FROM user_interview_sessions WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
    return res.rows;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetUserInterviewSessions:', err);
    return [];
  }
}

// --- CALENDAR ---

export async function dbSaveCalendarEvent(userId: string, event: any): Promise<any> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;
  try {
    const id = event.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await p.query(
      `INSERT INTO user_calendar_events (
        id, user_id, title, company, job_id, event_date, event_time, event_type, description, completed, priority, color_tag, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        company = EXCLUDED.company,
        event_date = EXCLUDED.event_date,
        event_time = EXCLUDED.event_time,
        description = EXCLUDED.description,
        completed = EXCLUDED.completed,
        updated_at = NOW()
      RETURNING *`,
      [
        id,
        userId,
        event.title,
        event.company || null,
        event.jobId || event.job_id || null,
        event.date || event.event_date || 'Today',
        event.time || event.event_time || '10:00 AM',
        event.type || event.event_type || 'study_session',
        event.description || '',
        Boolean(event.completed),
        event.priority || 'medium',
        event.colorTag || event.color_tag || 'blue'
      ]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[PostgreSQL] Error in dbSaveCalendarEvent:', err);
    return null;
  }
}

export async function dbDeleteCalendarEvent(userId: string, id: string): Promise<boolean> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return false;
  try {
    await p.query(`DELETE FROM user_calendar_events WHERE user_id = $1 AND id = $2`, [userId, id]);
    return true;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbDeleteCalendarEvent:', err);
    return false;
  }
}

export async function dbGetUserCalendarEvents(userId: string): Promise<any[]> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return [];
  try {
    const res = await p.query(`SELECT * FROM user_calendar_events WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
    return res.rows;
  } catch (err) {
    console.error('[PostgreSQL] Error in dbGetUserCalendarEvents:', err);
    return [];
  }
}

// --- PRODUCTIVITY DATA (TASKS, NOTES, GOALS, SESSIONS, SETTINGS, INTEGRATIONS) ---

export async function dbSaveProductivityData(userId: string, dataKey: string, dataValue: any): Promise<boolean> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return false;
  try {
    await p.query(
      `INSERT INTO user_productivity_data (user_id, data_key, data_value, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, data_key) DO UPDATE SET
         data_value = EXCLUDED.data_value,
         updated_at = NOW()`,
      [userId, dataKey, JSON.stringify(dataValue)]
    );
    return true;
  } catch (err) {
    console.error(`[PostgreSQL] Error in dbSaveProductivityData (${dataKey}):`, err);
    return false;
  }
}

export async function dbGetProductivityData(userId: string, dataKey: string): Promise<any> {
  const p = getPool();
  if (!p || !isPostgresAvailable) return null;
  try {
    const res = await p.query(`SELECT data_value FROM user_productivity_data WHERE user_id = $1 AND data_key = $2 LIMIT 1`, [userId, dataKey]);
    if (res.rows.length === 0) return null;
    return res.rows[0].data_value;
  } catch (err) {
    console.error(`[PostgreSQL] Error in dbGetProductivityData (${dataKey}):`, err);
    return null;
  }
}

export async function dbGetAllUserData(userId: string): Promise<{
  user: DbUserRecord | null;
  resumes: any[];
  resumeVersions: any[];
  atsReports: any[];
  jobMatches: any[];
  jobApplications: any[];
  savedJobs: string[];
  interviewSessions: any[];
  calendarEvents: any[];
  productivity: Record<string, any>;
}> {
  const user = await dbFindUserById(userId);
  const resumes = await dbGetUserResumes(userId);
  const resumeVersions = await dbGetResumeVersions(userId);
  const atsReports = await dbGetAtsReports(userId);
  const jobApplications = await dbGetUserJobApplications(userId);
  const savedJobs = await dbGetUserSavedJobs(userId);
  const interviewSessions = await dbGetUserInterviewSessions(userId);
  const calendarEvents = await dbGetUserCalendarEvents(userId);

  let jobMatches: any[] = [];
  const p = getPool();
  if (p && isPostgresAvailable) {
    try {
      const jmRes = await p.query(
        `SELECT * FROM job_matches WHERE user_id = $1 ORDER BY match_score DESC`,
        [userId]
      );
      jobMatches = jmRes.rows;
    } catch (e) {
      console.error('[PostgreSQL] Error fetching job_matches in dbGetAllUserData:', e);
    }
  }

  const keys = ['prod_tasks', 'prod_notes', 'prod_goals', 'prod_focus', 'prod_streaks', 'prod_settings', 'prod_integrations'];
  const productivity: Record<string, any> = {};
  for (const k of keys) {
    const val = await dbGetProductivityData(userId, k);
    if (val !== null) productivity[k] = val;
  }

  return {
    user,
    resumes,
    resumeVersions,
    atsReports,
    jobMatches,
    jobApplications,
    savedJobs,
    interviewSessions,
    calendarEvents,
    productivity
  };
}
