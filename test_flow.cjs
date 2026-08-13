const fs = require('fs');

async function testFlow() {
  const fetch = (await import('node-fetch')).default;
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = 'YOUR_RANDOM_SECRET';
  
  const testUserId = 'test_user_' + Date.now();
  const token = jwt.sign({ userId: testUserId }, JWT_SECRET, { expiresIn: '1h' });
  
  console.log(`Generated token for user: ${testUserId}`);
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const profileRes = await fetch('http://localhost:3000/api/auth/profile', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ name: 'Test User', email: 'test@hireflow.ai' })
  });
  console.log("Profile create status:", profileRes.status);
  
  console.log("\n2. Uploading Backend Resume...");
  const backendText = "I am a Senior Backend Developer with 10 years of experience. I architected and engineered highly scalable distributed systems using Python, Django, PostgreSQL, and AWS. I successfully optimized database queries reducing latency by 45%.";
  const backendAnalysisRes = await fetch('http://localhost:3000/api/ai/analyze-resume', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text: backendText, targetRole: 'Backend Developer', versionId: 'v1' })
  });
  const backendAnalysis = await backendAnalysisRes.json();
  console.log("Backend Analysis Score:", backendAnalysis.analysis?.overallScore);
  
  const saveBackendRes = await fetch('http://localhost:3000/api/auth/resume', {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      fileName: 'backend_resume.pdf', 
      fileText: backendText, 
      score: backendAnalysis.analysis?.overallScore,
      versionId: 'v1',
      template: 'modern_tech'
    })
  });
  console.log("Backend Resume save status:", saveBackendRes.status);
  
  console.log("\n3. Uploading Frontend Resume...");
  const frontendText = "Frontend Engineer specializing in React, Next.js, and TypeScript. I spearheaded the UI migration to Tailwind CSS, improving rendering performance by 30%. I built responsive web applications for 50k monthly active users.";
  const frontendAnalysisRes = await fetch('http://localhost:3000/api/ai/analyze-resume', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text: frontendText, targetRole: 'Frontend Developer', versionId: 'v2' })
  });
  const frontendAnalysis = await frontendAnalysisRes.json();
  console.log("Frontend Analysis Score:", frontendAnalysis.analysis?.overallScore);
  
  const saveFrontendRes = await fetch('http://localhost:3000/api/auth/resume', {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      fileName: 'frontend_resume.pdf', 
      fileText: frontendText, 
      score: frontendAnalysis.analysis?.overallScore,
      versionId: 'v2',
      template: 'modern_tech'
    })
  });
  console.log("Frontend Resume save status:", saveFrontendRes.status);
  
  console.log("\n4. Verifying Database Persistence (Reloading User Data)...");
  const userDataRes = await fetch('http://localhost:3000/api/auth/data', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const userData = await userDataRes.json();
  console.log("Saved Resumes in DB:", userData.resumes?.length);
  console.log("Saved Versions in DB:", userData.resumeVersions?.length);
  
  if (userData.resumeVersions?.length === 2) {
    console.log("SUCCESS: Both resumes persisted successfully.");
    console.log("Version 1 Score:", userData.resumeVersions.find(v => v.id === 'v1')?.score);
    console.log("Version 2 Score:", userData.resumeVersions.find(v => v.id === 'v2')?.score);
    
    if (userData.resumeVersions.find(v => v.id === 'v1')?.score !== userData.resumeVersions.find(v => v.id === 'v2')?.score) {
      console.log("SUCCESS: Resumes generated different scores!");
    } else {
      console.log("WARNING: Resumes generated the same score.");
    }
  } else {
    console.log("FAILED: Resumes not persisted correctly.");
  }
}

testFlow().catch(console.error);
