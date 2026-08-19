import { getPool } from '../src/db/postgres';

async function check() {
  const p = getPool();
  if (!p) process.exit(1);

  const res = await p.query('SELECT id, file_name, resume_text, parsed_data FROM resume_versions WHERE id = $1', ['v_1787128872562_9inz']);
  console.log('RESUME TEXT:', res.rows[0]?.resume_text);
  console.log('PARSED DATA:', res.rows[0]?.parsed_data);

  const res2 = await p.query('SELECT id, file_name, resume_text, score, analysis_data IS NOT NULL as has_analysis FROM resume_versions WHERE user_id = $1 ORDER BY created_at DESC', ['usr_google_1786364731336_pcif']);
  for (const r of res2.rows) {
    console.log(r.id, '|', r.file_name, '| score:', r.score, '| has_analysis:', r.has_analysis, '| text length:', r.resume_text?.length, '| sample:', r.resume_text?.substring(0, 100));
  }

  process.exit(0);
}

check();
