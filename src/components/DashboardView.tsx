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
  Clock, 
  Briefcase
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
  user: UserProfile;
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  recommendations: JobRecommendation[];
  activities: ActivityLog[];
  onNavigateTab: (tab: NavigationTab) => void;
  onAnalyzeResumeClick: () => void;
}

const mockChartData30 = [
  { day: 'Day 1', score: 62 },
  { day: 'Day 5', score: 65 },
  { day: 'Day 10', score: 71 },
  { day: 'Day 15', score: 78 },
  { day: 'Day 20', score: 82 },
  { day: 'Day 25', score: 85 },
  { day: 'Day 30', score: 88 },
];

const mockChartData90 = [
  { day: 'Month 1', score: 55 },
  { day: 'Month 2', score: 72 },
  { day: 'Month 3', score: 88 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  tasks,
  onToggleTask,
  recommendations,
  activities,
  onNavigateTab,
  onAnalyzeResumeClick
}) => {
  const [timeRange, setTimeRange] = useState<'30' | '90'>('30');
  const chartData = timeRange === '30' ? mockChartData30 : mockChartData90;

  return (
    <div className="max-w-[1280px] mx-auto px-6 pt-8 pb-16">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mb-3">
          <span className="flex h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-blue-400">Live Career Telemetry</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-light font-geist text-white mb-1 tracking-tight">
          Welcome back, <span className="font-semibold">{user.name}</span>.
        </h2>
        <p className="text-sm md:text-base text-white/50">Your career flow and ATS optimization metrics are performing well.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Metric 1: ATS Score */}
        <div 
          onClick={onAnalyzeResumeClick}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between ai-gradient-border group hover:border-blue-500/40 transition-all cursor-pointer shadow-xl"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-white/40">ATS Score</span>
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex items-center justify-center py-2">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path 
                  className="text-white/10 stroke-current" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  strokeWidth="3" 
                />
                <path 
                  className="text-blue-500 stroke-current" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  strokeDasharray={`${user.atsScore}, 100`} 
                  strokeLinecap="round" 
                  strokeWidth="3" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold font-geist text-white leading-none">{user.atsScore}</span>
                <span className="text-[10px] text-white/40">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Resume Strength */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between group hover:border-white/20 transition-all shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-white/40">Resume Strength</span>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-bold font-geist text-white">{user.tier}</span>
            <div className="flex gap-1.5">
              <div className="h-1 flex-1 bg-purple-500 rounded-full" />
              <div className="h-1 flex-1 bg-purple-500 rounded-full" />
              <div className="h-1 flex-1 bg-purple-500 rounded-full" />
              <div className="h-1 flex-1 bg-white/10 rounded-full" />
            </div>
            <span className="text-xs font-mono text-purple-400 font-medium">Top 15% in field</span>
          </div>
        </div>

        {/* Metric 3: Applications */}
        <div 
          onClick={() => onNavigateTab('job-suite')}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between group hover:border-white/20 transition-all cursor-pointer shadow-xl"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-white/40">Applications</span>
            <Send className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-bold font-geist text-white">12</span>
            <span className="text-xs text-white/50">Active currently</span>
          </div>
        </div>

        {/* Metric 4: Upcoming Interviews */}
        <div 
          onClick={() => onNavigateTab('interviews')}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between group hover:border-white/20 transition-all cursor-pointer shadow-xl"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-white/40">Interviews</span>
            <CalendarIcon className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-bold font-geist text-white">3</span>
            <span className="text-xs text-white/50">Scheduled next 7 days</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Chart Area (Spans 8 cols) */}
        <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col min-h-[380px] shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold font-geist text-white">Success Probability</h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '30' | '90')}
              className="bg-white/10 border border-white/10 text-xs font-mono text-white/70 rounded-lg py-1 px-3 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="30" className="bg-[#050505]">Last 30 Days</option>
              <option value="90" className="bg-[#050505]">Last 90 Days</option>
            </select>
          </div>

          {/* Interactive Recharts Chart */}
          <div className="flex-1 w-full min-h-[240px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} domain={[40, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#ffffff' }}
                  labelStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#successGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Next Steps Checklist (Spans 4 cols) */}
        <div className="lg:col-span-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="mb-6">
            <h3 className="text-xl font-bold font-geist text-white mb-1">Next Steps</h3>
            <p className="text-xs font-mono text-white/40">Action items to boost your profile</p>
          </div>

          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer group ${
                  task.completed ? 'opacity-50 bg-white/5' : 'hover:bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                  task.completed 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-white/30 group-hover:border-white/60'
                }`}>
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm text-white ${task.completed ? 'line-through text-white/40' : ''}`}>
                    {task.title}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: task.tagColor || '#60a5fa' }}>
                    {task.tag}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigateTab('resume-suite')}
            className="mt-auto pt-4 w-full text-center text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            View All Tasks <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recommended Jobs (Spans 6 cols) */}
        <div className="lg:col-span-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold font-geist text-white">Recommended for You</h3>
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>

          <div className="flex flex-col gap-3">
            {recommendations.map((job) => (
              <div 
                key={job.id}
                onClick={() => onNavigateTab('job-suite')}
                className="p-4 rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-semibold text-white">{job.title}</h4>
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                    {job.matchScore}% Match
                  </span>
                </div>
                <p className="text-xs font-mono text-white/50 mb-3">{job.company} • {job.location}</p>
                <div className="flex gap-2">
                  {job.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline (Spans 6 cols) */}
        <div className="lg:col-span-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-xl">
          <h3 className="text-xl font-bold font-geist text-white mb-6">Recent Activity</h3>
          
          <div className="relative border-l border-white/10 ml-3 flex flex-col gap-6 pb-2">
            {activities.map((act) => (
              <div key={act.id} className="relative pl-6">
                <div className={`absolute w-2.5 h-2.5 rounded-full -left-[5px] top-1.5 shadow-sm ${
                  act.type === 'analysis' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' :
                  act.type === 'application' ? 'bg-white/40' : 'bg-purple-400'
                }`} />
                <p className="text-sm text-white font-medium">{act.title}</p>
                <p className="text-xs font-mono text-white/40 mt-0.5">{act.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
