import React from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart2, 
  PieChart as PieChartIcon, 
  Activity, 
  Target, 
  Award, 
  Zap,
  Briefcase
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const userGrowthData = [
  { week: 'W1', signups: 1200, retention: 78 },
  { week: 'W2', signups: 1850, retention: 81 },
  { week: 'W3', signups: 2400, retention: 84 },
  { week: 'W4', signups: 3100, retention: 88 },
  { week: 'W5', signups: 3890, retention: 91 },
  { week: 'W6', signups: 4500, retention: 93 },
];

const topSkillsData = [
  { skill: 'React 19 / Next.js', demand: 94 },
  { skill: 'TypeScript', demand: 92 },
  { skill: 'Docker & Kubernetes', demand: 86 },
  { skill: 'Node.js System Design', demand: 82 },
  { skill: 'Python / AI Engineering', demand: 78 },
];

export const AnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 flex justify-between items-center shadow-md">
        <div>
          <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-[#0052ff]" /> Business Intelligence & Analytics Suite
          </h3>
          <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">Cohort retention, acquisition velocity, conversion rates, and skill demand metrics.</p>
        </div>
      </div>

      {/* Primary BI Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Acquisition & Retention Cohorts */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-4">
          <div>
            <h4 className="text-base font-bold font-geist text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Candidate Signups & D30 Retention %
            </h4>
            <p className="text-xs text-[#8d90a2] font-mono">Weekly signup velocity vs D30 retention curve</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b2e3e" />
                <XAxis dataKey="week" stroke="#8d90a2" fontSize={11} />
                <YAxis stroke="#8d90a2" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0c0e17', borderColor: '#434656', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#growthGrad)" name="Weekly Signups" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Demanded Tech Skills */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-4">
          <div>
            <h4 className="text-base font-bold font-geist text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#4cd7f6]" /> Top In-Demand Engineering Skills
            </h4>
            <p className="text-xs text-[#8d90a2] font-mono">Index score based on job match requirements</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkillsData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b2e3e" />
                <XAxis type="number" stroke="#8d90a2" fontSize={11} />
                <YAxis dataKey="skill" type="category" stroke="#8d90a2" fontSize={11} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#0c0e17', borderColor: '#434656', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="demand" fill="#0052ff" radius={[0, 4, 4, 0]} name="Demand Index" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
