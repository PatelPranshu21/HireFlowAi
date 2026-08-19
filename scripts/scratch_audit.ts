import { getPool, initDb } from '../src/db/postgres';

async function audit() {
  const p = getPool();
  if (!p) process.exit(1);

  const userId = 'usr_google_1786364731336_pcif';
  const userRes = await p.query('SELECT id, email, profile_data FROM users WHERE id = $1', [userId]);
  console.log('=== USER RECORD ===');
  console.log('ID:', userRes.rows[0]?.id);
  console.log('Email:', userRes.rows[0]?.email);
  console.log('atsScore in profile_data:', userRes.rows[0]?.profile_data?.atsScore);
  console.log('activeResumeVersionId in profile_data:', userRes.rows[0]?.profile_data?.activeResumeVersionId);
  console.log('resumeVersions in profile_data count:', userRes.rows[0]?.profile_data?.resumeVersions?.length);
  if (userRes.rows[0]?.profile_data?.resumeVersions) {
    console.log('resumeVersions in profile_data:');
    for (const v of userRes.rows[0].profile_data.resumeVersions) {
      console.log('  -', v.id, '|', v.versionName, '| score:', v.score, '| jobsMatchedCount:', v.jobsMatchedCount, '| has analysisData:', !!v.analysisData);
    }
  }

  console.log('\n=== DB resume_versions ROWS ===');
  const rvs = await p.query('SELECT id, user_id, resume_id, version_name, file_name, score, jobs_matched_count, created_at, analysis_data IS NOT NULL as has_analysis, substring(resume_text, 1, 80) as sample FROM resume_versions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  console.table(rvs.rows);

  console.log('\n=== DB job_matches FOR USER ===');
  const jms = await p.query('SELECT resume_version_id, count(*) as count, avg(match_score) as avg_score FROM job_matches WHERE user_id = $1 GROUP BY resume_version_id', [userId]);
  console.table(jms.rows);

  console.log('\n=== DB ats_reports FOR USER ===');
  const ats = await p.query('SELECT id, resume_id, overall_score, target_role, created_at FROM ats_reports WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  console.table(ats.rows);

  process.exit(0);
}

audit();
