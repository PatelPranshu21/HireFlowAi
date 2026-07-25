import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, TrendingUp, Award, Sparkles, ChevronRight } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { ProductivityGoal } from '../../types';
import { GoalModal } from './GoalModal';

export const GoalsTab: React.FC = () => {
  const {
    prodGoals,
    addProdGoal,
    updateProdGoal,
    deleteProdGoal,
    incrementGoalProgress
  } = useEcosystem();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'career'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<ProductivityGoal | null>(null);

  const filteredGoals = prodGoals.filter(g => {
    if (selectedTimeframe !== 'all' && g.timeframe !== selectedTimeframe) return false;
    return true;
  });

  const completedGoalsCount = prodGoals.filter(g => g.completed).length;
  const overallPercent = Math.round(
    ((prodGoals || []).reduce((acc, g) => acc + Math.min(100, (g.currentProgress / (g.targetProgress || 1)) * 100), 0) / ((prodGoals || []).length || 1))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#191b25] border border-[#434656]/30 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-geist text-white flex items-center gap-2">
              Career Goal Engine
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30">
                {completedGoalsCount} / {prodGoals.length} Completed
              </span>
            </h2>
            <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">
              Set, track and achieve daily, weekly and monthly career roadmap milestones.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedGoal(null);
            setIsModalOpen(true);
          }}
          className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Set New Goal
        </button>
      </div>

      {/* Progress Overview Card */}
      <div className="bg-gradient-to-r from-[#191b25] via-[#13151f] to-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Overall Goal Mastery</span>
          <div className="text-3xl font-bold font-geist text-white flex items-baseline gap-2">
            {overallPercent}%
            <span className="text-xs font-mono text-emerald-400 font-normal">+12% vs last week</span>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <div className="h-3 w-full bg-[#13151f] rounded-full overflow-hidden border border-[#434656]/30">
            <div
              className="h-full bg-gradient-to-r from-[#0052ff] to-[#10b981] transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#c3c5d9]">
          <div className="text-center">
            <span className="block text-white font-bold text-base">{prodGoals.filter(g => g.timeframe === 'daily').length}</span>
            <span>Daily</span>
          </div>
          <div className="text-center border-l border-[#434656]/30 pl-4">
            <span className="block text-white font-bold text-base">{prodGoals.filter(g => g.timeframe === 'weekly').length}</span>
            <span>Weekly</span>
          </div>
          <div className="text-center border-l border-[#434656]/30 pl-4">
            <span className="block text-white font-bold text-base">{prodGoals.filter(g => g.timeframe === 'monthly').length}</span>
            <span>Monthly</span>
          </div>
        </div>
      </div>

      {/* Timeframe Selector Bar */}
      <div className="flex items-center gap-2 bg-[#13151f] p-1.5 rounded-xl border border-[#434656]/20">
        {(['all', 'daily', 'weekly', 'monthly', 'career'] as const).map(tf => (
          <button
            key={tf}
            onClick={() => setSelectedTimeframe(tf)}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono capitalize cursor-pointer transition-colors ${
              selectedTimeframe === tf ? 'bg-[#3b82f6] text-white font-bold' : 'text-[#c3c5d9] hover:text-white'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGoals.map(goal => {
          const percent = Math.min(100, Math.round((goal.currentProgress / goal.targetProgress) * 100));
          return (
            <div
              key={goal.id}
              className={`bg-[#191b25] border border-[#434656]/30 hover:border-[#3b82f6]/50 rounded-2xl p-5 flex flex-col justify-between transition-all ${
                goal.completed ? 'border-emerald-500/40 bg-emerald-950/10' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">
                    {goal.timeframe} • {goal.category}
                  </span>
                  {goal.completed && (
                    <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white font-geist mb-2">{goal.title}</h3>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs font-mono text-[#c3c5d9]">
                    <span>Progress</span>
                    <span className="text-white font-bold">{goal.currentProgress} / {goal.targetProgress} {goal.unit || 'items'} ({percent}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#13151f] rounded-full overflow-hidden border border-[#434656]/20">
                    <div
                      className={`h-full transition-all duration-300 ${
                        goal.completed ? 'bg-emerald-400' : 'bg-[#3b82f6]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#434656]/20 flex justify-between items-center text-xs font-mono">
                <div className="flex gap-2">
                  <button
                    onClick={() => incrementGoalProgress(goal.id, 1)}
                    className="px-2.5 py-1 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white cursor-pointer font-bold transition-colors"
                  >
                    +1 {goal.unit || 'Item'}
                  </button>
                  <button
                    onClick={() => incrementGoalProgress(goal.id, 5)}
                    className="px-2.5 py-1 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white cursor-pointer font-bold transition-colors"
                  >
                    +5
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#252836] text-[#c3c5d9] hover:text-white cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialGoal={selectedGoal}
        onSave={goal => {
          if ('id' in goal) {
            updateProdGoal(goal as ProductivityGoal);
          } else {
            addProdGoal(goal);
          }
        }}
        onDelete={id => deleteProdGoal(id)}
      />
    </div>
  );
};
