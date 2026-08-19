import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { extractTextFromPayload, parseResumeDocument, sanitizePgJson } from './documentParser';
import { analyzeResumeContentLocally } from './resumeAnalyzer';
import {
  initDb,
  dbFindUserByEmail,
  dbFindUserById,
  dbFindUserByProvider,
  dbCreateUser,
  dbUpdateUserProfile,
  isDbConnected,
  DbUserRecord,
  dbSaveResume,
  dbGetUserResumes,
  dbSaveResumeVersion,
  dbGetResumeVersions,
  dbSaveAtsReport,
  dbGetAtsReports,
  dbSaveJobApplication,
  dbGetUserJobApplications,
  dbSaveSavedJob,
  dbRemoveSavedJob,
  dbGetUserSavedJobs,
  dbSaveInterviewSession,
  dbGetUserInterviewSessions,
  dbSaveCalendarEvent,
  dbDeleteCalendarEvent,
  dbGetUserCalendarEvents,
  dbSaveProductivityData,
  dbGetProductivityData,
  dbGetAllUserData,
  dbDeleteResumeVersion,
  dbSaveJobMatches,
  dbUpdateResumeVersionScore
} from '../src/db/postgres';
import { JobMatchingService } from '../src/services/jobMatchingService';
import { JobIngestionService } from './jobIngestionService';

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

// Helper to build standardized auth user response
function formatAuthUserResponse(record: DbUserRecord) {
  const firstName = (record.first_name || '').trim();
  const lastName = (record.last_name || '').trim();
  let fullName = `${firstName} ${lastName}`.trim();

  const profile = { ...(record.profile_data || {}) };
  profile.id = record.id;
  profile.email = record.email;

  if (!fullName && profile.name && profile.name !== 'Candidate') {
    fullName = profile.name.trim();
  } else if (!fullName) {
    fullName = record.email.split('@')[0];
  }

  if (!profile.name || profile.name === 'Candidate' || profile.name.trim().length === 0) {
    profile.name = fullName;
  }

  const derivedFirstName = firstName || profile.name.split(' ')[0] || 'User';
  const derivedLastName = lastName || profile.name.split(' ').slice(1).join(' ') || '';

  const onboardingCompleted = Boolean(record.onboarding_completed);
  profile.hasCompletedOnboarding = onboardingCompleted;

  return {
    id: record.id,
    email: record.email,
    firstName: derivedFirstName,
    lastName: derivedLastName,
    authProvider: record.auth_provider,
    onboardingCompleted,
    profile
  };
}

// ------------------- AUTH ENDPOINTS -------------------

// 1. Email Signup / Register
const handleSignup = async (req: Request, res: Response) => {
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
      return res.status(409).json({
        error: 'account_exists',
        message: 'An account with this email already exists. Please log in instead.'
      });
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

    const userPayload = formatAuthUserResponse(createdUserRecord!);

    return res.json({
      success: true,
      token,
      onboarding_completed: false,
      user: userPayload
    });
  } catch (err: any) {
    console.error('Error in /api/auth/signup:', err);
    return res.status(500).json({ error: 'Signup failed', details: err.message });
  }
};

router.post('/signup', handleSignup);
router.post('/register', handleSignup);

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

    const userPayload = formatAuthUserResponse(userRecord);

    return res.json({
      success: true,
      token,
      onboarding_completed: userPayload.onboardingCompleted,
      user: userPayload
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

    const userPayload = formatAuthUserResponse(userRecord);

    return res.json({
      success: true,
      user: userPayload
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

    const newFirstName = onboardingUpdates.name
      ? onboardingUpdates.name.trim().split(' ')[0]
      : (userRecord.first_name || undefined);
    const newLastName = onboardingUpdates.name
      ? onboardingUpdates.name.trim().split(' ').slice(1).join(' ')
      : (userRecord.last_name || undefined);

    let updatedRecord: DbUserRecord | null = null;
    if (isDbConnected()) {
      updatedRecord = await dbUpdateUserProfile(userId, updatedProfile, {
        onboarding_completed: true,
        first_name: newFirstName,
        last_name: newLastName
      });
    }

    if (!updatedRecord) {
      // Update in fallback
      const fb = fallbackUsers[userId] || fallbackUsers[userRecord.email];
      if (fb) {
        fb.onboarding_completed = true;
        fb.onboarding_completed_at = new Date().toISOString();
        if (newFirstName) fb.first_name = newFirstName;
        if (newLastName) fb.last_name = newLastName;
        fb.profile_data = updatedProfile;
        fb.updated_at = new Date().toISOString();
        updatedRecord = fb as any;
      }
    }

    const finalRecord = updatedRecord || userRecord;
    const userPayload = formatAuthUserResponse(finalRecord);

    return res.json({
      success: true,
      onboardingCompleted: true,
      user: userPayload
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
          <p>Please set <code>LINKEDIN_CLIENT_ID</code>, <code>LINKEDIN_CLIENT_SECRET</code>, and <code>LINKEDIN_REDIRECT_URI</code> in your environment or <code>.env</code> file.</p>
          <a href="/" style="color: #3b82f6; text-decoration: underline;">Return to HireFlow AI</a>
        </body>
      </html>
    `);
  }

  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const defaultCallback = `${protocol}://${host}/api/auth/linkedin/callback`;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || process.env.LINKEDIN_CALLBACK_URL || defaultCallback;

  // CSRF state protection
  const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
  res.cookie('linkedin_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000,
    sameSite: 'lax'
  });

  const scope = encodeURIComponent('openid profile email');
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&state=${state}`;

  return res.redirect(authUrl);
});

router.get('/linkedin/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;
    if (error || !code) {
      const errorMsg = (error_description as string) || (error as string) || 'LinkedIn authentication cancelled';
      return res.redirect(`/#login?error=${encodeURIComponent(errorMsg)}`);
    }

    // Validate CSRF state token if present
    const savedState = req.cookies?.linkedin_oauth_state;
    res.clearCookie('linkedin_oauth_state');
    if (savedState && state && savedState !== state) {
      console.warn('[LinkedIn OAuth] State parameter mismatch. Continuing with security validation.');
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID || process.env.VITE_LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const defaultCallback = `${protocol}://${host}/api/auth/linkedin/callback`;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || process.env.LINKEDIN_CALLBACK_URL || defaultCallback;

    if (!clientId || !clientSecret) {
      return res.redirect('/#login?error=' + encodeURIComponent('Missing LINKEDIN_CLIENT_SECRET on server environment'));
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
      const errMsg = tokenData.error_description || tokenData.error || 'Failed to exchange LinkedIn OAuth authorization code';
      return res.redirect('/#login?error=' + encodeURIComponent(errMsg));
    }

    // Fetch user profile from LinkedIn UserInfo endpoint
    const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    if (!userinfoResponse.ok) {
      console.error('[LinkedIn OAuth] Userinfo request failed:', userinfoResponse.status);
      return res.redirect('/#login?error=' + encodeURIComponent('Failed to retrieve user profile from LinkedIn'));
    }

    const linkedinUser = await userinfoResponse.json();
    const rawEmail = linkedinUser.email || linkedinUser.email_verified;
    if (!rawEmail) {
      return res.redirect('/#login?error=' + encodeURIComponent('Could not retrieve email from LinkedIn OAuth profile'));
    }

    const email = rawEmail.trim().toLowerCase();
    const linkedinId = linkedinUser.sub || linkedinUser.id;
    const firstName = linkedinUser.given_name || linkedinUser.name?.split(' ')[0] || 'LinkedIn Professional';
    const lastName = linkedinUser.family_name || linkedinUser.name?.split(' ').slice(1).join(' ') || '';
    const fullName = linkedinUser.name || `${firstName} ${lastName}`.trim();
    const avatar = linkedinUser.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

    // Account Lookup & Linking
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
      newProfile.hasSelectedPlan = false;
      newProfile.hasCompletedOnboarding = false;
      newProfile.subscriptionPlan = 'None';
      newProfile.subscriptionStatus = 'none';

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
      // Existing user: preserve all existing profile data & records
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

    const hasSelectedPlan = Boolean(userRecord?.profile_data?.hasSelectedPlan) || (userRecord?.profile_data?.subscriptionPlan && userRecord?.profile_data?.subscriptionPlan !== 'None');
    const onboardingCompleted = Boolean(userRecord?.onboarding_completed);

    let redirectTab = 'dashboard';
    if (!hasSelectedPlan) {
      redirectTab = 'pricing';
    } else if (!onboardingCompleted) {
      redirectTab = 'onboarding';
    } else {
      redirectTab = 'dashboard';
    }

    return res.redirect(`/#oauth_callback?token=${token}&tab=${redirectTab}&onboarding=${onboardingCompleted}`);
  } catch (err: any) {
    console.error('Error in LinkedIn OAuth callback:', err);
    return res.redirect('/#login?error=' + encodeURIComponent('LinkedIn OAuth callback internal error'));
  }
});

// ------------------- PERSISTENT DATA ENDPOINTS -------------------

// 6. Get Complete Persistent User Data (/api/auth/data)
router.get('/data', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allData = await dbGetAllUserData(userId);
    return res.json({
      success: true,
      data: allData
    });
  } catch (err: any) {
    console.error('Error in GET /api/auth/data:', err);
    return res.status(500).json({ error: 'Failed to fetch user data', details: err.message });
  }
});

// 7. Save Resume & Version (/api/auth/resume)
router.post('/resume', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { fileName, fileText, fileData, parsedData, score, template, analysisData } = req.body;
    if (!fileText && !fileName && !fileData) {
      return res.status(400).json({ error: 'fileName and fileText/fileData required' });
    }

    const docParse = await parseResumeDocument({ fileText, fileData, fileName });
    const cleanText = docParse.text;
    const cleanParsedData = sanitizePgJson(parsedData || {});
    let cleanAnalysis = analysisData ? sanitizePgJson(analysisData) : null;
    
    // Automatically compute deterministic analysis if not provided
    if ((!cleanAnalysis || !cleanAnalysis.overallScore) && cleanText && cleanText.trim().length > 20) {
      const targetRole = req.body.targetRole || parsedData?.targetRole || 'Software Engineer';
      cleanAnalysis = analyzeResumeContentLocally(cleanText, targetRole);
    }

    const effectiveScore = cleanAnalysis?.overallScore || Number(score) || 0;

    const savedResume = await dbSaveResume(userId, {
      file_name: fileName || 'Resume.pdf',
      resume_text: cleanText,
      parsed_data: cleanParsedData,
      ats_score: effectiveScore,
      version_name: fileName || 'Master Resume'
    });

    const savedVersion = await dbSaveResumeVersion(userId, {
      id: req.body.versionId || undefined,
      resume_id: savedResume?.id,
      version_name: fileName || 'Master Resume',
      resume_text: cleanText,
      parsed_data: cleanParsedData,
      score: effectiveScore,
      template: template || 'modern_tech',
      file_name: fileName || 'Resume.pdf',
      uploaded_at: new Date().toISOString(),
      analysis_data: cleanAnalysis
    });

    if (savedVersion?.id && cleanAnalysis) {
      await dbUpdateResumeVersionScore(savedVersion.id, effectiveScore, cleanAnalysis);
    }

    // Compute deterministic job matches for this version using real PostgreSQL jobs
    const versionSkills = cleanParsedData?.skills || cleanAnalysis?.keywordList?.filter((k: any) => k.detected && k.foundInResume).map((k: any) => k.keyword) || [];
    const availableJobs = await JobIngestionService.getAvailableJobs();
    const jobMatches = JobMatchingService.matchResumeAgainstJobs(cleanText, versionSkills, availableJobs);

    if (savedVersion?.id) {
      const dbMatches = jobMatches.map(m => ({
        resume_version_id: savedVersion.id,
        job_id: m.id,
        match_score: m.matchScore,
        similarity_score: (m as any).similarityScore || 0,
        skill_match_score: (m as any).skillMatchScore || 0,
        matched_skills: (m as any).matchedSkills || m.requiredSkills || [],
        missing_skills: m.missingSkills || [],
        preferred_skills: [],
        why_match: m.recommendationReason
      }));
      await dbSaveJobMatches(userId, savedVersion.id, dbMatches);
    }

    // Also update profile_data in users table
    const userRecord = await dbFindUserById(userId);
    if (userRecord) {
      const existingProfile = userRecord.profile_data || {};
      const existingVersions = existingProfile.resumeVersions || [];
      const newVer = {
        id: savedVersion?.id || `v_${Date.now()}`,
        versionName: fileName || 'Master Resume',
        fileName: fileName || 'Resume.pdf',
        uploadedAt: 'Just now',
        fileSize: '184 KB',
        score: effectiveScore,
        template: template || 'modern_tech',
        parsedData: cleanParsedData,
        jobsMatchedCount: jobMatches.length,
        content: cleanText,
        resumeText: cleanText,
        analysisData: cleanAnalysis
      };
      const updatedVersions = [newVer, ...existingVersions.filter((v: any) => v.id !== newVer.id)];
      const updatedProfile = {
        ...existingProfile,
        resumeText: cleanText,
        primaryResumeText: cleanText,
        activeResumeVersionId: newVer.id,
        resumeVersions: updatedVersions,
        atsScore: effectiveScore || existingProfile.atsScore || 0
      };
      await dbUpdateUserProfile(userId, updatedProfile);
    }

    return res.json({
      success: true,
      resume: savedResume,
      version: savedVersion,
      analysisData: cleanAnalysis,
      score: effectiveScore,
      extractedText: cleanText,
      jobRecommendations: jobMatches
    });
  } catch (err: any) {
    console.error('Error in POST /api/auth/resume:', err);
    return res.status(500).json({ error: 'Failed to save resume', details: err.message });
  }
});

// 7b. Delete Resume Version (/api/auth/resume-version/:id)
router.delete('/resume-version/:id', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const versionId = req.params.id;
    if (!versionId) {
      return res.status(400).json({ error: 'Version ID required' });
    }

    // Delete from resume_versions and ats_reports in PostgreSQL
    const deleted = await dbDeleteResumeVersion(userId, versionId);

    // Also remove from user's profile_data.resumeVersions
    if (isDbConnected()) {
      const userRecord = await dbFindUserById(userId);
      if (userRecord) {
        const existingProfile = userRecord.profile_data || {};
        const existingVersions = existingProfile.resumeVersions || [];
        const updatedVersions = existingVersions.filter((v: any) => v.id !== versionId);
        const updatedProfile = {
          ...existingProfile,
          resumeVersions: updatedVersions
        };
        await dbUpdateUserProfile(userId, updatedProfile);
      }
    }

    return res.json({ success: true, deleted });
  } catch (err: any) {
    console.error('Error in DELETE /api/auth/resume-version:', err);
    return res.status(500).json({ error: 'Failed to delete resume version', details: err.message });
  }
});

// 7c. Update Resume Version Score & Analysis Data (/api/auth/resume-version/:id/score)
router.patch('/resume-version/:id/score', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const versionId = req.params.id;
    const { score, analysisData } = req.body;
    if (!versionId) {
      return res.status(400).json({ error: 'Version ID required' });
    }

    const updated = await dbUpdateResumeVersionScore(versionId, Number(score) || 0, analysisData);

    // Also update in profile_data
    if (isDbConnected()) {
      const userRecord = await dbFindUserById(userId);
      if (userRecord) {
        const existingProfile = userRecord.profile_data || {};
        const existingVersions = existingProfile.resumeVersions || [];
        const updatedVersions = existingVersions.map((v: any) => 
          v.id === versionId ? { ...v, score: Number(score) || 0, analysisData: analysisData || v.analysisData } : v
        );
        const isCurrentActive = existingProfile.activeResumeVersionId === versionId;
        const updatedProfile = {
          ...existingProfile,
          resumeVersions: updatedVersions,
          atsScore: isCurrentActive ? (Number(score) || 0) : existingProfile.atsScore
        };
        await dbUpdateUserProfile(userId, updatedProfile);
      }
    }

    return res.json({ success: true, updated });
  } catch (err: any) {
    console.error('Error in PATCH /api/auth/resume-version/:id/score:', err);
    return res.status(500).json({ error: 'Failed to update resume version score', details: err.message });
  }
});

// 8. Calendar Event (/api/auth/calendar)
router.post('/calendar', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const event = req.body;
    const saved = await dbSaveCalendarEvent(userId, event);
    return res.json({ success: true, event: saved });
  } catch (err: any) {
    console.error('Error in POST /api/auth/calendar:', err);
    return res.status(500).json({ error: 'Failed to save calendar event', details: err.message });
  }
});

router.delete('/calendar/:id', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await dbDeleteCalendarEvent(userId, id);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error in DELETE /api/auth/calendar:', err);
    return res.status(500).json({ error: 'Failed to delete calendar event', details: err.message });
  }
});

// 9. Job Application (/api/auth/job-application)
router.post('/job-application', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const app = req.body;
    const saved = await dbSaveJobApplication(userId, app);
    return res.json({ success: true, application: saved });
  } catch (err: any) {
    console.error('Error in POST /api/auth/job-application:', err);
    return res.status(500).json({ error: 'Failed to save job application', details: err.message });
  }
});

// 10. Saved Job (/api/auth/saved-job)
router.post('/saved-job', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { jobId, action } = req.body;
    if (action === 'remove') {
      await dbRemoveSavedJob(userId, jobId);
    } else {
      await dbSaveSavedJob(userId, jobId);
    }
    const savedJobs = await dbGetUserSavedJobs(userId);
    return res.json({ success: true, savedJobs });
  } catch (err: any) {
    console.error('Error in POST /api/auth/saved-job:', err);
    return res.status(500).json({ error: 'Failed to update saved job', details: err.message });
  }
});

// 11. Interview Session (/api/auth/interview-session)
router.post('/interview-session', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = req.body;
    const saved = await dbSaveInterviewSession(userId, session);
    return res.json({ success: true, session: saved });
  } catch (err: any) {
    console.error('Error in POST /api/auth/interview-session:', err);
    return res.status(500).json({ error: 'Failed to save interview session', details: err.message });
  }
});

// 12. Productivity Data (/api/auth/productivity)
router.post('/productivity', async (req: Request, res: Response) => {
  try {
    const userId = verifyAuthHeader(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'key required' });
    }

    await dbSaveProductivityData(userId, key, value);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error in POST /api/auth/productivity:', err);
    return res.status(500).json({ error: 'Failed to save productivity data', details: err.message });
  }
});

export default router;
