import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  initDb,
  dbFindUserByEmail,
  dbFindUserById,
  dbFindUserByProvider,
  dbCreateUser,
  dbUpdateUserProfile,
  isDbConnected,
  DbUserRecord
} from '../src/db/postgres';

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || 'hireflow_super_secret_jwt_key_2026';

// Memory / Fallback user store when PostgreSQL DATABASE_URL is not connected
const fallbackUsers: Record<string, {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string | null;
  auth_provider: string;
  provider_id: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  profile_data: any;
  created_at: string;
  updated_at: string;
}> = {};

// Default initial user profile builder
function createDefaultProfile(id: string, name: string, email: string, avatar?: string) {
  return {
    id,
    name,
    email,
    avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
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
}

// Helper token generator
function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Helper to extract user ID from Auth token / cookie
export function verifyAuthHeader(req: Request): string | null {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.hireflow_token) {
      token = req.cookies.hireflow_token;
    }

    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId || null;
  } catch (err) {
    return null;
  }
}

// ------------------- AUTH ENDPOINTS -------------------

// 1. Email Signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || '').trim() || cleanEmail.split('@')[0];
    const nameParts = cleanName.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check existing user in Postgres or fallback
    let existingUser = await dbFindUserByEmail(cleanEmail);
    if (!existingUser && fallbackUsers[cleanEmail]) {
      existingUser = fallbackUsers[cleanEmail] as any;
    }

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const profileData = createDefaultProfile(userId, cleanName, cleanEmail);

    let createdUserRecord: DbUserRecord | null = null;
    if (isDbConnected()) {
      createdUserRecord = await dbCreateUser({
        id: userId,
        email: cleanEmail,
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
        auth_provider: 'email',
        onboarding_completed: false,
        profile_data: profileData
      });
    }

    if (!createdUserRecord) {
      // Fallback in-memory user
      const fallbackRecord = {
        id: userId,
        email: cleanEmail,
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
        auth_provider: 'email',
        provider_id: null,
        onboarding_completed: false,
        onboarding_completed_at: null,
        profile_data: profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      fallbackUsers[cleanEmail] = fallbackRecord;
      fallbackUsers[userId] = fallbackRecord;
      createdUserRecord = fallbackRecord as any;
    }

    const token = generateToken(userId);
    res.cookie('hireflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      token,
      onboarding_completed: false,
      user: {
        id: createdUserRecord!.id,
        email: createdUserRecord!.email,
        firstName: createdUserRecord!.first_name,
        lastName: createdUserRecord!.last_name,
        authProvider: createdUserRecord!.auth_provider,
        onboardingCompleted: false,
        profile: createdUserRecord!.profile_data
      }
    });
  } catch (err: any) {
    console.error('Error in /api/auth/signup:', err);
    return res.status(500).json({ error: 'Signup failed', details: err.message });
  }
});

// 2. Email Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    let userRecord = await dbFindUserByEmail(cleanEmail);
    if (!userRecord && fallbackUsers[cleanEmail]) {
      userRecord = fallbackUsers[cleanEmail] as any;
    }

    if (!userRecord) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (userRecord.password_hash) {
      const isPasswordValid = await bcrypt.compare(password, userRecord.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    const token = generateToken(userRecord.id);
    res.cookie('hireflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const profile = userRecord.profile_data || {};
    profile.hasCompletedOnboarding = userRecord.onboarding_completed;

    return res.json({
      success: true,
      token,
      onboarding_completed: userRecord.onboarding_completed,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.first_name,
        lastName: userRecord.last_name,
        authProvider: userRecord.auth_provider,
        onboardingCompleted: userRecord.onboarding_completed,
        profile
      }
    });
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    return res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// 3. Get Current User (/api/auth/me)
router.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let userRecord = await dbFindUserById(userId);
    if (!userRecord && fallbackUsers[userId]) {
      userRecord = fallbackUsers[userId] as any;
    }

    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = userRecord.profile_data || {};
    profile.hasCompletedOnboarding = userRecord.onboarding_completed;

    return res.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.first_name,
        lastName: userRecord.last_name,
        authProvider: userRecord.auth_provider,
        onboardingCompleted: userRecord.onboarding_completed,
        profile
      }
    });
  } catch (err: any) {
    console.error('Error in /api/auth/me:', err);
    return res.status(500).json({ error: 'Failed to retrieve user', details: err.message });
  }
});

// 4. Save Onboarding Data (/api/auth/onboarding)
router.post('/onboarding', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const onboardingUpdates = req.body; // collected profile/preferences

    let userRecord = await dbFindUserById(userId);
    if (!userRecord && fallbackUsers[userId]) {
      userRecord = fallbackUsers[userId] as any;
    }

    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedProfile = {
      ...(userRecord.profile_data || {}),
      ...onboardingUpdates,
      hasCompletedOnboarding: true
    };

    let updatedRecord: DbUserRecord | null = null;
    if (isDbConnected()) {
      updatedRecord = await dbUpdateUserProfile(userId, updatedProfile, {
        onboarding_completed: true,
        first_name: onboardingUpdates.name ? onboardingUpdates.name.split(' ')[0] : undefined,
        last_name: onboardingUpdates.name ? onboardingUpdates.name.split(' ').slice(1).join(' ') : undefined
      });
    }

    if (!updatedRecord) {
      // Update in fallback
      const fb = fallbackUsers[userId] || fallbackUsers[userRecord.email];
      if (fb) {
        fb.onboarding_completed = true;
        fb.onboarding_completed_at = new Date().toISOString();
        fb.profile_data = updatedProfile;
        fb.updated_at = new Date().toISOString();
        updatedRecord = fb as any;
      }
    }

    return res.json({
      success: true,
      onboardingCompleted: true,
      user: {
        id: userId,
        email: userRecord.email,
        onboardingCompleted: true,
        profile: updatedProfile
      }
    });
  } catch (err: any) {
    console.error('Error in /api/auth/onboarding:', err);
    return res.status(500).json({ error: 'Failed to save onboarding data', details: err.message });
  }
});

// 5. Save General Profile Updates (/api/auth/profile)
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profileUpdates = req.body;
    let userRecord = await dbFindUserById(userId);
    if (!userRecord && fallbackUsers[userId]) {
      userRecord = fallbackUsers[userId] as any;
    }

    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    const mergedProfile = {
      ...(userRecord.profile_data || {}),
      ...profileUpdates
    };

    let updatedRecord: DbUserRecord | null = null;
    if (isDbConnected()) {
      updatedRecord = await dbUpdateUserProfile(userId, mergedProfile);
    }

    if (!updatedRecord) {
      const fb = fallbackUsers[userId] || fallbackUsers[userRecord.email];
      if (fb) {
        fb.profile_data = mergedProfile;
        fb.updated_at = new Date().toISOString();
        updatedRecord = fb as any;
      }
    }

    return res.json({
      success: true,
      profile: mergedProfile
    });
  } catch (err: any) {
    console.error('Error in /api/auth/profile:', err);
    return res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

// 6. Logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('hireflow_token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

// ------------------- REAL GOOGLE OAUTH -------------------

router.get('/google', (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(400).send(`
      <html>
        <head><title>Google OAuth Configuration Missing</title></head>
        <body style="font-family: sans-serif; background: #0a0a0a; color: #fff; padding: 40px; text-align: center;">
          <h2 style="color: #ef4444;">Google OAuth credentials are not configured</h2>
          <p>Please set <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>, and <code>GOOGLE_CALLBACK_URL</code> in your environment or <code>.env</code> file.</p>
          <a href="/" style="color: #3b82f6; text-decoration: underline;">Return to HireFlow AI</a>
        </body>
      </html>
    `);
  }

  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const defaultCallback = `${protocol}://${host}/api/auth/google/callback`;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || defaultCallback;

  const scope = encodeURIComponent('openid profile email');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  return res.redirect(authUrl);
});

router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query;
    if (error || !code) {
      return res.redirect(`/#login?error=${encodeURIComponent((error as string) || 'Google authentication cancelled')}`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const defaultCallback = `${protocol}://${host}/api/auth/google/callback`;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || defaultCallback;

    if (!clientId || !clientSecret) {
      return res.redirect('/#login?error=' + encodeURIComponent('Missing GOOGLE_CLIENT_SECRET on server'));
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error('[Google OAuth] Token exchange failed:', tokenData);
      return res.redirect('/#login?error=' + encodeURIComponent('Failed to exchange Google OAuth authorization code'));
    }

    // Fetch user profile from Google UserInfo endpoint
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const googleUser = await userinfoResponse.json();
    if (!googleUser.email) {
      return res.redirect('/#login?error=' + encodeURIComponent('Could not retrieve email from Google OAuth profile'));
    }

    const email = googleUser.email.trim().toLowerCase();
    const googleId = googleUser.id || googleUser.sub;
    const firstName = googleUser.given_name || googleUser.name?.split(' ')[0] || 'Google User';
    const lastName = googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const avatar = googleUser.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

    // Look up existing user in Postgres or fallback
    let userRecord = await dbFindUserByProvider('google', googleId);
    if (!userRecord) {
      userRecord = await dbFindUserByEmail(email);
    }
    if (!userRecord && fallbackUsers[email]) {
      userRecord = fallbackUsers[email] as any;
    }

    let isNewUser = false;
    let userId = userRecord?.id;

    if (!userRecord) {
      isNewUser = true;
      userId = `usr_google_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newProfile = createDefaultProfile(userId, fullName, email, avatar);

      if (isDbConnected()) {
        userRecord = await dbCreateUser({
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          auth_provider: 'google',
          provider_id: googleId,
          onboarding_completed: false,
          profile_data: newProfile
        });
      }

      if (!userRecord) {
        const fb = {
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          password_hash: null,
          auth_provider: 'google',
          provider_id: googleId,
          onboarding_completed: false,
          onboarding_completed_at: null,
          profile_data: newProfile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        fallbackUsers[email] = fb;
        fallbackUsers[userId] = fb;
        userRecord = fb as any;
      }
    } else {
      // Existing user: ensure provider_id and auth_provider are updated
      if (isDbConnected() && userId) {
        await dbUpdateUserProfile(userId, userRecord.profile_data || {}, {
          auth_provider: 'google',
          provider_id: googleId
        });
      }
    }

    const token = generateToken(userId!);
    res.cookie('hireflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const onboardingCompleted = userRecord ? userRecord.onboarding_completed : false;
    const redirectTab = onboardingCompleted ? 'dashboard' : 'onboarding';

    return res.redirect(`/#oauth_callback?token=${token}&tab=${redirectTab}&onboarding=${onboardingCompleted}`);
  } catch (err: any) {
    console.error('Error in Google OAuth callback:', err);
    return res.redirect('/#login?error=' + encodeURIComponent('Google OAuth callback internal error'));
  }
});

// ------------------- REAL LINKEDIN OAUTH -------------------

router.get('/linkedin', (req: Request, res: Response) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID || process.env.VITE_LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return res.status(400).send(`
      <html>
        <head><title>LinkedIn OAuth Configuration Missing</title></head>
        <body style="font-family: sans-serif; background: #0a0a0a; color: #fff; padding: 40px; text-align: center;">
          <h2 style="color: #ef4444;">LinkedIn OAuth credentials are not configured</h2>
          <p>Please set <code>LINKEDIN_CLIENT_ID</code>, <code>LINKEDIN_CLIENT_SECRET</code>, and <code>LINKEDIN_CALLBACK_URL</code> in your environment or <code>.env</code> file.</p>
          <a href="/" style="color: #3b82f6; text-decoration: underline;">Return to HireFlow AI</a>
        </body>
      </html>
    `);
  }

  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const defaultCallback = `${protocol}://${host}/api/auth/linkedin/callback`;
  const redirectUri = process.env.LINKEDIN_CALLBACK_URL || defaultCallback;

  const scope = encodeURIComponent('openid profile email');
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}`;

  return res.redirect(authUrl);
});

router.get('/linkedin/callback', async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query;
    if (error || !code) {
      return res.redirect(`/#login?error=${encodeURIComponent((error as string) || 'LinkedIn authentication cancelled')}`);
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID || process.env.VITE_LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const defaultCallback = `${protocol}://${host}/api/auth/linkedin/callback`;
    const redirectUri = process.env.LINKEDIN_CALLBACK_URL || defaultCallback;

    if (!clientId || !clientSecret) {
      return res.redirect('/#login?error=' + encodeURIComponent('Missing LINKEDIN_CLIENT_SECRET on server'));
    }

    // Exchange code for access_token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error('[LinkedIn OAuth] Token exchange failed:', tokenData);
      return res.redirect('/#login?error=' + encodeURIComponent('Failed to exchange LinkedIn OAuth authorization code'));
    }

    // Fetch user profile from LinkedIn UserInfo endpoint
    const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const linkedinUser = await userinfoResponse.json();
    if (!linkedinUser.email) {
      return res.redirect('/#login?error=' + encodeURIComponent('Could not retrieve email from LinkedIn OAuth profile'));
    }

    const email = linkedinUser.email.trim().toLowerCase();
    const linkedinId = linkedinUser.sub || linkedinUser.id;
    const firstName = linkedinUser.given_name || linkedinUser.name?.split(' ')[0] || 'LinkedIn Professional';
    const lastName = linkedinUser.family_name || linkedinUser.name?.split(' ').slice(1).join(' ') || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const avatar = linkedinUser.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

    let userRecord = await dbFindUserByProvider('linkedin', linkedinId);
    if (!userRecord) {
      userRecord = await dbFindUserByEmail(email);
    }
    if (!userRecord && fallbackUsers[email]) {
      userRecord = fallbackUsers[email] as any;
    }

    let isNewUser = false;
    let userId = userRecord?.id;

    if (!userRecord) {
      isNewUser = true;
      userId = `usr_linkedin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newProfile = createDefaultProfile(userId, fullName, email, avatar);

      if (isDbConnected()) {
        userRecord = await dbCreateUser({
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          auth_provider: 'linkedin',
          provider_id: linkedinId,
          onboarding_completed: false,
          profile_data: newProfile
        });
      }

      if (!userRecord) {
        const fb = {
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          password_hash: null,
          auth_provider: 'linkedin',
          provider_id: linkedinId,
          onboarding_completed: false,
          onboarding_completed_at: null,
          profile_data: newProfile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        fallbackUsers[email] = fb;
        fallbackUsers[userId] = fb;
        userRecord = fb as any;
      }
    } else {
      if (isDbConnected() && userId) {
        await dbUpdateUserProfile(userId, userRecord.profile_data || {}, {
          auth_provider: 'linkedin',
          provider_id: linkedinId
        });
      }
    }

    const token = generateToken(userId!);
    res.cookie('hireflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const onboardingCompleted = userRecord ? userRecord.onboarding_completed : false;
    const redirectTab = onboardingCompleted ? 'dashboard' : 'onboarding';

    return res.redirect(`/#oauth_callback?token=${token}&tab=${redirectTab}&onboarding=${onboardingCompleted}`);
  } catch (err: any) {
    console.error('Error in LinkedIn OAuth callback:', err);
    return res.redirect('/#login?error=' + encodeURIComponent('LinkedIn OAuth callback internal error'));
  }
});

export default router;
