import React, { useState, useEffect } from 'react';
import { UserProfile, TransactionItem } from '../types';
import { CreditCard, Check, Sparkles, Shield, Zap, CheckCircle2, ArrowRight, Clock, AlertTriangle, RefreshCw, XCircle, BarChart3, Lock } from 'lucide-react';
import { calculateTrialRemaining } from '../utils/trialUtils';
import { useAuth } from '../context/AuthContext';
import { PLANS, PlanName, FEATURE_NAMES } from '../data/planConfig';
import { UserService } from '../services/userService';

interface BillingViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ user, onUpdateUser }) => {
  const { selectPlan, fastForwardTrial3Days } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>(user.subscriptionPlan || user.tier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgraded, setUpgraded] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  // Calculate trial remaining
  const trialInfo = calculateTrialRemaining(user.trialStartDate, user.trialExpiryDate);

  const plans = [
    PLANS['3-Day Free Trial'],
    PLANS['Basic'],
    PLANS['Pro'],
    PLANS['Premium']
  ];

  const handleSelectPlan = async (planName: string) => {
    setSelectedPlan(planName);
    await selectPlan(planName as PlanName);
    setUpgraded(true);
    setTimeout(() => setUpgraded(false), 3500);
  };

  const handleCancelSubscription = () => {
    onUpdateUser({ subscriptionStatus: 'canceled' });
    setCancelModal(false);
  };

  const [liveUsage, setLiveUsage] = useState<any>(null);

  useEffect(() => {
    UserService.getSubscriptionUsageApi().then(data => {
      if (data && data.features) {
        setLiveUsage(data.features);
      }
    });
  }, [user.subscriptionPlan]);

  const currentPlanDef = PLANS[user.subscriptionPlan as PlanName] || PLANS['3-Day Free Trial'];
  const rawUsage = user.usageLimits || {
    resumeScans: { used: 0, max: currentPlanDef.limits.atsAnalyses },
    atsAnalyses: { used: 0, max: currentPlanDef.limits.atsAnalyses },
    aiInterviews: { used: 0, max: currentPlanDef.limits.mockInterviews },
    coverLetterGenerations: { used: 0, max: currentPlanDef.limits.coverLetterGenerations },
    jobMatchAnalyses: { used: 0, max: currentPlanDef.limits.jobMatchAnalyses }
  };

  const usage = {
    resumeScans: liveUsage?.resumeScans ? { used: liveUsage.resumeScans.used, max: liveUsage.resumeScans.limit } : rawUsage.resumeScans,
    atsAnalyses: liveUsage?.atsAnalyses ? { used: liveUsage.atsAnalyses.used, max: liveUsage.atsAnalyses.limit } : rawUsage.atsAnalyses,
    aiInterviews: liveUsage?.aiInterviews ? { used: liveUsage.aiInterviews.used, max: liveUsage.aiInterviews.limit } : rawUsage.aiInterviews,
    coverLetterGenerations: liveUsage?.coverLetterGenerations ? { used: liveUsage.coverLetterGenerations.used, max: liveUsage.coverLetterGenerations.limit } : rawUsage.coverLetterGenerations,
    jobMatchAnalyses: liveUsage?.jobMatchAnalyses ? { used: liveUsage.jobMatchAnalyses.used, max: liveUsage.jobMatchAnalyses.limit } : rawUsage.jobMatchAnalyses
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-[1280px] mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit mb-1">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">Subscription & Billing Management</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-light font-geist text-white tracking-tight">
          Manage Your <span className="text-blue-500 font-semibold">Subscription Plan</span>
        </h2>
        <p className="text-xs md:text-sm text-[#c3c5d9]">View subscription status, trial progress, billing dates, and payment history.</p>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center items-center gap-3 pt-4">
          <span className={`text-xs font-mono ${billingCycle === 'monthly' ? 'text-white font-bold' : 'text-white/40'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 bg-white/10 rounded-full p-1 cursor-pointer transition-colors relative"
          >
            <div className={`w-4 h-4 bg-blue-500 rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-xs font-mono flex items-center gap-1 ${billingCycle === 'yearly' ? 'text-white font-bold' : 'text-white/40'}`}>
            Yearly <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold">Save 20%</span>
          </span>
        </div>
      </div>

      {upgraded && (
        <div className="p-4 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-mono flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> Subscription plan successfully updated to <span className="font-bold">{selectedPlan}</span>!
        </div>
      )}

      {/* Subscription Summary Card */}
      <div className="bg-[#191b25] border border-[#434656]/40 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-white/50 uppercase font-bold">Current Subscription</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                user.subscriptionStatus === 'active' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : user.subscriptionStatus === 'trialing'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {user.subscriptionStatus === 'trialing' ? '3-Day Free Trial' : user.subscriptionStatus.toUpperCase()}
              </span>
            </div>
            <h3 className="text-2xl font-bold font-geist text-white">{user.subscriptionPlan || user.tier}</h3>
          </div>

          <div className="flex gap-2">
            {user.subscriptionStatus === 'trialing' && (
              <button 
                onClick={fastForwardTrial3Days}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Fast-Forward 3 Days (End Trial)
              </button>
            )}
            {user.subscriptionStatus === 'active' && (
              <button 
                onClick={() => setCancelModal(true)}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#11131c] border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-white/40 text-[10px] uppercase font-bold">Plan Type</span>
            <p className="font-bold text-white text-sm">{user.subscriptionPlan || user.tier}</p>
          </div>

          <div className="bg-[#11131c] border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-white/40 text-[10px] uppercase font-bold">Trial Status</span>
            <p className="font-bold text-blue-400 text-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {user.subscriptionStatus === 'trialing' ? trialInfo.displayText : 'Completed / N/A'}
            </p>
          </div>

          <div className="bg-[#11131c] border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-white/40 text-[10px] uppercase font-bold">Trial Expiry Date</span>
            <p className="font-bold text-white text-sm">
              {user.trialExpiryDate ? new Date(user.trialExpiryDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="bg-[#11131c] border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-white/40 text-[10px] uppercase font-bold">Next Billing Date</span>
            <p className="font-bold text-white text-sm">{user.nextBillingDate || '2026-08-25'}</p>
          </div>
        </div>

        {/* Usage Limits Meters Breakdown */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Monthly Feature Usage & Entitlements</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            {/* 1. ATS Resume Audits Meter */}
            <div className="bg-[#11131c] border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-white/70">
                <span>ATS Resume Audits</span>
                <span className="font-bold text-white">
                  {currentPlanDef.limits.atsAnalyses === -1
                    ? 'Unlimited'
                    : `${usage.atsAnalyses?.used || 0} / ${currentPlanDef.limits.atsAnalyses}`}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentPlanDef.limits.atsAnalyses === -1
                      ? 'bg-green-500 w-full'
                      : ((usage.atsAnalyses?.used || 0) >= currentPlanDef.limits.atsAnalyses)
                      ? 'bg-amber-500 w-full'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: currentPlanDef.limits.atsAnalyses === -1
                      ? '100%'
                      : `${Math.min(100, Math.round(((usage.atsAnalyses?.used || 0) / Math.max(1, currentPlanDef.limits.atsAnalyses)) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* 2. AI Cover Letter Studio Meter */}
            <div className="bg-[#11131c] border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-white/70">
                <span>AI Cover Letter Studio</span>
                <span className="font-bold text-white">
                  {currentPlanDef.limits.coverLetterGenerations === -1
                    ? 'Unlimited'
                    : `${usage.coverLetterGenerations?.used || 0} / ${currentPlanDef.limits.coverLetterGenerations}`}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentPlanDef.limits.coverLetterGenerations === -1
                      ? 'bg-green-500 w-full'
                      : ((usage.coverLetterGenerations?.used || 0) >= currentPlanDef.limits.coverLetterGenerations)
                      ? 'bg-amber-500 w-full'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: currentPlanDef.limits.coverLetterGenerations === -1
                      ? '100%'
                      : `${Math.min(100, Math.round(((usage.coverLetterGenerations?.used || 0) / Math.max(1, currentPlanDef.limits.coverLetterGenerations)) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* 3. AI Mock Interview Prep Meter */}
            <div className="bg-[#11131c] border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-white/70">
                <span>AI Mock Interview Prep</span>
                <span className="font-bold text-white">
                  {currentPlanDef.limits.mockInterviews === -1
                    ? 'Unlimited'
                    : currentPlanDef.limits.mockInterviews === 0
                    ? '0 (Requires Pro)'
                    : `${usage.aiInterviews?.used || 0} / ${currentPlanDef.limits.mockInterviews}`}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentPlanDef.limits.mockInterviews === -1
                      ? 'bg-green-500 w-full'
                      : currentPlanDef.limits.mockInterviews === 0
                      ? 'bg-white/10 w-0'
                      : ((usage.aiInterviews?.used || 0) >= currentPlanDef.limits.mockInterviews)
                      ? 'bg-amber-500 w-full'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: currentPlanDef.limits.mockInterviews <= 0
                      ? '0%'
                      : `${Math.min(100, Math.round(((usage.aiInterviews?.used || 0) / Math.max(1, currentPlanDef.limits.mockInterviews)) * 100))}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const isCurrent = user.subscriptionPlan === plan.name || (user.subscriptionPlan === '3-Day Free Trial' && plan.name === '3-Day Free Trial');

          return (
            <div 
              key={plan.name}
              className={`bg-[#191b25] border rounded-3xl p-6 flex flex-col justify-between relative transition-all ${
                plan.popular 
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/10 ai-gradient-border' 
                  : 'border-[#434656]/30 hover:border-[#434656]/60'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold font-geist text-white">{plan.name}</h3>
                  {isCurrent && (
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#c3c5d9] min-h-[36px] mb-6 leading-relaxed">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold font-geist text-white">${price}</span>
                  <span className="text-xs font-mono text-white/50">/ mo</span>
                </div>

                <div className="space-y-2.5 mb-8">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#e1e1ef]">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleSelectPlan(plan.name)}
                disabled={isCurrent}
                className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isCurrent 
                    ? 'bg-white/5 text-white/40 border border-white/10 cursor-default'
                    : plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isCurrent ? 'Current Plan' : `Select ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Transaction & Billing History */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-lg font-bold font-geist text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-400" /> Transaction & Invoice History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase">
                <th className="pb-3 font-normal">Invoice #</th>
                <th className="pb-3 font-normal">Date</th>
                <th className="pb-3 font-normal">Plan</th>
                <th className="pb-3 font-normal">Payment Method</th>
                <th className="pb-3 font-normal">Amount</th>
                <th className="pb-3 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {(user.transactionHistory || []).map((tx) => (
                <tr key={tx.id}>
                  <td className="py-3 font-bold text-white">{tx.invoiceNumber}</td>
                  <td className="py-3 text-white/60">{tx.date}</td>
                  <td className="py-3">{tx.planName}</td>
                  <td className="py-3 text-white/60">{tx.paymentMethod}</td>
                  <td className="py-3 font-bold">${tx.amount.toFixed(2)}</td>
                  <td className="py-3 text-right">
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1d1f29] border border-red-500/30 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-xl font-bold font-geist text-white">Cancel Subscription?</h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Your subscription will remain active until the end of the current billing period ({user.nextBillingDate || '2026-08-25'}). All your uploaded resumes and application tracking history will remain safe.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setCancelModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono cursor-pointer"
              >
                Keep Subscription
              </button>
              <button 
                onClick={handleCancelSubscription}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

