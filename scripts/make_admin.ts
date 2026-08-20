import "dotenv/config";
import { initDb, getPool } from "../src/db/postgres";

async function makeAdmin() {
  const emailArg = process.argv[2];

  if (!emailArg || !emailArg.includes("@")) {
    console.log("Usage: npx tsx scripts/make_admin.ts <user-email>");
    console.log("Example: npx tsx scripts/make_admin.ts admin@hireflow.ai");
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  await initDb();
  const pool = getPool();
  if (!pool) {
    console.error("Failed to connect to PostgreSQL database");
    process.exit(1);
  }

  const findRes = await pool.query(
    `SELECT id, email, name, role, profile_data FROM users WHERE LOWER(email) = $1`,
    [email]
  );

  if (findRes.rows.length === 0) {
    console.error(`Error: User with email "${email}" not found in database.`);
    console.log("Tip: Please sign up or log in with this account first through the normal HireFlow login flow.");
    process.exit(1);
  }

  const user = findRes.rows[0];
  const profileData = user.profile_data || {};
  profileData.role = "admin";

  await pool.query(
    `UPDATE users SET role = 'admin', profile_data = $1, updated_at = NOW() WHERE id = $2`,
    [profileData, user.id]
  );

  console.log("===============================================================================");
  console.log(`✓ SUCCESS: User "${user.email}" (ID: ${user.id}) HAS BEEN PROMOTED TO ADMIN!`);
  console.log("  Role: admin");
  console.log("  You can now log in normally through HireFlow to access the Admin Portal.");
  console.log("===============================================================================");
}

makeAdmin().catch(err => {
  console.error("Fatal error promoting user to admin:", err);
  process.exit(1);
});
