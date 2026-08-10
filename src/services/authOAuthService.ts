import { UserProfile } from '../types';

export interface OAuthConfig {
  googleClientId?: string;
  linkedInClientId?: string;
  redirectUri?: string;
}

export function getOAuthConfig(): OAuthConfig {
  const env = (import.meta as any).env || {};
  return {
    googleClientId: env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID || '',
    linkedInClientId: env.VITE_LINKEDIN_CLIENT_ID || env.LINKEDIN_CLIENT_ID || '',
    redirectUri: env.VITE_OAUTH_REDIRECT_URI || env.GOOGLE_CALLBACK_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  };
}

export async function loginWithGoogle(_overrideEmail?: string, _overrideName?: string): Promise<{
  success: boolean;
  profile?: Partial<UserProfile>;
  message?: string;
}> {
  // Initiates REAL Google OAuth 2.0 Authorization Flow
  if (typeof window !== 'undefined') {
    window.location.href = '/api/auth/google';
  }
  return { success: true, message: 'Redirecting to Google OAuth 2.0 Authorization...' };
}

export async function loginWithLinkedIn(_overrideEmail?: string, _overrideName?: string): Promise<{
  success: boolean;
  profile?: Partial<UserProfile>;
  message?: string;
}> {
  // Initiates REAL LinkedIn OAuth 2.0 Authorization Flow
  if (typeof window !== 'undefined') {
    window.location.href = '/api/auth/linkedin';
  }
  return { success: true, message: 'Redirecting to LinkedIn OAuth 2.0 Authorization...' };
}
