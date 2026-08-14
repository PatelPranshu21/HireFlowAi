const { Client } = require('pg');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'd:\\HireFlowAi\\.env' });
const JWT_SECRET = process.env.SESSION_SECRET || 'YOUR_RANDOM_SECRET';
const dbUrl = process.env.DATABASE_URL;

async function runVerification() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err);
    process.exit(1);
  }

  const testUserId = 'test_usr_verify_' + Date.now();
  const testUserEmail = 'verify_' + Date.now() + '@hireflow.ai';
  const token = jwt.sign({ userId: testUserId }, JWT_SECRET, { expiresIn: '1h' });
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log(`\n==================================================`);
  console.log(`PHASE 1 — INSPECT REAL DATABASE STATE (Setup Profile)`);
  console.log(`==================================================`);

  // Insert a premium user directly into DB to bypass limits
  await client.query(`
    INSERT INTO users (id, email, name, password_hash, subscription_plan, subscription_status)
    VALUES ($1, $2, $3, 'testpass', 'Pro Tier', 'active')
    ON CONFLICT (email) DO NOTHING
  `, [testUserId, testUserEmail, 'Verification User']);

  await fetch('http://localhost:3000/api/auth/profile', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ 
      name: 'Verification User', 
      email: testUserEmail,
      subscriptionPlan: 'Pro Tier',
      usageLimits: { atsAnalyses: { used: 0, max: 9999 } }
    })
  });

  const checkDb = async () => {
    const resumes = await client.query('SELECT count(*) FROM resumes WHERE user_id = $1', [testUserId]);
    const versions = await client.query('SELECT count(*) FROM resume_versions WHERE user_id = $1', [testUserId]);
    const reports = await client.query('SELECT count(*) FROM ats_reports WHERE user_id = $1', [testUserId]);
    console.log(`resumes row count: ${resumes.rows[0].count}`);
    console.log(`resume_versions row count: ${versions.rows[0].count}`);
    console.log(`ats_reports row count: ${reports.rows[0].count}`);
  };
  await checkDb();

  console.log(`\n==================================================`);
  console.log(`PHASE 2 — VERIFY RESUME A`);
  console.log(`==================================================`);
  
  const textA = "Junior Developer with 1 year experience in HTML and CSS. I made a calculator app.";
  const verA_ID = 'ver_a_' + Date.now();
  
  console.log("Uploading Resume A...");
  await fetch('http://localhost:3000/api/auth/resume', {
    method: 'POST',
    headers,
    body: JSON.stringify({ fileName: 'resumeA.pdf', fileText: textA, score: 0, versionId: verA_ID })
  });

  console.log("Analyzing Resume A...");
  const analyzeARes = await fetch('http://localhost:3000/api/ai/analyze-resume', {
    method: 'POST',
    headers,
    body: JSON.stringify({ resumeText: textA, targetRole: 'Junior Developer', resumeVersionId: verA_ID })
  });
  const dataA = await analyzeARes.json();
  console.log("Analyze A Response:", dataA);
  const scoreA = dataA.overallScore;
  console.log(`Resume A Score: ${scoreA}`);

  const dbVerA = await client.query('SELECT * FROM resume_versions WHERE id = $1', [verA_ID]);
  if (dbVerA.rows.length === 1 && dbVerA.rows[0].score === scoreA) {
    console.log(`PHASE 2: PASS`);
  } else {
    console.log(`PHASE 2: FAIL - DB mismatch`);
  }

  console.log(`\n==================================================`);
  console.log(`PHASE 3 — VERIFY RESUME B`);
  console.log(`==================================================`);
  
  const textB = "Principal AI Engineer with 15 years experience in deep learning, PyTorch, Kubernetes, distributed systems. Built highly scalable recommendation engines serving millions of RPS.";
  const verB_ID = 'ver_b_' + Date.now();
  
  console.log("Uploading Resume B...");
  await fetch('http://localhost:3000/api/auth/resume', {
    method: 'POST',
    headers,
    body: JSON.stringify({ fileName: 'resumeB.pdf', fileText: textB, score: 0, versionId: verB_ID })
  });

  console.log("Analyzing Resume B...");
  const analyzeBRes = await fetch('http://localhost:3000/api/ai/analyze-resume', {
    method: 'POST',
    headers,
    body: JSON.stringify({ resumeText: textB, targetRole: 'Principal AI Engineer', resumeVersionId: verB_ID })
  });
  const dataB = await analyzeBRes.json();
  console.log("Analyze B Response:", dataB);
  const scoreB = dataB.overallScore;
  console.log(`Resume B Score: ${scoreB}`);

  const dbVerB = await client.query('SELECT * FROM resume_versions WHERE id = $1', [verB_ID]);
  if (dbVerB.rows.length === 1 && dbVerB.rows[0].score === scoreB && scoreA !== scoreB) {
    console.log(`PHASE 3: PASS - DB distinct score stored`);
  } else {
    console.log(`PHASE 3: FAIL - score mismatch or identical scores (A:${scoreA}, B:${scoreB})`);
  }

  console.log(`\n==================================================`);
  console.log(`PHASE 4 — VERIFY ACTIVE RESUME / PROFILE DB`);
  console.log(`==================================================`);
  
  // Update Profile Active Version to B via endpoint
  await fetch('http://localhost:3000/api/auth/profile', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ activeResumeVersionId: verB_ID })
  });

  const userDataRes = await fetch('http://localhost:3000/api/auth/data', { headers });
  const userData = await userDataRes.json();
  console.log("UserData keys:", Object.keys(userData));
  console.log("User object keys:", userData.data && userData.data.user ? Object.keys(userData.data.user) : 'No user object');
  
  let pData = userData?.data?.user?.profile_data || {};
  if (pData.activeResumeVersionId === verB_ID) {
    console.log(`PHASE 4/5: PASS - Active ID in profile synced`);
  } else {
    console.log(`PHASE 4/5: FAIL - Active ID mismatch. Got ${pData.activeResumeVersionId}`);
  }

  console.log(`\n==================================================`);
  console.log(`PHASE 8 — VERIFY REAL DELETE`);
  console.log(`==================================================`);
  
  const deleteRes = await fetch(`http://localhost:3000/api/auth/resume-version/${verA_ID}`, {
    method: 'DELETE',
    headers
  });
  console.log("Delete Status:", deleteRes.status);
  
  const checkDelVer = await client.query('SELECT * FROM resume_versions WHERE id = $1', [verA_ID]);
  const checkDelResumes = await client.query('SELECT * FROM resumes WHERE user_id = $1', [testUserId]);
  
  if (checkDelVer.rows.length === 0 && checkDelResumes.rows.length === 1) {
    console.log(`PHASE 8: PASS - Database completely deleted version and orphaned resumes`);
  } else {
    console.log(`PHASE 8: FAIL - Zombie rows remain! Ver count: ${checkDelVer.rows.length}, Resumes count: ${checkDelResumes.rows.length}`);
  }

  await client.end();
}

runVerification().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
