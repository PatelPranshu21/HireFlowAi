import "dotenv/config";
import { 
  initDb, 
  getPool, 
  dbSaveJobApplication, 
  dbUpdateJobApplicationStatus, 
  dbGetUserJobApplications, 
  dbGetAnalyticsOverview,
  dbSaveJobMatches,
  dbSaveSavedJob
} from "../src/db/postgres";

async function runAnalyticsVerification() {
  console.log("===============================================================================");
  console.log("HIREFLOW AI – ANALYTICS & APPLICATION TRACKING VERIFICATION AUDIT");
  console.log("===============================================================================\n");

  await initDb();
  const pool = getPool();
  if (!pool) throw new Error("Database pool unavailable");

  const testUserId = "usr_analytics_audit_test_01";
  const testJobId1 = "job_test_analytics_101";
  const testJobId2 = "job_test_analytics_102";

  // Cleanup pre-existing test data
  await pool.query(`DELETE FROM user_job_applications WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM job_matches WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM saved_jobs WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);

  // Create test user in `users` table
  await pool.query(
    `INSERT INTO users (id, email, name, subscription_plan, subscription_status, auth_provider)
     VALUES ($1, $2, $3, '3-Day Free Trial', 'trialing', 'local')`,
    [testUserId, "analyticsaudit@hireflow.ai", "Analytics Audit User"]
  );

  let testsPassed = 0;
  const totalTests = 6;

  // -------------------------------------------------------------
  // 1. APPLICATION CREATION & DUPLICATE PREVENTION TEST
  // -------------------------------------------------------------
  console.log("--- TEST 1: APPLICATION CREATION & DUPLICATE PREVENTION ---");
  const app1 = await dbSaveJobApplication(testUserId, {
    job_id: testJobId1,
    title: "Senior Full Stack Engineer",
    company: "Acme Corp",
    status: "applied",
    stage: "Applied",
    match_score: 92
  });

  // Attempt duplicate insert for same (user_id, job_id)
  const dupApp = await dbSaveJobApplication(testUserId, {
    job_id: testJobId1,
    title: "Senior Full Stack Engineer",
    company: "Acme Corp",
    status: "applied",
    stage: "Applied",
    match_score: 92
  });

  if (app1 && !app1.isDuplicate && dupApp && dupApp.isDuplicate) {
    console.log("✓ TEST 1 PASSED: Application created cleanly. Duplicate tracking correctly detected (isDuplicate = true).\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 1 FAILED:", { app1, dupApp });
  }

  // -------------------------------------------------------------
  // 2. STATUS UPDATE PERSISTENCE TEST
  // -------------------------------------------------------------
  console.log("--- TEST 2: APPLICATION STATUS UPDATE PERSISTENCE ---");
  const app2 = await dbSaveJobApplication(testUserId, {
    job_id: testJobId2,
    title: "Frontend Architect",
    company: "TechCorp Global",
    status: "applied",
    stage: "Applied",
    match_score: 88
  });

  const updatedStatus = await dbUpdateJobApplicationStatus(testUserId, app2.id, "interview", "Interview");
  const userApps = await dbGetUserJobApplications(testUserId);
  const reloadedApp2 = userApps.find(a => a.id === app2.id);

  if (updatedStatus && reloadedApp2 && reloadedApp2.status === "interview" && reloadedApp2.stage === "Interview") {
    console.log("✓ TEST 2 PASSED: Application status updated Applied -> Interview and persisted in PostgreSQL.\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 2 FAILED:", { updatedStatus, reloadedApp2 });
  }

  // -------------------------------------------------------------
  // 3. JOB MATCHES & SKILL GAP PERSISTENCE TEST
  // -------------------------------------------------------------
  console.log("--- TEST 3: JOB MATCHES & SKILL GAP PERSISTENCE ---");
  const fakeResumeVersionId = `rv_${Date.now()}`;
  // Create dummy resume version for FK
  const dummyResume = await pool.query(
    `INSERT INTO resumes (id, user_id, file_name, resume_text) VALUES ($1, $2, 'test.pdf', 'Resume Text') RETURNING id`,
    [`res_${Date.now()}`, testUserId]
  );
  await pool.query(
    `INSERT INTO resume_versions (id, resume_id, user_id, version_name, resume_text) VALUES ($1, $2, $3, 'v1', 'Text')`,
    [fakeResumeVersionId, dummyResume.rows[0].id, testUserId]
  );

  await dbSaveJobMatches(testUserId, fakeResumeVersionId, [
    {
      job_id: testJobId1,
      match_score: 92,
      matched_skills: ["React", "TypeScript", "Node.js"],
      missing_skills: ["Docker", "Kubernetes"],
      why_match: "High skill overlap"
    },
    {
      job_id: testJobId2,
      match_score: 88,
      matched_skills: ["React", "CSS"],
      missing_skills: ["Docker", "GraphQL"],
      why_match: "Good match"
    }
  ]);

  const overview1 = await dbGetAnalyticsOverview(testUserId, "all");
  const topMissingSkills = overview1.skills.topMissing.map(s => s.skill.toLowerCase());

  if (topMissingSkills.includes("docker") && overview1.jobMatches.totalMatches === 2 && overview1.jobMatches.avgMatchScore === 90) {
    console.log("✓ TEST 3 PASSED: Job match statistics and top missing skills (Docker, Kubernetes) derived cleanly from PostgreSQL.\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 3 FAILED:", overview1.jobMatches, overview1.skills);
  }

  // -------------------------------------------------------------
  // 4. SAVED JOBS & SAVED -> APPLIED CONVERSION TEST
  // -------------------------------------------------------------
  console.log("--- TEST 4: SAVED JOBS & SAVED -> APPLIED CONVERSION ---");
  await pool.query(
    `INSERT INTO jobs (id, title, company, description, location, url) VALUES ($1, 'Senior Engineer', 'Acme', 'Desc', 'Remote', 'https://example.com') ON CONFLICT DO NOTHING`,
    [testJobId1]
  );
  await dbSaveSavedJob(testUserId, testJobId1);

  const overview2 = await dbGetAnalyticsOverview(testUserId, "all");

  if (overview2.savedJobs.totalSaved === 1 && overview2.savedJobs.savedAndApplied === 1 && overview2.savedJobs.savedToAppliedRate === 100) {
    console.log("✓ TEST 4 PASSED: Saved jobs and Saved -> Applied conversion (1/1 = 100%) calculated accurately.\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 4 FAILED:", overview2.savedJobs);
  }

  // -------------------------------------------------------------
  // 5. DATE RANGE FILTERING TEST (7D / 30D / 90D / ALL)
  // -------------------------------------------------------------
  console.log("--- TEST 5: DATE RANGE FILTERING (7D / 30D / 90D / ALL) ---");
  const overview7d = await dbGetAnalyticsOverview(testUserId, "7d");
  const overviewAll = await dbGetAnalyticsOverview(testUserId, "all");

  if (overview7d.applications.total === 2 && overviewAll.applications.total === 2) {
    console.log("✓ TEST 5 PASSED: Date range filters execute valid SQL date intervals without error.\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 5 FAILED:", { overview7d, overviewAll });
  }

  // -------------------------------------------------------------
  // 6. ZERO SYNTHETIC DATA EMPTY STATE TEST FOR UNUSED USER
  // -------------------------------------------------------------
  console.log("--- TEST 6: ZERO SYNTHETIC DATA EMPTY STATE VERIFICATION ---");
  const emptyUserId = "usr_analytics_empty_01";
  const emptyOverview = await dbGetAnalyticsOverview(emptyUserId, "all");

  const isPureZero = 
    emptyOverview.applications.total === 0 &&
    emptyOverview.jobMatches.totalMatches === 0 &&
    emptyOverview.skills.topMissing.length === 0 &&
    emptyOverview.savedJobs.totalSaved === 0;

  if (isPureZero) {
    console.log("✓ TEST 6 PASSED: 0 synthetic, fake, or hardcoded analytics data generated for brand-new users.\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 6 FAILED: Non-zero values generated for empty user:", emptyOverview);
  }

  // Cleanup test user data
  await pool.query(`DELETE FROM user_job_applications WHERE user_id IN ($1, $2)`, [testUserId, emptyUserId]);
  await pool.query(`DELETE FROM job_matches WHERE user_id IN ($1, $2)`, [testUserId, emptyUserId]);
  await pool.query(`DELETE FROM saved_jobs WHERE user_id IN ($1, $2)`, [testUserId, emptyUserId]);
  await pool.query(`DELETE FROM users WHERE id IN ($1, $2)`, [testUserId, emptyUserId]);

  console.log("===============================================================================");
  console.log(`FINAL RESULT: ${testsPassed} / ${totalTests} ANALYTICS AUDIT TESTS PASSED`);
  console.log("===============================================================================\n");

  if (testsPassed !== totalTests) {
    process.exit(1);
  }
}

runAnalyticsVerification().catch(err => {
  console.error("FATAL ANALYTICS AUDIT ERROR:", err);
  process.exit(1);
});
