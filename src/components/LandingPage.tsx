import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { ShaderCanvas } from './ShaderCanvas';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck, 
  Target, 
  Video, 
  Zap, 
  ShieldCheck, 
  Layers, 
  BookOpen,
  Building2,
  TrendingUp,
  UserCheck
} from 'lucide-react';

interface LandingPageProps {
  onStartForFree: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartForFree, onNavigate }) => {
  return (
    <div className="bg-[#050505] text-[#F9FAFB] font-sans antialiased min-h-screen flex flex-col relative overflow-x-hidden select-none">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-4 h-4 bg-white rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight font-geist text-white">HireFlow AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Platform</a>
          <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#resources" className="hover:text-white transition-colors">Resources</a>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('login')}
            className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white cursor-pointer transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigate('login')}
            className="px-5 py-2 text-sm font-semibold bg-white text-black rounded-full hover:bg-white/90 transition-all shadow-lg shadow-white/5 cursor-pointer active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col md:flex-row px-6 md:px-10 py-16 gap-10 max-w-[1280px] mx-auto w-full items-center">
        {/* Animated Shader WebGL Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <ShaderCanvas className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/20 via-[#050505]/70 to-[#050505]" />
        </div>

        {/* Left Column: Copy */}
        <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-[10px] uppercase tracking-widest font-semibold text-blue-400">New: AI Interview Coach 2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-[0.95] mb-6 font-geist">
            Master your <br />
            <span className="text-blue-500 italic font-serif">Career Flow.</span>
          </h1>

          <p className="text-lg text-white/50 leading-relaxed max-w-md mb-10 font-light">
            The all-in-one AI platform to optimize your resume, beat ATS filters, and land interviews with confidence. Built for modern high-growth tech talent.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => onNavigate('login')}
              className="px-8 py-4 bg-blue-600 rounded-xl font-semibold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              Upload Resume — Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 pl-2">
              <div className="flex -space-x-3">
                <div className="w-9 h-9 rounded-full border-2 border-[#050505] bg-gray-600 flex items-center justify-center text-xs text-white font-bold">JD</div>
                <div className="w-9 h-9 rounded-full border-2 border-[#050505] bg-gray-500 flex items-center justify-center text-xs text-white font-bold">AK</div>
                <div className="w-9 h-9 rounded-full border-2 border-[#050505] bg-gray-400 flex items-center justify-center text-xs text-white font-bold">SR</div>
                <div className="w-9 h-9 rounded-full border-2 border-[#050505] bg-blue-600 flex items-center justify-center text-[10px] font-bold italic text-white">+2k</div>
              </div>
              <span className="text-xs text-white/40 font-mono">candidates placed</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Mockup Widgets */}
        <div className="w-full md:w-1/2 relative min-h-[420px] flex items-center justify-center z-10">
          <div className="w-full max-w-[380px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl z-20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Live ATS Scoring</p>
                <h3 className="text-xl font-medium mt-1 text-white">Software Engineer III</h3>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 flex items-center justify-center bg-blue-500/10">
                <span className="text-blue-400 font-bold text-sm">94%</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-sm text-white/70">Keywords Matched</span>
                <span className="text-sm font-mono text-green-400 font-bold">18/20</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between mb-2">
                  <span className="text-white/70 uppercase text-[9px] tracking-widest font-bold">Skill Gaps Detected</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-tight border border-red-500/30">Terraform</span>
                  <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-tight border border-red-500/30">Kubernetes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-white/10 bg-[#0A0A0A]">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-center text-[10px] font-mono text-white/30 mb-6 uppercase tracking-widest font-bold">
            Trusted by tech talent hired at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-50">
            <span className="text-xl font-bold font-geist text-white tracking-tight">Google</span>
            <span className="text-xl font-bold font-geist text-white tracking-tight">Apple</span>
            <span className="text-xl font-bold font-geist text-white tracking-tight">OpenAI</span>
            <span className="text-xl font-bold font-geist text-white tracking-tight">Meta</span>
            <span className="text-xl font-bold font-geist text-white tracking-tight">Stripe</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-24 px-6 md:px-10 max-w-[1280px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-2">Platform Capabilities</p>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight font-geist text-white mb-4">
            Engineered for Career Advancement
          </h2>
          <p className="text-white/50 text-base">
            Replace fragmented career tools with a single, unified AI platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-blue-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-105 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2 font-geist">ATS Resume Parsing</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Instant conversion to ATS-ready format with line-by-line AI recommendations and 1-click bullet rewriter.
            </p>
            <ul className="space-y-2 text-xs font-mono text-white/60">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Keyword optimization engine</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Impact & quantification scanner</li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-105 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2 font-geist">Smart Job Matching</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Match percentage analysis against target Job Descriptions with custom cover letter generation.
            </p>
            <ul className="space-y-2 text-xs font-mono text-white/60">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Skill gap detector</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Custom tone cover letters</li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-sky-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-105 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2 font-geist">AI Interview Prep</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Simulated technical & behavioral prep with Gemini AI live feedback and STAR framework scoring.
            </p>
            <ul className="space-y-2 text-xs font-mono text-white/60">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Technical & STAR framework</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Real-time Gemini evaluation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 px-6 md:px-10 border-t border-white/10 bg-[#08080a]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-2">Target Solutions</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight font-geist text-white mb-4">
              Tailored for Every Stage of Career Transition
            </h2>
            <p className="text-white/50 text-base">
              Whether you are an experienced lead, a career switcher, or a new grad, HireFlow AI adapts to your target.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
              <Building2 className="w-8 h-8 text-blue-400" />
              <h3 className="text-xl font-bold font-geist text-white">Senior & Principal Tech Talent</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Highlight high-scale distributed systems architecture, team mentorship metrics, and p99 performance optimization.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <h3 className="text-xl font-bold font-geist text-white">Career Pivoters & Switchers</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Translate non-traditional industry experience into relevant engineering domain keywords that pass machine ATS filters.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
              <UserCheck className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-bold font-geist text-white">New Graduates & Early Career</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Format open-source contributions, hackathons, and capstone engineering projects into high-impact bullet points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-10 border-t border-white/10 bg-[#050505]">
        <div className="max-w-[1280px] mx-auto text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-2">Transparent Pricing</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight font-geist text-white mb-4">
              Start Free, Upgrade when Ready
            </h2>
            <p className="text-white/50 text-base">No credit card required to analyze your first resume.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 font-geist">Free Plan</h3>
                <p className="text-xs text-white/50 mb-6">Essential tools for job seekers.</p>
                <span className="text-4xl font-bold text-white font-geist">$0</span>
                <ul className="mt-6 space-y-3 text-xs text-white/70">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> 3 ATS Resume Audits</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Basic Keyword Missing Alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> 10 Kanban Tracker Slots</li>
                </ul>
              </div>
              <button 
                onClick={() => onNavigate('login')}
                className="w-full mt-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold cursor-pointer"
              >
                Log In Free
              </button>
            </div>

            <div className="bg-white/5 border border-blue-500 rounded-3xl p-8 flex flex-col justify-between relative ai-gradient-border">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase">Most Popular</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 font-geist">Gold Tier</h3>
                <p className="text-xs text-white/50 mb-6">For active job seekers looking for speed.</p>
                <span className="text-4xl font-bold text-white font-geist">$19 <span className="text-xs text-white/50 font-normal">/mo</span></span>
                <ul className="mt-6 space-y-3 text-xs text-white/70">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Unlimited Resume Audits</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> 1-Click Bullet AI Rewriter</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> AI Cover Letter Studio</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> 20 AI Mock Interviews / mo</li>
                </ul>
              </div>
              <button 
                onClick={() => onNavigate('login')}
                className="w-full mt-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold cursor-pointer shadow-lg shadow-blue-500/20"
              >
                Get Gold Access
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 font-geist">Premium Plan</h3>
                <p className="text-xs text-white/50 mb-6">Complete career acceleration suite.</p>
                <span className="text-4xl font-bold text-white font-geist">$39 <span className="text-xs text-white/50 font-normal">/mo</span></span>
                <ul className="mt-6 space-y-3 text-xs text-white/70">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Everything in Gold Tier</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Unlimited AI Mock Interviews</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> LinkedIn Headline & Strategy</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Salary Counteroffer Coach</li>
                </ul>
              </div>
              <button 
                onClick={() => onNavigate('login')}
                className="w-full mt-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold cursor-pointer"
              >
                Start Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-20 px-6 md:px-10 border-t border-white/10 bg-[#08080a]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[10px] uppercase tracking-widest text-sky-400 font-bold mb-2">Knowledge Base</p>
            <h2 className="text-3xl font-light font-geist text-white">Career Engineering Resources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white/70">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <h4 className="font-bold text-white text-sm font-geist">2026 ATS Algorithm Guide</h4>
              <p>Learn how modern Applicant Tracking Systems parse complex PDF layouts and tables.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h4 className="font-bold text-white text-sm font-geist">STAR Framework Cheatsheet</h4>
              <p>Master behavioral interview questions at Tier-1 tech companies with metrics-focused answers.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <BookOpen className="w-5 h-5 text-green-400" />
              <h4 className="font-bold text-white text-sm font-geist">Tech Salary Benchmarks</h4>
              <p>Compare total compensation packages for Software, Product, and Design roles across regions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Footer Grid */}
      <footer className="grid grid-cols-1 md:grid-cols-4 border-t border-white/10 bg-[#050505]">
        <div className="p-8 border-b md:border-b-0 md:border-r border-white/10">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">Feature 01</p>
          <h5 className="font-medium text-white mb-1">Resume Parsing</h5>
          <p className="text-white/40 text-xs">Instant conversion to ATS-ready data.</p>
        </div>
        <div className="p-8 border-b md:border-b-0 md:border-r border-white/10">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">Feature 02</p>
          <h5 className="font-medium text-white mb-1">Smart Matching</h5>
          <p className="text-white/40 text-xs">Score your profile against JD real-time.</p>
        </div>
        <div className="p-8 border-b md:border-b-0 md:border-r border-white/10">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">Feature 03</p>
          <h5 className="font-medium text-white mb-1">Interview AI</h5>
          <p className="text-white/40 text-xs">Simulated technical prep with Gemini.</p>
        </div>
        <div 
          onClick={() => onNavigate('login')}
          className="p-8 bg-blue-600 hover:bg-blue-500 transition-colors flex flex-col justify-center cursor-pointer"
        >
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Available Today</p>
          <p className="text-white text-lg font-bold flex items-center justify-between">
            Claim Free Access
            <ArrowRight className="w-5 h-5" />
          </p>
        </div>
      </footer>
    </div>
  );
};
