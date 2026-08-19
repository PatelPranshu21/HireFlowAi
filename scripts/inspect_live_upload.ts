import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../db';

async function inspectLiveUpload() {
  const versionId = 'v_1787143253315_n705';
  const userId = 'usr_google_1786364731336_pcif';

  console.log(`Checking PostgreSQL for versionId: ${versionId} and userId: ${userId}`);

  const res = await pool.query(
    'SELECT id, user_id, version_name, file_name, score, jobs_matched_count, analysis_data, created_at FROM resume_versions WHERE id = $1',
    [versionId]
  );

  if (res.rows.length === 0) {
    console.log('Version not found by exact ID. Fetching latest 3 resume_versions:');
    const latest = await pool.query(
      'SELECT id, user_id, version_name, file_name, score, jobs_matched_count, analysis_data, created_at FROM resume_versions ORDER BY created_at DESC LIMIT 3'
    );
    for (const r of latest.rows) {
      console.log('---');
      console.log('ID:', r.id);
      console.log('User ID:', r.user_id);
      console.log('Version Name:', r.version_name);
      console.log('File Name:', r.file_name);
      console.log('Score:', r.score);
      console.log('Jobs Matched:', r.jobs_matched_count);
      console.log('Has analysis_data:', Boolean(r.analysis_data));
      if (r.analysis_data) {
        const d = typeof r.analysis_data === 'string' ? JSON.parse(r.analysis_data) : r.analysis_data;
        console.log('Overall Score in JSON:', d.overallScore);
        console.log('Category breakdown count:', d.categoryBreakdown?.length || d.categoryScores?.length);
        console.log('Section analysis count:', d.sectionAnalysis?.length || d.sectionAnalyses?.length);
        console.log('Improvements count:', d.improvements?.length || d.aiSuggestions?.length);
        console.log('Detected keywords:', d.keywordList?.filter((k: any) => k.detected && k.foundInResume).map((k: any) => k.keyword));
      }
    }
    process.exit(0);
  }

  const row = res.rows[0];
  console.log('====================================================');
  console.log('LIVE POSTGRESQL ROW INSPECTION');
  console.log('====================================================');
  console.log('Version ID:', row.id);
  console.log('User ID:', row.user_id);
  console.log('File Name:', row.file_name || row.version_name);
  console.log('ATS Score:', row.score);
  console.log('Jobs Matched Count:', row.jobs_matched_count);
  console.log('Has analysis_data JSONB:', Boolean(row.analysis_data));

  const data = typeof row.analysis_data === 'string' ? JSON.parse(row.analysis_data) : row.analysis_data;
  if (data) {
    console.log('\n--- analysis_data JSON Content ---');
    console.log('overallScore:', data.overallScore);
    console.log('summary:', data.summary);
    console.log('categoryScores (count):', data.categoryScores?.length || data.categoryBreakdown?.length);
    console.log('sectionAnalyses (count):', data.sectionAnalyses?.length || data.sectionAnalysis?.length);
    console.log('aiSuggestions (count):', data.aiSuggestions?.length || data.improvements?.length);
    
    const detected = (data.keywordList || []).filter((k: any) => k.detected && k.foundInResume);
    console.log('Detected Skills Count:', detected.length);
    console.log('Detected Skills List:', detected.map((k: any) => `${k.keyword} (${k.frequency}x)`).join(', '));
  }

  // Also check job_matches table
  const jmRes = await pool.query(
    'SELECT count(*) as cnt FROM job_matches WHERE resume_version_id = $1',
    [versionId]
  );
  console.log('\nPersisted Job Matches Count in DB:', jmRes.rows[0]?.cnt);

  process.exit(0);
}

inspectLiveUpload().catch(err => {
  console.error('Error inspecting upload:', err);
  process.exit(1);
});
