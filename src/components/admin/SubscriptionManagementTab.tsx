import React, { useState } from 'react';
import { 
  Award, 
  DollarSign, 
  Check, 
  Plus, 
  Edit3, 
  Sparkles, 
  Layers, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  X,
  Shield,
  Zap,
  Users
} from 'lucide-react';
import { SubscriptionPlanAdmin } from '../../types/admin';

interface SubscriptionManagementTabProps {
  plans: SubscriptionPlanAdmin[];
  onUpdatePlan: (updatedPlan: SubscriptionPlanAdmin) => void;
  onAddPlan: (newPlan: SubscriptionPlanAdmin) => void;
}

export const SubscriptionManagementTab: React.FC<SubscriptionManagementTabProps> = ({
  plans,
  onUpdatePlan,
  onAddPlan
}) => {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanAdmin | null>(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    price: 19,
    maxAiQueries: 'Unlimited' as any,
    badgeText: '',
    featuresText: ''
  });

  // Feature Flags Matrix state
  const [featureFlags, setFeatureFlags] = useState([
    { id: 'flag_resume_tailor', name: 'AI Resume Tailoring Engine', basic: true, pro: true, premium: true },
    { id: 'flag_mock_voice', name: 'AI Mock Interview Voice & Audio', basic: false, pro: true, premium: true },
    { id: 'flag_smart_calendar', name: 'Smart Calendar & AI Planner Sync', basic: false, pro: true, premium: true },
    { id: 'flag_auto_apply', name: 'Automated Multi-Board Job Application', basic: false, pro: false, premium: true },
    { id: 'flag_live_coaching', name: '1-on-1 AI Career Agent Coaching', basic: false, pro: false, premium: true },
  ]);

  const handleStartEdit = (plan: SubscriptionPlanAdmin) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      price: plan.price,
      maxAiQueries: plan.maxAiQueries,
      badgeText: plan.badgeText || '',
      featuresText: plan.features.join('\n')
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const updated: SubscriptionPlanAdmin = {
      ...editingPlan,
      price: editForm.price,
      badgeText: editForm.badgeText,
      maxAiQueries: editForm.maxAiQueries === 'Unlimited' ? 'Unlimited' : parseInt(editForm.maxAiQueries) || 100,
      features: editForm.featuresText.split('\n').filter(f => f.trim().length > 0)
    };

    onUpdatePlan(updated);
    setEditingPlan(null);
  };

  const toggleFlag = (flagId: string, tierKey: 'basic' | 'pro' | 'premium') => {
    setFeatureFlags(prev => prev.map(f => {
      if (f.id === flagId) {
        return { ...f, [tierKey]: !f[tierKey] };
      }
      return f;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div>
          <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" /> Subscription Plans & Tier Limits
          </h3>
          <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">Manage pricing tiers, AI query allowances, and plan feature access.</p>
        </div>

        <button
          onClick={() => setIsCreatePlanOpen(true)}
          className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Plan</span>
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {plans.map((p) => (
          <div 
            key={p.id} 
            className={`bg-[#191b25] border rounded-2xl p-4 flex flex-col justify-between relative transition-all shadow-md ${
              p.popular ? 'border-[#0052ff] bg-gradient-to-b from-[#191b25] to-[#0052ff]/10' : 'border-[#434656]/30 hover:border-[#434656]/60'
            }`}
          >
            {p.badgeText && (
              <span className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                p.popular ? 'bg-[#0052ff] text-white shadow-sm' : 'bg-[#434656] text-white'
              }`}>
                {p.badgeText}
              </span>
            )}

            <div>
              <div className="text-xs font-mono text-[#8d90a2] uppercase tracking-wider mb-1">{p.name}</div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-3xl font-bold font-geist text-white">${p.price}</span>
                <span className="text-xs font-mono text-[#8d90a2]">/mo</span>
              </div>

              <div className="text-xs font-mono text-emerald-400 mb-3 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{p.subscriberCount.toLocaleString()} active users</span>
              </div>

              <div className="text-[11px] font-mono text-[#4cd7f6] mb-3 pb-2 border-b border-[#434656]/20">
                AI Limit: {p.maxAiQueries === 'Unlimited' ? 'Unlimited / Month' : `${p.maxAiQueries} Queries / Month`}
              </div>

              <div className="space-y-1.5 mb-4 text-xs">
                {p.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[#c3c5d9]">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleStartEdit(p)}
              className="w-full mt-2 py-2 bg-[#0c0e17] hover:bg-white/10 border border-[#434656]/30 hover:border-[#0052ff]/50 text-xs font-mono text-white rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#0052ff]" />
              <span>Edit Plan Pricing</span>
            </button>
          </div>
        ))}
      </div>

      {/* Feature Flags Toggle Matrix */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-4">
        <div>
          <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Plan Feature Capability Matrix
          </h3>
          <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">Toggle live feature accessibility per subscription tier in real-time.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#0c0e17] border-b border-[#434656]/30 text-[#8d90a2] uppercase text-[10px]">
                <th className="py-3 px-4">Feature Capability</th>
                <th className="py-3 px-4 text-center">Basic Tier</th>
                <th className="py-3 px-4 text-center">Pro Tier</th>
                <th className="py-3 px-4 text-center">Premium Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#434656]/20">
              {featureFlags.map((flag) => (
                <tr key={flag.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#0052ff]" /> {flag.name}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleFlag(flag.id, 'basic')}
                      className="cursor-pointer inline-flex items-center"
                    >
                      {flag.basic ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-[#8d90a2]" />
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleFlag(flag.id, 'pro')}
                      className="cursor-pointer inline-flex items-center"
                    >
                      {flag.pro ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-[#8d90a2]" />
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleFlag(flag.id, 'premium')}
                      className="cursor-pointer inline-flex items-center"
                    >
                      {flag.premium ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-[#8d90a2]" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-base font-bold font-geist text-white">Edit Pricing Plan: {editingPlan.name}</h3>
              <button type="button" onClick={() => setEditingPlan(null)} className="text-[#8d90a2] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#c3c5d9] mb-1">Monthly Price ($ USD)</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="block text-[#c3c5d9] mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={editForm.badgeText}
                  onChange={(e) => setEditForm({ ...editForm, badgeText: e.target.value })}
                  placeholder="e.g. Most Popular"
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="block text-[#c3c5d9] mb-1">AI Request Allowance</label>
                <input
                  type="text"
                  value={editForm.maxAiQueries}
                  onChange={(e) => setEditForm({ ...editForm, maxAiQueries: e.target.value })}
                  placeholder="Unlimited or 100"
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="block text-[#c3c5d9] mb-1">Included Features List (One per line)</label>
                <textarea
                  rows={5}
                  value={editForm.featuresText}
                  onChange={(e) => setEditForm({ ...editForm, featuresText: e.target.value })}
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#434656]/30">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 bg-[#0c0e17] hover:bg-white/10 text-xs font-mono text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
