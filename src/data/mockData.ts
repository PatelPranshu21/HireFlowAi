import { 
  UserProfile, 
  TaskItem, 
  JobRecommendation, 
  ActivityLog, 
  ResumeAnalysisResult, 
  ResumeVersion, 
  ApplicationCard, 
  InterviewQuestion,
  NotificationItem
} from '../types';
import { mockJobsList } from './jobProvider';

// Calculate 3-day trial expiry date relative to now
const now = new Date();
const trialStart = new Date();
const trialExpiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Exactly 3 days from now

export const initialUserProfile: UserProfile = {
  id: 'usr_guest',
  name: 'Candidate',
  email: 'candidate@hireflow.ai',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  title: 'Software Engineer',
  experienceLevel: 'Mid Level',
  timezone: 'America/Los_Angeles (Pacific Time)',
  linkedInUrl: '',
  gitHubUrl: '',
  portfolioUrl: '',
  education: [],
  experience: [],
  tier: '3-Day Free Trial',
  subscriptionPlan: '3-Day Free Trial',
  subscriptionStatus: 'trialing',
  trialStartDate: trialStart.toISOString(),
  trialExpiryDate: trialExpiry.toISOString(),
  nextBillingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  hasSelectedPlan: true,
  transactionHistory: [],
  skills: [],
  technologies: [],
  projects: [],
  certifications: [],
  languages: ['English'],
  targetRole: 'Software Engineer',
  preferences: {
    preferredRoles: ['Software Engineer'],
    preferredCompanies: [],
    preferredCities: ['Remote'],
    remotePreference: 'Remote',
    expectedSalaryMin: 120000,
    expectedSalaryMax: 180000,
    experienceLevel: 'Mid Level',
    preferredTechnologies: ['React', 'TypeScript'],
    preferredIndustries: ['Technology']
  },
  learningRoadmap: [],
  learningProgress: [],
  skillsLearned: [],
  coursesCompleted: [],
  certificationsEarned: [],
  atsScore: 0,
  resumeVersions: [],
  resumeHistory: [],
  interviewMetrics: {
    mockScoreOverall: 0,
    technicalScore: 0,
    behavioralScore: 0,
    systemDesignScore: 0,
    strongTopics: [],
    weakTopics: [],
    completedSessionsCount: 0,
    solvedCodingCount: 0
  },
  savedJobIds: [],
  appliedJobIds: [],
  hiddenJobIds: [],
  rejectedJobIds: [],
  analytics: {
    employabilityScore: 0,
    careerReadinessScore: 0,
    aiMatchScore: 0,
    strengths: [],
    weaknesses: [],
    priorityImprovements: []
  },
  usageLimits: {
    resumeScans: { used: 0, max: 3 },
    atsAnalyses: { used: 0, max: 3 },
    aiInterviews: { used: 0, max: 5 },
    coverLetterGenerations: { used: 0, max: 3 },
    jobMatchAnalyses: { used: 0, max: 5 }
  }
};

export const initialTasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Upload your master resume',
    tag: 'Getting Started',
    tagColor: '#3b82f6',
    completed: false
  },
  {
    id: 't2',
    title: 'Set target job title and location',
    tag: 'Preferences',
    tagColor: '#8b5cf6',
    completed: false
  },
  {
    id: 't3',
    title: 'Run your first ATS resume audit',
    tag: 'Resume Suite',
    tagColor: '#06b6d4',
    completed: false
  }
];

export const initialJobRecommendations: JobRecommendation[] = mockJobsList;

export const initialActivityLogs: ActivityLog[] = [];

export const sampleNotifications: NotificationItem[] = [];

export const defaultResumeAnalysis: ResumeAnalysisResult = {
  overallScore: 0,
  summary: 'Upload your resume to analyse your ATS compatibility. Get instant machine-readability audit and keyword optimizations.',
  targetRole: 'Software Engineer',
  formattingScore: 0,
  keywords: [
    {
      id: 'kw_1',
      type: 'high',
      title: 'Missing Core Skill: "Distributed Systems Architecture"',
      impactTag: 'High Impact',
      description: '90% of Senior level roles you target require experience with distributed architectures. You have related experience in your Apple role that is not explicitly named.',
      suggestionTitle: 'AI Suggestion',
      suggestionText: 'Update bullet 2 under Apple to: "Architected and deployed highly available distributed systems handling 10k+ requests/sec using Kafka and Redis."',
      originalBullet: 'Built backend services for streaming media processing.',
      suggestedBullet: 'Architected and deployed highly available distributed systems handling 10k+ requests/sec using Kafka and Redis.'
    },
    {
      id: 'kw_2',
      type: 'medium',
      title: 'Expand on "Cloud Infrastructure"',
      description: '"Cloud Infrastructure" is too generic. ATS systems look for specific providers and tools like Terraform and Kubernetes.',
      suggestionTitle: 'AI Suggestion',
      suggestionText: 'Specify: "AWS (EC2, S3, EKS)" and mention IaC tools like Terraform.',
      originalBullet: 'Managed cloud infrastructure deployment and maintenance.',
      suggestedBullet: 'Engineered multi-region AWS cloud infrastructure (EC2, S3, RDS, EKS) using Terraform and automated CI/CD pipelines.'
    },
    {
      id: 'kw_3',
      type: 'success',
      title: 'Include "React.js & TypeScript"',
      description: 'You successfully mention React.js and TypeScript multiple times in relevant high-impact contexts.',
      suggestionTitle: 'Verified',
      suggestionText: 'Found 6 occurrences under key experience & project descriptions.'
    }
  ],
  impactPoints: [
    'Add quantifiable metrics ($ revenue, % speedup, # requests/sec) to 3 work history bullets.',
    'Lead bullet points with active verbs like "Architected", "Engineered", "Optimized".',
    'Include team size and leadership scope (e.g., "Led team of 6 engineers").'
  ],
  grammarIssues: [
    'Ensure uniform past tense verbs for previous employment roles at TechCorp.'
  ],
  categoryScores: [
    { category: 'Formatting', score: 92, explanation: 'Clean single-column structure, standard fonts, parsable section headers.', tip: 'Keep font sizes between 10pt and 12pt.' },
    { category: 'Keywords', score: 82, explanation: 'High density for React/Node/AWS; missing distributed systems & Kubernetes.', tip: 'Add Docker, Kubernetes, and gRPC keywords.' },
    { category: 'Skills', score: 88, explanation: 'Well organized into Languages, Frameworks, and Cloud Infrastructure.', tip: 'Group skills by proficiency or category.' },
    { category: 'Projects', score: 85, explanation: 'Clear project titles and tech stacks included.', tip: 'Add live URLs or GitHub repository links.' },
    { category: 'Experience', score: 86, explanation: 'Strong tech companies with concise achievements.', tip: 'Add dollar values or percentage growth figures.' },
    { category: 'Education', score: 95, explanation: 'Top university degree with graduation year clearly stated.', tip: 'No changes needed.' },
    { category: 'Readability', score: 90, explanation: 'Bullet points are 1-2 lines long; good white space balance.', tip: 'Maintain bullet length under 25 words.' },
    { category: 'Grammar', score: 96, explanation: 'No spelling errors; minor tense consistency suggestion.', tip: 'Use past tense for former roles.' },
    { category: 'Structure', score: 89, explanation: 'Logical flow: Summary -> Experience -> Projects -> Skills -> Education.', tip: 'Perfect section order.' },
    { category: 'Impact', score: 78, explanation: 'Good achievements, but needs more quantifiable metric proof.', tip: 'Include 2+ percentages or throughput metrics per role.' }
  ],
  sectionAnalyses: [
    {
      id: 'sa_1',
      sectionName: 'Professional Summary',
      strengths: ['Clearly states 7+ years of senior experience', 'Mentions key tech stack (React, Node, AWS)'],
      weaknesses: ['Lacks target leadership focus', 'Does not mention distributed scale'],
      suggestions: ['Include team lead experience and scale of microservices managed.'],
      recommendedChanges: ['Change to: "High-impact Senior Software Engineer with 7+ years architecting cloud microservices and leading frontend initiatives driving 35%+ performance improvements."'],
      priority: 'High',
      estimatedAtsGain: 6
    },
    {
      id: 'sa_2',
      sectionName: 'Work Experience',
      strengths: ['Prominent tech companies (Apple, TechCorp)', 'Clear timeline and promotion history'],
      weaknesses: ['First bullet at Apple lacks metrics', 'Generic cloud deployment phrase'],
      suggestions: ['Replace generic "built backend services" with specific throughput numbers.', 'Specify Terraform and EKS for cloud.'],
      recommendedChanges: ['Quantify Apple bullet 1 to 10k+ req/sec using Kafka & Redis.'],
      priority: 'High',
      estimatedAtsGain: 8
    },
    {
      id: 'sa_3',
      sectionName: 'Projects',
      strengths: ['Relevant distributed event broker project', 'Includes modern tech stack tags (Go, Kafka, Docker)'],
      weaknesses: ['Missing live demo link', 'Lacks user traction or benchmark numbers'],
      suggestions: ['Mention latency benchmark (e.g. sub-5ms processing).'],
      recommendedChanges: ['Add benchmark data: "Achieved sub-5ms event delivery latency across 1M daily messages."'],
      priority: 'Medium',
      estimatedAtsGain: 4
    },
    {
      id: 'sa_4',
      sectionName: 'Skills & Tools',
      strengths: ['Categorized cleanly', 'High overlap with Senior roles'],
      weaknesses: ['Missing Kubernetes and GraphQL', 'Missing CI/CD pipelines tag'],
      suggestions: ['Add Docker, Kubernetes, GraphQL, CI/CD, Terraform.'],
      recommendedChanges: ['Append Kubernetes and GraphQL to Tools section.'],
      priority: 'High',
      estimatedAtsGain: 5
    }
  ],
  aiSuggestions: [
    {
      id: 'sug_1',
      title: 'Quantify Backend Throughput',
      section: 'bullets',
      currentVersion: 'Built backend services for streaming media processing.',
      improvedVersion: 'Architected and deployed highly available distributed streaming services handling 10,000+ requests/sec using Kafka and Redis.',
      reason: 'Increases ATS keyword match for "Distributed Systems" and adds measurable technical impact.',
      expectedAtsIncrease: 8,
      status: 'pending'
    },
    {
      id: 'sug_2',
      title: 'Enhance Cloud Infrastructure Details',
      section: 'experience',
      currentVersion: 'Managed cloud infrastructure deployment and maintenance.',
      improvedVersion: 'Engineered multi-region AWS cloud infrastructure (EC2, S3, RDS, EKS) using Terraform and automated CI/CD pipelines.',
      reason: 'Adds specific cloud services (AWS, EKS, Terraform) required by 85% of target job posts.',
      expectedAtsIncrease: 6,
      status: 'pending'
    },
    {
      id: 'sug_3',
      title: 'Elevate Professional Summary',
      section: 'summary',
      currentVersion: 'Passionate Senior Engineer with 7+ years of experience building scalable web applications and cloud microservices.',
      improvedVersion: 'Results-driven Senior Software Engineer with 7+ years of experience architecting distributed microservices, leading cross-functional teams, and accelerating web application performance by 35% for 200k+ active daily users.',
      reason: 'Creates a commanding first impression with clear scale metrics and leadership keywords.',
      expectedAtsIncrease: 5,
      status: 'pending'
    },
    {
      id: 'sug_4',
      title: 'Strengthen Technical Skills Section',
      section: 'skills',
      currentVersion: 'Tools: Docker, AWS, Git, Kafka, Redis',
      improvedVersion: 'Cloud & Infrastructure: AWS (EC2, S3, EKS, CloudFront), Terraform, Docker, Kubernetes, CI/CD (GitHub Actions), Kafka, Redis',
      reason: 'Increases searchability for DevOps and Kubernetes keywords in automated recruiter screens.',
      expectedAtsIncrease: 4,
      status: 'pending'
    }
  ],
  keywordList: [
    { keyword: 'React.js', category: 'framework', importance: 'High', detected: true, count: 4 },
    { keyword: 'TypeScript', category: 'technical', importance: 'High', detected: true, count: 5 },
    { keyword: 'Node.js', category: 'framework', importance: 'High', detected: true, count: 3 },
    { keyword: 'AWS', category: 'technical', importance: 'High', detected: true, count: 2 },
    { keyword: 'Distributed Systems', category: 'industry', importance: 'High', detected: false, count: 0 },
    { keyword: 'Kubernetes', category: 'technical', importance: 'High', detected: false, count: 0 },
    { keyword: 'Docker', category: 'technical', importance: 'Medium', detected: true, count: 1 },
    { keyword: 'Kafka', category: 'technical', importance: 'Medium', detected: true, count: 1 },
    { keyword: 'Redis', category: 'technical', importance: 'Medium', detected: true, count: 1 },
    { keyword: 'GraphQL', category: 'framework', importance: 'Recommended', detected: false, count: 0 },
    { keyword: 'Microservices', category: 'industry', importance: 'High', detected: true, count: 1 },
    { keyword: 'CI/CD Pipelines', category: 'technical', importance: 'Medium', detected: false, count: 0 },
    { keyword: 'Technical Leadership', category: 'soft', importance: 'Medium', detected: true, count: 1 },
    { keyword: 'Cross-functional Collaboration', category: 'soft', importance: 'Recommended', detected: true, count: 1 }
  ]
};

export const defaultResumeVersions: ResumeVersion[] = [
  {
    id: 'v2',
    versionName: 'Software Engineer - Master',
    fileName: 'master_resume_v2.pdf',
    uploadedAt: 'Today, 2:45 PM',
    fileSize: '184 KB',
    score: 85,
    template: 'modern',
    jobsMatchedCount: 18,
    isTailored: false,
    targetRole: 'Senior Software Engineer',
    parsedData: {
      fullName: 'Parnshu Patel',
      email: 'pranshupatel3222@gmail.com',
      phone: '+1 (555) 234-5678',
      linkedIn: 'https://linkedin.com/in/alex-dev',
      gitHub: 'https://github.com/alex-dev-lead',
      portfolio: 'https://alexmorgan.dev',
      summary: 'Passionate Senior Engineer with 7+ years of experience building scalable web applications, microservices, and cloud infrastructure.',
      education: [
        { id: 'edu_1', degree: 'B.S. in Computer Science', institution: 'Stanford University', year: '2018', gpa: '3.9 / 4.0' }
      ],
      experience: [
        {
          id: 'exp_1',
          company: 'Apple',
          role: 'Senior Software Engineer',
          period: '2021 - Present',
          location: 'Cupertino, CA',
          bullets: [
            'Built backend services for streaming media processing.',
            'Led frontend migration to Next.js and TypeScript, reducing load time by 35%.',
            'Managed cloud infrastructure deployment and maintenance.'
          ]
        },
        {
          id: 'exp_2',
          company: 'TechCorp Inc.',
          role: 'Full Stack Developer',
          period: '2018 - 2021',
          location: 'San Francisco, CA',
          bullets: [
            'Developed React dashboards for real-time analytics serving 250k daily active users.',
            'Implemented RESTful APIs and PostgreSQL database schemas.'
          ]
        }
      ],
      projects: [
        {
          id: 'proj_1',
          name: 'CloudScale Event Broker',
          description: 'High-throughput event streaming engine handling real-time data sync.',
          technologies: ['Go', 'Kafka', 'Docker', 'Kubernetes']
        }
      ],
      skills: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Go', 'React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Docker', 'AWS', 'Git', 'Kafka', 'Redis'],
      certifications: ['AWS Certified Solutions Architect', 'Certified Kubernetes Application Developer'],
      languages: ['English (Native)', 'Spanish (Professional)'],
      achievements: ['Co-author of 2 cloud optimization technical papers', 'Winner of Apple Annual Innovation Hackathon 2022']
    },
    content: `ALEX MORGAN
Senior Software Engineer | San Francisco, CA | alex.dev@hireflow.ai

SUMMARY
Passionate Senior Engineer with 7+ years of experience building scalable web applications and cloud microservices.

EXPERIENCE
Apple - Senior Software Engineer (2021 - Present)
• Built backend services for streaming media processing.
• Led frontend migration to Next.js and TypeScript, reducing load time by 35%.
• Managed cloud infrastructure deployment and maintenance.

TechCorp Inc. - Full Stack Developer (2018 - 2021)
• Developed React dashboards for real-time analytics serving 250k daily active users.
• Implemented RESTful APIs and PostgreSQL database schemas.

SKILLS
Languages: TypeScript, JavaScript, Python, SQL, Go
Frameworks: React, Next.js, Node.js, Express, Tailwind CSS
Tools: Docker, AWS, Git, Kafka, Redis`
  },
  {
    id: 'v_tailored_1',
    versionName: 'Tailored: Frontend Engineer at Stripe',
    fileName: 'alex_resume_stripe_frontend.pdf',
    uploadedAt: 'Yesterday, 4:15 PM',
    fileSize: '192 KB',
    score: 89,
    template: 'executive',
    jobsMatchedCount: 12,
    isTailored: true,
    targetRole: 'Senior Frontend Engineer',
    targetCompany: 'Stripe',
    parsedData: {
      fullName: 'Alex Morgan',
      email: 'alex.dev@hireflow.ai',
      phone: '+1 (555) 234-5678',
      linkedIn: 'https://linkedin.com/in/alex-dev',
      gitHub: 'https://github.com/alex-dev-lead',
      portfolio: 'https://alexmorgan.dev',
      summary: 'Senior Frontend Architect with 7+ years driving design system engineering, React performance optimization, and high-conversion payment flow UI.',
      education: [
        { id: 'edu_1', degree: 'B.S. in Computer Science', institution: 'Stanford University', year: '2018', gpa: '3.9 / 4.0' }
      ],
      experience: [
        {
          id: 'exp_1',
          company: 'Apple',
          role: 'Senior Frontend Lead',
          period: '2021 - Present',
          location: 'Cupertino, CA',
          bullets: [
            'Spearheaded web architecture migration to React 19 and Next.js, slashing bundle sizes by 42%.',
            'Designed accessible UI component design system adopted by 120+ internal engineers.',
            'Optimized Web Vitals score to 99+ across Apple services checkout portals.'
          ]
        }
      ],
      projects: [
        {
          id: 'proj_1',
          name: 'Stripe-Like Component Library',
          description: 'High-performance React UI design system built with Tailwind and Framer Motion.',
          technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite']
        }
      ],
      skills: ['TypeScript', 'React.js', 'Next.js', 'Tailwind CSS', 'Design Systems', 'Web Vitals', 'GraphQL', 'Vite', 'Jest', 'Cypress'],
      certifications: ['AWS Certified Developer'],
      languages: ['English', 'Spanish'],
      achievements: ['Speaker at React Summit 2024']
    },
    content: `ALEX MORGAN - TAILORED STRIPE FRONTEND
Senior Frontend Engineer | San Francisco, CA | alex.dev@hireflow.ai

SUMMARY
Senior Frontend Architect with 7+ years driving design system engineering, React performance optimization, and high-conversion payment flow UI.

EXPERIENCE
Apple - Senior Frontend Lead (2021 - Present)
• Spearheaded web architecture migration to React 19 and Next.js, slashing bundle sizes by 42%.
• Designed accessible UI component design system adopted by 120+ internal engineers.
• Optimized Web Vitals score to 99+ across Apple services checkout portals.`
  },
  {
    id: 'v1',
    versionName: 'alex_resume_v1.pdf',
    fileName: 'alex_resume_v1.pdf',
    uploadedAt: '3 days ago',
    fileSize: '142 KB',
    score: 65,
    template: 'minimalist',
    jobsMatchedCount: 8,
    isTailored: false,
    targetRole: 'Full Stack Developer',
    content: `Alex Dev Resume v1
Software Developer with experience in web apps.`
  }
];

export const initialApplications: ApplicationCard[] = [];

export const sampleInterviewQuestions: InterviewQuestion[] = [
  {
    id: 'iq_1',
    role: 'Senior Software Engineer',
    company: 'Google',
    type: 'Technical',
    question: 'How would you design a rate limiter service handling 1,000,000 requests/sec with minimal latency?',
    hint: 'Consider token bucket vs sliding window counter using Redis memory clusters.',
    modelAnswer: 'A distributed sliding window counter or token bucket algorithm using Redis cluster with lua scripts guarantees atomic updates, low memory footprint, and sub-millisecond response latency.'
  },
  {
    id: 'iq_2',
    role: 'Senior Software Engineer',
    company: 'Meta',
    type: 'Behavioral',
    question: 'Tell me about a time you had a significant architectural disagreement with a Tech Lead. How did you resolve it?',
    hint: 'Use the STAR method (Situation, Task, Action, Result) with data-backed benchmarks.',
    modelAnswer: 'I conducted an objective A/B benchmarking proof of concept comparing GraphQL vs REST payload sizes, presented data on latency and team velocity, and aligned on a hybrid micro-frontend solution.'
  },
  {
    id: 'iq_3',
    role: 'Full Stack Engineer',
    company: 'OpenAI',
    type: 'System Design',
    question: 'Design a real-time collaborative document editor like Google Docs.',
    hint: 'Focus on Operational Transformation (OT) or Conflict-free Replicated Data Types (CRDTs) over WebSockets.',
    modelAnswer: 'Use Yjs or Automerge CRDTs over WebSocket channels with a distributed pub/sub broker like Redis or NATS, persisting document delta snapshots in PostgreSQL.'
  }
];
