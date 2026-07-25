import React from 'react';
import { 
  Users, 
  DollarSign, 
  Activity, 
  Sparkles, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  Cpu, 
  Clock, 
  ShieldCheck,
  Zap,
  Layers,
  Award
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
import { AdminUser, SubscriptionPlanAdmin, PaymentTransactionAdmin, AiTelemetryData } from '../../types/admin';

interface AdminDashboardOverviewProps {
  users: AdminUser[];
  plans: SubscriptionPlanAdmin[];
  transactions: PaymentTransactionAdmin[];
  telemetry: AiTelemetryData;
  onNavigateSubTab: (subTab: string) => void;
}

const revenueData = [
  { month: 'Feb', mrr: 14200, users: 16200 },
  { month: 'Mar', mrr: 18400, users: 19100 },
  { month: 'Apr', mrr: 22100, users: 21800 },
  { month: 'May', mrr: 27900, users: 24300 },
  { month: 'Jun', mrr: 33500, users: 26500 },
  { month: 'Jul', mrr: 41800, users: 28450 },
];

const featureUsageData = [
  { name: 'Resume Suite', usage: 42, color: '#0052ff' },
  { name: 'Job Hub Matcher', usage: 28, color: '#4cd7f6' },
  { name: 'Interview Simulator', usage: 18, color: '#f59e0b' },
  { name: 'Career Tools', usage: 12, color: '#10b981' },
];

const aiLatencyData = [
  { time: '00:00', latency: 290, throughput: 420 },
  { time: '04:00', latency: 260, throughput: 280 },
  { time: '08:00', latency: 310, throughput: 890 },
  { time: '12:00', latency: 340, throughput: 1420 },
  { time: '16:00', latency: 280, throughput: 1680 },
  { time: '20:00', latency: 270, throughput: 1100 },
];

export const AdminDashboardOverview: React.FC<Partial<AdminDashboardOverviewProps>> = ({
  users = [],
  plans = [],
  transactions = [],
  telemetry = {
    totalRequestsToday: 14890,
    tokensUsedToday: 8940000,
    avgResponseTimeMs: 284,
    activeModel: 'Gemini 1.5 Pro',
    costEstimateTodayUSD: 14.82,
    errorRatePercent: 0.15,
    successRatePercent: 99.85,
    rateLimitHitsToday: 12
  },
  onNavigateSubTab = () => {}
}) => {
  const totalRevenue = (transactions || []).reduce((acc, tx) => acc + (tx.status === 'Succeeded' ? tx.amount : 0), 0) + 41800;
  const activeSubscribers = (plans || []).reduce((acc, p) => acc + (p.subscriberCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users & MRR */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 relative overflow-hidden group hover:border-[#0052ff]/50 transition-all shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Total Registered Candidates</span>
              <h3 className="text-3xl font-bold font-geist text-white mt-1">28,450</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0052ff]/10 border border-[#0052ff]/30 flex items-center justify-center text-[#0052ff]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="flex items-center gap-1 font-semibold"><TrendingUp className="w-3.5 h-3.5" /> +14.2%</span>
            <span className="text-[#8d90a2]">vs last month</span>
          </div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Monthly Recurring Revenue</span>
              <h3 className="text-3xl font-bold font-geist text-white mt-1">$41,800</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="flex items-center gap-1 font-semibold"><TrendingUp className="w-3.5 h-3.5" /> +24.8%</span>
            <span className="text-[#8d90a2]">ARR: $501,600</span>
          </div>
        </div>

        {/* AI Telemetry & Requests */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 relative overflow-hidden group hover:border-[#4cd7f6]/50 transition-all shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">AI Requests Today</span>
              <h3 className="text-3xl font-bold font-geist text-white mt-1">{(telemetry?.totalRequestsToday ?? 14890).toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 flex items-center justify-center text-[#4cd7f6]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#4cd7f6]">p99 Latency: {telemetry?.avgResponseTimeMs ?? 284}ms</span>
            <span className="text-emerald-400 font-semibold">{telemetry?.successRatePercent ?? 99.85}% Ok</span>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Active Subscribers</span>
              <h3 className="text-3xl font-bold font-geist text-white mt-1">{activeSubscribers.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-purple-300">Pro: 12.8k</span>
            <span className="text-amber-400">Trial: 4.2k</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & User Growth Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col justify-between shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div>
              <h3 className="text-lg font-bold font-geist text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0052ff]" /> Revenue & Candidate Growth Cohort
              </h3>
              <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">Monthly Recurring Revenue (MRR) vs Active Registered User Base</p>
            </div>
            <button 
              onClick={() => onNavigateSubTab('analytics')}
              className="px-3 py-1.5 bg-[#0c0e17] hover:bg-white/10 text-xs font-mono text-[#c3c5d9] hover:text-white rounded-lg border border-[#434656]/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Deep BI Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0052ff" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b2e3e" />
                <XAxis dataKey="month" stroke="#8d90a2" fontSize={11} tickLine={false} />
                <YAxis stroke="#8d90a2" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c0e17', borderColor: '#434656', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [name === 'mrr' ? `$${val}` : val, name === 'mrr' ? 'MRR' : 'Registered Users']}
                />
                <Area type="monotone" dataKey="mrr" stroke="#0052ff" strokeWidth={3} fillOpacity={1} fill="url(#mrrGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Module Usage Breakdown Pie */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <h3 className="text-lg font-bold font-geist text-white flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-[#4cd7f6]" /> Module Engagement
            </h3>
            <p className="text-xs text-[#c3c5d9] font-mono mb-4">Distribution of candidate AI activity</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={featureUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="usage"
                  >
                    {featureUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c0e17', borderColor: '#434656', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`${val}%`, 'Usage Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#434656]/20">
            {featureUsageData.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                <span className="text-[#c3c5d9] truncate">{f.name}</span>
                <span className="text-white font-bold ml-auto">{f.usage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Telemetry & Quick Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gemini Telemetry Throughput */}
        <div className="lg:col-span-2 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#4cd7f6]" /> Gemini 3.6 Processing Latency & Throughput
              </h3>
              <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">Real-time requests/min & latency curve (ms)</p>
            </div>
            <button 
              onClick={() => onNavigateSubTab('ai-telemetry')}
              className="text-xs font-mono text-[#4cd7f6] hover:underline cursor-pointer"
            >
              Manage AI Model & Key →
            </button>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiLatencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b2e3e" />
                <XAxis dataKey="time" stroke="#8d90a2" fontSize={11} />
                <YAxis stroke="#8d90a2" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c0e17', borderColor: '#434656', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="throughput" fill="#0052ff" radius={[4, 4, 0, 0]} name="Requests / Min" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Quick Links */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-geist text-white flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-400" /> Executive Quick Actions
            </h3>
            <p className="text-xs text-[#c3c5d9] font-mono mb-4">Instant admin controls for HireFlow AI</p>

            <div className="space-y-2">
              <button 
                onClick={() => onNavigateSubTab('users')}
                className="w-full bg-[#0c0e17] hover:bg-[#0052ff]/10 border border-[#434656]/30 hover:border-[#0052ff]/50 p-2.5 rounded-xl text-xs font-medium text-left text-[#e1e1ef] hover:text-white transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0052ff]" /> Manage User Accounts & Plans
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8d90a2]" />
              </button>

              <button 
                onClick={() => onNavigateSubTab('subscriptions')}
                className="w-full bg-[#0c0e17] hover:bg-emerald-500/10 border border-[#434656]/30 hover:border-emerald-500/50 p-2.5 rounded-xl text-xs font-medium text-left text-[#e1e1ef] hover:text-white transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Pricing Tiers & Feature Flags
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8d90a2]" />
              </button>

              <button 
                onClick={() => onNavigateSubTab('support')}
                className="w-full bg-[#0c0e17] hover:bg-purple-500/10 border border-[#434656]/30 hover:border-purple-500/50 p-2.5 rounded-xl text-xs font-medium text-left text-[#e1e1ef] hover:text-white transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" /> Open Candidate Support Tickets
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8d90a2]" />
              </button>

              <button 
                onClick={() => onNavigateSubTab('announcements')}
                className="w-full bg-[#0c0e17] hover:bg-amber-500/10 border border-[#434656]/30 hover:border-amber-500/50 p-2.5 rounded-xl text-xs font-medium text-left text-[#e1e1ef] hover:text-white transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Broadcast System Alert Banner
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8d90a2]" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#434656]/20 flex items-center justify-between text-xs font-mono text-[#8d90a2]">
            <span>Build 2026.07.25-PROD</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> All Systems Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
