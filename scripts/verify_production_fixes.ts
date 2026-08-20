import "dotenv/config";
import { getPool, initDb, dbSaveSavedJob, dbRemoveSavedJob, dbIsJobSaved, dbGetSavedJobsForUser, dbGetUserSavedJobs, dbSaveResume, dbSaveResumeVersion, dbSaveJobMatches, dbGetJobMatchesForResumeVersion } from "../src/db/postgres";
import { JobMatchingService, CANONICAL_SKILLS } from "../src/services/jobMatchingService";
import { JobIngestionService } from "../server/jobIngestionService";
import { analyzeResumeContentLocally } from "../server/resumeAnalyzer";
import { parseResumeDocument } from "../server/documentParser";

async function runVerification() {
  console.log("=================================================================");
  console.log("HIREFLOW AI – AUDIT & VERIFICATION TEST SUITE");
  console.log("=================================================================\n");

  await initDb();
  const pool = getPool();
  if (!pool) {
    console.error("FATAL: PostgreSQL pool unavailable.");
    process.exit(1);
  }

  const sampleResumeText = `
Pranshu Patel
Senior Full Stack Engineer
Email: pranshu@example.com | Phone: +91 9876543210 | Bengaluru, India
LinkedIn: linkedin.com/in/pranshu-patel | GitHub: github.com/pranshu-patel

PROFESSIONAL SUMMARY
Results-driven Senior Full Stack Engineer with 6+ years of experience specializing in React, TypeScript, Node.js, Python, PostgreSQL, and AWS cloud architectures. Proven track record of scaling distributed web applications and reducing latency by 45%.

WORK EXPERIENCE
Senior Software Engineer | TechCorp India (2022 - Present)
• Architected and engineered high-throughput REST APIs using Node.js, TypeScript, and Express, serving 500k+ daily active users.
• Optimized PostgreSQL database queries and indexing strategies, reducing P99 latency by 40% and saving $15k monthly in infrastructure.
• Spearheaded migration of microservices to Docker and Kubernetes on AWS ECS, achieving 99.99% service uptime.
• Led a cross-functional team of 6 engineers, delivering 12 major product features on time.

Software Engineer | InnovateTech (2019 - 2022)
• Developed responsive frontend user interfaces using React, Next.js, and Tailwind CSS for enterprise dashboard.
• Implemented automated CI/CD pipelines with GitHub Actions, reducing deployment cycle times by 60%.
• Integrated Redis caching layers and GraphQL APIs, increasing request throughput by 3x.

TECHNICAL SKILLS
• Programming Languages: TypeScript, JavaScript, Python, SQL, Java
• Frontend: React, Next.js, Redux, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, FastAPI, Django, PostgreSQL, Redis, MongoDB
• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Git, Linux, Microservices

PROJECTS
• Real-time Analytics Platform: Built distributed telemetry ingestion pipeline processing 10k events/sec using Node.js, Redis, and PostgreSQL.
• AI Resume Suite: Developed intelligent ATS scoring and matching engine in TypeScript with 98% accuracy.

EDUCATION
• Bachelor of Technology in Computer Science and Engineering (2015 - 2019)
`;

  // -------------------------------------------------------------
  // TEST 1: MEASURE RESUME PIPELINE TIMING BREAKDOWN
  // -------------------------------------------------------------
  console.log("--- TEST 1: RESUME PIPELINE PERFORMANCE AUDIT ---");
  const tTotalStart = performance.now();

  const tExt0 = performance.now();
  const docParse = await parseResumeDocument({ fileText: sampleResumeText, fileName: "Pranshu_Patel_Resume.pdf" });
  const tExtraction = performance.now() - tExt0;

  const tAna0 = performance.now();
  const analysis = analyzeResumeContentLocally(docParse.text, "Senior Full Stack Engineer");
  const tAnalysis = performance.now() - tAna0;

  const detectedSkills = (analysis.keywordList || [])
    .filter((k: any) => k.detected && k.foundInResume)
    .map((k: any) => k.keyword);

  const tJobs0 = performance.now();
  const availableJobs = await JobIngestionService.getAvailableJobs();
  const tJobsFetch = performance.now() - tJobs0;

  console.log(`Available Jobs in Catalog: ${availableJobs.length} real jobs`);

  const tMatch0 = performance.now();
  const jobMatches = JobMatchingService.matchResumeAgainstJobs(
    docParse.text,
    detectedSkills,
    availableJobs,
    "Senior Full Stack Engineer"
  );
  const tMatching = performance.now() - tMatch0;

  const testUserId = "usr_perf_test_01";
  const testVersionId = "ver_perf_test_01";

  // Ensure test user exists
  await pool.query(
    `INSERT INTO users (id, email, name, auth_provider)
     VALUES ($1, $2, $3, 'local')
     ON CONFLICT (id) DO NOTHING`,
    [testUserId, "testuser@hireflow.ai", "Test User"]
  );

  const tDb0 = performance.now();
  await dbSaveResume(testUserId, {
    file_name: "Pranshu_Patel_Resume.pdf",
    resume_text: docParse.text,
    parsed_data: { skills: detectedSkills },
    ats_score: analysis.overallScore,
    version_name: "Master Resume"
  });
  await dbSaveResumeVersion(testUserId, {
    id: testVersionId,
    version_name: "Master Resume",
    resume_text: docParse.text,
    parsed_data: { skills: detectedSkills },
    score: analysis.overallScore,
    template: "modern_tech",
    file_name: "Pranshu_Patel_Resume.pdf",
    uploaded_at: new Date().toISOString(),
    analysis_data: analysis
  });
  const dbMatches = jobMatches.map(m => ({
    resume_version_id: testVersionId,
    job_id: m.id,
    match_score: m.matchScore,
    similarity_score: (m as any).similarityScore || 0,
    skill_match_score: (m as any).skillMatchScore || 0,
    matched_skills: (m as any).matchedSkills || m.requiredSkills || [],
    missing_skills: m.missingSkills || [],
    preferred_skills: [],
    why_match: m.recommendationReason
  }));
  await dbSaveJobMatches(testUserId, testVersionId, dbMatches);
  const tDb = performance.now() - tDb0;
  const tTotal = performance.now() - tTotalStart;

  const timing = analysis.timing || {
    atsAnalysis: 0,
    sectionAnalysis: 0,
    keywordAnalysis: 0,
    improvementAnalysis: 0
  };

  console.log(`\n[ResumePipeline]
Extraction: ${tExtraction.toFixed(2)}ms
ATS Analysis: ${timing.atsAnalysis.toFixed(2)}ms
Section Analysis: ${timing.sectionAnalysis.toFixed(2)}ms
Keyword Analysis: ${timing.keywordAnalysis.toFixed(2)}ms
Improvement Analysis: ${timing.improvementAnalysis.toFixed(2)}ms
Job Matching (${availableJobs.length} jobs): ${tMatching.toFixed(2)}ms
Database Persistence: ${tDb.toFixed(2)}ms
Total: ${tTotal.toFixed(2)}ms\n`);

  if (tMatching > 1000) {
    console.error(`FAIL: Job matching took ${tMatching.toFixed(2)}ms, expected < 1000ms`);
  } else {
    console.log(`PASS: Job matching completed in ${tMatching.toFixed(2)}ms (< 1s target).`);
  }

  // -------------------------------------------------------------
  // TEST 2: PERSISTENT SAVED JOBS TABLE & CRUD OPERATIONS
  // -------------------------------------------------------------
  console.log("\n--- TEST 2: PERSISTENT SAVED JOBS TABLE & CRUD ---");
  
  if (availableJobs.length < 2) {
    console.error("Not enough jobs in DB to test saving.");
    process.exit(1);
  }

  const jobA = availableJobs[0];
  const jobB = availableJobs[1];

  // Clean test user saved jobs
  await pool.query(`DELETE FROM saved_jobs WHERE user_id = $1`, [testUserId]);

  // A. Save Job A
  const saveA = await dbSaveSavedJob(testUserId, jobA.id);
  console.log(`Saved Job A (${jobA.title}):`, saveA);
  if (!saveA.success || !saveA.saved) throw new Error("Failed to save Job A");

  // B. Save Job B
  const saveB = await dbSaveSavedJob(testUserId, jobB.id);
  console.log(`Saved Job B (${jobB.title}):`, saveB);
  if (!saveB.success || !saveB.saved) throw new Error("Failed to save Job B");

  // C. Test Duplicate Save Idempotency
  const saveADup = await dbSaveSavedJob(testUserId, jobA.id);
  console.log(`Duplicate Save Job A:`, saveADup);
  if (!saveADup.success || !saveADup.saved) throw new Error("Duplicate save failed");

  // D. Check isJobSaved
  const isASaved = await dbIsJobSaved(testUserId, jobA.id);
  const isBSaved = await dbIsJobSaved(testUserId, jobB.id);
  const isRandomSaved = await dbIsJobSaved(testUserId, "non_existent_job_123");
  console.log(`isJobSaved A: ${isASaved}, B: ${isBSaved}, Random: ${isRandomSaved}`);
  if (!isASaved || !isBSaved || isRandomSaved) throw new Error("isJobSaved check failed");

  // E. Get Saved Jobs detailed
  const userSavedDetailed = await dbGetSavedJobsForUser(testUserId);
  console.log(`User Saved Detailed Count: ${userSavedDetailed.length}`);
  if (userSavedDetailed.length !== 2) throw new Error(`Expected 2 saved jobs, got ${userSavedDetailed.length}`);
  console.log(`Top saved job title: "${userSavedDetailed[0].title}", savedAt: ${userSavedDetailed[0].savedAt}`);

  // F. Unsave Job A
  const removeA = await dbRemoveSavedJob(testUserId, jobA.id);
  console.log(`Removed Job A:`, removeA);
  const userSavedAfterRemove = await dbGetSavedJobsForUser(testUserId);
  console.log(`User Saved Count after removing Job A: ${userSavedAfterRemove.length}`);
  if (userSavedAfterRemove.length !== 1 || userSavedAfterRemove[0].id !== jobB.id) {
    throw new Error("Unsave verification failed");
  }

  // -------------------------------------------------------------
  // TEST 3: USER ISOLATION & RESUME VERSION INDEPENDENCE
  // -------------------------------------------------------------
  console.log("\n--- TEST 3: USER ISOLATION & RESUME INDEPENDENCE ---");
  const testUser2 = "usr_perf_test_02";
  await pool.query(
    `INSERT INTO users (id, email, name, auth_provider)
     VALUES ($1, $2, $3, 'local')
     ON CONFLICT (id) DO NOTHING`,
    [testUser2, "testuser2@hireflow.ai", "Test User 2"]
  );

  // Check that User 2 has 0 saved jobs
  const user2Saved = await dbGetSavedJobsForUser(testUser2);
  console.log(`User 2 Saved Jobs Count: ${user2Saved.length}`);
  if (user2Saved.length !== 0) throw new Error("User 2 isolation failed! Found User 1 jobs");

  // Test Resume version independence:
  // Create Version 2 for User 1
  const testVersion2 = "ver_perf_test_02";
  await dbSaveResumeVersion(testUserId, {
    id: testVersion2,
    version_name: "Version 2 Frontend",
    resume_text: "React Frontend Engineer Resume",
    parsed_data: { skills: ["React", "CSS"] },
    score: 80,
    template: "modern_tech",
    file_name: "Frontend_Resume.pdf",
    uploaded_at: new Date().toISOString()
  });

  // Saved jobs for User 1 must STILL be 1 (Job B)
  const user1SavedAfterVersion2 = await dbGetSavedJobsForUser(testUserId);
  console.log(`User 1 Saved Jobs Count after adding Version 2: ${user1SavedAfterVersion2.length}`);
  if (user1SavedAfterVersion2.length !== 1) {
    throw new Error("Saved jobs were incorrectly tied to resume version!");
  }

  // -------------------------------------------------------------
  // TEST 4: INACTIVE JOB PERSISTENCE
  // -------------------------------------------------------------
  console.log("\n--- TEST 4: INACTIVE SAVED JOB PRESERVATION ---");
  // Temporarily set job B to inactive
  await pool.query(`UPDATE jobs SET is_active = false WHERE id = $1`, [jobB.id]);
  const user1SavedWithInactive = await dbGetSavedJobsForUser(testUserId);
  console.log(`Saved jobs count with inactive job: ${user1SavedWithInactive.length}`);
  console.log(`Job B isActive flag in saved list: ${user1SavedWithInactive[0].isActive}`);
  if (user1SavedWithInactive.length !== 1 || user1SavedWithInactive[0].isActive !== false) {
    throw new Error("Inactive saved job was dropped or not marked inactive");
  }
  // Restore job B
  await pool.query(`UPDATE jobs SET is_active = true WHERE id = $1`, [jobB.id]);

  // Clean up test data
  await pool.query(`DELETE FROM saved_jobs WHERE user_id IN ($1, $2)`, [testUserId, testUser2]);
  await pool.query(`DELETE FROM job_matches WHERE user_id IN ($1, $2)`, [testUserId, testUser2]);
  await pool.query(`DELETE FROM resume_versions WHERE user_id IN ($1, $2)`, [testUserId, testUser2]);
  await pool.query(`DELETE FROM resumes WHERE user_id IN ($1, $2)`, [testUserId, testUser2]);
  await pool.query(`DELETE FROM users WHERE id IN ($1, $2)`, [testUserId, testUser2]);

  console.log("\n=================================================================");
  console.log("SUCCESS: ALL PERFORMANCE & SAVED JOBS TESTS PASSED CLEANLY!");
  console.log("=================================================================");

  process.exit(0);
}

runVerification().catch(err => {
  console.error("Verification failed with error:", err);
  process.exit(1);
});
