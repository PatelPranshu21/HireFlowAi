import "dotenv/config";
import jwt from "jsonwebtoken";
import { getPool, initDb } from "../src/db/postgres";

async function testAuthSavedJobsHttp() {
  console.log("--- Testing Authenticated Saved Jobs HTTP Endpoints ---");
  await initDb();
  const pool = getPool();
  if (!pool) throw new Error("Database pool unavailable");

  const testUserId = "usr_http_test_01";
  await pool.query(
    `INSERT INTO users (id, email, name, auth_provider)
     VALUES ($1, $2, $3, 'local')
     ON CONFLICT (id) DO NOTHING`,
    [testUserId, "httptest@hireflow.ai", "HTTP Test User"]
  );

  const secret = process.env.SESSION_SECRET || 'hireflow_super_secret_jwt_key_2026';
  const token = jwt.sign({ userId: testUserId, email: "httptest@hireflow.ai" }, secret, { expiresIn: '1h' });

  // Get 1 real job
  const jobRes = await pool.query(`SELECT id, title, company FROM jobs LIMIT 2`);
  if (jobRes.rows.length === 0) throw new Error("No jobs found");
  const testJob = jobRes.rows[0];
  console.log(`Using Job: ${testJob.id} ("${testJob.title}" at "${testJob.company}")`);

  const baseUrl = "http://localhost:3000";
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 1. Check isJobSaved initially (should be false)
  const isSavedRes1 = await fetch(`${baseUrl}/api/jobs/${testJob.id}/saved`, { headers: authHeaders });
  const isSavedData1 = await isSavedRes1.json();
  console.log("Initial isSaved check:", isSavedData1);
  if (isSavedData1.saved !== false) throw new Error("Expected false for initial isSaved");

  // 2. Save Job
  const saveRes = await fetch(`${baseUrl}/api/jobs/${testJob.id}/save`, {
    method: 'POST',
    headers: authHeaders
  });
  const saveData = await saveRes.json();
  console.log("POST /api/jobs/:jobId/save response:", saveData);
  if (!saveData.success || !saveData.saved) throw new Error("Failed to save job via HTTP");

  // 3. Check isJobSaved (should be true)
  const isSavedRes2 = await fetch(`${baseUrl}/api/jobs/${testJob.id}/saved`, { headers: authHeaders });
  const isSavedData2 = await isSavedRes2.json();
  console.log("After save isSaved check:", isSavedData2);
  if (isSavedData2.saved !== true) throw new Error("Expected true after save");

  // 4. GET /api/jobs/saved
  const getSavedRes = await fetch(`${baseUrl}/api/jobs/saved`, { headers: authHeaders });
  const getSavedData = await getSavedRes.json();
  console.log(`GET /api/jobs/saved returned ${getSavedData.count} jobs:`, getSavedData.jobs?.map((j: any) => ({ id: j.id, title: j.title })));
  if (!getSavedData.success || getSavedData.count < 1) throw new Error("GET /api/jobs/saved failed to return saved job");

  // 5. Unsave Job
  const unsaveRes = await fetch(`${baseUrl}/api/jobs/${testJob.id}/save`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const unsaveData = await unsaveRes.json();
  console.log("DELETE /api/jobs/:jobId/save response:", unsaveData);
  if (!unsaveData.success || unsaveData.saved !== false) throw new Error("Failed to unsave job via HTTP");

  // 6. Verify GET /api/jobs/saved is now empty
  const getSavedRes2 = await fetch(`${baseUrl}/api/jobs/saved`, { headers: authHeaders });
  const getSavedData2 = await getSavedRes2.json();
  console.log(`GET /api/jobs/saved after unsave returned ${getSavedData2.count} jobs.`);
  if (getSavedData2.count !== 0) throw new Error("Job was not removed from saved list");

  // Clean up test user
  await pool.query(`DELETE FROM saved_jobs WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);

  console.log("\nPASS: All Authenticated Saved Jobs HTTP Endpoints Passed Successfully!");
}

testAuthSavedJobsHttp().catch(err => {
  console.error("HTTP Test Error:", err);
  process.exit(1);
});
