import { UserProfile, UsageLimits } from '../types';

export type PlanName = '3-Day Free Trial' | 'Basic' | 'Pro' | 'Premium';
export type FeatureKey = 'atsAnalyses' | 'coverLetterGenerations' | 'mockInterviews' | 'jobMatchAnalyses' | 'bulletRewrites' | 'resumeUploads' | 'savedJobs';

export interface PlanEntitlements {
  name: PlanName;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  durationDays?: number;
  popular?: boolean;
  limits: {
    atsAnalyses: number; // -1 for unlimited
    coverLetterGenerations: number;
    mockInterviews: number;
    jobMatchAnalyses: number;
    bulletRewrites: number;
    resumeUploads: number;
    savedJobs: number;
  };
  features: string[];
}

export function isDevSubscriptionDisabled(): boolean {
  try {
    if (typeof process !== 'undefined' && (process.env?.DISABLE_SUBSCRIPTION_FOR_DEV === 'true' || process.env?.VITE_DISABLE_SUBSCRIPTION_FOR_DEV === 'true')) {
      return true;
    }
    if (typeof window !== 'undefined' && ((window as any).__DISABLE_SUBSCRIPTION_FOR_DEV === true || (window as any).VITE_DISABLE_SUBSCRIPTION_FOR_DEV === 'true')) {
      return true;
    }
  } catch (e) {}
  return false;
}

export const FEATURE_NAMES: Record<FeatureKey, string> = {
  atsAnalyses: 'ATS Resume Audits',
  coverLetterGenerations: 'AI Cover Letter Generations',
  mockInterviews: 'AI Mock Interview Prep Sessions',
  jobMatchAnalyses: 'Job Description Match Analyses',
  bulletRewrites: '1-Click AI Bullet Rewrites',
  resumeUploads: 'Resume Uploads / Versions Allowed',
  savedJobs: 'Saved Jobs'
};

export const PLANS: Record<PlanName, PlanEntitlements> = {
  '3-Day Free Trial': {
    name: '3-Day Free Trial',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Explore full ATS scoring and AI matchers with 3 days unrestricted access.',
    durationDays: 3,
    limits: {
      atsAnalyses: 3,
      coverLetterGenerations: 3,
      mockInterviews: 5,
      jobMatchAnalyses: 5,
      bulletRewrites: 5,
      resumeUploads: 1,
      savedJobs: 10
    },
    features: [
      '3 Resume Scans / month',
      '3 ATS Score Analyses / month',
      '5 AI Interview Questions / month',
      '3 Cover Letter Generations / month',
      '5 Job Match Analyses / month',
      'Basic Preview Career Roadmap',
      'Limited AI Career Coach',
      '1 Resume Version Allowed',
      '10 Saved Jobs Limit',
      'Community Support'
    ]
  },
  'Basic': {
    name: 'Basic',
    priceMonthly: 9,
    priceYearly: 7,
    description: 'Essential AI resume tools for active job seekers sending weekly applications.',
    limits: {
      atsAnalyses: 10,
      coverLetterGenerations: 10,
      mockInterviews: 5,
      jobMatchAnalyses: 15,
      bulletRewrites: 15,
      resumeUploads: 3,
      savedJobs: 25
    },
    features: [
      '10 Resume Scans / month',
      '10 ATS Score Analyses / month',
      '5 AI Interview Sessions / month',
      '10 Cover Letter Generations / month',
      '15 Job Match Analyses / month',
      'Standard Career Roadmap',
      'Standard AI Career Coach',
      '3 Resume Versions Allowed',
      '25 Saved Jobs Limit',
      'Email Support'
    ]
  },
  'Pro': {
    name: 'Pro',
    priceMonthly: 19,
    priceYearly: 15,
    description: 'Complete career acceleration suite for tech professionals targeting top roles.',
    popular: true,
    limits: {
      atsAnalyses: 100,
      coverLetterGenerations: 100,
      mockInterviews: 30,
      jobMatchAnalyses: 100,
      bulletRewrites: 100,
      resumeUploads: 10,
      savedJobs: 100
    },
    features: [
      '100 Resume Scans / month (Unlimited)',
      '100 ATS Score Analyses / month (Unlimited)',
      '30 AI Interview Sessions / month',
      '100 Cover Letter Generations / month (Unlimited)',
      '100 Job Match Analyses / month (Unlimited)',
      'Full Adaptive Career Roadmap',
      '24/7 Priority AI Career Coach',
      '10 Resume Versions Allowed',
      '100 Saved Jobs Limit',
      'Priority 24/7 Support'
    ]
  },
  'Premium': {
    name: 'Premium',
    priceMonthly: 39,
    priceYearly: 31,
    description: 'Maximum power with 1-on-1 AI Career Coach & live negotiation guidance.',
    limits: {
      atsAnalyses: -1,
      coverLetterGenerations: -1,
      mockInterviews: -1,
      jobMatchAnalyses: -1,
      bulletRewrites: -1,
      resumeUploads: -1,
      savedJobs: -1
    },
    features: [
      'Unlimited Resume Scans / month',
      'Unlimited ATS Score Analyses / month',
      'Unlimited AI Interview Sessions / month',
      'Unlimited Cover Letter Generations / month',
      'Unlimited Job Match Analyses / month',
      'Executive Strategy Career Roadmap',
      'Dedicated 1-on-1 AI Career Coach',
      'Unlimited Resume Versions Allowed',
      'Unlimited Saved Jobs Limit',
      'Dedicated Manager Support'
    ]
  }
};

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: 'limit_reached' | 'trial_expired' | 'feature_not_in_plan';
  feature: FeatureKey;
  featureName: string;
  used: number;
  max: number;
  planName: PlanName;
  message: string;
}

/**
 * Normalizes and checks trial expiration or monthly billing period reset.
 * Returns the evaluated profile state.
 */
export function normalizeProfileSubscription(profile: UserProfile): {
  profile: UserProfile;
  isModified: boolean;
} {
  const now = new Date();
  const nowMs = now.getTime();
  let isModified = false;
  const updatedProfile: UserProfile = { ...profile };

  // 1. Determine Plan Name
  let planName: PlanName = (updatedProfile.subscriptionPlan as PlanName) || '3-Day Free Trial';
  if (!PLANS[planName]) {
    planName = '3-Day Free Trial';
    updatedProfile.subscriptionPlan = planName;
    isModified = true;
  }

  const planDef = PLANS[planName];

  // 2. Check 3-Day Free Trial Expiration
  if (planName === '3-Day Free Trial' || updatedProfile.subscriptionStatus === 'trialing' || updatedProfile.subscriptionStatus === 'expired') {
    let trialExpiryMs = 0;
    if (updatedProfile.trialExpiryDate) {
      trialExpiryMs = new Date(updatedProfile.trialExpiryDate).getTime();
    } else if (updatedProfile.trialStartDate) {
      trialExpiryMs = new Date(updatedProfile.trialStartDate).getTime() + 3 * 24 * 60 * 60 * 1000;
      updatedProfile.trialExpiryDate = new Date(trialExpiryMs).toISOString();
      isModified = true;
    } else {
      // Start trial now
      const startIso = now.toISOString();
      trialExpiryMs = nowMs + 3 * 24 * 60 * 60 * 1000;
      const expiryIso = new Date(trialExpiryMs).toISOString();
      updatedProfile.trialStartDate = startIso;
      updatedProfile.trialExpiryDate = expiryIso;
      updatedProfile.subscriptionStatus = 'trialing';
      isModified = true;
    }

    if (nowMs >= trialExpiryMs) {
      if (isDevSubscriptionDisabled()) {
        updatedProfile.subscriptionStatus = 'trialing';
      } else if (updatedProfile.subscriptionStatus !== 'expired') {
        updatedProfile.subscriptionStatus = 'expired';
        updatedProfile.tier = '3-Day Free Trial';
        isModified = true;
      }
    } else if (updatedProfile.subscriptionStatus !== 'trialing' && updatedProfile.subscriptionStatus !== 'expired') {
      updatedProfile.subscriptionStatus = 'trialing';
      isModified = true;
    }
  }

  // 3. Billing Period & Monthly Reset Check for Paid Plans
  if (planName === 'Basic' || planName === 'Pro' || planName === 'Premium') {
    if (updatedProfile.subscriptionStatus === 'expired') {
      // Re-activate if explicit paid plan selected
      updatedProfile.subscriptionStatus = 'active';
      isModified = true;
    }

    // Initialize or check monthly period
    let periodEndMs = updatedProfile.nextBillingDate
      ? new Date(updatedProfile.nextBillingDate).getTime()
      : 0;

    if (!periodEndMs || isNaN(periodEndMs)) {
      const nextMonth = new Date(nowMs + 30 * 24 * 60 * 60 * 1000);
      updatedProfile.nextBillingDate = nextMonth.toISOString().split('T')[0];
      periodEndMs = nextMonth.getTime();
      isModified = true;
    }

    // Monthly usage reset if period expired
    if (nowMs >= periodEndMs) {
      const newNextBilling = new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      updatedProfile.nextBillingDate = newNextBilling;
      
      // Reset usage counters
      updatedProfile.usageLimits = {
        resumeScans: { used: 0, max: planDef.limits.atsAnalyses },
        atsAnalyses: { used: 0, max: planDef.limits.atsAnalyses },
        aiInterviews: { used: 0, max: planDef.limits.mockInterviews },
        coverLetterGenerations: { used: 0, max: planDef.limits.coverLetterGenerations },
        jobMatchAnalyses: { used: 0, max: planDef.limits.jobMatchAnalyses }
      };
      isModified = true;
    }
  }

  // 4. Ensure usageLimits exists and aligns with current plan definition max values
  const currentUsage = updatedProfile.usageLimits || {
    resumeScans: { used: 0, max: planDef.limits.atsAnalyses },
    atsAnalyses: { used: 0, max: planDef.limits.atsAnalyses },
    aiInterviews: { used: 0, max: planDef.limits.mockInterviews },
    coverLetterGenerations: { used: 0, max: planDef.limits.coverLetterGenerations },
    jobMatchAnalyses: { used: 0, max: planDef.limits.jobMatchAnalyses }
  };

  updatedProfile.usageLimits = {
    resumeScans: { used: currentUsage.resumeScans?.used || 0, max: planDef.limits.atsAnalyses },
    atsAnalyses: { used: currentUsage.atsAnalyses?.used || 0, max: planDef.limits.atsAnalyses },
    aiInterviews: { used: currentUsage.aiInterviews?.used || 0, max: planDef.limits.mockInterviews },
    coverLetterGenerations: { used: currentUsage.coverLetterGenerations?.used || 0, max: planDef.limits.coverLetterGenerations },
    jobMatchAnalyses: { used: currentUsage.jobMatchAnalyses?.used || 0, max: planDef.limits.jobMatchAnalyses }
  };

  return { profile: updatedProfile, isModified };
}

/**
 * Checks if user is permitted to consume a specific feature based on current plan & usage.
 */
export function checkEntitlement(
  profile: UserProfile,
  feature: FeatureKey
): EntitlementCheckResult {
  const isDevDisabled = isDevSubscriptionDisabled();

  const featureName = FEATURE_NAMES[feature] || feature;

  if (isDevDisabled) {
    return {
      allowed: true,
      feature,
      featureName,
      used: 0,
      max: -1,
      planName: 'Pro',
      message: 'Subscription bypassed for development testing.'
    };
  }

  const { profile: normProfile } = normalizeProfileSubscription(profile);
  const planName = (normProfile.subscriptionPlan as PlanName) || '3-Day Free Trial';
  const planDef = PLANS[planName] || PLANS['3-Day Free Trial'];

  // 1. Check if trial is expired
  if (normProfile.subscriptionStatus === 'expired') {
    return {
      allowed: false,
      reason: 'trial_expired',
      feature,
      featureName,
      used: normProfile.usageLimits?.[feature === 'mockInterviews' ? 'aiInterviews' : (feature === 'resumeUploads' ? 'resumeScans' : feature)]?.used || 0,
      max: planDef.limits[feature],
      planName,
      message: 'Your 3-Day Free Trial has expired. Your saved profile, resume data, and history remain safely preserved. Please upgrade your plan to continue using AI tools.'
    };
  }

  // 2. Determine max allowed for feature in current plan
  const maxAllowed = planDef.limits[feature];

  // Feature not included in plan (limit = 0)
  if (maxAllowed === 0) {
    return {
      allowed: false,
      reason: 'feature_not_in_plan',
      feature,
      featureName,
      used: 0,
      max: 0,
      planName,
      message: `${featureName} is not included in the ${planName} plan. Upgrade to Pro or Premium to unlock this feature.`
    };
  }

  // Check specific feature limits:
  // A. Resume Versions Allowed (resumeUploads)
  if (feature === 'resumeUploads') {
    const versionCount = normProfile.resumeVersions?.length || 0;
    const scanCount = normProfile.usageLimits?.resumeScans?.used || normProfile.usageLimits?.atsAnalyses?.used || 0;

    // Check version limit
    if (maxAllowed !== -1 && versionCount >= maxAllowed) {
      return {
        allowed: false,
        reason: 'limit_reached',
        feature,
        featureName,
        used: versionCount,
        max: maxAllowed,
        planName,
        message: `You've reached the limit of ${maxAllowed} resume version${maxAllowed > 1 ? 's' : ''} allowed on your ${planName} plan. Upgrade to add more versions or delete an older version.`
      };
    }

    // Check monthly scan limit
    if (planDef.limits.atsAnalyses !== -1 && scanCount >= planDef.limits.atsAnalyses) {
      return {
        allowed: false,
        reason: 'limit_reached',
        feature: 'atsAnalyses',
        featureName: 'Resume Scans / ATS Analyses',
        used: scanCount,
        max: planDef.limits.atsAnalyses,
        planName,
        message: `You've used all ${planDef.limits.atsAnalyses} Resume Scans / ATS Analyses included in your ${planName} plan this billing month.`
      };
    }

    return {
      allowed: true,
      feature,
      featureName,
      used: versionCount,
      max: maxAllowed,
      planName,
      message: `${maxAllowed === -1 ? 'Unlimited' : maxAllowed - versionCount} resume version${maxAllowed === 1 ? '' : 's'} available.`
    };
  }

  // B. Saved Jobs Limit
  if (feature === 'savedJobs') {
    const savedCount = normProfile.savedJobIds?.length || 0;
    if (maxAllowed !== -1 && savedCount >= maxAllowed) {
      return {
        allowed: false,
        reason: 'limit_reached',
        feature,
        featureName,
        used: savedCount,
        max: maxAllowed,
        planName,
        message: `You've reached the maximum limit of ${maxAllowed} saved jobs on your ${planName} plan. Upgrade to save more jobs.`
      };
    }
    return {
      allowed: true,
      feature,
      featureName,
      used: savedCount,
      max: maxAllowed,
      planName,
      message: `${maxAllowed === -1 ? 'Unlimited' : maxAllowed - savedCount} saved jobs remaining.`
    };
  }

  // Unlimited feature (limit = -1)
  if (maxAllowed === -1) {
    return {
      allowed: true,
      feature,
      featureName,
      used: normProfile.usageLimits?.[feature === 'mockInterviews' ? 'aiInterviews' : feature]?.used || 0,
      max: -1,
      planName,
      message: `Unlimited access on ${planName} plan.`
    };
  }

  // Quota limited monthly feature
  const usageKey = feature === 'mockInterviews' ? 'aiInterviews' : feature;
  const currentUsed = normProfile.usageLimits?.[usageKey]?.used || 0;

  if (currentUsed >= maxAllowed) {
    return {
      allowed: false,
      reason: 'limit_reached',
      feature,
      featureName,
      used: currentUsed,
      max: maxAllowed,
      planName,
      message: `You've used all ${maxAllowed} ${featureName} included in your ${planName} plan this billing month.`
    };
  }

  return {
    allowed: true,
    feature,
    featureName,
    used: currentUsed,
    max: maxAllowed,
    planName,
    message: `${maxAllowed - currentUsed} ${featureName} remaining.`
  };
}
