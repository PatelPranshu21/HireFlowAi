import { 
  initDb, 
  getPool,
  dbCreateUser,
  dbFindUserById,
  dbSaveResumeVersion,
  dbGetJobMatchesForResumeVersion,
  dbSaveJobMatches,
  dbGetAllJobs,
  dbDeleteResumeVersion
} from '../src/db/postgres';
import { JobIngestionService } from '../server/jobIngestionService';
import { JobMatchingService } from '../src/services/jobMatchingService';

async function runVerification() {
  console.log('====================================================');
  console.log('HIREFLOW AI – DYNAMIC JOB SUITE END-TO-END VERIFICATION');
  console.log('====================================================\n');

  // 1. Initialize DB and Ingest Real Jobs
  const initialized = await initDb();
  if (!initialized) {
    throw new Error('Failed to initialize PostgreSQL database.');
  }

  const pool = getPool();
  if (!pool) throw new Error('Database pool not available.');

  const ingestedCount = await JobIngestionService.ensureJobsIngested();
  console.log(`✅ [PASS] Job Ingestion initialized with ${ingestedCount} active Indian jobs in PostgreSQL.`);

  const allDbJobs = await dbGetAllJobs();
  if (allDbJobs.length === 0) {
    throw new Error('No jobs found in jobs table after ingestion.');
  }
  console.log(`✅ [PASS] jobs table contains ${allDbJobs.length} normalized jobs across Bengaluru, Hyderabad, Pune, Mumbai, Delhi NCR, etc.`);

  // 2. Create Test User
  const userId = `usr_test_jobs_${Date.now()}`;
  await dbCreateUser({
    id: userId,
    email: `test_jobs_${Date.now()}@hireflow.test`,
    first_name: 'Test',
    last_name: 'Candidate',
    auth_provider: 'email'
  });
  console.log(`✅ [PASS] Created isolated test user: ${userId}`);

  try {
    // -------------------------------------------------------------
    // TEST 1: RESUME A (Python / Django / PostgreSQL)
    // -------------------------------------------------------------
    console.log('\n--- TESTING RESUME A (Python / Django / PostgreSQL) ---');
    const resumeTextA = `
      Pranshu Patel - Senior Python Backend Engineer
      Email: pranshu@example.com | Location: Bengaluru, India
      
      Summary:
      Experienced Python Backend Developer with 5 years building scalable web backends, microservices, and REST APIs.
      Specialized in Django, Django REST Framework, PostgreSQL, Redis caching, and async worker queues.
      
      Technical Skills:
      - Languages: Python, JavaScript, SQL
      - Frameworks: Django, Django REST Framework, FastAPI, Flask
      - Databases: PostgreSQL, Redis, MySQL
      - Architecture: REST APIs, Microservices, Celery, Docker
      
      Experience:
      Senior Python Developer at TechCorp (2022 - Present)
      - Developed high-throughput Django REST APIs for order processing serving 2M users.
      - Optimized PostgreSQL database queries, reducing latency by 45%.
      - Integrated Redis caching and Docker containerized deployment.
    `;

    const versionIdA = `v_${Date.now()}_py`;
    const skillsA = ['Python', 'Django', 'Django REST Framework', 'PostgreSQL', 'Redis', 'REST APIs', 'Docker'];

    // Save resume version A to PostgreSQL
    await dbSaveResumeVersion(userId, {
      id: versionIdA,
      version_name: 'Pranshu_Python_Django_Resume.pdf',
      file_name: 'Pranshu_Python_Django_Resume.pdf',
      resume_text: resumeTextA,
      parsed_data: { skills: skillsA },
      score: 88,
      template: 'modern_tech',
      jobs_matched_count: 0
    });

    // Match Resume A against real PostgreSQL jobs
    const matchesA = JobMatchingService.matchResumeAgainstJobs(resumeTextA, skillsA, allDbJobs, 'Python Backend Engineer');
    console.log(`[Resume A] Matched ${matchesA.length} jobs.`);

    if (matchesA.length === 0) {
      throw new Error('Expected Resume A to match Python/Django jobs, found 0.');
    }

    // Save to PostgreSQL job_matches
    const dbMatchesA = matchesA.map(m => ({
      resume_version_id: versionIdA,
      job_id: m.id,
      match_score: m.matchScore,
      similarity_score: (m as any).similarityScore || 0,
      skill_match_score: (m as any).skillMatchScore || 0,
      matched_skills: (m as any).matchedSkills || m.requiredSkills || [],
      missing_skills: m.missingSkills || [],
      preferred_skills: [],
      why_match: m.recommendationReason
    }));
    await dbSaveJobMatches(userId, versionIdA, dbMatchesA);

    // Verify persisted matches from PostgreSQL
    const savedMatchesA = await dbGetJobMatchesForResumeVersion(userId, versionIdA);
    console.log(`✅ [PASS] Resume A matches saved & retrieved from PostgreSQL: ${savedMatchesA.length} jobs.`);
    
    // Top job must be a Python/Django job (e.g. Swiggy, Zerodha, Yellow.ai, Postman)
    const topJobA = savedMatchesA[0];
    console.log(`   Top recommendation for Resume A: "${topJobA.title}" at "${topJobA.company}" (Score: ${topJobA.matchScore}%, Skills: ${topJobA.matchedSkills.join(', ')})`);
    if (!topJobA.title.toLowerCase().includes('python') && !topJobA.title.toLowerCase().includes('django') && !topJobA.matchedSkills.includes('Python')) {
      throw new Error(`Expected Resume A top match to be Python-focused, got "${topJobA.title}"`);
    }

    // Verify jobs_matched_count in resume_versions table
    const countCheckA = await pool.query(
      `SELECT rv.jobs_matched_count, COUNT(jm.id) AS actual_matches 
       FROM resume_versions rv 
       LEFT JOIN job_matches jm ON jm.resume_version_id = rv.id 
       WHERE rv.id = $1 
       GROUP BY rv.jobs_matched_count`,
      [versionIdA]
    );
    const rvCountA = countCheckA.rows[0].jobs_matched_count;
    const jmCountA = parseInt(countCheckA.rows[0].actual_matches, 10);
    if (rvCountA !== jmCountA || rvCountA !== savedMatchesA.length) {
      throw new Error(`Mismatch in jobs_matched_count: rv=${rvCountA}, jm=${jmCountA}, expected=${savedMatchesA.length}`);
    }
    console.log(`✅ [PASS] resume_versions.jobs_matched_count (${rvCountA}) === COUNT(job_matches) (${jmCountA}) for Resume A.`);

    // -------------------------------------------------------------
    // TEST 2: RESUME B (Java / Spring Boot / Kafka)
    // -------------------------------------------------------------
    console.log('\n--- TESTING RESUME B (Java / Spring Boot / Kafka) ---');
    const resumeTextB = `
      Rajesh Kumar - Principal Java & Microservices Architect
      Email: rajesh@example.com | Location: Hyderabad, India
      
      Summary:
      Lead Java Backend Architect with 8+ years designing high-throughput payment systems, event streaming microservices, and distributed architectures.
      Core expertise in Core Java, Spring Boot, Apache Kafka, Distributed Systems, MySQL, and Kubernetes.
      
      Technical Skills:
      - Languages: Java, Core Java, SQL
      - Frameworks: Spring Boot, Spring Cloud, Hibernate, Microservices
      - Messaging & Databases: Apache Kafka, MySQL, Redis
      - Cloud & DevOps: Kubernetes, Docker, AWS, System Design
      
      Experience:
      Lead Java Architect at FinStream (2020 - Present)
      - Architected distributed UPI payment gateway handling 15,000 TPS on Java 17 and Spring Boot.
      - Implemented zero-data-loss event streaming pipelines using Apache Kafka.
      - Deployed cloud-native microservices on Kubernetes.
    `;

    const versionIdB = `v_${Date.now()}_java`;
    const skillsB = ['Java', 'Spring Boot', 'Kafka', 'Microservices', 'Distributed Systems', 'MySQL', 'Kubernetes'];

    // Save resume version B to PostgreSQL
    await dbSaveResumeVersion(userId, {
      id: versionIdB,
      version_name: 'Rajesh_Java_Spring_Resume.pdf',
      file_name: 'Rajesh_Java_Spring_Resume.pdf',
      resume_text: resumeTextB,
      parsed_data: { skills: skillsB },
      score: 91,
      template: 'modern_tech',
      jobs_matched_count: 0
    });

    // Match Resume B against real PostgreSQL jobs
    const matchesB = JobMatchingService.matchResumeAgainstJobs(resumeTextB, skillsB, allDbJobs, 'Java Backend Engineer');
    console.log(`[Resume B] Matched ${matchesB.length} jobs.`);

    if (matchesB.length === 0) {
      throw new Error('Expected Resume B to match Java/Spring Boot jobs, found 0.');
    }

    // Save to PostgreSQL job_matches
    const dbMatchesB = matchesB.map(m => ({
      resume_version_id: versionIdB,
      job_id: m.id,
      match_score: m.matchScore,
      similarity_score: (m as any).similarityScore || 0,
      skill_match_score: (m as any).skillMatchScore || 0,
      matched_skills: (m as any).matchedSkills || m.requiredSkills || [],
      missing_skills: m.missingSkills || [],
      preferred_skills: [],
      why_match: m.recommendationReason
    }));
    await dbSaveJobMatches(userId, versionIdB, dbMatchesB);

    // Verify persisted matches from PostgreSQL
    const savedMatchesB = await dbGetJobMatchesForResumeVersion(userId, versionIdB);
    console.log(`✅ [PASS] Resume B matches saved & retrieved from PostgreSQL: ${savedMatchesB.length} jobs.`);

    // Top job must be a Java/Spring Boot job (e.g. PhonePe, Cisco, SAP Labs, Goldman Sachs)
    const topJobB = savedMatchesB[0];
    console.log(`   Top recommendation for Resume B: "${topJobB.title}" at "${topJobB.company}" (Score: ${topJobB.matchScore}%, Skills: ${topJobB.matchedSkills.join(', ')})`);
    if (!topJobB.title.toLowerCase().includes('java') && !topJobB.matchedSkills.includes('Java')) {
      throw new Error(`Expected Resume B top match to be Java-focused, got "${topJobB.title}"`);
    }

    // Verify jobs_matched_count in resume_versions table
    const countCheckB = await pool.query(
      `SELECT rv.jobs_matched_count, COUNT(jm.id) AS actual_matches 
       FROM resume_versions rv 
       LEFT JOIN job_matches jm ON jm.resume_version_id = rv.id 
       WHERE rv.id = $1 
       GROUP BY rv.jobs_matched_count`,
      [versionIdB]
    );
    const rvCountB = countCheckB.rows[0].jobs_matched_count;
    const jmCountB = parseInt(countCheckB.rows[0].actual_matches, 10);
    if (rvCountB !== jmCountB || rvCountB !== savedMatchesB.length) {
      throw new Error(`Mismatch in jobs_matched_count: rv=${rvCountB}, jm=${jmCountB}, expected=${savedMatchesB.length}`);
    }
    console.log(`✅ [PASS] resume_versions.jobs_matched_count (${rvCountB}) === COUNT(job_matches) (${jmCountB}) for Resume B.`);

    // -------------------------------------------------------------
    // TEST 3: RESUME SWITCHING & ISOLATION TEST
    // -------------------------------------------------------------
    console.log('\n--- TESTING RESUME SWITCHING & ISOLATION ---');
    const reloadA = await dbGetJobMatchesForResumeVersion(userId, versionIdA);
    const reloadB = await dbGetJobMatchesForResumeVersion(userId, versionIdB);

    console.log(`Resume A retrieved matches: ${reloadA.length} jobs.`);
    console.log(`Resume B retrieved matches: ${reloadB.length} jobs.`);

    // Check top match IDs are different
    if (reloadA[0].id === reloadB[0].id) {
      throw new Error(`Cross-contamination detected! Resume A and Resume B have identical top job: ${reloadA[0].id}`);
    }
    console.log(`✅ [PASS] Resume A top job (${reloadA[0].title} at ${reloadA[0].company}) != Resume B top job (${reloadB[0].title} at ${reloadB[0].company}).`);

    // -------------------------------------------------------------
    // TEST 4: DELETE RESUME ISOLATION TEST
    // -------------------------------------------------------------
    console.log('\n--- TESTING DELETE RESUME ISOLATION ---');
    await dbDeleteResumeVersion(userId, versionIdA);
    console.log(`Deleted Resume A (${versionIdA})`);

    const deletedMatchesA = await dbGetJobMatchesForResumeVersion(userId, versionIdA);
    const remainingMatchesB = await dbGetJobMatchesForResumeVersion(userId, versionIdB);
    const globalJobsRemaining = await dbGetAllJobs();

    if (deletedMatchesA.length !== 0) {
      throw new Error(`Expected 0 matches for deleted Resume A, found ${deletedMatchesA.length}`);
    }
    console.log(`✅ [PASS] Resume A job_matches completely removed (count = 0).`);

    if (remainingMatchesB.length !== savedMatchesB.length) {
      throw new Error(`Resume B matches were affected by deleting Resume A! Found ${remainingMatchesB.length}`);
    }
    console.log(`✅ [PASS] Resume B job_matches intact (${remainingMatchesB.length} matches).`);

    if (globalJobsRemaining.length !== allDbJobs.length) {
      throw new Error(`Global jobs table was affected by deleting resume version!`);
    }
    console.log(`✅ [PASS] Global jobs table completely intact (${globalJobsRemaining.length} jobs).`);

    // -------------------------------------------------------------
    // TEST 5: NO STATIC 12-JOB FALLBACK AUDIT
    // -------------------------------------------------------------
    console.log('\n--- TESTING NO STATIC FALLBACK AUDIT ---');
    const emptyMatchTest = JobMatchingService.matchResumeAgainstJobs('', [], allDbJobs);
    if (emptyMatchTest.length !== 0) {
      throw new Error(`Expected empty resume to return 0 matches, but returned ${emptyMatchTest.length}`);
    }
    console.log(`✅ [PASS] Empty resume returns exactly 0 matches (No static 12-job fallback).`);

    console.log('\n====================================================');
    console.log('RESULTS: ALL 12 VERIFICATION TESTS PASSED (100%)');
    console.log('====================================================\n');
  } finally {
    // Cleanup test user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log('Cleaned up test user from database.');
  }

  process.exit(0);
}

runVerification().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
