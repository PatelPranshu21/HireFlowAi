import "dotenv/config";
import { getPool, initDb, dbSaveResume, dbSaveResumeVersion, dbSaveJobMatches, dbGetJobMatchesForResumeVersion } from "../src/db/postgres";
import { JobMatchingService } from "../src/services/jobMatchingService";
import { JobIngestionService } from "../server/jobIngestionService";

async function diagnoseConsistency() {
  console.log("=== Job Match Consistency Diagnosis ===");
  await initDb();
  const pool = getPool();
  if (!pool) throw new Error("Pool unavailable");

  const testUserId = "usr_diag_test_01";
  const testVersionId = "ver_diag_test_01";

  await pool.query(
    `INSERT INTO users (id, email, name, auth_provider)
     VALUES ($1, $2, $3, 'local')
     ON CONFLICT (id) DO NOTHING`,
    [testUserId, "diag@hireflow.ai", "Diag User"]
  );

  const sampleResume = `
Pranshu Patel
Full Stack Developer
Skills: React, TypeScript, Node.js, Express, PostgreSQL
Experience:
• Built web apps with React and Node.js.
• Created PostgreSQL databases and REST APIs.
`;
  const candidateSkills = ["React", "TypeScript", "Node.js", "Express", "PostgreSQL"];

  const availableJobs = await JobIngestionService.getAvailableJobs();
  console.log(`Catalog has ${availableJobs.length} jobs.`);

  // Find a job with requirements including something candidate DOES NOT have (e.g., Python, Docker, Kubernetes, AWS, Java)
  const matchedList = JobMatchingService.matchResumeAgainstJobs(sampleResume, candidateSkills, availableJobs);
  
  // Persist matches
  await dbSaveResume(testUserId, {
    file_name: "Diag_Resume.pdf",
    resume_text: sampleResume,
    parsed_data: { skills: candidateSkills },
    ats_score: 75,
    version_name: "Diag Version"
  });

  await dbSaveResumeVersion(testUserId, {
    id: testVersionId,
    version_name: "Diag Version",
    resume_text: sampleResume,
    parsed_data: { skills: candidateSkills },
    score: 75,
    template: "modern_tech",
    file_name: "Diag_Resume.pdf",
    uploaded_at: new Date().toISOString()
  });

  const dbMatchesPayload = matchedList.map(m => ({
    resume_version_id: testVersionId,
    job_id: m.id,
    match_score: m.matchScore,
    similarity_score: (m as any).similarityScore || 0,
    skill_match_score: (m as any).skillMatchScore || 0,
    matched_skills: (m as any).matchedSkills || [],
    missing_skills: (m as any).missingSkills || [],
    preferred_skills: (m as any).preferredSkills || [],
    why_match: m.recommendationReason
  }));
  await dbSaveJobMatches(testUserId, testVersionId, dbMatchesPayload);

  // Retrieve from PostgreSQL
  const loadedFromPg = await dbGetJobMatchesForResumeVersion(testUserId, testVersionId);
  console.log(`Retrieved ${loadedFromPg.length} matches from PostgreSQL.\n`);

  // Find one job with non-empty missing_skills and one job with empty missing_skills
  const jobWithMissing = loadedFromPg.find((j: any) => j.missingSkills && j.missingSkills.length > 0);
  const jobWithoutMissing = loadedFromPg.find((j: any) => !j.missingSkills || j.missingSkills.length === 0);

  if (jobWithMissing) {
    // Query directly from database
    const directPg = await pool.query(
      `SELECT jm.*, j.company, j.title, j.skills as job_skills
       FROM job_matches jm
       JOIN jobs j ON j.id = jm.job_id
       WHERE jm.user_id = $1 AND jm.resume_version_id = $2 AND jm.job_id = $3`,
      [testUserId, testVersionId, jobWithMissing.id]
    );
    const row = directPg.rows[0];

    console.log("=== DIAGNOSTIC CASE 1: Job With Missing Skills ===");
    console.log("job_id:", jobWithMissing.id);
    console.log("resume_version_id:", testVersionId);
    console.log("database_match_score:", row.match_score);
    console.log("database_matched_skills:", row.matched_skills);
    console.log("database_missing_skills:", row.missing_skills);
    console.log("database_similarity_score:", row.similarity_score);
    console.log("database_why_match:", row.why_match);
    console.log("frontend_match_score:", jobWithMissing.matchScore);
    console.log("frontend_matched_skills:", jobWithMissing.matchedSkills);
    console.log("frontend_missing_skills:", jobWithMissing.missingSkills);
    console.log("frontend_similarity_score:", jobWithMissing.similarityScore);
    console.log("frontend_why_match:", jobWithMissing.recommendationReason);
  }

  if (jobWithoutMissing) {
    const directPg = await pool.query(
      `SELECT jm.*, j.company, j.title, j.skills as job_skills
       FROM job_matches jm
       JOIN jobs j ON j.id = jm.job_id
       WHERE jm.user_id = $1 AND jm.resume_version_id = $2 AND jm.job_id = $3`,
      [testUserId, testVersionId, jobWithoutMissing.id]
    );
    const row = directPg.rows[0];

    console.log("\n=== DIAGNOSTIC CASE 2: Job Without Missing Skills ===");
    console.log("job_id:", jobWithoutMissing.id);
    console.log("resume_version_id:", testVersionId);
    console.log("database_match_score:", row.match_score);
    console.log("database_matched_skills:", row.matched_skills);
    console.log("database_missing_skills:", row.missing_skills);
    console.log("database_similarity_score:", row.similarity_score);
    console.log("database_why_match:", row.why_match);
    console.log("frontend_match_score:", jobWithoutMissing.matchScore);
    console.log("frontend_matched_skills:", jobWithoutMissing.matchedSkills);
    console.log("frontend_missing_skills:", jobWithoutMissing.missingSkills);
    console.log("frontend_similarity_score:", jobWithoutMissing.similarityScore);
    console.log("frontend_why_match:", jobWithoutMissing.recommendationReason);
  }

  // Clean up
  await pool.query(`DELETE FROM job_matches WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM resume_versions WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM resumes WHERE user_id = $1`, [testUserId]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);

  console.log("\nDiagnosis completed.");
  process.exit(0);
}

diagnoseConsistency().catch(err => {
  console.error("Diagnosis error:", err);
  process.exit(1);
});
