import { UserProfile, UsageLimits } from '../types';

export type PlanName = '3-Day Free Trial' | 'Basic' | 'Pro' | 'Premium';
export type FeatureKey = 'atsAnalyses' | 'coverLetterGenerations' | 'mockInterviews' | 'jobMatchAnalyses' | 'bulletRewrites';

export interface PlanEntitlements {
  name: PlanName;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  durationDays?: number;
  limits: {
    atsAnalyses: number; // -1 for unlimited
    coverLetterGenerations: number;
    mockInterviews: number;
    jobMatchAnalyses: number;
    bulletRewrites: number;
  };
  features: string[];
}

export const FEATURE_NAMES: Record<FeatureKey, string> = {
  atsAnalyses: 'ATS Resume Audits',
  coverLetterGenerations: 'AI Cover Letter Generations',
  mockInterviews: 'AI Mock Interview Prep Sessions',
  jobMatchAnalyses: 'Job Description Match Analyses',
  bulletRewrites: '1-Click AI Bullet Rewrites'
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
      mockInterviews: 0,
      jobMatchAnalyses: 5,
      bulletRewrites: 5
    },
    features: [
      'Full ATS Resume Scoring',
      'Maximum 3 AI Cover Letter Generations',
      'AI Job Recommendation Engine',
      'Preserves all saved user data after expiration'
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
      mockInterviews: 0,
      jobMatchAnalyses: -1,
      bulletRewrites: -1
    },
    features: [
      '10 ATS Resume Audits / mo',
      '10 AI Cover Letters / mo',
      '1-Click AI Bullet Rewriter',
      'Job Matcher & Keyword Gap Finder',
      'Email Support'
    ]
  },
  'Pro': {
    name: 'Pro',
    priceMonthly: 19,
    priceYearly: 15,
    description: 'Complete career acceleration suite for tech professionals targeting top roles.',
    limits: {
      atsAnalyses: -1,
      coverLetterGenerations: -1,
      mockInterviews: 30,
      jobMatchAnalyses: -1,
      bulletRewrites: -1
    },
    features: [
      'Unlimited ATS Resume Audits',
      'Unlimited Bullet Rewriting & Impact Metrics',
      'Unlimited Job Description Matching',
      'Unlimited AI Cover Letter Studio',
      '30 AI Mock Interview Prep Sessions / mo',
      'STAR Framework Detailed Scoring',
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
      bulletRewrites: -1
    },
    features: [
      'Everything in Pro Plan',
      'Unlimited AI Mock Interview Coach',
      'LinkedIn Headline & Strategy Suite',
      'Salary Negotiation Counteroffer Scripts',
      'Dedicated AI Career Coach Assistant'
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
  if (planName === '3-Day Free Trial' || updatedProfile.subscriptionStatus === 'trialing') {
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
      if (updatedProfile.subscriptionStatus !== 'expired') {
        updatedProfile.subscriptionStatus = 'expired';
        updatedProfile.tier = '3-Day Free Trial';
        isModified = true;
      }
    } else {
      if (updatedProfile.subscriptionStatus !== 'trialing') {
        updatedProfile.subscriptionStatus = 'trialing';
        isModified = true;
      }
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
  const { profile: normProfile } = normalizeProfileSubscription(profile);
  const planName = (normProfile.subscriptionPlan as PlanName) || '3-Day Free Trial';
  const planDef = PLANS[planName] || PLANS['3-Day Free Trial'];
  const featureName = FEATURE_NAMES[feature] || feature;

  // 1. Check if trial is expired
  if (normProfile.subscriptionStatus === 'expired') {
    return {
      allowed: false,
      reason: 'trial_expired',
      feature,
      featureName,
      used: normProfile.usageLimits?.[feature === 'mockInterviews' ? 'aiInterviews' : feature]?.used || 0,
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

  // Quota limited feature
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
