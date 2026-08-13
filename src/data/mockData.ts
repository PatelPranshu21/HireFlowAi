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
  targetRole: '',
  formattingScore: 0,
  keywords: [],
  impactPoints: [],
  grammarIssues: [],
  categoryScores: [],
  sectionAnalyses: [],
  aiSuggestions: []
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
