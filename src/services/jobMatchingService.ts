import { JobRecommendation, ScoreBreakdown, MatchLabel } from '../types';

export interface SkillDefinition {
  canonical: string;
  category: 'Languages' | 'Frameworks' | 'Databases' | 'Cloud & DevOps' | 'Architecture' | 'Tools & Methods';
  aliases: string[];
}

export interface RoleDomainDefinition {
  domain: string;
  keywords: string[];
  skills: string[];
}

// Comprehensive technology and skill canonical dictionary with aliases
export const CANONICAL_SKILLS: SkillDefinition[] = [
  // Languages
  { canonical: 'JavaScript', category: 'Languages', aliases: ['javascript', 'js', 'vanilla js', 'ecmascript', 'es6', 'es6+'] },
  { canonical: 'TypeScript', category: 'Languages', aliases: ['typescript', 'ts'] },
  { canonical: 'Python', category: 'Languages', aliases: ['python', 'python3', 'python 3', 'py'] },
  { canonical: 'Java', category: 'Languages', aliases: ['java', 'core java', 'j2se', 'java 8', 'java 11', 'java 17', 'java 21'] },
  { canonical: 'C++', category: 'Languages', aliases: ['c++', 'cpp', 'c plus plus'] },
  { canonical: 'C#', category: 'Languages', aliases: ['c#', 'csharp', 'c sharp', '.net', 'dotnet'] },
  { canonical: 'Go', category: 'Languages', aliases: ['go', 'golang'] },
  { canonical: 'Rust', category: 'Languages', aliases: ['rust', 'rustlang'] },
  { canonical: 'PHP', category: 'Languages', aliases: ['php', 'php7', 'php8'] },
  { canonical: 'Ruby', category: 'Languages', aliases: ['ruby', 'ruby on rails', 'rails'] },
  { canonical: 'Swift', category: 'Languages', aliases: ['swift', 'swiftui', 'ios'] },
  { canonical: 'Kotlin', category: 'Languages', aliases: ['kotlin', 'android'] },
  { canonical: 'SQL', category: 'Languages', aliases: ['sql', 'ansi sql', 't-sql', 'pl/sql'] },
  { canonical: 'HTML/CSS', category: 'Languages', aliases: ['html', 'html5', 'css', 'css3', 'scss', 'sass'] },

  // Frameworks & Libraries
  { canonical: 'React', category: 'Frameworks', aliases: ['react', 'reactjs', 'react.js', 'react native'] },
  { canonical: 'Next.js', category: 'Frameworks', aliases: ['nextjs', 'next.js', 'next'] },
  { canonical: 'Vue.js', category: 'Frameworks', aliases: ['vue', 'vuejs', 'vue.js', 'nuxt', 'nuxtjs'] },
  { canonical: 'Angular', category: 'Frameworks', aliases: ['angular', 'angularjs', 'angular.js', 'angular 2+'] },
  { canonical: 'Node.js', category: 'Frameworks', aliases: ['node', 'nodejs', 'node.js', 'express', 'express.js', 'nestjs', 'fastify'] },
  { canonical: 'Django', category: 'Frameworks', aliases: ['django', 'django rest framework', 'drf'] },
  { canonical: 'Flask', category: 'Frameworks', aliases: ['flask'] },
  { canonical: 'FastAPI', category: 'Frameworks', aliases: ['fastapi', 'fast api'] },
  { canonical: 'Spring Boot', category: 'Frameworks', aliases: ['spring boot', 'springboot', 'spring', 'spring framework', 'spring mvc'] },
  { canonical: 'Tailwind CSS', category: 'Frameworks', aliases: ['tailwind', 'tailwindcss', 'tailwind css'] },
  { canonical: 'Redux', category: 'Frameworks', aliases: ['redux', 'redux toolkit', 'rtk'] },
  { canonical: 'GraphQL', category: 'Frameworks', aliases: ['graphql', 'apollo', 'relay'] },
  { canonical: 'gRPC', category: 'Frameworks', aliases: ['grpc', 'protocol buffers', 'protobuf'] },
  { canonical: 'PyTorch', category: 'Frameworks', aliases: ['pytorch', 'torch'] },
  { canonical: 'TensorFlow', category: 'Frameworks', aliases: ['tensorflow', 'tf', 'keras'] },

  // Databases & Stores
  { canonical: 'PostgreSQL', category: 'Databases', aliases: ['postgresql', 'postgres', 'psql'] },
  { canonical: 'MySQL', category: 'Databases', aliases: ['mysql', 'mariadb'] },
  { canonical: 'MongoDB', category: 'Databases', aliases: ['mongodb', 'mongo', 'mongoose'] },
  { canonical: 'Redis', category: 'Databases', aliases: ['redis', 'redis cache'] },
  { canonical: 'Cassandra', category: 'Databases', aliases: ['cassandra', 'apache cassandra'] },
  { canonical: 'DynamoDB', category: 'Databases', aliases: ['dynamodb', 'dynamo db', 'aws dynamodb'] },
  { canonical: 'Elasticsearch', category: 'Databases', aliases: ['elasticsearch', 'elastic search', 'opensearch'] },
  { canonical: 'Oracle DB', category: 'Databases', aliases: ['oracle', 'oracle database', 'oracle db'] },
  { canonical: 'SQLite', category: 'Databases', aliases: ['sqlite', 'sqlite3'] },

  // Cloud & DevOps
  { canonical: 'AWS', category: 'Cloud & DevOps', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'ecs', 'eks', 'cloudformation', 'aurora'] },
  { canonical: 'GCP', category: 'Cloud & DevOps', aliases: ['gcp', 'google cloud', 'google cloud platform', 'gke', 'cloud run', 'bigquery'] },
  { canonical: 'Azure', category: 'Cloud & DevOps', aliases: ['azure', 'microsoft azure', 'azure devops', 'aks'] },
  { canonical: 'Docker', category: 'Cloud & DevOps', aliases: ['docker', 'container', 'containers', 'containerization'] },
  { canonical: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['kubernetes', 'k8s', 'helm'] },
  { canonical: 'Terraform', category: 'Cloud & DevOps', aliases: ['terraform', 'iac', 'infrastructure as code'] },
  { canonical: 'CI/CD', category: 'Cloud & DevOps', aliases: ['ci/cd', 'cicd', 'continuous integration', 'github actions', 'gitlab ci', 'jenkins', 'argo'] },
  { canonical: 'Linux', category: 'Cloud & DevOps', aliases: ['linux', 'unix', 'ubuntu', 'bash', 'shell scripting'] },

  // Architecture & Paradigms
  { canonical: 'REST APIs', category: 'Architecture', aliases: ['rest', 'rest api', 'rest apis', 'restful', 'restful api', 'api design', 'restful apis'] },
  { canonical: 'Microservices', category: 'Architecture', aliases: ['microservices', 'microservice', 'micro-services', 'soa'] },
  { canonical: 'Distributed Systems', category: 'Architecture', aliases: ['distributed systems', 'distributed computing', 'distributed architecture', 'high availability', 'fault tolerance', 'load balancing'] },
  { canonical: 'System Design', category: 'Architecture', aliases: ['system design', 'system architecture', 'software architecture', 'scalability', 'high throughput'] },
  { canonical: 'Kafka', category: 'Architecture', aliases: ['kafka', 'apache kafka', 'event streaming', 'pub/sub', 'message queue', 'rabbitmq'] },
  { canonical: 'WebSockets', category: 'Architecture', aliases: ['websockets', 'websocket', 'real-time', 'sse', 'server-sent events'] },
  { canonical: 'Accessibility', category: 'Architecture', aliases: ['accessibility', 'a11y', 'wcag', 'aria'] },
  { canonical: 'Web Security', category: 'Architecture', aliases: ['web security', 'security', 'oauth', 'jwt', 'cors', 'csp', 'xss', 'csrf', 'owasp'] },
  { canonical: 'Web Performance', category: 'Architecture', aliases: ['web performance', 'performance optimization', 'core web vitals', 'lighthouse', 'latency reduction'] },

  // Tools & Methodologies
  { canonical: 'Git', category: 'Tools & Methods', aliases: ['git', 'github', 'gitlab', 'bitbucket', 'version control'] },
  { canonical: 'Agile/Scrum', category: 'Tools & Methods', aliases: ['agile', 'scrum', 'kanban', 'jira', 'sprint planning'] },
  { canonical: 'Unit Testing', category: 'Tools & Methods', aliases: ['testing', 'unit testing', 'jest', 'vitest', 'pytest', 'junit', 'cypress', 'playwright', 'tdd'] }
];

// Technical role domains for alignment scoring
export const ROLE_DOMAINS: RoleDomainDefinition[] = [
  {
    domain: 'frontend',
    keywords: ['frontend', 'front end', 'front-end', 'ui', 'ux', 'web developer', 'react', 'vue', 'angular', 'next.js', 'client', 'javascript developer', 'typescript developer'],
    skills: ['React', 'Next.js', 'Vue.js', 'Angular', 'Tailwind CSS', 'Redux', 'HTML/CSS', 'JavaScript', 'TypeScript', 'Accessibility', 'Web Performance']
  },
  {
    domain: 'backend',
    keywords: ['backend', 'back end', 'back-end', 'api', 'server', 'node', 'nodejs', 'python', 'django', 'fastapi', 'flask', 'java', 'spring', 'spring boot', 'go', 'golang', 'c#', '.net', 'ruby', 'php', 'microservices', 'distributed systems'],
    skills: ['Node.js', 'Python', 'Django', 'FastAPI', 'Flask', 'Java', 'Spring Boot', 'Go', 'Rust', 'PHP', 'Ruby', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Kafka', 'REST APIs', 'gRPC', 'Distributed Systems']
  },
  {
    domain: 'fullstack',
    keywords: ['full stack', 'fullstack', 'full-stack', 'software engineer', 'software developer', 'application engineer', 'web engineer', 'full stack developer', 'full stack engineer'],
    skills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'Next.js', 'PostgreSQL', 'REST APIs', 'SQL']
  },
  {
    domain: 'devops',
    keywords: ['devops', 'sre', 'site reliability', 'infrastructure', 'cloud', 'platform engineer', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'systems engineer', 'devsecops'],
    skills: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'CI/CD', 'Linux']
  },
  {
    domain: 'data_ai',
    keywords: ['data engineer', 'data scientist', 'machine learning', 'ai engineer', 'ml engineer', 'nlp', 'deep learning', 'big data', 'analytics', 'ai/ml', 'data analytics'],
    skills: ['Python', 'PyTorch', 'TensorFlow', 'PostgreSQL', 'Cassandra', 'Elasticsearch', 'SQL']
  },
  {
    domain: 'mobile',
    keywords: ['mobile developer', 'mobile engineer', 'ios', 'android', 'flutter', 'react native', 'swift', 'kotlin'],
    skills: ['Swift', 'Kotlin', 'React']
  },
  {
    domain: 'qa',
    keywords: ['qa', 'test', 'sdet', 'quality assurance', 'test engineer', 'automation engineer', 'qa engineer'],
    skills: ['Unit Testing', 'CI/CD', 'Git']
  },
  {
    domain: 'security',
    keywords: ['security engineer', 'cyber security', 'infosec', 'appsec', 'penetration tester', 'application security'],
    skills: ['Web Security', 'Linux']
  }
];

// Build alias lookup map: lowercase alias -> canonical name
const ALIAS_LOOKUP = new Map<string, string>();
for (const skill of CANONICAL_SKILLS) {
  ALIAS_LOOKUP.set(skill.canonical.toLowerCase(), skill.canonical);
  for (const alias of skill.aliases) {
    ALIAS_LOOKUP.set(alias.toLowerCase(), skill.canonical);
  }
}

// Standard English stop words to filter out for TF-IDF
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'will', 'work', 'experience', 'team',
  'years', 'strong', 'including', 'using', 'build', 'across', 'ability', 'required', 'skills', 'responsibilities'
]);

export interface MatchScoreResult {
  matchScore: number;
  similarityScore: number;
  skillMatchScore: number;
  requiredSkillScore: number | null;
  roleAlignmentScore: number;
  additionalScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  preferredSkills: string[];
  candidateSkills: string[];
  jobRequiredSkills: string[];
  confidence: 'Very High' | 'High' | 'Moderate' | 'Low';
  matchLabel: MatchLabel;
  whyMatch: string;
  requiredSkillsAvailable: boolean;
  scoreBreakdown: ScoreBreakdown;
}

export class JobMatchingService {
  /**
   * Normalizes raw text: lowercases, cleans control chars, preserves special tech tokens
   */
  public static cleanText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/[/\\]/g, ' ')
      .replace(/[^\w\s+#.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tokenizes text into cleaned non-stop unigrams, bigrams, and trigrams
   */
  public static tokenize(text: string): string[] {
    const cleaned = this.cleanText(text);
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

  /**
   * Normalizes a raw skill string or alias into its canonical form
   */
  public static normalizeSkillName(rawSkill: string): string {
    const trimmed = (rawSkill || '').trim().toLowerCase();
    if (!trimmed) return rawSkill;

    if (ALIAS_LOOKUP.has(trimmed)) {
      return ALIAS_LOOKUP.get(trimmed)!;
    }

    // Direct match against canonical names
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

    // Return capitalized fallback if not in dictionary
    return rawSkill.trim();
  }

  /**
   * Extracts canonical skills from raw text and explicit skill list
   */
  public static extractSkills(text: string, explicitSkills: string[] = []): string[] {
    const detected = new Set<string>();
    const textLower = (text || '').toLowerCase();

    // 1. Check explicit skills provided
    for (const raw of explicitSkills) {
      const normalized = this.normalizeSkillName(raw);
      if (normalized) detected.add(normalized);
    }

    // 2. Scan text against canonical dictionary & aliases
    for (const skill of CANONICAL_SKILLS) {
      // Check canonical name
      const canonRegex = new RegExp(`\\b${skill.canonical.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (canonRegex.test(textLower)) {
        detected.add(skill.canonical);
        continue;
      }

      // Check all aliases
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

  /**
   * Builds TF-IDF vectors for two documents and calculates Cosine Similarity efficiently.
   * If an optional corpus is provided, computes Document Frequency (DF) in a single linear pass.
   */
  public static calculateTfIdfCosineSimilarity(docA: string, docB: string, corpus: string[] = []): number {
    const tokensA = this.tokenize(docA);
    const tokensB = this.tokenize(docB);

    if (tokensA.length === 0 || tokensB.length === 0) return 0;

    // Document Frequency map
    const df = new Map<string, number>();

    const totalDocs = corpus.length > 0 ? corpus.length + 2 : 2;

    const setA = new Set(tokensA);
    const setB = new Set(tokensB);

    for (const t of setA) df.set(t, (df.get(t) || 0) + 1);
    for (const t of setB) df.set(t, (df.get(t) || 0) + 1);

    if (corpus.length > 0) {
      for (const doc of corpus) {
        const cTokens = this.tokenize(doc);
        const seen = new Set(cTokens);
        for (const t of seen) {
          df.set(t, (df.get(t) || 0) + 1);
        }
      }
    }

    const tfA = new Map<string, number>();
    for (const t of tokensA) tfA.set(t, (tfA.get(t) || 0) + 1);

    const tfB = new Map<string, number>();
    for (const t of tokensB) tfB.set(t, (tfB.get(t) || 0) + 1);

    let dotProduct = 0;
    let normASq = 0;
    let normBSq = 0;

    for (const [word, count] of tfA.entries()) {
      const tfVal = count / tokensA.length;
      const dfVal = df.get(word) || 1;
      const idfVal = Math.log((totalDocs + 1) / (dfVal + 1)) + 1;
      const weight = tfVal * idfVal;
      normASq += weight * weight;

      if (tfB.has(word)) {
        const tfValB = tfB.get(word)! / tokensB.length;
        const weightB = tfValB * idfVal;
        dotProduct += weight * weightB;
      }
    }

    for (const [word, count] of tfB.entries()) {
      const tfVal = count / tokensB.length;
      const dfVal = df.get(word) || 1;
      const idfVal = Math.log((totalDocs + 1) / (dfVal + 1)) + 1;
      const weight = tfVal * idfVal;
      normBSq += weight * weight;
    }

    if (normASq === 0 || normBSq === 0) return 0;

    const similarity = dotProduct / (Math.sqrt(normASq) * Math.sqrt(normBSq));
    return Math.min(1.0, Math.max(0.0, similarity));
  }

  /**
   * Deterministic Role / Title Alignment (15% weight in overall match):
   * Compares candidate's target role, profile skills, and resume against job title and domain.
   *
   * Examples:
   * - Full Stack Developer <-> Full Stack Engineer = ~95%
   * - React Developer <-> Frontend Engineer = ~95%
   * - Python/Django Developer <-> Backend Engineer = ~95%
   * - React Developer <-> DevOps Engineer = ~25%
   */
  public static calculateRoleAlignment(
    candidateTargetRole?: string,
    candidateSkills: string[] = [],
    resumeText: string = '',
    jobTitle: string = '',
    jobDescription: string = ''
  ): number {
    const cleanTitle = this.cleanText(jobTitle);
    const cleanTarget = this.cleanText(candidateTargetRole || '');
    const cleanResume = this.cleanText(resumeText);
    const candSkillsLower = new Set(candidateSkills.map(s => s.toLowerCase()));

    // Direct / Substring exact equivalence
    if (cleanTarget && cleanTitle) {
      if (cleanTarget === cleanTitle) return 100;
      if (cleanTarget.includes(cleanTitle) || cleanTitle.includes(cleanTarget)) return 95;
    }

    const candDomains = new Set<string>();
    const jobDomains = new Set<string>();

    for (const d of ROLE_DOMAINS) {
      // Target role matching
      if (cleanTarget && d.keywords.some(k => cleanTarget.includes(k))) {
        candDomains.add(d.domain);
      }
      // Job title matching
      if (cleanTitle && d.keywords.some(k => cleanTitle.includes(k))) {
        jobDomains.add(d.domain);
      }
      // Candidate skills matching domain
      const skillOverlap = d.skills.filter(s => candSkillsLower.has(s.toLowerCase())).length;
      if (skillOverlap >= 2 || (skillOverlap >= 1 && d.skills.length <= 4)) {
        candDomains.add(d.domain);
      }
    }

    // Infer candidate domain from resume text if not set
    if (candDomains.size === 0 && cleanResume) {
      for (const d of ROLE_DOMAINS) {
        if (d.keywords.some(k => cleanResume.includes(k))) {
          candDomains.add(d.domain);
        }
      }
    }

    // Infer job domain from description if not detected from title
    if (jobDomains.size === 0 && jobDescription) {
      const cleanDesc = this.cleanText(jobDescription);
      for (const d of ROLE_DOMAINS) {
        if (d.keywords.some(k => cleanDesc.includes(k))) {
          jobDomains.add(d.domain);
        }
      }
    }

    let domainScore = 60; // Base neutral score for generic tech positions

    if (candDomains.size > 0 && jobDomains.size > 0) {
      const common = Array.from(candDomains).filter(d => jobDomains.has(d));
      if (common.length > 0) {
        domainScore = 95;
      } else if (
        (candDomains.has('frontend') && jobDomains.has('fullstack')) ||
        (candDomains.has('backend') && jobDomains.has('fullstack')) ||
        (candDomains.has('fullstack') && (jobDomains.has('frontend') || jobDomains.has('backend')))
      ) {
        domainScore = 85;
      } else if (
        (candDomains.has('backend') && jobDomains.has('devops')) ||
        (candDomains.has('devops') && jobDomains.has('backend')) ||
        (candDomains.has('data_ai') && jobDomains.has('backend')) ||
        (candDomains.has('backend') && jobDomains.has('data_ai')) ||
        (candDomains.has('mobile') && jobDomains.has('frontend'))
      ) {
        domainScore = 70;
      } else if (
        (candDomains.has('frontend') && (jobDomains.has('devops') || jobDomains.has('data_ai') || jobDomains.has('security'))) ||
        (candDomains.has('devops') && jobDomains.has('frontend'))
      ) {
        domainScore = 25; // Cross-domain mismatch
      } else {
        domainScore = 40;
      }
    } else if (cleanTarget && cleanTitle) {
      const targetTokens = cleanTarget.split(' ').filter(t => t.length > 2);
      const titleTokens = cleanTitle.split(' ').filter(t => t.length > 2);
      const commonTokens = targetTokens.filter(t => titleTokens.includes(t));
      if (commonTokens.length > 0) {
        domainScore = Math.min(90, 60 + commonTokens.length * 15);
      }
    }

    // Seniority alignment bonus / penalty
    const seniorKeywords = ['senior', 'lead', 'principal', 'staff', 'architect', 'head', 'director'];
    const juniorKeywords = ['junior', 'entry', 'intern', 'associate', 'graduate'];

    const isJobSenior = seniorKeywords.some(k => cleanTitle.includes(k));
    const isJobJunior = juniorKeywords.some(k => cleanTitle.includes(k));

    const isCandSenior = seniorKeywords.some(k => cleanTarget.includes(k) || cleanResume.includes(k));
    const isCandJunior = juniorKeywords.some(k => cleanTarget.includes(k));

    if (isJobSenior && isCandSenior) {
      domainScore = Math.min(100, domainScore + 5);
    } else if (isJobJunior && isCandJunior) {
      domainScore = Math.min(100, domainScore + 5);
    } else if (isJobSenior && isCandJunior) {
      domainScore = Math.max(20, domainScore - 15);
    }

    return Math.min(100, Math.max(0, domainScore));
  }

  /**
   * Additional Signals Score (5% weight):
   * Incorporates employment type, location/remote compatibility, experience alignment, and bonus skills.
   */
  public static calculateAdditionalSignals(
    job: {
      experience_required?: string;
      experienceRequired?: string;
      employment_type?: string;
      jobType?: string;
      location?: string;
      tags?: string[];
      description?: string;
    },
    candidateSkills: string[] = [],
    resumeText: string = '',
    matchedPreferredCount: number = 0,
    totalPreferredCount: number = 0
  ): number {
    let score = 80; // Baseline reliable score

    // Preferred / bonus skills contribution
    if (totalPreferredCount > 0) {
      const prefRatio = matchedPreferredCount / totalPreferredCount;
      score = Math.round(score * 0.5 + prefRatio * 100 * 0.5);
    }

    // Employment type
    const empType = (job.employment_type || job.jobType || '').toLowerCase();
    if (empType.includes('full') || empType.includes('permanent')) {
      score = Math.min(100, score + 5);
    }

    // Location / Remote match
    const loc = (job.location || '').toLowerCase();
    const cleanResume = this.cleanText(resumeText);
    if (loc.includes('remote') || loc.includes('hybrid')) {
      score = Math.min(100, score + 5);
    } else if (loc && cleanResume && cleanResume.includes(this.cleanText(loc))) {
      score = Math.min(100, score + 5);
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Deterministic matching engine between a Candidate Resume and a Single Job Posting
   */
  public static calculateJobMatch(
    resumeText: string,
    candidateExplicitSkills: string[],
    job: {
      id: string;
      title: string;
      company?: string;
      description?: string;
      requiredSkills?: string[];
      skills?: string[];
      tags?: string[];
      responsibilities?: string[];
      requirements?: string[];
      employment_type?: string;
      jobType?: string;
      location?: string;
      experience_required?: string;
      experienceRequired?: string;
    },
    corpusDescriptions: string[] = [],
    targetRole?: string
  ): MatchScoreResult {
    // 1. Extract candidate skills
    const candidateSkills = this.extractSkills(resumeText, candidateExplicitSkills);
    const candidateSkillsSet = new Set(candidateSkills.map(s => s.toLowerCase()));

    // 2. Extract job skills
    const combinedJobText = [
      job.title,
      job.description,
      ...(job.skills || job.requiredSkills || []),
      ...(job.tags || []),
      ...(job.requirements || []),
      ...(job.responsibilities || [])
    ].join('\n');

    const jobExtractedSkills = this.extractSkills(combinedJobText, [
      ...(job.skills || job.requiredSkills || []),
      ...(job.tags || [])
    ]);

    // Canonicalize job required skills
    const rawRequired = (job.skills && job.skills.length > 0)
      ? job.skills
      : (job.requiredSkills && job.requiredSkills.length > 0
        ? job.requiredSkills
        : (job.tags && job.tags.length > 0 ? job.tags : []));

    const normalizedRequiredSkills = Array.from(new Set(rawRequired.map(r => this.normalizeSkillName(r)))) as string[];
    const totalRequired = normalizedRequiredSkills.length;
    const requiredSkillsAvailable = totalRequired > 0;

    // 3. Compute skill overlap
    const matchedSkills: string[] = [];
    const missingSkills: string[] | null = requiredSkillsAvailable ? [] : null;

    if (requiredSkillsAvailable && missingSkills) {
      normalizedRequiredSkills.forEach(reqSkill => {
        const reqLower = reqSkill.toLowerCase();
        if (candidateSkillsSet.has(reqLower) || candidateSkills.some(cs => cs.toLowerCase() === reqLower)) {
          matchedSkills.push(reqSkill);
        } else {
          const hasTextMatch = this.cleanText(resumeText).includes(this.cleanText(reqSkill));
          if (hasTextMatch) {
            matchedSkills.push(reqSkill);
          } else {
            missingSkills.push(reqSkill);
          }
        }
      });
    }

    // 4. Calculate component scores
    // Signal 1: Required Skills Coverage (70% weight)
    const requiredSkillScore = requiredSkillsAvailable
      ? (matchedSkills.length / totalRequired) * 100
      : null;

    // Preferred skills
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

    const skillMatchScore = requiredSkillsAvailable
      ? Math.round(requiredSkillScore!)
      : Math.round(preferredSkillCoverage * 100);

    // Signal 2: Role / Title Alignment (15% weight)
    const roleAlignmentScore = this.calculateRoleAlignment(
      targetRole,
      candidateSkills,
      resumeText,
      job.title,
      job.description
    );

    // Signal 3: Text Similarity (10% weight)
    const similarity = this.calculateTfIdfCosineSimilarity(resumeText, combinedJobText, corpusDescriptions);
    const similarityScore = Math.min(100, Math.max(0, Math.round(similarity * 100)));

    // Signal 4: Additional Signals (5% weight)
    const additionalScore = this.calculateAdditionalSignals(
      job,
      candidateSkills,
      resumeText,
      matchedPreferredCount,
      extraJobSkills.length
    );

    // 5. Deterministic Final Scoring Formula
    let finalScore: number;
    if (requiredSkillsAvailable && totalRequired > 0) {
      const rawScore =
        (requiredSkillScore! * 0.70) +
        (roleAlignmentScore * 0.15) +
        (similarityScore * 0.10) +
        (additionalScore * 0.05);
      finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));
    } else {
      // Fallback for missing/unavailable required skills:
      // Weight distributed over roleAlignment (50%), textSimilarity (33.3%), additional (16.7%)
      const rawScore =
        (roleAlignmentScore * 0.50) +
        (similarityScore * 0.3333) +
        (additionalScore * 0.1667);
      finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));
    }

    // 6. Match Confidence & Labels (Section 7)
    let matchLabel: MatchLabel;
    let confidence: 'Very High' | 'High' | 'Moderate' | 'Low';

    if (finalScore >= 85) {
      matchLabel = 'Exceptional Match';
      confidence = 'Very High';
    } else if (finalScore >= 70) {
      matchLabel = 'Strong Match';
      confidence = 'High';
    } else if (finalScore >= 55) {
      matchLabel = 'Moderate Match';
      confidence = 'Moderate';
    } else if (finalScore >= 40) {
      matchLabel = 'Low Match';
      confidence = 'Low';
    } else {
      matchLabel = 'Weak Match';
      confidence = 'Low';
    }

    // 7. Score Breakdown Object
    const scoreBreakdown: ScoreBreakdown = {
      requiredSkills: requiredSkillsAvailable ? Math.round(requiredSkillScore!) : null,
      roleAlignment: roleAlignmentScore,
      textSimilarity: similarityScore,
      additionalSignals: additionalScore,
      overallMatch: finalScore,
      requiredSkillsAvailable
    };

    // 8. Honest Score-Aware Explanation Generation
    const whyMatch = JobMatchingService.generateScoreAwareWhyMatch(
      finalScore,
      matchedSkills,
      missingSkills,
      normalizedRequiredSkills,
      requiredSkillsAvailable,
      roleAlignmentScore
    );

    return {
      matchScore: finalScore,
      similarityScore,
      skillMatchScore,
      requiredSkillScore: requiredSkillsAvailable ? Math.round(requiredSkillScore!) : null,
      roleAlignmentScore,
      additionalScore,
      matchedSkills,
      missingSkills,
      preferredSkills,
      candidateSkills,
      jobRequiredSkills: normalizedRequiredSkills,
      confidence,
      matchLabel,
      whyMatch,
      requiredSkillsAvailable,
      scoreBreakdown
    };
  }

  /**
   * Helper to generate honest, score-aware explanation text
   */
  public static generateScoreAwareWhyMatch(
    matchScore: number,
    matchedSkills: string[],
    missingSkills: string[] | null,
    normalizedRequiredSkills: string[],
    requiredSkillsAvailable: boolean = true,
    roleAlignmentScore: number = 75
  ): string {
    const topMatched = (matchedSkills || []).slice(0, 4).join(', ');
    const safeMissing = missingSkills || [];
    const topMissing = safeMissing.slice(0, 3).join(', ');

    if (!requiredSkillsAvailable || normalizedRequiredSkills.length === 0) {
      if (matchScore >= 75) {
        return `Strong alignment (${matchScore}%). Role and profile align with this position (specific skill requirements not detailed by employer).`;
      } else if (matchScore >= 55) {
        return `Moderate alignment (${matchScore}%). Profile aligns with general role focus (detailed skill requirements unavailable).`;
      }
      return `Low alignment (${matchScore}%). Profile has limited overlap with this role description.`;
    }

    if (matchScore >= 85) {
      if (missingSkills.length === 0) {
        return `Exceptional match (${matchScore}%). 100% required skill coverage (${topMatched}) with strong role alignment.`;
      }
      return `Exceptional match (${matchScore}%). High alignment on ${topMatched}. Gaps: ${topMissing}.`;
    }

    if (matchScore >= 70) {
      if (missingSkills.length === 0) {
        return `Strong match (${matchScore}%). 100% required skill coverage (${topMatched}) with solid technical alignment.`;
      }
      return `Strong match (${matchScore}%). Core alignment on ${topMatched}. Missing: ${topMissing}.`;
    }

    if (matchScore >= 55) {
      if (missingSkills.length === 0) {
        return `Moderate match (${matchScore}%). All listed core skills matched (${topMatched}), with moderate overall role alignment.`;
      }
      return `Moderate match (${matchScore}%). Partial skill alignment on ${topMatched}. Missing: ${topMissing}.`;
    }

    if (matchScore >= 40) {
      if (missingSkills.length === 0 && matchedSkills.length > 0) {
        return `Low match (${matchScore}%). Core skill (${topMatched}) matched, but overall role profile has low similarity.`;
      }
      return `Low match (${matchScore}%). Limited overlap with role requirements. Missing: ${topMissing || normalizedRequiredSkills.slice(0, 3).join(', ')}.`;
    }

    // matchScore < 40
    return `Weak match (${matchScore}%). Significant skill and profile gaps for this position. Missing: ${topMissing || normalizedRequiredSkills.slice(0, 3).join(', ')}.`;
  }

  /**
   * Matches candidate resume against a full list of available jobs in O(N) linear time.
   * Pre-tokenizes corpus and resume once, avoiding quadratic loops.
   */
  public static matchResumeAgainstJobs(
    resumeText: string,
    candidateSkills: string[],
    jobs: any[],
    targetRole?: string
  ): JobRecommendation[] {
    if (!jobs || jobs.length === 0 || (!resumeText && (!candidateSkills || candidateSkills.length === 0))) {
      return [];
    }

    const candExtracted = this.extractSkills(resumeText, candidateSkills);
    const candidateSkillsSet = new Set(candExtracted.map(s => s.toLowerCase()));
    const resumeTokens = this.tokenize(resumeText);

    // 1. Pre-tokenize all jobs and construct DF map in a single pass O(N)
    const jobTokensList: string[][] = new Array(jobs.length);
    const df = new Map<string, number>();

    const resumeUnique = new Set(resumeTokens);
    for (const t of resumeUnique) {
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

      const jTokens = this.tokenize(combinedJobText);
      jobTokensList[i] = jTokens;

      const seen = new Set(jTokens);
      for (const t of seen) {
        df.set(t, (df.get(t) || 0) + 1);
      }
    }

    const totalDocs = jobs.length + 1;

    // 2. Pre-calculate resume TF-IDF vector & norm
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

    // 3. Score each job in a single fast pass
    const scoredJobs = jobs.map((job, idx) => {
      const jTokens = jobTokensList[idx];

      // TF-IDF Cosine Similarity
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

      const similarityScore = Math.min(100, Math.max(0, Math.round(similarity * 100)));

      // Skill Extraction & Overlap
      const jobExtractedSkills = this.extractSkills(
        [job.title, job.description, ...(job.skills || job.requiredSkills || []), ...(job.tags || [])].join('\n'),
        [...(job.skills || job.requiredSkills || []), ...(job.tags || [])]
      );

      const rawRequired = (job.skills && job.skills.length > 0)
        ? job.skills
        : (job.requiredSkills && job.requiredSkills.length > 0
          ? job.requiredSkills
          : (job.tags && job.tags.length > 0 ? job.tags : jobExtractedSkills.slice(0, 5)));

      const normalizedRequiredSkills = Array.from(new Set(rawRequired.map((r: string) => this.normalizeSkillName(r)))) as string[];
      const totalRequired = normalizedRequiredSkills.length;
      const requiredSkillsAvailable = totalRequired > 0;

      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      if (requiredSkillsAvailable) {
        normalizedRequiredSkills.forEach(reqSkill => {
          const reqLower = reqSkill.toLowerCase();
          if (candidateSkillsSet.has(reqLower) || candExtracted.some(cs => cs.toLowerCase() === reqLower)) {
            matchedSkills.push(reqSkill);
          } else {
            const hasTextMatch = this.cleanText(resumeText).includes(this.cleanText(reqSkill));
            if (hasTextMatch) {
              matchedSkills.push(reqSkill);
            } else {
              missingSkills.push(reqSkill);
            }
          }
        });
      }

      // Signal 1: Required Skills Coverage (70% weight)
      const requiredSkillScore = requiredSkillsAvailable
        ? (matchedSkills.length / totalRequired) * 100
        : null;

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

      const skillMatchScore = requiredSkillsAvailable
        ? Math.round(requiredSkillScore!)
        : Math.round(preferredSkillCoverage * 100);

      // Signal 2: Role / Title Alignment (15% weight)
      const roleAlignmentScore = this.calculateRoleAlignment(
        targetRole,
        candExtracted,
        resumeText,
        job.title,
        job.description
      );

      // Signal 3: Text Similarity (10% weight) - similarityScore is already computed above

      // Signal 4: Additional Signals (5% weight)
      const additionalScore = this.calculateAdditionalSignals(
        job,
        candExtracted,
        resumeText,
        matchedPreferredCount,
        extraJobSkills.length
      );

      // 5. Final Deterministic Scoring Formula
      let finalScore: number;
      if (requiredSkillsAvailable && totalRequired > 0) {
        const rawScore =
          (requiredSkillScore! * 0.70) +
          (roleAlignmentScore * 0.15) +
          (similarityScore * 0.10) +
          (additionalScore * 0.05);
        finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));
      } else {
        // Fallback for missing/unavailable required skills:
        // Weight distributed over roleAlignment (50%), textSimilarity (33.3%), additional (16.7%)
        const rawScore =
          (roleAlignmentScore * 0.50) +
          (similarityScore * 0.3333) +
          (additionalScore * 0.1667);
        finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));
      }

      // 6. Match Confidence & Labels (Section 7)
      let matchLabel: MatchLabel;
      let confidence: 'Very High' | 'High' | 'Moderate' | 'Low';

      if (finalScore >= 85) {
        matchLabel = 'Exceptional Match';
        confidence = 'Very High';
      } else if (finalScore >= 70) {
        matchLabel = 'Strong Match';
        confidence = 'High';
      } else if (finalScore >= 55) {
        matchLabel = 'Moderate Match';
        confidence = 'Moderate';
      } else if (finalScore >= 40) {
        matchLabel = 'Low Match';
        confidence = 'Low';
      } else {
        matchLabel = 'Weak Match';
        confidence = 'Low';
      }

      // 7. Score Breakdown Object
      const scoreBreakdown: ScoreBreakdown = {
        requiredSkills: requiredSkillsAvailable ? Math.round(requiredSkillScore!) : null,
        roleAlignment: roleAlignmentScore,
        textSimilarity: similarityScore,
        additionalSignals: additionalScore,
        overallMatch: finalScore,
        requiredSkillsAvailable
      };

      const whyMatch = JobMatchingService.generateScoreAwareWhyMatch(
        finalScore,
        matchedSkills,
        missingSkills,
        normalizedRequiredSkills,
        requiredSkillsAvailable,
        roleAlignmentScore
      );

      return {
        id: job.id,
        companyId: job.company?.toLowerCase().replace(/\s+/g, '_') || 'company',
        title: job.title,
        company: job.company,
        companyLogo: job.company_logo || job.companyLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(job.company || 'Company')}`,
        location: job.location || 'India',
        matchScore: finalScore,
        matchConfidence: confidence,
        matchLabel: matchLabel,
        match_label: matchLabel,
        tags: job.tags || matchedSkills,
        salary: job.salary || 'Competitive',
        salaryRange: job.salary || 'Competitive',
        description: job.description,
        responsibilities: job.responsibilities || [],
        requirements: job.requirements || [],
        benefits: job.benefits || ['Comprehensive Health Insurance', 'Annual Learning Stipend', 'Flexible Remote / Hybrid'],
        requiredSkills: normalizedRequiredSkills,
        required_skills: normalizedRequiredSkills,
        matchedSkills: matchedSkills,
        matched_skills: matchedSkills,
        missingSkills: missingSkills,
        missing_skills: missingSkills,
        preferredSkills: preferredSkills,
        preferred_skills: preferredSkills,
        experienceRequired: job.experience_required || job.experienceRequired || '2+ Years',
        jobType: job.employment_type || job.jobType || 'Full-Time',
        companyDescription: job.companyDescription || `${job.company} is hiring software professionals in India.`,
        postedDate: job.posted_at || job.postedDate || 'Recently',
        recommendationReason: whyMatch,
        whyMatch: whyMatch,
        why_match: whyMatch,
        applyUrl: job.url || job.applyUrl || '',
        applicationUrl: job.url || job.applyUrl || '',
        companyWebsite: job.company_website || job.companyWebsite || job.url || '',
        similarityScore: similarityScore,
        similarity_score: similarityScore,
        skillMatchScore: skillMatchScore,
        skill_match_score: skillMatchScore,
        requiredSkillScore: requiredSkillsAvailable ? Math.round(requiredSkillScore!) : null,
        required_skill_score: requiredSkillsAvailable ? Math.round(requiredSkillScore!) : null,
        roleAlignmentScore: roleAlignmentScore,
        role_alignment_score: roleAlignmentScore,
        additionalScore: additionalScore,
        additional_score: additionalScore,
        scoreBreakdown: scoreBreakdown,
        score_breakdown: scoreBreakdown,
        requiredSkillsAvailable: requiredSkillsAvailable,
        required_skills_available: requiredSkillsAvailable,
        source: job.source || 'HireFlow Direct',
        industry: job.industry || ''
      } as JobRecommendation & { similarityScore: number; skillMatchScore: number; matchedSkills: string[]; preferredSkills: string[]; whyMatch: string };
    });

    // Filter out jobs that have 0 matched skills AND matchScore < 20%
    const filtered = scoredJobs.filter(j => (j.matchedSkills && j.matchedSkills.length > 0) || j.matchScore >= 20);

    return filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }
}
