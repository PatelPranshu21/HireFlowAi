import React, { createContext, useContext, useState, useEffect } from 'react';

import { useAuth } from './AuthContext';
import {
  CentralCareerProfile,
  JobRecommendation,
  ApplicationCard,
  NotificationItem,
  ActivityLog,
  TaskItem,
  CalendarEvent,
  ProactiveCoachMessage,
  NavigationTab,
  DailyBriefingData,
  ProductivityTask,
  ProductivityNote,
  ProductivityGoal,
  FocusSessionLog,
  ProductivityStreaks,
  ProductivitySettings,
  ThirdPartyIntegrationState,
  ResumeAnalysisResult,
  ResumeVersion
} from '../types';
import { initialUserProfile, initialTasks, initialJobRecommendations, initialActivityLogs, sampleNotifications, defaultResumeAnalysis } from '../data/mockData';
import { WorkflowEngine } from '../services/workflowEngine';
import { CalendarService } from '../services/calendarService';
import { AiMemoryService } from '../services/aiMemoryService';
import { calculateTrialRemaining } from '../utils/trialUtils';
import { EmployabilityScoreService } from '../services/employabilityScoreService';
import { ProductivityService } from '../services/productivityService';
import { UserService } from '../services/userService';
import { AiProviderService } from '../services/aiProviderService';
import { getRecommendationsForResume } from '../data/jobProvider';

interface EcosystemContextType {
  profile: CentralCareerProfile;
  setProfile: React.Dispatch<React.SetStateAction<CentralCareerProfile>>;
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  recommendations: JobRecommendation[];
  setRecommendations: React.Dispatch<React.SetStateAction<JobRecommendation[]>>;
  activities: ActivityLog[];
  setActivities: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  applications: ApplicationCard[];
  setApplications: React.Dispatch<React.SetStateAction<ApplicationCard[]>>;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  addNotification: (notif: { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'alert' }) => void;
  calendarEvents: CalendarEvent[];
  setCalendarEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;

  // Productivity & Collaboration State
  prodTasks: ProductivityTask[];
  setProdTasks: React.Dispatch<React.SetStateAction<ProductivityTask[]>>;
  prodNotes: ProductivityNote[];
  setProdNotes: React.Dispatch<React.SetStateAction<ProductivityNote[]>>;
  prodGoals: ProductivityGoal[];
  setProdGoals: React.Dispatch<React.SetStateAction<ProductivityGoal[]>>;
  focusSessions: FocusSessionLog[];
  setFocusSessions: React.Dispatch<React.SetStateAction<FocusSessionLog[]>>;
  streaks: ProductivityStreaks;
  setStreaks: React.Dispatch<React.SetStateAction<ProductivityStreaks>>;
  prodSettings: ProductivitySettings;
  setProdSettings: React.Dispatch<React.SetStateAction<ProductivitySettings>>;
  integrations: ThirdPartyIntegrationState;
  setIntegrations: React.Dispatch<React.SetStateAction<ThirdPartyIntegrationState>>;

  // UI Modal States
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isDailyBriefingOpen: boolean;
  setIsDailyBriefingOpen: (open: boolean) => void;
  coachMessages: ProactiveCoachMessage[];
  pushCoachMessage: (msg: Omit<ProactiveCoachMessage, 'id' | 'timestamp'>) => void;
  dailyBriefingData: DailyBriefingData;

  // ATS Analysis State
  currentAnalysis: ResumeAnalysisResult;
  setCurrentAnalysis: React.Dispatch<React.SetStateAction<ResumeAnalysisResult>>;
  activeResumeVersionId: string;
  isAnalyzingResume: boolean;
  switchActiveResumeVersion: (versionId: string) => Promise<void>;
  deleteResumeVersion: (versionId: string) => Promise<void>;

  // Actions
  uploadResume: (fileText: string, fileName: string, parsedData?: any) => Promise<void>;
  applyBulletSuggestion: (bulletText: string) => void;
  applyToJob: (job: { id: string; title: string; company: string; companyLogo?: string; location?: string; salary?: string }) => void;
  saveJob: (jobId: string) => void;
  rejectJob: (jobId: string) => void;
  completeInterviewSession: (topic: string, score: number) => void;
  completeCertification: (certName: string) => void;
  updateProfileDetails: (updated: Partial<CentralCareerProfile>) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (event: CalendarEvent) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleCalendarEvent: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  navigateWithEcosystem: (tab: NavigationTab) => void;

  // Productivity Actions
  addProdTask: (task: Omit<ProductivityTask, 'id'>) => void;
  updateProdTask: (task: ProductivityTask) => void;
  deleteProdTask: (id: string) => void;
  toggleProdTask: (id: string) => void;

  addProdNote: (note: Omit<ProductivityNote, 'id' | 'updatedAt'>) => void;
  updateProdNote: (note: ProductivityNote) => void;
  deleteProdNote: (id: string) => void;
  toggleNotePin: (id: string) => void;
  toggleNoteFav: (id: string) => void;
  toggleNoteArchive: (id: string) => void;

  addProdGoal: (goal: Omit<ProductivityGoal, 'id'>) => void;
  updateProdGoal: (goal: ProductivityGoal) => void;
  deleteProdGoal: (id: string) => void;
  incrementGoalProgress: (id: string, amount?: number) => void;

  recordFocusSession: (mode: FocusSessionLog['mode'], durationMinutes: number) => void;
  generateAiDailySchedule: () => void;
  updateProdSettings: (settings: Partial<ProductivitySettings>) => void;
  toggleIntegration: (key: keyof ThirdPartyIntegrationState) => void;
  recordUsage: (type: 'resumeScans' | 'atsAnalyses' | 'aiInterviews' | 'coverLetterGenerations' | 'jobMatchAnalyses', amount?: number) => boolean;
}

const EcosystemContext = createContext<EcosystemContextType | null>(null);

export const EcosystemProvider: React.FC<{ children: React.ReactNode; onNavigateTab: (tab: NavigationTab) => void }> = ({ children, onNavigateTab }) => {
  const { state: authState, updateProfile: authUpdateProfile } = useAuth();

  const profile = authState.profile || initialUserProfile;
  const currentUserId = authState.profile?.id || '';

  const setProfile = (action: React.SetStateAction<CentralCareerProfile>) => {
    if (typeof action === 'function') {
      const next = action(profile);
      authUpdateProfile(next);
    } else {
      authUpdateProfile(action);
    }
  };

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [applications, setApplications] = useState<ApplicationCard[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Productivity & Collaboration State
  const [prodTasks, setProdTasks] = useState<ProductivityTask[]>([]);
  const [prodNotes, setProdNotes] = useState<ProductivityNote[]>([]);
  const [prodGoals, setProdGoals] = useState<ProductivityGoal[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSessionLog[]>([]);
  const [streaks, setStreaks] = useState<ProductivityStreaks>(ProductivityService.getStreaks('guest'));
  const [prodSettings, setProdSettings] = useState<ProductivitySettings>(ProductivityService.getSettings('guest'));
  const [integrations, setIntegrations] = useState<ThirdPartyIntegrationState>(ProductivityService.getIntegrations('guest'));

  // Modals & Coach
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isDailyBriefingOpen, setIsDailyBriefingOpen] = useState(false);
  const [coachMessages, setCoachMessages] = useState<ProactiveCoachMessage[]>([]);

  // ATS Analysis & Active Resume Version State
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysisResult>(defaultResumeAnalysis);
  const [activeResumeVersionId, setActiveResumeVersionId] = useState<string>('');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState<boolean>(false);

  // Reload all user-scoped data whenever currentUserId changes
  useEffect(() => {
    if (!currentUserId) {
      setTasks([]);
      setRecommendations([]);
      setActivities([]);
      setApplications([]);
      setNotifications([]);
      setCalendarEvents([]);
      setProdTasks([]);
      setProdNotes([]);
      setProdGoals([]);
      setFocusSessions([]);
      setCoachMessages([]);
      return;
    }

    setTasks(UserService.getUserScopedData(currentUserId, 'tasks', initialTasks));
    setRecommendations(UserService.getUserScopedData(currentUserId, 'recommendations', initialJobRecommendations));
    setActivities(UserService.getUserScopedData(currentUserId, 'activities', initialActivityLogs));
    setApplications(UserService.getUserScopedData(currentUserId, 'applications', []));
    setNotifications(UserService.getUserScopedData(currentUserId, 'notifications', sampleNotifications));
    setCalendarEvents(CalendarService.getEvents(currentUserId));

    setProdTasks(ProductivityService.getTasks(currentUserId));
    setProdNotes(ProductivityService.getNotes(currentUserId));
    setProdGoals(ProductivityService.getGoals(currentUserId));
    setFocusSessions(ProductivityService.getFocusSessions(currentUserId));
    setStreaks(ProductivityService.getStreaks(currentUserId));
    setProdSettings(ProductivityService.getSettings(currentUserId));
    setIntegrations(ProductivityService.getIntegrations(currentUserId));

    // Fetch full persistent dataset from PostgreSQL
    UserService.fetchUserDataApi().then(dbData => {
      if (!dbData) return;

      if (dbData.atsReports && dbData.atsReports.length > 0) {
        // Don't load the global "latest" report — we'll load per-version analysis below
      }

      if (dbData.user) {
        const pData = dbData.user.profile_data || {};
        const pgResumes = dbData.resumes || [];
        const pgVersions = dbData.resumeVersions || [];
        let activeVerId = '';
        if (pgVersions.length > 0) {
          const safeParseJson = (val: any) => {
            if (!val) return null;
            if (typeof val === 'object') return val;
            if (typeof val === 'string') {
              try { return JSON.parse(val); } catch (e) { return null; }
            }
            return null;
          };

          pData.resumeVersions = pgVersions.map((v: any) => {
            const versionMatchesCount = (dbData.jobMatches || []).filter((jm: any) => jm.resume_version_id === v.id).length;
            const parsedAnalysis = safeParseJson(v.analysis_data);
            const effectiveScore = (parsedAnalysis?.overallScore !== undefined) ? parsedAnalysis.overallScore : (v.score ?? 0);
            return {
              id: v.id,
              versionName: v.version_name,
              fileName: v.file_name || v.version_name,
              uploadedAt: v.uploaded_at || 'Saved',
              fileSize: v.file_size || '180 KB',
              score: effectiveScore,
              template: v.template || 'modern_tech',
              parsedData: safeParseJson(v.parsed_data) || {},
              jobsMatchedCount: versionMatchesCount > 0 ? versionMatchesCount : (v.jobs_matched_count ?? 0),
              content: v.resume_text,
              resumeText: v.resume_text,
              analysisData: parsedAnalysis
            };
          });
          const savedActiveId = pData.activeResumeVersionId;
          const activeVer = pData.resumeVersions.find((v: any) => v.id === savedActiveId) || pData.resumeVersions[0];
          
          activeVerId = activeVer.id;
          pData.resumeText = activeVer.resumeText || pData.resumeText;
          pData.activeResumeVersionId = activeVer.id;
          setActiveResumeVersionId(activeVer.id);

          if (activeVer.analysisData && activeVer.analysisData.overallScore !== undefined && (activeVer.analysisData.categoryScores?.length > 0 || activeVer.analysisData.categoryBreakdown?.length > 0)) {
            setCurrentAnalysis(activeVer.analysisData);
            pData.atsScore = activeVer.analysisData.overallScore;
          } else if (activeVer.resumeText && activeVer.resumeText.trim().length > 20) {
            // Run fresh analysis if analysisData wasn't pre-cached
            AiProviderService.analyzeResume(activeVer.resumeText, pData.targetRole || "Software Engineer", activeVer.id).then(res => {
              if (res && res.overallScore) {
                setCurrentAnalysis(res);
                pData.atsScore = res.overallScore;
                UserService.updateResumeVersionScoreApi(activeVer.id, res.overallScore, res);
              }
            });
            pData.atsScore = activeVer.score || 0;
          } else if (activeVer.score && activeVer.score > 0) {
            setCurrentAnalysis({
              ...defaultResumeAnalysis,
              overallScore: activeVer.score
            });
            pData.atsScore = activeVer.score;
          } else {
            setCurrentAnalysis(defaultResumeAnalysis);
            pData.atsScore = 0;
          }
        } else if (pgResumes.length > 0) {
          pData.resumeVersions = pgResumes.map((r: any) => ({
            id: r.id,
            versionName: r.version_name || r.file_name || 'Master Resume',
            fileName: r.file_name || 'Resume.pdf',
            uploadedAt: 'Saved',
            fileSize: r.file_size || '180 KB',
            score: r.ats_score ?? 0,
            template: 'modern_tech',
            parsedData: r.parsed_data || {},
            jobsMatchedCount: 0,
            content: r.resume_text,
            resumeText: r.resume_text,
            analysisData: null
          }));
          const savedActiveId = pData.activeResumeVersionId;
          const activeVer = pData.resumeVersions.find((v: any) => v.id === savedActiveId) || pData.resumeVersions[0];
          
          activeVerId = activeVer.id;
          pData.resumeText = activeVer.resumeText || pData.resumeText;
          pData.atsScore = activeVer.score || 0;
          pData.activeResumeVersionId = activeVer.id;
          setActiveResumeVersionId(activeVer.id);
        } else {
          setActiveResumeVersionId('');
          setRecommendations([]);
          pData.atsScore = 0;
        }

        // Restore saved job IDs from database
        if (dbData.savedJobs && dbData.savedJobs.length > 0) {
          pData.savedJobIds = dbData.savedJobs;
        }

        authUpdateProfile(pData);

        // Load persisted job matches from PostgreSQL specifically for the active resume version
        if (activeVerId) {
          UserService.getJobMatchesApi(activeVerId).then(matches => {
            if (matches && matches.length > 0) {
              setRecommendations(matches);
            } else {
              const activeVer = pData.resumeVersions?.find((v: any) => v.id === activeVerId);
              if (activeVer) {
                UserService.matchResumeJobsApi({
                  resumeVersionId: activeVerId,
                  resumeText: activeVer.resumeText || activeVer.content || '',
                  skills: activeVer.parsedData?.skills || pData.skills || [],
                  targetRole: pData.targetRole || "Software Engineer"
                }).then(recs => {
                  setRecommendations(recs || []);
                });
              } else {
                setRecommendations([]);
              }
            }
          });
        }
      }

      if (dbData.calendarEvents && dbData.calendarEvents.length > 0) {
        const mappedEvents: CalendarEvent[] = dbData.calendarEvents.map((e: any) => ({
          id: e.id,
          title: e.title,
          company: e.company || undefined,
          jobId: e.job_id || undefined,
          date: e.event_date,
          time: e.event_time,
          type: e.event_type as any,
          description: e.description || '',
          completed: Boolean(e.completed),
          priority: e.priority as any,
          colorTag: e.color_tag
        }));
        setCalendarEvents(mappedEvents);
      }

      if (dbData.jobApplications && dbData.jobApplications.length > 0) {
        const mappedApps: ApplicationCard[] = dbData.jobApplications.map((a: any) => ({
          id: a.id,
          title: a.title,
          company: a.company,
          logo: a.company_logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(a.company)}`,
          location: a.location || 'Remote',
          salary: a.salary || '$120,000 - $160,000',
          matchScore: a.match_score || 0,
          status: a.status || 'applied',
          stage: a.stage || 'Applied',
          appliedDate: a.applied_date || 'Recently'
        }));
        setApplications(mappedApps);
      }

      if (dbData.productivity) {
        const p = dbData.productivity;
        if (p.prod_tasks) setProdTasks(p.prod_tasks);
        if (p.prod_notes) setProdNotes(p.prod_notes);
        if (p.prod_goals) setProdGoals(p.prod_goals);
        if (p.prod_focus) setFocusSessions(p.prod_focus);
        if (p.prod_streaks) setStreaks(p.prod_streaks);
        if (p.prod_settings) setProdSettings(p.prod_settings);
        if (p.prod_integrations) setIntegrations(p.prod_integrations);
      }
    });

    setCoachMessages([
      {
        id: `coach_init_${currentUserId}`,
        type: 'recommendation',
        message: `Welcome back ${profile.name || 'User'}! Your ATS Score is ${profile.atsScore || 0}%. Upload your latest resume to boost your job match score.`,
        actionText: 'View Resume Suite',
        actionTab: 'resume-suite',
        timestamp: 'Just now'
      }
    ]);
  }, [currentUserId]);

  // Persist User-Scoped Data
  useEffect(() => {
    if (currentUserId) UserService.setUserScopedData(currentUserId, 'tasks', tasks);
  }, [tasks, currentUserId]);

  useEffect(() => {
    if (currentUserId) UserService.setUserScopedData(currentUserId, 'recommendations', recommendations);
  }, [recommendations, currentUserId]);

  useEffect(() => {
    if (currentUserId) UserService.setUserScopedData(currentUserId, 'activities', activities);
  }, [activities, currentUserId]);

  useEffect(() => {
    if (currentUserId) UserService.setUserScopedData(currentUserId, 'applications', applications);
  }, [applications, currentUserId]);

  useEffect(() => {
    if (currentUserId) UserService.setUserScopedData(currentUserId, 'notifications', notifications);
  }, [notifications, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      ProductivityService.saveTasks(prodTasks, currentUserId);
      UserService.saveProductivityDataApi('prod_tasks', prodTasks);
    }
  }, [prodTasks, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      ProductivityService.saveNotes(prodNotes, currentUserId);
      UserService.saveProductivityDataApi('prod_notes', prodNotes);
    }
  }, [prodNotes, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      ProductivityService.saveGoals(prodGoals, currentUserId);
      UserService.saveProductivityDataApi('prod_goals', prodGoals);
    }
  }, [prodGoals, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      ProductivityService.saveFocusSessions(focusSessions, currentUserId);
      UserService.saveProductivityDataApi('prod_focus', focusSessions);
    }
  }, [focusSessions, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      ProductivityService.saveStreaks(streaks, currentUserId);
      UserService.saveProductivityDataApi('prod_streaks', streaks);
    }
  }, [streaks, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      ProductivityService.saveSettings(prodSettings, currentUserId);
      UserService.saveProductivityDataApi('prod_settings', prodSettings);
    }
  }, [prodSettings, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      ProductivityService.saveIntegrations(integrations, currentUserId);
      UserService.saveProductivityDataApi('prod_integrations', integrations);
    }
  }, [integrations, currentUserId]);

  const addNotification = (notif: { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'alert' }) => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: notif.title,
      message: notif.message,
      time: 'Just now',
      read: false,
      type: notif.type || 'info'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const pushCoachMessage = (msg: Omit<ProactiveCoachMessage, 'id' | 'timestamp'>) => {
    const newMsg: ProactiveCoachMessage = {
      ...msg,
      id: `coach_${Date.now()}`,
      timestamp: 'Just now'
    };
    setCoachMessages(prev => [newMsg, ...prev]);
  };

  // Workflow Handlers
  const uploadResume = async (fileText: string, fileName: string, parsedData?: any) => {
    setIsAnalyzingResume(true);
    const newVersionId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Single unified API call that parses, analyzes, scores, and matches jobs in one transaction
    const uploadRes = await UserService.uploadResumeApi({
      fileName,
      fileText,
      parsedData,
      versionId: newVersionId,
      versionName: fileName,
      score: 0
    });

    if (!uploadRes.success) {
      setIsAnalyzingResume(false);
      if (uploadRes.error === 'limit_reached') {
        const err = new Error('LIMIT_REACHED');
        (err as any).details = uploadRes.details;
        throw err;
      }
      throw new Error(uploadRes.error || 'Failed to upload resume. Please try again.');
    }

    let analysisResult: ResumeAnalysisResult = defaultResumeAnalysis;
    let newJobRecs: JobRecommendation[] = [];

    if (uploadRes?.analysisData && uploadRes.analysisData.overallScore > 0) {
      analysisResult = uploadRes.analysisData;
    }

    // The backend /api/auth/resume endpoint computes and returns job matches
    if ((uploadRes as any)?.jobRecommendations) {
      newJobRecs = (uploadRes as any).jobRecommendations;
    }

    setCurrentAnalysis(analysisResult);
    setActiveResumeVersionId(newVersionId);

    const newSkills = parsedData?.skills || analysisResult.keywordList?.filter(k => k.detected && k.foundInResume).map(k => k.keyword) || profile.skills;

    // 4. Construct new version object
    const newVersionObj: ResumeVersion = {
      id: newVersionId,
      versionName: fileName,
      uploadedAt: 'Just now',
      resumeText: fileText,
      content: fileText,
      parsedData: parsedData || {},
      score: analysisResult.overallScore || 0,
      template: 'modern_tech',
      fileName: fileName,
      fileSize: '184 KB',
      jobsMatchedCount: newJobRecs.length,
      analysisData: analysisResult
    };

    const updatedVersions = [newVersionObj, ...(profile.resumeVersions || []).map(v => ({ ...v, isPrimary: false }))];

    const updatedProfile: CentralCareerProfile = {
      ...profile,
      atsScore: analysisResult.overallScore || 0,
      skills: newSkills,
      resumeVersions: updatedVersions,
      primaryResumeText: fileText,
      activeResumeVersionId: newVersionId,
      targetRole: parsedData?.targetRole || profile.targetRole || "Software Engineer"
    };

    setProfile(updatedProfile);
    setRecommendations(newJobRecs);
    setIsAnalyzingResume(false);

    pushCoachMessage({
      type: 'success',
      message: `Resume analyzed successfully! ATS Score: ${analysisResult.overallScore}%. Job recommendations updated.`,
      actionText: 'View Analysis',
      actionTab: 'resume-suite'
    });
  };

  const switchActiveResumeVersion = async (versionId: string) => {
    const version = profile.resumeVersions?.find(v => v.id === versionId);
    if (!version) return;

    setActiveResumeVersionId(versionId);
    setIsAnalyzingResume(true);

    // Persist active version ID to user profile
    setProfile(prev => ({
      ...prev,
      activeResumeVersionId: versionId
    }));
    UserService.updateProfileApi({ activeResumeVersionId: versionId } as any);

    // 1. Fetch exact persisted job matches for this version from PostgreSQL
    let versionMatches: JobRecommendation[] = [];
    try {
      const persistedMatches = await UserService.getJobMatchesApi(versionId);
      if (persistedMatches && persistedMatches.length > 0) {
        versionMatches = persistedMatches;
      }
    } catch (e) {}

    // getJobMatchesApi already computes and persists matches on the backend if they are missing.
    // No need to hit a second endpoint to compute them again.    setRecommendations(versionMatches);

    // 2. Check for cached analysis
    let cachedAnalysis = (version as any).analysisData;
    if (typeof cachedAnalysis === 'string') {
      try { cachedAnalysis = JSON.parse(cachedAnalysis); } catch (e) { cachedAnalysis = null; }
    }
    if (cachedAnalysis && typeof cachedAnalysis === 'object' && cachedAnalysis.overallScore !== undefined && (cachedAnalysis.categoryScores?.length > 0 || cachedAnalysis.categoryBreakdown?.length > 0)) {
      setCurrentAnalysis(cachedAnalysis);
      setProfile(prev => ({
        ...prev,
        atsScore: cachedAnalysis.overallScore,
        primaryResumeText: version.resumeText || version.content || '',
        activeResumeVersionId: versionId
      }));
      setIsAnalyzingResume(false);
      return;
    }

    // 3. If not cached, run fresh ATS analysis
    let analysisResult: ResumeAnalysisResult | null = null;
    try {
      analysisResult = await AiProviderService.analyzeResume(version.resumeText || version.content || '', profile.targetRole || "Software Engineer", version.id);
    } catch (err) {
      console.error("Error analyzing version on switch:", err);
    }

    if (analysisResult) {
      setCurrentAnalysis(analysisResult);
      if (analysisResult.overallScore > 0) {
        UserService.updateResumeVersionScoreApi(version.id, analysisResult.overallScore, analysisResult);
      }
      setProfile(prev => {
        const updatedVersions = (prev.resumeVersions || []).map(v =>
          v.id === versionId ? { ...v, score: analysisResult!.overallScore || 0, analysisData: analysisResult } : v
        );
        return {
          ...prev,
          atsScore: analysisResult!.overallScore || 0,
          primaryResumeText: version.resumeText || version.content || '',
          activeResumeVersionId: versionId,
          resumeVersions: updatedVersions
        };
      });
    } else {
      setCurrentAnalysis(defaultResumeAnalysis);
      setProfile(prev => ({
        ...prev,
        atsScore: 0,
        primaryResumeText: version.resumeText || version.content || '',
        activeResumeVersionId: versionId
      }));
    }

    setIsAnalyzingResume(false);
  };

  const deleteResumeVersion = async (versionId: string) => {
    // Delete via API (removes from PostgreSQL resume_versions and job_matches)
    await UserService.deleteResumeVersionApi(versionId);

    const remainingVersions = (profile.resumeVersions || []).filter(v => v.id !== versionId);

    // If we deleted the active version, switch to the first remaining one
    if (activeResumeVersionId === versionId && remainingVersions.length > 0) {
      const nextVersion = remainingVersions[0];
      setActiveResumeVersionId(nextVersion.id);
      UserService.updateProfileApi({ activeResumeVersionId: nextVersion.id } as any);

      // Load job matches for the next version
      UserService.getJobMatchesApi(nextVersion.id).then(matches => {
        if (matches && matches.length > 0) {
          setRecommendations(matches);
        } else {
          const nextSkills = nextVersion.parsedData?.skills || profile.skills;
          UserService.matchResumeJobsApi({
            resumeVersionId: nextVersion.id,
            resumeText: nextVersion.resumeText || nextVersion.content || '',
            skills: nextSkills,
            targetRole: profile.targetRole || "Software Engineer"
          }).then(recs => {
            setRecommendations(recs || []);
          });
        }
      });

      const nextAnalysis = (nextVersion as any).analysisData;
      if (nextAnalysis && nextAnalysis.overallScore) {
        setCurrentAnalysis(nextAnalysis);
        setProfile(prev => ({
          ...prev,
          resumeVersions: remainingVersions,
          activeResumeVersionId: nextVersion.id,
          atsScore: nextAnalysis.overallScore
        }));
      } else {
        setCurrentAnalysis(defaultResumeAnalysis);
        setProfile(prev => ({
          ...prev,
          resumeVersions: remainingVersions,
          activeResumeVersionId: nextVersion.id,
          atsScore: nextVersion.score || 0
        }));
      }
    } else if (remainingVersions.length === 0) {
      // No resumes remain
      setActiveResumeVersionId('');
      setRecommendations([]);
      UserService.updateProfileApi({ activeResumeVersionId: '' } as any);
      setCurrentAnalysis(defaultResumeAnalysis);
      setProfile(prev => ({
        ...prev,
        resumeVersions: [],
        activeResumeVersionId: '',
        atsScore: 0,
        primaryResumeText: '',
        resumeText: ''
      }));
    } else {
      setProfile(prev => ({ ...prev, resumeVersions: remainingVersions }));
    }
  };

  const applyBulletSuggestion = (bulletText: string) => {
    setTasks(prev => [
      {
        id: `task_${Date.now()}`,
        title: `Applied ATS Bullet: "${bulletText.substring(0, 32)}..."`,
        tag: 'Applied',
        tagColor: '#0052ff',
        completed: true
      },
      ...prev
    ]);

    setProfile(prev => {
      const newScore = Math.min(99, prev.atsScore + 2);
      const updated = { ...prev, atsScore: newScore };
      updated.analytics = EmployabilityScoreService.calculateScores(updated);
      return updated;
    });

    pushCoachMessage({
      type: 'success',
      message: `Bullet point applied! Your ATS score increased by +2%.`,
      actionText: 'View Dashboard',
      actionTab: 'dashboard'
    });
  };

  const applyToJob = (job: { id: string; title: string; company: string; companyLogo?: string; location?: string; salary?: string }) => {
    UserService.saveJobApplicationApi({
      job_id: job.id,
      title: job.title,
      company: job.company,
      company_logo: job.companyLogo,
      location: job.location,
      salary: job.salary,
      status: 'applied',
      stage: 'Applied',
      applied_date: new Date().toISOString().split('T')[0]
    });

    const result = WorkflowEngine.handleJobApplied(
      profile,
      recommendations,
      applications,
      notifications,
      activities,
      tasks,
      job
    );

    setProfile(result.updatedProfile);
    setApplications(result.updatedApplications);
    setNotifications(result.updatedNotifications);
    setActivities(result.updatedActivities);
    setTasks(result.updatedTasks);
    setCalendarEvents(CalendarService.getEvents());

    if (result.newCoachMessage) {
      setCoachMessages(prev => [result.newCoachMessage!, ...prev]);
    }
  };

  const saveJob = (jobId: string) => {
    UserService.saveSavedJobApi(jobId, 'add');
    const job = recommendations.find(j => j.id === jobId);
    if (job) {
      AiMemoryService.recordJobInteraction('save', { title: job.title, company: job.company, tags: job.tags });
    }

    setProfile(prev => {
      const updatedSaved = Array.from(new Set([...(prev.savedJobIds || []), jobId]));
      const updated = { ...prev, savedJobIds: updatedSaved };
      updated.analytics = EmployabilityScoreService.calculateScores(updated);
      return updated;
    });

    pushCoachMessage({
      type: 'recommendation',
      message: `Job saved! We will track application deadlines and prepare interview materials for you.`,
      actionText: 'View Saved Jobs',
      actionTab: 'job-suite'
    });
  };

  const rejectJob = (jobId: string) => {
    const job = recommendations.find(j => j.id === jobId);
    if (job) {
      AiMemoryService.recordJobInteraction('reject', { title: job.title, company: job.company });
    }

    // Persist rejected/hidden job to database
    UserService.saveSavedJobApi(jobId, 'remove');

    setProfile(prev => ({
      ...prev,
      hiddenJobIds: Array.from(new Set([...(prev.hiddenJobIds || []), jobId]))
    }));

    setRecommendations(prev => prev.filter(j => j.id !== jobId));
  };

  const completeInterviewSession = (topic: string, score: number) => {
    UserService.saveInterviewSessionApi({ topic, score });
    setProfile(prev => {
      const metrics = prev.interviewMetrics || {
        mockScoreOverall: 80,
        technicalScore: 80,
        behavioralScore: 85,
        systemDesignScore: 75,
        strongTopics: [],
        weakTopics: [],
        completedSessionsCount: 0,
        solvedCodingCount: 0
      };

      const newMetrics = {
        ...metrics,
        mockScoreOverall: Math.round((metrics.mockScoreOverall * metrics.completedSessionsCount + score) / (metrics.completedSessionsCount + 1)),
        completedSessionsCount: metrics.completedSessionsCount + 1,
        strongTopics: score >= 85 ? Array.from(new Set([...metrics.strongTopics, topic])) : metrics.strongTopics
      };

      const updated = { ...prev, interviewMetrics: newMetrics };
      updated.analytics = EmployabilityScoreService.calculateScores(updated);
      return updated;
    });

    pushCoachMessage({
      type: 'success',
      message: `Mock interview completed with a score of ${score}%! Career Readiness score updated.`,
      actionText: 'View Scores',
      actionTab: 'dashboard'
    });
  };

  const completeCertification = (certName: string) => {
    const result = WorkflowEngine.handleCertificationCompleted(
      profile,
      recommendations,
      notifications,
      activities,
      certName
    );

    setProfile(result.updatedProfile);
    setRecommendations(result.updatedJobs);
    setNotifications(result.updatedNotifications);
    setActivities(result.updatedActivities);

    // Persist updated profile with new certification to database
    UserService.updateProfileApi({
      certifications: result.updatedProfile.certifications,
      certificationsEarned: result.updatedProfile.certificationsEarned
    } as any);

    if (result.newCoachMessage) {
      setCoachMessages(prev => [result.newCoachMessage!, ...prev]);
    }
  };

  const updateProfileDetails = (updated: Partial<CentralCareerProfile>) => {
    setProfile(prev => {
      const merged = { ...prev, ...updated };
      merged.analytics = EmployabilityScoreService.calculateScores(merged);
      return merged;
    });

    // Persist profile updates to PostgreSQL database
    UserService.updateProfileApi(updated as any);
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    CalendarService.addEvent(event);
    UserService.saveCalendarEventApi(event);
    setCalendarEvents(CalendarService.getEvents());

    // Generate notification for scheduled events
    const isInterview = event.type === 'interview' || event.type === 'mock_interview' || event.title.toLowerCase().includes('interview');
    if (isInterview) {
      addNotification({
        title: 'Interview tomorrow',
        message: `You have an interview scheduled for tomorrow: ${event.title} (${event.company || 'Google'}).`,
        type: 'warning'
      });
    } else {
      addNotification({
        title: 'Event Scheduled',
        message: `Scheduled event: ${event.title} on ${event.date || 'Tomorrow'}.`,
        type: 'info'
      });
    }
  };

  const updateCalendarEvent = (event: CalendarEvent) => {
    const updated = CalendarService.getEvents().map(e => e.id === event.id ? event : e);
    localStorage.setItem('hireflow_calendar_events_v1', JSON.stringify(updated));
    UserService.saveCalendarEventApi(event);
    setCalendarEvents(updated);
  };

  const deleteCalendarEvent = (id: string) => {
    UserService.deleteCalendarEventApi(id);
    const updated = CalendarService.getEvents().filter(e => e.id !== id);
    localStorage.setItem('hireflow_calendar_events_v1', JSON.stringify(updated));
    setCalendarEvents(updated);
  };

  const toggleCalendarEvent = (id: string) => {
    const updated = CalendarService.toggleEvent(id);
    setCalendarEvents(updated);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const navigateWithEcosystem = (tab: NavigationTab) => {
    onNavigateTab(tab);
  };

  // Productivity Actions
  const addProdTask = (task: Omit<ProductivityTask, 'id'>) => {
    const newTask: ProductivityTask = {
      ...task,
      id: `pt_${Date.now()}`
    };
    setProdTasks(prev => [newTask, ...prev]);
  };

  const updateProdTask = (task: ProductivityTask) => {
    setProdTasks(prev => prev.map(t => t.id === task.id ? task : t));
  };

  const deleteProdTask = (id: string) => {
    setProdTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleProdTask = (id: string) => {
    setProdTasks(prev => prev.map(t => {
      if (t.id === id) {
        const completed = !t.completed;
        return { ...t, completed, status: completed ? 'completed' : 'todo' };
      }
      return t;
    }));
    setStreaks(prev => ({ ...prev, completedTasksCount: prev.completedTasksCount + 1 }));
  };

  const addProdNote = (note: Omit<ProductivityNote, 'id' | 'updatedAt'>) => {
    const newNote: ProductivityNote = {
      ...note,
      id: `pn_${Date.now()}`,
      updatedAt: 'Just now'
    };
    setProdNotes(prev => [newNote, ...prev]);
  };

  const updateProdNote = (note: ProductivityNote) => {
    setProdNotes(prev => prev.map(n => n.id === note.id ? { ...note, updatedAt: 'Just now' } : n));
  };

  const deleteProdNote = (id: string) => {
    setProdNotes(prev => prev.filter(n => n.id !== id));
  };

  const toggleNotePin = (id: string) => {
    setProdNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const toggleNoteFav = (id: string) => {
    setProdNotes(prev => prev.map(n => n.id === id ? { ...n, favorite: !n.favorite } : n));
  };

  const toggleNoteArchive = (id: string) => {
    setProdNotes(prev => prev.map(n => n.id === id ? { ...n, archived: !n.archived } : n));
  };

  const addProdGoal = (goal: Omit<ProductivityGoal, 'id'>) => {
    const newGoal: ProductivityGoal = {
      ...goal,
      id: `pg_${Date.now()}`
    };
    setProdGoals(prev => [newGoal, ...prev]);
  };

  const updateProdGoal = (goal: ProductivityGoal) => {
    setProdGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  };

  const deleteProdGoal = (id: string) => {
    setProdGoals(prev => prev.filter(g => g.id !== id));
  };

  const incrementGoalProgress = (id: string, amount: number = 1) => {
    setProdGoals(prev => prev.map(g => {
      if (g.id === id) {
        const currentProgress = Math.min(g.targetProgress, g.currentProgress + amount);
        const completed = currentProgress >= g.targetProgress;
        return { ...g, currentProgress, completed };
      }
      return g;
    }));
  };

  const recordFocusSession = (mode: FocusSessionLog['mode'], durationMinutes: number) => {
    const newLog: FocusSessionLog = {
      id: `fs_${Date.now()}`,
      mode,
      durationMinutes,
      timestamp: 'Just now',
      completed: true
    };
    setFocusSessions(prev => [newLog, ...prev]);
    setStreaks(prev => ({
      ...prev,
      totalFocusHours: parseFloat((prev.totalFocusHours + durationMinutes / 60).toFixed(1)),
      productivityScore: Math.min(100, prev.productivityScore + 1)
    }));
    pushCoachMessage({
      type: 'success',
      message: `Completed ${durationMinutes} minutes Focus Mode session (${mode})! Great progress!`,
      actionTab: 'calendar'
    });
  };

  const generateAiDailySchedule = () => {
    addNotification({
      title: 'AI Daily Schedule (Coming Soon)',
      message: 'Real-time AI daily schedule generation and smart calendar sync will be available soon.',
      type: 'info'
    });
    pushCoachMessage({
      type: 'recommendation',
      message: 'AI Daily Schedule Generation feature coming soon in an upcoming update.',
      actionText: 'View Calendar',
      actionTab: 'calendar'
    });
  };

  const updateProdSettings = (settings: Partial<ProductivitySettings>) => {
    setProdSettings(prev => ({ ...prev, ...settings }));
  };

  const toggleIntegration = (key: keyof ThirdPartyIntegrationState) => {
    setIntegrations(prev => {
      const current = prev[key];
      return {
        ...prev,
        [key]: { ...current, connected: !current.connected }
      };
    });
  };

  const recordUsage = (type: 'resumeScans' | 'atsAnalyses' | 'aiInterviews' | 'coverLetterGenerations' | 'jobMatchAnalyses', amount: number = 1): boolean => {
    let isAllowed = true;
    setProfile(prev => {
      // Check trial expiration
      const trialInfo = calculateTrialRemaining(prev.trialStartDate, prev.trialExpiryDate);
      if (prev.subscriptionStatus === 'expired' || (prev.trialExpiryDate && trialInfo.isExpired)) {
        isAllowed = false;
        pushCoachMessage({
          type: 'alert',
          message: 'Your 3-Day Free Trial has ended. Please choose a subscription plan (Basic, Pro, or Premium) to continue using AI tools.',
          actionText: 'Select Plan',
          actionTab: 'pricing'
        });
        return { ...prev, subscriptionStatus: 'expired' };
      }

      const currentLimits = prev.usageLimits || {
        resumeScans: { used: 0, max: 3 },
        atsAnalyses: { used: 0, max: 3 },
        aiInterviews: { used: 0, max: 5 },
        coverLetterGenerations: { used: 0, max: 3 },
        jobMatchAnalyses: { used: 0, max: 5 }
      };

      const item = currentLimits[type] || { used: 0, max: 10 };
      const newUsed = item.used + amount;

      if (newUsed > item.max && item.max < 999) {
        isAllowed = false;
        pushCoachMessage({
          type: 'alert',
          message: `Limit reached: You've used all ${item.max} ${type.replace(/([A-Z])/g, ' $1').toLowerCase()} included in your plan.`,
          actionText: 'Upgrade Plan',
          actionTab: 'pricing'
        });
        return prev;
      }

      if (newUsed >= Math.floor(item.max * 0.8) && item.max < 999) {
        pushCoachMessage({
          type: 'recommendation',
          message: `Notice: You have used ${newUsed}/${item.max} of your monthly ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}. Upgrade to Pro for unlimited usage.`,
          actionText: 'Upgrade to Pro',
          actionTab: 'pricing'
        });
      }

      const updatedLimits = {
        ...currentLimits,
        [type]: { ...item, used: newUsed }
      };

      return { ...prev, usageLimits: updatedLimits };
    });

    return isAllowed;
  };

  const dailyBriefingData: DailyBriefingData = {
    greetingName: profile.name,
    newMatchingJobsCount: recommendations.filter(j => j.matchScore >= 85).length,
    atsScoreChange: 5,
    upcomingInterviewsCount: calendarEvents.filter(e => e.type === 'interview' && !e.completed).length,
    todaysLearningGoal: 'Complete Docker & System Design Caching module',
    weeklyProgressPercent: 78,
    dailyCareerInsight: `Candidates who quantify cost savings or latency improvements in their top 2 resume bullets see a 3x higher callback rate from tech companies.`
  };

  return (
    <EcosystemContext.Provider
      value={{
        profile,
        setProfile,
        tasks,
        setTasks,
        recommendations,
        setRecommendations,
        activities,
        setActivities,
        applications,
        setApplications,
        notifications,
        setNotifications,
        addNotification,
        calendarEvents,
        setCalendarEvents,
        prodTasks,
        setProdTasks,
        prodNotes,
        setProdNotes,
        prodGoals,
        setProdGoals,
        focusSessions,
        setFocusSessions,
        streaks,
        setStreaks,
        prodSettings,
        setProdSettings,
        integrations,
        setIntegrations,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isDailyBriefingOpen,
        setIsDailyBriefingOpen,
        coachMessages,
        pushCoachMessage,
        dailyBriefingData,
        currentAnalysis,
        setCurrentAnalysis,
        activeResumeVersionId,
        isAnalyzingResume,
        switchActiveResumeVersion,
        deleteResumeVersion,
        uploadResume,
        applyBulletSuggestion,
        applyToJob,
        saveJob,
        rejectJob,
        completeInterviewSession,
        completeCertification,
        updateProfileDetails,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        toggleCalendarEvent,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        navigateWithEcosystem,
        addProdTask,
        updateProdTask,
        deleteProdTask,
        toggleProdTask,
        addProdNote,
        updateProdNote,
        deleteProdNote,
        toggleNotePin,
        toggleNoteFav,
        toggleNoteArchive,
        addProdGoal,
        updateProdGoal,
        deleteProdGoal,
        incrementGoalProgress,
        recordFocusSession,
        generateAiDailySchedule,
        updateProdSettings,
        toggleIntegration,
        recordUsage
      }}
    >
      {children}
    </EcosystemContext.Provider>
  );
};

export const useEcosystem = () => {
  const context = useContext(EcosystemContext);
  if (!context) {
    throw new Error('useEcosystem must be used within an EcosystemProvider');
  }
  return context;
};
