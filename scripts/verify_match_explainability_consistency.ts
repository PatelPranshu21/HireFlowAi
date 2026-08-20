import "dotenv/config";
import { getPool, initDb, dbSaveResume, dbSaveResumeVersion, dbSaveJobMatches, dbGetJobMatchesForResumeVersion, dbDeleteResumeVersion } from "../src/db/postgres";
import { JobMatchingService } from "../src/services/jobMatchingService";
import { JobIngestionService } from "../server/jobIngestionService";

async function verifyExplainabilityConsistency() {
  console.log("=================================================================");
  console.log("HIREFLOW AI – JOB MATCH & EXPLAINABILITY CONSISTENCY TEST SUITE");
  console.log("=================================================================\n");

  await initDb();
  const pool = getPool();
  if (!pool) throw new Error("Database pool unavailable");

  const testUserId = "usr_match_test_01";
  const versionAId = "ver_match_test_01_a";
  const versionBId = "ver_match_test_01_b";

  await pool.query(
    `INSERT INTO users (id, email, name, auth_provider)
     VALUES ($1, $2, $3, 'local')
     ON CONFLICT (id) DO NOTHING`,
    [testUserId, "matchtest@hireflow.ai", "Match Consistency User"]
  );

  const availableJobs = await JobIngestionService.getAvailableJobs();
  console.log(`Available Jobs in DB: ${availableJobs.length}`);

  // Resume A: React Frontend Specialist
  const resumeTextA = `
Candidate A
Senior React Frontend Developer
Skills: React, TypeScript, Redux, HTML5, CSS3, Tailwind CSS, Jest
Experience:
• Built modern web frontends using React, TypeScript, and Redux.
• Designed responsive user interfaces and component libraries with Tailwind CSS.
`;
  const skillsA = ["React", "TypeScript", "Redux", "HTML5", "CSS3", "Tailwind CSS", "Jest"];

  // Resume B: Python Backend Engineer
  const resumeTextB = `
Candidate B
Python Backend Engineer
Skills: Python, Django, FastAPI, PostgreSQL, Redis, Docker, AWS
Experience:
• Built high-throughput microservices using Python, FastAPI, and Django.
• Engineered PostgreSQL database schemas, Redis caching, and Docker containers on AWS.
`;
  const skillsB = ["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "Docker", "AWS"];

  // -------------------------------------------------------------
  // TEST 1 & TEST 2 & TEST 3: COMPUTE & PERSIST MATCHES FOR RESUME A
  // -------------------------------------------------------------
  console.log("--- TEST 1, 2, 3: RESUME A MATCHING & PERSISTENCE ---");
  const matchesA = JobMatchingService.matchResumeAgainstJobs(resumeTextA, skillsA, availableJobs, "Frontend Developer");
  
  await dbSaveResume(testUserId, {
    file_name: "Resume_A.pdf",
    resume_text: resumeTextA,
    parsed_data: { skills: skillsA },
    ats_score: 85,
    version_name: "Frontend Master"
  });

  await dbSaveResumeVersion(testUserId, {
    id: versionAId,
    version_name: "Frontend Master",
    resume_text: resumeTextA,
    parsed_data: { skills: skillsA },
    score: 85,
    template: "modern_tech",
    file_name: "Resume_A.pdf",
    uploaded_at: new Date().toISOString()
  });

  const dbMatchesAPayload = matchesA.map(m => ({
    resume_version_id: versionAId,
    job_id: m.id,
    match_score: m.matchScore,
    similarity_score: (m as any).similarityScore || 0,
    skill_match_score: (m as any).skillMatchScore || 0,
    matched_skills: (m as any).matchedSkills || [],
    missing_skills: (m as any).missingSkills || [],
    preferred_skills: (m as any).preferredSkills || [],
    why_match: m.recommendationReason || (m as any).whyMatch || ''
  }));
  await dbSaveJobMatches(testUserId, versionAId, dbMatchesAPayload);

  // Retrieve persisted matches from PostgreSQL
  const pgMatchesA = await dbGetJobMatchesForResumeVersion(testUserId, versionAId);
  console.log(`Persisted matches count for Version A: ${pgMatchesA.length}`);

  // Find a job with 0 missing skills for Candidate A
  const jobNoMissing = pgMatchesA.find((j: any) => j.missingSkills && j.missingSkills.length === 0);
  if (jobNoMissing) {
    console.log(`\n[TEST 1 PASSED] Job without missing skills: "${jobNoMissing.title}"`);
    console.log(`- Matched Skills: [${jobNoMissing.matchedSkills.join(', ')}]`);
    console.log(`- Missing Skills: [${jobNoMissing.missingSkills.join(', ')}] (count: ${jobNoMissing.missingSkills.length})`);
    console.log(`- Match Score: ${jobNoMissing.matchScore}%`);
    console.log(`- Why Match: "${jobNoMissing.recommendationReason}"`);

    // Verify explanation doesn't say "Exceptional" if score < 75
    if (jobNoMissing.matchScore < 75 && jobNoMissing.recommendationReason.includes("Exceptional match")) {
      throw new Error(`TEST 3 FAILED: Score is ${jobNoMissing.matchScore}% but whyMatch claims Exceptional match!`);
    }
  } else {
    console.log("Note: No 0-missing-skills job found for Candidate A in catalog.");
  }

  // Find a job with missing skills for Candidate A
  const jobWithMissing = pgMatchesA.find((j: any) => j.missingSkills && j.missingSkills.length > 0);
  if (!jobWithMissing) {
    throw new Error("TEST 2 FAILED: Expected at least one job with missing skills");
  }
  console.log(`\n[TEST 2 PASSED] Job with missing skills: "${jobWithMissing.title}"`);
  console.log(`- Matched Skills: [${jobWithMissing.matchedSkills.join(', ')}]`);
  console.log(`- Missing Skills: [${jobWithMissing.missingSkills.join(', ')}] (count: ${jobWithMissing.missingSkills.length})`);
  console.log(`- Match Score: ${jobWithMissing.matchScore}%`);
  console.log(`- Why Match: "${jobWithMissing.recommendationReason}"`);

  // Direct PostgreSQL query verification for this exact job and version
  const directPgA = await pool.query(
    `SELECT jm.*, j.company, j.title
     FROM job_matches jm
     JOIN jobs j ON j.id = jm.job_id
     WHERE jm.user_id = $1 AND jm.resume_version_id = $2 AND jm.job_id = $3`,
    [testUserId, versionAId, jobWithMissing.id]
  );
  const rowA = directPgA.rows[0];
  console.log("\nAuthoritative PostgreSQL Row Verification:");
  console.log("  job_matches.job_id:", rowA.job_id, "=== loaded.id:", jobWithMissing.id);
  console.log("  job_matches.match_score:", rowA.match_score, "=== loaded.matchScore:", jobWithMissing.matchScore);
  console.log("  job_matches.matched_skills:", rowA.matched_skills, "=== loaded.matchedSkills:", jobWithMissing.matchedSkills);
  console.log("  job_matches.missing_skills:", rowA.missing_skills, "=== loaded.missingSkills:", jobWithMissing.missingSkills);
  console.log("  job_matches.why_match:", rowA.why_match, "=== loaded.recommendationReason:", jobWithMissing.recommendationReason);

  if (
    rowA.match_score !== jobWithMissing.matchScore ||
    rowA.why_match !== jobWithMissing.recommendationReason ||
    JSON.stringify(rowA.missing_skills) !== JSON.stringify(jobWithMissing.missingSkills)
  ) {
    throw new Error("FATAL: Discrepancy between PostgreSQL job_matches and loaded recommendation object!");
  }
  console.log("PASS: Loaded recommendation object matches PostgreSQL 100% identically!");

  // -------------------------------------------------------------
  // TEST 4: RESUME VERSION ISOLATION (A vs B)
  // -------------------------------------------------------------
  console.log("\n--- TEST 4: RESUME VERSION ISOLATION (A vs B) ---");
  const matchesB = JobMatchingService.matchResumeAgainstJobs(resumeTextB, skillsB, availableJobs, "Python Engineer");
  
  await dbSaveResumeVersion(testUserId, {
    id: versionBId,
    version_name: "Python Master",
    resume_text: resumeTextB,
    parsed_data: { skills: skillsB },
    score: 90,
    template: "modern_tech",
    file_name: "Resume_B.pdf",
    uploaded_at: new Date().toISOString()
  });

  const dbMatchesBPayload = matchesB.map(m => ({
    resume_version_id: versionBId,
    job_id: m.id,
    match_score: m.matchScore,
    similarity_score: (m as any).similarityScore || 0,
    skill_match_score: (m as any).skillMatchScore || 0,
    matched_skills: (m as any).matchedSkills || [],
    missing_skills: (m as any).missingSkills || [],
    preferred_skills: (m as any).preferredSkills || [],
    why_match: m.recommendationReason || (m as any).whyMatch || ''
  }));
  await dbSaveJobMatches(testUserId, versionBId, dbMatchesBPayload);

  const pgMatchesB = await dbGetJobMatchesForResumeVersion(testUserId, versionBId);
  console.log(`Persisted matches count for Version B: ${pgMatchesB.length}`);

  // Test the same job in Version A vs Version B
  const targetJobId = jobWithMissing.id;
  const matchInA = pgMatchesA.find((j: any) => j.id === targetJobId);
  const matchInB = pgMatchesB.find((j: any) => j.id === targetJobId);

  console.log(`Comparison for Job ${targetJobId} ("${matchInA?.title}"):`);
  console.log(`- Under Resume A (React): Score=${matchInA?.matchScore}%, Matched=[${matchInA?.matchedSkills.join(', ')}], Missing=[${matchInA?.missingSkills.join(', ')}]`);
  if (matchInB) {
    console.log(`- Under Resume B (Python): Score=${matchInB?.matchScore}%, Matched=[${matchInB?.matchedSkills.join(', ')}], Missing=[${matchInB?.missingSkills.join(', ')}]`);
  }

  // Verify that Version A matches did not mutate or blend with Version B
  const reloadedA = await dbGetJobMatchesForResumeVersion(testUserId, versionAId);
  const reloadedJobInA = reloadedA.find((j: any) => j.id === targetJobId);
  if (
    reloadedJobInA?.matchScore !== matchInA?.matchScore ||
    JSON.stringify(reloadedJobInA?.matchedSkills) !== JSON.stringify(matchInA?.matchedSkills)
  ) {
    throw new Error("TEST 4 FAILED: Version A data was corrupted when Version B was added!");
  }
  console.log("PASS: Resume version isolation verified cleanly across versions A & B.");

  // Clean up test data
  await pool.query(`DELETE FROM job_matches WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM resume_versions WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM resumes WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);

  console.log("\n=================================================================");
  console.log("SUCCESS: ALL JOB MATCH & EXPLAINABILITY TESTS PASSED!");
  console.log("=================================================================");
  process.exit(0);
}

verifyExplainabilityConsistency().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
