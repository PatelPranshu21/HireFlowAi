import { getPool } from '../src/db/postgres';

async function audit() {
  const p = getPool();
  if (!p) process.exit(1);

  const realUserId = 'usr_google_1786364731336_pcif';

  console.log('=== ALL USERS IN DB ===');
  const users = await p.query('SELECT id, email, created_at FROM users ORDER BY created_at ASC');
  console.table(users.rows);

  console.log(`\n=== RESUMES FOR ${realUserId} ===`);
  const resumes = await p.query('SELECT id, user_id, file_name, version_name, ats_score, created_at FROM resumes WHERE user_id = $1 ORDER BY created_at ASC', [realUserId]);
  console.table(resumes.rows);

  console.log(`\n=== RESUME_VERSIONS FOR ${realUserId} ===`);
  const rvs = await p.query('SELECT id, user_id, resume_id, version_name, file_name, score, jobs_matched_count, analysis_data IS NOT NULL as has_analysis, created_at FROM resume_versions WHERE user_id = $1 ORDER BY created_at ASC', [realUserId]);
  console.table(rvs.rows);

  console.log(`\n=== JOB_MATCHES FOR ${realUserId} ===`);
  const jms = await p.query('SELECT resume_version_id, count(*) as matches_count, avg(match_score) as avg_score FROM job_matches WHERE user_id = $1 GROUP BY resume_version_id', [realUserId]);
  console.table(jms.rows);

  console.log(`\n=== ATS_REPORTS FOR ${realUserId} ===`);
  const ats = await p.query('SELECT id, resume_id, target_role, overall_score, created_at FROM ats_reports WHERE user_id = $1 ORDER BY created_at ASC', [realUserId]);
  console.table(ats.rows);

  console.log(`\n=== USER profile_data.resumeVersions FOR ${realUserId} ===`);
  const user = await p.query('SELECT id, email, profile_data FROM users WHERE id = $1', [realUserId]);
  console.log('activeResumeVersionId:', user.rows[0]?.profile_data?.activeResumeVersionId);
  console.log('atsScore:', user.rows[0]?.profile_data?.atsScore);
  console.log('resumeVersions array count:', user.rows[0]?.profile_data?.resumeVersions?.length);
  if (user.rows[0]?.profile_data?.resumeVersions) {
    for (const v of user.rows[0].profile_data.resumeVersions) {
      console.log('  -', v.id, '|', v.versionName, '| file:', v.fileName, '| score:', v.score, '| jobsMatchedCount:', v.jobsMatchedCount, '| hasAnalysis:', !!v.analysisData);
    }
  }

  process.exit(0);
}

audit();
