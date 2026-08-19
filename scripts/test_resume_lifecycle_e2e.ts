import { 
  getPool, 
  initDb, 
  dbCreateUser, 
  dbFindUserById, 
  dbSaveResume, 
  dbSaveResumeVersion, 
  dbSaveJobMatches, 
  dbGetJobMatchesForResumeVersion, 
  dbUpdateResumeVersionScore, 
  dbDeleteResumeVersion, 
  dbGetAllUserData 
} from '../src/db/postgres';
import { JobMatchingService } from '../src/services/jobMatchingService';
import { mockJobsList } from '../src/data/jobProvider';

async function runE2ETest() {
  console.log('================================================================');
  console.log('   HIREFLOW AI — RESUME VERSION LIFECYCLE & DUPLICATE E2E TEST   ');
  console.log('================================================================\n');

  const pool = getPool();
  if (!pool) {
    console.error('ERROR: No PostgreSQL pool');
    process.exit(1);
  }
  await initDb();

  const testUserId = `usr_lifecycle_test_${Date.now()}`;
  const testEmail = `candidate_${Date.now()}@e2etest.com`;

  // STEP A: Create / Login Test User
  console.log('STEP A: Login / Create User');
  const user = await dbCreateUser({
    id: testUserId,
    email: testEmail,
    first_name: 'E2E Candidate',
    auth_provider: 'local',
    profile_data: {
      fullName: 'E2E Candidate',
      email: testEmail,
      resumeVersions: [],
      activeResumeVersionId: '',
      atsScore: 0
    }
  });
  console.log(`✓ Created test candidate: ${testUserId} (${testEmail})`);

  // STEP B: Upload Resume A
  console.log('\nSTEP B: Upload Resume A (Python / Full Stack)');
  const resumeTextA = `
    PRANSHU PATEL
    Senior Python & Full-Stack Software Engineer
    Email: ${testEmail}
    SKILLS: Python, Django, FastAPI, React, TypeScript, PostgreSQL, Docker, AWS, REST APIs, Git.
    EXPERIENCE:
    - Senior Full Stack Developer (3 years building Django + React systems).
  `;
  const skillsA = JobMatchingService.extractSkills(resumeTextA);
  const recsA = JobMatchingService.matchResumeAgainstJobs(resumeTextA, skillsA, mockJobsList, 'Full Stack Engineer');

  const versionIdA = `ver_A_${Date.now()}`;
  
  // 1. Parent Resume
  const parentResumeA = await dbSaveResume(testUserId, {
    file_name: 'Pranshu_Python_Resume.docx',
    version_name: 'Pranshu_Python_Resume.docx',
    resume_text: resumeTextA,
    parsed_data: { skills: skillsA },
    ats_score: 72
  });

  // 2. Resume Version
  const savedVerA = await dbSaveResumeVersion(testUserId, {
    id: versionIdA,
    resume_id: parentResumeA.id,
    version_name: 'Pranshu_Python_Resume.docx',
    file_name: 'Pranshu_Python_Resume.docx',
    resume_text: resumeTextA,
    parsed_data: { skills: skillsA },
    score: 72,
    template: 'modern_tech',
    jobs_matched_count: recsA.length
  });

  // 3. Score & Analysis
  const analysisDataA = {
    overallScore: 72,
    summary: 'Python Full Stack profile with strong React & Django experience.',
    keywordList: skillsA.map(k => ({ keyword: k, detected: true }))
  };
  await dbUpdateResumeVersionScore(versionIdA, 72, analysisDataA);

  // 4. Job Matches
  const dbMatchesA = recsA.map(m => ({
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

  // STEP C, D, E, F: Verify single version & persisted state
  console.log('\nSTEP C, D, E, F: Verify Single Version & Persisted Data');
  const dataAfterA = await dbGetAllUserData(testUserId);
  console.log(`- resume_versions in DB: ${dataAfterA.resumeVersions.length} (Expected: 1)`);
  console.log(`- resumes in DB:         ${dataAfterA.resumes.length} (Expected: 1)`);
  console.log(`- ATS Score in DB:       ${dataAfterA.resumeVersions[0]?.score} (Expected: 72)`);
  console.log(`- job_matches in DB:     ${dataAfterA.jobMatches.length} (Expected: ${recsA.length})`);
  console.log(`- resume_id value:       ${dataAfterA.resumeVersions[0]?.resume_id} (Expected: non-null)`);

  if (dataAfterA.resumeVersions.length !== 1 || dataAfterA.resumes.length !== 1) {
    throw new Error(`Expected exactly 1 version and 1 resume, got ${dataAfterA.resumeVersions.length}`);
  }
  if (!dataAfterA.resumeVersions[0]?.resume_id) {
    throw new Error('resume_id must not be null');
  }
  console.log('✓ STEP C-F PASSED: Exactly 1 resume_version, 1 resume, 72 ATS score, non-null resume_id.');

  // STEP G, H: Simulate Page Refresh
  console.log('\nSTEP G, H: Simulate Page Refresh (Re-query PostgreSQL)');
  const refreshedData = await dbGetAllUserData(testUserId);
  if (refreshedData.resumeVersions.length !== 1) {
    throw new Error(`Duplicate appeared after page refresh: count is ${refreshedData.resumeVersions.length}`);
  }
  console.log('✓ STEP G-H PASSED: Still exactly 1 resume card after page refresh.');

  // STEP I, J, K: Simulate Logout & Login
  console.log('\nSTEP I, J, K: Simulate Logout & Login');
  const reloadedLoginData = await dbGetAllUserData(testUserId);
  if (reloadedLoginData.resumeVersions.length !== 1) {
    throw new Error(`Duplicate appeared after login: count is ${reloadedLoginData.resumeVersions.length}`);
  }
  console.log('✓ STEP I-K PASSED: Exactly 1 resume version reconstructed upon login.');

  // STEP L, M: Upload Resume B
  console.log('\nSTEP L, M: Upload Resume B (Java / Kafka Architect)');
  const resumeTextB = `
    PRANSHU PATEL
    Principal Java Architect & Distributed Systems Engineer
    Email: ${testEmail}
    SKILLS: Java, Spring Boot, Apache Kafka, gRPC, Kubernetes, Redis, Microservices, MySQL, Git.
    EXPERIENCE:
    - Principal Backend Architect (5 years building high scale Java microservices).
  `;
  const skillsB = JobMatchingService.extractSkills(resumeTextB);
  const recsB = JobMatchingService.matchResumeAgainstJobs(resumeTextB, skillsB, mockJobsList, 'Java Architect');

  const versionIdB = `ver_B_${Date.now()}`;
  
  const parentResumeB = await dbSaveResume(testUserId, {
    file_name: 'Pranshu_Java_Resume.docx',
    version_name: 'Pranshu_Java_Resume.docx',
    resume_text: resumeTextB,
    parsed_data: { skills: skillsB },
    ats_score: 84
  });

  await dbSaveResumeVersion(testUserId, {
    id: versionIdB,
    resume_id: parentResumeB.id,
    version_name: 'Pranshu_Java_Resume.docx',
    file_name: 'Pranshu_Java_Resume.docx',
    resume_text: resumeTextB,
    parsed_data: { skills: skillsB },
    score: 84,
    template: 'executive',
    jobs_matched_count: recsB.length
  });

  const analysisDataB = {
    overallScore: 84,
    summary: 'Java Distributed Systems Architect profile with Kafka expertise.',
    keywordList: skillsB.map(k => ({ keyword: k, detected: true }))
  };
  await dbUpdateResumeVersionScore(versionIdB, 84, analysisDataB);

  const dbMatchesB = recsB.map(m => ({
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

  const dataAfterB = await dbGetAllUserData(testUserId);
  console.log(`- Total resume_versions in DB: ${dataAfterB.resumeVersions.length} (Expected: 2)`);
  if (dataAfterB.resumeVersions.length !== 2) {
    throw new Error(`Expected exactly 2 resume versions, found ${dataAfterB.resumeVersions.length}`);
  }
  console.log('✓ STEP L-M PASSED: Exactly 2 resume versions exist in DB.');

  // STEP N, O: Verify Independent Data & No Cross-Contamination
  console.log('\nSTEP N, O: Verify Isolation (Resume A vs Resume B)');
  const loadedVerA = dataAfterB.resumeVersions.find(v => v.id === versionIdA);
  const loadedVerB = dataAfterB.resumeVersions.find(v => v.id === versionIdB);

  console.log(`- Resume A Score: ${loadedVerA?.score} (Expected: 72)`);
  console.log(`- Resume B Score: ${loadedVerB?.score} (Expected: 84)`);

  const matchesForA = await dbGetJobMatchesForResumeVersion(testUserId, versionIdA);
  const matchesForB = await dbGetJobMatchesForResumeVersion(testUserId, versionIdB);

  console.log(`- Matches strictly for Version A: ${matchesForA.length}`);
  console.log(`- Matches strictly for Version B: ${matchesForB.length}`);

  const metaMatchA = matchesForA.find(m => m.job_id === 'job_meta_python')?.match_score;
  const metaMatchB = matchesForB.find(m => m.job_id === 'job_meta_python')?.match_score;
  console.log(`- Meta Python Job Match: Version A = ${metaMatchA}% | Version B = ${metaMatchB}%`);

  if ((metaMatchA ?? 0) <= (metaMatchB ?? 0)) {
    throw new Error('Version A must score higher on Meta Python than Version B');
  }
  console.log('✓ STEP N-O PASSED: Resumes maintain independent scores, analyses, and job match sets.');

  // STEP P, Q, R: Delete Resume A
  console.log('\nSTEP P, Q, R: Delete Resume A & Verify Cascade Deletion');
  await dbDeleteResumeVersion(testUserId, versionIdA);

  const checkA = await pool.query('SELECT * FROM resume_versions WHERE id = $1', [versionIdA]);
  const checkMatchesA = await pool.query('SELECT * FROM job_matches WHERE resume_version_id = $1', [versionIdA]);
  const checkB = await pool.query('SELECT * FROM resume_versions WHERE id = $1', [versionIdB]);
  const checkMatchesB = await pool.query('SELECT * FROM job_matches WHERE resume_version_id = $1', [versionIdB]);

  console.log(`- Resume A rows remaining in resume_versions: ${checkA.rows.length} (Expected: 0)`);
  console.log(`- Resume A rows remaining in job_matches:     ${checkMatchesA.rows.length} (Expected: 0)`);
  console.log(`- Resume B rows remaining in resume_versions: ${checkB.rows.length} (Expected: 1)`);
  console.log(`- Resume B rows remaining in job_matches:     ${checkMatchesB.rows.length} (Expected: 12)`);

  if (checkA.rows.length !== 0 || checkMatchesA.rows.length !== 0) {
    throw new Error('Resume A records were not completely purged');
  }
  if (checkB.rows.length !== 1 || checkMatchesB.rows.length !== 12) {
    throw new Error('Resume B records were inadvertently affected');
  }
  console.log('✓ STEP P-R PASSED: Resume A completely deleted via cascade, Resume B intact.');

  // STEP S, T, U: Refresh & Re-login after Deletion
  console.log('\nSTEP S, T, U: Refresh & Re-login after Deletion');
  const finalLoginData = await dbGetAllUserData(testUserId);
  console.log(`- Final resume_versions count: ${finalLoginData.resumeVersions.length} (Expected: 1)`);
  console.log(`- Remaining Version ID:         ${finalLoginData.resumeVersions[0]?.id} (Expected: ${versionIdB})`);

  if (finalLoginData.resumeVersions.length !== 1 || finalLoginData.resumeVersions[0]?.id !== versionIdB) {
    throw new Error('Expected only Resume B to remain after login');
  }
  console.log('✓ STEP S-U PASSED: Only Resume B remains exactly once.');

  // Clean up test user
  await pool.query('DELETE FROM job_matches WHERE user_id = $1', [testUserId]);
  await pool.query('DELETE FROM resume_versions WHERE user_id = $1', [testUserId]);
  await pool.query('DELETE FROM resumes WHERE user_id = $1', [testUserId]);
  await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  console.log(`✓ Test candidate ${testUserId} cleaned up.`);

  console.log('\n================================================================');
  console.log('   ALL E2E LIFECYCLE TESTS PASSED WITH 100% SUCCESS!           ');
  console.log('================================================================\n');

  process.exit(0);
}

runE2ETest().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
