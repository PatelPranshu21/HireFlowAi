import { UserProfile } from '../types';
import { initialUserProfile, initialTasks, initialJobRecommendations, initialActivityLogs } from '../data/mockData';

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  profile: UserProfile;
}

const USER_DB_KEY = 'hireflow_user_database_v2';
const ACTIVE_USER_ID_KEY = 'hireflow_active_user_id_v2';

export class UserService {
  // Initialize user DB with standard demo accounts if empty
  private static getUsersMap(): Record<string, StoredUserAccount> {
    try {
      const stored = localStorage.getItem(USER_DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load user DB from localStorage', e);
    }

    // Seed default demo accounts
    const now = new Date().toISOString();
    const defaultDemoProfile: UserProfile = {
      ...initialUserProfile,
      id: 'usr_demo_1',
      name: 'Parnshu Patel',
      email: 'pranshupatel3222@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Parnshu%20Patel',
      tier: 'Gold Tier',
      subscriptionPlan: 'Pro',
      subscriptionStatus: 'active',
      hasSelectedPlan: true,
      hasCompletedOnboarding: true,
      appliedJobIds: [],
      savedJobIds: [],
      atsScore: 88
    };

    const initialMap: Record<string, StoredUserAccount> = {
      'usr_demo_1': {
        id: 'usr_demo_1',
        name: 'Parnshu Patel',
        email: 'pranshupatel3222@gmail.com',
        passwordHash: 'password123',
        createdAt: now,
        profile: defaultDemoProfile
      }
    };

    try {
      localStorage.setItem(USER_DB_KEY, JSON.stringify(initialMap));
    } catch (e) {}

    return initialMap;
  }

  private static saveUsersMap(map: Record<string, StoredUserAccount>): void {
    try {
      localStorage.setItem(USER_DB_KEY, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save user DB', e);
    }
  }

  public static getUsers(): StoredUserAccount[] {
    const map = this.getUsersMap();
    return Object.values(map);
  }

  public static getUserById(userId: string): StoredUserAccount | null {
    const map = this.getUsersMap();
    return map[userId] || null;
  }

  public static findUserByEmail(email: string): StoredUserAccount | null {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const map = this.getUsersMap();
    for (const id in map) {
      if (map[id].email.trim().toLowerCase() === cleanEmail) {
        return map[id];
      }
    }
    return null;
  }

  public static registerUser(data: { name: string; email: string; password: string }): {
    success: boolean;
    user?: StoredUserAccount;
    error?: string;
  } {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();

    // Check if account already exists
    const existing = this.findUserByEmail(cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in.'
      };
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newProfile: UserProfile = {
      ...initialUserProfile,
      id: userId,
      name: cleanName,
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
      title: 'Candidate / Engineer',
      experienceLevel: 'Mid Level',
      education: [],
      experience: [],
      tier: 'Free',
      subscriptionPlan: 'None',
      subscriptionStatus: 'none',
      trialStartDate: undefined,
      trialExpiryDate: undefined,
      hasSelectedPlan: false,
      hasCompletedOnboarding: false,
      skills: [],
      technologies: [],
      projects: [],
      certifications: [],
      languages: ['English'],
      targetRole: 'Software Engineer',
      preferences: {
        preferredRoles: ['Software Engineer'],
        preferredCompanies: [],
        preferredCities: ['Remote'],
        remotePreference: 'Remote',
        expectedSalaryMin: 120000,
        expectedSalaryMax: 180000,
        experienceLevel: 'Mid Level',
        preferredTechnologies: ['React', 'TypeScript'],
        preferredIndustries: ['Technology']
      },
      learningRoadmap: [],
      learningProgress: [],
      skillsLearned: [],
      coursesCompleted: [],
      certificationsEarned: [],
      atsScore: 0,
      resumeVersions: [],
      resumeHistory: [],
      interviewMetrics: {
        mockScoreOverall: 0,
        technicalScore: 0,
        behavioralScore: 0,
        systemDesignScore: 0,
        strongTopics: [],
        weakTopics: [],
        completedSessionsCount: 0,
        solvedCodingCount: 0
      },
      savedJobIds: [],
      appliedJobIds: [],
      hiddenJobIds: [],
      rejectedJobIds: [],
      analytics: {
        employabilityScore: 0,
        careerReadinessScore: 0,
        aiMatchScore: 0,
        strengths: [],
        weaknesses: [],
        priorityImprovements: []
      },
      usageLimits: {
        resumeScans: { used: 0, max: 3 },
        atsAnalyses: { used: 0, max: 3 },
        aiInterviews: { used: 0, max: 5 },
        coverLetterGenerations: { used: 0, max: 3 },
        jobMatchAnalyses: { used: 0, max: 5 }
      }
    };

    const newUserRecord: StoredUserAccount = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash: data.password,
      createdAt: now,
      profile: newProfile
    };

    const map = this.getUsersMap();
    map[userId] = newUserRecord;
    this.saveUsersMap(map);

    // Set active session
    this.setActiveUserId(userId);

    return {
      success: true,
      user: newUserRecord
    };
  }

  public static authenticateUser(data: { email: string; password?: string }): {
    success: boolean;
    user?: StoredUserAccount;
    error?: string;
  } {
    const cleanEmail = data.email.trim().toLowerCase();
    let account = this.findUserByEmail(cleanEmail);

    if (!account) {
      // Create user on demand for first time login if it doesn't exist
      const derivedName = cleanEmail.split('@')[0]
        .split(/[._-]/)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

      const reg = this.registerUser({
        name: derivedName || 'User',
        email: cleanEmail,
        password: data.password || 'password123'
      });

      if (!reg.success || !reg.user) {
        return { success: false, error: reg.error || 'Authentication failed' };
      }
      account = reg.user;
    } else if (data.password) {
      // Update password hash for existing account if provided
      const map = this.getUsersMap();
      if (map[account.id]) {
        map[account.id].passwordHash = data.password;
        this.saveUsersMap(map);
        account.passwordHash = data.password;
      }
    }

    this.setActiveUserId(account.id);
    return {
      success: true,
      user: account
    };
  }

  public static updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    if (!userId) return null;
    const map = this.getUsersMap();
    const account = map[userId];
    if (!account) return null;

    const updatedProfile: UserProfile = {
      ...account.profile,
      ...updates
    };

    map[userId] = {
      ...account,
      name: updatedProfile.name || account.name,
      profile: updatedProfile
    };

    this.saveUsersMap(map);
    return updatedProfile;
  }

  // Active Session Management
  public static getActiveUserId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_USER_ID_KEY);
    } catch (e) {
      return null;
    }
  }

  public static setActiveUserId(userId: string): void {
    try {
      localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
    } catch (e) {}
  }

  public static clearActiveSession(): void {
    try {
      localStorage.removeItem(ACTIVE_USER_ID_KEY);
    } catch (e) {}
  }

  // User-Scoped Storage Helpers
  public static getUserScopedData<T>(userId: string, key: string, fallback: T): T {
    if (!userId) return fallback;
    try {
      const stored = localStorage.getItem(`hireflow_user_${userId}_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed !== undefined && parsed !== null) return parsed;
      }
    } catch (e) {}
    return fallback;
  }

  public static setUserScopedData<T>(userId: string, key: string, value: T): void {
    if (!userId) return;
    try {
      localStorage.setItem(`hireflow_user_${userId}_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save user scoped data for ${key}`, e);
    }
  }
}
