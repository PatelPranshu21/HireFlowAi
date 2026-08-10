/**
 * AuthApiService - Handles all communication with the backend auth API.
 * Manages JWT tokens in localStorage and provides methods for login, register,
 * OAuth token handling, onboarding submission, and profile fetching.
 */

const TOKEN_KEY = 'hireflow_jwt_token';

export interface AuthApiUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  auth_provider: string;
  title: string | null;
  experience_level: string | null;
  phone: string | null;
  target_role: string | null;
  onboarding_completed: boolean;
  has_selected_plan: boolean;
  subscription_status: string;
  subscription_plan: string;
  tier: string;
  trial_start_date: string | null;
  trial_expiry_date: string | null;
  created_at: string;
  // Onboarding data (joined from user_onboarding table)
  skills?: string[];
  technologies?: string[];
  preferred_roles?: string[];
  preferred_companies?: string[];
  preferred_cities?: string[];
  preferred_industries?: string[];
  remote_preference?: string;
  expected_salary_min?: number;
  expected_salary_max?: number;
  target_industry?: string;
  resume_uploaded?: boolean;
}

export interface AuthApiResponse {
  success: boolean;
  token?: string;
  user?: AuthApiUser;
  error?: string;
}

export class AuthApiService {
  /** Store JWT token */
  static setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to store auth token', e);
    }
  }

  /** Retrieve JWT token */
  static getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  /** Clear JWT token */
  static clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }

  /** Check if a token exists */
  static hasToken(): boolean {
    return !!this.getToken();
  }

  /** Get authorization headers */
  private static getHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /** Register a new user with email/password */
  static async register(data: { name: string; email: string; password: string }): Promise<AuthApiResponse> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.token) {
        this.setToken(json.token);
      }
      return json;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }

  /** Login with email/password */
  static async login(data: { email: string; password: string }): Promise<AuthApiResponse> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.token) {
        this.setToken(json.token);
      }
      return json;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }

  /** Fetch current authenticated user */
  static async getMe(): Promise<AuthApiResponse> {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (res.status === 401) {
        this.clearToken();
        return { success: false, error: 'Session expired' };
      }
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }

  /** Submit onboarding data */
  static async submitOnboarding(data: {
    name?: string;
    phone?: string;
    title?: string;
    experienceLevel?: string;
    targetRole?: string;
    targetIndustry?: string;
    skills?: string[];
    technologies?: string[];
    preferredRoles?: string[];
    preferredCompanies?: string[];
    preferredCities?: string[];
    preferredIndustries?: string[];
    remotePreference?: string;
    expectedSalaryMin?: number;
    expectedSalaryMax?: number;
    resumeUploaded?: boolean;
  }): Promise<AuthApiResponse> {
    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }

  /** Update user profile */
  static async updateProfile(data: Record<string, any>): Promise<AuthApiResponse> {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }

  /**
   * Extract JWT token from URL hash parameters.
   * Called after OAuth redirect: /#dashboard?token=xxx or /#onboarding?token=xxx
   */
  static extractTokenFromUrl(): { token: string | null; targetView: string | null } {
    const hash = window.location.hash; // e.g. #dashboard?token=xxx
    if (!hash) return { token: null, targetView: null };

    const hashContent = hash.substring(1); // remove #
    const questionIdx = hashContent.indexOf('?');
    if (questionIdx === -1) return { token: null, targetView: hashContent || null };

    const view = hashContent.substring(0, questionIdx);
    const params = new URLSearchParams(hashContent.substring(questionIdx + 1));
    const token = params.get('token');

    if (token) {
      // Clean the URL hash to remove the token (security)
      window.location.hash = view;
      this.setToken(token);
    }

    return { token, targetView: view || null };
  }
}
