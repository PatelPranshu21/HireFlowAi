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

      const rawName = `${json.user.firstName || ''} ${json.user.lastName || ''}`.trim() || data.name;
      const accountProfile = {
        ...(json.user.profile || {}),
        name: (json.user.profile?.name && json.user.profile.name !== 'Candidate') ? json.user.profile.name : rawName,
        hasCompletedOnboarding: Boolean(json.user.onboardingCompleted)
      };

      const account: StoredUserAccount = {
        id: json.user.id,
        name: rawName,
        email: json.user.email,
        createdAt: new Date().toISOString(),
        profile: accountProfile,
        onboardingCompleted: Boolean(json.user.onboardingCompleted)
      };

      this.setActiveUserId(account.id);
      this.saveLocalAccount(account);

      return {
        success: true,
        user: account,
        token: json.token,
        onboardingCompleted: Boolean(json.user.onboardingCompleted)
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

      const rawName = `${json.user.firstName || ''} ${json.user.lastName || ''}`.trim() || json.user.profile?.name || json.user.email;
      const accountProfile = {
        ...(json.user.profile || {}),
        name: (json.user.profile?.name && json.user.profile.name !== 'Candidate') ? json.user.profile.name : rawName,
        hasCompletedOnboarding: Boolean(json.user.onboardingCompleted)
      };

      const account: StoredUserAccount = {
        id: json.user.id,
        name: rawName,
        email: json.user.email,
        createdAt: new Date().toISOString(),
        profile: accountProfile,
        onboardingCompleted: Boolean(json.user.onboardingCompleted)
      };

      this.setActiveUserId(account.id);
      this.saveLocalAccount(account);

      return {
        success: true,
        user: account,
        token: json.token,
        onboardingCompleted: Boolean(json.user.onboardingCompleted)
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

      const rawName = `${json.user.firstName || ''} ${json.user.lastName || ''}`.trim() || json.user.profile?.name || json.user.email;
      const accountProfile = {
        ...(json.user.profile || {}),
        name: (json.user.profile?.name && json.user.profile.name !== 'Candidate') ? json.user.profile.name : rawName,
        hasCompletedOnboarding: Boolean(json.user.onboardingCompleted)
      };

      const account: StoredUserAccount = {
        id: json.user.id,
        name: rawName,
        email: json.user.email,
        createdAt: new Date().toISOString(),
        profile: accountProfile,
        onboardingCompleted: Boolean(json.user.onboardingCompleted)
      };

      this.setActiveUserId(account.id);
      this.saveLocalAccount(account);

      return {
        success: true,
        user: account,
        onboardingCompleted: Boolean(json.user.onboardingCompleted)
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

  public static async fetchUserDataApi(): Promise<any> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/data', { headers });
      const json = await res.json();
      if (res.ok && json.success) {
        return json.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user data API:', err);
      return null;
    }
  }

  public static async uploadResumeApi(payload: {
    fileName: string;
    fileText: string;
    parsedData?: any;
    score?: number;
    template?: string;
    versionId?: string;
    versionName?: string;
    analysisData?: any;
  }): Promise<{ success: boolean; analysisData?: any; score?: number; jobRecommendations?: any[]; error?: string; details?: any }> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/resume', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      return { 
        success: res.ok && json.success !== false, 
        analysisData: json.analysisData, 
        score: json.score,
        jobRecommendations: json.jobRecommendations,
        error: json.error,
        details: json.details
      };
    } catch (err) {
      console.error('Error uploading resume API:', err);
      return { success: false };
    }
  }

  public static async deleteResumeVersionApi(versionId: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/auth/resume-version/${encodeURIComponent(versionId)}`, {
        method: 'DELETE',
        headers
      });
      return res.ok;
    } catch (err) {
      console.error('Error deleting resume version API:', err);
      return false;
    }
  }

  public static async updateResumeVersionScoreApi(versionId: string, score: number, analysisData?: any): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/auth/resume-version/${encodeURIComponent(versionId)}/score`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ score, analysisData })
      });
      return res.ok;
    } catch (err) {
      console.error('Error updating resume version score API:', err);
      return false;
    }
  }

  public static async matchResumeJobsApi(payload: {
    resumeVersionId?: string;
    resumeText: string;
    skills?: string[];
    targetRole?: string;
  }): Promise<any[] | null> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/jobs/match-resume', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data.recommendations;
      }
      return null;
    } catch (err) {
      console.error('Error in matchResumeJobsApi:', err);
      return null;
    }
  }

  public static async getJobMatchesApi(resumeVersionId: string): Promise<any[] | null> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/jobs/matches/${encodeURIComponent(resumeVersionId)}`, {
        method: 'GET',
        headers
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data.recommendations;
      }
      return null;
    } catch (err) {
      console.error('Error in getJobMatchesApi:', err);
      return null;
    }
  }

  public static async saveCalendarEventApi(event: any): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/calendar', {
        method: 'POST',
        headers,
        body: JSON.stringify(event)
      });
      return res.ok;
    } catch (err) {
      console.error('Error saving calendar event API:', err);
      return false;
    }
  }

  public static async deleteCalendarEventApi(id: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/auth/calendar/${id}`, {
        method: 'DELETE',
        headers
      });
      return res.ok;
    } catch (err) {
      console.error('Error deleting calendar event API:', err);
      return false;
    }
  }

  public static async saveJobApplicationApi(app: any): Promise<{ success: boolean; isDuplicate?: boolean; application?: any }> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/job-application', {
        method: 'POST',
        headers,
        body: JSON.stringify(app)
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, isDuplicate: Boolean(data.isDuplicate), application: data.application };
      }
      return { success: false };
    } catch (err) {
      console.error('Error saving job application API:', err);
      return { success: false };
    }
  }

  public static async updateApplicationStatusApi(id: string, status: string, stage?: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/auth/job-application/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status, stage })
      });
      return res.ok;
    } catch (err) {
      console.error('Error updating application status API:', err);
      return false;
    }
  }

  public static async getAnalyticsOverviewApi(period: string = 'all'): Promise<any | null> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/analytics/overview?period=${encodeURIComponent(period)}`, { headers });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error('Error fetching analytics overview API:', err);
      return null;
    }
  }

  public static async getSubscriptionUsageApi(): Promise<{
    plan: string;
    subscriptionStatus: string;
    trialExpiryDate?: string;
    features: Record<string, { used: number; limit: number; remaining: number }>;
  } | null> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/subscription/usage', { headers });
      if (res.ok) {
        const data = await res.json();
        return {
          plan: data.plan,
          subscriptionStatus: data.subscriptionStatus,
          trialExpiryDate: data.trialExpiryDate,
          features: data.features || {}
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching subscription usage API:', err);
      return null;
    }
  }

  public static async getSavedJobsApi(): Promise<any[]> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/jobs/saved', { headers });
      if (res.ok) {
        const data = await res.json();
        return data.jobs || [];
      }
      return [];
    } catch (err) {
      console.error('Error fetching saved jobs API:', err);
      return [];
    }
  }

  public static async saveJobApi(jobId: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/save`, {
        method: 'POST',
        headers
      });
      return res.ok;
    } catch (err) {
      console.error('Error saving job API:', err);
      return false;
    }
  }

  public static async unsaveJobApi(jobId: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/save`, {
        method: 'DELETE',
        headers
      });
      return res.ok;
    } catch (err) {
      console.error('Error unsaving job API:', err);
      return false;
    }
  }

  public static async isJobSavedApi(jobId: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/saved`, { headers });
      if (res.ok) {
        const data = await res.json();
        return !!data.saved;
      }
      return false;
    } catch (err) {
      console.error('Error checking isJobSaved API:', err);
      return false;
    }
  }

  public static async saveSavedJobApi(jobId: string, action: 'add' | 'remove' = 'add'): Promise<boolean> {
    if (action === 'remove') {
      return this.unsaveJobApi(jobId);
    }
    return this.saveJobApi(jobId);
  }

  public static async saveInterviewSessionApi(session: any): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/interview-session', {
        method: 'POST',
        headers,
        body: JSON.stringify(session)
      });
      return res.ok;
    } catch (err) {
      console.error('Error saving interview session API:', err);
      return false;
    }
  }

  public static async saveProductivityDataApi(key: string, value: any): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/productivity', {
        method: 'POST',
        headers,
        body: JSON.stringify({ key, value })
      });
      return res.ok;
    } catch (err) {
      console.error('Error saving productivity data API:', err);
      return false;
    }
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
      atsScore: 0
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
    const account = this.findUserByEmail(cleanEmail);

    if (!account) {
      return { success: false, error: 'Invalid email or password.' };
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
