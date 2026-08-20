import "dotenv/config";
import { 
  initDb, 
  getPool, 
  dbInitializeUserUsage, 
  dbGetUserUsage, 
  dbCheckFeatureEntitlement, 
  dbIncrementFeatureUsage, 
  dbDecrementFeatureUsage 
} from "../src/db/postgres";

async function runUsageSystemTests() {
  console.log("===============================================================================");
  console.log("HIREFLOW AI – SUBSCRIPTION USAGE TRACKING & USER USAGE SYSTEM AUDIT");
  console.log("===============================================================================\n");

  await initDb();
  const pool = getPool();
  if (!pool) throw new Error("Database pool unavailable");

  const testUserId = "usr_usage_audit_test_01";

  // Cleanup pre-existing test user
  await pool.query(`DELETE FROM user_usage WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);

  // Create test user in `users` table
  await pool.query(
    `INSERT INTO users (id, email, name, subscription_plan, subscription_status, auth_provider)
     VALUES ($1, $2, $3, '3-Day Free Trial', 'trialing', 'local')`,
    [testUserId, "usageaudit@hireflow.ai", "Usage Audit User"]
  );

  let testsPassed = 0;
  const totalTests = 7;

  // -------------------------------------------------------------
  // 1. INITIALIZATION & IDEMPOTENCY TEST
  // -------------------------------------------------------------
  console.log("--- TEST 1: USAGE INITIALIZATION & IDEMPOTENCY ---");
  await dbInitializeUserUsage(testUserId, '3-Day Free Trial');

  const rows1 = await pool.query(`SELECT * FROM user_usage WHERE user_id = $1 ORDER BY feature_key`, [testUserId]);
  const featureKeys = rows1.rows.map(r => r.feature_key);

  const expectedKeys = ['aiInterviews', 'atsAnalyses', 'coverLetterGenerations', 'jobMatchAnalyses', 'resumeScans'];
  const hasAllKeys = expectedKeys.every(k => featureKeys.includes(k));

  // Re-run initialization to test idempotency
  await dbInitializeUserUsage(testUserId, '3-Day Free Trial');
  const rows2 = await pool.query(`SELECT * FROM user_usage WHERE user_id = $1`, [testUserId]);

  if (hasAllKeys && rows1.rows.length === 5 && rows2.rows.length === 5) {
    console.log("✓ TEST 1 PASSED: All 5 feature keys initialized. Idempotent UPSERT verified (5 rows).\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 1 FAILED: Expected 5 rows, got:", rows2.rows.length, featureKeys);
  }

  // -------------------------------------------------------------
  // 2. ATOMIC USAGE INCREMENT & PERSISTENCE TEST
  // -------------------------------------------------------------
  console.log("--- TEST 2: ATOMIC INCREMENT & PERSISTENCE ---");
  const incRes1 = await dbIncrementFeatureUsage(testUserId, 'atsAnalyses');
  const dbUsage1 = await dbGetUserUsage(testUserId);

  if (incRes1.success && dbUsage1?.features.atsAnalyses.used === 1) {
    console.log("✓ TEST 2 PASSED: atsAnalyses incremented 0 -> 1 and persisted in PostgreSQL.\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 2 FAILED:", incRes1, dbUsage1);
  }

  // -------------------------------------------------------------
  // 3. OVERUSE REJECTION TEST
  // -------------------------------------------------------------
  console.log("--- TEST 3: OVERUSE REJECTION WHEN LIMIT REACHED ---");
  // Set used_count = 3 (max_limit = 3)
  await pool.query(`UPDATE user_usage SET used_count = 3 WHERE user_id = $1 AND feature_key = 'atsAnalyses'`, [testUserId]);

  const checkRes = await dbCheckFeatureEntitlement(testUserId, 'atsAnalyses');
  const incResOveruse = await dbIncrementFeatureUsage(testUserId, 'atsAnalyses');

  if (!checkRes.allowed && !incResOveruse.success && incResOveruse.used === 3 && incResOveruse.remaining === 0) {
    console.log("✓ TEST 3 PASSED: Overuse correctly rejected when limit (3/3) reached.\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 3 FAILED: Overuse not rejected:", checkRes, incResOveruse);
  }

  // -------------------------------------------------------------
  // 4. FAILED OPERATION ROLLBACK (DECREMENT) TEST
  // -------------------------------------------------------------
  console.log("--- TEST 4: FAILED OPERATION ROLLBACK (DECREMENT) ---");
  await dbDecrementFeatureUsage(testUserId, 'atsAnalyses');
  const dbUsagePostRollback = await dbGetUserUsage(testUserId);

  if (dbUsagePostRollback?.features.atsAnalyses.used === 2) {
    console.log("✓ TEST 4 PASSED: Usage successfully rolled back (3 -> 2) on simulated operation failure.\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 4 FAILED:", dbUsagePostRollback);
  }

  // -------------------------------------------------------------
  // 5. CONCURRENCY SAFETY TEST
  // -------------------------------------------------------------
  console.log("--- TEST 5: CONCURRENCY SAFETY (10 SIMULTANEOUS REQUESTS AT LIMIT=3) ---");
  // Reset used_count = 0, max_limit = 3
  await pool.query(`UPDATE user_usage SET used_count = 0, max_limit = 3 WHERE user_id = $1 AND feature_key = 'atsAnalyses'`, [testUserId]);

  // Fire 10 simultaneous atomic increment calls
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(dbIncrementFeatureUsage(testUserId, 'atsAnalyses'));
  }
  const results = await Promise.all(promises);

  const successfulIncrements = results.filter(r => r.success).length;
  const finalCheck = await dbGetUserUsage(testUserId);
  const finalUsed = finalCheck?.features.atsAnalyses.used;

  if (successfulIncrements === 3 && finalUsed === 3) {
    console.log(`✓ TEST 5 PASSED: Exactly 3/10 concurrent requests succeeded. PostgreSQL final used_count = 3 (no limit overflow).\n`);
    testsPassed++;
  } else {
    console.error(`✗ TEST 5 FAILED: Successful increments: ${successfulIncrements}, Final used_count: ${finalUsed}`);
  }

  // -------------------------------------------------------------
  // 6. PLAN UPGRADE (MAX_LIMIT UPDATE) TEST
  // -------------------------------------------------------------
  console.log("--- TEST 6: PLAN UPGRADE (MAX_LIMIT UPDATE) ---");
  await pool.query(`UPDATE users SET subscription_plan = 'Pro' WHERE id = $1`, [testUserId]);
  await dbInitializeUserUsage(testUserId, 'Pro');
  const proUsage = await dbGetUserUsage(testUserId);

  if (proUsage?.features.atsAnalyses.limit === 100 && proUsage?.features.atsAnalyses.used === 3) {
    console.log("✓ TEST 6 PASSED: Plan upgrade updated max_limit to 100 while preserving historical used_count=3.\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 6 FAILED:", proUsage);
  }

  // -------------------------------------------------------------
  // 7. DATABASE INTEGRITY & DUPLICATE PREVENTION VERIFICATION
  // -------------------------------------------------------------
  console.log("--- TEST 7: POSTGRESQL DATABASE INTEGRITY VERIFICATION ---");
  
  // Check duplicate rows across user_usage table
  const dupCheck = await pool.query(`
    SELECT user_id, feature_key, COUNT(*)
    FROM user_usage
    GROUP BY user_id, feature_key
    HAVING COUNT(*) > 1
  `);

  // Check invalid usage values
  const invalidCheck = await pool.query(`
    SELECT *
    FROM user_usage
    WHERE used_count < 0
       OR (max_limit >= 0 AND used_count > max_limit)
  `);

  if (dupCheck.rows.length === 0 && invalidCheck.rows.length === 0) {
    console.log("✓ TEST 7 PASSED: 0 duplicate rows and 0 invalid usage rows across entire PostgreSQL database.\n");
    testsPassed++;
  } else {
    console.error("✗ TEST 7 FAILED: Duplicates:", dupCheck.rows, "Invalid:", invalidCheck.rows);
  }

  // Cleanup test user
  await pool.query(`DELETE FROM user_usage WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);

  console.log("===============================================================================");
  console.log(`FINAL RESULT: ${testsPassed} / ${totalTests} USAGE SYSTEM AUDIT TESTS PASSED`);
  console.log("===============================================================================\n");

  if (testsPassed !== totalTests) {
    process.exit(1);
  }
}

runUsageSystemTests().catch(err => {
  console.error("FATAL USAGE SYSTEM TEST ERROR:", err);
  process.exit(1);
});
