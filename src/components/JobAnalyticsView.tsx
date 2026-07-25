import React from 'react';
import { TrendingUp, Send, Bookmark, Calendar, Award, CheckCircle2, XCircle, AlertTriangle, Building2, BarChart2, PieChart } from 'lucide-react';
import { ApplicationCard, JobRecommendation } from '../types';

interface JobAnalyticsViewProps {
  applications: ApplicationCard[];
  savedJobs: JobRecommendation[];
}

export const JobAnalyticsView: React.FC<JobAnalyticsViewProps> = ({
  applications,
  savedJobs
}) => {
  const totalApplied = applications.length;
  const totalSaved = savedJobs.length;

  const interviewApps = applications.filter(a => a.status === 'interview' || a.status === 'hr_round' || a.status === 'offer' || a.status === 'accepted');
  const offerApps = applications.filter(a => a.status === 'offer' || a.status === 'accepted');
  const rejectedApps = applications.filter(a => a.status === 'rejected');
  const respondedApps = applications.filter(a => a.status !== 'applied' && a.status !== 'saved');

  const interviewRate = totalApplied > 0 ? Math.round((interviewApps.length / totalApplied) * 100) : 0;
  const offerRate = totalApplied > 0 ? Math.round((offerApps.length / totalApplied) * 100) : 0;
  const responseRate = totalApplied > 0 ? Math.round((respondedApps.length / totalApplied) * 100) : 0;
  const rejectionRate = totalApplied > 0 ? Math.round((rejectedApps.length / totalApplied) * 100) : 0;

  // Monthly breakdown mock
  const monthlyData = [
    { month: 'Mar', count: 4 },
    { month: 'Apr', count: 7 },
    { month: 'May', count: 12 },
    { month: 'Jun', count: 9 },
    { month: 'Jul', count: totalApplied || 6 }
  ];
  const maxMonthly = Math.max(...monthlyData.map(m => m.count), 1);

  // Top Skills Missing breakdown
  const missingSkillsData = [
    { skill: 'Docker & Containers', count: 14, impact: 'High Impact' },
    { skill: 'Terraform / IaC', count: 11, impact: 'High Impact' },
    { skill: 'C++ Systems Programming', count: 8, impact: 'Medium Impact' },
    { skill: 'GraphQL APIs', count: 6, impact: 'Medium Impact' },
    { skill: 'WebAssembly (Wasm)', count: 4, impact: 'Low Impact' }
  ];

  // Most Applied Companies breakdown
  const companyCounts: Record<string, number> = {};
  applications.forEach(app => {
    companyCounts[app.company] = (companyCounts[app.company] || 0) + 1;
  });
  const sortedCompanies = Object.entries(companyCounts)
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-2xl font-bold font-geist text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-[#0052ff]" /> Job Search Analytics & Conversion
          </h1>
          <p className="text-xs font-mono text-[#a1a3b8] mt-1">
            Track interview conversion rates, response velocity, missing skills, and application trends.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[#11131c] border border-[#434656]/40 px-3 py-1.5 rounded-xl text-xs font-mono text-[#4cd7f6]">
          <TrendingUp className="w-4 h-4" /> Live Performance Analytics
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-[#a1a3b8] uppercase block">Applications Sent</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">{totalApplied}</span>
          <span className="text-[10px] font-mono text-[#4cd7f6] mt-1 block flex items-center gap-1">
            <Send className="w-3 h-3" /> Submitted
          </span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-[#a1a3b8] uppercase block">Saved Jobs</span>
          <span className="text-2xl font-bold font-mono text-[#d0bcff] mt-1 block">{totalSaved}</span>
          <span className="text-[10px] font-mono text-[#d0bcff] mt-1 block flex items-center gap-1">
            <Bookmark className="w-3 h-3" /> Shortlisted
          </span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-[#a1a3b8] uppercase block">Interview Rate</span>
          <span className="text-2xl font-bold font-mono text-[#4cd7f6] mt-1 block">{interviewRate}%</span>
          <span className="text-[10px] font-mono text-[#4cd7f6] mt-1 block flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {interviewApps.length} Rounds
          </span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-[#a1a3b8] uppercase block">Offer Rate</span>
          <span className="text-2xl font-bold font-mono text-[#8d90a2] mt-1 block">{offerRate}%</span>
          <span className="text-[10px] font-mono text-[#8d90a2] mt-1 block flex items-center gap-1">
            <Award className="w-3 h-3" /> {offerApps.length} Offers
          </span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-[#a1a3b8] uppercase block">Response Rate</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">{responseRate}%</span>
          <span className="text-[10px] font-mono text-[#a1a3b8] mt-1 block">Active Recruiter Replies</span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-[#a1a3b8] uppercase block">Rejection Rate</span>
          <span className="text-2xl font-bold font-mono text-[#571bc1] mt-1 block">{rejectionRate}%</span>
          <span className="text-[10px] font-mono text-[#d0bcff] mt-1 block flex items-center gap-1">
            <XCircle className="w-3 h-3" /> {rejectedApps.length} Archived
          </span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-mono text-[#a1a3b8] uppercase block">Acceptance Rate</span>
          <span className="text-2xl font-bold font-mono text-[#0052ff] mt-1 block">100%</span>
          <span className="text-[10px] font-mono text-[#0052ff] mt-1 block">High Intent</span>
        </div>

      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Applications Chart */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0052ff]" /> Monthly Application Velocity
          </h3>
          <p className="text-xs text-[#a1a3b8]">Volume of applications submitted over recent months.</p>

          <div className="h-48 pt-8 flex items-end justify-between gap-4 border-b border-[#434656]/30 pb-2">
            {monthlyData.map((item) => {
              const heightPercent = Math.round((item.count / maxMonthly) * 100);
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-mono text-[#4cd7f6] font-bold">{item.count}</span>
                  <div 
                    className="w-full max-w-[40px] bg-gradient-to-t from-[#0052ff] to-[#4cd7f6] rounded-t-lg transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-mono text-[#a1a3b8]">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Skills Missing Breakdown */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#571bc1]" /> Top Missing Skills across Saved/Target Roles
          </h3>
          <p className="text-xs text-[#a1a3b8]">Closing these skill gaps will increase your match score across 80%+ of recommended roles.</p>

          <div className="space-y-3 pt-2">
            {missingSkillsData.map((sk) => (
              <div key={sk.skill} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white font-bold">{sk.skill}</span>
                  <span className="text-[#a1a3b8]">{sk.count} target roles match</span>
                </div>
                <div className="w-full h-2 bg-[#11131c] rounded-full overflow-hidden border border-[#434656]/20">
                  <div 
                    className={`h-full rounded-full ${
                      sk.impact === 'High Impact' ? 'bg-[#0052ff]' : 'bg-[#571bc1]'
                    }`}
                    style={{ width: `${(sk.count / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Companies Applied Breakdown */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0052ff]" /> Most Applied Companies & Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedCompanies.length === 0 ? (
            <div className="col-span-full text-xs font-mono text-[#a1a3b8] p-4 bg-[#11131c] rounded-xl text-center">
              No applications tracked yet. Move jobs from Recommended into the Application Tracker!
            </div>
          ) : (
            sortedCompanies.map((c) => (
              <div key={c.company} className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-geist text-white">{c.company}</h4>
                  <span className="text-xs font-mono text-[#4cd7f6]">{c.count} Active Application{c.count > 1 ? 's' : ''}</span>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#0052ff]/20 text-[#4cd7f6] border border-[#0052ff]/40 flex items-center justify-center font-mono font-bold text-xs">
                  {c.count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
