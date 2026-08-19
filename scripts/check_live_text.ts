import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../db';

async function checkResumeText() {
  const versionId = 'v_1787142290706_da29';
  const res = await pool.query(
    'SELECT id, resume_text, length(resume_text) as text_len, parsed_data FROM resume_versions WHERE id = $1',
    [versionId]
  );
  if (res.rows.length > 0) {
    const row = res.rows[0];
    console.log('ID:', row.id);
    console.log('Text Length:', row.text_len);
    console.log('First 500 chars of resume_text:');
    console.log(row.resume_text ? row.resume_text.substring(0, 500) : '<EMPTY>');
    console.log('parsed_data:', JSON.stringify(row.parsed_data, null, 2));
  } else {
    console.log('Row not found');
  }
  process.exit(0);
}

checkResumeText().catch(e => { console.error(e); process.exit(1); });
