import dotenv from 'dotenv';
dotenv.config();

import { pool } from '../db';
import { parseResumeDocument, extractTextFromBuffer } from '../server/documentParser';
import { analyzeResumeContentLocally } from '../server/resumeAnalyzer';
import { 
  dbCreateUser, 
  dbSaveResumeVersion, 
  dbSaveAtsReport,
  dbSaveJobMatches,
  dbGetAtsReports,
  dbGetJobMatchesForResumeVersion
} from '../src/db/postgres';

async function verifyPdfUploadFlow() {
  console.log('====================================================');
  console.log('PDF UPLOAD & ANALYSIS FLOW VERIFICATION TEST');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(cond: boolean, name: string) {
    total++;
    if (cond) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
    }
  }

  // 1. Create a full-content PDF with text streams
  const resumePdfSource = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 380 >> stream
BT
/F1 16 Tf
50 750 Td
(Pranshu Patel) Tj
/F1 12 Tf
0 -25 Td
(pranshu.patel@example.com | +1 555 123 4567 | San Francisco, CA) Tj
0 -25 Td
(PROFESSIONAL SUMMARY) Tj
0 -20 Td
(Full Stack Software Engineer with expertise in React, TypeScript, Node.js, and PostgreSQL.) Tj
0 -25 Td
(WORK EXPERIENCE) Tj
0 -20 Td
(Senior Full Stack Developer - TechCorp 2021-Present) Tj
0 -20 Td
(Architected cloud web applications using React, Node.js, Docker, Kubernetes, and PostgreSQL.) Tj
0 -25 Td
(TECHNICAL SKILLS) Tj
0 -20 Td
(JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, Kubernetes, Git, AWS) Tj
0 -25 Td
(EDUCATION) Tj
0 -20 Td
(B.S. in Computer Science - University of California, Berkeley) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000234 00000 n 
0000000664 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
741
%%EOF`;

  const pdfBuf = Buffer.from(resumePdfSource, 'utf-8');
  const base64Data = 'data:application/pdf;base64,' + pdfBuf.toString('base64');

  // Step 1: Test parseResumeDocument with base64 data
  const parsedDoc = await parseResumeDocument({ fileData: base64Data, fileName: 'CV.pdf' });
  assert(parsedDoc.extractionSuccess === true, 'parseResumeDocument succeeded on valid PDF');
  assert(parsedDoc.extractedTextLength > 100, `Extracted length (${parsedDoc.extractedTextLength}) > 100 chars`);
  assert(parsedDoc.text.includes('Pranshu Patel'), 'Extracted name "Pranshu Patel"');
  assert(parsedDoc.text.includes('TypeScript') && parsedDoc.text.includes('PostgreSQL'), 'Extracted technical skills');
  assert(!parsedDoc.text.includes('-- 1 of 1 --'), 'Page marker artifacts removed');

  // Step 2: Test Analysis
  const analysis = analyzeResumeContentLocally(parsedDoc.text, 'Full Stack Engineer');
  assert(analysis.overallScore > 60, `ATS Score is strong (${analysis.overallScore}%)`);
  const detectedSkills = (analysis.keywordList || []).filter((k: any) => k.detected).map((k: any) => k.keyword);
  assert(detectedSkills.includes('React') && detectedSkills.includes('PostgreSQL'), 'Detected React & PostgreSQL skills');

  // Step 3: Test Database operations and Foreign Key Safety
  const testUserId = `usr_test_pdf_${Date.now()}`;
  const user = await dbCreateUser({
    id: testUserId,
    email: `pdf_test_${Date.now()}@example.com`,
    first_name: 'PDF Test',
    last_name: 'User',
    auth_provider: 'local'
  });
  assert(!!user, 'Created test user in PostgreSQL');

  const testVersionId = `v_${Date.now()}_test`;

  // Safe ATS Report save even BEFORE version exists
  const unlinkedAtsReport = await dbSaveAtsReport(testUserId, {
    resume_id: testVersionId,
    target_role: 'Full Stack Engineer',
    overall_score: analysis.overallScore,
    formatting_score: analysis.formattingScore,
    summary: analysis.summary,
    keywords: analysis.keywords,
    analysis_data: analysis
  });
  assert(!!unlinkedAtsReport, 'dbSaveAtsReport succeeds with fallback (no foreign key violation)');

  // Safe Job Matches save even BEFORE version exists
  const earlyJobMatches = await dbSaveJobMatches(testUserId, testVersionId, [
    {
      resume_version_id: testVersionId,
      job_id: 'job_1',
      match_score: 90,
      matched_skills: ['React', 'Node.js'],
      missing_skills: [],
      why_match: 'Strong React & Node skills'
    }
  ]);
  assert(earlyJobMatches === false, 'dbSaveJobMatches safely skips uncommitted version without FK error');

  // Save resume version
  const savedVersion = await dbSaveResumeVersion(testUserId, {
    id: testVersionId,
    version_name: 'CV.pdf',
    resume_text: parsedDoc.text,
    parsed_data: { skills: detectedSkills },
    score: analysis.overallScore,
    template: 'modern_tech',
    file_name: 'CV.pdf',
    analysis_data: analysis
  });
  assert(!!savedVersion, 'dbSaveResumeVersion successfully saved PDF version');

  // Save Job Matches now that version exists
  const savedJobMatches = await dbSaveJobMatches(testUserId, testVersionId, [
    {
      resume_version_id: testVersionId,
      job_id: 'job_1',
      match_score: 90,
      matched_skills: ['React', 'Node.js'],
      missing_skills: [],
      why_match: 'Strong React & Node skills'
    }
  ]);
  assert(savedJobMatches === true, 'dbSaveJobMatches successfully saved matches once version exists');

  const dbMatches = await dbGetJobMatchesForResumeVersion(testUserId, testVersionId);
  assert(dbMatches.length === 1 && (dbMatches[0].matchScore === 90 || dbMatches[0].match_score === 90), 'Retrieved job matches from DB correctly');

  // Clean up
  await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  console.log('Cleaned up test user from DB.');

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');
  process.exit(0);
}

verifyPdfUploadFlow().catch(err => {
  console.error('Fatal error in PDF flow test:', err);
  process.exit(1);
});
