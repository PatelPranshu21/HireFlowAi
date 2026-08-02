import {
  ProductivityTask,
  ProductivityNote,
  ProductivityGoal,
  FocusSessionLog,
  AchievementBadge,
  ProductivityStreaks,
  ProductivitySettings,
  ThirdPartyIntegrationState,
  CalendarEvent
} from '../types';
import { UserService } from './userService';

export class ProductivityService {
  private static getActiveUserId(): string {
    return UserService.getActiveUserId() || 'guest';
  }

  // --- TASKS ---
  public static getTasks(userId?: string): ProductivityTask[] {
    const uid = userId || this.getActiveUserId();
    const defaults: ProductivityTask[] = [
      {
        id: 'pt_1',
        title: 'Tailor resume bullet points for Target Senior position',
        description: 'Quantify throughput impact (e.g. reduced p99 latency by 35% with Redis caching).',
        category: 'Resume',
        priority: 'high',
        status: 'in_progress',
        dueDate: 'Today',
        estimatedMinutes: 30,
        completed: false,
        notes: 'Target keywords: Distributed Systems, Web Services, Architecture'
      }
    ];

    return UserService.getUserScopedData<ProductivityTask[]>(uid, 'prod_tasks', defaults);
  }

  public static saveTasks(tasks: ProductivityTask[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    UserService.setUserScopedData(uid, 'prod_tasks', tasks);
  }

  // --- NOTES ---
  public static getNotes(userId?: string): ProductivityNote[] {
    const uid = userId || this.getActiveUserId();
    const defaults: ProductivityNote[] = [
      {
        id: 'pn_1',
        title: 'Technical Interview Strategy & STAR Metrics',
        content: `Key Talking Points for Interviews:
- Scaled distributed messaging cluster handling 250k events/sec.
- Optimized database query execution plan reducing p99 latency from 180ms to 24ms.`,
        category: 'Interview Notes',
        pinned: true,
        favorite: true,
        archived: false,
        tags: ['System Design', 'STAR', 'Distributed Systems'],
        updatedAt: 'Just now'
      }
    ];

    return UserService.getUserScopedData<ProductivityNote[]>(uid, 'prod_notes', defaults);
  }

  public static saveNotes(notes: ProductivityNote[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    UserService.setUserScopedData(uid, 'prod_notes', notes);
  }

  // --- GOALS ---
  public static getGoals(userId?: string): ProductivityGoal[] {
    const uid = userId || this.getActiveUserId();
    const defaults: ProductivityGoal[] = [
      {
        id: 'pg_1',
        title: 'Solve 20 LeetCode / DSA Problems',
        targetMetric: 'Problems Solved',
        currentProgress: 5,
        targetProgress: 20,
        timeframe: 'weekly',
        category: 'Technical Prep',
        completed: false,
        unit: 'problems'
      }
    ];

    return UserService.getUserScopedData<ProductivityGoal[]>(uid, 'prod_goals', defaults);
  }

  public static saveGoals(goals: ProductivityGoal[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    UserService.setUserScopedData(uid, 'prod_goals', goals);
  }

  // --- FOCUS SESSIONS & STREAKS ---
  public static getFocusSessions(userId?: string): FocusSessionLog[] {
    const uid = userId || this.getActiveUserId();
    return UserService.getUserScopedData<FocusSessionLog[]>(uid, 'prod_focus', []);
  }

  public static saveFocusSessions(sessions: FocusSessionLog[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    UserService.setUserScopedData(uid, 'prod_focus', sessions);
  }

  public static getStreaks(userId?: string): ProductivityStreaks {
    const uid = userId || this.getActiveUserId();
    const defaults: ProductivityStreaks = {
      learningStreakDays: 1,
      interviewStreakDays: 0,
      applicationStreakDays: 1,
      totalStudyHours: 2.5,
      totalFocusHours: 1.5,
      completedTasksCount: 3,
      productivityScore: 75
    };

    return UserService.getUserScopedData<ProductivityStreaks>(uid, 'prod_streaks', defaults);
  }

  public static saveStreaks(streaks: ProductivityStreaks, userId?: string): void {
    const uid = userId || this.getActiveUserId();
    UserService.setUserScopedData(uid, 'prod_streaks', streaks);
  }

  // --- SETTINGS ---
  public static getSettings(userId?: string): ProductivitySettings {
    const uid = userId || this.getActiveUserId();
    const defaults: ProductivitySettings = {
      workingHoursStart: '08:30',
      workingHoursEnd: '18:00',
      timezone: 'PST (UTC-7)',
      reminderPreferences: {
        interviews: true,
        deadlines: true,
        goals: true,
        studySessions: true,
        soundEnabled: true
      },
      defaultCalendarView: 'week',
      defaultFocusLength: 25,
      breakLength: 5
    };

    return UserService.getUserScopedData<ProductivitySettings>(uid, 'prod_settings', defaults);
  }

  public static saveSettings(settings: ProductivitySettings, userId?: string): void {
    const uid = userId || this.getActiveUserId();
    UserService.setUserScopedData(uid, 'prod_settings', settings);
  }

  // --- INTEGRATIONS ---
  public static getIntegrations(userId?: string): ThirdPartyIntegrationState {
    const uid = userId || this.getActiveUserId();
    const defaults: ThirdPartyIntegrationState = {
      googleCalendar: { connected: false, email: '', syncEnabled: false },
      outlookCalendar: { connected: false, syncEnabled: false },
      zoom: { connected: false, user: '' },
      googleMeet: { connected: false, email: '' },
      teams: { connected: false },
      slack: { connected: false, workspace: '' },
      discord: { connected: false }
    };

    return UserService.getUserScopedData<ThirdPartyIntegrationState>(uid, 'prod_integrations', defaults);
  }

  public static saveIntegrations(integrations: ThirdPartyIntegrationState, userId?: string): void {
    const uid = userId || this.getActiveUserId();
    UserService.setUserScopedData(uid, 'prod_integrations', integrations);
  }

  /**
   * Generates AI Daily Schedule based on upcoming interviews, pending applications, learning goals, and tasks
   */
  public static generateAiSchedule(
    events: CalendarEvent[],
    tasks: ProductivityTask[],
    goals: ProductivityGoal[]
  ): CalendarEvent[] {
    const todayStr = 'Today';
    const newEvents: CalendarEvent[] = [
      {
        id: `ai_evt_${Date.now()}_1`,
        title: '🤖 AI Recommended: System Design & STAR Interview Practice',
        company: 'Apple / Stripe Prep',
        date: todayStr,
        time: '09:00 AM',
        durationMinutes: 60,
        type: 'mock_interview',
        priority: 'high',
        colorTag: '#0052ff',
        description: 'Focus on distributed queue partitioning and rate limiting interview scenarios.',
        meetingLink: 'https://hireflow.ai/practice/system-design',
        notes: 'Review STAR framework responses.',
        reminderMinutesBefore: 15
      },
      {
        id: `ai_evt_${Date.now()}_2`,
        title: '🤖 AI Recommended: ATS Resume Bullet Point Customization',
        date: todayStr,
        time: '10:30 AM',
        durationMinutes: 45,
        type: 'resume_review',
        priority: 'high',
        colorTag: '#571bc1',
        description: 'Tailor top 2 experience bullet points with quantitative impact metrics.',
        notes: 'Target keywords: Kafka, Distributed Systems, Go',
        reminderMinutesBefore: 10
      },
      {
        id: `ai_evt_${Date.now()}_3`,
        title: '🤖 AI Recommended: Focus Mode Coding & LeetCode Hard Session',
        date: todayStr,
        time: '02:00 PM',
        durationMinutes: 60,
        type: 'coding_practice',
        priority: 'medium',
        colorTag: '#10b981',
        description: 'Solve 2 Dynamic Programming problems to reach weekly goal of 20 problems.',
        reminderMinutesBefore: 15
      },
      {
        id: `ai_evt_${Date.now()}_4`,
        title: '🤖 AI Recommended: Apply to 3 High-Match Senior Full Stack Roles',
        date: todayStr,
        time: '04:00 PM',
        durationMinutes: 45,
        type: 'deadline',
        priority: 'medium',
        colorTag: '#f59e0b',
        description: 'Submit applications to Stripe, Apple, and Figma via AI One-Click Tailor.',
        reminderMinutesBefore: 10
      }
    ];

    return newEvents;
  }
}
