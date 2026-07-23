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

export const initialUserProfile: UserProfile = {
  id: 'usr_123',
  name: 'Alex',
  email: 'alex.dev@hireflow.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  title: 'Senior Software Engineer',
  experienceLevel: 'Senior Level (6+ yrs)',
  tier: 'Gold Tier',
  atsScore: 85,
  linkedInUrl: 'https://linkedin.com/in/alex-dev',
  targetRole: 'Senior Software Engineer / Tech Lead'
};

export const initialTasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Improve Resume Skills',
    tag: 'AI Suggestion',
    tagColor: '#4cd7f6',
    completed: false
  },
  {
    id: 't2',
    title: 'Complete Mock Interview',
    tag: 'Prep for Google',
    tagColor: '#8d90a2',
    completed: false
  },
  {
    id: 't3',
    title: 'Update LinkedIn URL',
    tag: 'Profile',
    tagColor: '#b7c4ff',
    completed: true
  }
];

export const initialJobRecommendations: JobRecommendation[] = [
  {
    id: 'job_1',
    title: 'Software Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    matchScore: 94,
    tags: ['Python', 'React', 'Distributed Systems'],
    salary: '$180k - $240k',
    description: 'Build high-scale infrastructure and developer tools powering frontier AI models.'
  },
  {
    id: 'job_2',
    title: 'Senior Frontend Dev',
    company: 'Vercel',
    location: 'Remote',
    matchScore: 88,
    tags: ['Next.js', 'TypeScript', 'Tailwind'],
    salary: '$160k - $210k',
    description: 'Architect world-class web rendering engines and deployment user experiences.'
  },
  {
    id: 'job_3',
    title: 'Full Stack Engineer',
    company: 'Stripe',
    location: 'Seattle, WA',
    matchScore: 85,
    tags: ['Ruby', 'React', 'Payments'],
    salary: '$175k - $225k',
    description: 'Design robust financial APIs and seamless enterprise merchant onboarding flows.'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'act_1',
    title: 'Resume "Tech_v2" Analyzed',
    subtitle: 'Score improved by 12 points • 2h ago',
    timestamp: '2h ago',
    type: 'analysis'
  },
  {
    id: 'act_2',
    title: 'Applied: Frontend Engineer at Stripe',
    subtitle: 'Via Job Board • 1d ago',
    timestamp: '1d ago',
    type: 'application'
  },
  {
    id: 'act_3',
    title: 'New Job Match Alert',
    subtitle: '3 highly relevant roles found • 2d ago',
    timestamp: '2d ago',
    type: 'alert'
  }
];

export const defaultResumeAnalysis: ResumeAnalysisResult = {
  overallScore: 74,
  summary: 'Your resume is decent, but missing critical keywords for Senior engineering roles.',
  targetRole: 'Senior Software Engineer',
  formattingScore: 88,
  keywords: [
    {
      id: 'kw_1',
      type: 'high',
      title: 'Missing Core Skill: "Distributed Systems"',
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
      description: '"Cloud Infrastructure" is too generic. ATS systems look for specific providers and tools.',
      suggestionTitle: 'AI Suggestion',
      suggestionText: 'Specify: "AWS (EC2, S3, RDS)" or "GCP" and mention IaC tools like Terraform.',
      originalBullet: 'Managed cloud infrastructure deployment and maintenance.',
      suggestedBullet: 'Engineered multi-region AWS cloud infrastructure (EC2, S3, RDS, EKS) using Terraform and automated CI/CD pipelines.'
    },
    {
      id: 'kw_3',
      type: 'success',
      title: 'Include "React.js"',
      description: 'You successfully mention React.js multiple times in relevant contexts.',
      suggestionTitle: 'Verified',
      suggestionText: 'Found 4 occurrences under key project descriptions.'
    }
  ],
  impactPoints: [
    'Add quantifiable metrics ($ revenue, % speedup, # requests/sec) to 3 work history bullets.',
    'Lead bullet points with active verbs like "Architected", "Engineered", "Optimized".'
  ],
  grammarIssues: [
    'Inconsistent capitalization of "TypeScript" and "JavaScript" in Skills section.'
  ]
};

export const defaultResumeVersions: ResumeVersion[] = [
  {
    id: 'v2',
    versionName: 'alex_resume_v2.pdf',
    fileName: 'alex_resume_v2.pdf',
    uploadedAt: 'Today, 2:45 PM',
    score: 74,
    content: `ALEX R. DEV
Senior Software Engineer | San Francisco, CA | alex@hireflow.ai

SUMMARY
Passionate Senior Engineer with 7+ years of experience building scalable web applications and cloud microservices.

EXPERIENCE
Apple - Senior Software Engineer (2021 - Present)
• Built backend services for streaming media processing.
• Led frontend migration to Next.js and TypeScript, reducing load time by 35%.
• Managed cloud infrastructure deployment and maintenance.

TechCorp Inc. - Full Stack Developer (2018 - 2021)
• Developed React dashboards for real-time analytics.
• Implemented RESTful APIs and PostgreSQL database schemas.

SKILLS
Languages: TypeScript, JavaScript, Python, SQL, Go
Frameworks: React, Next.js, Node.js, Express, Tailwind CSS
Tools: Docker, AWS, Git, Kafka, Redis`
  },
  {
    id: 'v1',
    versionName: 'alex_resume_v1.pdf',
    fileName: 'alex_resume_v1.pdf',
    uploadedAt: '3 days ago',
    score: 62,
    content: `Alex Dev Resume v1
Software Developer with experience in web apps.`
  }
];

export const initialApplications: ApplicationCard[] = [
  {
    id: 'app_1',
    jobTitle: 'Frontend Engineer',
    company: 'TechFlow Inc.',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100',
    status: 'applied',
    locationType: 'Remote',
    timeAgo: '2d ago',
    jobDescription: 'Seeking a Senior Frontend Engineer proficient in React, TypeScript, and state management.'
  },
  {
    id: 'app_2',
    jobTitle: 'UX Designer',
    company: 'Synergy Corp',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100',
    status: 'applied',
    locationType: 'Hybrid',
    priority: true,
    timeAgo: '5d ago',
    jobDescription: 'Looking for a product-minded UX Designer to lead core product design systems.'
  },
  {
    id: 'app_3',
    jobTitle: 'Product Manager',
    company: 'EcoTech Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100',
    status: 'assessment',
    locationType: 'Remote',
    badgeText: 'Take-home',
    dueDate: 'Due in 2d',
    aiAnalyzed: true,
    jobDescription: 'Lead green technology software product strategy and roadmap.'
  },
  {
    id: 'app_4',
    jobTitle: 'Senior Designer',
    company: 'CreativeMinds',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100',
    status: 'interview',
    locationType: 'Remote',
    badgeText: 'Round 2',
    interviewTime: 'Tomorrow, 2 PM',
    jobDescription: 'Drive creative strategy and design system architecture across web and mobile.'
  },
  {
    id: 'app_5',
    jobTitle: 'Data Analyst',
    company: 'FinCorp',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100',
    status: 'rejected',
    locationType: 'On-site',
    timeAgo: 'Archived'
  }
];

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

export const sampleNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Interview Tomorrow!',
    message: 'Senior Designer round 2 at CreativeMinds is scheduled for tomorrow at 2:00 PM.',
    time: '1 hour ago',
    read: false,
    type: 'alert'
  },
  {
    id: 'n2',
    title: 'ATS Resume Score Updated',
    message: 'Your resume "alex_resume_v2.pdf" achieved an overall ATS score of 85/100.',
    time: '2 hours ago',
    read: false,
    type: 'success'
  },
  {
    id: 'n3',
    title: 'New High-Match Job Alert',
    message: 'OpenAI posted "Software Engineer" with 94% match for your profile.',
    time: '1 day ago',
    read: true,
    type: 'info'
  }
];
