import React from 'react';
import { EntitlementCheckResult, PLANS } from '../data/planConfig';
import { AlertTriangle, Sparkles, Lock, Clock, ArrowRight, X } from 'lucide-react';

interface LimitReachedModalProps {
  isOpen: boolean;
  entitlement: EntitlementCheckResult | null;
  onClose: () => void;
  onUpgrade: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  isOpen,
  entitlement,
  onClose,
  onUpgrade
}) => {
  if (!isOpen || !entitlement) return null;

  const isExpired = entitlement.reason === 'trial_expired';
  const isFeatureLocked = entitlement.reason === 'feature_not_in_plan';
  const isLimitReached = entitlement.reason === 'limit_reached';

  const planDef = PLANS[entitlement.planName];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#181922] border border-[#434656]/50 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 relative shadow-2xl shadow-blue-500/10 ai-gradient-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {isExpired ? (
              <Clock className="w-6 h-6 text-amber-400" />
            ) : isFeatureLocked ? (
              <Lock className="w-6 h-6 text-purple-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-blue-400" />
            )}
          </div>

          <h3 className="text-2xl font-bold font-geist text-white">
            {isExpired
              ? '3-Day Free Trial Expired'
              : isFeatureLocked
              ? `${entitlement.featureName} Locked`
              : 'Monthly Limit Reached'}
          </h3>

          <p className="text-xs text-[#c3c5d9] leading-relaxed">
            {entitlement.message}
          </p>
        </div>

        {/* Usage Progress Card */}
        {isLimitReached && entitlement.max > 0 && (
          <div className="bg-[#111218] border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/60">{entitlement.featureName} Usage</span>
              <span className="font-bold text-amber-400">
                {entitlement.used} / {entitlement.max} used
              </span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: '100%' }}
              />
            </div>
            <p className="text-[11px] text-white/40 font-mono text-right">
              Limit resets next billing period
            </p>
          </div>
        )}

        {/* Saved Data Assurance for Expired Trial */}
        {isExpired && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs font-mono text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Your Data is Safe & Preserved
            </div>
            <p className="text-[11px] text-amber-300/80 leading-normal">
              All your uploaded resumes, tailored versions, interview history, and tracked applications are stored safely. Upgrade to restore unlimited access instantly.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-mono text-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            Upgrade Subscription Plan
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
