import { getPool, initDb } from '../src/db/postgres';

async function cleanData() {
  const p = getPool();
  if (!p) process.exit(1);

  console.log('=== CHECKING UNANALYZED OR STALE 85 RESUME VERSIONS ===');
  const stale85 = await p.query(`
    SELECT id, user_id, version_name, score, analysis_data IS NOT NULL as has_analysis, created_at
    FROM resume_versions
    WHERE score = 85 AND analysis_data IS NULL
  `);
  console.log(`Found ${stale85.rows.length} unanalyzed versions with hardcoded 85 score:`, stale85.rows);

  if (stale85.rows.length > 0) {
    console.log('Resetting unanalyzed 85 score rows to score = 0 in PostgreSQL...');
    await p.query(`
      UPDATE resume_versions
      SET score = 0, updated_at = NOW()
      WHERE score = 85 AND analysis_data IS NULL
    `);
    console.log('Reset resume_versions score = 0.');

    await p.query(`
      UPDATE resumes
      SET ats_score = 0, updated_at = NOW()
      WHERE ats_score = 85
    `);
    console.log('Reset resumes ats_score = 0.');
  }

  // Synchronize jobs_matched_count for all versions in PostgreSQL
  console.log('\n=== SYNCHRONIZING jobs_matched_count IN resume_versions ===');
  await p.query(`
    UPDATE resume_versions rv
    SET jobs_matched_count = (
      SELECT COUNT(*) FROM job_matches jm WHERE jm.resume_version_id = rv.id
    )
  `);
  console.log('Synchronized jobs_matched_count for all resume_versions.');

  // Clean user profile_data atsScore if stale 85
  const users = await p.query(`SELECT id, profile_data FROM users`);
  for (const u of users.rows) {
    if (u.profile_data) {
      let mod = false;
      const pd = u.profile_data;
      if (pd.resumeVersions && Array.isArray(pd.resumeVersions)) {
        for (const rv of pd.resumeVersions) {
          if (rv.score === 85 && !rv.analysisData) {
            rv.score = 0;
            mod = true;
          }
        }
      }
      if (pd.atsScore === 85 && (!pd.resumeVersions || pd.resumeVersions.every((rv: any) => rv.score === 0 || !rv.score))) {
        pd.atsScore = 0;
        mod = true;
      }
      if (mod) {
        await p.query(`UPDATE users SET profile_data = $1 WHERE id = $2`, [JSON.stringify(pd), u.id]);
        console.log(`Cleaned profile_data for user ${u.id}`);
      }
    }
  }

  console.log('\n=== FINAL VERIFICATION OF resume_versions IN DB ===');
  const allVers = await p.query(`SELECT id, user_id, version_name, score, jobs_matched_count, analysis_data IS NOT NULL as has_analysis FROM resume_versions ORDER BY created_at DESC`);
  console.table(allVers.rows);

  process.exit(0);
}

cleanData();
