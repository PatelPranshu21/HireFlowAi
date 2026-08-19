import { initDb, getPool } from '../src/db/postgres';

async function runMigration() {
  console.log('--- Starting HireFlow AI PostgreSQL Database Migration ---');
  const pool = getPool();
  if (!pool) {
    console.error('ERROR: Database connection parameters (DATABASE_URL / PGHOST / SQL_HOST) are not set in environment.');
    process.exit(1);
  }

  const success = await initDb();
  if (!success) {
    console.error('ERROR: Migration failed to execute against PostgreSQL database.');
    process.exit(1);
  }

  // Verify created tables
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      const tableNames = res.rows.map(r => r.table_name);
      console.log('--- PostgreSQL Verification Result ---');
      console.log('Tables present in database:', tableNames);
      
      const requiredTables = [
        'users',
        'user_usage',
        'resumes',
        'resume_versions',
        'ats_reports',
        'jobs',
        'job_matches',
        'user_job_applications',
        'user_saved_jobs',
        'user_interview_sessions',
        'user_calendar_events',
        'user_productivity_data'
      ];

      const missing = requiredTables.filter(t => !tableNames.includes(t));
      if (missing.length === 0) {
        console.log('SUCCESS: All 12 required persistent tables exist in the database!');
      } else {
        console.error('WARNING: Missing tables:', missing);
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error verifying tables:', err);
  }

  process.exit(0);
}

runMigration();
