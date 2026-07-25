import React from 'react';
import { useEcosystem } from '../context/EcosystemContext';
import { Sparkles, Sun, Briefcase, TrendingUp, Calendar as CalendarIcon, Target, X, ArrowRight, CheckCircle2 } from 'lucide-react';

export const DailyBriefingModal: React.FC = () => {
  const { isDailyBriefingOpen, setIsDailyBriefingOpen, dailyBriefingData, profile, navigateWithEcosystem } = useEcosystem();

  if (!isDailyBriefingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#11131c] border border-blue-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-[#0052ff] via-[#571bc1] to-[#1e202e] p-6 md:p-8 text-white relative">
          <button
            onClick={() => setIsDailyBriefingOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-mono mb-3">
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Daily AI Career Briefing</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-light font-geist tracking-tight">
            Good Morning, <span className="font-semibold">{dailyBriefingData.greetingName}</span>.
          </h2>
          <p className="text-xs md:text-sm text-white/70 mt-1">
            Your telemetry metrics and career recommendations are ready for today.
          </p>
        </div>

        {/* Content Metrics Grid */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metric 1: New Jobs */}
            <div
              onClick={() => {
                setIsDailyBriefingOpen(false);
                navigateWithEcosystem('job-suite');
              }}
              className="bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold font-geist text-white leading-none">
                  {dailyBriefingData.newMatchingJobsCount} New
                </span>
                <p className="text-xs text-white/50 mt-1">Matching Job Opportunities</p>
              </div>
            </div>

            {/* Metric 2: ATS Score Trend */}
            <div
              onClick={() => {
                setIsDailyBriefingOpen(false);
                navigateWithEcosystem('resume-suite');
              }}
              className="bg-white/5 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold font-geist text-white leading-none">
                  {profile.atsScore}% ATS
                </span>
                <p className="text-xs font-mono text-emerald-400 mt-1">
                  +{dailyBriefingData.atsScoreChange}% from recent updates
                </p>
              </div>
            </div>

            {/* Metric 3: Upcoming Interviews */}
            <div
              onClick={() => {
                setIsDailyBriefingOpen(false);
                navigateWithEcosystem('interviews');
              }}
              className="bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold font-geist text-white leading-none">
                  {dailyBriefingData.upcomingInterviewsCount} Scheduled
                </span>
                <p className="text-xs text-white/50 mt-1">Interview Sessions Pending</p>
              </div>
            </div>

            {/* Metric 4: Learning Goal */}
            <div
              onClick={() => {
                setIsDailyBriefingOpen(false);
                navigateWithEcosystem('career-tools');
              }}
              className="bg-white/5 border border-white/10 hover:border-amber-500/50 rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block font-mono">
                  Today's Goal
                </span>
                <p className="text-xs text-white/80 font-medium mt-0.5 line-clamp-2">
                  {dailyBriefingData.todaysLearningGoal}
                </p>
              </div>
            </div>
          </div>

          {/* Daily Career Insight */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-wider mb-2 font-bold">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Daily AI Strategic Insight</span>
            </div>
            <p className="text-sm text-white/90 leading-relaxed font-sans">
              "{dailyBriefingData.dailyCareerInsight}"
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white/5 border-t border-white/10 p-4 px-6 md:px-8 flex justify-between items-center shrink-0">
          <span className="text-xs font-mono text-white/40">
            HireFlow AI Ecosystem v2.4 Active
          </span>
          <button
            onClick={() => {
              setIsDailyBriefingOpen(false);
              navigateWithEcosystem('dashboard');
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-blue-500/20"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
