import { initDb, getPool } from '../src/db/postgres';

async function main() {
  await initDb();
  const pool = getPool();
  if (!pool) { console.log('NO POOL'); process.exit(1); }
  
  // 1. Check jobs table
  const jobs = await pool.query('SELECT id, company, title, location, salary, url FROM jobs LIMIT 10');
  console.log('=== JOBS TABLE (first 10 rows) ===');
  for (const r of jobs.rows) {
    console.log(`  ${r.id} | company="${r.company}" | title="${r.title}" | location="${r.location}" | salary="${r.salary}" | url="${r.url}"`);
  }
  const totalJobs = (await pool.query('SELECT count(*) FROM jobs')).rows[0].count;
  console.log(`Total jobs in table: ${totalJobs}`);
  
  // 2. Check job_matches table with JOIN
  const totalMatches = (await pool.query('SELECT count(*) FROM job_matches')).rows[0].count;
  console.log(`\n=== JOB_MATCHES total rows: ${totalMatches} ===`);
  
  const matches = await pool.query(`
    SELECT jm.job_id, jm.match_score, jm.matched_skills, 
           j.company, j.title, j.url, j.id AS joined_job_id
    FROM job_matches jm 
    LEFT JOIN jobs j ON jm.job_id = j.id 
    LIMIT 10
  `);
  console.log('JOB_MATCHES with JOIN (first 10):');
  for (const r of matches.rows) {
    console.log(`  job_id="${r.job_id}" | joined_job_id="${r.joined_job_id}" | company="${r.company}" | title="${r.title}" | url="${r.url}" | score=${r.match_score}`);
  }
  
  // 3. Check for orphaned job_ids (no matching jobs row)
  const nullCheck = await pool.query(`
    SELECT jm.job_id, j.company, j.id AS jobs_id 
    FROM job_matches jm 
    LEFT JOIN jobs j ON jm.job_id = j.id 
    WHERE j.company IS NULL 
    LIMIT 10
  `);
  console.log(`\n=== ORPHANED job_matches (company IS NULL after JOIN): ${nullCheck.rows.length} ===`);
  for (const r of nullCheck.rows) {
    console.log(`  orphaned job_id="${r.job_id}"`);
  }
  
  // 4. Show distinct job_ids in job_matches
  const distinctJobIds = await pool.query('SELECT DISTINCT job_id FROM job_matches ORDER BY job_id LIMIT 30');
  console.log(`\n=== DISTINCT job_ids in job_matches (${distinctJobIds.rows.length}) ===`);
  for (const r of distinctJobIds.rows) {
    console.log(`  "${r.job_id}"`);
  }
  
  // 5. Show distinct ids in jobs
  const distinctIds = await pool.query('SELECT DISTINCT id FROM jobs ORDER BY id LIMIT 30');
  console.log(`\n=== DISTINCT ids in jobs table (${distinctIds.rows.length}) ===`);
  for (const r of distinctIds.rows) {
    console.log(`  "${r.id}"`);
  }
  
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
