import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Send, 
  Bookmark, 
  Calendar, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Filter, 
  Sparkles, 
  Layers, 
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ApplicationCard, JobRecommendation } from '../types';
import { UserService } from '../services/userService';

interface JobAnalyticsViewProps {
  applications?: ApplicationCard[];
  savedJobs?: JobRecommendation[];
}

export const JobAnalyticsView: React.FC<JobAnalyticsViewProps> = ({
  applications: propApps = [],
  savedJobs: propSaved = []
}) => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = async (selectedPeriod: string) => {
    setLoading(true);
    const data = await UserService.getAnalyticsOverviewApi(selectedPeriod);
    if (data && data.success) {
      setAnalytics(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const appStats = analytics?.applications || {
    total: propApps.length,
    applied: propApps.filter(a => a.status === 'applied').length,
    screening: propApps.filter(a => a.status === 'screening').length,
    interview: propApps.filter(a => a.status === 'interview' || a.status === 'hr_round').length,
    offer: propApps.filter(a => a.status === 'offer').length,
    accepted: propApps.filter(a => a.status === 'accepted').length,
    rejected: propApps.filter(a => a.status === 'rejected').length,
    interviewRate: propApps.length > 0 ? Math.round((propApps.filter(a => ['interview', 'offer', 'accepted'].includes(a.status)).length / propApps.length) * 100) : 0,
    offerRate: propApps.length > 0 ? Math.round((propApps.filter(a => ['offer', 'accepted'].includes(a.status)).length / propApps.length) * 100) : 0,
    rejectionRate: propApps.length > 0 ? Math.round((propApps.filter(a => a.status === 'rejected').length / propApps.length) * 100) : 0,
    responseRate: propApps.length > 0 ? Math.round((propApps.filter(a => a.status !== 'applied').length / propApps.length) * 100) : 0
  };

  const matchStats = analytics?.jobMatches || {
    totalMatches: 0,
    avgMatchScore: 0,
    distribution: [],
    quality: { strong: 0, good: 0, moderate: 0, weak: 0 }
  };

  const skillsData = analytics?.skills || { topMissing: [], topMatched: [] };
  const savedData = analytics?.savedJobs || { totalSaved: propSaved.length, savedAndApplied: 0, savedToAppliedRate: 0 };
  const velocity = analytics?.applicationVelocity || [];

  return (
    <div className="p-4 sm:p-6 max-w-[1280px] mx-auto w-full space-y-8 animate-in fade-in duration-200">
      
      {/* Header & Date Range Filter */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            <h1 className="text-2xl font-bold font-geist text-white">Analytics</h1>
          </div>
          <p className="text-xs font-mono text-white/60">
            Track your job matches, applications, and career progress.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#11131c] border border-white/10 p-1 rounded-xl w-fit">
          <Filter className="w-3.5 h-3.5 text-white/40 ml-2 mr-1" />
          {(['7d', '30d', '90d', 'all'] as const).map((p) => {
            const labels = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', 'all': 'All Time' };
            const active = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  active 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Application KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Applications */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Applications</span>
          <span className="text-2xl font-bold font-mono text-white block">{appStats.total}</span>
          <span className="text-[10px] font-mono text-blue-400 flex items-center gap-1">
            <Send className="w-3 h-3" /> Tracked
          </span>
        </div>

        {/* Interviews */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Interviews</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 block">{appStats.interview}</span>
          <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Scheduled
          </span>
        </div>

        {/* Offers */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Offers</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 block">{appStats.offer}</span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <Award className="w-3 h-3" /> Extended
          </span>
        </div>

        {/* Saved Jobs */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Saved Jobs</span>
          <span className="text-2xl font-bold font-mono text-purple-400 block">{savedData.totalSaved}</span>
          <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1">
            <Bookmark className="w-3 h-3" /> Shortlisted
          </span>
        </div>

        {/* Interview Rate (Only when applications exist) */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Interview Rate</span>
          <span className="text-2xl font-bold font-mono text-white block">
            {appStats.total > 0 ? `${appStats.interviewRate}%` : 'N/A'}
          </span>
          <span className="text-[10px] font-mono text-white/40 block">
            {appStats.total > 0 ? 'Conversion' : 'Requires applications'}
          </span>
        </div>

        {/* Offer Rate (Only when applications exist) */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Offer Rate</span>
          <span className="text-2xl font-bold font-mono text-white block">
            {appStats.total > 0 ? `${appStats.offerRate}%` : 'N/A'}
          </span>
          <span className="text-[10px] font-mono text-white/40 block">
            {appStats.total > 0 ? 'Success Rate' : 'Requires applications'}
          </span>
        </div>

      </div>

      {/* Application Funnel & Application Velocity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Application Pipeline (Funnel Visualizer) */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Application Pipeline
            </h3>
            <span className="text-xs font-mono text-white/50">Lifecycle Flow</span>
          </div>

          {appStats.total === 0 ? (
            <div className="p-8 bg-[#11131c] border border-white/5 rounded-xl text-center space-y-2">
              <Send className="w-8 h-8 text-white/20 mx-auto" />
              <h4 className="text-sm font-bold font-geist text-white">No applications tracked yet</h4>
              <p className="text-xs font-mono text-white/50 max-w-sm mx-auto">
                Apply to jobs through HireFlow and mark them as applied to start building your application analytics.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {[
                { label: 'Applied', count: appStats.applied, color: 'bg-blue-500' },
                { label: 'Screening', count: appStats.screening, color: 'bg-indigo-500' },
                { label: 'Interview', count: appStats.interview, color: 'bg-cyan-500' },
                { label: 'Offer', count: appStats.offer, color: 'bg-emerald-500' },
                { label: 'Accepted', count: appStats.accepted, color: 'bg-blue-600' }
              ].map((stage) => {
                const percent = Math.min(100, Math.round((stage.count / Math.max(1, appStats.total)) * 100));
                return (
                  <div key={stage.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white font-medium">{stage.label}</span>
                      <span className="text-white/60">{stage.count} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#11131c] rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Terminal Outcome: Rejected */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/60">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <XCircle className="w-4 h-4" /> Rejected Applications:
                </span>
                <span className="font-bold text-rose-400">{appStats.rejected} ({appStats.rejectionRate}%)</span>
              </div>
            </div>
          )}
        </div>

        {/* Application Velocity / Activity Chart */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Application Activity
            </h3>
            <span className="text-xs font-mono text-white/50">Submissions Over Time</span>
          </div>

          {velocity.length === 0 ? (
            <div className="p-8 bg-[#11131c] border border-white/5 rounded-xl text-center space-y-2">
              <Calendar className="w-8 h-8 text-white/20 mx-auto" />
              <h4 className="text-sm font-bold font-geist text-white">No activity records in period</h4>
              <p className="text-xs font-mono text-white/50 max-w-sm mx-auto">
                Applications created over time will generate your activity velocity charts.
              </p>
            </div>
          ) : (
            <div className="h-52 pt-6 flex items-end justify-between gap-2 border-b border-white/10 pb-2">
              {velocity.map((item: any) => {
                const maxVal = Math.max(...velocity.map((v: any) => v.count), 1);
                const heightPercent = Math.round((item.count / maxVal) * 100);
                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </span>
                    <div 
                      className="w-full max-w-[28px] bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-md transition-all duration-300 hover:brightness-125"
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                    />
                    <span className="text-[9px] font-mono text-white/40 truncate w-full text-center">
                      {item.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Job Match Intelligence & Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Average Match Score Gauge */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Average Match Score
            </h3>
            <p className="text-xs text-white/60 mt-1">Average candidate score across evaluated job matches.</p>
          </div>

          {matchStats.totalMatches === 0 ? (
            <div className="p-6 bg-[#11131c] rounded-xl text-center space-y-1 border border-white/5">
              <span className="text-xs font-mono text-white/50">No match data yet</span>
              <p className="text-[11px] text-white/40">Analyze jobs to start seeing your match insights.</p>
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-blue-500/30 bg-blue-500/10">
                <span className="text-4xl font-bold font-mono text-white">{matchStats.avgMatchScore}%</span>
              </div>
              <span className="text-xs font-mono text-white/60 block">Based on {matchStats.totalMatches} Analyzed Jobs</span>
            </div>
          )}
        </div>

        {/* Match Score Distribution Histogram */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Match Score Distribution
            </h3>
            <span className="text-xs font-mono text-white/50">{matchStats.totalMatches} Total Matches</span>
          </div>

          {matchStats.totalMatches === 0 ? (
            <div className="p-8 bg-[#11131c] border border-white/5 rounded-xl text-center space-y-2">
              <h4 className="text-sm font-bold font-geist text-white">No match distribution data</h4>
              <p className="text-xs font-mono text-white/50">Analyze jobs to group score distributions.</p>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {(matchStats.distribution || []).map((dist: any) => {
                const percent = Math.min(100, Math.round((dist.count / Math.max(1, matchStats.totalMatches)) * 100));
                return (
                  <div key={dist.range} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white/80">{dist.range}% Score</span>
                      <span className="text-white font-bold">{dist.count} Jobs ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#11131c] rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Top Missing Skills & Top Matched Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Missing Skills (from PostgreSQL job_matches) */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Top Missing Skills
            </h3>
            <span className="text-xs font-mono text-amber-400">Skill Gaps</span>
          </div>

          {skillsData.topMissing.length === 0 ? (
            <div className="p-8 bg-[#11131c] border border-white/5 rounded-xl text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-white/20 mx-auto" />
              <h4 className="text-sm font-bold font-geist text-white">No skill-gap data yet</h4>
              <p className="text-xs font-mono text-white/50 max-w-sm mx-auto">
                Analyze more jobs to discover your most common skill gaps.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {skillsData.topMissing.map((item: any) => {
                const maxCount = Math.max(...skillsData.topMissing.map((s: any) => s.count), 1);
                const percent = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.skill} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white capitalize font-semibold">{item.skill}</span>
                      <span className="text-amber-400 font-bold">{item.count} Jobs</span>
                    </div>
                    <div className="w-full h-2 bg-[#11131c] rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Matched Skills (from PostgreSQL job_matches) */}
        <div className="bg-[#191b25] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Top Matched Skills
            </h3>
            <span className="text-xs font-mono text-emerald-400">Strongest Skills</span>
          </div>

          {skillsData.topMatched.length === 0 ? (
            <div className="p-8 bg-[#11131c] border border-white/5 rounded-xl text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-white/20 mx-auto" />
              <h4 className="text-sm font-bold font-geist text-white">No matched skills data yet</h4>
              <p className="text-xs font-mono text-white/50 max-w-sm mx-auto">
                Matched skills will appear as jobs are analyzed against your resume.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {skillsData.topMatched.map((item: any) => {
                const maxCount = Math.max(...skillsData.topMatched.map((s: any) => s.count), 1);
                const percent = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.skill} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white capitalize font-semibold">{item.skill}</span>
                      <span className="text-emerald-400 font-bold">{item.count} Jobs</span>
                    </div>
                    <div className="w-full h-2 bg-[#11131c] rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Saved Jobs Conversion Card */}
      <div className="bg-[#191b25] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-400" /> Saved → Applied Conversion
          </h3>
          <p className="text-xs text-white/60 font-mono">
            Percentage of saved jobs that were subsequently converted into submitted applications.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs font-mono text-white/50 block">Saved Jobs Converted</span>
            <span className="text-lg font-bold font-mono text-white">
              {savedData.savedAndApplied} / {savedData.totalSaved}
            </span>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 px-5 py-3 rounded-2xl text-center">
            <span className="text-xs font-mono text-purple-300 block uppercase font-bold">Conversion Rate</span>
            <span className="text-2xl font-bold font-mono text-purple-400 block">{savedData.savedToAppliedRate}%</span>
          </div>
        </div>
      </div>

    </div>
  );
};
