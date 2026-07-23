export type NavigationTab = 
  | 'landing'
  | 'dashboard'
  | 'resume-suite'
  | 'job-suite'
  | 'interviews'
  | 'career-tools'
  | 'calendar'
  | 'settings'
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  experienceLevel: string;
  tier: 'Free' | 'Gold Tier' | 'Premium Plan';
  atsScore: number;
  linkedInUrl?: string;
  targetRole: string;
}

export interface MetricCardData {
  atsScore: number;
  resumeStrengthTier: string;
  resumeStrengthPercentile: string;
  activeApplications: number;
  upcomingInterviews: number;
}

export interface TaskItem {
  id: string;
  title: string;
  tag: string;
  tagColor?: string;
  completed: boolean;
}

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  tags: string[];
  salary?: string;
  description?: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  type: 'analysis' | 'application' | 'alert' | 'interview';
}

export interface ResumeKeywordFeedback {
  id: string;
  type: 'high' | 'medium' | 'success';
  title: string;
  impactTag?: string;
  description: string;
  suggestionTitle: string;
  suggestionText: string;
  originalBullet?: string;
  suggestedBullet?: string;
}

export interface ResumeAnalysisResult {
  overallScore: number;
  summary: string;
  keywords: ResumeKeywordFeedback[];
  impactPoints: string[];
  grammarIssues: string[];
  formattingScore: number;
  targetRole: string;
}

export interface ResumeVersion {
  id: string;
  versionName: string;
  fileName: string;
  uploadedAt: string;
  score: number;
  content: string;
}

export interface ApplicationCard {
  id: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
  status: 'applied' | 'assessment' | 'interview' | 'offer' | 'rejected';
  locationType: 'Remote' | 'Hybrid' | 'On-site';
  priority?: boolean;
  badgeText?: string;
  timeAgo?: string;
  dueDate?: string;
  interviewTime?: string;
  aiAnalyzed?: boolean;
  notes?: string;
  jobDescription?: string;
  matchScore?: number;
}

export interface InterviewQuestion {
  id: string;
  role: string;
  company: string;
  type: 'Technical' | 'Behavioral' | 'System Design';
  question: string;
  hint: string;
  modelAnswer: string;
}

export interface MockInterviewSession {
  id: string;
  jobTitle: string;
  company: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: { questionId: string; userAudioOrText: string; feedback?: any }[];
  score?: number;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'success' | 'info';
}
