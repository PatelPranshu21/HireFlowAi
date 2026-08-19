import dotenv from 'dotenv';
dotenv.config();

import { pool } from '../db';
import { 
  parseResumeDocument, 
  extractTextFromBuffer, 
  detectFileType,
  normalizeExtractedText 
} from '../server/documentParser';
import { analyzeResumeContentLocally } from '../server/resumeAnalyzer';
import { JobMatchingService, CANONICAL_SKILLS } from '../src/services/jobMatchingService';
import { mockJobsList } from '../src/data/jobProvider';
import { 
  dbCreateUser, 
  dbSaveResumeVersion, 
  dbUpdateResumeVersionScore, 
  dbGetAllUserData,
  dbDeleteResumeVersion,
  initDb
} from '../src/db/postgres';

async function runE2eTests() {
  console.log('====================================================');
  console.log('HIREFLOW AI – RESUME ANALYSIS PIPELINE E2E TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error('   Detail:', detail);
    }
  }

  // ----------------------------------------------------
  // TEST SUITE 1: REAL DOCX / TXT / PDF DOCUMENT EXTRACTION
  // ----------------------------------------------------
  console.log('\n--- 1. Document Extraction & Normalization Tests ---');

  const docxSimulatedContent = `
    SARAH CONNOR
    sarah.connor@example.com | (555) 019-2834 | Austin, TX
    
    PROFESSIONAL SUMMARY
    Senior Backend Architect with 8+ years experience building cloud microservices in Go, Python, and PostgreSQL.
    
    WORK EXPERIENCE
    Lead Backend Engineer | Cyberdyne Systems (2020 - Present)
    • Architected distributed event stream pipelines in Go and Kafka processing 2M+ events/sec with sub-5ms latency.
    • Optimized PostgreSQL database clusters, reducing cloud compute costs by $45,000 annually.
    • Spearheaded transition to Docker and Kubernetes container orchestration across 40+ microservices.
    
    TECHNICAL SKILLS
    Languages: Go, Python, SQL, TypeScript
    Platforms & Cloud: Docker, Kubernetes, Linux, Redis, PostgreSQL
    
    PROJECTS
    Distributed KV Store: Built RAFT consensus key-value store in Go with 99.99% uptime.
    
    EDUCATION
    B.S. in Computer Science | University of Texas at Austin (2016)
  `;

  // 1A. TXT Parsing
  const parsedTxt = await parseResumeDocument({ fileText: docxSimulatedContent, fileName: 'sarah_resume.txt' });
  assert(parsedTxt.extractionSuccess === true, 'TXT resume parsing succeeds');
  assert(parsedTxt.extractedTextLength > 200, `TXT text length valid (${parsedTxt.extractedTextLength} chars)`);

  // 1B. Scanned PDF with 0 characters
  const emptyScannedPdf = await parseResumeDocument({ fileText: '', fileName: 'scanned_document.pdf' });
  assert(emptyScannedPdf.extractionSuccess === false, 'Scanned PDF with 0 text returns extractionSuccess=false');
  assert(emptyScannedPdf.extractedTextLength === 0, 'Scanned PDF returns 0 extractedTextLength');
  assert(Boolean(emptyScannedPdf.error), `Scanned PDF returns clear error message ("${emptyScannedPdf.error}")`);

  // ----------------------------------------------------
  // TEST SUITE 2: ANALYZER OUTPUT & CANONICAL SCHEMA VALIDATION
  // ----------------------------------------------------
  console.log('\n--- 2. Resume Analyzer Output & Canonical Schema Tests ---');

  const analysis = analyzeResumeContentLocally(docxSimulatedContent, 'Backend Engineer');

  console.log('\n[DEBUG ANALYZER OUTPUT]:', JSON.stringify({
    overallScore: analysis.overallScore,
    analysisStatus: analysis.analysisStatus,
    categoryCount: analysis.categoryBreakdown?.length,
    sectionCount: analysis.sectionAnalysis?.length,
    suggestionCount: analysis.improvements?.length,
    detectedSkills: (analysis.keywordList || []).filter(k => k.detected).map(k => k.keyword),
    missingSkills: (analysis.missingKeywords || []).map(k => k.keyword)
  }, null, 2));

  assert(analysis.analysisStatus === 'completed', 'analysisStatus is "completed"');
  assert(analysis.overallScore > 0, `overallScore > 0 (Calculated: ${analysis.overallScore}%)`);
  assert(Array.isArray(analysis.categoryBreakdown) && analysis.categoryBreakdown.length === 10, 'categoryBreakdown has all 10 categories');
  assert(Array.isArray(analysis.categoryScores) && analysis.categoryScores.length === 10, 'categoryScores alias has all 10 categories');
  assert(Array.isArray(analysis.sectionAnalysis) && analysis.sectionAnalysis.length === 6, 'sectionAnalysis has all 6 core sections');
  assert(Array.isArray(analysis.sectionAnalyses) && analysis.sectionAnalyses.length === 6, 'sectionAnalyses alias has all 6 core sections');
  assert(Array.isArray(analysis.improvements) && analysis.improvements.length > 0, 'improvements contains dynamic suggestions');
  assert(Array.isArray(analysis.aiSuggestions) && analysis.aiSuggestions.length > 0, 'aiSuggestions alias populated');
  assert(Array.isArray(analysis.keywords) && analysis.keywords.length > 0, 'keywords contains verified skills');
  assert(Array.isArray(analysis.keywordList) && analysis.keywordList.length > 0, 'keywordList alias populated');
  assert(typeof analysis.extractedText === 'string' && analysis.extractedText.length > 0, 'extractedText is present in canonical analysis');

  // ----------------------------------------------------
  // TEST SUITE 3: ANTI-HALLUCINATION & PROVENANCE VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- 3. Strict Keyword Anti-Hallucination Tests ---');

  const detectedNames = (analysis.keywordList || []).filter(k => k.detected && k.foundInResume).map(k => k.keyword);
  assert(detectedNames.includes('Go'), 'Go is detected (present in text)');
  assert(detectedNames.includes('Python'), 'Python is detected (present in text)');
  assert(detectedNames.includes('PostgreSQL'), 'PostgreSQL is detected (present in text)');
  assert(detectedNames.includes('Docker'), 'Docker is detected (present in text)');
  assert(detectedNames.includes('Kubernetes'), 'Kubernetes is detected (present in text)');

  // Critical Anti-Hallucination: AWS, Terraform, React are NOT in Sarah's resume
  assert(!detectedNames.includes('AWS'), 'CRITICAL: AWS is NOT reported as detected in resume');
  assert(!detectedNames.includes('Terraform'), 'CRITICAL: Terraform is NOT reported as detected in resume');
  assert(!detectedNames.includes('React'), 'CRITICAL: React is NOT reported as detected in resume');

  // ----------------------------------------------------
  // TEST SUITE 4: POSTGRESQL PERSISTENCE & DIRECT SQL INSPECTION
  // ----------------------------------------------------
  console.log('\n--- 4. PostgreSQL Persistence & SQL Verification ---');

  await initDb();

  const testUserId = `usr_test_${Date.now()}`;
  const testEmail = `test_pipeline_${Date.now()}@example.com`;
  const testUser = await dbCreateUser({
    id: testUserId,
    email: testEmail,
    first_name: 'Sarah',
    last_name: 'Connor',
    password_hash: 'test_hash_123',
    auth_provider: 'email',
    profile_data: { targetRole: 'Backend Engineer' }
  });

  assert(!!testUser && !!testUser.id, 'Test user created in PostgreSQL');

  if (testUser) {
    const versionId = `ver_sarah_${Date.now()}`;
    await dbSaveResumeVersion(testUser.id, {
      id: versionId,
      version_name: 'Sarah Connor Backend Resume.docx',
      file_name: 'sarah_resume.docx',
      resume_text: docxSimulatedContent,
      parsed_data: { skills: ['Go', 'Python', 'PostgreSQL', 'Docker', 'Kubernetes'] },
      score: analysis.overallScore,
      template: 'modern_tech',
      uploaded_at: new Date().toISOString(),
      analysis_data: analysis
    });

    // Run direct SQL query as requested in Critical Check #2
    const pgRes = await pool.query(
      `SELECT id, version_name, score, analysis_data, jobs_matched_count 
       FROM resume_versions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [testUser.id]
    );

    assert(pgRes.rows.length === 1, 'PostgreSQL row successfully retrieved via direct SQL');
    const row = pgRes.rows[0];

    console.log('\n[POSTGRESQL ROW INSPECTION]:', {
      id: row.id,
      version_name: row.version_name,
      score: row.score,
      hasAnalysisData: !!row.analysis_data,
      analysisDataKeys: Object.keys(typeof row.analysis_data === 'string' ? JSON.parse(row.analysis_data) : (row.analysis_data || {})),
      jobs_matched_count: row.jobs_matched_count
    });

    const parsedRowAnalysis = typeof row.analysis_data === 'string' ? JSON.parse(row.analysis_data) : row.analysis_data;

    assert(row.score === analysis.overallScore, `PostgreSQL score matches analyzer score (${row.score})`);
    assert(!!parsedRowAnalysis && parsedRowAnalysis.overallScore === analysis.overallScore, 'analysis_data.overallScore matches in PostgreSQL');
    assert(Array.isArray(parsedRowAnalysis.categoryScores) && parsedRowAnalysis.categoryScores.length === 10, 'analysis_data contains all 10 categoryScores in PostgreSQL');
    assert(Array.isArray(parsedRowAnalysis.sectionAnalyses) && parsedRowAnalysis.sectionAnalyses.length === 6, 'analysis_data contains all 6 sectionAnalyses in PostgreSQL');
    assert(Array.isArray(parsedRowAnalysis.aiSuggestions) && parsedRowAnalysis.aiSuggestions.length > 0, 'analysis_data contains aiSuggestions in PostgreSQL');
    assert(Array.isArray(parsedRowAnalysis.keywordList) && parsedRowAnalysis.keywordList.length > 0, 'analysis_data contains keywordList in PostgreSQL');

    // ----------------------------------------------------
    // TEST SUITE 5: DATABASE HYDRATION & REFRESH SIMULATION
    // ----------------------------------------------------
    console.log('\n--- 5. Database Hydration & Refresh Simulation ---');

    const loadedUserData = await dbGetAllUserData(testUser.id);
    const loadedVersions = loadedUserData.resumeVersions;

    assert(loadedVersions.length === 1, 'dbGetAllUserData returns exactly 1 version');
    const hydratedVersion = loadedVersions[0];
    const hydratedAnalysis = typeof hydratedVersion.analysis_data === 'string' 
      ? JSON.parse(hydratedVersion.analysis_data) 
      : hydratedVersion.analysis_data;

    assert(!!hydratedAnalysis, 'Hydrated version has non-null analysis_data');
    assert(hydratedAnalysis.overallScore === analysis.overallScore, 'Hydrated analysis overallScore preserved');
    assert(hydratedAnalysis.categoryScores.length === 10, 'Hydrated analysis categoryScores preserved (10 categories)');
    assert(hydratedAnalysis.sectionAnalyses.length === 6, 'Hydrated analysis sectionAnalyses preserved (6 sections)');
    assert(hydratedAnalysis.aiSuggestions.length > 0, 'Hydrated analysis aiSuggestions preserved');

    // ----------------------------------------------------
    // TEST SUITE 6: MULTI-VERSION ISOLATION & DELETION
    // ----------------------------------------------------
    console.log('\n--- 6. Multi-Version Isolation & Deletion ---');

    const frontendVersionId = `ver_frontend_${Date.now()}`;
    const frontendContent = `
      SARAH CONNOR
      sarah@example.com
      SUMMARY
      Frontend Engineer with React, TypeScript, Next.js, and Tailwind CSS.
      EXPERIENCE
      Frontend Dev | UIWorks (2021-Present)
      • Built web apps with React and TypeScript.
      SKILLS
      React, TypeScript, Next.js, Tailwind CSS
      EDUCATION
      B.S. Computer Science
    `;
    const frontendAnalysis = analyzeResumeContentLocally(frontendContent, 'Frontend Engineer');

    await dbSaveResumeVersion(testUser.id, {
      id: frontendVersionId,
      version_name: 'Frontend Resume.pdf',
      file_name: 'frontend_resume.pdf',
      resume_text: frontendContent,
      parsed_data: { skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'] },
      score: frontendAnalysis.overallScore,
      template: 'modern_tech',
      uploaded_at: new Date().toISOString(),
      analysis_data: frontendAnalysis
    });

    const multiVersionData = await dbGetAllUserData(testUser.id);
    assert(multiVersionData.resumeVersions.length === 2, 'dbGetAllUserData returns both versions');

    const backendVer = multiVersionData.resumeVersions.find((v: any) => v.id === versionId);
    const frontendVer = multiVersionData.resumeVersions.find((v: any) => v.id === frontendVersionId);

    const bAnalysis = typeof backendVer.analysis_data === 'string' ? JSON.parse(backendVer.analysis_data) : backendVer.analysis_data;
    const fAnalysis = typeof frontendVer.analysis_data === 'string' ? JSON.parse(frontendVer.analysis_data) : frontendVer.analysis_data;

    const bSkills = (bAnalysis.keywordList || []).filter((k: any) => k.detected && k.foundInResume).map((k: any) => k.keyword);
    const fSkills = (fAnalysis.keywordList || []).filter((k: any) => k.detected && k.foundInResume).map((k: any) => k.keyword);

    assert(bSkills.includes('Go') && !bSkills.includes('React'), 'Version A has Go and NOT React');
    assert(fSkills.includes('React') && !fSkills.includes('Go'), 'Version B has React and NOT Go');

    // Test Deletion
    await dbDeleteResumeVersion(testUser.id, versionId);
    const afterDeleteData = await dbGetAllUserData(testUser.id);
    assert(afterDeleteData.resumeVersions.length === 1, 'Version A deleted; only 1 version remaining');
    assert(afterDeleteData.resumeVersions[0].id === frontendVersionId, 'Version B remains intact');

    // Cleanup
    await dbDeleteResumeVersion(testUser.id, frontendVersionId);
    await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
    console.log('Cleaned up test user & versions from PostgreSQL.');
  }

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL RESUME ANALYSIS PIPELINE & PERSISTENCE TESTS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }
}

runE2eTests().catch(err => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
