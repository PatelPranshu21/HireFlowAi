import React from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle2, Award, Zap, Sparkles } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

export const ProductivityAnalyticsTab: React.FC = () => {
  const { streaks, prodTasks, prodGoals } = useEcosystem();

  const completedTasks = prodTasks.filter(t => t.completed).length;
  const totalTasks = prodTasks.length;
  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 100;

  const weeklyData = [
    { day: 'Mon', focusHours: 4.2, tasksDone: 5 },
    { day: 'Tue', focusHours: 5.5, tasksDone: 6 },
    { day: 'Wed', focusHours: 3.8, tasksDone: 4 },
    { day: 'Thu', focusHours: 6.0, tasksDone: 8 },
    { day: 'Fri', focusHours: 4.5, tasksDone: 5 },
    { day: 'Sat', focusHours: 5.0, tasksDone: 4 },
    { day: 'Sun', focusHours: 2.2, tasksDone: 2 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-geist text-white flex items-center gap-2">
              Productivity & Focus Analytics
            </h2>
            <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">
              Comprehensive analytics on study hours, task velocity, goal achievement and focus efficiency.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-xl bg-[#13151f] border border-[#434656]/30 text-right">
          <span className="text-[10px] font-mono text-[#c3c5d9] uppercase block">Productivity Score</span>
          <span className="text-2xl font-bold font-geist text-emerald-400">{streaks.productivityScore} / 100</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-mono text-[#c3c5d9] uppercase flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0052ff]" /> Total Focus Time
          </span>
          <div className="text-2xl font-bold font-geist text-white">{streaks.totalFocusHours} Hours</div>
          <span className="text-[11px] font-mono text-emerald-400">+18% this week</span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-mono text-[#c3c5d9] uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tasks Completed
          </span>
          <div className="text-2xl font-bold font-geist text-white">{completedTasks} Tasks</div>
          <span className="text-[11px] font-mono text-emerald-400">{taskCompletionRate}% completion rate</span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-mono text-[#c3c5d9] uppercase flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" /> Learning Streak
          </span>
          <div className="text-2xl font-bold font-geist text-white">{streaks.learningStreakDays} Days</div>
          <span className="text-[11px] font-mono text-amber-400">Personal Best Streak!</span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-mono text-[#c3c5d9] uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-400" /> Goals Progress
          </span>
          <div className="text-2xl font-bold font-geist text-white">
            {prodGoals.filter(g => g.completed).length} / {prodGoals.length}
          </div>
          <span className="text-[11px] font-mono text-[#4cd7f6]">Weekly Roadmap On Track</span>
        </div>
      </div>

      {/* Bar Visual Chart */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold font-geist text-white flex items-center justify-between">
          Weekly Focus Time Distribution
          <span className="text-xs font-mono text-[#c3c5d9]">Target: 35 hrs/week</span>
        </h3>

        <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-[#434656]/20 pb-2">
          {weeklyData.map((item, idx) => {
            const barHeight = Math.round((item.focusHours / 8) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-[#c3c5d9] opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.focusHours}h
                </span>
                <div
                  className="w-full bg-gradient-to-t from-[#0052ff] to-[#4cd7f6] rounded-t-lg transition-all duration-300 group-hover:opacity-90"
                  style={{ height: `${barHeight}%` }}
                />
                <span className="text-xs font-mono text-[#c3c5d9] mt-2">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Productivity Coach Insights */}
      <div className="p-6 bg-gradient-to-r from-[#191b25] via-[#13151f] to-[#191b25] border border-emerald-500/30 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
          <Sparkles className="w-4 h-4" /> AI Productivity Coach Insight
        </div>
        <p className="text-sm font-geist text-white leading-relaxed">
          "Your highest focus productivity occurs between 09:00 AM and 11:30 AM on Thursdays and Tuesdays. Scheduling your most demanding System Design STAR practice during morning focus windows increases your practice retention by +32%."
        </p>
      </div>
    </div>
  );
};
