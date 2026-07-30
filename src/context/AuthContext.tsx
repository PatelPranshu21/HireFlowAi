import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ParsedResumeData } from '../types';
import { initialUserProfile } from '../data/mockData';

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
  login: (email?: string, name?: string) => void;
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

const AUTH_STORAGE_KEY = 'hireflow_auth_state_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load auth state from storage', e);
    }

    const defaultProfile: UserProfile = {
      ...initialUserProfile,
      id: 'usr_auth_1',
      name: 'Parnshu Patel',
      email: 'pranshupatel3222@gmail.com',
      avatar: '',
      trialStartDate: undefined,
      trialExpiryDate: undefined,
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
      appliedJobIds: [],
      savedJobIds: [],
      atsScore: 0
    };

    return {
      profile: defaultProfile,
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
      isAuthenticated: true
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist auth state', e);
    }
  }, [state]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setState(prev => {
      if (!prev.profile) return prev;
      const updatedProfile = { ...prev.profile, ...updates };
      return {
        ...prev,
        profile: updatedProfile
      };
    });
  };

  const setResume = (resume: ResumeData | null) => {
    setState(prev => {
      const updatedProfile = prev.profile ? {
        ...prev.profile,
        resumeText: resume?.fileText || prev.profile.resumeText,
        atsScore: resume?.atsScore !== undefined ? resume.atsScore : prev.profile.atsScore
      } : null;

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
      const updatedProfile = prev.profile ? {
        ...prev.profile,
        subscriptionStatus: 'trialing' as const,
        trialStartDate: startDateStr,
        trialExpiryDate: expiryDateStr
      } : null;

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
    setState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        applicationsCount: prev.stats.applicationsCount + 1
      },
      profile: prev.profile ? {
        ...prev.profile,
        appliedJobIds: [...(prev.profile.appliedJobIds || []), `app_${Date.now()}`]
      } : null
    }));
  };

  const incrementInterviews = () => {
    setState(prev => {
      const newCount = prev.stats.interviewsCount + 1;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          interviewsCount: newCount
        },
        profile: prev.profile ? {
          ...prev.profile,
          interviewMetrics: {
            ...prev.profile.interviewMetrics,
            completedSessionsCount: newCount
          }
        } : null
      };
    });
  };

  const incrementCodingSolved = () => {
    setState(prev => {
      const newCount = prev.stats.codingSolvedCount + 1;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          codingSolvedCount: newCount
        },
        profile: prev.profile ? {
          ...prev.profile,
          interviewMetrics: {
            ...prev.profile.interviewMetrics,
            solvedCodingCount: newCount
          }
        } : null
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

  const login = (email?: string, name?: string) => {
    const userEmail = email || 'pranshupatel3222@gmail.com';
    const userName = name || 'Parnshu Patel';
    const newProfile: UserProfile = {
      ...initialUserProfile,
      id: `usr_${Date.now()}`,
      name: userName,
      email: userEmail,
      avatar: '',
      atsScore: 0,
      appliedJobIds: [],
      savedJobIds: [],
      interviewMetrics: {
        mockScoreOverall: 0,
        technicalScore: 0,
        behavioralScore: 0,
        systemDesignScore: 0,
        strongTopics: [],
        weakTopics: [],
        completedSessionsCount: 0,
        solvedCodingCount: 0
      }
    };

    setState({
      profile: newProfile,
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
      isAuthenticated: true
    });
  };

  const logout = () => {
    setState(prev => ({
      ...prev,
      profile: null,
      resume: null,
      isAuthenticated: false
    }));
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
