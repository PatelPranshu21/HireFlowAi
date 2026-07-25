import React, { useState } from 'react';
import { UserProfile, NavigationTab } from '../types';
import { Check, Zap, Shield, Sparkles, ArrowRight, Clock, Star, HelpCircle } from 'lucide-react';

interface PricingViewProps {
  user: UserProfile;
  onSelectTrial: () => void;
  onSelectPaidPlan: (planName: 'Basic' | 'Pro' | 'Premium', price: number, billingCycle: 'monthly' | 'yearly') => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  user,
  onSelectTrial,
  onSelectPaidPlan,
  onNavigate
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'trial',
      name: '3-Day Free Trial' as const,
      priceMonthly: 0,
      priceYearly: 0,
      badge: 'Risk Free',
      description: 'Full access to core ATS resume scoring and job matcher for 3 days. No credit card required.',
      features: [
        '3 Days Unrestricted Access',
        'Full ATS Resume Scoring Audit',
        'AI Job Matcher & Gap Analysis',
        '3 AI Cover Letter Generations',
        '5 AI Mock Interview Practice Questions',
        'Preserves all saved data after trial'
      ],
      isTrial: true,
      buttonText: 'Start 3-Day Free Trial'
    },
    {
      id: 'basic',
      name: 'Basic' as const,
      priceMonthly: 9,
      priceYearly: 7,
      badge: 'Starter',
      description: 'Essential AI resume tools for active job seekers sending weekly applications.',
      features: [
        '10 ATS Resume Score Audits / mo',
        '1-Click AI Bullet Rewriter',
        'Job Matcher & Keyword Gap Finder',
        '10 AI Cover Letters / mo',
        'Standard Application Tracker Kanban',
        'Email Support'
      ],
      isTrial: false,
      buttonText: 'Choose Basic Plan'
    },
    {
      id: 'pro',
      name: 'Pro' as const,
      priceMonthly: 19,
      priceYearly: 15,
      popular: true,
      badge: 'Most Popular',
      description: 'Complete career acceleration suite for tech professionals targeting top roles.',
      features: [
        'Unlimited ATS Resume Audits',
        'Unlimited Bullet Rewriting & Impact Quantification',
        'Unlimited Job Description Matching',
        'Unlimited AI Cover Letter Studio',
        '30 AI Mock Interview Prep Sessions / mo',
        'STAR Framework Detailed Scoring',
        'Priority 24/7 AI Concierge Support'
      ],
      isTrial: false,
      buttonText: 'Upgrade to Pro'
    },
    {
      id: 'premium',
      name: 'Premium' as const,
      priceMonthly: 39,
      priceYearly: 31,
      badge: 'Executive',
      description: 'Maximum power with 1-on-1 AI Career Coach & live negotiation guidance.',
      features: [
        'Everything in Pro Plan',
        'Unlimited AI Mock Interview Coach',
        'LinkedIn Headline & Strategy Suite',
        'Salary Negotiation & Counteroffer Script Generator',
        'Dedicated AI Career Coach Assistant',
        'Custom Job Market Insights'
      ],
      isTrial: false,
      buttonText: 'Get Premium Access'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#F9FAFB] py-12 px-4 md:px-8 flex flex-col justify-center items-center relative overflow-x-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-3xl text-center space-y-4 mb-10 relative z-10">
        <div 
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-white rotate-45" />
          </div>
          <span className="text-xs font-mono font-bold text-white">HireFlow AI Pricing & Subscription</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-light font-geist text-white tracking-tight">
          Choose Your Plan to Start <span className="text-blue-500 font-semibold italic font-serif">Landing Interviews</span>
        </h1>
        <p className="text-base text-white/60 max-w-xl mx-auto">
          Start with our risk-free 3-Day Free Trial or select a paid subscription plan. Upgrade, downgrade, or cancel at any time.
        </p>

        {/* Monthly vs Yearly Toggle */}
        <div className="pt-4 flex items-center justify-center gap-4">
          <span className={`text-xs font-mono font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40'}`}>Monthly Billing</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-7 bg-white/10 border border-white/10 rounded-full p-1 cursor-pointer transition-colors relative"
          >
            <div className={`w-5 h-5 bg-blue-500 rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-white' : 'text-white/40'}`}>
            Yearly Billing
            <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full text-[10px]">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Plans Matrix Grid */}
      <div className="max-w-[1280px] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-16">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const isCurrent = user.subscriptionPlan === plan.name && user.subscriptionStatus === 'active';

          return (
            <div 
              key={plan.id}
              className={`bg-white/5 backdrop-blur-2xl border rounded-3xl p-6 flex flex-col justify-between relative transition-all ${
                plan.popular 
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/20 scale-105 z-20 ai-gradient-border' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold font-geist text-white">{plan.name}</h3>
                  {!plan.popular && (
                    <span className="text-[10px] font-mono uppercase font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 min-h-[36px] mb-6 leading-relaxed">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold font-geist text-white">${price}</span>
                  <span className="text-xs font-mono text-white/40">
                    {plan.isTrial ? 'for 3 days' : `/ month ${billingCycle === 'yearly' ? '(billed yearly)' : ''}`}
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-bold">What's included:</p>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-white/80">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {plan.isTrial ? (
                <button 
                  onClick={onSelectTrial}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Clock className="w-4 h-4" />
                  {plan.buttonText}
                </button>
              ) : (
                <button 
                  onClick={() => onSelectPaidPlan(plan.name as any, price, billingCycle)}
                  className={`w-full font-mono text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  {plan.buttonText}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee */}
      <div className="max-w-2xl text-center space-y-2 border-t border-white/10 pt-8 text-xs font-mono text-white/40">
        <p className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          Cancel or switch plans anytime. Your resume drafts and application logs are always preserved.
        </p>
      </div>
    </div>
  );
};
