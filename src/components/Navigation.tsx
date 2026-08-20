import React, { useState, useEffect } from 'react';
import { NavigationTab, UserProfile, NotificationItem } from '../types';
import { UserAvatar } from '../utils/userUtils';
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
  Calendar as CalendarIcon,
  CreditCard,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  user: UserProfile;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onAnalyzeResumeClick: () => void;
  onLogout?: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const SideNavBar: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  user,
  onAnalyzeResumeClick,
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const navContent = (
    <div className="h-full flex flex-col p-4 gap-2 bg-[#050505] border-r border-white/10 w-64 text-[#e1e1ef]">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-4 px-2 pt-2">
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0052ff] to-[#571bc1] flex items-center justify-center font-bold text-white shadow-md shrink-0">
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

        {/* Mobile close button */}
        {setIsMobileMenuOpen && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary CTA */}
      <button 
        onClick={() => {
          onAnalyzeResumeClick();
          if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
        }}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 px-4 rounded-xl mb-4 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
      >
        <Upload className="w-4 h-4" />
        Analyze Resume
      </button>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-blue-400" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleNavClick('resume-suite')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            currentTab === 'resume-suite'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Resume Suite</span>
        </button>

        <button
          onClick={() => handleNavClick('job-suite')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            currentTab === 'job-suite'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4 text-sky-400" />
          <span>Job Suite</span>
        </button>

        <button
          onClick={() => handleNavClick('interviews')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            currentTab === 'interviews'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4 text-amber-400" />
          <span>Interviews</span>
        </button>

        <button
          onClick={() => handleNavClick('career-tools')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            currentTab === 'career-tools'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span>Career Tools</span>
        </button>

        <button
          onClick={() => handleNavClick('calendar')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            currentTab === 'calendar'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-green-400" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => handleNavClick('profile')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            currentTab === 'profile'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 text-teal-400" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => handleNavClick('billing')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            currentTab === 'billing'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 text-pink-400" />
          <span>Billing & Plans</span>
        </button>

        <button
          onClick={() => handleNavClick('settings')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-gray-400" />
          <span>Settings</span>
        </button>

        {(user?.role === 'admin' || user?.role === 'Super Admin') && (
          <button
            onClick={() => handleNavClick('admin')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer mt-1 ${
              currentTab === 'admin'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                : 'text-white/40 hover:bg-white/5 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Admin Portal</span>
          </button>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-white/10 flex flex-col gap-1">
        <button
          onClick={() => handleNavClick('support')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
            currentTab === 'support'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Support</span>
        </button>

        <button
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              handleNavClick('landing');
            }
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 z-30 shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer Slide-Over */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer Menu */}
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export const TopNavBar: React.FC<NavigationProps> = ({
  user,
  notifications,
  onOpenNotifications,
  onSelectTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-[#050505]/90 backdrop-blur-xl sticky top-0 z-20 border-b border-white/10 flex justify-between items-center h-16 px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger Button */}
        {setIsMobileMenuOpen && (
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Input - Clicking opens Global Search Modal */}
        <div 
          onClick={() => {
            if ((window as any).__openGlobalSearch) {
              (window as any).__openGlobalSearch();
            }
          }}
          className="flex-1 relative cursor-pointer"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search jobs, skills, companies, roadmaps... (Cmd+K)"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-10 pr-4 text-xs md:text-sm text-white focus:outline-none focus:border-blue-500 placeholder-white/30 font-sans transition-colors cursor-pointer"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Daily Briefing CTA */}
        <button
          onClick={() => {
            if ((window as any).__openDailyBriefing) {
              (window as any).__openDailyBriefing();
            }
          }}
          className="hidden sm:flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer"
          title="Daily AI Briefing"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Daily Briefing</span>
        </button>

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
          onClick={() => onSelectTab('profile')}
          className="ml-2 flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-blue-500 transition-colors cursor-pointer"
          title="Profile & Settings"
        >
          <UserAvatar user={user} size="sm" />
        </button>
      </div>
    </header>
  );
};
