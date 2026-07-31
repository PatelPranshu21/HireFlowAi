import React, { useState } from 'react';
import { UserProfile, TransactionItem } from '../types';
import { CreditCard, Check, Sparkles, Shield, Zap, CheckCircle2, ArrowRight, Clock, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { calculateTrialRemaining } from '../utils/trialUtils';

interface BillingViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ user, onUpdateUser }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(user.subscriptionPlan || user.tier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgraded, setUpgraded] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  // Calculate trial remaining
  const trialInfo = calculateTrialRemaining(user.trialStartDate, user.trialExpiryDate);

  const plans = [
    {
      name: '3-Day Free Trial',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Explore full ATS scoring and AI matchers with 3 days unrestricted access.',
      features: [
        'Full ATS Resume Scoring',
        '3 AI Cover Letter Generations',
        'AI Job Recommendation Engine',
        'Preserves all saved data after expiration'
      ]
    },
    {
      name: 'Basic',
      priceMonthly: 9,
      priceYearly: 7,
      description: 'Essential AI resume tools for active job seekers sending weekly applications.',
      features: [
        '10 ATS Resume Audits / mo',
        '1-Click AI Bullet Rewriter',
        'Job Matcher & Keyword Gap Finder',
        '10 AI Cover Letters / mo',
        'Email Support'
      ]
    },
    {
      name: 'Pro',
      priceMonthly: 19,
      priceYearly: 15,
      popular: true,
      description: 'Complete career acceleration suite for tech professionals targeting top roles.',
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
    {
      name: 'Premium',
      priceMonthly: 39,
      priceYearly: 31,
      description: 'Maximum power with 1-on-1 AI Career Coach & live negotiation guidance.',
      features: [
        'Everything in Pro Plan',
        'Unlimited AI Mock Interview Coach',
        'LinkedIn Headline & Strategy Suite',
        'Salary Negotiation Counteroffer Scripts',
        'Dedicated AI Career Coach Assistant'
      ]
    }
  ];

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    onUpdateUser({ 
      subscriptionPlan: planName as any,
      subscriptionStatus: 'active',
      tier: planName === 'Pro' ? 'Gold Tier' : (planName === 'Premium' ? 'Premium Plan' : 'Basic')
    });
    setUpgraded(true);
    setTimeout(() => setUpgraded(false), 3000);
  };

  const handleCancelSubscription = () => {
    onUpdateUser({ subscriptionStatus: 'canceled' });
    setCancelModal(false);
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
                onClick={() => {
                  const pastDate = new Date(Date.now() - 1000).toISOString();
                  onUpdateUser({ 
                    subscriptionStatus: 'expired',
                    tier: 'Trial Expired',
                    trialExpiryDate: pastDate
                  });
                }}
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

