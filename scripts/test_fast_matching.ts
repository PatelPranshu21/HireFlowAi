import dotenv from 'dotenv';
dotenv.config();

import { JobMatchingService, CANONICAL_SKILLS, SkillDefinition } from '../src/services/jobMatchingService';

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


export function fastMatchResumeAgainstJobs(
  resumeText: string,
  candidateSkills: string[],
  jobs: any[],
  targetRole?: string
): any[] {
  return JobMatchingService.matchResumeAgainstJobs(resumeText, candidateSkills, jobs, targetRole);
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
  const results = JobMatchingService.matchResumeAgainstJobs(sampleResume, skills, jobs, 'Full Stack Engineer');
  const t1 = performance.now();

  console.log(`\nFast matching took: ${(t1 - t0).toFixed(2)}ms for ${jobs.length} jobs!`);
  console.log(`Total matched results: ${results.length}`);
  console.log(`Top match: ${results[0]?.title} at ${results[0]?.company} (Score: ${results[0]?.matchScore}%, Skills: ${results[0]?.matchedSkills.join(', ')})`);
  console.log(`Second match: ${results[1]?.title} at ${results[1]?.company} (Score: ${results[1]?.matchScore}%, Skills: ${results[1]?.matchedSkills.join(', ')})`);
  process.exit(0);
}

testFastMatching();
