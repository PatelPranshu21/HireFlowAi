export type NavigationTab = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'pricing'
  | 'checkout'
  | 'onboarding'
  | 'dashboard'
  | 'resume-suite'
  | 'job-suite'
  | 'interviews'
  | 'career-tools'
  | 'calendar'
  | 'settings'
  | 'admin'
  | 'support'
  | 'profile'
  | 'billing';

export interface TransactionItem {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  planName: string;
  status: 'Paid' | 'Failed' | 'Refunded';
  paymentMethod: string;
  receiptUrl?: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  logo: string;
  description: string;
  industry: string;
  headquarters: string;
  employees: string;
  website: string;
  openPositionsCount: number;
  benefits: string[];
  interviewDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  averageSalary: string;
  aiRecommendation: string;
  companyCulture?: string;
  hiringProcessSteps?: string[];
  technologiesUsed?: string[];
  estimatedResponseTime?: string;
  similarCompanies?: string[];
}

export interface JobPreferences {
  preferredRoles: string[];
  preferredCompanies: string[];
  preferredCities: string[];
  remotePreference: 'Remote' | 'Hybrid' | 'On-site' | 'Any';
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  experienceLevel: string;
  preferredTechnologies: string[];
  preferredIndustries: string[];
}

export interface LearningProgressItem {
  id: string;
  title: string;
  category: string;
  type: 'course' | 'certification' | 'skill_module' | 'project';
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercent: number;
  estimatedHours: number;
  unlockedSalaryIncrease?: number;
  unlockedMatchScoreIncrease?: number;
}

export interface CareerRoadmapStage {
  id: string;
  stageName: string;
  targetRole: string;
  timeline: string;
  status: 'current' | 'next' | 'future';
  requiredSkills: string[];
  completedSkills: string[];
  recommendedProjects: string[];
  recommendedCertifications: string[];
}

export interface InterviewPerformanceMetrics {
  mockScoreOverall: number;
  technicalScore: number;
  behavioralScore: number;
  systemDesignScore: number;
  strongTopics: string[];
  weakTopics: string[];
  completedSessionsCount: number;
  solvedCodingCount: number;
}

export interface AnalyticsScores {
  employabilityScore: number;
  careerReadinessScore: number;
  aiMatchScore: number;
  strengths: string[];
  weaknesses: string[];
  priorityImprovements: string[];
}

export interface UsageLimitItem {
  used: number;
  max: number;
}

export interface UsageLimits {
  resumeScans: UsageLimitItem;
  atsAnalyses: UsageLimitItem;
  aiInterviews: UsageLimitItem;
  coverLetterGenerations: UsageLimitItem;
  jobMatchAnalyses: UsageLimitItem;
}

export interface CentralCareerProfile {
  // Basic Information
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  title: string;
  experienceLevel: string;
  timezone?: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
  portfolioUrl?: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];

  // Subscription & Tier
  tier: 'Free' | 'Gold Tier' | 'Premium Plan' | '3-Day Free Trial' | 'Basic';
  subscriptionPlan: '3-Day Free Trial' | 'Basic' | 'Pro' | 'Premium' | 'None';
  subscriptionStatus: 'trialing' | 'active' | 'expired' | 'canceled' | 'none';
  trialStartDate?: string;
  trialExpiryDate?: string;
  nextBillingDate?: string;
  hasSelectedPlan?: boolean;
  hasCompletedOnboarding?: boolean;
  hasUploadedResume?: boolean;
  transactionHistory?: TransactionItem[];
  usageLimits?: UsageLimits;

  // Professional Information
  skills: string[];
  technologies: string[];
  projects: ProjectEntry[];
  certifications: string[];
  languages: string[];

  // Career Preferences
  targetRole: string;
  preferences: JobPreferences;

  // Learning Progress
  learningRoadmap: CareerRoadmapStage[];
  learningProgress: LearningProgressItem[];
  skillsLearned: string[];
  coursesCompleted: string[];
  certificationsEarned: string[];

  // Resume Information
  atsScore: number;
  resumeText?: string;
  primaryResumeText?: string;
  activeResumeVersionId?: string;
  resumeVersions: ResumeVersion[];
  resumeHistory: UploadHistoryItem[];

  // Interview Information
  interviewMetrics: InterviewPerformanceMetrics;

  // Job Information
  savedJobIds: string[];
  appliedJobIds: string[];
  hiddenJobIds: string[];
  rejectedJobIds: string[];

  // Analytics & Scores
  analytics: AnalyticsScores;
}

export interface UserProfile extends CentralCareerProfile {}

export interface CalendarEvent {
  id: string;
  title: string;
  company?: string;
  jobId?: string;
  date: string;
  time: string;
  type: 'interview' | 'assessment' | 'followup' | 'study_session' | 'deadline' | 'exam' | 'goal' | 'mock_interview' | 'coding_practice' | 'resume_review' | 'coaching';
  description?: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  colorTag?: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  reminderMinutesBefore?: number;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  durationMinutes?: number;
}

export interface ProductivityTask {
  id: string;
  title: string;
  description?: string;
  category: 'Resume' | 'Interview' | 'Learning' | 'Certification' | 'Applications' | 'Personal' | 'Support';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
  estimatedMinutes?: number;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  notes?: string;
  completed: boolean;
  createdAt?: string;
}

export interface ProductivityNote {
  id: string;
  title: string;
  content: string;
  category: 'Interview Notes' | 'Company Notes' | 'Learning Notes' | 'Resume Ideas' | 'General Notes';
  pinned?: boolean;
  favorite?: boolean;
  archived?: boolean;
  tags: string[];
  updatedAt: string;
}

export interface ProductivityGoal {
  id: string;
  title: string;
  targetMetric: string;
  currentProgress: number;
  targetProgress: number;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'career';
  category: string;
  completed: boolean;
  deadline?: string;
  unit?: string;
}

export interface FocusSessionLog {
  id: string;
  mode: 'Coding' | 'Study' | 'Interview Practice' | 'Resume Editing' | 'Job Applications';
  durationMinutes: number;
  timestamp: string;
  completed: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
}

export interface ProductivityStreaks {
  learningStreakDays: number;
  interviewStreakDays: number;
  applicationStreakDays: number;
  totalStudyHours: number;
  totalFocusHours: number;
  completedTasksCount: number;
  productivityScore: number;
}

export interface ProductivitySettings {
  workingHoursStart: string;
  workingHoursEnd: string;
  timezone: string;
  reminderPreferences: {
    interviews: boolean;
    deadlines: boolean;
    goals: boolean;
    studySessions: boolean;
    soundEnabled: boolean;
  };
  defaultCalendarView: 'day' | 'week' | 'month' | 'agenda';
  defaultFocusLength: number;
  breakLength: number;
}

export interface ThirdPartyIntegrationState {
  googleCalendar: { connected: boolean; email?: string; syncEnabled: boolean };
  outlookCalendar: { connected: boolean; email?: string; syncEnabled: boolean };
  zoom: { connected: boolean; user?: string };
  googleMeet: { connected: boolean; email?: string };
  teams: { connected: boolean; user?: string };
  slack: { connected: boolean; workspace?: string };
  discord: { connected: boolean; username?: string };
}

export interface AIProviderConfig {
  provider: 'gemini' | 'openai' | 'claude' | 'azure' | 'local_llm';
  apiKey?: string;
  modelName: string;
  isCustomKeySet?: boolean;
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Job' | 'Company' | 'Skill' | 'Project' | 'Roadmap' | 'Interview Question' | 'Certification' | 'Learning Resource' | 'Event' | 'Task' | 'Note' | 'Goal';
  badge?: string;
  actionTab: NavigationTab;
  metadata?: any;
}

export interface DailyBriefingData {
  greetingName: string;
  newMatchingJobsCount: number;
  atsScoreChange: number;
  upcomingInterviewsCount: number;
  todaysLearningGoal: string;
  weeklyProgressPercent: number;
  dailyCareerInsight: string;
}

export interface ProactiveCoachMessage {
  id: string;
  type: 'success' | 'alert' | 'recommendation' | 'milestone';
  message: string;
  actionText?: string;
  actionTab?: NavigationTab;
  timestamp: string;
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
  job_id?: string;
  companyId?: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  matchScore: number;
  match_score?: number;
  matchConfidence?: 'Very High' | 'High' | 'Moderate' | 'Low';
  similarityScore?: number;
  similarity_score?: number;
  skillMatchScore?: number;
  skill_match_score?: number;
  tags: string[];
  salary?: string;
  salaryRange?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  hiringProcess?: string[];
  requiredSkills?: string[];
  required_skills?: string[];
  matchedSkills?: string[];
  matched_skills?: string[];
  missingSkills?: string[];
  missing_skills?: string[];
  preferredSkills?: string[];
  preferred_skills?: string[];
  experienceRequired?: string;
  jobType?: string;
  companyDescription?: string;
  postedDate?: string;
  recommendationReason?: string;
  whyMatch?: string;
  why_match?: string;
  applyUrl?: string;
  applicationUrl?: string;
  companyWebsite?: string;
  preparationTips?: string[];
  notes?: string;
  hidden?: boolean;
  isActive?: boolean;
  is_active?: boolean;
  industry?: string;
  source?: string;
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

export interface AtsCategoryScore {
  category: 'Formatting' | 'Keywords' | 'Skills' | 'Projects' | 'Experience' | 'Education' | 'Readability' | 'Grammar' | 'Structure' | 'Impact';
  score: number;
  explanation: string;
  tip: string;
}

export interface SectionAnalysisItem {
  id: string;
  sectionName: string;
  score?: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommendedChanges: string[];
  priority: 'High' | 'Medium' | 'Low';
  estimatedAtsGain: number;
  isDetected?: boolean;
}

export interface AiImprovementSuggestion {
  id: string;
  title: string;
  section: 'summary' | 'bullets' | 'experience' | 'projects' | 'leadership' | 'skills' | 'keywords' | 'passive_voice' | 'grammar' | 'readability';
  currentVersion: string;
  improvedVersion: string;
  reason: string;
  expectedAtsIncrease: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface KeywordItem {
  keyword: string;
  category: string;
  importance: 'High' | 'Medium' | 'Low' | 'Recommended' | string;
  detected: boolean;
  foundInResume?: boolean;
  count?: number;
  frequency?: number;
  source?: 'resume' | 'job_requirement' | 'recommendation' | 'canonical_skill_dictionary';
}

export interface TailorResumeResponse {
  matchScore: number;
  missingKeywords: string[];
  suggestedModifications: string[];
  tailoredContent: string;
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  technologies: string[];
}

export interface ParsedResumeData {
  fullName: string;
  email: string;
  phone: string;
  linkedIn: string;
  gitHub: string;
  portfolio: string;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: string[];
  certifications: string[];
  languages: string[];
  achievements: string[];
}

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  versionName: string;
  parsingStatus: 'Parsed ✓' | 'Parsing...' | 'Error';
  fileType: 'PDF' | 'DOCX' | 'TXT';
}

export interface ResumeVersion {
  id: string;
  versionName: string;
  fileName: string;
  uploadedAt: string;
  score: number;
  content: string;
  resumeText?: string;
  parsedData?: ParsedResumeData;
  fileSize?: string;
  template?: 'modern' | 'executive' | 'minimalist' | 'ats' | 'modern_tech' | 'ats_standard' | string;
  jobsMatchedCount?: number;
  isTailored?: boolean;
  targetRole?: string;
  targetCompany?: string;
  analysisData?: any;
}

export interface ResumeAnalysisResult {
  overallScore: number;
  summary: string;
  keywords: ResumeKeywordFeedback[];
  impactPoints: string[];
  grammarIssues: string[];
  formattingScore: number;
  targetRole: string;
  categoryScores?: AtsCategoryScore[];
  sectionAnalyses?: SectionAnalysisItem[];
  aiSuggestions?: AiImprovementSuggestion[];
  keywordList?: KeywordItem[];
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
}

export interface ApplicationCard {
  id: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
  status: 'saved' | 'applied' | 'assessment' | 'interview' | 'hr_round' | 'offer' | 'accepted' | 'rejected';
  locationType: 'Remote' | 'Hybrid' | 'On-site';
  priority?: boolean;
  badgeText?: string;
  timeAgo?: string;
  dueDate?: string;
  interviewTime?: string;
  appliedDate?: string;
  recruiterInfo?: string;
  salaryOffered?: string;
  notes?: string;
  aiAnalyzed?: boolean;
  jobDescription?: string;
  matchScore?: number;
  statusHistory?: StatusHistoryEntry[];
}

export interface InterviewQuestion {
  id: string;
  role: string;
  company: string;
  type: 'Technical' | 'Behavioral' | 'System Design' | 'Coding' | 'HR';
  question: string;
  hint: string;
  modelAnswer: string;
}

export interface MockInterviewSession {
  id: string;
  jobTitle: string;
  company: string;
  domain?: string;
  level?: string;
  mode?: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: { questionId: string; userAudioOrText: string; feedback?: any }[];
  score?: number;
  completed: boolean;
  createdAt?: string;
}

export type InterviewDomain = 'Frontend' | 'Backend' | 'Full Stack' | 'AI/ML' | 'Data Science' | 'Cybersecurity' | 'DevOps' | 'Product Manager' | 'HR' | 'Behavioural';
export type InterviewLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type InterviewMode = 'Quick (10 min)' | 'Standard (30 min)' | 'Full Interview (60 min)';

export interface CompanyFaqItem {
  question: string;
  answer: string;
}

export interface PrepChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface CompanyInterviewProfile {
  id: string;
  name: string;
  logo: string;
  category: string;
  estimatedDifficulty: 'Easy' | 'Medium' | 'Medium-Hard' | 'Hard';
  salaryRange: string;
  hiringTimeline: string;
  techStack: string[];
  overview: string;
  interviewStages: string[];
  questionTypes: string[];
  codingFocus: string[];
  behaviouralFocus: string[];
  faqs: CompanyFaqItem[];
  prepTips: string[];
  prepChecklist: PrepChecklistItem[];
}

export interface CodingTestCase {
  input: string;
  expectedOutput: string;
}

export interface CodingProblemItem {
  id: string;
  title: string;
  category: 'Arrays' | 'Strings' | 'Linked Lists' | 'Stacks' | 'Queues' | 'Trees' | 'Graphs' | 'Dynamic Programming' | 'Greedy' | 'Backtracking' | 'Binary Search' | 'Hash Maps' | 'Sliding Window' | 'Two Pointers' | string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeComplexity: string;
  spaceComplexity: string;
  problemDescription: string;
  initialCode: string;
  solutionCode: string;
  hints: string[];
  aiExplanation: string;
  testCases: CodingTestCase[];
  status: 'unsolved' | 'attempted' | 'solved';
}

export interface SystemDesignTopic {
  id: string;
  title: string;
  category: 'Scalability' | 'Load Balancing' | 'Caching' | 'Databases' | 'Microservices' | 'Queues' | 'CDN' | 'Authentication' | 'API Design' | string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  keyTradeoffs: string[];
  sampleQuestions: string[];
  aiExplanation: string;
}

export interface BehavioralQuestionItem {
  id: string;
  category: string;
  question: string;
  framework: string;
  idealStructure: string;
}

export interface StudyTaskItem {
  day: number;
  topic: string;
  category: 'Coding' | 'System Design' | 'Behavioral' | 'Resume' | 'Mock Interview' | 'Company Prep' | 'Revision';
  completed: boolean;
}

export interface StudyPlanConfig {
  id: string;
  days: 7 | 14 | 30 | 60;
  title: string;
  description: string;
  dailyTasks: StudyTaskItem[];
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardXp: number;
}

export interface InterviewFeedbackReport {
  sessionTitle: string;
  companyName: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  recommendedLearningTopics: string[];
  starBreakdown?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
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
  type: 'alert' | 'success' | 'info' | 'warning';
}
