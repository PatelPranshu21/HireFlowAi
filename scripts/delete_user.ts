import "dotenv/config";
import { initDb, getPool } from "../src/db/postgres";

async function deleteUser() {
  const emailArg = process.argv[2] || "pranshupatel3222@gmail.com";
  const email = emailArg.trim().toLowerCase();

  await initDb();
  const pool = getPool();
  if (!pool) throw new Error("Database connection unavailable");

  const findRes = await pool.query(
    `SELECT id, email, name FROM users WHERE LOWER(email) = $1`,
    [email]
  );

  if (findRes.rows.length === 0) {
    console.log(`User "${email}" does not exist in database. You can proceed to create this account on the signup page.`);
    return;
  }

  const userId = findRes.rows[0].id;
  console.log(`Found existing user "${email}" (ID: ${userId}). Cleaning up all associated database records...`);

  // Safe deletion helper
  const safeDelete = async (query: string, params: any[]) => {
    try {
      await pool.query(query, params);
    } catch (e: any) {
      // Ignore missing table errors
    }
  };

  await safeDelete(`DELETE FROM user_job_applications WHERE user_id = $1`, [userId]);
  await safeDelete(`DELETE FROM job_matches WHERE user_id = $1`, [userId]);
  await safeDelete(`DELETE FROM saved_jobs WHERE user_id = $1`, [userId]);
  await safeDelete(`DELETE FROM user_usage WHERE user_id = $1`, [userId]);
  await safeDelete(`DELETE FROM ats_reports WHERE user_id = $1`, [userId]);
  await safeDelete(`DELETE FROM interview_sessions WHERE user_id = $1`, [userId]);
  await safeDelete(`DELETE FROM resume_versions WHERE user_id = $1`, [userId]);
  await safeDelete(`DELETE FROM resumes WHERE user_id = $1`, [userId]);
  await safeDelete(`DELETE FROM users WHERE id = $1`, [userId]);

  console.log("===============================================================================");
  console.log(`✓ SUCCESS: User "${email}" and all associated data deleted from PostgreSQL.`);
  console.log(`  You can now register a brand new account with "${email}" on the signup page!`);
  console.log("===============================================================================");
}

deleteUser().catch(err => {
  console.error("Error deleting user:", err);
  process.exit(1);
});
