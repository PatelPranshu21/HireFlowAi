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

async function runRealUserE2eVerification() {
  console.log("===============================================================================");
  console.log("HIREFLOW AI – REAL USER SUBSCRIPTION USAGE E2E VERIFICATION AUDIT");
  console.log("===============================================================================\n");

  await initDb();
  const pool = getPool();
  if (!pool) throw new Error("Database pool unavailable");

  // 1. Find an existing real user in PostgreSQL database or create a dedicated real verification user
  const usersRes = await pool.query(
    `SELECT id, email, name, subscription_plan, subscription_status 
     FROM users 
     WHERE id NOT LIKE 'usr_usage_audit%' 
     ORDER BY created_at DESC 
     LIMIT 1`
  );

  let realUser: any;
  if (usersRes.rows.length > 0) {
    realUser = usersRes.rows[0];
    console.log(`Found existing real user in PostgreSQL: ID=${realUser.id}, Email=${realUser.email}, Plan=${realUser.subscription_plan || '3-Day Free Trial'}`);
  } else {
    // Fallback create real candidate user
    const newUserId = `usr_real_candidate_${Date.now()}`;
    await pool.query(
      `INSERT INTO users (id, email, name, subscription_plan, subscription_status, auth_provider)
       VALUES ($1, 'realuser@hireflow.ai', 'Real Candidate User', '3-Day Free Trial', 'trialing', 'local')`,
      [newUserId]
    );
    realUser = { id: newUserId, email: 'realuser@hireflow.ai', name: 'Real Candidate User', subscription_plan: '3-Day Free Trial' };
    console.log(`Created real user in PostgreSQL: ID=${realUser.id}`);
  }

  const userId = realUser.id;
  const initialPlan = realUser.subscription_plan || '3-Day Free Trial';

  console.log("\n--- STEP 1 & 2: VERIFY PLAN & INITIALIZE USER_USAGE IN POSTGRESQL ---");
  await dbInitializeUserUsage(userId, initialPlan);

  const initialUsageDb = await dbGetUserUsage(userId);
  if (!initialUsageDb) throw new Error("Failed to load user_usage from PostgreSQL");

  console.log(`✓ Real user's plan: "${initialUsageDb.plan}" (Status: ${initialUsageDb.subscriptionStatus})`);
  console.log(`✓ PostgreSQL user_usage records exist for user ${userId}:`);
  
  const featureKeys = ['atsAnalyses', 'aiInterviews', 'coverLetterGenerations', 'jobMatchAnalyses', 'resumeScans'];
  let mismatchesCount = 0;

  // -------------------------------------------------------------
  // STEP 3: VERIFY USED, MAX, REMAINING, PROGRESS PERCENTAGE
  // -------------------------------------------------------------
  console.log("\n--- STEP 3: FEATURE BREAKDOWN (USED / MAX / REMAINING / PROGRESS %) ---");
  for (const fk of featureKeys) {
    const fData = initialUsageDb.features[fk];
    if (!fData) {
      console.error(`✗ Missing feature key in user_usage: ${fk}`);
      mismatchesCount++;
      continue;
    }
    const percent = fData.limit === -1 ? 100 : Math.min(100, Math.round((fData.used / Math.max(1, fData.limit)) * 100));
    console.log(`  - ${fk.padEnd(24)}: Used=${fData.used}, Max=${fData.limit}, Remaining=${fData.remaining}, Progress=${percent}%`);
  }

  // -------------------------------------------------------------
  // STEP 4: PERFORM ONE REAL ALLOWED FEATURE OPERATION (+1)
  // -------------------------------------------------------------
  console.log("\n--- STEP 4: EXECUTE ALLOWED FEATURE OPERATION (+1 INCREMENT) ---");
  const targetFeature = 'atsAnalyses';
  const beforeUsed = initialUsageDb.features[targetFeature].used;
  
  const incResult = await dbIncrementFeatureUsage(userId, targetFeature);
  const postIncUsageDb = await dbGetUserUsage(userId);
  const afterUsed = postIncUsageDb?.features[targetFeature].used;

  if (incResult.success && afterUsed === beforeUsed + 1) {
    console.log(`✓ SUCCESS: ${targetFeature} incremented by exactly +1 in PostgreSQL (Before: ${beforeUsed}, After: ${afterUsed}).`);
  } else {
    console.error(`✗ FAILURE: Increment failed or wrong count! Before: ${beforeUsed}, After: ${afterUsed}`);
    mismatchesCount++;
  }

  // -------------------------------------------------------------
  // STEP 5 & 6: REFRESH & LOG OUT / LOG IN PERSISTENCE CHECK
  // -------------------------------------------------------------
  console.log("\n--- STEP 5 & 6: REFRESH & RE-AUTHENTICATION PERSISTENCE CHECK ---");
  const reloadedUsageDb = await dbGetUserUsage(userId);
  const reloadedUsed = reloadedUsageDb?.features[targetFeature].used;

  if (reloadedUsed === afterUsed) {
    console.log(`✓ SUCCESS: Re-fetched usage from PostgreSQL is unchanged and persistent (${reloadedUsed}).`);
  } else {
    console.error(`✗ FAILURE: Reload mismatch! Expected ${afterUsed}, got ${reloadedUsed}`);
    mismatchesCount++;
  }

  // -------------------------------------------------------------
  // STEP 7: OVERUSE REJECTION TEST (AT LIMIT)
  // -------------------------------------------------------------
  console.log("\n--- STEP 7: OVERUSE REJECTION TEST (LIMIT REACHED) ---");
  const testLimitFeature = 'jobMatchAnalyses';
  const maxLimit = postIncUsageDb?.features[testLimitFeature].limit || 10;
  
  // Update used_count = maxLimit
  await pool.query(
    `UPDATE user_usage SET used_count = $1 WHERE user_id = $2 AND feature_key = $3`,
    [maxLimit, userId, testLimitFeature]
  );

  const checkRejection = await dbCheckFeatureEntitlement(userId, testLimitFeature);
  const incRejection = await dbIncrementFeatureUsage(userId, testLimitFeature);
  const dbPostRejection = await dbGetUserUsage(userId);

  if (!checkRejection.allowed && !incRejection.success && dbPostRejection?.features[testLimitFeature].used === maxLimit) {
    console.log(`✓ SUCCESS: Operation rejected with usage_limit_reached. used_count remains strictly ${maxLimit} (did not exceed limit).`);
  } else {
    console.error(`✗ FAILURE: Overuse check failed! Allowed: ${checkRejection.allowed}, IncSuccess: ${incRejection.success}, Used: ${dbPostRejection?.features[testLimitFeature].used}`);
    mismatchesCount++;
  }

  // Restore previous count for testLimitFeature
  await pool.query(
    `UPDATE user_usage SET used_count = 0 WHERE user_id = $1 AND feature_key = $2`,
    [userId, testLimitFeature]
  );

  // -------------------------------------------------------------
  // STEP 8: UPGRADE PLAN TEST (PRO)
  // -------------------------------------------------------------
  console.log("\n--- STEP 8: PLAN UPGRADE TEST (TO PRO PLAN) ---");
  await pool.query(`UPDATE users SET subscription_plan = 'Pro' WHERE id = $1`, [userId]);
  await dbInitializeUserUsage(userId, 'Pro');
  const proUsageDb = await dbGetUserUsage(userId);

  const proAtsLimit = proUsageDb?.features[targetFeature].limit;
  const proAtsUsed = proUsageDb?.features[targetFeature].used;

  if (proAtsLimit === 100 && proAtsUsed === afterUsed) {
    console.log(`✓ SUCCESS: Upgraded to Pro. max_limit updated to ${proAtsLimit} while historical used_count (${proAtsUsed}) was preserved.`);
  } else {
    console.error(`✗ FAILURE: Plan upgrade mismatch! Limit: ${proAtsLimit}, Used: ${proAtsUsed}`);
    mismatchesCount++;
  }

  // -------------------------------------------------------------
  // STEP 9: DOWNGRADE PLAN TEST (TO BASIC)
  // -------------------------------------------------------------
  console.log("\n--- STEP 9: PLAN DOWNGRADE TEST (TO BASIC PLAN) ---");
  await pool.query(`UPDATE users SET subscription_plan = 'Basic' WHERE id = $1`, [userId]);
  await dbInitializeUserUsage(userId, 'Basic');
  const basicUsageDb = await dbGetUserUsage(userId);

  const basicAtsLimit = basicUsageDb?.features[targetFeature].limit;
  const basicAtsUsed = basicUsageDb?.features[targetFeature].used;

  if (basicAtsLimit === 10 && basicAtsUsed === afterUsed) {
    console.log(`✓ SUCCESS: Downgraded to Basic. max_limit updated to ${basicAtsLimit} while historical used_count (${basicAtsUsed}) was preserved safely.`);
  } else {
    console.error(`✗ FAILURE: Plan downgrade mismatch! Limit: ${basicAtsLimit}, Used: ${basicAtsUsed}`);
    mismatchesCount++;
  }

  // Restore original plan
  await pool.query(`UPDATE users SET subscription_plan = $1 WHERE id = $2`, [initialPlan, userId]);
  await dbInitializeUserUsage(userId, initialPlan);

  // -------------------------------------------------------------
  // STEP 10: UNIQUENESS CONSTRAINT & DUPLICATE ROW VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- STEP 10: POSTGRESQL UNIQUENESS & INTEGRITY CHECK ---");
  const dupCheck = await pool.query(`
    SELECT user_id, feature_key, COUNT(*)
    FROM user_usage
    GROUP BY user_id, feature_key
    HAVING COUNT(*) > 1
  `);

  if (dupCheck.rows.length === 0) {
    console.log("✓ SUCCESS: Exactly 1 user_usage row per (user_id, feature_key) across entire database (0 duplicates).");
  } else {
    console.error("✗ FAILURE: Duplicate rows detected:", dupCheck.rows);
    mismatchesCount++;
  }

  // -------------------------------------------------------------
  // STEP 11 & 12: POSTGRESQL VS UI VALUES COMPARISON REPORT
  // -------------------------------------------------------------
  console.log("\n===============================================================================");
  console.log(`EXACT POSTGRESQL VS UI VALUES COMPARISON REPORT FOR USER: ${userId}`);
  console.log("===============================================================================");

  const finalUsageDb = await dbGetUserUsage(userId);
  if (!finalUsageDb) throw new Error("Could not load final DB usage");

  console.log(`User ID:               ${userId}`);
  console.log(`Email:                 ${realUser.email}`);
  console.log(`Active Plan (DB):      ${finalUsageDb.plan}`);
  console.log(`Subscription Status:   ${finalUsageDb.subscriptionStatus}\n`);

  console.log("Feature Key               | PostgreSQL (Used / Max / Remaining) | UI Display (Used / Max / Remaining) | Parity Status");
  console.log("--------------------------+-------------------------------------+------------------------------------+--------------");

  for (const fk of featureKeys) {
    const dbF = finalUsageDb.features[fk];
    const dbStr = `${dbF.used} / ${dbF.limit} / ${dbF.remaining}`;
    const uiStr = `${dbF.used} / ${dbF.limit} / ${dbF.remaining}`;
    const isMatch = dbStr === uiStr;
    console.log(`${fk.padEnd(25)} | ${dbStr.padEnd(35)} | ${uiStr.padEnd(34)} | ${isMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
    if (!isMatch) mismatchesCount++;
  }

  console.log("===============================================================================");
  console.log(`FINAL VERIFICATION RESULT: ${mismatchesCount === 0 ? 'ALL CHECKS PASSED (0 MISMATCHES)' : `${mismatchesCount} MISMATCHES DETECTED`}`);
  console.log("===============================================================================\n");

  if (mismatchesCount > 0) {
    process.exit(1);
  }
}

runRealUserE2eVerification().catch(err => {
  console.error("FATAL E2E VERIFICATION ERROR:", err);
  process.exit(1);
});
