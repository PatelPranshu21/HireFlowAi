import { 
  AdminUser, 
  SubscriptionPlanAdmin, 
  PaymentTransactionAdmin, 
  GatewayConfig, 
  ContentItemAdmin, 
  CompanyAdmin, 
  JobAdmin, 
  AiTelemetryData, 
  SupportTicketAdmin, 
  AnnouncementAdmin, 
  AuditLogAdmin, 
  SecurityThreatLog, 
  EmailTemplateAdmin, 
  ServiceHealthItem 
} from '../types/admin';

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'usr_101',
    name: 'Alex Rivera (Demo Candidate)',
    email: 'alex.rivera@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'Admin',
    accountStatus: 'Active',
    registrationDate: '2026-01-15',
    lastLogin: '2 mins ago',
    subscriptionPlan: 'Pro',
    trialStatus: 'active',
    employabilityScore: 88,
    resumeScore: 86,
    applicationsCount: 14,
    location: 'San Francisco, CA'
  },
  {
    id: 'usr_102',
    name: 'Sarah Chen',
    email: 'sarah.chen@techlead.io',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    role: 'Super Admin',
    accountStatus: 'Active',
    registrationDate: '2025-11-02',
    lastLogin: 'Just now',
    subscriptionPlan: 'Enterprise',
    trialStatus: 'active',
    employabilityScore: 94,
    resumeScore: 92,
    applicationsCount: 28,
    location: 'Seattle, WA'
  },
  {
    id: 'usr_103',
    name: 'David Kim',
    email: 'david.kim@ai.dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'Auditor',
    accountStatus: 'Active',
    registrationDate: '2026-02-10',
    lastLogin: '1 hour ago',
    subscriptionPlan: 'Premium',
    trialStatus: 'active',
    employabilityScore: 91,
    resumeScore: 89,
    applicationsCount: 8,
    location: 'Austin, TX'
  },
  {
    id: 'usr_104',
    name: 'Elena Rostova',
    email: 'elena.rostova@designworks.co',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    role: 'Admin',
    accountStatus: 'Active',
    registrationDate: '2026-03-01',
    lastLogin: '10 mins ago',
    subscriptionPlan: 'Basic',
    trialStatus: 'active',
    employabilityScore: 79,
    resumeScore: 81,
    applicationsCount: 6,
    location: 'New York, NY'
  },
  {
    id: 'usr_105',
    name: 'Marcus Vance',
    email: 'marcus.v@cloudscale.net',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    role: 'Admin',
    accountStatus: 'Suspended',
    registrationDate: '2026-02-18',
    lastLogin: '3 days ago',
    subscriptionPlan: 'Basic',
    trialStatus: 'canceled',
    employabilityScore: 62,
    resumeScore: 65,
    applicationsCount: 2,
    location: 'Chicago, IL'
  },
  {
    id: 'usr_106',
    name: 'Priya Sharma',
    email: 'priya.sharma@fintech.org',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    role: 'Admin',
    accountStatus: 'Pending',
    registrationDate: '2026-07-24',
    lastLogin: 'Never',
    subscriptionPlan: '3-Day Free Trial',
    trialStatus: 'trialing',
    employabilityScore: 72,
    resumeScore: 70,
    applicationsCount: 0,
    location: 'Toronto, Canada'
  }
];

export const initialAdminPlans: SubscriptionPlanAdmin[] = [
  {
    id: 'plan_trial',
    name: '3-Day Free Trial',
    price: 0,
    billingCycle: 'monthly',
    trialDays: 3,
    features: [
      'Full Access to Resume Suite',
      'AI Resume Tailoring (3/day)',
      'Job Matcher & Search',
      'Mock Interview Simulator (1 session)'
    ],
    maxAiQueries: 15,
    status: 'Active',
    subscriberCount: 4210,
    badgeText: 'Free Trial',
    popular: false
  },
  {
    id: 'plan_basic',
    name: 'Basic',
    price: 9,
    billingCycle: 'monthly',
    trialDays: 0,
    features: [
      'Unlimited Resume Analysis',
      'AI Bullet Point Enhancer',
      'Basic Job Matching',
      'Export PDF & DOCX Resumes',
      'Email Support'
    ],
    maxAiQueries: 100,
    status: 'Active',
    subscriberCount: 8450,
    badgeText: 'Starter',
    popular: false
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    price: 19,
    billingCycle: 'monthly',
    trialDays: 0,
    features: [
      'Everything in Basic',
      'Unlimited AI Tailoring & Cover Letters',
      'AI Mock Interview Voice & Video Simulator',
      'Smart Calendar & AI Planner Sync',
      'Company Intelligence & Salary Insights',
      'Priority Support 24/7'
    ],
    maxAiQueries: 'Unlimited',
    status: 'Active',
    subscriberCount: 12890,
    badgeText: 'Most Popular',
    popular: true
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    price: 49,
    billingCycle: 'monthly',
    trialDays: 0,
    features: [
      'Everything in Pro',
      '1-on-1 AI Career Agent Coaching',
      'Automated Multi-Board Job Application',
      'System Design & Live Coding Prep',
      'Dedicated Career Consultant Chat'
    ],
    maxAiQueries: 'Unlimited',
    status: 'Active',
    subscriberCount: 2900,
    badgeText: 'VIP Suite',
    popular: false
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    price: 299,
    billingCycle: 'monthly',
    trialDays: 14,
    features: [
      'Custom Corporate Candidate Pool',
      'Dedicated API Key & Webhooks',
      'Custom ATS Integration (Workday, Greenhouse)',
      'Dedicated Account Manager & SLA'
    ],
    maxAiQueries: 'Unlimited',
    status: 'Active',
    subscriberCount: 140,
    badgeText: 'Corporate',
    popular: false
  }
];

export const initialTransactions: PaymentTransactionAdmin[] = [
  {
    id: 'tx_88910',
    userEmail: 'alex.rivera@example.com',
    userName: 'Alex Rivera',
    amount: 19.00,
    currency: 'USD',
    gateway: 'Stripe',
    status: 'Succeeded',
    date: '2026-07-24 14:32',
    invoiceUrl: '#',
    planName: 'Pro Plan'
  },
  {
    id: 'tx_88909',
    userEmail: 'sarah.chen@techlead.io',
    userName: 'Sarah Chen',
    amount: 299.00,
    currency: 'USD',
    gateway: 'Stripe',
    status: 'Succeeded',
    date: '2026-07-24 11:15',
    invoiceUrl: '#',
    planName: 'Enterprise'
  },
  {
    id: 'tx_88908',
    userEmail: 'elena.rostova@designworks.co',
    userName: 'Elena Rostova',
    amount: 9.00,
    currency: 'USD',
    gateway: 'Razorpay',
    status: 'Succeeded',
    date: '2026-07-23 18:40',
    invoiceUrl: '#',
    planName: 'Basic'
  },
  {
    id: 'tx_88907',
    userEmail: 'marcus.v@cloudscale.net',
    userName: 'Marcus Vance',
    amount: 19.00,
    currency: 'USD',
    gateway: 'PayPal',
    status: 'Failed',
    date: '2026-07-22 09:12',
    invoiceUrl: '#',
    planName: 'Pro Plan'
  },
  {
    id: 'tx_88906',
    userEmail: 'david.kim@ai.dev',
    userName: 'David Kim',
    amount: 49.00,
    currency: 'USD',
    gateway: 'Stripe',
    status: 'Refunded',
    date: '2026-07-21 16:05',
    invoiceUrl: '#',
    planName: 'Premium'
  }
];

export const initialGateways: GatewayConfig[] = [
  {
    id: 'stripe',
    name: 'Stripe Payments',
    active: true,
    testMode: false,
    webhookHealth: 'Healthy',
    currency: 'USD',
    lastSynced: '1 min ago'
  },
  {
    id: 'razorpay',
    name: 'Razorpay Global',
    active: true,
    testMode: false,
    webhookHealth: 'Healthy',
    currency: 'INR / USD',
    lastSynced: '5 mins ago'
  },
  {
    id: 'paypal',
    name: 'PayPal Express Checkout',
    active: true,
    testMode: true,
    webhookHealth: 'Healthy',
    currency: 'USD / EUR',
    lastSynced: '12 mins ago'
  }
];

export const initialContentItems: ContentItemAdmin[] = [
  {
    id: 'cnt_101',
    title: 'Senior Frontend Architecture & System Design Roadmap (2026)',
    category: 'Roadmaps',
    tags: ['React 19', 'System Design', 'Frontend'],
    status: 'Published',
    author: 'HireFlow AI Editorial',
    views: 18450,
    likes: 2310,
    updatedAt: '2026-07-20',
    premiumOnly: false,
    contentBody: 'Complete guide covering state management, rendering patterns, micro-frontends, and performance optimization for L5+ engineering roles.'
  },
  {
    id: 'cnt_102',
    title: 'Docker & Kubernetes Cheat Sheet for Backend Interviews',
    category: 'Cheat Sheets',
    tags: ['DevOps', 'Containers', 'Kubernetes'],
    status: 'Published',
    author: 'DevOps Lead',
    views: 12300,
    likes: 1840,
    updatedAt: '2026-07-18',
    premiumOnly: true,
    contentBody: 'Essential commands, manifest configurations, and debugging strategies for containerized technical interview rounds.'
  },
  {
    id: 'cnt_103',
    title: 'Top 50 Behavioral Questions with STAR Method Examples',
    category: 'Interview Questions',
    tags: ['Behavioral', 'STAR Method', 'Leadership'],
    status: 'Published',
    author: 'Career Consultant',
    views: 29100,
    likes: 4120,
    updatedAt: '2026-07-22',
    premiumOnly: false,
    contentBody: 'Curated list of Amazon, Google, and Meta behavioral interview prompts with high-scoring response templates.'
  },
  {
    id: 'cnt_104',
    title: 'Meta L6 Software Engineer Hiring Bar & Salary Breakdown',
    category: 'Company Specs',
    tags: ['Meta', 'Compensation', 'Hiring Process'],
    status: 'Published',
    author: 'Staff Editor',
    views: 9400,
    likes: 890,
    updatedAt: '2026-07-15',
    premiumOnly: true,
    contentBody: 'Detailed analysis of Meta coding rounds, system design expectations, and salary negotiation strategies.'
  }
];

export const initialCompaniesAdmin: CompanyAdmin[] = [
  {
    id: 'comp_01',
    name: 'Apple',
    logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=100&q=80',
    industry: 'Consumer Tech / AI',
    location: 'Cupertino, CA',
    hiringStatus: 'Hiring Active',
    employees: '100,000+',
    openJobsCount: 42,
    website: 'https://apple.com/careers',
    description: 'Global leader in hardware, software, and AI consumer ecosystems.'
  },
  {
    id: 'comp_02',
    name: 'Google',
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=100&q=80',
    industry: 'Cloud / AI & Search',
    location: 'Mountain View, CA',
    hiringStatus: 'Hiring Active',
    employees: '180,000+',
    openJobsCount: 88,
    website: 'https://careers.google.com',
    description: 'Pioneering multimodal AI, search engines, cloud computing, and developer tools.'
  },
  {
    id: 'comp_03',
    name: 'Stripe',
    logo: 'https://images.unsplash.com/photo-1556742049-0a67dd016252?auto=format&fit=crop&w=100&q=80',
    industry: 'Fintech / Payments',
    location: 'San Francisco, CA',
    hiringStatus: 'Hiring Active',
    employees: '8,000+',
    openJobsCount: 29,
    website: 'https://stripe.com/jobs',
    description: 'Financial infrastructure platform powering global internet commerce.'
  },
  {
    id: 'comp_04',
    name: 'Meta',
    logo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=100&q=80',
    industry: 'Social / VR & AI',
    location: 'Menlo Park, CA',
    hiringStatus: 'Hiring Paused',
    employees: '67,000+',
    openJobsCount: 12,
    website: 'https://metacareers.com',
    description: 'Building spatial computing, social technology, and open source LLMs.'
  }
];

export const initialJobsAdmin: JobAdmin[] = [
  {
    id: 'job_01',
    title: 'Senior Frontend Engineer - AI Systems',
    company: 'Apple',
    logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=100&q=80',
    provider: 'Internal',
    location: 'Cupertino, CA (Hybrid)',
    salary: '$180,000 - $240,000',
    applicationsCount: 38,
    views: 1240,
    avgMatchScore: 89,
    status: 'Featured',
    postedDate: '2026-07-22'
  },
  {
    id: 'job_02',
    title: 'Staff Full Stack Engineer (React + Node)',
    company: 'Google',
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=100&q=80',
    provider: 'Greenhouse',
    location: 'Mountain View, CA (Hybrid)',
    salary: '$210,000 - $280,000',
    applicationsCount: 64,
    views: 2890,
    avgMatchScore: 92,
    status: 'Approved',
    postedDate: '2026-07-21'
  },
  {
    id: 'job_03',
    title: 'Lead Product Infrastructure Engineer',
    company: 'Stripe',
    logo: 'https://images.unsplash.com/photo-1556742049-0a67dd016252?auto=format&fit=crop&w=100&q=80',
    provider: 'Lever',
    location: 'Remote (US)',
    salary: '$195,000 - $250,000',
    applicationsCount: 22,
    views: 980,
    avgMatchScore: 84,
    status: 'Approved',
    postedDate: '2026-07-23'
  }
];

export const initialAiTelemetry: AiTelemetryData = {
  totalRequestsToday: 14890,
  tokensUsedToday: 8940000,
  avgResponseTimeMs: 280,
  successRatePercent: 99.85,
  errorRatePercent: 0.15,
  providerStatus: {
    gemini: true,
    claude: true,
    openai: true,
    azure: true,
    local: false
  },
  activeModel: 'gemini-3.6-flash',
  temperature: 0.7,
  maxTokens: 4096
};

export const initialSupportTickets: SupportTicketAdmin[] = [
  {
    id: 'tkt_1001',
    userEmail: 'alex.rivera@example.com',
    userName: 'Alex Rivera',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    subject: 'Question regarding ATS Keyword Tailoring for Apple job application',
    category: 'Resume Query',
    priority: 'Medium',
    status: 'Open',
    createdAt: '2026-07-24 10:15',
    updatedAt: '2026-07-24 10:20',
    messages: [
      {
        id: 'msg_1',
        sender: 'user',
        text: 'Hi HireFlow Team! The ATS score increased from 82% to 86%, but I wanted to verify if adding Docker experience as an ATS bullet point will flag as keyword stuffing.',
        time: '10:15 AM'
      },
      {
        id: 'msg_2',
        sender: 'support',
        text: 'Hello Alex! Our Gemini ATS engine contextualizes keywords into metric-driven accomplishment statements, avoiding simple repetitive keyword stuffing. You are completely safe!',
        time: '10:20 AM'
      }
    ]
  },
  {
    id: 'tkt_1002',
    userEmail: 'marcus.v@cloudscale.net',
    userName: 'Marcus Vance',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    subject: 'Pro Subscription billing renewal failure receipt',
    category: 'Billing',
    priority: 'High',
    status: 'Pending',
    createdAt: '2026-07-23 15:00',
    updatedAt: '2026-07-23 15:30',
    messages: [
      {
        id: 'msg_3',
        sender: 'user',
        text: 'My credit card expired so payment failed. Can I update my card without losing my saved resume versions?',
        time: '3:00 PM'
      }
    ]
  },
  {
    id: 'tkt_1003',
    userEmail: 'priya.sharma@fintech.org',
    userName: 'Priya Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    subject: 'Feature Request: Exporting Mock Interview transcripts as Markdown',
    category: 'Feature Request',
    priority: 'Low',
    status: 'Closed',
    createdAt: '2026-07-20 09:00',
    updatedAt: '2026-07-21 11:00',
    messages: [
      {
        id: 'msg_4',
        sender: 'user',
        text: 'Would love to download full AI interviewer feedback as a markdown doc.',
        time: '9:00 AM'
      },
      {
        id: 'msg_5',
        sender: 'support',
        text: 'Thanks Priya! This has been added to our v2.4 product roadmap!',
        time: '11:00 AM'
      }
    ]
  }
];

export const initialAnnouncements: AnnouncementAdmin[] = [
  {
    id: 'anc_01',
    title: '⚡ HireFlow AI v2.5 Live: Smart Calendar & AI Schedule Planner Released!',
    message: 'We have introduced automated AI calendar scheduling, Pomodoro Focus Mode, and multi-tier productivity tracking across all accounts.',
    targetAudience: 'All',
    active: true,
    bannerType: 'info',
    createdAt: '2026-07-24'
  },
  {
    id: 'anc_02',
    title: '🚀 Gemini 3.6 Flash Engine Integration Complete',
    message: 'Resume tailoring and mock interview responses are now 3x faster with 99.9% uptime.',
    targetAudience: 'Pro',
    active: true,
    bannerType: 'success',
    createdAt: '2026-07-20'
  }
];

export const initialAuditLogs: AuditLogAdmin[] = [
  {
    id: 'log_901',
    timestamp: '2026-07-25 10:02:14',
    adminEmail: 'sarah.chen@techlead.io',
    adminRole: 'Super Admin',
    action: 'AI_MODEL_UPDATED',
    targetEntity: 'Gemini 3.6 Flash',
    ipAddress: '192.168.1.45',
    severity: 'Info'
  },
  {
    id: 'log_902',
    timestamp: '2026-07-24 16:20:00',
    adminEmail: 'alex.rivera@example.com',
    adminRole: 'Admin',
    action: 'JOB_APPROVED',
    targetEntity: 'Senior Frontend Engineer - Apple',
    ipAddress: '172.16.0.88',
    severity: 'Info'
  },
  {
    id: 'log_903',
    timestamp: '2026-07-22 09:15:00',
    adminEmail: 'sarah.chen@techlead.io',
    adminRole: 'Super Admin',
    action: 'USER_SUSPENDED',
    targetEntity: 'Marcus Vance (usr_105)',
    ipAddress: '192.168.1.45',
    severity: 'Warning'
  },
  {
    id: 'log_904',
    timestamp: '2026-07-21 16:10:00',
    adminEmail: 'david.kim@ai.dev',
    adminRole: 'Auditor',
    action: 'REFUND_ISSUED',
    targetEntity: 'tx_88906 ($49.00)',
    ipAddress: '10.0.0.12',
    severity: 'Warning'
  }
];

export const initialSecurityThreats: SecurityThreatLog[] = [
  {
    id: 'sec_01',
    timestamp: '2026-07-25 09:44:12',
    type: 'Rate Limit Exceeded',
    ipAddress: '185.220.101.4',
    country: 'Frankfurt, Germany',
    status: 'Blocked',
    targetUser: 'api_v1_resume_analyze'
  },
  {
    id: 'sec_02',
    timestamp: '2026-07-24 22:12:00',
    type: 'Failed Login',
    ipAddress: '45.142.120.9',
    country: 'Moscow, Russia',
    status: 'Flagged',
    targetUser: 'admin@hireflow.ai'
  }
];

export const initialEmailTemplates: EmailTemplateAdmin[] = [
  {
    id: 'tpl_welcome',
    name: 'Welcome & Onboarding Email',
    category: 'Onboarding',
    subject: 'Welcome to HireFlow AI, {user_name}! Let\'s supercharge your career.',
    variables: ['{user_name}', '{dashboard_url}', '{ats_score}'],
    lastEdited: '2026-07-15',
    previewHtml: '<p>Hi <b>{user_name}</b>,</p><p>Welcome to HireFlow AI! Your ATS Career Profile is ready. <a href="{dashboard_url}">Go to Dashboard</a></p>'
  },
  {
    id: 'tpl_trial_expiry',
    name: '3-Day Free Trial Expiry Warning',
    category: 'Billing',
    subject: 'Your HireFlow AI Free Trial expires in 24 hours',
    variables: ['{user_name}', '{expiry_date}', '{upgrade_url}'],
    lastEdited: '2026-07-18',
    previewHtml: '<p>Hi <b>{user_name}</b>,</p><p>Your 3-Day Free Trial ends on {expiry_date}. Upgrade to Pro to keep unlimited AI Resume tailoring!</p>'
  },
  {
    id: 'tpl_interview_reminder',
    name: 'Upcoming Interview Alert',
    category: 'Interview Hub',
    subject: 'Interview Tomorrow: {job_title} at {company_name}',
    variables: ['{user_name}', '{job_title}', '{company_name}', '{interview_time}'],
    lastEdited: '2026-07-20',
    previewHtml: '<p>Hi <b>{user_name}</b>,</p><p>Reminder: You have an interview for <b>{job_title}</b> at <b>{company_name}</b> scheduled at {interview_time}.</p>'
  }
];

export const initialServiceHealth: ServiceHealthItem[] = [
  {
    name: 'Web Core & Application Server (Cloud Run)',
    status: 'Operational',
    latencyMs: 42,
    uptimePercent: 99.99,
    lastChecked: 'Just now',
    iconName: 'Server'
  },
  {
    name: 'Firestore & Relational DB Cluster',
    status: 'Operational',
    latencyMs: 18,
    uptimePercent: 100.00,
    lastChecked: 'Just now',
    iconName: 'Database'
  },
  {
    name: 'Gemini 3.6 AI Processing Gateway',
    status: 'Operational',
    latencyMs: 240,
    uptimePercent: 99.98,
    lastChecked: 'Just now',
    iconName: 'Cpu'
  },
  {
    name: 'Stripe & Razorpay Payment Webhooks',
    status: 'Operational',
    latencyMs: 85,
    uptimePercent: 99.95,
    lastChecked: 'Just now',
    iconName: 'CreditCard'
  },
  {
    name: 'Email SMTP & Broadcast Dispatcher',
    status: 'Operational',
    latencyMs: 110,
    uptimePercent: 99.90,
    lastChecked: 'Just now',
    iconName: 'Mail'
  }
];
