import dotenv from 'dotenv';
dotenv.config();

import { JobIngestionService } from '../server/jobIngestionService';
import { JobMatchingService } from '../src/services/jobMatchingService';
import { analyzeResumeContentLocally } from '../server/resumeAnalyzer';
import { parseResumeDocument } from '../server/documentParser';
import { initDb, dbSaveResume, dbSaveResumeVersion, dbSaveJobMatches, dbSaveAtsReport, dbFindUserById, dbUpdateUserProfile, dbUpdateResumeVersionScore } from '../src/db/postgres';

async function runBenchmark() {
  const dbInitStart = performance.now();
  await initDb();
  console.log(`DB Init: ${(performance.now() - dbInitStart).toFixed(2)}ms`);

  const sampleResume = `
    PRANSHU PATEL
    pranshu@hireflow.ai | (555) 123-4567 | San Francisco, CA | linkedin.com/in/pranshupatel | github.com/pranshupatel
    
    PROFESSIONAL SUMMARY
    Senior Full Stack Engineer with 7+ years of experience designing and scaling high-throughput distributed web applications using React, TypeScript, Node.js, Python, PostgreSQL, and AWS. Proven track record reducing latency by 45% and optimizing cloud architecture.
    
    WORK EXPERIENCE
    Lead Software Engineer | Apex Cloud Systems (2021 - Present)
    • Architected and deployed scalable microservices in Node.js and TypeScript handling 50k+ daily active users with 99.99% uptime.
    • Optimized PostgreSQL database queries and indexes, reducing p99 query latency from 850ms to 42ms.
    • Spearheaded transition to Docker containerization and Kubernetes orchestration on AWS (EKS, S3, RDS).
    • Built automated CI/CD deployment pipelines with GitHub Actions, reducing release cycle time by 60%.
    
    Senior Frontend Engineer | DataVibe Inc. (2018 - 2021)
    • Engineered reactive responsive dashboards in React, Redux, and Tailwind CSS, improving Core Web Vitals score to 98.
    • Developed reusable component library and integrated GraphQL APIs for real-time analytics streaming.
    
    TECHNICAL SKILLS
    Languages: TypeScript, JavaScript, Python, SQL, HTML/CSS, Go
    Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Redux, GraphQL
    Databases & Cloud: PostgreSQL, Redis, MySQL, AWS, Docker, Kubernetes, CI/CD, Git
    Architecture: REST APIs, Microservices, Distributed Systems, System Design, Web Security
    
    EDUCATION
    B.S. in Computer Science | University of California, Berkeley (2018)
  `;

  const totalPipelineStart = performance.now();

  // 1. Extraction
  const tExtractionStart = performance.now();
  const docParse = await parseResumeDocument({ fileText: sampleResume, fileName: 'Pranshu_Patel_Resume.pdf' });
  const tExtraction = performance.now() - tExtractionStart;

  const resumeText = docParse.text;
  const targetRole = 'Senior Full Stack Engineer';

  // 2. Local Analysis (ATS, Sections, Keywords, Improvements)
  const tAnalysisStart = performance.now();
  const analysis = analyzeResumeContentLocally(resumeText, targetRole);
  const tAnalysis = performance.now() - tAnalysisStart;

  // 3. Job Matching
  const tJobFetchStart = performance.now();
  const availableJobs = await JobIngestionService.getAvailableJobs();
  const tJobFetch = performance.now() - tJobFetchStart;
  console.log(`Available Jobs in DB: ${availableJobs.length} (Fetched in ${tJobFetch.toFixed(2)}ms)`);

  const detectedSkills = (analysis.keywordList || [])
    .filter((k: any) => k.detected && k.foundInResume)
    .map((k: any) => k.keyword);

  const tMatchingStart = performance.now();
  const jobMatches = JobMatchingService.matchResumeAgainstJobs(
    resumeText,
    detectedSkills,
    availableJobs,
    targetRole
  );
  const tMatching = performance.now() - tMatchingStart;

  // 4. Database Persistence
  const tDbStart = performance.now();
  const userId = 'usr_benchmark_test';
  const versionId = `v_bm_${Date.now()}`;
  
  await dbSaveResume(userId, {
    file_name: 'Pranshu_Patel_Resume.pdf',
    resume_text: resumeText,
    parsed_data: { skills: detectedSkills },
    ats_score: analysis.overallScore,
    version_name: 'Pranshu Patel Resume'
  });

  await dbSaveResumeVersion(userId, {
    id: versionId,
    version_name: 'Pranshu Patel Resume',
    resume_text: resumeText,
    parsed_data: { skills: detectedSkills },
    score: analysis.overallScore,
    file_name: 'Pranshu_Patel_Resume.pdf',
    analysis_data: analysis
  });

  const dbMatches = jobMatches.map(m => ({
    resume_version_id: versionId,
    job_id: m.id,
    match_score: m.matchScore,
    similarity_score: (m as any).similarityScore || 0,
    skill_match_score: (m as any).skillMatchScore || 0,
    matched_skills: (m as any).matchedSkills || m.requiredSkills || [],
    missing_skills: m.missingSkills || [],
    preferred_skills: [],
    why_match: m.recommendationReason
  }));
  await dbSaveJobMatches(userId, versionId, dbMatches);
  const tDb = performance.now() - tDbStart;

  const totalPipeline = performance.now() - totalPipelineStart;

  console.log('\n==================================================');
  console.log('[ResumePipeline] Timing Benchmark:');
  console.log(`Extraction: ${tExtraction.toFixed(2)}ms`);
  console.log(`Local Analysis (ATS + Sections + Keywords + Improvements): ${tAnalysis.toFixed(2)}ms`);
  console.log(`Job Matching (${availableJobs.length} jobs): ${tMatching.toFixed(2)}ms`);
  console.log(`Database Persistence: ${tDb.toFixed(2)}ms`);
  console.log(`Total: ${totalPipeline.toFixed(2)}ms`);
  console.log(`Matches found: ${jobMatches.length}`);
  console.log('==================================================\n');

  process.exit(0);
}

runBenchmark();
