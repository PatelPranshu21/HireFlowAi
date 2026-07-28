import { UserProfile } from '../types';

export interface OAuthConfig {
  googleClientId?: string;
  linkedInClientId?: string;
  redirectUri?: string;
}

export function getOAuthConfig(): OAuthConfig {
  const env = (import.meta as any).env || {};
  return {
    googleClientId: env.VITE_GOOGLE_CLIENT_ID || '',
    linkedInClientId: env.VITE_LINKEDIN_CLIENT_ID || '',
    redirectUri: env.VITE_OAUTH_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : '')
  };
}

export async function loginWithGoogle(overrideEmail?: string, overrideName?: string): Promise<{
  success: boolean;
  profile?: Partial<UserProfile>;
  message?: string;
  isMocked?: boolean;
}> {
  const config = getOAuthConfig();

  if (config.googleClientId) {
    // Production OAuth redirect architecture
    const scope = encodeURIComponent('openid profile email');
    const redirect = encodeURIComponent(config.redirectUri || window.location.origin);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.googleClientId}&redirect_uri=${redirect}&response_type=code&scope=${scope}&access_type=offline`;
    
    window.location.href = authUrl;
    return { success: true, message: 'Redirecting to Google OAuth...' };
  } else {
    // Sandbox / Development simulation mode
    const name = overrideName && overrideName.trim() ? overrideName : 'Google User';
    const email = overrideEmail && overrideEmail.trim() ? overrideEmail : 'user.google@gmail.com';
    
    return {
      success: true,
      isMocked: true,
      message: 'Signed in with Google OAuth (Development Architecture)',
      profile: {
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        title: 'Software Specialist',
        experienceLevel: 'Mid Level'
      }
    };
  }
}

export async function loginWithLinkedIn(overrideEmail?: string, overrideName?: string): Promise<{
  success: boolean;
  profile?: Partial<UserProfile>;
  message?: string;
  isMocked?: boolean;
}> {
  const config = getOAuthConfig();

  if (config.linkedInClientId) {
    // Production OAuth redirect architecture
    const scope = encodeURIComponent('r_liteprofile r_emailaddress');
    const redirect = encodeURIComponent(config.redirectUri || window.location.origin);
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${config.linkedInClientId}&redirect_uri=${redirect}&scope=${scope}`;
    
    window.location.href = authUrl;
    return { success: true, message: 'Redirecting to LinkedIn OAuth...' };
  } else {
    // Sandbox / Development simulation mode
    const name = overrideName && overrideName.trim() ? overrideName : 'LinkedIn Professional';
    const email = overrideEmail && overrideEmail.trim() ? overrideEmail : 'user.linkedin@hireflow.ai';

    return {
      success: true,
      isMocked: true,
      message: 'Signed in with LinkedIn OAuth (Development Architecture)',
      profile: {
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        title: 'Career Professional',
        experienceLevel: 'Senior Level'
      }
    };
  }
}
