import React, { useState } from 'react';
import { ChatMessage, UserProfile, NavigationTab } from '../types';
import { 
  Compass, 
  DollarSign, 
  BookOpen, 
  AlertTriangle, 
  Bot, 
  Sparkles, 
  Upload, 
  User, 
  Send, 
  Linkedin, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  Target,
  GraduationCap,
  TrendingUp,
  Award,
  Layers,
  Check
} from 'lucide-react';

interface CareerToolsViewProps {
  user: UserProfile;
  onNavigateTab?: (tab: NavigationTab) => void;
  onUploadResumeClick?: () => void;
}

export const CareerToolsView: React.FC<CareerToolsViewProps> = ({ 
  user, 
  onNavigateTab, 
  onUploadResumeClick 
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'salary' | 'learning' | 'skillgap' | 'copilot'>('roadmap');

  // Check if user has uploaded resume & completed profile data
  const hasResume = Boolean(
    (user.resumeVersions && user.resumeVersions.length > 0) ||
    (user.resumeText && user.resumeText.trim().length > 0) ||
    (user.atsScore || 0) > 0
  );

  const hasProfile = Boolean(
    user.name && 
    user.email && 
    user.title && 
    user.targetRole
  );

  const hasData = hasResume && hasProfile;

  // Copilot Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${user.name}! I am your HireFlow AI Career Strategist. I can help optimize your LinkedIn headline, craft salary negotiation counteroffers, or map learning paths for missing skills. What would you like to work on?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Tool Modals
  const [linkedInHeadline, setLinkedInHeadline] = useState('');
  const [salaryOffer, setSalaryOffer] = useState('');
  const [negotiationLetter, setNegotiationLetter] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputText,
          history: messages
        })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply || "Focus on quantifying your engineering outcomes and building distributed systems experience.",
          timestamp: 'Just now'
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I recommend highlighting your distributed systems and cloud architecture achievements on your profile.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleOptimizeLinkedIn = () => {
    setLinkedInHeadline(`Senior ${user.targetRole || 'Software Engineer'} | Cloud Architectures, Distributed Systems & AI Systems | Tech Lead`);
  };

  const handleGenerateNegotiation = () => {
    if (!salaryOffer) return;
    setNegotiationLetter(
      `Dear Hiring Manager,\n\nThank you so much for extending the offer for the ${user.targetRole || 'Software Engineer'} role at $${Number(salaryOffer).toLocaleString()}. Based on market compensation benchmarks for ${user.targetRole || 'Software Engineers'} in tier-1 tech markets and my experience leading high-throughput systems, I would love to explore aligning base compensation at $${(parseInt(salaryOffer) * 1.15).toLocaleString()} or including a performance equity grant.\n\nBest regards,\n${user.name}`
    );
  };

  // Generic Reusable Empty State Card
  const renderEmptyState = (title: string, icon: React.ElementType) => {
    const IconComponent = icon;
    return (
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-10 sm:p-14 text-center space-y-4 shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-[#0052ff]/10 border border-[#0052ff]/30 flex items-center justify-center mx-auto text-[#4cd7f6] shadow-inner">
          <IconComponent className="w-8 h-8" />
        </div>
        
        <div className="space-y-2 max-w-lg mx-auto">
          <h3 className="text-xl font-bold font-geist text-white">{title}</h3>
          <p className="text-base font-bold font-geist text-white pt-1">No data available.</p>
          <p className="text-xs sm:text-sm font-mono text-[#a1a3b8] leading-relaxed">
            Complete your profile and upload your resume to receive AI recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          {onUploadResumeClick && (
            <button
              onClick={onUploadResumeClick}
              className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload Resume
            </button>
          )}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('profile')}
              className="bg-[#11131c] hover:bg-[#434656]/30 text-[#e1e1ef] border border-[#434656]/40 text-xs font-mono font-bold px-5 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#4cd7f6]" /> Complete Profile
            </button>
          )}
        </div>
      </div>
    );
  };

  const navItems = [
    { id: 'roadmap', label: 'Career Roadmap', icon: Compass },
    { id: 'salary', label: 'Salary Insights', icon: DollarSign },
    { id: 'learning', label: 'Learning Progress', icon: BookOpen },
    { id: 'skillgap', label: 'Skill Gap', icon: AlertTriangle },
    { id: 'copilot', label: 'AI Copilot & Tools', icon: Bot },
  ] as const;

  return (
    <div className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#191b25] border border-[#434656]/30 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052ff]/15 text-[#4cd7f6] text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Career & Growth Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-geist text-white">AI Career Suite</h2>
          <p className="text-xs sm:text-sm text-[#a1a3b8] mt-1 font-mono">
            Personalized Career Roadmaps, Salary Market Intelligence, Skill Gap Analysis & AI Copilot.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 bg-[#11131c] border border-[#434656]/40 px-4 py-2 rounded-xl text-xs font-mono">
          <span className={`w-2.5 h-2.5 rounded-full ${hasData ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-white font-bold">{hasData ? 'Telemetry Active' : 'Setup Required'}</span>
        </div>
      </div>

      {/* 4 Core Summary Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Career Roadmap */}
        <div 
          onClick={() => setActiveTab('roadmap')}
          className={`bg-[#191b25] border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between shadow-xl ${
            activeTab === 'roadmap' 
              ? 'border-[#0052ff] ring-1 ring-[#0052ff]' 
              : 'border-[#434656]/30 hover:border-[#434656]'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Career Roadmap</span>
            <Compass className="w-5 h-5 text-[#4cd7f6]" />
          </div>
          {hasData ? (
            <div>
              <span className="text-sm font-bold text-white block">{user.targetRole || 'Target Goal Set'}</span>
              <span className="text-xs font-mono text-[#a1a3b8] mt-1 block">3-stage milestone path active</span>
            </div>
          ) : (
            <div>
              <span className="text-xs font-mono text-[#a1a3b8] block">No data available.</span>
              <span className="text-[10px] font-mono text-[#0052ff] mt-1 block hover:underline">Click to setup →</span>
            </div>
          )}
        </div>

        {/* Card 2: Salary Insights */}
        <div 
          onClick={() => setActiveTab('salary')}
          className={`bg-[#191b25] border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between shadow-xl ${
            activeTab === 'salary' 
              ? 'border-[#0052ff] ring-1 ring-[#0052ff]' 
              : 'border-[#434656]/30 hover:border-[#434656]'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Salary Insights</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          {hasData ? (
            <div>
              <span className="text-sm font-bold text-green-400 block">$150,000 - $220,000 / yr</span>
              <span className="text-xs font-mono text-[#a1a3b8] mt-1 block">Tier-1 Tech Market Benchmark</span>
            </div>
          ) : (
            <div>
              <span className="text-xs font-mono text-[#a1a3b8] block">No data available.</span>
              <span className="text-[10px] font-mono text-[#0052ff] mt-1 block hover:underline">Click to setup →</span>
            </div>
          )}
        </div>

        {/* Card 3: Learning Progress */}
        <div 
          onClick={() => setActiveTab('learning')}
          className={`bg-[#191b25] border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between shadow-xl ${
            activeTab === 'learning' 
              ? 'border-[#0052ff] ring-1 ring-[#0052ff]' 
              : 'border-[#434656]/30 hover:border-[#434656]'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Learning Progress</span>
            <BookOpen className="w-5 h-5 text-[#d0bcff]" />
          </div>
          {hasData ? (
            <div>
              <span className="text-sm font-bold text-[#d0bcff] block">3 Skill Modules Active</span>
              <span className="text-xs font-mono text-[#a1a3b8] mt-1 block">62% overall completion</span>
            </div>
          ) : (
            <div>
              <span className="text-xs font-mono text-[#a1a3b8] block">No data available.</span>
              <span className="text-[10px] font-mono text-[#0052ff] mt-1 block hover:underline">Click to setup →</span>
            </div>
          )}
        </div>

        {/* Card 4: Skill Gap */}
        <div 
          onClick={() => setActiveTab('skillgap')}
          className={`bg-[#191b25] border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between shadow-xl ${
            activeTab === 'skillgap' 
              ? 'border-[#0052ff] ring-1 ring-[#0052ff]' 
              : 'border-[#434656]/30 hover:border-[#434656]'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Skill Gap</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          {hasData ? (
            <div>
              <span className="text-sm font-bold text-amber-400 block">4 Skill Gaps Identified</span>
              <span className="text-xs font-mono text-[#a1a3b8] mt-1 block">High Impact: Docker, Kubernetes</span>
            </div>
          ) : (
            <div>
              <span className="text-xs font-mono text-[#a1a3b8] block">No data available.</span>
              <span className="text-[10px] font-mono text-[#0052ff] mt-1 block hover:underline">Click to setup →</span>
            </div>
          )}
        </div>

      </div>

      {/* Navigation Subtab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#434656]/30 pb-3">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#0052ff] text-white shadow-lg shadow-[#0052ff]/20'
                  : 'bg-[#191b25] text-[#a1a3b8] hover:text-white border border-[#434656]/30 hover:border-[#434656]'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN TAB CONTENT AREA */}
      <div>

        {/* TAB 1: CAREER ROADMAP */}
        {activeTab === 'roadmap' && (
          !hasData ? (
            renderEmptyState('Career Roadmap', Compass)
          ) : (
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#434656]/30">
                <div>
                  <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#4cd7f6]" /> AI Career Roadmap & Milestone Path
                  </h3>
                  <p className="text-xs font-mono text-[#a1a3b8] mt-1">
                    Target Role: <span className="text-white font-bold">{user.targetRole || 'Senior Software Engineer'}</span>
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#4cd7f6] bg-[#0052ff]/20 border border-[#0052ff]/30 px-3 py-1 rounded-full w-fit">
                  Estimated Timeline: 6-12 Months
                </span>
              </div>

              {/* 3-Stage Milestone Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* Stage 1 */}
                <div className="bg-[#11131c] border border-green-500/40 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-md border border-green-500/30">
                      Stage 1 • Current Level
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <h4 className="text-base font-bold font-geist text-white">Full Stack Developer</h4>
                  <p className="text-xs font-mono text-[#a1a3b8]">Verified Skills: React 19, TypeScript, Express, PostgreSQL, Node.js</p>
                  <div className="pt-2 border-t border-[#434656]/30 text-xs font-mono text-green-300">
                    ATS Score: {user.atsScore || 0}/100 • Benchmark Reached
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="bg-[#11131c] border border-[#0052ff]/50 rounded-2xl p-5 space-y-3 relative ring-2 ring-[#0052ff]/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#4cd7f6] bg-[#0052ff]/20 px-2.5 py-0.5 rounded-md border border-[#0052ff]/40">
                      Stage 2 • Target Objective
                    </span>
                    <Target className="w-4 h-4 text-[#0052ff]" />
                  </div>
                  <h4 className="text-base font-bold font-geist text-white">{user.targetRole || 'Senior Software Engineer'}</h4>
                  <p className="text-xs font-mono text-[#a1a3b8]">Focus Areas: System Architecture, Docker, Caching, Cloud Infra</p>
                  <div className="pt-2 border-t border-[#434656]/30 text-xs font-mono text-[#4cd7f6]">
                    88% Match Rate • Target Salary: $180,000 / yr
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="bg-[#11131c] border border-[#434656]/40 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#d0bcff] bg-[#571bc1]/20 px-2.5 py-0.5 rounded-md border border-[#571bc1]/40">
                      Stage 3 • Long-Term Horizon
                    </span>
                    <Award className="w-4 h-4 text-[#d0bcff]" />
                  </div>
                  <h4 className="text-base font-bold font-geist text-white">Staff Engineer / Tech Lead</h4>
                  <p className="text-xs font-mono text-[#a1a3b8]">Focus Areas: Team Mentorship, AI Agent Systems, Enterprise Scale</p>
                  <div className="pt-2 border-t border-[#434656]/30 text-xs font-mono text-[#d0bcff]">
                    Target Salary: $240,000+ / yr
                  </div>
                </div>

              </div>
            </div>
          )
        )}

        {/* TAB 2: SALARY INSIGHTS */}
        {activeTab === 'salary' && (
          !hasData ? (
            renderEmptyState('Salary Insights', DollarSign)
          ) : (
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#434656]/30">
                <div>
                  <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" /> Market Salary & Compensation Intelligence
                  </h3>
                  <p className="text-xs font-mono text-[#a1a3b8] mt-1">
                    Benchmark statistics for <span className="text-white font-bold">{user.targetRole || 'Senior Engineer'}</span> in Tier-1 Tech Markets.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full w-fit">
                  Live Market Data (2026)
                </span>
              </div>

              {/* Salary Range Percentiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#11131c] border border-[#434656]/30 p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-[#a1a3b8] uppercase">25th Percentile</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">$145,000 / yr</span>
                  <span className="text-[10px] font-mono text-[#a1a3b8]">Entry / Mid Tier</span>
                </div>
                <div className="bg-[#11131c] border border-[#0052ff]/40 p-4 rounded-xl ring-1 ring-[#0052ff]/20">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">50th Percentile (Median)</span>
                  <span className="text-xl font-bold font-mono text-[#4cd7f6] mt-1 block">$175,000 / yr</span>
                  <span className="text-[10px] font-mono text-[#4cd7f6]">Target Market Standard</span>
                </div>
                <div className="bg-[#11131c] border border-[#434656]/30 p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-[#a1a3b8] uppercase">75th Percentile</span>
                  <span className="text-xl font-bold font-mono text-green-400 mt-1 block">$205,000 / yr</span>
                  <span className="text-[10px] font-mono text-green-400">High Performers</span>
                </div>
                <div className="bg-[#11131c] border border-[#434656]/30 p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-[#a1a3b8] uppercase">90th Percentile</span>
                  <span className="text-xl font-bold font-mono text-[#d0bcff] mt-1 block">$240,000+ / yr</span>
                  <span className="text-[10px] font-mono text-[#d0bcff]">Tier-1 Big Tech / AI</span>
                </div>
              </div>

              {/* Counteroffer Assistant Section */}
              <div className="bg-[#11131c] border border-green-500/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" /> AI Salary Counteroffer Script Generator
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-mono text-[#a1a3b8]">Enter Current Offer Base Salary ($):</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        value={salaryOffer}
                        onChange={(e) => setSalaryOffer(e.target.value)}
                        placeholder="e.g. 165000"
                        className="flex-1 bg-[#191b25] border border-[#434656]/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#a1a3b8] focus:outline-none focus:border-green-500"
                      />
                      <button 
                        onClick={handleGenerateNegotiation}
                        disabled={!salaryOffer}
                        className="bg-green-500 hover:bg-green-400 text-black font-mono text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        Generate Script
                      </button>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-[#a1a3b8] flex items-center">
                    Generate professional counteroffer scripts backed by real market percentiles.
                  </div>
                </div>

                {negotiationLetter && (
                  <div className="bg-[#191b25] p-4 rounded-xl border border-green-500/40 text-xs font-mono text-white whitespace-pre-wrap leading-relaxed">
                    {negotiationLetter}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* TAB 3: LEARNING PROGRESS */}
        {activeTab === 'learning' && (
          !hasData ? (
            renderEmptyState('Learning Progress', BookOpen)
          ) : (
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#434656]/30">
                <div>
                  <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#d0bcff]" /> Skill Development & Learning Progress
                  </h3>
                  <p className="text-xs font-mono text-[#a1a3b8] mt-1">
                    Master key missing skills to unlock higher ATS match scores and interview calls.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#d0bcff] bg-[#571bc1]/20 border border-[#571bc1]/40 px-3 py-1 rounded-full w-fit">
                  3 Active Modules
                </span>
              </div>

              {/* Learning Progress List */}
              <div className="space-y-4">
                
                <div className="bg-[#11131c] border border-[#434656]/30 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0052ff]" />
                      <h4 className="text-sm font-bold font-geist text-white">Docker & Cloud Containerization</h4>
                    </div>
                    <span className="text-xs font-mono text-[#4cd7f6] font-bold">85% Completed</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#191b25] rounded-full overflow-hidden border border-[#434656]/20">
                    <div className="h-full bg-gradient-to-r from-[#0052ff] to-[#4cd7f6] w-[85%] rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-[#a1a3b8]">
                    <span>Estimated 3 hrs remaining</span>
                    <span className="text-green-400">+12% ATS Match Score Boost</span>
                  </div>
                </div>

                <div className="bg-[#11131c] border border-[#434656]/30 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#571bc1]" />
                      <h4 className="text-sm font-bold font-geist text-white">System Architecture & Caching Strategies</h4>
                    </div>
                    <span className="text-xs font-mono text-[#d0bcff] font-bold">60% Completed</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#191b25] rounded-full overflow-hidden border border-[#434656]/20">
                    <div className="h-full bg-gradient-to-r from-[#571bc1] to-[#d0bcff] w-[60%] rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-[#a1a3b8]">
                    <span>Estimated 6 hrs remaining</span>
                    <span className="text-green-400">+15% ATS Match Score Boost</span>
                  </div>
                </div>

                <div className="bg-[#11131c] border border-[#434656]/30 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <h4 className="text-sm font-bold font-geist text-white">GraphQL & API Federation</h4>
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-bold">40% Completed</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#191b25] rounded-full overflow-hidden border border-[#434656]/20">
                    <div className="h-full bg-amber-500 w-[40%] rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-[#a1a3b8]">
                    <span>Estimated 8 hrs remaining</span>
                    <span className="text-green-400">+8% ATS Match Score Boost</span>
                  </div>
                </div>

              </div>
            </div>
          )
        )}

        {/* TAB 4: SKILL GAP */}
        {activeTab === 'skillgap' && (
          !hasData ? (
            renderEmptyState('Skill Gap', AlertTriangle)
          ) : (
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#434656]/30">
                <div>
                  <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" /> Skill Gap Opportunities & Missing Competencies
                  </h3>
                  <p className="text-xs font-mono text-[#a1a3b8] mt-1">
                    Closing these skill gaps will boost your job recommendation match rate above 90%.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full w-fit">
                  4 Gaps Detected
                </span>
              </div>

              {/* Skill Gap Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-[#11131c] border border-amber-500/30 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold font-geist text-white">Docker & Cloud Containers</h4>
                    <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded">
                      High Impact
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#a1a3b8]">Required by 85% of target role job postings.</p>
                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => setActiveTab('learning')}
                      className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Start Learning Module <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#11131c] border border-amber-500/30 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold font-geist text-white">Terraform / Infrastructure as Code</h4>
                    <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded">
                      High Impact
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#a1a3b8]">Required by 72% of target role job postings.</p>
                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => setActiveTab('learning')}
                      className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Start Learning Module <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#11131c] border border-[#434656]/30 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold font-geist text-white">System Design Caching Strategies</h4>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                      Medium Impact
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#a1a3b8]">Required by 60% of target role job postings.</p>
                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => setActiveTab('learning')}
                      className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Start Learning Module <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#11131c] border border-[#434656]/30 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold font-geist text-white">GraphQL Federation & Microservices</h4>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                      Medium Impact
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#a1a3b8]">Required by 45% of target role job postings.</p>
                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => setActiveTab('learning')}
                      className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Start Learning Module <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )
        )}

        {/* TAB 5: AI COPILOT & TOOLS */}
        {activeTab === 'copilot' && (
          <div className="grid grid-cols-12 gap-8">
            {/* Chat Strategist (7 cols) */}
            <div className="col-span-12 lg:col-span-7 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col h-[600px] shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-[#434656]/30 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#571bc1]/20 border border-[#571bc1]/40 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#d0bcff]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-geist">HireFlow Career Strategist</h3>
                  <p className="text-xs font-mono text-[#4cd7f6]">Powered by Gemini 3.6 Flash</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-[#571bc1] flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className={`p-4 rounded-xl text-xs font-mono leading-relaxed max-w-lg ${
                      msg.sender === 'user'
                        ? 'bg-[#0052ff] text-white rounded-tr-none'
                        : 'bg-[#11131c] text-[#e1e1ef] border border-[#434656]/30 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex gap-2 items-center text-xs font-mono text-[#a1a3b8]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4cd7f6]" /> AI is thinking...
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-3 border-t border-[#434656]/20">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask anything about job search strategy, salary benchmarks, resume tips..."
                  className="flex-1 bg-[#11131c] border border-[#434656]/40 rounded-xl px-4 py-2.5 text-xs text-[#e1e1ef] focus:outline-none focus:border-[#0052ff]"
                />
                <button 
                  type="submit"
                  className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-5 rounded-xl text-xs font-mono font-bold flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Specialized Widgets (5 cols) */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
              {/* LinkedIn Optimizer */}
              <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-[#0077b5]">
                  <Linkedin className="w-5 h-5 fill-current" />
                  <h3 className="text-base font-bold text-white font-geist">LinkedIn Headline Generator</h3>
                </div>
                <p className="text-xs text-[#a1a3b8]">Generate high-visibility keywords for recruiter search indexing.</p>

                {linkedInHeadline && (
                  <div className="bg-[#11131c] p-3 rounded-lg border border-[#0077b5]/40 text-xs font-mono text-[#e1e1ef]">
                    {linkedInHeadline}
                  </div>
                )}

                <button 
                  onClick={handleOptimizeLinkedIn}
                  className="w-full bg-[#0077b5]/20 hover:bg-[#0077b5]/30 text-[#70b5f9] border border-[#0077b5]/40 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Generate Headline
                </button>
              </div>

              {/* Salary Negotiation Assistant */}
              <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-green-400">
                  <DollarSign className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white font-geist">Salary Counteroffer Coach</h3>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#a1a3b8]">Enter Base Salary Offer ($):</label>
                  <input 
                    type="number" 
                    value={salaryOffer} 
                    onChange={(e) => setSalaryOffer(e.target.value)}
                    placeholder="e.g. 180000"
                    className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-green-500"
                  />
                </div>

                <button 
                  onClick={handleGenerateNegotiation}
                  disabled={!salaryOffer}
                  className="w-full bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-700/40 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  Generate Counteroffer Script
                </button>

                {negotiationLetter && (
                  <div className="bg-[#11131c] p-3 rounded-lg border border-green-800/40 text-xs font-mono text-[#e1e1ef] whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto">
                    {negotiationLetter}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
