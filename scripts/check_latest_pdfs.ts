import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../db';

async function checkLatestPdfs() {
  const res = await pool.query(
    'SELECT id, user_id, version_name, file_name, score, length(resume_text) as text_len, resume_text, parsed_data, analysis_data, created_at FROM resume_versions ORDER BY created_at DESC LIMIT 10'
  );
  console.log(`Found ${res.rows.length} latest versions:`);
  for (const row of res.rows) {
    console.log('---');
    console.log('ID:', row.id);
    console.log('File Name:', row.file_name || row.version_name);
    console.log('Score:', row.score);
    console.log('Text Length:', row.text_len);
    console.log('Has analysis_data:', Boolean(row.analysis_data));
    console.log('First 200 chars of resume_text:', row.resume_text ? row.resume_text.substring(0, 200) : '<EMPTY>');
  }
  process.exit(0);
}

checkLatestPdfs().catch(e => { console.error(e); process.exit(1); });
