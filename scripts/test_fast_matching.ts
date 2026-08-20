import dotenv from 'dotenv';
dotenv.config();

import { CANONICAL_SKILLS, SkillDefinition } from '../src/services/jobMatchingService';

const ALIAS_LOOKUP = new Map<string, string>();
for (const skill of CANONICAL_SKILLS) {
  ALIAS_LOOKUP.set(skill.canonical.toLowerCase(), skill.canonical);
  for (const alias of skill.aliases) {
    ALIAS_LOOKUP.set(alias.toLowerCase(), skill.canonical);
  }
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't", 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', "can't", 'cannot',
  'could', "couldn't", 'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't", 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', "hadn't", 'has', "hasn't", 'have', "haven't", 'having', 'he', "he'd",
  "he'll", "he's", 'her', 'here', "here's", 'hers', 'herself', 'him', 'himself', 'his', 'how', "how's", 'i',
  "i'd", "i'll", "i'm", "i've", 'if', 'in', 'into', 'is', "isn't", 'it', "it's", 'its', 'itself', "let's",
  'me', 'more', 'most', "mustn't", 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', "shan't", 'she', "she'd", "she'll",
  "she's", 'should', "shouldn't", 'so', 'some', 'such', 'than', 'that', "that's", 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', "there's", 'these', 'they', "they'd", "they'll", "they're", "they've",
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', "wasn't", 'we', "we'd", "we'll",
  "we're", "we've", 'were', "weren't", 'what', "what's", 'when', "when's", 'where', "where's", 'which',
  'while', 'who', "who's", 'whom', 'why', "why's", 'with', "won't", 'would', "wouldn't", 'you', "you'd",
  "you'll", "you're", "you've", 'your', 'yours', 'yourself', 'yourselves', 'will', 'work', 'experience', 'team',
  'years', 'strong', 'including', 'using', 'build', 'across', 'ability', 'required', 'skills', 'responsibilities'
]);

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[/\\]/g, ' ')
    .replace(/[^\w\s+#.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const words = cleaned.split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
  const tokens: string[] = [...words];

  // Generate bigrams
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]} ${words[i + 1]}`);
  }

  // Generate trigrams
  for (let i = 0; i < words.length - 2; i++) {
    tokens.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }

  return tokens;
}

function normalizeSkillName(rawSkill: string): string {
  const trimmed = (rawSkill || '').trim().toLowerCase();
  if (!trimmed) return rawSkill;

  if (ALIAS_LOOKUP.has(trimmed)) {
    return ALIAS_LOOKUP.get(trimmed)!;
  }

  for (const skill of CANONICAL_SKILLS) {
    if (skill.canonical.toLowerCase() === trimmed) {
      return skill.canonical;
    }
    for (const alias of skill.aliases) {
      if (alias.toLowerCase() === trimmed) {
        return skill.canonical;
      }
    }
  }

  return rawSkill.trim();
}

function extractSkills(text: string, explicitSkills: string[] = []): string[] {
  const detected = new Set<string>();
  const textLower = (text || '').toLowerCase();

  for (const raw of explicitSkills) {
    const normalized = normalizeSkillName(raw);
    if (normalized) detected.add(normalized);
  }

  for (const skill of CANONICAL_SKILLS) {
    const canonRegex = new RegExp(`\\b${skill.canonical.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (canonRegex.test(textLower)) {
      detected.add(skill.canonical);
      continue;
    }

    for (const alias of skill.aliases) {
      const aliasRegex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (aliasRegex.test(textLower)) {
        detected.add(skill.canonical);
        break;
      }
    }
  }

  return Array.from(detected);
}

// Fast Linear TF-IDF Vector and Similarity computation
function matchResumeFast(resumeText: string, candidateSkills: string[], jobs: any[], targetRole?: string) {
  if (!jobs || jobs.length === 0 || (!resumeText && (!candidateSkills || candidateSkills.length === 0))) {
    return [];
  }

  const candExtracted = extractSkills(resumeText, candidateSkills);
  const candidateSkillsSet = new Set(candExtracted.map(s => s.toLowerCase()));
  const resumeTokens = tokenize(resumeText);

  // Pre-tokenize all jobs once and build Document Frequency (DF) map in O(N)
  const jobTokensList: string[][] = new Array(jobs.length);
  const df = new Map<string, number>();

  // Count resume tokens in DF
  const resumeUniqueTokens = new Set(resumeTokens);
  for (const t of resumeUniqueTokens) {
    df.set(t, 1);
  }

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const combinedJobText = [
      job.title,
      job.description,
      ...(job.skills || job.requiredSkills || []),
      ...(job.tags || []),
      ...(job.requirements || []),
      ...(job.responsibilities || [])
    ].join('\n');

    const jTokens = tokenize(combinedJobText);
    jobTokensList[i] = jTokens;

    const seenInJob = new Set(jTokens);
    for (const t of seenInJob) {
      df.set(t, (df.get(t) || 0) + 1);
    }
  }

  const totalDocs = jobs.length + 1; // jobs + resume

  // Compute resume TF-IDF vector once
  const tfResume = new Map<string, number>();
  for (const t of resumeTokens) {
    tfResume.set(t, (tfResume.get(t) || 0) + 1);
  }

  const vecResume = new Map<string, number>();
  let normResumeSq = 0;
  for (const [word, count] of tfResume.entries()) {
    const tfVal = count / resumeTokens.length;
    const dfVal = df.get(word) || 1;
    const idfVal = Math.log((totalDocs + 1) / (dfVal + 1)) + 1;
    const weight = tfVal * idfVal;
    vecResume.set(word, weight);
    normResumeSq += weight * weight;
  }
  const normResume = Math.sqrt(normResumeSq);

  const scoredJobs = jobs.map((job, idx) => {
    const jTokens = jobTokensList[idx];
    
    // 1. Text Similarity (Cosine TF-IDF)
    let similarity = 0;
    if (normResume > 0 && jTokens.length > 0) {
      const tfJob = new Map<string, number>();
      for (const t of jTokens) {
        tfJob.set(t, (tfJob.get(t) || 0) + 1);
      }

      let dotProduct = 0;
      let normJobSq = 0;

      for (const [word, count] of tfJob.entries()) {
        const tfVal = count / jTokens.length;
        const dfVal = df.get(word) || 1;
        const idfVal = Math.log((totalDocs + 1) / (dfVal + 1)) + 1;
        const weight = tfVal * idfVal;
        normJobSq += weight * weight;

        const weightResume = vecResume.get(word);
        if (weightResume !== undefined) {
          dotProduct += weightResume * weight;
        }
      }

      const normJob = Math.sqrt(normJobSq);
      if (normResume > 0 && normJob > 0) {
        similarity = Math.min(1.0, Math.max(0.0, dotProduct / (normResume * normJob)));
      }
    }

    const similarityScore = Math.round(similarity * 100);

    // 2. Skill Extraction & Overlap
    const jobExtractedSkills = extractSkills(
      [job.title, job.description, ...(job.skills || job.requiredSkills || []), ...(job.tags || [])].join('\n'),
      [...(job.skills || job.requiredSkills || []), ...(job.tags || [])]
    );

    const rawRequired = (job.skills && job.skills.length > 0)
      ? job.skills
      : (job.requiredSkills && job.requiredSkills.length > 0
        ? job.requiredSkills
        : (job.tags && job.tags.length > 0 ? job.tags : jobExtractedSkills.slice(0, 5)));

    const normalizedRequiredSkills = Array.from(new Set(rawRequired.map((r: string) => normalizeSkillName(r)))) as string[];

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    normalizedRequiredSkills.forEach(reqSkill => {
      const reqLower = reqSkill.toLowerCase();
      if (candidateSkillsSet.has(reqLower) || candExtracted.some(cs => cs.toLowerCase() === reqLower)) {
        matchedSkills.push(reqSkill);
      } else {
        const hasTextMatch = cleanText(resumeText).includes(cleanText(reqSkill));
        if (hasTextMatch) {
          matchedSkills.push(reqSkill);
        } else {
          missingSkills.push(reqSkill);
        }
      }
    });

    const totalRequired = normalizedRequiredSkills.length || 1;
    const requiredSkillCoverage = matchedSkills.length / totalRequired;

    const extraJobSkills = jobExtractedSkills.filter(s => !normalizedRequiredSkills.includes(s));
    let matchedPreferredCount = 0;
    const preferredSkills: string[] = [];

    extraJobSkills.forEach(ps => {
      if (candidateSkillsSet.has(ps.toLowerCase())) {
        matchedPreferredCount++;
        preferredSkills.push(ps);
      }
    });

    const preferredSkillCoverage = extraJobSkills.length > 0
      ? matchedPreferredCount / extraJobSkills.length
      : (matchedSkills.length > 0 ? 0.8 : 0.0);

    const skillMatchScore = Math.round((requiredSkillCoverage * 0.75 + preferredSkillCoverage * 0.25) * 100);

    const rawScore = Math.round(
      (0.45 * (similarity * 100)) +
      (0.40 * (requiredSkillCoverage * 100)) +
      (0.15 * (preferredSkillCoverage * 100))
    );

    let finalScore = Math.min(100, Math.max(0, rawScore));

    if (targetRole && targetRole.trim()) {
      const targetClean = cleanText(targetRole);
      const titleClean = cleanText(job.title);
      if (targetClean && titleClean && (titleClean.includes(targetClean) || targetClean.includes(titleClean))) {
        finalScore = Math.min(100, finalScore + 8);
      }
    }

    let confidence: 'Very High' | 'High' | 'Moderate' | 'Low' = 'Low';
    if (finalScore >= 85) confidence = 'Very High';
    else if (finalScore >= 70) confidence = 'High';
    else if (finalScore >= 45) confidence = 'Moderate';

    let whyMatch = '';
    if (matchedSkills.length > 0) {
      const topMatched = matchedSkills.slice(0, 4).join(', ');
      if (missingSkills.length === 0) {
        whyMatch = `Exceptional alignment with 100% coverage of core requirements: ${topMatched}.`;
      } else {
        whyMatch = `Strong technical alignment on ${topMatched}. Missing: ${missingSkills.slice(0, 2).join(', ')}.`;
      }
    } else {
      whyMatch = `Low keyword and technology overlap with your profile. Missing: ${normalizedRequiredSkills.slice(0, 3).join(', ')}.`;
    }

    return {
      id: job.id,
      companyId: job.company?.toLowerCase().replace(/\s+/g, '_') || 'company',
      title: job.title,
      company: job.company,
      companyLogo: job.company_logo || job.companyLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(job.company || 'Company')}`,
      location: job.location || 'India',
      matchScore: finalScore,
      matchConfidence: confidence,
      tags: job.tags || matchedSkills,
      salary: job.salary || 'Competitive',
      salaryRange: job.salary || 'Competitive',
      description: job.description,
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      benefits: job.benefits || ['Comprehensive Health Insurance', 'Annual Learning Stipend', 'Flexible Remote / Hybrid'],
      requiredSkills: normalizedRequiredSkills,
      matchedSkills: matchedSkills,
      missingSkills: missingSkills,
      experienceRequired: job.experience_required || job.experienceRequired || '2+ Years',
      jobType: job.employment_type || job.jobType || 'Full-Time',
      companyDescription: job.companyDescription || `${job.company} is hiring software professionals in India.`,
      postedDate: job.posted_at || job.postedDate || 'Recently',
      recommendationReason: whyMatch,
      applyUrl: job.url || job.applyUrl || '',
      applicationUrl: job.url || job.applyUrl || '',
      companyWebsite: job.company_website || job.companyWebsite || job.url || '',
      similarityScore: similarityScore,
      skillMatchScore: skillMatchScore,
      source: job.source || 'HireFlow Direct',
      industry: job.industry || ''
    };
  });

  const filtered = scoredJobs.filter(j => (j.matchedSkills && j.matchedSkills.length > 0) || j.matchScore >= 20);
  return filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

import { JobIngestionService } from '../server/jobIngestionService';
import { initDb } from '../src/db/postgres';

async function testFastMatching() {
  await initDb();
  const jobs = await JobIngestionService.getAvailableJobs();
  console.log(`Loaded ${jobs.length} jobs.`);

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
    
    TECHNICAL SKILLS
    Languages: TypeScript, JavaScript, Python, SQL, HTML/CSS, Go
    Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Redux, GraphQL
    Databases & Cloud: PostgreSQL, Redis, MySQL, AWS, Docker, Kubernetes, CI/CD, Git
    Architecture: REST APIs, Microservices, Distributed Systems, System Design, Web Security
  `;

  const skills = ['TypeScript', 'JavaScript', 'Python', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'];

  const t0 = performance.now();
  const results = matchResumeFast(sampleResume, skills, jobs, 'Full Stack Engineer');
  const t1 = performance.now();

  console.log(`\nFast matching took: ${(t1 - t0).toFixed(2)}ms for ${jobs.length} jobs!`);
  console.log(`Total matched results: ${results.length}`);
  console.log(`Top match: ${results[0]?.title} at ${results[0]?.company} (Score: ${results[0]?.matchScore}%, Skills: ${results[0]?.matchedSkills.join(', ')})`);
  console.log(`Second match: ${results[1]?.title} at ${results[1]?.company} (Score: ${results[1]?.matchScore}%, Skills: ${results[1]?.matchedSkills.join(', ')})`);
  process.exit(0);
}

testFastMatching();
