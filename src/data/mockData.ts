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
const trialStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
const trialExpiry = new Date(trialStart.getTime() + 3 * 24 * 60 * 60 * 1000); // 2 days from now

export const initialUserProfile: UserProfile = {
  id: 'usr_123',
  name: 'Alex Morgan',
  email: 'alex.dev@hireflow.ai',
  phone: '+1 (555) 234-5678',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  title: 'Senior Software Engineer',
  experienceLevel: 'Senior Level (6+ yrs)',
  linkedInUrl: 'https://linkedin.com/in/alex-dev',
  gitHubUrl: 'https://github.com/alex-dev-lead',
  portfolioUrl: 'https://alexmorgan.dev',
  education: [
    { id: 'edu_1', degree: 'B.S. in Computer Science', institution: 'Stanford University', year: '2018', gpa: '3.9/4.0' }
  ],
  experience: [
    {
      id: 'exp_1',
      company: 'Apple',
      role: 'Senior Software Engineer',
      period: '2021 - Present',
      location: 'Cupertino, CA',
      bullets: [
        'Architected distributed cloud services handling high-throughput streaming with Kafka & Redis.',
        'Led frontend migration to Next.js and TypeScript, improving web vitals by 35%.',
        'Automated multi-region AWS deployments via Terraform and GitHub Actions.'
      ]
    },
    {
      id: 'exp_2',
      company: 'TechCorp Inc.',
      role: 'Full Stack Developer',
      period: '2018 - 2021',
      location: 'San Francisco, CA',
      bullets: [
        'Engineered real-time telemetry analytics serving 250k daily active users.',
        'Designed high-performance PostgreSQL database schemas and GraphQL APIs.'
      ]
    }
  ],
  tier: '3-Day Free Trial',
  subscriptionPlan: '3-Day Free Trial',
  subscriptionStatus: 'trialing',
  trialStartDate: trialStart.toISOString(),
  trialExpiryDate: trialExpiry.toISOString(),
  nextBillingDate: '2026-07-28',
  hasSelectedPlan: true,
  transactionHistory: [
    {
      id: 'tx_101',
      invoiceNumber: 'INV-2026-0701',
      date: '2026-07-24',
      amount: 0.00,
      planName: '3-Day Free Trial',
      status: 'Paid',
      paymentMethod: 'Test Card (Visa •••• 4242)'
    }
  ],
  skills: [
    'React', 'TypeScript', 'Node.js', 'Go', 'Python', 'AWS', 'Docker',
    'PostgreSQL', 'GraphQL', 'Kafka', 'Redis', 'System Architecture'
  ],
  technologies: [
    'React 19', 'Next.js', 'Tailwind CSS', 'Node.js/Express', 'PostgreSQL',
    'Docker', 'AWS ECS/EKS', 'Kafka', 'Redis', 'Vite', 'Git'
  ],
  projects: [
    {
      id: 'proj_1',
      name: 'HireFlow Event Broker',
      description: 'Distributed event processing system built with Go and WebSockets for low-latency notifications.',
      technologies: ['Go', 'Kafka', 'Docker', 'Kubernetes']
    }
  ],
  certifications: [
    'AWS Certified Solutions Architect',
    'CKA (Certified Kubernetes Administrator)'
  ],
  languages: ['English (Native)', 'Spanish (Professional)'],
  targetRole: 'Senior Software Engineer / Tech Lead',
  preferences: {
    preferredRoles: ['Senior Software Engineer', 'Staff Engineer', 'Engineering Manager'],
    preferredCompanies: ['Apple', 'Stripe', 'Google', 'Meta', 'Linear', 'Vercel'],
    preferredCities: ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX'],
    remotePreference: 'Remote',
    expectedSalaryMin: 160000,
    expectedSalaryMax: 220000,
    experienceLevel: 'Senior',
    preferredTechnologies: ['TypeScript', 'React', 'Node.js', 'Go', 'AWS', 'Docker'],
    preferredIndustries: ['AI & ML', 'Fintech', 'Developer Tools', 'SaaS']
  },
  learningRoadmap: [
    {
      id: 'roadmap_1',
      stageName: 'Current Expertise: Senior Frontend & Node Backend',
      targetRole: 'Senior Full Stack Engineer',
      timeline: 'Now',
      status: 'current',
      requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'REST APIs'],
      completedSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'REST APIs'],
      recommendedProjects: ['Production Real-Time Web Application'],
      recommendedCertifications: ['AWS Cloud Practitioner']
    },
    {
      id: 'roadmap_2',
      stageName: 'Next Milestone: Distributed Systems & Microservices Orchestration',
      targetRole: 'Staff / Principal Engineer',
      timeline: '1-3 Months',
      status: 'next',
      requiredSkills: ['Docker', 'Kubernetes', 'Kafka', 'System Design', 'gRPC'],
      completedSkills: ['Docker', 'Kafka'],
      recommendedProjects: ['Distributed Queue & Stream Processing System'],
      recommendedCertifications: ['AWS Certified Solutions Architect']
    },
    {
      id: 'roadmap_3',
      stageName: 'Long Term: Engineering Leadership & System Architecture',
      targetRole: 'Software Architect / Tech Lead',
      timeline: '6+ Months',
      status: 'future',
      requiredSkills: ['Enterprise Architecture', 'Team Mentorship', 'Budgeting', 'Multi-Region Failover'],
      completedSkills: ['Team Mentorship'],
      recommendedProjects: ['Multi-Tenant Global Platform Blueprint'],
      recommendedCertifications: ['CKA Certified Kubernetes Administrator']
    }
  ],
  learningProgress: [
    {
      id: 'lp_1',
      title: 'Docker & Microservices Fundamentals',
      category: 'DevOps & Containers',
      type: 'course',
      status: 'in_progress',
      progressPercent: 65,
      estimatedHours: 8,
      unlockedSalaryIncrease: 12000,
      unlockedMatchScoreIncrease: 8
    },
    {
      id: 'lp_2',
      title: 'Advanced System Design & Scalability',
      category: 'Architecture',
      type: 'skill_module',
      status: 'in_progress',
      progressPercent: 40,
      estimatedHours: 12,
      unlockedSalaryIncrease: 18000,
      unlockedMatchScoreIncrease: 10
    },
    {
      id: 'lp_3',
      title: 'AWS Certified Solutions Architect Exam Prep',
      category: 'Cloud',
      type: 'certification',
      status: 'completed',
      progressPercent: 100,
      estimatedHours: 25,
      unlockedSalaryIncrease: 15000,
      unlockedMatchScoreIncrease: 12
    }
  ],
  skillsLearned: ['React 19', 'TypeScript', 'Node.js', 'AWS', 'Kafka', 'Redis'],
  coursesCompleted: ['Mastering Modern React & State Management', 'AWS Cloud Architect Blueprint'],
  certificationsEarned: ['AWS Certified Solutions Architect'],
  atsScore: 88,
  resumeVersions: [
    {
      id: 'ver_1',
      versionName: 'Master_Senior_Engineer.pdf',
      fileName: 'Master_Senior_Engineer.pdf',
      uploadedAt: 'Yesterday at 4:15 PM',
      score: 88,
      content: 'Alex Morgan - Senior Software Engineer. 7+ years building distributed cloud platforms, React, TypeScript, Node.js, and AWS.',
      fileSize: '1.2 MB'
    }
  ],
  resumeHistory: [
    {
      id: 'hist_1',
      fileName: 'Master_Senior_Engineer.pdf',
      uploadDate: 'Yesterday at 4:15 PM',
      fileSize: '1.2 MB',
      versionName: 'Master Senior Engineer v1.2',
      parsingStatus: 'Parsed ✓',
      fileType: 'PDF'
    }
  ],
  interviewMetrics: {
    mockScoreOverall: 86,
    technicalScore: 88,
    behavioralScore: 92,
    systemDesignScore: 78,
    strongTopics: ['React State Management', 'STAR Behavioral Methodology', 'REST API Design'],
    weakTopics: ['Distributed Caching Eviction Policies', 'Database Sharding & Partitioning'],
    completedSessionsCount: 5,
    solvedCodingCount: 14
  },
  savedJobIds: ['job_1', 'job_3'],
  appliedJobIds: ['job_1', 'job_2'],
  hiddenJobIds: [],
  rejectedJobIds: [],
  analytics: {
    employabilityScore: 88,
    careerReadinessScore: 85,
    aiMatchScore: 91,
    strengths: [
      'Strong ATS Score (88/100) with key action verbs',
      'Solid cloud experience in AWS and containerized environments',
      'High behavioral interview score (92%) using STAR framework',
      'Active portfolio of modern full stack projects'
    ],
    weaknesses: [
      'Missing Docker / Kubernetes deployment details in recent job bullets',
      'System design mock score (78%) has room for improvement in caching & sharding',
      'Lack of explicit cost savings metrics in earlier employment bullets'
    ],
    priorityImprovements: [
      'Complete Docker & System Design learning modules (+18% match score boost)',
      'Add revenue/latency metrics to Apple experience bullet 2',
      'Schedule 1 mock interview session on System Design topics'
    ]
  }
};

export const initialTasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Improve Resume Skills for Distributed Systems',
    tag: 'AI Suggestion',
    tagColor: '#4cd7f6',
    completed: false
  },
  {
    id: 't2',
    title: 'Complete Mock Interview for OpenAI Role',
    tag: 'Prep for OpenAI',
    tagColor: '#8d90a2',
    completed: false
  },
  {
    id: 't3',
    title: 'Update LinkedIn URL & Target Title',
    tag: 'Profile',
    tagColor: '#b7c4ff',
    completed: true
  }
];

export const initialJobRecommendations: JobRecommendation[] = mockJobsList;

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
  overallScore: 85,
  summary: 'Strong resume for Senior Software Engineering roles. Excellent frontend and cloud experience; adding explicit metrics and distributed system architecture will push score to 95+.',
  targetRole: 'Senior Software Engineer',
  formattingScore: 92,
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
    { category: 'Structure', score: 91, explanation: 'Logical flow: Summary -> Experience -> Projects -> Skills -> Education.', tip: 'Perfect section order.' },
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
    fileName: 'alex_resume_v2.pdf',
    uploadedAt: 'Today, 2:45 PM',
    fileSize: '184 KB',
    score: 85,
    template: 'modern',
    jobsMatchedCount: 18,
    isTailored: false,
    targetRole: 'Senior Software Engineer',
    parsedData: {
      fullName: 'Alex Morgan',
      email: 'alex.dev@hireflow.ai',
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
    score: 91,
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
