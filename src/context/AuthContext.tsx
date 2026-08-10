import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ParsedResumeData } from '../types';
import { initialUserProfile } from '../data/mockData';
import { UserService } from '../services/userService';
import { 
  PlanName, 
  FeatureKey, 
  PLANS, 
  EntitlementCheckResult, 
  checkEntitlement as calculateEntitlement, 
  normalizeProfileSubscription 
} from '../data/planConfig';

export interface ResumeData {
  fileName?: string;
  fileText?: string;
  uploadedAt?: string;
  parsedData?: ParsedResumeData;
  atsScore?: number;
}

export interface UserStats {
  applicationsCount: number;
  interviewsCount: number;
  codingSolvedCount: number;
  resumeScansCount: number;
}

export interface FreeTrialState {
  isTrialActive: boolean;
  trialStartedAt: string | null;
  trialExpiryAt: string | null;
  daysRemaining: number;
  isExpired: boolean;
}

export interface UserState {
  profile: UserProfile | null;
  resume: ResumeData | null;
  stats: UserStats;
  freeTrial: FreeTrialState;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  state: UserState;
  login: (userProfileOrEmail?: UserProfile | string, name?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setResume: (resume: ResumeData | null) => void;
  startFreeTrial: () => void;
  selectPlan: (planName: PlanName) => Promise<void>;
  fastForwardTrial3Days: () => void;
  checkEntitlement: (feature: FeatureKey) => EntitlementCheckResult;
  incrementFeatureUsage: (feature: FeatureKey) => void;
  incrementApplications: () => void;
  incrementInterviews: () => void;
  incrementCodingSolved: () => void;
  updateStats: (updates: Partial<UserStats>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserState>(() => {
    const activeUserId = UserService.getActiveUserId();
    if (activeUserId) {
      const userAccount = UserService.getUserById(activeUserId);
      if (userAccount && userAccount.profile) {
        const { profile: normProfile } = normalizeProfileSubscription(userAccount.profile);
        const trialExpiryMs = normProfile.trialExpiryDate ? new Date(normProfile.trialExpiryDate).getTime() : 0;
        const nowMs = Date.now();
        const diffHours = trialExpiryMs > nowMs ? (trialExpiryMs - nowMs) / (1000 * 60 * 60) : 0;

        return {
          profile: normProfile,
          resume: null,
          stats: {
            applicationsCount: normProfile.appliedJobIds?.length || 0,
            interviewsCount: normProfile.interviewMetrics?.completedSessionsCount || 0,
            codingSolvedCount: normProfile.interviewMetrics?.solvedCodingCount || 0,
            resumeScansCount: normProfile.usageLimits?.atsAnalyses?.used || 0
          },
          freeTrial: {
            isTrialActive: normProfile.subscriptionStatus === 'trialing',
            trialStartedAt: normProfile.trialStartDate || null,
            trialExpiryAt: normProfile.trialExpiryDate || null,
            daysRemaining: Math.max(0, Math.ceil(diffHours / 24)),
            isExpired: normProfile.subscriptionStatus === 'expired'
          },
          isAuthenticated: true
        };
      }
    }

    // Default unauthenticated state
    return {
      profile: null,
      resume: null,
      stats: {
        applicationsCount: 0,
        interviewsCount: 0,
        codingSolvedCount: 0,
        resumeScansCount: 0
      },
      freeTrial: {
        isTrialActive: false,
        trialStartedAt: null,
        trialExpiryAt: null,
        daysRemaining: 3,
        isExpired: false
      },
      isAuthenticated: false
    };
  });

  // Verify session with server on initial mount
  useEffect(() => {
    UserService.getCurrentUserApi().then((res) => {
      if (res.success && res.user) {
        const rawProfile = res.user.profile;
        if (rawProfile) {
          const { profile: normProfile } = normalizeProfileSubscription(rawProfile);
          const trialExpiryMs = normProfile.trialExpiryDate ? new Date(normProfile.trialExpiryDate).getTime() : 0;
          const nowMs = Date.now();
          const diffHours = trialExpiryMs > nowMs ? (trialExpiryMs - nowMs) / (1000 * 60 * 60) : 0;

          setState(prev => ({
            ...prev,
            profile: normProfile,
            stats: {
              applicationsCount: normProfile.appliedJobIds?.length || 0,
              interviewsCount: normProfile.interviewMetrics?.completedSessionsCount || 0,
              codingSolvedCount: normProfile.interviewMetrics?.solvedCodingCount || 0,
              resumeScansCount: normProfile.usageLimits?.atsAnalyses?.used || 0
            },
            freeTrial: {
              isTrialActive: normProfile.subscriptionStatus === 'trialing',
              trialStartedAt: normProfile.trialStartDate || null,
              trialExpiryAt: normProfile.trialExpiryDate || null,
              daysRemaining: Math.max(0, Math.ceil(diffHours / 24)),
              isExpired: normProfile.subscriptionStatus === 'expired'
            },
            isAuthenticated: true
          }));
        }
      }
    }).catch(() => {});
  }, []);

  const checkEntitlement = (feature: FeatureKey): EntitlementCheckResult => {
    if (!state.profile) {
      return {
        allowed: false,
        reason: 'trial_expired',
        feature,
        featureName: feature,
        used: 0,
        max: 0,
        planName: '3-Day Free Trial',
        message: 'Please sign in to access HireFlow AI career tools.'
      };
    }

    return calculateEntitlement(state.profile, feature);
  };

  const incrementFeatureUsage = (feature: FeatureKey) => {
    setState(prev => {
      if (!prev.profile) return prev;
      const usageKey = feature === 'mockInterviews' ? 'aiInterviews' : feature;
      const currentLimits = prev.profile.usageLimits || {
        resumeScans: { used: 0, max: 3 },
        atsAnalyses: { used: 0, max: 3 },
        aiInterviews: { used: 0, max: 0 },
        coverLetterGenerations: { used: 0, max: 3 },
        jobMatchAnalyses: { used: 0, max: 5 }
      };

      const updatedLimits = {
        ...currentLimits,
        [usageKey]: {
          ...(currentLimits as any)[usageKey],
          used: ((currentLimits as any)[usageKey]?.used || 0) + 1
        }
      };

      const updatedProfile: UserProfile = {
        ...prev.profile,
        usageLimits: updatedLimits
      };

      UserService.updateUserProfile(prev.profile.id, { usageLimits: updatedLimits });

      return {
        ...prev,
        profile: updatedProfile,
        stats: {
          ...prev.stats,
          resumeScansCount: updatedLimits.atsAnalyses?.used || prev.stats.resumeScansCount
        }
      };
    });
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setState(prev => {
      if (!prev.profile) return prev;
      const merged = { ...prev.profile, ...updates };
      const { profile: normProfile } = normalizeProfileSubscription(merged);

      const updatedProfile = UserService.updateUserProfile(prev.profile.id, normProfile) || normProfile;
      UserService.updateProfileApi(updates).catch(() => {});

      const trialExpiryMs = normProfile.trialExpiryDate ? new Date(normProfile.trialExpiryDate).getTime() : 0;
      const nowMs = Date.now();
      const diffHours = trialExpiryMs > nowMs ? (trialExpiryMs - nowMs) / (1000 * 60 * 60) : 0;

      return {
        ...prev,
        profile: updatedProfile,
        freeTrial: {
          isTrialActive: normProfile.subscriptionStatus === 'trialing',
          trialStartedAt: normProfile.trialStartDate || null,
          trialExpiryAt: normProfile.trialExpiryDate || null,
          daysRemaining: Math.max(0, Math.ceil(diffHours / 24)),
          isExpired: normProfile.subscriptionStatus === 'expired'
        }
      };
    });
  };

  const selectPlan = async (planName: PlanName) => {
    const planDef = PLANS[planName];
    if (!planDef) return;

    try {
      const res = await fetch('/api/subscription/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName, userId: state.profile?.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          updateProfile(data.profile);
          return;
        }
      }
    } catch (e) {}

    // Fallback local update if backend un-reachable
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    updateProfile({
      subscriptionPlan: planName,
      subscriptionStatus: planName === '3-Day Free Trial' ? 'trialing' : 'active',
      tier: planName === 'Pro' ? 'Gold Tier' : (planName === 'Premium' ? 'Premium Plan' : (planName === 'Basic' ? 'Basic' : '3-Day Free Trial')),
      hasSelectedPlan: true,
      nextBillingDate: nextMonth.toISOString().split('T')[0],
      usageLimits: {
        resumeScans: { used: 0, max: planDef.limits.atsAnalyses },
        atsAnalyses: { used: 0, max: planDef.limits.atsAnalyses },
        aiInterviews: { used: 0, max: planDef.limits.mockInterviews },
        coverLetterGenerations: { used: 0, max: planDef.limits.coverLetterGenerations },
        jobMatchAnalyses: { used: 0, max: planDef.limits.jobMatchAnalyses }
      }
    });
  };

  const fastForwardTrial3Days = () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    updateProfile({
      subscriptionStatus: 'expired',
      tier: '3-Day Free Trial',
      trialExpiryDate: pastDate
    });
  };

  const setResume = (resume: ResumeData | null) => {
    setState(prev => {
      if (!prev.profile) return prev;
      const updates = {
        resumeText: resume?.fileText || prev.profile.resumeText,
        atsScore: resume?.atsScore !== undefined ? resume.atsScore : prev.profile.atsScore
      };
      const updatedProfile = UserService.updateUserProfile(prev.profile.id, updates) || {
        ...prev.profile,
        ...updates
      };

      return {
        ...prev,
        resume,
        profile: updatedProfile
      };
    });
  };

  const startFreeTrial = () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const startDateStr = now.toISOString();
    const expiryDateStr = expiry.toISOString();

    setState(prev => {
      if (!prev.profile) return prev;
      const updates = {
        subscriptionStatus: 'trialing' as const,
        subscriptionPlan: '3-Day Free Trial' as const,
        tier: '3-Day Free Trial' as const,
        hasSelectedPlan: true,
        trialStartDate: startDateStr,
        trialExpiryDate: expiryDateStr
      };
      const updatedProfile = UserService.updateUserProfile(prev.profile.id, updates) || {
        ...prev.profile,
        ...updates
      };

      return {
        ...prev,
        profile: updatedProfile,
        freeTrial: {
          isTrialActive: true,
          trialStartedAt: startDateStr,
          trialExpiryAt: expiryDateStr,
          daysRemaining: 3,
          isExpired: false
        }
      };
    });
  };

  const incrementApplications = () => {
    setState(prev => {
      if (!prev.profile) return prev;
      const newApplied = [...(prev.profile.appliedJobIds || []), `app_${Date.now()}`];
      const updatedProfile = UserService.updateUserProfile(prev.profile.id, {
        appliedJobIds: newApplied
      }) || {
        ...prev.profile,
        appliedJobIds: newApplied
      };

      return {
        ...prev,
        stats: {
          ...prev.stats,
          applicationsCount: prev.stats.applicationsCount + 1
        },
        profile: updatedProfile
      };
    });
  };

  const incrementInterviews = () => {
    setState(prev => {
      if (!prev.profile) return prev;
      const newCount = prev.stats.interviewsCount + 1;
      const newMetrics = {
        ...(prev.profile.interviewMetrics || {}),
        completedSessionsCount: newCount
      };
      const updatedProfile = UserService.updateUserProfile(prev.profile.id, {
        interviewMetrics: newMetrics
      }) || {
        ...prev.profile,
        interviewMetrics: newMetrics
      };

      return {
        ...prev,
        stats: {
          ...prev.stats,
          interviewsCount: newCount
        },
        profile: updatedProfile
      };
    });
  };

  const incrementCodingSolved = () => {
    setState(prev => {
      if (!prev.profile) return prev;
      const newCount = prev.stats.codingSolvedCount + 1;
      const newMetrics = {
        ...(prev.profile.interviewMetrics || {}),
        solvedCodingCount: newCount
      };
      const updatedProfile = UserService.updateUserProfile(prev.profile.id, {
        interviewMetrics: newMetrics
      }) || {
        ...prev.profile,
        interviewMetrics: newMetrics
      };

      return {
        ...prev,
        stats: {
          ...prev.stats,
          codingSolvedCount: newCount
        },
        profile: updatedProfile
      };
    });
  };

  const updateStats = (updates: Partial<UserStats>) => {
    setState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        ...updates
      }
    }));
  };

  const login = (userProfileOrEmail?: UserProfile | string, name?: string) => {
    let targetProfile: UserProfile | null = null;

    if (userProfileOrEmail && typeof userProfileOrEmail === 'object') {
      targetProfile = userProfileOrEmail;
      UserService.setActiveUserId(targetProfile.id);
    } else if (typeof userProfileOrEmail === 'string') {
      const authRes = UserService.authenticateUser({ email: userProfileOrEmail });
      if (authRes.user) {
        targetProfile = authRes.user.profile;
      }
    }

    if (!targetProfile) {
      const activeId = UserService.getActiveUserId();
      if (activeId) {
        const acc = UserService.getUserById(activeId);
        if (acc) targetProfile = acc.profile;
      }
    }

    if (!targetProfile) {
      // Fallback fallback
      const authRes = UserService.authenticateUser({ email: 'pranshupatel3222@gmail.com' });
      targetProfile = authRes.user?.profile || null;
    }

    if (targetProfile) {
      UserService.setActiveUserId(targetProfile.id);
      setState({
        profile: targetProfile,
        resume: null,
        stats: {
          applicationsCount: targetProfile.appliedJobIds?.length || 0,
          interviewsCount: targetProfile.interviewMetrics?.completedSessionsCount || 0,
          codingSolvedCount: targetProfile.interviewMetrics?.solvedCodingCount || 0,
          resumeScansCount: targetProfile.usageLimits?.atsAnalyses?.used || 0
        },
        freeTrial: {
          isTrialActive: targetProfile.subscriptionStatus === 'trialing',
          trialStartedAt: targetProfile.trialStartDate || null,
          trialExpiryAt: targetProfile.trialExpiryDate || null,
          daysRemaining: 3,
          isExpired: false
        },
        isAuthenticated: true
      });
    }
  };

  const logout = () => {
    UserService.clearActiveSession();
    setState({
      profile: null,
      resume: null,
      stats: {
        applicationsCount: 0,
        interviewsCount: 0,
        codingSolvedCount: 0,
        resumeScansCount: 0
      },
      freeTrial: {
        isTrialActive: false,
        trialStartedAt: null,
        trialExpiryAt: null,
        daysRemaining: 3,
        isExpired: false
      },
      isAuthenticated: false
    });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
        updateProfile,
        setResume,
        startFreeTrial,
        selectPlan,
        fastForwardTrial3Days,
        checkEntitlement,
        incrementFeatureUsage,
        incrementApplications,
        incrementInterviews,
        incrementCodingSolved,
        updateStats
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

