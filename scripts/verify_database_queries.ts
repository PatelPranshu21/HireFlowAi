import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function verifyDatabase() {
  const p = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log('\n--- 1. Query: SELECT source, COUNT(*) FROM jobs GROUP BY source; ---');
  const r1 = await p.query('SELECT source, COUNT(*) FROM jobs GROUP BY source;');
  console.table(r1.rows);

  console.log('\n--- 2. Query: SELECT COUNT(*) FROM jobs WHERE source = \'adzuna\' AND is_active = true; ---');
  const r2 = await p.query('SELECT COUNT(*) FROM jobs WHERE source = \'adzuna\' AND is_active = true;');
  console.log('Active Adzuna jobs count:', r2.rows[0].count);

  console.log('\n--- 3. Query: SELECT company, title, location, url FROM jobs WHERE source = \'adzuna\' AND is_active = true LIMIT 20; ---');
  const r3 = await p.query('SELECT company, title, location, url FROM jobs WHERE source = \'adzuna\' AND is_active = true LIMIT 20;');
  console.table(r3.rows);

  console.log('\n--- 4. Query: Check for "Tech Company" placeholder ---');
  const r4 = await p.query('SELECT COUNT(*) FROM jobs WHERE company ILIKE \'%tech company%\';');
  console.log('Count of "Tech Company" occurrences:', r4.rows[0].count);

  console.log('\n--- 5. Query: Duplicate (source, external_job_id) check ---');
  const r5 = await p.query(`
    SELECT source, external_job_id, COUNT(*)
    FROM jobs
    WHERE external_job_id IS NOT NULL
    GROUP BY source, external_job_id
    HAVING COUNT(*) > 1;
  `);
  console.log('Duplicate (source, external_job_id) count:', r5.rows.length);

  await p.end();
}

verifyDatabase().catch(e => {
  console.error(e);
  process.exit(1);
});
