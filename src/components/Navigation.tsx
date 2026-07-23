import React, { useState } from 'react';
import { NavigationTab, UserProfile, NotificationItem } from '../types';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Video, 
  BrainCircuit, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Search, 
  Bell, 
  History, 
  User, 
  Upload, 
  ShieldCheck,
  Calendar as CalendarIcon
} from 'lucide-react';

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  user: UserProfile;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onAnalyzeResumeClick: () => void;
}

export const SideNavBar: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  user,
  onAnalyzeResumeClick
}) => {
  return (
    <nav className="bg-[#050505] border-r border-white/10 fixed left-0 top-0 h-full w-64 flex flex-col p-4 gap-2 z-50 transition-all">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-4 px-2 pt-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0052ff] to-[#571bc1] flex items-center justify-center font-bold text-white shadow-md">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-geist">HireFlow AI</h1>
          <p className="text-xs font-mono text-white/40">{user.tier}</p>
        </div>
      </div>

      {/* Primary CTA */}
      <button 
        onClick={onAnalyzeResumeClick}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 px-4 rounded-xl mb-4 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
      >
        <Upload className="w-4 h-4" />
        Analyze Resume
      </button>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'dashboard'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('resume-suite')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'resume-suite'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume Suite</span>
        </button>

        <button
          onClick={() => onSelectTab('job-suite')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'job-suite'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Suite</span>
        </button>

        <button
          onClick={() => onSelectTab('interviews')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'interviews'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Interviews</span>
        </button>

        <button
          onClick={() => onSelectTab('career-tools')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'career-tools'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Career Tools</span>
        </button>

        <button
          onClick={() => onSelectTab('calendar')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'calendar'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => onSelectTab('admin')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all mt-1 ${
            currentTab === 'admin'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
              : 'text-white/40 hover:bg-white/5 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-[#434656]/30 flex flex-col gap-1">
        <button
          onClick={() => alert("Support: Live chat agent is active or email support@hireflow.ai")}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#c3c5d9] hover:bg-[#32343f]/50 hover:text-white transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </button>

        <button
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#c3c5d9] hover:bg-[#32343f]/50 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export const TopNavBar: React.FC<NavigationProps> = ({
  user,
  notifications,
  onOpenNotifications,
  onSelectTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-[#050505]/90 backdrop-blur-xl sticky top-0 z-40 border-b border-white/10 flex justify-between items-center h-16 px-6 shrink-0 ml-64">
      {/* Search Input */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jobs, skills, applications..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-white/30 font-sans transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onOpenNotifications}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors relative cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </button>

        <button 
          onClick={() => onSelectTab('dashboard')}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title="Activity History"
        >
          <History className="w-5 h-5" />
        </button>

        <button 
          onClick={() => onSelectTab('settings')}
          className="ml-2 flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-blue-500 transition-colors cursor-pointer"
          title="Profile & Settings"
        >
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-8 h-8 rounded-full object-cover border border-white/10"
          />
        </button>
      </div>
    </header>
  );
};
