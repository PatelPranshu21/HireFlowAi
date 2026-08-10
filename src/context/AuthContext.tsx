import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ParsedResumeData } from '../types';
import { initialUserProfile } from '../data/mockData';
import { UserService } from '../services/userService';

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
        return {
          profile: userAccount.profile,
          resume: null,
          stats: {
            applicationsCount: userAccount.profile.appliedJobIds?.length || 0,
            interviewsCount: userAccount.profile.interviewMetrics?.completedSessionsCount || 0,
            codingSolvedCount: userAccount.profile.interviewMetrics?.solvedCodingCount || 0,
            resumeScansCount: userAccount.profile.usageLimits?.atsAnalyses?.used || 0
          },
          freeTrial: {
            isTrialActive: userAccount.profile.subscriptionStatus === 'trialing',
            trialStartedAt: userAccount.profile.trialStartDate || null,
            trialExpiryAt: userAccount.profile.trialExpiryDate || null,
            daysRemaining: 3,
            isExpired: false
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
        const userProfile = res.user.profile;
        if (userProfile) {
          setState(prev => ({
            ...prev,
            profile: userProfile,
            stats: {
              applicationsCount: userProfile.appliedJobIds?.length || 0,
              interviewsCount: userProfile.interviewMetrics?.completedSessionsCount || 0,
              codingSolvedCount: userProfile.interviewMetrics?.solvedCodingCount || 0,
              resumeScansCount: userProfile.usageLimits?.atsAnalyses?.used || 0
            },
            freeTrial: {
              isTrialActive: userProfile.subscriptionStatus === 'trialing',
              trialStartedAt: userProfile.trialStartDate || null,
              trialExpiryAt: userProfile.trialExpiryDate || null,
              daysRemaining: 3,
              isExpired: false
            },
            isAuthenticated: true
          }));
        }
      }
    }).catch(() => {});
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setState(prev => {
      if (!prev.profile) return prev;
      const updatedProfile = UserService.updateUserProfile(prev.profile.id, updates) || {
        ...prev.profile,
        ...updates
      };
      UserService.updateProfileApi(updates).catch(() => {});
      return {
        ...prev,
        profile: updatedProfile
      };
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

