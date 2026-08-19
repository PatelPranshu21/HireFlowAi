import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../db';
import { analyzeResumeContentLocally } from '../server/resumeAnalyzer';
import { dbUpdateResumeVersionScore } from '../src/db/postgres';

async function testPranshu() {
  const versionId = 'v_1787142290706_da29';
  const res = await pool.query(
    'SELECT id, resume_text, parsed_data FROM resume_versions WHERE id = $1',
    [versionId]
  );
  if (res.rows.length === 0) {
    console.log('Not found');
    return;
  }
  const row = res.rows[0];
  console.log('Analyzing Pranshu Patel Resume Text (length: ' + row.resume_text.length + ')...');
  
  const analysis = analyzeResumeContentLocally(row.resume_text, 'Full Stack Engineer');
  console.log('\n--- ANALYSIS RESULTS ---');
  console.log('Overall ATS Score:', analysis.overallScore);
  console.log('Formatting Score:', analysis.formattingScore);
  console.log('Impact Score:', analysis.impactScore);
  console.log('Relevance Score:', analysis.relevanceScore);
  console.log('Analysis Status:', analysis.analysisStatus);
  console.log('Categories Count:', analysis.categoryScores.length);
  console.log('Sections Count:', analysis.sectionAnalyses.length);
  console.log('Detected Skills Count:', analysis.keywordList.filter((k: any) => k.detected && k.foundInResume).length);
  console.log('Detected Skills List:', analysis.keywordList.filter((k: any) => k.detected && k.foundInResume).map((k: any) => `${k.keyword} (${k.frequency}x)`).join(', '));
  console.log('Missing Skills for Full Stack Engineer:', analysis.missingKeywords.map((k: any) => k.keyword).join(', '));
  console.log('\nSection Breakdown:');
  for (const s of analysis.sectionAnalyses) {
    console.log(`- ${s.sectionName}: detected=${s.isDetected}, score=${s.score}, priority=${s.priority}`);
  }
  console.log('\nAI Suggestions:');
  for (const sug of analysis.aiSuggestions) {
    console.log(`- [${sug.section}] ${sug.title} (+${sug.expectedAtsIncrease} pts)`);
  }

  // Update PostgreSQL with this analysis so the user's active version is immediately fully populated!
  await dbUpdateResumeVersionScore(versionId, analysis.overallScore, analysis);
  console.log('\n✅ Successfully updated PostgreSQL resume_versions with complete analysis_data!');
  process.exit(0);
}

testPranshu().catch(e => { console.error(e); process.exit(1); });
