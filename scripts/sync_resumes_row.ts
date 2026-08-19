import { getPool } from '../src/db/postgres';

async function sync() {
  const p = getPool();
  if (!p) process.exit(1);

  await p.query(`
    UPDATE resumes 
    SET file_name = 'Pranshu_Patel_FullStack_Resume.docx',
        version_name = 'Pranshu_Patel_FullStack_Resume.docx',
        ats_score = 91,
        updated_at = NOW()
    WHERE id = 'res_1787128872558_sc3c'
  `);
  console.log('Synchronized resumes table row.');
  process.exit(0);
}
sync();
