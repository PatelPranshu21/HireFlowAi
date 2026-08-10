import { UserProfile } from '../types';
import { initialUserProfile } from '../data/mockData';

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
  profile: UserProfile;
  onboardingCompleted?: boolean;
}

const USER_DB_KEY = 'hireflow_user_database_v2';
const ACTIVE_USER_ID_KEY = 'hireflow_active_user_id_v2';
const AUTH_TOKEN_KEY = 'hireflow_auth_token_v2';

export class UserService {
  public static getAuthToken(): string | null {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  public static setAuthToken(token: string): void {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (e) {}
  }

  public static clearAuthToken(): void {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (e) {}
  }

  // --- ASYNC API INTEGRATION WITH BACKEND (POSTGRESQL / SERVER) ---

  public static async registerUserApi(data: { name: string; email: string; password: string }): Promise<{
    success: boolean;
    user?: StoredUserAccount;
    token?: string;
    onboardingCompleted?: boolean;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Signup failed' };
      }

      if (json.token) {
        this.setAuthToken(json.token);
      }

      const account: StoredUserAccount = {
        id: json.user.id,
        name: `${json.user.firstName || ''} ${json.user.lastName || ''}`.trim() || data.name,
        email: json.user.email,
        createdAt: new Date().toISOString(),
        profile: json.user.profile,
        onboardingCompleted: json.user.onboardingCompleted
      };

      this.setActiveUserId(account.id);
      this.saveLocalAccount(account);

      return {
        success: true,
        user: account,
        token: json.token,
        onboardingCompleted: json.user.onboardingCompleted
      };
    } catch (err: any) {
      // Fallback local registration if server unreachable
      return this.registerUser(data);
    }
  }

  public static async loginUserApi(data: { email: string; password: string }): Promise<{
    success: boolean;
    user?: StoredUserAccount;
    token?: string;
    onboardingCompleted?: boolean;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Invalid credentials' };
      }

      if (json.token) {
        this.setAuthToken(json.token);
      }

      const account: StoredUserAccount = {
        id: json.user.id,
        name: `${json.user.firstName || ''} ${json.user.lastName || ''}`.trim() || json.user.email,
        email: json.user.email,
        createdAt: new Date().toISOString(),
        profile: json.user.profile,
        onboardingCompleted: json.user.onboardingCompleted
      };

      this.setActiveUserId(account.id);
      this.saveLocalAccount(account);

      return {
        success: true,
        user: account,
        token: json.token,
        onboardingCompleted: json.user.onboardingCompleted
      };
    } catch (err: any) {
      return this.authenticateUser(data);
    }
  }

  public static async getCurrentUserApi(): Promise<{
    success: boolean;
    user?: StoredUserAccount;
    onboardingCompleted?: boolean;
    error?: string;
  }> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/me', { headers });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to authenticate user' };
      }

      const account: StoredUserAccount = {
        id: json.user.id,
        name: `${json.user.firstName || ''} ${json.user.lastName || ''}`.trim() || json.user.email,
        email: json.user.email,
        createdAt: new Date().toISOString(),
        profile: json.user.profile,
        onboardingCompleted: json.user.onboardingCompleted
      };

      this.setActiveUserId(account.id);
      this.saveLocalAccount(account);

      return {
        success: true,
        user: account,
        onboardingCompleted: json.user.onboardingCompleted
      };
    } catch (err: any) {
      // Fallback to active user in localStorage
      const activeId = this.getActiveUserId();
      if (activeId) {
        const local = this.getUserById(activeId);
        if (local) {
          return {
            success: true,
            user: local,
            onboardingCompleted: Boolean(local.profile.hasCompletedOnboarding)
          };
        }
      }
      return { success: false, error: 'User session not found' };
    }
  }

  public static async saveOnboardingApi(onboardingData: Partial<UserProfile>): Promise<{
    success: boolean;
    profile?: UserProfile;
    error?: string;
  }> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers,
        body: JSON.stringify(onboardingData)
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to save onboarding data' };
      }

      const activeId = this.getActiveUserId();
      if (activeId) {
        this.updateUserProfile(activeId, {
          ...onboardingData,
          hasCompletedOnboarding: true
        });
      }

      return {
        success: true,
        profile: json.user?.profile || onboardingData as UserProfile
      };
    } catch (err: any) {
      const activeId = this.getActiveUserId();
      if (activeId) {
        const updated = this.updateUserProfile(activeId, {
          ...onboardingData,
          hasCompletedOnboarding: true
        });
        return { success: true, profile: updated || undefined };
      }
      return { success: false, error: 'Failed to update onboarding locally' };
    }
  }

  public static async updateProfileApi(profileUpdates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileUpdates)
      });
      const json = await res.json();

      const activeId = this.getActiveUserId();
      if (activeId) {
        this.updateUserProfile(activeId, profileUpdates);
      }

      return json.profile || null;
    } catch (err: any) {
      const activeId = this.getActiveUserId();
      if (activeId) {
        return this.updateUserProfile(activeId, profileUpdates);
      }
      return null;
    }
  }

  public static async logoutApi(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    this.clearAuthToken();
    this.clearActiveSession();
  }

  // --- LOCALSTORAGE CACHE / FALLBACK HELPERS ---

  private static getUsersMap(): Record<string, StoredUserAccount> {
    try {
      const stored = localStorage.getItem(USER_DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {}

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
        createdAt: now,
        profile: defaultDemoProfile,
        onboardingCompleted: true
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
    } catch (e) {}
  }

  private static saveLocalAccount(account: StoredUserAccount): void {
    const map = this.getUsersMap();
    map[account.id] = account;
    this.saveUsersMap(map);
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
      createdAt: now,
      profile: newProfile,
      onboardingCompleted: false
    };

    const map = this.getUsersMap();
    map[userId] = newUserRecord;
    this.saveUsersMap(map);

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
      profile: updatedProfile,
      onboardingCompleted: updatedProfile.hasCompletedOnboarding
    };

    this.saveUsersMap(map);
    return updatedProfile;
  }

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
      localStorage.removeItem(AUTH_TOKEN_KEY);
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
