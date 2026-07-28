import React, { createContext, useContext, useState, useEffect } from 'react';
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
  ThirdPartyIntegrationState
} from '../types';
import { initialUserProfile, initialTasks, initialJobRecommendations, initialActivityLogs, sampleNotifications } from '../data/mockData';
import { WorkflowEngine } from '../services/workflowEngine';
import { CalendarService } from '../services/calendarService';
import { AiMemoryService } from '../services/aiMemoryService';
import { EmployabilityScoreService } from '../services/employabilityScoreService';
import { ProductivityService } from '../services/productivityService';

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

  // Actions
  uploadResume: (fileText: string, fileName: string) => void;
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
  const [profile, setProfile] = useState<CentralCareerProfile>(() => {
    try {
      const saved = localStorage.getItem('hireflow_central_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialUserProfile;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>(initialJobRecommendations);
  const [activities, setActivities] = useState<ActivityLog[]>(initialActivityLogs);
  const [applications, setApplications] = useState<ApplicationCard[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(sampleNotifications);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => CalendarService.getEvents());

  // Productivity & Collaboration State
  const [prodTasks, setProdTasks] = useState<ProductivityTask[]>(() => ProductivityService.getTasks());
  const [prodNotes, setProdNotes] = useState<ProductivityNote[]>(() => ProductivityService.getNotes());
  const [prodGoals, setProdGoals] = useState<ProductivityGoal[]>(() => ProductivityService.getGoals());
  const [focusSessions, setFocusSessions] = useState<FocusSessionLog[]>(() => ProductivityService.getFocusSessions());
  const [streaks, setStreaks] = useState<ProductivityStreaks>(() => ProductivityService.getStreaks());
  const [prodSettings, setProdSettings] = useState<ProductivitySettings>(() => ProductivityService.getSettings());
  const [integrations, setIntegrations] = useState<ThirdPartyIntegrationState>(() => ProductivityService.getIntegrations());

  // Modals & Coach
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isDailyBriefingOpen, setIsDailyBriefingOpen] = useState(false);
  const [coachMessages, setCoachMessages] = useState<ProactiveCoachMessage[]>([
    {
      id: 'coach_init_1',
      type: 'recommendation',
      message: `Welcome back ${profile.name}! Your ATS Score is ${profile.atsScore}%. Mastering Docker could boost your job match score by +8%.`,
      actionText: 'View Career Roadmap',
      actionTab: 'career-tools',
      timestamp: 'Just now'
    },
    {
      id: 'coach_init_2',
      type: 'milestone',
      message: `You have 1 upcoming technical interview scheduled for tomorrow at Apple.`,
      actionText: 'Practice Mock Interview',
      actionTab: 'interviews',
      timestamp: '5 min ago'
    }
  ]);

  // Persist Central Career Profile
  useEffect(() => {
    try {
      localStorage.setItem('hireflow_central_profile_v1', JSON.stringify(profile));
    } catch (e) {}
  }, [profile]);

  // Sync Calendar Events state
  useEffect(() => {
    setCalendarEvents(CalendarService.getEvents());
  }, []);

  // Persist Productivity Data
  useEffect(() => { ProductivityService.saveTasks(prodTasks); }, [prodTasks]);
  useEffect(() => { ProductivityService.saveNotes(prodNotes); }, [prodNotes]);
  useEffect(() => { ProductivityService.saveGoals(prodGoals); }, [prodGoals]);
  useEffect(() => { ProductivityService.saveFocusSessions(focusSessions); }, [focusSessions]);
  useEffect(() => { ProductivityService.saveStreaks(streaks); }, [streaks]);
  useEffect(() => { ProductivityService.saveSettings(prodSettings); }, [prodSettings]);
  useEffect(() => { ProductivityService.saveIntegrations(integrations); }, [integrations]);

  const pushCoachMessage = (msg: Omit<ProactiveCoachMessage, 'id' | 'timestamp'>) => {
    const newMsg: ProactiveCoachMessage = {
      ...msg,
      id: `coach_${Date.now()}`,
      timestamp: 'Just now'
    };
    setCoachMessages(prev => [newMsg, ...prev]);
  };

  // Workflow Handlers
  const uploadResume = (fileText: string, fileName: string) => {
    const result = WorkflowEngine.handleResumeUpdated(
      profile,
      recommendations,
      applications,
      notifications,
      activities,
      tasks,
      fileText,
      fileName
    );

    setProfile(result.updatedProfile);
    setRecommendations(result.updatedJobs);
    setNotifications(result.updatedNotifications);
    setActivities(result.updatedActivities);
    setTasks(result.updatedTasks);

    if (result.newCoachMessage) {
      setCoachMessages(prev => [result.newCoachMessage!, ...prev]);
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

    setProfile(prev => ({
      ...prev,
      hiddenJobIds: Array.from(new Set([...(prev.hiddenJobIds || []), jobId]))
    }));

    setRecommendations(prev => prev.filter(j => j.id !== jobId));
  };

  const completeInterviewSession = (topic: string, score: number) => {
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
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    CalendarService.addEvent(event);
    setCalendarEvents(CalendarService.getEvents());
  };

  const updateCalendarEvent = (event: CalendarEvent) => {
    const updated = CalendarService.getEvents().map(e => e.id === event.id ? event : e);
    localStorage.setItem('hireflow_calendar_events_v1', JSON.stringify(updated));
    setCalendarEvents(updated);
  };

  const deleteCalendarEvent = (id: string) => {
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
    const generated = ProductivityService.generateAiSchedule(calendarEvents, prodTasks, prodGoals);
    generated.forEach(evt => CalendarService.addEvent(evt));
    setCalendarEvents(CalendarService.getEvents());
    pushCoachMessage({
      type: 'recommendation',
      message: `AI Daily Schedule generated with 4 prioritized focus slots! Check your Smart Calendar.`,
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
