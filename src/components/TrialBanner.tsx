import React from 'react';
import { NavigationTab } from '../types';
import { Clock, AlertTriangle, Sparkles, ArrowRight, Play } from 'lucide-react';
import { calculateTrialRemaining } from '../utils/trialUtils';
import { useAuth } from '../context/AuthContext';

interface TrialBannerProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ onNavigate }) => {
  const { state: authState, startFreeTrial } = useAuth();
  const user = authState.profile;

  if (!user || (user.subscriptionStatus !== 'trialing' && user.subscriptionStatus !== 'expired' && user.subscriptionStatus !== 'none')) {
    return null;
  }

  const trialInfo = calculateTrialRemaining(user.trialStartDate, user.trialExpiryDate);
  const isExpired = user.subscriptionStatus === 'expired' || trialInfo.isExpired;

  if (isExpired) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-amber-300 text-xs font-mono flex flex-wrap items-center justify-between gap-3 relative z-30">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Trial Expired:</strong> Your 3-Day Free Trial has concluded. All your uploaded resumes and applications are safely preserved!
          </span>
        </div>
        <button
          onClick={() => onNavigate('pricing')}
          className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
        >
          Select a Plan to Restore Access
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (trialInfo.isNotStarted) {
    return (
      <div className="bg-blue-600/15 border-b border-blue-500/20 px-4 py-2.5 text-blue-300 text-xs font-mono flex flex-wrap items-center justify-between gap-3 relative z-30">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>3 Days Remaining:</strong> Start your 3-Day Free Trial now to unlock full ATS scoring & AI matchers.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => startFreeTrial()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-blue-500/20"
          >
            <Play className="w-3 h-3 text-blue-200 fill-current" />
            Start Free Trial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-600/15 border-b border-blue-500/20 px-4 py-2.5 text-blue-300 text-xs font-mono flex flex-wrap items-center justify-between gap-3 relative z-30">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
        <span>
          <strong>3-Day Free Trial Active:</strong> {trialInfo.displayText}.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-white/50 text-[11px]">Enjoy full access to ATS scoring & AI matchers</span>
        <button
          onClick={() => onNavigate('pricing')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-blue-500/20"
        >
          <Sparkles className="w-3 h-3 text-blue-200" />
          Upgrade Plan
        </button>
      </div>
    </div>
  );
};
