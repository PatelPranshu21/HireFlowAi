import React from 'react';
import { UserProfile, ApplicationCard, ResumeVersion } from '../../types';
import { 
  BarChart3, 
  Sparkles, 
  Calendar, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Play, 
  Code, 
  MessageSquare, 
  Building2, 
  TrendingUp, 
  Clock, 
  Award,
  ArrowRight,
  Plus
} from 'lucide-react';

interface InterviewDashboardTabProps {
  user: UserProfile;
  applications: ApplicationCard[];
  resumeData?: ResumeVersion;
  readinessScore: number;
  mocksCompletedCount: number;
  codingSolvedCount: number;
  behavioralPracticedCount: number;
  streakDays: number;
  xpPoints: number;
  weakAreas: string[];
  strongAreas: string[];
  upcomingEvents: any[];
  onSelectTab: (tab: string) => void;
  onStartMockInterview: () => void;
  onScheduleInterviewModal: () => void;
}

export const InterviewDashboardTab: React.FC<InterviewDashboardTabProps> = ({
  user,
  applications,
  resumeData,
  readinessScore,
  mocksCompletedCount,
  codingSolvedCount,
  behavioralPracticedCount,
  streakDays,
  xpPoints,
  weakAreas,
  strongAreas,
  upcomingEvents,
  onSelectTab,
  onStartMockInterview,
  onScheduleInterviewModal
}) => {
  // Find applications in 'interview' or 'assessment' status
  const activeInterviewApps = applications.filter(a => a.status === 'interview' || a.status === 'assessment' || a.status === 'hr_round');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Readiness Overview */}
      <div className="bg-gradient-to-r from-[#191b25] via-[#11131c] to-[#191b25] border border-[#0052ff]/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0052ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#0052ff]/20 text-[#4cd7f6] font-mono text-xs font-bold border border-[#0052ff]/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4cd7f6]" />
                AI Interview Intelligence Active
              </span>
              <span className="px-3 py-1 rounded-full bg-[#32343f] text-[#c3c5d9] font-mono text-xs flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#ff8000]" />
                {streakDays} Day Study Streak
              </span>
              <span className="px-3 py-1 rounded-full bg-[#571bc1]/20 text-[#d0bcff] font-mono text-xs font-bold border border-[#571bc1]/40">
                {xpPoints} XP • Level 4 Candidate
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold font-geist text-white">
              Ready for your next tech interview, <span className="text-[#b7c4ff]">{user.name.split(' ')[0]}</span>?
            </h1>
            <p className="text-sm text-[#c3c5d9] font-sans leading-relaxed">
              Target Role: <strong className="text-white">{user.targetRole || 'Senior Software Engineer'}</strong>
              {resumeData?.parsedData?.skills && (
                <span className="text-[#8d90a2] ml-2">
                  (Resume Skills: {resumeData.parsedData.skills.slice(0, 4).join(', ')})
                </span>
              )}
            </p>
          </div>

          {/* Readiness Score Gauge */}
          <div className="bg-[#0c0e17]/80 border border-[#434656]/30 rounded-2xl p-5 flex items-center gap-5 min-w-[280px]">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="#282934" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  stroke="url(#blue-cyan-gradient)" 
                  strokeWidth="8" 
                  strokeDasharray={200}
                  strokeDashoffset={200 - (200 * readinessScore) / 100}
                  strokeLinecap="round"
                  fill="transparent" 
                />
                <defs>
                  <linearGradient id="blue-cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0052ff" />
                    <stop offset="100%" stopColor="#4cd7f6" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-xl font-bold font-geist text-white">{readinessScore}%</span>
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-[#4cd7f6] font-bold tracking-wider">Readiness Score</span>
              <h4 className="text-base font-bold font-geist text-white mt-0.5">High Readiness</h4>
              <p className="text-xs text-[#c3c5d9] mt-1">Top 12% among peer engineering candidates.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="mt-6 pt-6 border-t border-[#434656]/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartMockInterview}
              className="px-5 py-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-[#0052ff]/25 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Launch AI Mock Interview
            </button>

            <button
              onClick={() => onSelectTab('coding')}
              className="px-4 py-2.5 bg-[#282934] hover:bg-[#32343f] text-[#e1e1ef] rounded-xl text-xs font-mono font-medium border border-[#434656]/30 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Code className="w-4 h-4 text-[#4cd7f6]" />
              Practice Coding
            </button>

            <button
              onClick={() => onSelectTab('companies')}
              className="px-4 py-2.5 bg-[#282934] hover:bg-[#32343f] text-[#e1e1ef] rounded-xl text-xs font-mono font-medium border border-[#434656]/30 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#b7c4ff]" />
              Explore Companies
            </button>
          </div>

          <button
            onClick={onScheduleInterviewModal}
            className="px-4 py-2.5 bg-[#007083]/20 hover:bg-[#007083]/30 text-[#4cd7f6] rounded-xl text-xs font-mono font-bold border border-[#4cd7f6]/30 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Schedule Event
          </button>
        </div>
      </div>

      {/* Metrics Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">Mocks Completed</span>
            <Award className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <p className="text-2xl font-bold font-geist text-white">{mocksCompletedCount}</p>
          <span className="text-[11px] font-mono text-[#00d26a] flex items-center gap-1 mt-1">
            {mocksCompletedCount > 0 ? `+${mocksCompletedCount} completed` : 'No mock sessions yet'}
          </span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">Coding Solved</span>
            <Code className="w-4 h-4 text-[#b7c4ff]" />
          </div>
          <p className="text-2xl font-bold font-geist text-white">{codingSolvedCount}</p>
          <span className="text-[11px] font-mono text-[#c3c5d9] mt-1 block">
            {codingSolvedCount > 0 ? `${codingSolvedCount} problems solved` : '0 problems solved'}
          </span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">Behavioral Practiced</span>
            <MessageSquare className="w-4 h-4 text-[#d0bcff]" />
          </div>
          <p className="text-2xl font-bold font-geist text-white">{behavioralPracticedCount}</p>
          <span className="text-[11px] font-mono text-[#c3c5d9] mt-1 block">
            {behavioralPracticedCount > 0 ? `Avg STAR Score: ${user.interviewMetrics?.behavioralScore || 85}%` : '0 responses scored'}
          </span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">Study Hours</span>
            <Clock className="w-4 h-4 text-[#ff8000]" />
          </div>
          <p className="text-2xl font-bold font-geist text-white">{(user.interviewMetrics?.studyHours || 0).toFixed(1)} hrs</p>
          <span className="text-[11px] font-mono text-[#00d26a] mt-1 block">
            {(user.interviewMetrics?.studyHours || 0) > 0 ? 'On track with plan' : 'Start session to log time'}
          </span>
        </div>
      </div>

      {/* Main Content Grid: Upcoming Interviews & Weak/Strong Areas */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Upcoming Interviews & Calendar Feed */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Active Job Hub Applications with Upcoming Interviews */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0052ff]" />
                Upcoming Job Interviews (Job Hub Synced)
              </h3>
              <button 
                onClick={() => onSelectTab('companies')}
                className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1"
              >
                View Companies <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {activeInterviewApps.length === 0 ? (
              <div className="bg-[#11131c] border border-[#434656]/20 rounded-xl p-5 text-center">
                <p className="text-xs font-mono text-[#c3c5d9]">No active job interviews scheduled in Job Hub.</p>
                <p className="text-xs text-[#8d90a2] mt-1">When you mark a job as "Interviewing" in Job Hub, targeted prep will appear here automatically!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeInterviewApps.map(app => (
                  <div key={app.id} className="bg-[#11131c] border border-[#434656]/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-[#0052ff]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#282934] overflow-hidden flex items-center justify-center shrink-0 border border-[#434656]/30">
                        {app.companyLogo ? (
                          <img src={app.companyLogo} alt={app.company} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-[#b7c4ff]" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-geist text-white">{app.jobTitle}</h4>
                        <p className="text-xs font-mono text-[#c3c5d9]">{app.company} • <span className="text-[#4cd7f6]">{app.interviewTime || 'Scheduled for this week'}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={onStartMockInterview}
                        className="px-3 py-1.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        Prep {app.company} Mock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Targeted Recommendations */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
            <h3 className="text-base font-bold font-geist text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4cd7f6]" />
              AI Tailored Recommendations
            </h3>

            <div className="space-y-3">
              <div className="bg-[#11131c] border border-[#434656]/20 p-4 rounded-xl flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#0052ff]/20 text-[#0052ff] shrink-0 mt-0.5">
                    <Code className="w-4 h-4 text-[#4cd7f6]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Solve 2 Dynamic Programming Problems</h4>
                    <p className="text-xs text-[#c3c5d9] mt-0.5">Your weakness in 2D grid DP is holding back your Google readiness by 8 points.</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectTab('coding')}
                  className="px-3 py-1.5 bg-[#282934] hover:bg-[#32343f] text-[#4cd7f6] rounded-lg text-xs font-mono font-medium shrink-0 cursor-pointer"
                >
                  Solve Now
                </button>
              </div>

              <div className="bg-[#11131c] border border-[#434656]/20 p-4 rounded-xl flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#571bc1]/20 text-[#d0bcff] shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-[#d0bcff]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Refine STAR Conflict Resolution Story</h4>
                    <p className="text-xs text-[#c3c5d9] mt-0.5">Amazon and Microsoft interviews weight conflict management STAR stories heavily.</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectTab('behavioral')}
                  className="px-3 py-1.5 bg-[#282934] hover:bg-[#32343f] text-[#d0bcff] rounded-lg text-xs font-mono font-medium shrink-0 cursor-pointer"
                >
                  Practice HR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Weak Areas, Strong Areas & Scheduled Calendar Events */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Skill Diagnostic: Weak & Strong Topics */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
            <h3 className="text-base font-bold font-geist text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00d26a]" />
              Skill Strengths & Weaknesses
            </h3>

            {/* Weak Areas */}
            <div className="mb-5">
              <span className="text-xs font-mono text-[#ff4d4d] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Weak Topics (Focus Needed)
              </span>
              <div className="flex flex-wrap gap-2">
                {weakAreas.map((topic, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 text-[#ff8080] font-mono text-xs">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Strong Areas */}
            <div>
              <span className="text-xs font-mono text-[#00d26a] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mastered Strengths
              </span>
              <div className="flex flex-wrap gap-2">
                {strongAreas.map((topic, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-[#00d26a]/10 border border-[#00d26a]/30 text-[#00d26a] font-mono text-xs">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Feed */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4cd7f6]" />
                Scheduled Calendar Events
              </h3>
              <button
                onClick={onScheduleInterviewModal}
                className="p-1.5 bg-[#282934] hover:bg-[#32343f] text-[#4cd7f6] rounded-lg text-xs transition-colors cursor-pointer"
                title="Add Schedule Event"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-[#c3c5d9] font-mono py-2">No upcoming scheduled events.</p>
              ) : (
                upcomingEvents.map((evt, idx) => (
                  <div key={idx} className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-geist">{evt.title}</h4>
                      <p className="text-[11px] font-mono text-[#c3c5d9] mt-0.5">{evt.date} • {evt.time}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0052ff]/20 text-[#4cd7f6] border border-[#0052ff]/30">
                      {evt.type || 'Study'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
