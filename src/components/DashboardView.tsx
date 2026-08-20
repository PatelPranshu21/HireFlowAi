import React, { useState } from 'react';
import { UserProfile, TaskItem, JobRecommendation, ActivityLog, NavigationTab } from '../types';
import { 
  BarChart3, 
  Award, 
  Send, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Upload,
  CheckCircle2,
  Circle,
  ArrowRight,
  Square,
  CheckSquare,
  Bell,
  Target,
  UserCheck,
  Briefcase,
  Loader2,
  AlertCircle,
  Clock,
  Layers,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getGreeting } from '../utils/userUtils';

interface DashboardViewProps {
  user: UserProfile;
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  recommendations: JobRecommendation[];
  activities: ActivityLog[];
  onNavigateTab: (tab: NavigationTab) => void;
  onAnalyzeResumeClick: () => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  tasks,
  onToggleTask,
  recommendations,
  activities,
  onNavigateTab,
  onAnalyzeResumeClick,
  onUpdateUser
}) => {
  const [timeRange, setTimeRange] = useState<'30' | '90'>('30');
  
  // Interactive onboarding state
  const [manualToggles, setManualToggles] = useState<Record<string, boolean>>({});
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState<boolean>(true);
  
  // Inline selection modals
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [showRolesModal, setShowRolesModal] = useState<boolean>(false);
  const [customGoalInput, setCustomGoalInput] = useState<string>('');

  const hasResume = Boolean(
    (user.resumeVersions && user.resumeVersions.length > 0) ||
    (user.resumeText && user.resumeText.trim().length > 0) ||
    user.hasUploadedResume
  );

  const hasProfile = Boolean(
    user.hasCompletedOnboarding ||
    (user.name && user.email && (user.title || user.location))
  );
  const hasApplications = Boolean(user.appliedJobIds && user.appliedJobIds.length > 0);
  const hasInterviews = Boolean(user.interviewMetrics && (user.interviewMetrics.completedSessionsCount || 0) > 0);

  const firstName = user.name ? user.name.trim().split(' ')[0] : 'User';

  // Helper function to resolve state per card
  const getCardState = (hasRealData: boolean): 'loading' | 'empty' | 'populated' => {
    return hasRealData ? 'populated' : 'empty';
  };

  // Evaluate task completion states automatically from user data or manual override
  const step1Done = hasResume || Boolean(manualToggles['resume']);
  const step2Done = hasProfile || Boolean(manualToggles['profile']);
  const step3Done = Boolean(user.targetRole && user.targetRole.trim().length > 0) || Boolean(manualToggles['goal']) || Boolean(user.hasCompletedOnboarding);
  const step4Done = Boolean(user.preferences?.preferredRoles && user.preferences.preferredRoles.length > 0) || Boolean(manualToggles['roles']) || Boolean(user.hasCompletedOnboarding);
  const step5Done = jobAlertsEnabled || Boolean(manualToggles['alerts']);

  const onboardingSteps = [
    { 
      id: 'resume', 
      label: 'Upload Resume', 
      done: step1Done, 
      actionLabel: step1Done ? 'Resume Active' : 'Upload File',
      subtitle: step1Done ? 'Resume uploaded & analyzed by AI' : 'Upload your resume to extract skills & ATS score' 
    },
    { 
      id: 'profile', 
      label: 'Complete Profile', 
      done: step2Done, 
      actionLabel: step2Done ? 'Profile Ready' : 'Edit Profile',
      subtitle: step2Done ? `${user.title || 'Profile updated'}` : 'Fill in contact info, current title & location' 
    },
    { 
      id: 'goal', 
      label: 'Choose Career Goal', 
      done: step3Done, 
      actionLabel: step3Done ? user.targetRole : 'Select Goal',
      subtitle: step3Done ? `Target: ${user.targetRole}` : 'Specify your desired target position or career milestone' 
    },
    { 
      id: 'roles', 
      label: 'Select Preferred Roles', 
      done: step4Done, 
      actionLabel: step4Done ? `${user.preferences?.preferredRoles?.length ?? 0} Selected` : 'Pick Roles',
      subtitle: step4Done ? user.preferences?.preferredRoles?.join(', ') : 'Choose 1-3 job titles to personalize recommendations' 
    },
    { 
      id: 'alerts', 
      label: 'Enable Job Alerts', 
      done: step5Done, 
      actionLabel: step5Done ? 'Alerts Active' : 'Enable Alerts',
      subtitle: step5Done ? 'Instant notifications enabled for match score > 85%' : 'Receive email & daily push alerts for matching roles' 
    },
  ];

  const completedStepsCount = onboardingSteps.filter(s => s.done).length;
  const progressPercentage = Math.round((completedStepsCount / 5) * 100);

  const toggleManualStep = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (id === 'alerts') {
      setJobAlertsEnabled(!jobAlertsEnabled);
    } else {
      setManualToggles(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const handleStepAction = (id: string) => {
    if (id === 'resume') {
      onAnalyzeResumeClick();
    } else if (id === 'profile') {
      onNavigateTab('profile');
    } else if (id === 'goal') {
      setShowGoalModal(true);
    } else if (id === 'roles') {
      setShowRolesModal(true);
    } else if (id === 'alerts') {
      setJobAlertsEnabled(!jobAlertsEnabled);
    }
  };

  // Dynamic Chart Data based on actual ATS / Employability scores
  const baseScore = hasResume ? (user.atsScore || 0) : 0;
  const chartData30 = [
    { day: 'Day 1', score: Math.max(0, baseScore - 15) },
    { day: 'Day 5', score: Math.max(0, baseScore - 10) },
    { day: 'Day 10', score: Math.max(0, baseScore - 5) },
    { day: 'Day 15', score: Math.max(0, baseScore - 2) },
    { day: 'Day 20', score: baseScore },
    { day: 'Day 25', score: baseScore },
    { day: 'Day 30', score: baseScore },
  ];

  const chartData90 = [
    { day: 'Month 1', score: Math.max(0, baseScore - 20) },
    { day: 'Month 2', score: Math.max(0, baseScore - 10) },
    { day: 'Month 3', score: baseScore },
  ];

  const chartData = timeRange === '30' ? chartData30 : chartData90;

  // Resolve states for each card
  const onboardingState = getCardState(completedStepsCount > 0);
  const atsState = getCardState(hasResume && (user.atsScore || 0) > 0);
  const employabilityState = getCardState(hasResume && Boolean(user.analytics?.employabilityScore));
  const applicationsState = getCardState(hasApplications);
  const interviewsState = getCardState(hasInterviews);
  const chartState = getCardState(hasResume);
  const recommendationsState = getCardState(hasResume && recommendations.length > 0);

  return (
    <div className="max-w-[1280px] mx-auto px-6 pt-8 pb-16 space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Header & State Selector Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mb-3">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-semibold text-blue-400">Live Career Telemetry</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-light font-geist text-white mb-1 tracking-tight">
            Welcome, {firstName}
          </h2>
          <p className="text-sm md:text-base text-white/50">
            {hasResume 
              ? 'Your career flow and ATS optimization metrics are actively tracking.'
              : 'Get started by completing your onboarding checklist below to unlock tailored job recommendations.'}
          </p>
        </div>
      </div>

      {/* IF USER SKIPPED RESUME - SHOW SPECIAL "UPLOAD RESUME TO UNLOCK" CARD */}
      {!hasResume && (
        <div className="bg-gradient-to-br from-blue-900/30 via-[#191b25] to-[#12131d] border-2 border-blue-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold">
                <Upload className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Resume Upload Pending
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-geist text-white tracking-tight">
                Upload Resume to Unlock AI Features
              </h3>
              <p className="text-xs sm:text-sm font-mono text-[#a1a3b8]">
                Unlock your complete AI Career Engine with custom ATS scoring and job matching:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-mono font-semibold text-white">
                <div className="flex items-center gap-2 bg-[#11131c]/80 p-2.5 rounded-xl border border-blue-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Resume Analysis</span>
                </div>
                <div className="flex items-center gap-2 bg-[#11131c]/80 p-2.5 rounded-xl border border-blue-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Job Matches</span>
                </div>
                <div className="flex items-center gap-2 bg-[#11131c]/80 p-2.5 rounded-xl border border-blue-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ATS Score</span>
                </div>
                <div className="flex items-center gap-2 bg-[#11131c]/80 p-2.5 rounded-xl border border-blue-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cover Letter Generator</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-center w-full md:w-auto">
              <button
                onClick={onAnalyzeResumeClick}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-mono text-sm font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-500/30 cursor-pointer flex items-center justify-center gap-3 active:scale-95"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* METRICS GRID (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: ATS Score */}
        <div 
          onClick={onAnalyzeResumeClick}
          className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 flex flex-col justify-between group hover:border-[#0052ff]/50 transition-all cursor-pointer shadow-xl min-h-[160px]"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#a1a3b8]">ATS Score</span>
            <BarChart3 className="w-5 h-5 text-[#4cd7f6]" />
          </div>

          {atsState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-[#0052ff] animate-spin mb-2" />
              <span className="text-xs font-mono text-[#a1a3b8]">Analyzing ATS compatibility...</span>
            </div>
          )}

          {atsState === 'empty' && (
            <div className="flex flex-col items-center justify-center text-center py-2 space-y-1">
              <span className="text-xs font-mono text-[#a1a3b8] font-bold">No data available.</span>
              <p className="text-[10px] text-[#a1a3b8] max-w-[180px]">
                Complete your profile and upload your resume to receive AI recommendations.
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); onAnalyzeResumeClick(); }}
                className="mt-2 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" /> Upload Resume
              </button>
            </div>
          )}

          {atsState === 'populated' && (
            <>
              <div className="flex items-center justify-center py-2">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path 
                      className="text-[#434656]/30 stroke-current" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      strokeWidth="3" 
                    />
                    <path 
                      className="text-[#0052ff] stroke-current" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      strokeDasharray={`${user.atsScore || 0}, 100`} 
                      strokeLinecap="round" 
                      strokeWidth="3" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold font-geist text-white leading-none">{user.atsScore || 0}</span>
                    <span className="text-[10px] text-[#a1a3b8]">/100</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#a1a3b8] text-center font-mono">
                Parsed from active resume
              </p>
            </>
          )}
        </div>

        {/* Metric 2: Employability Score */}
        <div 
          onClick={() => onNavigateTab('career-tools')}
          className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 flex flex-col justify-between group hover:border-[#571bc1]/50 transition-all cursor-pointer shadow-xl min-h-[160px]"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#a1a3b8]">Employability Score</span>
            <Award className="w-5 h-5 text-[#d0bcff]" />
          </div>

          {employabilityState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-[#571bc1] animate-spin mb-2" />
              <span className="text-xs font-mono text-[#a1a3b8]">Computing employability score...</span>
            </div>
          )}

          {employabilityState === 'empty' && (
            <div className="flex flex-col items-center justify-center text-center py-2 space-y-1">
              <span className="text-xs font-mono text-[#a1a3b8] font-bold">No data available.</span>
              <p className="text-[10px] text-[#a1a3b8] max-w-[180px]">
                Complete your profile and upload your resume to receive AI recommendations.
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); onNavigateTab('profile'); }}
                className="mt-2 bg-[#11131c] hover:bg-[#434656]/30 text-[#e1e1ef] border border-[#434656]/40 px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-3 h-3 text-[#4cd7f6]" /> Complete Profile
              </button>
            </div>
          )}

          {employabilityState === 'populated' && (
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold font-geist text-white">
                {user.analytics?.employabilityScore || 0}
                <span className="text-sm font-normal text-[#a1a3b8]">/100</span>
              </span>
              <div className="flex gap-1.5">
                <div className="h-1 flex-1 rounded-full bg-[#571bc1]" />
                <div className="h-1 flex-1 rounded-full bg-[#571bc1]" />
                <div className="h-1 flex-1 rounded-full bg-[#571bc1]" />
                <div className="h-1 flex-1 bg-[#434656]/30 rounded-full" />
              </div>
              <span className="text-xs font-mono text-[#d0bcff] font-medium">
                Readiness: {user.analytics?.careerReadinessScore ?? 0}%
              </span>
            </div>
          )}
        </div>

        {/* Metric 3: Applications */}
        <div 
          onClick={() => onNavigateTab('job-suite')}
          className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 flex flex-col justify-between group hover:border-[#434656] transition-all cursor-pointer shadow-xl min-h-[160px]"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#a1a3b8]">Applications</span>
            <Send className="w-5 h-5 text-[#4cd7f6]" />
          </div>

          {applicationsState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-[#4cd7f6] animate-spin mb-2" />
              <span className="text-xs font-mono text-[#a1a3b8]">Syncing applications...</span>
            </div>
          )}

          {applicationsState === 'empty' && (
            <div className="flex flex-col items-center justify-center text-center py-2 space-y-1">
              <span className="text-xs font-mono text-[#a1a3b8] font-bold">No data available.</span>
              <p className="text-[10px] text-[#a1a3b8] max-w-[180px]">
                Complete your profile and upload your resume to receive AI recommendations.
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); onNavigateTab('job-suite'); }}
                className="mt-2 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Briefcase className="w-3 h-3" /> Browse Jobs
              </button>
            </div>
          )}

          {applicationsState === 'populated' && (
            <div className="flex flex-col">
              <span className="text-4xl font-bold font-geist text-white">
                {user.appliedJobIds?.length ?? 0}
              </span>
              <span className="text-xs text-[#a1a3b8] font-mono mt-1">Active tracked applications</span>
            </div>
          )}
        </div>

        {/* Metric 4: Upcoming Interviews */}
        <div 
          onClick={() => onNavigateTab('interviews')}
          className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 flex flex-col justify-between group hover:border-[#434656] transition-all cursor-pointer shadow-xl min-h-[160px]"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#a1a3b8]">Interviews</span>
            <CalendarIcon className="w-5 h-5 text-orange-400" />
          </div>

          {interviewsState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-2" />
              <span className="text-xs font-mono text-[#a1a3b8]">Fetching interview logs...</span>
            </div>
          )}

          {interviewsState === 'empty' && (
            <div className="flex flex-col items-center justify-center text-center py-2 space-y-1">
              <span className="text-xs font-mono text-[#a1a3b8] font-bold">No data available.</span>
              <p className="text-[10px] text-[#a1a3b8] max-w-[180px]">
                Complete your profile and upload your resume to receive AI recommendations.
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); onNavigateTab('interviews'); }}
                className="mt-2 bg-[#11131c] hover:bg-[#434656]/30 text-[#e1e1ef] border border-[#434656]/40 px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <CalendarIcon className="w-3 h-3 text-orange-400" /> Start Mock Practice
              </button>
            </div>
          )}

          {interviewsState === 'populated' && (
            <div className="flex flex-col">
              <span className="text-4xl font-bold font-geist text-white">
                {user.interviewMetrics?.completedSessionsCount || 2}
              </span>
              <span className="text-xs text-[#a1a3b8] font-mono mt-1">Mock sessions logged</span>
            </div>
          )}
        </div>

      </div>

      {/* BENTO GRID CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Main Chart Area (Spans 8 cols) */}
        <div className="lg:col-span-8 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col min-h-[380px] shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold font-geist text-white">Success Probability</h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '30' | '90')}
              className="bg-[#11131c] border border-[#434656]/40 text-xs font-mono text-[#e1e1ef] rounded-lg py-1 px-3 focus:outline-none focus:border-[#0052ff] cursor-pointer"
            >
              <option value="30" className="bg-[#11131c]">Last 30 Days</option>
              <option value="90" className="bg-[#11131c]">Last 90 Days</option>
            </select>
          </div>

          {/* LOADING STATE */}
          {chartState === 'loading' && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 animate-pulse space-y-3">
              <Loader2 className="w-10 h-10 text-[#0052ff] animate-spin" />
              <span className="text-xs font-mono text-[#a1a3b8]">Generating career probability telemetry chart...</span>
            </div>
          )}

          {/* EMPTY STATE */}
          {chartState === 'empty' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 border border-dashed border-[#434656]/30 rounded-xl bg-[#11131c]/40">
              <BarChart3 className="w-10 h-10 text-[#434656]" />
              <h4 className="text-base font-bold text-white font-geist">Success Telemetry Chart Uninitialized</h4>
              <p className="text-base font-bold font-geist text-white">No data available.</p>
              <p className="text-xs font-mono text-[#a1a3b8] max-w-md">
                Complete your profile and upload your resume to receive AI recommendations.
              </p>
              <button
                onClick={onAnalyzeResumeClick}
                className="mt-2 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-4 py-2 rounded-xl font-mono text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Upload className="w-4 h-4" /> Upload Resume
              </button>
            </div>
          )}

          {/* POPULATED STATE */}
          {chartState === 'populated' && (
            <div className="flex-1 w-full min-h-[240px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0052ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#11131c', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#ffffff' }}
                    labelStyle={{ color: '#4cd7f6', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#0052ff" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#successGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recommended Jobs (Spans 4 cols) */}
        <div className="lg:col-span-4 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold font-geist text-white">Recommended for You</h3>
            <Sparkles className="w-5 h-5 text-[#4cd7f6]" />
          </div>

          {/* LOADING STATE */}
          {recommendationsState === 'loading' && (
            <div className="space-y-3 animate-pulse flex-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#11131c] rounded-xl border border-[#434656]/20" />
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {recommendationsState === 'empty' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#434656]/40 rounded-xl bg-[#11131c]/50 space-y-3">
              <Upload className="w-8 h-8 text-[#0052ff] mb-1" />
              <h4 className="text-sm font-bold text-white font-geist">No Matches Generated</h4>
              <p className="text-base font-bold font-geist text-white">No data available.</p>
              <p className="text-xs font-mono text-[#a1a3b8] max-w-xs">
                Complete your profile and upload your resume to receive AI recommendations.
              </p>
              <button
                onClick={onAnalyzeResumeClick}
                className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-4 py-2 rounded-xl font-bold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg mt-2"
              >
                Upload Resume Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* POPULATED STATE */}
          {recommendationsState === 'populated' && (
            <div className="flex flex-col gap-3">
              {recommendations.slice(0, 3).map((job) => (
                <div 
                  key={job.id}
                  onClick={() => onNavigateTab('job-suite')}
                  className="p-4 rounded-xl border border-[#434656]/30 hover:border-[#0052ff]/50 hover:bg-[#11131c] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold text-white">{job.title}</h4>
                    <span className="bg-[#0052ff]/20 text-[#4cd7f6] border border-[#0052ff]/30 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                      {job.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#a1a3b8] mb-3">{job.company} • {job.location}</p>
                  <div className="flex gap-2">
                    {job.tags?.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-[#11131c] border border-[#434656]/30 rounded-md px-2 py-0.5 text-[#e1e1ef]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* QUICK INLINE MODAL FOR CHOOSE CAREER GOAL */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#191b25] border border-[#434656] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Target className="w-5 h-5 text-[#0052ff]" /> Choose Your Career Goal
            </div>
            <p className="text-xs font-mono text-[#a1a3b8]">
              Select a target role or enter your custom career objective to focus your AI job matches.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                'Senior Software Engineer',
                'Full Stack Developer',
                'Product Manager',
                'UX/UI Designer',
                'Data Engineer / AI Specialist'
              ].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    if (onUpdateUser) onUpdateUser({ targetRole: role });
                    setManualToggles(prev => ({ ...prev, goal: true }));
                    setShowGoalModal(false);
                  }}
                  className="p-3 text-left bg-[#11131c] border border-[#434656]/40 hover:border-[#0052ff] rounded-xl text-xs font-mono text-white transition-all cursor-pointer hover:bg-[#0052ff]/10"
                >
                  {role}
                </button>
              ))}
            </div>
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Or type custom target role..."
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                className="flex-1 bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-xs text-white placeholder-[#a1a3b8] focus:outline-none focus:border-[#0052ff]"
              />
              <button
                onClick={() => {
                  if (customGoalInput.trim()) {
                    if (onUpdateUser) onUpdateUser({ targetRole: customGoalInput.trim() });
                    setManualToggles(prev => ({ ...prev, goal: true }));
                  }
                  setShowGoalModal(false);
                }}
                className="bg-[#0052ff] text-white text-xs font-mono font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Save
              </button>
            </div>
            <button
              onClick={() => setShowGoalModal(false)}
              className="w-full text-center text-xs font-mono text-[#a1a3b8] hover:text-white pt-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* QUICK INLINE MODAL FOR SELECT PREFERRED ROLES */}
      {showRolesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#191b25] border border-[#434656] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Briefcase className="w-5 h-5 text-[#4cd7f6]" /> Select Preferred Roles
            </div>
            <p className="text-xs font-mono text-[#a1a3b8]">
              Pick roles you want to target in Job Hub recommendations.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Frontend Engineer',
                'Backend Engineer',
                'Full Stack Developer',
                'DevOps Lead',
                'Product Manager',
                'UX Designer',
                'Mobile Engineer (iOS/Android)'
              ].map((role) => {
                const current = user.preferences?.preferredRoles || [];
                const isSelected = current.includes(role);
                return (
                  <button
                    key={role}
                    onClick={() => {
                      const updated = isSelected 
                        ? current.filter(r => r !== role)
                        : [...current, role];
                      if (onUpdateUser) {
                        onUpdateUser({
                          preferences: {
                            ...(user.preferences || {
                              preferredCompanies: [],
                              preferredCities: [],
                              remotePreference: 'Remote',
                              expectedSalaryMin: 120000,
                              expectedSalaryMax: 200000,
                              experienceLevel: '5+ years',
                              preferredTechnologies: [],
                              preferredIndustries: []
                            }),
                            preferredRoles: updated
                          }
                        });
                      }
                      setManualToggles(prev => ({ ...prev, roles: true }));
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#0052ff] border-[#0052ff] text-white font-bold' 
                        : 'bg-[#11131c] border-[#434656]/40 text-[#a1a3b8] hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{role}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                setManualToggles(prev => ({ ...prev, roles: true }));
                setShowRolesModal(false);
              }}
              className="w-full bg-[#0052ff] text-white text-xs font-mono font-bold py-2.5 rounded-xl cursor-pointer mt-4"
            >
              Done Selecting
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
