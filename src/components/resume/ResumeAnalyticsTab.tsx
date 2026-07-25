import React from 'react';
import { ResumeAnalysisResult } from '../../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  CheckCircle2, 
  Briefcase, 
  Sparkles, 
  BarChart3 
} from 'lucide-react';

interface ResumeAnalyticsTabProps {
  analysis: ResumeAnalysisResult;
}

const mockTrendData = [
  { date: 'Jun 1', score: 62 },
  { date: 'Jun 15', score: 68 },
  { date: 'Jul 1', score: 74 },
  { date: 'Jul 10', score: 78 },
  { date: 'Jul 20', score: 81 },
  { date: 'Today', score: 85 }
];

export const ResumeAnalyticsTab: React.FC<ResumeAnalyticsTabProps> = ({ analysis }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052ff]/15 text-[#b7c4ff] text-xs font-mono mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-[#4cd7f6]" /> Performance &amp; Score Intelligence
            </div>
            <h2 className="text-2xl font-bold font-geist text-white">
              Resume Intelligence Analytics
            </h2>
            <p className="text-xs text-[#c3c5d9] mt-0.5">
              Track ATS score progression, match trends, and AI suggestion conversion rates over time.
            </p>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">Total Score Gain</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-3xl font-bold font-geist text-green-400">+23 Pts</span>
          <p className="text-[10px] font-mono text-[#8d90a2] mt-1">From 62 to 85 since June</p>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">AI Fixes Accepted</span>
            <Sparkles className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <span className="text-3xl font-bold font-geist text-[#4cd7f6]">18 Suggestions</span>
          <p className="text-[10px] font-mono text-[#8d90a2] mt-1">92% acceptance rate</p>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">Total Downloads</span>
            <Download className="w-4 h-4 text-[#b7c4ff]" />
          </div>
          <span className="text-3xl font-bold font-geist text-white">14 Exports</span>
          <p className="text-[10px] font-mono text-[#8d90a2] mt-1">PDF &amp; DOCX formats</p>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">Matched Applications</span>
            <Briefcase className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-bold font-geist text-amber-400">12 Roles</span>
          <p className="text-[10px] font-mono text-[#8d90a2] mt-1">Avg 88% match rate</p>
        </div>
      </div>

      {/* Recharts Area Chart Card */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            ATS Score Trend Over Time
          </h3>
          <span className="text-xs font-mono text-[#b7c4ff]">Target Goal: 90+ PTS</span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTrendData}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0052ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0052ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#8d90a2" fontSize={12} tickLine={false} />
              <YAxis stroke="#8d90a2" fontSize={12} domain={[50, 100]} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#11131c', borderColor: '#434656', borderRadius: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="score" stroke="#4cd7f6" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
