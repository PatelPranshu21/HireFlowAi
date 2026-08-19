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

export const initialJobRecommendations: JobRecommendation[] = [];

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

export const defaultResumeVersions: ResumeVersion[] = [];

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
