const fs = require('fs');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'd:/HireFlowAi/.env' });

const JWT_SECRET = process.env.SESSION_SECRET || 'hireflow_super_secret_jwt_key_2026';
const client = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  console.log("==================================================");
  console.log("FINAL END-TO-END VERIFICATION SCRIPT");
  console.log("==================================================");
  
  const testUserId = 'test_usr_e2e_' + Date.now();
  const testUserEmail = 'e2e_' + Date.now() + '@hireflow.ai';
  const token = jwt.sign({ userId: testUserId }, JWT_SECRET, { expiresIn: '1h' });
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  await client.query(`
    INSERT INTO users (id, email, name, password_hash, subscription_plan, subscription_status)
    VALUES ($1, $2, $3, 'testpass', 'Pro Tier', 'active')
    ON CONFLICT (email) DO NOTHING
  `, [testUserId, testUserEmail, 'E2E Verification User']);

  await fetch('http://localhost:3000/api/auth/profile', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ 
      name: 'E2E Verification User', 
      email: testUserEmail,
      subscriptionPlan: 'Pro Tier',
      usageLimits: { atsAnalyses: { used: 0, max: 9999 }, mockInterviews: { used: 0, max: 9999 }, aiCoachChat: { used: 0, max: 9999 } }
    })
  });

  const BASE_URL = 'http://localhost:3000';
  let report = [];
  function logResult(testName, status, details) {
    console.log(`[${status}] ${testName}`);
    console.log(`  -> ${details}`);
    report.push({ testName, status, details });
  }

  try {
    console.log("\n--- TEST A: Resume A ---");
    const resumeA = {
      content: "I am a junior frontend developer. I know HTML, CSS, JavaScript, and React. I have built three projects: a weather app, a to-do list, and a personal portfolio. I am looking for an entry-level position to grow my skills and contribute to a team.",
      fileName: "Resume_A_Junior.pdf"
    };
    const resA = await fetch(`${BASE_URL}/api/auth/resume`, { method: 'POST', headers, body: JSON.stringify(resumeA) });
    const verA = await resA.json();
    const verA_ID = verA.version.id;

    const analyzeARes = await fetch(`${BASE_URL}/api/ai/analyze-resume`, { method: 'POST', headers, body: JSON.stringify({ resumeText: resumeA.content, targetRole: 'Frontend Developer', resumeVersionId: verA_ID }) });
    const dataA = await analyzeARes.json();
    const scoreA = dataA.overallScore;
    
    if (scoreA > 0 && dataA.keywords && dataA.keywords.length > 0) {
      logResult('TEST A - Resume A Analysis', 'PASS', `Analyzed Resume A. Score: ${scoreA}, ID: ${verA_ID}`);
    } else {
      logResult('TEST A - Resume A Analysis', 'FAIL', `Invalid score or analysis: ${JSON.stringify(dataA)}`);
    }

    console.log("\n--- TEST B: Resume B ---");
    const resumeB = {
      content: "I am a Principal AI Engineer with 15 years of experience. I have designed scalable ML infrastructure, deployed LLMs to production serving millions of users, and optimized PyTorch training pipelines across massive GPU clusters using Kubernetes and Ray. I have published 5 research papers and managed a team of 10 applied scientists.",
      fileName: "Resume_B_Principal.pdf"
    };
    const resB = await fetch(`${BASE_URL}/api/auth/resume`, { method: 'POST', headers, body: JSON.stringify(resumeB) });
    const verB = await resB.json();
    const verB_ID = verB.version.id;

    const analyzeBRes = await fetch(`${BASE_URL}/api/ai/analyze-resume`, { method: 'POST', headers, body: JSON.stringify({ resumeText: resumeB.content, targetRole: 'AI Engineer', resumeVersionId: verB_ID }) });
    const dataB = await analyzeBRes.json();
    const scoreB = dataB.overallScore;

    if (scoreB > 0 && scoreB !== scoreA) {
      logResult('TEST B - Resume B Analysis', 'PASS', `Analyzed Resume B. Score: ${scoreB}. Distinct from A.`);
    } else {
      logResult('TEST B - Resume B Analysis', 'FAIL', `Score B (${scoreB}) identical to A (${scoreA}) or invalid.`);
    }

    console.log("\n--- TEST C/D: Dashboard Sync ---");
    await fetch(`${BASE_URL}/api/auth/profile`, { method: 'PUT', headers, body: JSON.stringify({ activeResumeVersionId: verB_ID }) });
    let userDataRes = await fetch(`${BASE_URL}/api/auth/data`, { headers });
    let userData = await userDataRes.json();
    let pData = userData.data.user.profile_data || {};
    
    if (pData.activeResumeVersionId === verB_ID) {
      logResult('TEST C - Dashboard Sync (Resume B)', 'PASS', `Active ID is ${verB_ID}`);
    } else {
      logResult('TEST C - Dashboard Sync (Resume B)', 'FAIL', `Active ID mismatch: ${pData.activeResumeVersionId}`);
    }

    await fetch(`${BASE_URL}/api/auth/profile`, { method: 'PUT', headers, body: JSON.stringify({ activeResumeVersionId: verA_ID }) });
    userDataRes = await fetch(`${BASE_URL}/api/auth/data`, { headers });
    userData = await userDataRes.json();
    pData = userData.data.user.profile_data || {};
    
    if (pData.activeResumeVersionId === verA_ID) {
      logResult('TEST D - Resume Suite Sync (Resume A)', 'PASS', `Active ID successfully switched to ${verA_ID}`);
    } else {
      logResult('TEST D - Resume Suite Sync (Resume A)', 'FAIL', `Active ID failed to switch back to A`);
    }

    console.log("\n--- TEST E: Version Deletion ---");
    const delRes = await fetch(`${BASE_URL}/api/auth/resume-version/${verA_ID}`, { method: 'DELETE', headers });
    if (delRes.status === 200) {
      const dbVerA = await client.query('SELECT * FROM resume_versions WHERE id = $1', [verA_ID]);
      const dbAtsA = await client.query('SELECT * FROM ats_reports WHERE resume_id = $1', [verA_ID]);
      if (dbVerA.rows.length === 0 && dbAtsA.rows.length === 0) {
        logResult('TEST E - Version Deletion', 'PASS', `Deleted ${verA_ID} from resume_versions and ats_reports.`);
      } else {
        logResult('TEST E - Version Deletion', 'FAIL', `Zombie rows remain in DB! verA rows: ${dbVerA.rows.length}, ats rows: ${dbAtsA.rows.length}`);
      }
    } else {
      logResult('TEST E - Version Deletion', 'FAIL', `Delete API returned status ${delRes.status}`);
    }

    console.log("\n--- TEST F: Active Resume Persistence ---");
    await fetch(`${BASE_URL}/api/auth/profile`, { method: 'PUT', headers, body: JSON.stringify({ activeResumeVersionId: verB_ID }) });
    userDataRes = await fetch(`${BASE_URL}/api/auth/data`, { headers });
    userData = await userDataRes.json();
    if (userData.data.user.profile_data.activeResumeVersionId === verB_ID) {
      logResult('TEST F - Persistence', 'PASS', `Active resume persists across session re-fetch.`);
    } else {
      logResult('TEST F - Persistence', 'FAIL', `Active resume lost.`);
    }

    console.log("\n--- TEST G: Real AI Verification ---");
    const q1Res = await fetch(`${BASE_URL}/api/ai/chat`, { method: 'POST', headers, body: JSON.stringify({ message: "What are the biggest weaknesses in my current resume?", history: [] }) });
    const q1Data = await q1Res.json();
    
    const intRes = await fetch(`${BASE_URL}/api/ai/interview-feedback`, { method: 'POST', headers, body: JSON.stringify({ question: "Tell me about a time you solved a hard bug.", answer: "I used PyTorch to debug a memory leak.", role: "AI Engineer" }) });
    const intText = await intRes.text();
    let intData = {};
    try { intData = JSON.parse(intText); } catch(e) { console.error("Int response not JSON:", intText); }
    
    if (q1Data.reply && q1Data.reply.length > 10 && typeof intData.score === 'number') {
      logResult('TEST G - Real AI Verification', 'PASS', `Dynamic responses received. Score: ${intData.score}`);
    } else {
      logResult('TEST G - Real AI Verification', 'FAIL', `AI did not respond properly. Coach: ${!!q1Data.reply}, Int: ${intData.score}`);
    }

    console.log("\n--- TEST H: Database Verification ---");
    const dbVerB = await client.query('SELECT * FROM resume_versions WHERE id = $1', [verB_ID]);
    const dbAtsB = await client.query('SELECT * FROM ats_reports WHERE resume_id = $1', [verB_ID]);
    if (dbVerB.rows.length === 1 && dbAtsB.rows.length === 1 && dbVerB.rows[0].score === scoreB) {
      logResult('TEST H - Database Verification', 'PASS', `1 User -> 1 Version -> 1 ATS Report verified.`);
    } else {
      logResult('TEST H - Database Verification', 'FAIL', `DB integrity check failed. ver rows: ${dbVerB.rows.length}, ats rows: ${dbAtsB.rows.length}`);
    }

    console.log("\n==================================================");
    console.log("FINAL REPORT");
    console.log("==================================================");
    report.forEach(r => {
      console.log(`[${r.status}] ${r.testName}: ${r.details}`);
    });

  } catch (err) {
    console.error("Script execution failed:", err);
  } finally {
    await client.end();
  }
}

run();
