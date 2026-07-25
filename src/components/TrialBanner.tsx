import React from 'react';
import { UserProfile, NavigationTab } from '../types';
import { Clock, AlertTriangle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface TrialBannerProps {
  user: UserProfile;
  onNavigate: (tab: NavigationTab) => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ user, onNavigate }) => {
  if (user.subscriptionStatus !== 'trialing' && user.subscriptionStatus !== 'expired') {
    return null;
  }

  // Calculate days remaining
  let daysRemaining = 0;
  let hoursRemaining = 0;

  if (user.trialExpiryDate) {
    const expiry = new Date(user.trialExpiryDate).getTime();
    const now = new Date().getTime();
    const diffMs = expiry - now;

    if (diffMs > 0) {
      daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    }
  }

  const isExpired = user.subscriptionStatus === 'expired' || (daysRemaining <= 0 && hoursRemaining <= 0);

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

  return (
    <div className="bg-blue-600/15 border-b border-blue-500/20 px-4 py-2.5 text-blue-300 text-xs font-mono flex flex-wrap items-center justify-between gap-3 relative z-30">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
        <span>
          <strong>3-Day Free Trial Active:</strong> {daysRemaining} days {hoursRemaining} hours remaining.
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
