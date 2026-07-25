export type AdminRole = 'Super Admin' | 'Admin' | 'Auditor';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AdminRole;
  accountStatus: 'Active' | 'Suspended' | 'Pending';
  registrationDate: string;
  lastLogin: string;
  subscriptionPlan: '3-Day Free Trial' | 'Basic' | 'Pro' | 'Premium' | 'Enterprise';
  trialStatus: 'trialing' | 'active' | 'expired' | 'canceled';
  employabilityScore: number;
  resumeScore: number;
  applicationsCount: number;
  location?: string;
}

export interface AdminSession {
  sessionId: string;
  adminEmail: string;
  adminName: string;
  role: AdminRole;
  loggedInAt: string;
  ipAddress: string;
  location: string;
  active: boolean;
}

export interface SubscriptionPlanAdmin {
  id: string;
  name: '3-Day Free Trial' | 'Basic' | 'Pro' | 'Premium' | 'Enterprise';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  trialDays: number;
  features: string[];
  maxAiQueries: number | 'Unlimited';
  status: 'Active' | 'Draft' | 'Archived';
  subscriberCount: number;
  badgeText?: string;
  popular?: boolean;
}

export interface PaymentTransactionAdmin {
  id: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  gateway: 'Stripe' | 'Razorpay' | 'PayPal';
  status: 'Succeeded' | 'Failed' | 'Refunded' | 'Processing';
  date: string;
  invoiceUrl?: string;
  planName: string;
}

export interface GatewayConfig {
  id: 'stripe' | 'razorpay' | 'paypal';
  name: string;
  active: boolean;
  testMode: boolean;
  webhookHealth: 'Healthy' | 'Degraded' | 'Offline';
  currency: string;
  lastSynced: string;
}

export interface ContentItemAdmin {
  id: string;
  title: string;
  category: 'Roadmaps' | 'Cheat Sheets' | 'Courses' | 'Interview Questions' | 'Company Specs' | 'Announcements' | 'FAQs';
  tags: string[];
  status: 'Published' | 'Draft' | 'Archived';
  author: string;
  views: number;
  likes: number;
  updatedAt: string;
  premiumOnly: boolean;
  contentBody?: string;
}

export interface CompanyAdmin {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  hiringStatus: 'Hiring Active' | 'Hiring Paused' | 'Frozen' | 'Laying Off';
  employees: string;
  openJobsCount: number;
  website: string;
  description: string;
}

export interface JobAdmin {
  id: string;
  title: string;
  company: string;
  logo: string;
  provider: 'LinkedIn' | 'Indeed' | 'Greenhouse' | 'Lever' | 'Internal';
  location: string;
  salary: string;
  applicationsCount: number;
  views: number;
  avgMatchScore: number;
  status: 'Approved' | 'Featured' | 'Hidden' | 'Archived';
  postedDate: string;
}

export interface AiTelemetryData {
  totalRequestsToday: number;
  tokensUsedToday: number;
  avgResponseTimeMs: number;
  successRatePercent: number;
  errorRatePercent: number;
  providerStatus: {
    gemini: boolean;
    claude: boolean;
    openai: boolean;
    azure: boolean;
    local: boolean;
  };
  activeModel: string;
  temperature: number;
  maxTokens: number;
}

export interface SupportTicketAdmin {
  id: string;
  userEmail: string;
  userName: string;
  userAvatar: string;
  subject: string;
  category: 'Bug' | 'Billing' | 'Feature Request' | 'Resume Query' | 'Career Coach';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Pending' | 'Closed' | 'Escalated';
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    sender: 'user' | 'support';
    text: string;
    time: string;
  }[];
}

export interface AnnouncementAdmin {
  id: string;
  title: string;
  message: string;
  targetAudience: 'All' | 'Trial' | 'Pro' | 'Suspended';
  active: boolean;
  bannerType: 'info' | 'warning' | 'success' | 'alert';
  createdAt: string;
  expiresAt?: string;
}

export interface AuditLogAdmin {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminRole: AdminRole;
  action: string;
  targetEntity: string;
  ipAddress: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface SecurityThreatLog {
  id: string;
  timestamp: string;
  type: 'Failed Login' | 'Rate Limit Exceeded' | 'Suspicious IP' | 'Invalid Token';
  ipAddress: string;
  country: string;
  status: 'Blocked' | 'Flagged' | 'Cleared';
  targetUser?: string;
}

export interface EmailTemplateAdmin {
  id: string;
  name: string;
  category: string;
  subject: string;
  variables: string[];
  lastEdited: string;
  previewHtml: string;
}

export interface ServiceHealthItem {
  name: string;
  status: 'Operational' | 'Degraded' | 'Outage' | 'Maintenance';
  latencyMs: number;
  uptimePercent: number;
  lastChecked: string;
  iconName: string;
}
