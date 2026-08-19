import { getPool, initDb, dbDeleteResumeVersion } from '../src/db/postgres';

async function cleanup() {
  const pool = getPool();
  if (!pool) process.exit(1);
  await initDb();

  console.log('====================================================');
  console.log('PHASE 2: CLEANING AUTOMATED TEST USERS & TEST DATA');
  console.log('====================================================');

  // Identify test users
  const testUsersRes = await pool.query(`
    SELECT id, email FROM users
    WHERE id LIKE 'test_%' 
       OR id LIKE 'usr_e2e_test_%'
       OR id LIKE 'test_usr_%'
       OR email LIKE 'test_%@example.com'
       OR email LIKE '%@e2etest.com'
       OR email LIKE 'testuser_%'
  `);
  console.log(`Found ${testUsersRes.rows.length} test users to purge:`, testUsersRes.rows.map(u => `${u.id} (${u.email})`));

  for (const u of testUsersRes.rows) {
    const uid = u.id;
    await pool.query('DELETE FROM job_matches WHERE user_id = $1', [uid]);
    await pool.query('DELETE FROM ats_reports WHERE user_id = $1', [uid]);
    await pool.query('DELETE FROM resume_versions WHERE user_id = $1', [uid]);
    await pool.query('DELETE FROM resumes WHERE user_id = $1', [uid]);
    await pool.query('DELETE FROM user_job_applications WHERE user_id = $1', [uid]);
    await pool.query('DELETE FROM user_saved_jobs WHERE user_id = $1', [uid]);
    await pool.query('DELETE FROM user_interview_sessions WHERE user_id = $1', [uid]);
    await pool.query('DELETE FROM user_calendar_events WHERE user_id = $1', [uid]);
    await pool.query('DELETE FROM user_productivity_data WHERE user_id = $1', [uid]);
    await pool.query('DELETE FROM users WHERE id = $1', [uid]);
    console.log(`  ✓ Purged test user: ${uid}`);
  }

  console.log('\n====================================================');
  console.log('PHASE 3: CLEANING DUPLICATES FOR REAL USER');
  console.log('====================================================');

  const realUserId = 'usr_google_1786364731336_pcif';
  
  // Inspect all resume_versions for real user
  const userVersionsRes = await pool.query(`
    SELECT id, resume_id, version_name, file_name, score, jobs_matched_count, analysis_data IS NOT NULL as has_analysis, length(resume_text) as text_len, created_at
    FROM resume_versions
    WHERE user_id = $1
    ORDER BY created_at ASC
  `, [realUserId]);

  console.log('Current resume_versions for real user:');
  console.table(userVersionsRes.rows);

  // We want to keep the canonical legitimate FullStack resume version:
  // ver_pranshu_actual_1787128671492 has score 91, 12 matches, text_len 1746.
  // All other temporary test duplicates (e.g. text_len 52 or duplicate ver_pranshu_actual_1787127897035) should be purged.
  
  const canonicalVersionId = 'ver_pranshu_actual_1787128671492';
  const versionsToDelete = userVersionsRes.rows
    .filter(r => r.id !== canonicalVersionId)
    .map(r => r.id);

  console.log(`\nPreserving canonical version: ${canonicalVersionId}`);
  console.log(`Purging ${versionsToDelete.length} obsolete/duplicate versions:`, versionsToDelete);

  for (const vId of versionsToDelete) {
    await pool.query('DELETE FROM job_matches WHERE resume_version_id = $1', [vId]);
    await pool.query('DELETE FROM ats_reports WHERE resume_id = $1', [vId]);
    await pool.query('DELETE FROM resume_versions WHERE id = $1 AND user_id = $2', [vId, realUserId]);
    console.log(`  ✓ Deleted obsolete resume_version: ${vId}`);
  }

  // Ensure canonical version has a valid parent resume record in resumes table
  let parentResume = await pool.query('SELECT id FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [realUserId]);
  let parentResumeId = parentResume.rows[0]?.id;

  if (!parentResumeId) {
    const newParent = await pool.query(`
      INSERT INTO resumes (id, user_id, file_name, version_name, ats_score, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id
    `, [
      `res_${Date.now()}`,
      realUserId,
      'Pranshu_Patel_FullStack_Resume.docx',
      'Pranshu_Patel_FullStack_Resume.docx',
      91
    ]);
    parentResumeId = newParent.rows[0].id;
  }

  // Backfill resume_id and ensure analysis_data is attached to canonical version
  await pool.query(`
    UPDATE resume_versions
    SET resume_id = $1,
        jobs_matched_count = (SELECT COUNT(*) FROM job_matches WHERE resume_version_id = $2),
        updated_at = NOW()
    WHERE id = $2
  `, [parentResumeId, canonicalVersionId]);

  // Clean old orphan resumes for real user
  await pool.query(`
    DELETE FROM resumes 
    WHERE user_id = $1 AND id NOT IN (
      SELECT DISTINCT resume_id FROM resume_versions WHERE user_id = $1 AND resume_id IS NOT NULL
    )
  `, [realUserId]);

  // Sync profile_data in users table
  const finalVer = (await pool.query('SELECT * FROM resume_versions WHERE id = $1', [canonicalVersionId])).rows[0];
  const userRow = (await pool.query('SELECT profile_data FROM users WHERE id = $1', [realUserId])).rows[0];
  const profileData = userRow?.profile_data || {};

  const cleanVersionObj = {
    id: finalVer.id,
    versionName: finalVer.version_name,
    fileName: finalVer.file_name,
    uploadedAt: 'Saved',
    fileSize: finalVer.file_size || '184 KB',
    score: finalVer.score || 91,
    template: finalVer.template || 'modern_tech',
    parsedData: finalVer.parsed_data || {},
    jobsMatchedCount: finalVer.jobs_matched_count || 12,
    content: finalVer.resume_text,
    resumeText: finalVer.resume_text,
    analysisData: finalVer.analysis_data || null
  };

  profileData.resumeVersions = [cleanVersionObj];
  profileData.activeResumeVersionId = finalVer.id;
  profileData.resumeText = finalVer.resume_text;
  profileData.primaryResumeText = finalVer.resume_text;
  profileData.atsScore = finalVer.score || 91;

  await pool.query('UPDATE users SET profile_data = $1 WHERE id = $2', [JSON.stringify(profileData), realUserId]);
  console.log(`  ✓ Synchronized profile_data for user ${realUserId}`);

  console.log('\n====================================================');
  console.log('FINAL AUDIT POST-CLEANUP');
  console.log('====================================================');

  const finalVers = await pool.query('SELECT id, user_id, resume_id, version_name, score, jobs_matched_count FROM resume_versions');
  console.log('All remaining resume_versions in database:');
  console.table(finalVers.rows);

  const finalResumes = await pool.query('SELECT id, user_id, version_name, ats_score FROM resumes');
  console.log('All remaining resumes in database:');
  console.table(finalResumes.rows);

  process.exit(0);
}

cleanup();
