import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function inspectSchema() {
  const p = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log('--- 1. Constraints on "jobs" table ---');
  const constraints = await p.query(`
    SELECT conname, contype, pg_get_constraintdef(c.oid) as def
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid = 'jobs'::regclass;
  `);
  console.table(constraints.rows);

  console.log('--- 2. Indexes on "jobs" table ---');
  const indexes = await p.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'jobs';
  `);
  console.table(indexes.rows);

  console.log('--- 3. Columns of "jobs" table ---');
  const cols = await p.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'jobs'
    ORDER BY ordinal_position;
  `);
  console.table(cols.rows);

  await p.end();
}

inspectSchema().catch(console.error);
