import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { PLANS, FeatureKey, checkEntitlement, normalizeProfileSubscription } from '../src/data/planConfig';

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
      aiInterviews: { used: 0, max: 0 },
      coverLetterGenerations: { used: 0, max: 3 },
      jobMatchAnalyses: { used: 0, max: 5 }
    }
  };

  // If server guest store exists, merge usage taking higher 'used' value
  if (serverGuestProfile && clientProfile) {
    baseProfile = {
      ...clientProfile,
      subscriptionPlan: serverGuestProfile.subscriptionPlan || clientProfile.subscriptionPlan,
      subscriptionStatus: serverGuestProfile.subscriptionStatus || clientProfile.subscriptionStatus,
      trialStartDate: serverGuestProfile.trialStartDate || clientProfile.trialStartDate,
      trialExpiryDate: serverGuestProfile.trialExpiryDate || clientProfile.trialExpiryDate,
      usageLimits: {
        resumeScans: {
          used: Math.max(serverGuestProfile.usageLimits?.resumeScans?.used || 0, clientProfile.usageLimits?.resumeScans?.used || 0),
          max: serverGuestProfile.usageLimits?.resumeScans?.max || 3
        },
        atsAnalyses: {
          used: Math.max(serverGuestProfile.usageLimits?.atsAnalyses?.used || 0, clientProfile.usageLimits?.atsAnalyses?.used || 0),
          max: serverGuestProfile.usageLimits?.atsAnalyses?.max || 3
        },
        aiInterviews: {
          used: Math.max(serverGuestProfile.usageLimits?.aiInterviews?.used || 0, clientProfile.usageLimits?.aiInterviews?.used || 0),
          max: serverGuestProfile.usageLimits?.aiInterviews?.max || 0
        },
        coverLetterGenerations: {
          used: Math.max(serverGuestProfile.usageLimits?.coverLetterGenerations?.used || 0, clientProfile.usageLimits?.coverLetterGenerations?.used || 0),
          max: serverGuestProfile.usageLimits?.coverLetterGenerations?.max || 3
        },
        jobMatchAnalyses: {
          used: Math.max(serverGuestProfile.usageLimits?.jobMatchAnalyses?.used || 0, clientProfile.usageLimits?.jobMatchAnalyses?.used || 0),
          max: serverGuestProfile.usageLimits?.jobMatchAnalyses?.max || 5
        }
      }
    };
  }

  const { profile: normProfile } = normalizeProfileSubscription(baseProfile);
  guestStore.set(guestKey, normProfile);
  return normProfile;
}

/**
 * Middleware factory to enforce entitlement on Express API routes.
 */
export function enforceFeatureEntitlement(feature: FeatureKey) {
  return async (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    try {
      const userProfile = await resolveUserProfile(req);
      req.userProfile = userProfile;
      req.userId = userProfile.id;

      const entitlement = checkEntitlement(userProfile, feature);

      if (!entitlement.allowed) {
        return res.status(403).json({
          error: 'entitlement_denied',
          reason: entitlement.reason,
          feature: entitlement.feature,
          featureName: entitlement.featureName,
          used: entitlement.used,
          max: entitlement.max,
          planName: entitlement.planName,
          message: entitlement.message,
          upgradeRequired: true
        });
      }

      next();
    } catch (err: any) {
      console.error(`Entitlement check error for feature ${feature}:`, err);
      next();
    }
  };
}

/**
 * Helper to record usage increment on the backend after successful AI execution.
 */
export async function recordFeatureUsage(userId: string | undefined, profile: any, feature: FeatureKey, guestKey?: string): Promise<void> {
  const usageKey = feature === 'mockInterviews' ? 'aiInterviews' : feature;
  
  if (!profile.usageLimits) profile.usageLimits = {};
  if (!profile.usageLimits[usageKey]) {
    profile.usageLimits[usageKey] = { used: 0, max: 3 };
  }

  profile.usageLimits[usageKey].used += 1;

  if (guestKey) {
    guestStore.set(guestKey, profile);
  }

  if (userId && userId !== 'usr_guest') {
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE users SET profile_data = $1 WHERE id = $2`,
          [JSON.stringify(profile), userId]
        );
      } finally {
        client.release();
      }
    } catch (e) {}
  }
}

