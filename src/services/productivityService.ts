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
    return UserService.getUserScopedData<ProductivityTask[]>(uid, 'prod_tasks', []);
  }

  public static saveTasks(tasks: ProductivityTask[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    UserService.setUserScopedData(uid, 'prod_tasks', tasks);
  }

  // --- NOTES ---
  public static getNotes(userId?: string): ProductivityNote[] {
    const uid = userId || this.getActiveUserId();
    return UserService.getUserScopedData<ProductivityNote[]>(uid, 'prod_notes', []);
  }

  public static saveNotes(notes: ProductivityNote[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    UserService.setUserScopedData(uid, 'prod_notes', notes);
  }

  // --- GOALS ---
  public static getGoals(userId?: string): ProductivityGoal[] {
    const uid = userId || this.getActiveUserId();
    return UserService.getUserScopedData<ProductivityGoal[]>(uid, 'prod_goals', []);
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
      learningStreakDays: 0,
      interviewStreakDays: 0,
      applicationStreakDays: 0,
      totalStudyHours: 0,
      totalFocusHours: 0,
      completedTasksCount: 0,
      productivityScore: 0
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
    return [];
  }
}
