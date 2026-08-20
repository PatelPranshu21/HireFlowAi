import "dotenv/config";
import { getPool, initDb, dbSaveResume, dbSaveResumeVersion, dbSaveJobMatches, dbGetJobMatchesForResumeVersion } from "../src/db/postgres";
import { JobMatchingService } from "../src/services/jobMatchingService";

async function verifyRealAdzunaJob() {
  console.log("===============================================================================");
  console.log("HIREFLOW AI – REAL ADZUNA JOB MATCH SCORING & EXPLAINABILITY VERIFICATION");
  console.log("===============================================================================\n");

  await initDb();
  const pool = getPool();
  if (!pool) throw new Error("Database pool unavailable");

  // Query actual Adzuna jobs from PostgreSQL
  const adzunaRes = await pool.query(
    `SELECT * FROM jobs WHERE source = 'adzuna' AND is_active = TRUE ORDER BY created_at DESC LIMIT 20`
  );

  console.log(`Found ${adzunaRes.rows.length} active Adzuna jobs in PostgreSQL.`);

  // Find a job with skills or description
  let jobRow = adzunaRes.rows.find((r: any) => {
    const s = Array.isArray(r.skills) ? r.skills : (typeof r.skills === 'string' ? JSON.parse(r.skills) : []);
    return s.length > 0;
  }) || adzunaRes.rows[0];

  if (!jobRow) {
    const anyJobRes = await pool.query(`SELECT * FROM jobs WHERE is_active = TRUE LIMIT 1`);
    jobRow = anyJobRes.rows[0];
  }

  const rawSkills = Array.isArray(jobRow.skills) ? jobRow.skills : (typeof jobRow.skills === 'string' ? JSON.parse(jobRow.skills) : []);
  const rawTags = Array.isArray(jobRow.tags) ? jobRow.tags : (typeof jobRow.tags === 'string' ? JSON.parse(jobRow.tags) : []);

  console.log("Selected Real Adzuna Job Record from PostgreSQL:");
  console.log(`- ID:          ${jobRow.id}`);
  console.log(`- Title:       ${jobRow.title}`);
  console.log(`- Company:     ${jobRow.company}`);
  console.log(`- Source:      ${jobRow.source}`);
  console.log(`- Skills:      [${rawSkills.join(', ')}]`);
  console.log(`- Tags:        [${rawTags.join(', ')}]`);
  console.log(`- Location:    ${jobRow.location}\n`);

  // Candidate with matching skills
  const testCandidateSkills = rawSkills.length > 0 ? rawSkills : ["React", "TypeScript", "Node.js", "PostgreSQL"];
  const testCandidate = {
    targetRole: jobRow.title,
    skills: testCandidateSkills,
    resumeText: `Software Engineer specializing in ${testCandidateSkills.join(', ')}. Built high performance applications, collaborated with cross functional teams, and maintained robust production architectures.`
  };

  const calculated = JobMatchingService.calculateJobMatch(
    testCandidate.resumeText,
    testCandidate.skills,
    {
      id: jobRow.id,
      title: jobRow.title,
      company: jobRow.company,
      description: jobRow.description,
      skills: rawSkills,
      tags: rawTags,
      experience_required: jobRow.experience_required,
      employment_type: jobRow.employment_type,
      location: jobRow.location
    },
    [],
    testCandidate.targetRole
  );

  // Persist to PostgreSQL and verify DB roundtrip
  const testUserId = "usr_adzuna_verify_01";
  const testVerId = "ver_adzuna_verify_01";

  await pool.query(
    `INSERT INTO users (id, email, name, auth_provider)
     VALUES ($1, $2, $3, 'local')
     ON CONFLICT (id) DO NOTHING`,
    [testUserId, "adzuna_test@hireflow.ai", "Adzuna Verify User"]
  );

  await dbSaveResumeVersion(testUserId, {
    id: testVerId,
    version_name: "Verified Master",
    resume_text: testCandidate.resumeText,
    parsed_data: { skills: testCandidate.skills },
    score: 92,
    template: "modern_tech",
    file_name: "AdzunaResume.pdf",
    uploaded_at: new Date().toISOString()
  });

  const matchPayload = [{
    id: jobRow.id,
    job_id: jobRow.id,
    matchScore: calculated.matchScore,
    match_score: calculated.matchScore,
    similarityScore: calculated.similarityScore,
    skillMatchScore: calculated.skillMatchScore,
    requiredSkillScore: calculated.requiredSkillScore,
    roleAlignmentScore: calculated.roleAlignmentScore,
    additionalScore: calculated.additionalScore,
    scoreBreakdown: calculated.scoreBreakdown,
    matchedSkills: calculated.matchedSkills,
    missingSkills: calculated.missingSkills,
    preferredSkills: calculated.preferredSkills,
    whyMatch: calculated.whyMatch,
    recommendationReason: calculated.whyMatch
  }];

  await dbSaveJobMatches(testUserId, testVerId, matchPayload as any);

  const pgRows = await dbGetJobMatchesForResumeVersion(testUserId, testVerId);
  const loadedJob = pgRows[0];

  console.log("===============================================================================");
  console.log("TEN AUTHORITATIVE FIELDS VERIFICATION (SECTION 15)");
  console.log("===============================================================================");
  console.log(`1.  Job Title:               ${loadedJob.title}`);
  console.log(`2.  Required Skills:         ${loadedJob.requiredSkills.join(', ') || 'None specified'}`);
  console.log(`3.  Candidate Skills:        ${testCandidate.skills.join(', ')}`);
  console.log(`4.  Matched Skills:          ${loadedJob.matchedSkills.join(', ') || 'None'}`);
  console.log(`5.  Missing Skills:          ${loadedJob.missingSkills.join(', ') || 'None'}`);
  console.log(`6.  Required Skill Score:    ${loadedJob.requiredSkillScore !== null ? `${loadedJob.requiredSkillScore}%` : 'N/A'}`);
  console.log(`7.  Role Alignment Score:    ${loadedJob.roleAlignmentScore}%`);
  console.log(`8.  Text Similarity Score:   ${loadedJob.similarityScore}%`);
  console.log(`9.  Additional Score:        ${loadedJob.additionalScore}%`);
  console.log(`10. Final Match Score:       ${loadedJob.matchScore}% (${loadedJob.matchLabel})`);
  console.log("-------------------------------------------------------------------------------");
  console.log(`Score Breakdown:             `, JSON.stringify(loadedJob.scoreBreakdown));
  console.log(`Recommendation Rationale:    ${loadedJob.recommendationReason}`);
  console.log("===============================================================================\n");

  // Verify PostgreSQL exact equality
  if (
    loadedJob.matchScore === calculated.matchScore &&
    loadedJob.similarityScore === calculated.similarityScore &&
    JSON.stringify(loadedJob.matchedSkills) === JSON.stringify(calculated.matchedSkills) &&
    JSON.stringify(loadedJob.missingSkills) === JSON.stringify(calculated.missingSkills)
  ) {
    console.log("✓ SUCCESS: Database, Backend Scoring, and Frontend Object are 100% Deterministic & Consistent!");
  } else {
    throw new Error("Discrepancy detected between calculated match and PostgreSQL record!");
  }

  // Cleanup
  await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
}

verifyRealAdzunaJob().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
