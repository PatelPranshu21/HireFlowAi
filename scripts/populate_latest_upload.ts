import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../db';
import { analyzeResumeContentLocally } from '../server/resumeAnalyzer';
import { dbUpdateResumeVersionScore } from '../src/db/postgres';

async function populateLatest() {
  const versionId = 'v_1787142644899_2tdx';
  const res = await pool.query('SELECT id, resume_text, parsed_data FROM resume_versions WHERE id = $1', [versionId]);
  if (res.rows.length === 0) {
    console.log('Row not found');
    return;
  }
  const row = res.rows[0];
  const analysis = analyzeResumeContentLocally(row.resume_text, 'Full Stack Engineer');
  console.log(`Computed analysis for ${versionId}: score=${analysis.overallScore}`);
  await dbUpdateResumeVersionScore(versionId, analysis.overallScore, analysis);
  console.log('Updated row in database successfully!');
  process.exit(0);
}

populateLatest().catch(e => { console.error(e); process.exit(1); });
