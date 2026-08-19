import { getPool, initDb, dbCreateUser, dbSaveResume, dbSaveResumeVersion, dbSaveJobMatches, dbGetJobMatchesForResumeVersion, dbDeleteResumeVersion } from '../src/db/postgres';
import { JobMatchingService } from '../src/services/jobMatchingService';
import { mockJobsList } from '../src/data/jobProvider';

async function runE2ETests() {
  console.log('================================================================');
  console.log('   HIREFLOW AI - CORE JOB MATCHING SYSTEM E2E VERIFICATION TEST  ');
  console.log('================================================================\n');

  // Step 1: Verify PostgreSQL connection & Schema
  console.log('[1/6] Initializing PostgreSQL and database tables...');
  const pool = getPool();
  if (!pool) {
    console.error('FAIL: No database pool configured');
    process.exit(1);
  }
  const dbOk = await initDb();
  if (!dbOk) {
    console.error('FAIL: initDb failed');
    process.exit(1);
  }
  console.log('  ✓ PostgreSQL connection established and tables verified.\n');

  const testUserId = `usr_e2e_test_${Date.now()}`;
  const testEmail = `candidate_${Date.now()}@hireflow-test.ai`;

  // Create test user
  await dbCreateUser({
    id: testUserId,
    email: testEmail,
    first_name: 'E2E Test',
    last_name: 'Candidate',
    auth_provider: 'local',
    profile_data: {
      subscriptionPlan: 'Pro Active',
      subscriptionTier: 'pro_monthly'
    }
  });
  console.log(`  ✓ Test candidate created: ${testUserId} (${testEmail})\n`);

  // Step 2: Define Resume A (Python/Django specialist) and Resume B (Java/Spring Boot specialist)
  console.log('[2/6] Setting up Resumes A & B with distinct technical domains...');
  const resumeTextA = `
    Alex Rivera - Senior Python Backend Engineer
    Email: alex.rivera@example.com | San Francisco, CA
    
    Professional Summary:
    Senior Software Engineer with 6+ years of expertise in Python, Django, PostgreSQL, Redis, REST APIs, and React web applications.
    Proven track record designing scalable backend services, optimizing complex relational SQL queries, and architecting microservices.
    
    Technical Skills:
    - Languages: Python, JavaScript, TypeScript, SQL
    - Frameworks & Libraries: Django, FastAPI, Flask, React, Node.js
    - Databases & Caching: PostgreSQL, Redis, MySQL
    - Cloud & DevOps: Docker, AWS (EC2, S3, RDS), Git, CI/CD
    - Architecture: RESTful API design, Microservices, Asynchronous task queues with Celery

    Work Experience:
    Senior Backend Engineer - FinTech Innovations (2021 - Present)
    - Architected core payment processing services using Python, Django, and PostgreSQL handling $50M+ in monthly transaction volume.
    - Improved database query performance by 40% through indexing strategy and ORM optimization in PostgreSQL.
    - Built internal analytics dashboard using React, TypeScript, and Django REST framework.
  `;

  const resumeTextB = `
    Jordan Chen - Senior Java Microservices Architect
    Email: jordan.chen@example.com | Bengaluru, India
    
    Professional Summary:
    Senior Backend Software Engineer with 7+ years of experience building high-throughput enterprise systems with Java, Spring Boot, MySQL, and Kafka event streaming.
    Specialized in JVM performance tuning, low-latency microservices, and distributed cloud computing.
    
    Technical Skills:
    - Languages: Java 17/21, Kotlin, SQL, Go
    - Frameworks & Libraries: Spring Boot, Spring Cloud, Hibernate, gRPC
    - Messaging & Databases: Apache Kafka, RabbitMQ, MySQL, MongoDB, Redis
    - Cloud & Infrastructure: Kubernetes, Docker, AWS (EKS, MSK), Terraform
    - Architecture: Event-Driven Architecture, CQRS, Distributed Transactions, SAGA Pattern

    Work Experience:
    Principal Backend Engineer - CloudScale Logistics (2020 - Present)
    - Designed event-driven Java Spring Boot microservices processing 30,000+ logistics tracking events/sec using Apache Kafka.
    - Reduced database contention and lock latency on MySQL cluster by 55% via sharding and optimized connection pooling.
    - Implemented resilience patterns (Circuit Breaker, Rate Limiter) using Spring Cloud and AWS infrastructure.
  `;

  // Step 3: Parse and Match Resume A against available jobs
  console.log('[3/6] Running deterministic matching algorithm on Resume A (Python/Django)...');
  const versionIdA = `ver_py_${Date.now()}`;
  const skillsA = JobMatchingService.extractSkills(resumeTextA);
  console.log('  Extracted Skills for Resume A:', skillsA);

  const matchesA = JobMatchingService.matchResumeAgainstJobs(resumeTextA, skillsA, mockJobsList, 'Python Backend Engineer');

  // Save to PostgreSQL
  const savedVersionA = await dbSaveResumeVersion(testUserId, {
    id: versionIdA,
    version_name: 'Python Django Resume',
    resume_text: resumeTextA,
    parsed_data: { skills: skillsA },
    score: 92,
    template: 'modern_tech',
    file_name: 'Alex_Rivera_Python_Resume.pdf'
  });

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
  await dbSaveJobMatches(testUserId, versionIdA, dbMatchesA);
  console.log(`  ✓ Saved ${dbMatchesA.length} job matches for Resume Version A (${versionIdA}) in PostgreSQL.\n`);

  // Step 4: Parse and Match Resume B against available jobs
  console.log('[4/6] Running deterministic matching algorithm on Resume B (Java/Spring Boot)...');
  const versionIdB = `ver_java_${Date.now()}`;
  const skillsB = JobMatchingService.extractSkills(resumeTextB);
  console.log('  Extracted Skills for Resume B:', skillsB);

  const matchesB = JobMatchingService.matchResumeAgainstJobs(resumeTextB, skillsB, mockJobsList, 'Java Backend Engineer');

  // Save to PostgreSQL
  const savedVersionB = await dbSaveResumeVersion(testUserId, {
    id: versionIdB,
    version_name: 'Java Spring Boot Resume',
    resume_text: resumeTextB,
    parsed_data: { skills: skillsB },
    score: 88,
    template: 'modern_tech',
    file_name: 'Jordan_Chen_Java_Resume.pdf'
  });

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
  await dbSaveJobMatches(testUserId, versionIdB, dbMatchesB);
  console.log(`  ✓ Saved ${dbMatchesB.length} job matches for Resume Version B (${versionIdB}) in PostgreSQL.\n`);

  // Step 5: Verify Score Differentiation & Domain Alignment
  console.log('[5/6] Validating deterministic score differentiation and PostgreSQL isolation...');
  
  // Fetch persisted matches for Version A
  const pgMatchesA = await dbGetJobMatchesForResumeVersion(testUserId, versionIdA);
  // Fetch persisted matches for Version B
  const pgMatchesB = await dbGetJobMatchesForResumeVersion(testUserId, versionIdB);

  console.log(`  Version A PostgreSQL rows: ${pgMatchesA.length}`);
  console.log(`  Version B PostgreSQL rows: ${pgMatchesB.length}`);

  if (pgMatchesA.length === 0 || pgMatchesB.length === 0) {
    console.error('FAIL: Expected job matches persisted in PostgreSQL for both versions');
    process.exit(1);
  }

  // Find Python Job and Java Job in both match sets
  const pyJobMatchInA = pgMatchesA.find(m => m.job_id === 'job_meta_python');
  const pyJobMatchInB = pgMatchesB.find(m => m.job_id === 'job_meta_python');
  
  const javaJobMatchInA = pgMatchesA.find(m => m.job_id === 'job_flipkart_java');
  const javaJobMatchInB = pgMatchesB.find(m => m.job_id === 'job_flipkart_java');

  console.log('\n--- MATCH SCORE DIFFERENTIATION REPORT ---');
  console.log(`  Meta (Python & Django):`);
  console.log(`    - Resume A (Python Specialist) Score: ${pyJobMatchInA?.match_score}%`);
  console.log(`    - Resume B (Java Specialist)   Score: ${pyJobMatchInB?.match_score}%`);
  
  console.log(`  Flipkart (Java & Spring Boot):`);
  console.log(`    - Resume A (Python Specialist) Score: ${javaJobMatchInA?.match_score}%`);
  console.log(`    - Resume B (Java Specialist)   Score: ${javaJobMatchInB?.match_score}%`);
  console.log('-------------------------------------------\n');

  // Assertions:
  // 1. Resume A MUST score significantly higher on Python job than Resume B
  if (!pyJobMatchInA || !pyJobMatchInB || pyJobMatchInA.match_score <= pyJobMatchInB.match_score) {
    console.error(`FAIL: Resume A score (${pyJobMatchInA?.match_score}) should be strictly greater than Resume B score (${pyJobMatchInB?.match_score}) for Python job.`);
    process.exit(1);
  }
  console.log('  ✓ Assertion Passed: Resume A significantly outscores Resume B on Python/Django role.');

  // 2. Resume B MUST score significantly higher on Java job than Resume A
  if (!javaJobMatchInA || !javaJobMatchInB || javaJobMatchInB.match_score <= javaJobMatchInA.match_score) {
    console.error(`FAIL: Resume B score (${javaJobMatchInB?.match_score}) should be strictly greater than Resume A score (${javaJobMatchInA?.match_score}) for Java job.`);
    process.exit(1);
  }
  console.log('  ✓ Assertion Passed: Resume B significantly outscores Resume A on Java/Spring Boot role.');

  // 3. Resume Version Isolation in PostgreSQL
  for (const match of pgMatchesA) {
    if (match.resume_version_id !== versionIdA) {
      console.error(`FAIL: Version A matches contained unexpected resume_version_id: ${match.resume_version_id}`);
      process.exit(1);
    }
  }
  for (const match of pgMatchesB) {
    if (match.resume_version_id !== versionIdB) {
      console.error(`FAIL: Version B matches contained unexpected resume_version_id: ${match.resume_version_id}`);
      process.exit(1);
    }
  }
  console.log('  ✓ Assertion Passed: Strict 1-to-1 resume_version_id isolation confirmed in PostgreSQL.');

  // Step 6: Test Cascade Deletion of Resume Version
  console.log('\n[6/6] Testing deletion cascade of Resume Version A...');
  await dbDeleteResumeVersion(versionIdA);
  
  const pgMatchesAAfterDelete = await dbGetJobMatchesForResumeVersion(testUserId, versionIdA);
  const pgMatchesBAfterDelete = await dbGetJobMatchesForResumeVersion(testUserId, versionIdB);

  console.log(`  Version A matches after delete: ${pgMatchesAAfterDelete.length} (Expected: 0)`);
  console.log(`  Version B matches after delete: ${pgMatchesBAfterDelete.length} (Expected: ${pgMatchesB.length})`);

  if (pgMatchesAAfterDelete.length !== 0) {
    console.error(`FAIL: Expected 0 job_matches for deleted Version A, got ${pgMatchesAAfterDelete.length}`);
    process.exit(1);
  }
  if (pgMatchesBAfterDelete.length !== pgMatchesB.length) {
    console.error(`FAIL: Version B matches should remain unchanged after Version A deletion`);
    process.exit(1);
  }
  console.log('  ✓ Assertion Passed: ON DELETE CASCADE completely purged Version A matches while preserving Version B.');

  console.log('\n================================================================');
  console.log('  ALL CORE JOB MATCHING SYSTEM E2E TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================\n');

  process.exit(0);
}

runE2ETests().catch(err => {
  console.error('Unhandled E2E test error:', err);
  process.exit(1);
});
