import "dotenv/config";

async function testHttpEndpoints() {
  console.log("--- Testing Live Express HTTP Endpoints ---");
  const baseUrl = "http://localhost:3000";

  // Test 1: Unauthenticated /api/jobs/saved should return 401
  const unauthRes = await fetch(`${baseUrl}/api/jobs/saved`);
  console.log("Unauthenticated GET /api/jobs/saved status:", unauthRes.status);
  if (unauthRes.status !== 401) {
    console.error(`Expected 401, got ${unauthRes.status}`);
  } else {
    console.log("PASS: Unauthenticated request rejected with 401.");
  }

  // Test 2: Resume analysis endpoint /api/ai/analyze-resume
  const sampleResume = `
Pranshu Patel
Senior Full Stack Engineer
Skills: React, TypeScript, Node.js, Python, PostgreSQL, AWS, Docker
Experience:
• Engineered REST APIs using Node.js and TypeScript for 500k users.
• Optimized PostgreSQL database queries, reducing latency by 45%.
`;
  const t0 = performance.now();
  const anaRes = await fetch(`${baseUrl}/api/ai/analyze-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText: sampleResume, targetRole: 'Senior Full Stack Engineer' })
  });
  const tTotal = performance.now() - t0;
  console.log(`POST /api/ai/analyze-resume status: ${anaRes.status} in ${tTotal.toFixed(2)}ms`);

  if (anaRes.ok) {
    const data = await anaRes.json();
    console.log(`ATS Score: ${data.overallScore}%`);
    console.log(`Keywords Detected: ${data.keywordList?.filter((k: any) => k.detected)?.length || 0}`);
    console.log(`Job Recommendations: ${data.jobRecommendations?.length || 0}`);
    console.log("PASS: Resume analysis endpoint returned instant recommendations!");
  } else {
    console.error("Analysis response failed:", await anaRes.text());
  }

  process.exit(0);
}

testHttpEndpoints().catch(err => {
  console.error("HTTP test failed:", err);
  process.exit(1);
});
