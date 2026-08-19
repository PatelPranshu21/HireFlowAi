import { getPool } from '../src/db/postgres';

async function cleanupUser() {
  const p = getPool();
  if (!p) process.exit(1);

  const realUserId = 'usr_google_1786364731336_pcif';
  const canonicalVerId = 'ver_pranshu_actual_1787128671492';

  // Delete all versions for real user except the canonical version
  await p.query('DELETE FROM job_matches WHERE user_id = $1 AND resume_version_id != $2', [realUserId, canonicalVerId]);
  await p.query('DELETE FROM ats_reports WHERE user_id = $1 AND resume_id != $2', [realUserId, canonicalVerId]);
  await p.query('DELETE FROM resume_versions WHERE user_id = $1 AND id != $2', [realUserId, canonicalVerId]);
  
  // Sync profile_data
  const ver = (await p.query('SELECT * FROM resume_versions WHERE id = $1', [canonicalVerId])).rows[0];
  const userRow = (await p.query('SELECT profile_data FROM users WHERE id = $1', [realUserId])).rows[0];
  const profileData = userRow?.profile_data || {};

  const cleanVersionObj = {
    id: ver.id,
    versionName: ver.version_name,
    fileName: ver.file_name,
    uploadedAt: 'Saved',
    fileSize: ver.file_size || '184 KB',
    score: ver.score || 91,
    template: ver.template || 'modern_tech',
    parsedData: ver.parsed_data || {},
    jobsMatchedCount: 12,
    content: ver.resume_text,
    resumeText: ver.resume_text,
    analysisData: ver.analysis_data || null
  };

  profileData.resumeVersions = [cleanVersionObj];
  profileData.activeResumeVersionId = ver.id;
  profileData.resumeText = ver.resume_text;
  profileData.primaryResumeText = ver.resume_text;
  profileData.atsScore = ver.score || 91;

  await p.query('UPDATE users SET profile_data = $1 WHERE id = $2', [JSON.stringify(profileData), realUserId]);

  console.log('=== FINAL AUDIT OF usr_google_1786364731336_pcif ===');
  const resVers = await p.query('SELECT id, user_id, resume_id, version_name, score, jobs_matched_count FROM resume_versions WHERE user_id = $1', [realUserId]);
  console.table(resVers.rows);

  const resResumes = await p.query('SELECT id, user_id, version_name, ats_score FROM resumes WHERE user_id = $1', [realUserId]);
  console.table(resResumes.rows);

  const resMatches = await p.query('SELECT resume_version_id, count(*) as matches_count FROM job_matches WHERE user_id = $1 GROUP BY resume_version_id', [realUserId]);
  console.table(resMatches.rows);

  process.exit(0);
}

cleanupUser();
