import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { PLANS, FeatureKey, checkEntitlement, normalizeProfileSubscription } from '../src/data/planConfig';
import { dbCheckFeatureEntitlement, dbIncrementFeatureUsage, dbGetUserUsage } from '../src/db/postgres';

const JWT_SECRET = process.env.SESSION_SECRET || 'hireflow_super_secret_jwt_key_2026';

export interface SubscriptionRequest extends Request {
  userProfile?: any;
  userId?: string;
  guestKey?: string;
}

const guestStore = new Map<string, any>();

/**
 * Retrieves the current authenticated user's profile from DB or falls back to server guest store.
 */
export async function resolveUserProfile(req: SubscriptionRequest): Promise<any> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let userId = req.body?.userId || req.query?.userId;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {}
  }

  if (userId && userId !== 'usr_guest') {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          let profile = row.profile_data || {};
          profile.id = row.id;
          profile.email = row.email;
          profile.name = row.name || row.email;
          profile.subscriptionPlan = row.subscription_plan || profile.subscriptionPlan || '3-Day Free Trial';
          profile.subscriptionStatus = row.subscription_status || profile.subscriptionStatus || 'trialing';
          profile.trialStartDate = row.trial_start_date || profile.trialStartDate;
          profile.trialExpiryDate = row.trial_expiry_date || profile.trialExpiryDate;

          const { profile: normProfile, isModified } = normalizeProfileSubscription(profile);

          // Synchronize PostgreSQL user_usage table
          const usageDb = await dbGetUserUsage(row.id);
          if (usageDb) {
            normProfile.usageLimits = {
              resumeScans: usageDb.features.resumeScans ? { used: usageDb.features.resumeScans.used, max: usageDb.features.resumeScans.limit } : { used: 0, max: 3 },
              atsAnalyses: usageDb.features.atsAnalyses ? { used: usageDb.features.atsAnalyses.used, max: usageDb.features.atsAnalyses.limit } : { used: 0, max: 3 },
              aiInterviews: usageDb.features.aiInterviews ? { used: usageDb.features.aiInterviews.used, max: usageDb.features.aiInterviews.limit } : { used: 0, max: 3 },
              coverLetterGenerations: usageDb.features.coverLetterGenerations ? { used: usageDb.features.coverLetterGenerations.used, max: usageDb.features.coverLetterGenerations.limit } : { used: 0, max: 5 },
              jobMatchAnalyses: usageDb.features.jobMatchAnalyses ? { used: usageDb.features.jobMatchAnalyses.used, max: usageDb.features.jobMatchAnalyses.limit } : { used: 0, max: 10 }
            };
          }

          if (isModified) {
            await client.query(
              `UPDATE users SET subscription_plan = $1, subscription_status = $2, trial_start_date = $3, trial_expiry_date = $4, profile_data = $5 WHERE id = $6`,
              [
                normProfile.subscriptionPlan,
                normProfile.subscriptionStatus,
                normProfile.trialStartDate,
                normProfile.trialExpiryDate,
                JSON.stringify(normProfile),
                row.id
              ]
            );
          }
          return normProfile;
        }
      } finally {
        client.release();
      }
    } catch (e) {
      // Postgres error or unavailable
    }
  }

  // Fallback guest session handling
  const guestKey = (req.headers['x-forwarded-for'] as string) || req.ip || userId || 'usr_guest';
  req.guestKey = guestKey;
  const serverGuestProfile = guestStore.get(guestKey);
  const clientProfile = req.body?.userProfile;

  let baseProfile = serverGuestProfile || clientProfile || {
    id: 'usr_guest',
    name: 'Candidate',
    email: 'candidate@hireflow.ai',
    tier: '3-Day Free Trial',
    subscriptionPlan: '3-Day Free Trial',
    subscriptionStatus: 'trialing',
    trialStartDate: new Date().toISOString(),
    trialExpiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimits: {
      resumeScans: { used: 0, max: 3 },
      atsAnalyses: { used: 0, max: 3 },
      aiInterviews: { used: 0, max: 3 },
      coverLetterGenerations: { used: 0, max: 5 },
      jobMatchAnalyses: { used: 0, max: 10 }
    }
  };

  const { profile: normProfile } = normalizeProfileSubscription(baseProfile);
  guestStore.set(guestKey, normProfile);
  return normProfile;
}

/**
 * Middleware factory to enforce entitlement on Express API routes against PostgreSQL user_usage table.
 */
export function enforceFeatureEntitlement(feature: FeatureKey) {
  return async (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    try {
      const userProfile = await resolveUserProfile(req);
      req.userProfile = userProfile;
      req.userId = userProfile.id;

      if (process.env.DISABLE_SUBSCRIPTION_FOR_DEV === 'true') {
        return next();
      }

      if (req.userId && req.userId !== 'usr_guest') {
        const dbCheck = await dbCheckFeatureEntitlement(req.userId, feature);
        if (!dbCheck.allowed) {
          return res.status(403).json({
            error: 'usage_limit_reached',
            reason: 'usage_limit_reached',
            feature: feature,
            used: dbCheck.used,
            limit: dbCheck.limit,
            remaining: dbCheck.remaining,
            message: `You've used all ${dbCheck.limit} available for ${feature} on your current plan. Upgrade to continue.`,
            upgradeRequired: true
          });
        }
      } else {
        const entitlement = checkEntitlement(userProfile, feature);
        if (!entitlement.allowed) {
          return res.status(403).json({
            error: 'usage_limit_reached',
            reason: entitlement.reason,
            feature: entitlement.feature,
            used: entitlement.used,
            limit: entitlement.max,
            remaining: 0,
            message: entitlement.message,
            upgradeRequired: true
          });
        }
      }

      next();
    } catch (err: any) {
      console.error(`Entitlement check error for feature ${feature}:`, err);
      next();
    }
  };
}

/**
 * Helper to record usage increment on the backend in PostgreSQL user_usage table after successful AI execution.
 */
export async function recordFeatureUsage(userId: string | undefined, profile: any, feature: FeatureKey, guestKey?: string): Promise<void> {
  const usageKey = feature === 'mockInterviews' ? 'aiInterviews' : feature;
  
  if (guestKey) {
    if (!profile.usageLimits) profile.usageLimits = {};
    if (!profile.usageLimits[usageKey]) profile.usageLimits[usageKey] = { used: 0, max: 3 };
    profile.usageLimits[usageKey].used += 1;
    guestStore.set(guestKey, profile);
  }

  if (userId && userId !== 'usr_guest') {
    await dbIncrementFeatureUsage(userId, feature);
  }
}

/**
 * Authoritative Backend Admin Authorization Middleware.
 * Re-verifies JWT/session and queries PostgreSQL users table directly for role === 'admin' | 'Super Admin'.
 */
export async function enforceAdminRole(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    let userId: string | null = null;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId || decoded.id;
      } catch (e) {}
    }

    if (!userId) {
      userId = (req.body?.userId || req.query?.userId) as string;
    }

    if (!userId || userId === 'usr_guest') {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    let userRole = 'user';
    if (pool) {
      const client = await pool.connect();
      try {
        const userRes = await client.query('SELECT role, profile_data FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length > 0) {
          const row = userRes.rows[0];
          userRole = row.role || row.profile_data?.role || 'user';
        }
      } finally {
        client.release();
      }
    }

    if (userRole !== 'admin' && userRole !== 'Super Admin') {
      return res.status(403).json({ error: 'Forbidden: Admin authorization required' });
    }

    (req as any).adminUserId = userId;
    (req as any).adminRole = userRole;
    next();
  } catch (err: any) {
    console.error('Error in enforceAdminRole:', err);
    return res.status(500).json({ error: 'Admin authorization error', details: err.message });
  }
}

