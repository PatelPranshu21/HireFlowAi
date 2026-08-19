import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../db';
import { analyzeResumeContentLocally } from '../server/resumeAnalyzer';
import { dbUpdateResumeVersionScore } from '../src/db/postgres';

async function populateAllUnanalyzed() {
  const res = await pool.query('SELECT id, resume_text, version_name, score, analysis_data FROM resume_versions');
  console.log(`Found ${res.rows.length} total resume versions in database.`);

  for (const row of res.rows) {
    const hasValidAnalysis = row.analysis_data && (typeof row.analysis_data === 'object' || typeof row.analysis_data === 'string');
    const parsed = typeof row.analysis_data === 'string' ? JSON.parse(row.analysis_data) : row.analysis_data;
    const isComplete = parsed && parsed.overallScore > 0 && parsed.categoryScores?.length === 10;

    if (!isComplete && row.resume_text && row.resume_text.trim().length > 20) {
      console.log(`Analyzing version: ${row.id} (${row.version_name})...`);
      const analysis = analyzeResumeContentLocally(row.resume_text, 'Full Stack Engineer');
      await dbUpdateResumeVersionScore(row.id, analysis.overallScore, analysis);
      console.log(`✅ Updated ${row.id} with ATS Score: ${analysis.overallScore} and full analysis_data.`);
    } else {
      console.log(`Version ${row.id} already has complete analysis (Score: ${row.score}).`);
    }
  }

  process.exit(0);
}

populateAllUnanalyzed().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
