import React from 'react';
import { initialAchievements } from '../../data/interviewData';
import { 
  Award, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Lock, 
  TrendingUp, 
  Star,
  ShieldCheck,
  Code,
  Layers,
  MessageSquare
} from 'lucide-react';

interface GamificationProgressTabProps {
  streakDays: number;
  xpPoints: number;
  readinessScore: number;
}

export const GamificationProgressTab: React.FC<GamificationProgressTabProps> = ({
  streakDays,
  xpPoints,
  readinessScore
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Level & XP Top Banner */}
      <div className="bg-gradient-to-r from-[#191b25] via-[#11131c] to-[#191b25] border border-[#571bc1]/40 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#571bc1]/20 text-[#d0bcff] font-mono text-xs font-bold border border-[#571bc1]/40">
              Candidate Tier: Senior L5 Engineer
            </span>
            <h2 className="text-2xl font-bold font-geist text-white">Interview Mastery & Achievements</h2>
            <p className="text-xs text-[#c3c5d9]">
              Earn XP points, unlock achievements, and level up your engineering interview readiness.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-[#11131c] px-6 py-4 rounded-2xl border border-[#434656]/30">
            <div className="text-center">
              <span className="text-[10px] font-mono text-[#ff8000] uppercase font-bold flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Streak
              </span>
              <p className="text-2xl font-bold font-geist text-white">{streakDays} Days</p>
            </div>

            <div className="h-8 w-px bg-[#434656]/30" />

            <div className="text-center">
              <span className="text-[10px] font-mono text-[#d0bcff] uppercase font-bold flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Total XP
              </span>
              <p className="text-2xl font-bold font-geist text-[#d0bcff]">{xpPoints} XP</p>
            </div>
          </div>
        </div>

        {/* Level Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-white font-bold">Level 4: Senior Interview Candidate</span>
            <span className="text-[#4cd7f6]">720 / 1,000 XP to Level 5</span>
          </div>
          <div className="w-full bg-[#282934] h-3 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#0052ff] to-[#4cd7f6] h-full" style={{ width: '72%' }} />
          </div>
        </div>
      </div>

      {/* Badges & Achievements Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#d0bcff]" />
          Unlockable Candidate Badges ({initialAchievements.filter(a => a.unlocked).length}/{initialAchievements.length} Unlocked)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialAchievements.map(ach => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all ${
                ach.unlocked 
                  ? 'bg-[#191b25] border-[#00d26a]/40 shadow-lg' 
                  : 'bg-[#191b25]/50 border-[#434656]/30 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-xl ${ach.unlocked ? 'bg-[#00d26a]/20 text-[#00d26a]' : 'bg-[#282934] text-[#8d90a2]'}`}>
                  <Award className="w-6 h-6" />
                </div>

                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                  ach.unlocked ? 'bg-[#00d26a]/20 text-[#00d26a]' : 'bg-[#282934] text-[#8d90a2]'
                }`}>
                  {ach.unlocked ? 'Unlocked ✓' : 'Locked'}
                </span>
              </div>

              <h4 className="text-sm font-bold font-geist text-white">{ach.title}</h4>
              <p className="text-xs text-[#c3c5d9] mt-1 leading-relaxed">{ach.description}</p>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-[#8d90a2]">
                  <span>Progress</span>
                  <span>{ach.progress} / {ach.maxProgress}</span>
                </div>
                <div className="w-full bg-[#11131c] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0052ff] h-full" 
                    style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
