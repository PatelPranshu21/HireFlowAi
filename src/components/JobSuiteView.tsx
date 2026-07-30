import React, { useState, useMemo } from 'react';
import { ApplicationCard, JobRecommendation, UserProfile, NotificationItem, JobPreferences, CompanyInfo } from '../types';
import { mockJobsList, mockCompanies, calculateDynamicMatchScore } from '../data/jobProvider';
import { CompanyModal } from './CompanyModal';
import { WhyMatchModal } from './WhyMatchModal';
import { JobDetailsModal } from './JobDetailsModal';
import { CompareJobsModal } from './CompareJobsModal';
import { PreferencesView } from './PreferencesView';
import { JobAnalyticsView } from './JobAnalyticsView';
import { ResumeUploadParserModal } from './resume/ResumeUploadParserModal';

import { 
  Sparkles, 
  Search, 
  Filter, 
  Bookmark, 
  Send, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  ExternalLink, 
  X, 
  Share2, 
  FileText, 
  MessageSquare, 
  Columns, 
  List as ListIcon, 
  SlidersHorizontal, 
  TrendingUp, 
  UserCheck, 
  Check, 
  AlertCircle,
  RefreshCw,
  Star,
  Heart,
  BarChart2,
  Settings,
  Upload
} from 'lucide-react';

interface JobSuiteViewProps {
  applications: ApplicationCard[];
  onUpdateStatus: (id: string, newStatus: ApplicationCard['status']) => void;
  onAddApplication: (app: Omit<ApplicationCard, 'id'>) => void;
  resumeText: string;
  user?: UserProfile;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  onNavigateTab?: (tab: any) => void;
  onUploadResume?: (fileText: string, fileName: string) => void;
  notifications?: NotificationItem[];
  onAddNotification?: (notif: NotificationItem) => void;
}

export const JobSuiteView: React.FC<JobSuiteViewProps> = ({
  applications,
  onUpdateStatus,
  onAddApplication,
  resumeText,
  user,
  onUpdateUser,
  onNavigateTab,
  onUploadResume,
  onAddNotification
}) => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'recommended' | 'saved' | 'tracker' | 'analytics' | 'preferences'>('recommended');
  
  // Tracker View Mode
  const [trackerMode, setTrackerMode] = useState<'kanban' | 'list'>('kanban');

  // Modal State for Resume Upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Check if a resume exists and has been analyzed
  const hasResume = useMemo(() => {
    return !!(
      (resumeText && resumeText.trim().length > 0) ||
      (user?.resumeText && user.resumeText.trim().length > 0) ||
      (user?.resumeVersions && user.resumeVersions.length > 0)
    );
  }, [resumeText, user]);

  // Search & Global Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [remoteFilter, setRemoteFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Saved Jobs State
  const [savedJobIds, setSavedJobIds] = useState<string[]>(user?.savedJobIds || []);

  // Hidden Jobs State
  const [hiddenJobIds, setHiddenJobIds] = useState<string[]>(user?.hiddenJobIds || []);

  // Job Comparison State
  const [comparedJobIds, setComparedJobIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Job Notes State (jobId -> string)
  const [jobNotes, setJobNotes] = useState<Record<string, string>>({});

  // Modal States
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobRecommendation | null>(null);
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<CompanyInfo | null>(null);
  const [selectedWhyMatchModal, setSelectedWhyMatchModal] = useState<JobRecommendation | null>(null);
  const [showAddApplicationModal, setShowAddApplicationModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<ApplicationCard | null>(null);

  // Form State for Manual Application Addition/Edit
  const [appRole, setAppRole] = useState('');
  const [appCompany, setAppCompany] = useState('');
  const [appStatus, setAppStatus] = useState<ApplicationCard['status']>('applied');
  const [appLocation, setAppLocation] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [appNotes, setAppNotes] = useState('');
  const [appRecruiter, setAppRecruiter] = useState('');
  const [appSalary, setAppSalary] = useState('');

  // Toast Notification Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // User Profile Defaulting
  const activeUser: UserProfile = user || {
    id: 'usr_123',
    name: 'Pranshu',
    email: 'pranshu@hireflow.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    title: 'Senior Software Engineer',
    experienceLevel: 'Senior Level (6+ yrs)',
    tier: '3-Day Free Trial',
    subscriptionPlan: '3-Day Free Trial',
    subscriptionStatus: 'trialing',
    atsScore: 0,
    targetRole: 'Software Engineering'
  };

  // Master Jobs List calculated with dynamic user preferences
  const allJobs: JobRecommendation[] = useMemo(() => {
    return mockJobsList.map(job => {
      const match = calculateDynamicMatchScore(job, activeUser);
      return {
        ...job,
        matchScore: match.score,
        matchConfidence: match.confidence,
        recommendationReason: match.reason
      };
    });
  }, [activeUser]);

  // Saved Jobs List
  const savedJobs = useMemo(() => {
    return allJobs.filter(j => savedJobIds.includes(j.id));
  }, [allJobs, savedJobIds]);

  // Filtered Recommended Jobs
  const filteredRecommendedJobs = useMemo(() => {
    return allJobs.filter(job => {
      if (hiddenJobIds.includes(job.id)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCompany = job.company.toLowerCase().includes(q);
        const matchLoc = job.location.toLowerCase().includes(q);
        const matchTags = job.tags.some(t => t.toLowerCase().includes(q));
        const matchSkills = job.requiredSkills?.some(s => s.toLowerCase().includes(q));
        if (!matchTitle && !matchCompany && !matchLoc && !matchTags && !matchSkills) return false;
      }

      if (experienceFilter !== 'all') {
        if (!job.experienceRequired?.toLowerCase().includes(experienceFilter.toLowerCase())) return false;
      }

      if (remoteFilter !== 'all') {
        if (!job.location.toLowerCase().includes(remoteFilter.toLowerCase())) return false;
      }

      if (jobTypeFilter !== 'all') {
        if (job.jobType && job.jobType.toLowerCase() !== jobTypeFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [allJobs, hiddenJobIds, searchQuery, experienceFilter, remoteFilter, jobTypeFilter]);

  // Handlers
  const handleToggleSaveJob = (job: JobRecommendation) => {
    if (savedJobIds.includes(job.id)) {
      setSavedJobIds(prev => prev.filter(id => id !== job.id));
      showToast(`Removed "${job.title}" from Saved Jobs.`);
    } else {
      setSavedJobIds(prev => [...prev, job.id]);
      showToast(`Saved "${job.title}" to Saved Jobs! ❤️`);
    }
  };

  const handleHideJob = (jobId: string) => {
    setHiddenJobIds(prev => [...prev, jobId]);
    showToast('Recommendation hidden. AI will adjust future recommendations.');
  };

  const handleToggleCompareJob = (jobId: string) => {
    if (comparedJobIds.includes(jobId)) {
      setComparedJobIds(prev => prev.filter(id => id !== jobId));
      showToast('Removed job from comparison list.');
    } else {
      if (comparedJobIds.length >= 3) {
        showToast('You can compare up to 3 jobs at a time.');
        return;
      }
      setComparedJobIds(prev => [...prev, jobId]);
      showToast('Added job to comparison list!');
    }
  };

  const handleApplyToJob = (job: JobRecommendation) => {
    // Check if application already exists
    const existing = applications.find(a => a.jobId === job.id || (a.company === job.company && a.jobTitle === job.title));
    if (!existing) {
      onAddApplication({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        companyLogo: job.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
        status: 'applied',
        locationType: job.location.toLowerCase().includes('remote') ? 'Remote' : (job.location.toLowerCase().includes('hybrid') ? 'Hybrid' : 'On-site'),
        priority: job.matchScore >= 92,
        timeAgo: 'Just now',
        appliedDate: new Date().toISOString().split('T')[0],
        jobDescription: job.description,
        matchScore: job.matchScore,
        statusHistory: [{ status: 'applied', timestamp: 'Just now' }]
      });
      showToast(`Applied to ${job.company}! Added to Application Tracker.`);
    } else {
      showToast(`Opened careers page for ${job.company}.`);
    }

    // Open official company career site safely in new tab
    const url = job.applicationUrl || job.applyUrl || job.companyWebsite || `https://www.google.com/search?q=${encodeURIComponent(job.company + ' careers ' + job.title)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenCompanyByName = (companyName: string) => {
    const comp = mockCompanies.find(c => c.name.toLowerCase() === companyName.toLowerCase()) || {
      id: companyName.toLowerCase(),
      name: companyName,
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
      description: `${companyName} is a global tech leader innovating in software and artificial intelligence.`,
      industry: 'Technology & Software',
      headquarters: 'San Francisco, CA',
      employees: '10,000+',
      website: `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      openPositionsCount: 24,
      benefits: ['Flexible Work Options', 'Health & Wellness', 'Equity Grants', 'Learning Stipend'],
      interviewDifficulty: 'Hard' as const,
      averageSalary: '$170,000 - $310,000 / yr',
      aiRecommendation: 'Recommended for candidates with strong web systems and cloud experience.'
    };
    setSelectedCompanyModal(comp);
  };

  const handleSavePreferences = (newPrefs: JobPreferences) => {
    if (onUpdateUser) {
      onUpdateUser({ preferences: newPrefs });
    }
    showToast('Preferences updated! Re-scoring AI recommendations...');
  };

  const handleSaveJobNote = (jobId: string, note: string) => {
    setJobNotes(prev => ({ ...prev, [jobId]: note }));
    showToast('Saved note to job card.');
  };

  const handleShareJob = (job: JobRecommendation) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.href}#job=${job.id}`);
      showToast(`Share link copied for ${job.title}!`);
    } else {
      showToast(`Link ready: ${job.title} at ${job.company}`);
    }
  };

  const handleCreateNewApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appRole || !appCompany) return;

    if (editingApplication) {
      onUpdateStatus(editingApplication.id, appStatus);
      showToast(`Updated application for ${appRole} at ${appCompany}`);
    } else {
      onAddApplication({
        jobTitle: appRole,
        company: appCompany,
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
        status: appStatus,
        locationType: appLocation,
        notes: appNotes,
        recruiterInfo: appRecruiter,
        salaryOffered: appSalary,
        appliedDate: new Date().toISOString().split('T')[0],
        timeAgo: 'Just now',
        statusHistory: [{ status: appStatus, timestamp: 'Just now' }]
      });
      showToast(`Added ${appRole} at ${appCompany} to Application Tracker!`);
    }

    setAppRole('');
    setAppCompany('');
    setAppNotes('');
    setAppRecruiter('');
    setAppSalary('');
    setEditingApplication(null);
    setShowAddApplicationModal(false);
  };

  // 8 Kanban Stages
  const kanbanStages: { id: ApplicationCard['status']; label: string; color: string; bg: string }[] = [
    { id: 'saved', label: 'Saved', color: '#a1a3b8', bg: 'bg-[#a1a3b8]/10 border-[#a1a3b8]/30' },
    { id: 'applied', label: 'Applied', color: '#8d90a2', bg: 'bg-[#8d90a2]/10 border-[#8d90a2]/30' },
    { id: 'assessment', label: 'Assessment', color: '#4cd7f6', bg: 'bg-[#007083]/20 border-[#4cd7f6]/40' },
    { id: 'interview', label: 'Interview', color: '#d0bcff', bg: 'bg-[#571bc1]/20 border-[#571bc1]/40' },
    { id: 'hr_round', label: 'HR Round', color: '#b7c4ff', bg: 'bg-[#0052ff]/20 border-[#0052ff]/40' },
    { id: 'offer', label: 'Offer', color: '#8d90a2', bg: 'bg-[#0052ff]/20 border-[#0052ff]/40' },
    { id: 'accepted', label: 'Accepted', color: '#8d90a2', bg: 'bg-[#0052ff]/20 border-[#0052ff]/40' },
    { id: 'rejected', label: 'Rejected', color: '#434656', bg: 'bg-[#434656]/20 border-[#434656]/30' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#11131c] text-[#e1e1ef]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0052ff] text-white text-xs font-mono font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Navigation Bar for Job Hub */}
      <div className="bg-[#191b25] border-b border-[#434656]/30 px-6 py-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-geist text-white">HireFlow Job Hub</h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0052ff]/10 text-[#4cd7f6] border border-[#0052ff]/30">
                AI Powered
              </span>
            </div>
            <p className="text-xs font-mono text-[#a1a3b8] mt-0.5">
              Discover opportunities, track applications, and accelerate your interview success.
            </p>
          </div>

          {/* Job Hub Navigation Tabs */}
          <div className="flex items-center gap-1 bg-[#11131c] p-1 rounded-xl border border-[#434656]/30 overflow-x-auto">
            
            <button
              onClick={() => setActiveTab('recommended')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'recommended'
                  ? 'bg-[#0052ff] text-white shadow-md'
                  : 'text-[#a1a3b8] hover:text-white hover:bg-[#212433]'
              }`}
            >
              <Star className="w-3.5 h-3.5" /> Recommended Jobs
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-bold">
                {filteredRecommendedJobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-[#0052ff] text-white shadow-md'
                  : 'text-[#a1a3b8] hover:text-white hover:bg-[#212433]'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" /> Saved Jobs
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-bold">
                {savedJobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tracker'
                  ? 'bg-[#0052ff] text-white shadow-md'
                  : 'text-[#a1a3b8] hover:text-white hover:bg-[#212433]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Application Tracker
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-bold">
                {applications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-[#0052ff] text-white shadow-md'
                  : 'text-[#a1a3b8] hover:text-white hover:bg-[#212433]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Job Analytics
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'preferences'
                  ? 'bg-[#0052ff] text-white shadow-md'
                  : 'text-[#a1a3b8] hover:text-white hover:bg-[#212433]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Preferences
            </button>

          </div>

        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1">

        {/* ====================================================================== */}
        {/* TAB 1: RECOMMENDED JOBS PAGE */}
        {/* ====================================================================== */}
        {activeTab === 'recommended' && (
          <div className="p-6 max-w-[1280px] mx-auto w-full space-y-6 animate-in fade-in duration-200">
            
            {/* Personalized Welcome Header Banner */}
            <div className="bg-gradient-to-r from-[#191b25] via-[#212433] to-[#191b25] border border-[#434656]/40 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#0052ff]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-mono uppercase text-[#4cd7f6] font-bold tracking-wider flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-[#4cd7f6]" /> Personalized AI Recommendation Engine
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold font-geist text-white">
                    Good Morning, {activeUser.name.split(' ')[0]}.
                  </h2>
                  <p className="text-xs sm:text-sm font-mono text-[#e1e1ef] mt-2 leading-relaxed max-w-2xl">
                    {hasResume ? (
                      <>
                        We found <span className="text-[#4cd7f6] font-bold">{allJobs.length} top opportunities</span> matching your profile today. You have a <span className="text-[#8d90a2] font-bold">92% match</span> for Senior Software Engineering roles.
                      </>
                    ) : (
                      <>
                        Upload your resume to unlock AI-powered job recommendations tailored specifically to your skills and experience.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className="bg-[#212433] hover:bg-[#2e3245] text-[#4cd7f6] border border-[#0052ff]/30 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" /> Fine-Tune Preferences
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigateTab) {
                        onNavigateTab('resume-suite');
                      } else {
                        setIsUploadModalOpen(true);
                      }
                    }}
                    className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-lg flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> {hasResume ? 'Re-analyze Resume' : 'Upload Resume'}
                  </button>
                </div>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[#434656]/30 relative z-10">
                <div className="bg-[#11131c]/80 p-3.5 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#a1a3b8] uppercase block">New Jobs Today</span>
                  <span className="text-xl font-bold font-mono text-[#4cd7f6] mt-0.5 block">{hasResume ? '12' : '0'}</span>
                </div>
                <div className="bg-[#11131c]/80 p-3.5 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#a1a3b8] uppercase block">High Match (90%+)</span>
                  <span className="text-xl font-bold font-mono text-[#8d90a2] mt-0.5 block">
                    {hasResume ? allJobs.filter(j => j.matchScore >= 90).length : 0}
                  </span>
                </div>
                <div className="bg-[#11131c]/80 p-3.5 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#a1a3b8] uppercase block">Interviews Scheduled</span>
                  <span className="text-xl font-bold font-mono text-[#d0bcff] mt-0.5 block">
                    {applications.filter(a => a.status === 'interview' || a.status === 'hr_round').length}
                  </span>
                </div>
                <div className="bg-[#11131c]/80 p-3.5 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#a1a3b8] uppercase block">Saved Jobs</span>
                  <span className="text-xl font-bold font-mono text-white mt-0.5 block">{savedJobs.length}</span>
                </div>
                <div className="bg-[#11131c]/80 p-3.5 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#a1a3b8] uppercase block">Applications Sent</span>
                  <span className="text-xl font-bold font-mono text-white mt-0.5 block">{applications.length}</span>
                </div>
                <div className="bg-[#11131c]/80 p-3.5 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#a1a3b8] uppercase block">Profile Completion</span>
                  <span className="text-xl font-bold font-mono text-[#4cd7f6] mt-0.5 block">{hasResume ? '95%' : '20%'}</span>
                </div>
              </div>
            </div>

            {/* If NO Resume uploaded: Display Empty State and Flow Pipeline */}
            {!hasResume ? (
              <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-8 sm:p-12 text-center space-y-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#0052ff]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 bg-[#0052ff]/10 border border-[#0052ff]/30 rounded-2xl flex items-center justify-center mx-auto text-[#4cd7f6] shadow-inner">
                  <FileText className="w-8 h-8 text-[#0052ff]" />
                </div>

                <div className="space-y-3 max-w-xl mx-auto relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold font-geist text-white leading-tight">
                    Upload your resume to unlock AI-powered job recommendations.
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-[#a1a3b8] leading-relaxed">
                    Our AI pipeline analyzes your experience, extracts key technical skills, generates your ATS score, and recommends targeted high-confidence job opportunities.
                  </p>
                </div>

                {/* Flow Pipeline Steps */}
                <div className="pt-2 pb-2 relative z-10">
                  <div className="text-[11px] font-mono text-[#4cd7f6] uppercase tracking-wider font-bold mb-4">
                    AI Match Activation Flow
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl mx-auto">
                    <div className="bg-[#11131c] border border-red-500/40 rounded-xl px-3 py-2 text-xs font-mono text-red-300 flex items-center gap-2 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> No Resume
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#434656]" />
                    <div className="bg-[#11131c] border border-[#0052ff]/50 rounded-xl px-3 py-2 text-xs font-mono text-white flex items-center gap-2 shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-[#0052ff]" /> Upload Resume
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#434656]" />
                    <div className="bg-[#11131c] border border-[#571bc1]/50 rounded-xl px-3 py-2 text-xs font-mono text-[#d0bcff] flex items-center gap-2 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-[#571bc1]" /> AI Resume Analysis
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#434656]" />
                    <div className="bg-[#11131c] border border-[#4cd7f6]/50 rounded-xl px-3 py-2 text-xs font-mono text-[#4cd7f6] flex items-center gap-2 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4cd7f6]" /> Extract Skills
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#434656]" />
                    <div className="bg-[#11131c] border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 flex items-center gap-2 shadow-sm">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> Generate ATS Score
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#434656]" />
                    <div className="bg-[#11131c] border border-green-500/50 rounded-xl px-3 py-2 text-xs font-mono text-green-400 flex items-center gap-2 shadow-sm">
                      <Briefcase className="w-3.5 h-3.5 text-green-400" /> Generate AI Job Recommendations
                    </div>
                  </div>
                </div>

                <div className="pt-2 relative z-10">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono text-xs font-bold px-6 py-3.5 rounded-xl inline-flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Upload Resume
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Global Search & Filters Toolbar */}
                <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                  
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#a1a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by company, role title, skills (e.g. React, C++), location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#a1a3b8] focus:outline-none focus:border-[#0052ff]"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a3b8] hover:text-white cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick Select Filter Dropdowns */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    <select
                      value={remoteFilter}
                      onChange={(e) => setRemoteFilter(e.target.value)}
                      className="bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-xs text-[#e1e1ef] focus:outline-none focus:border-[#0052ff] cursor-pointer font-mono"
                    >
                      <option value="all">All Locations</option>
                      <option value="remote">Remote Only</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>

                    <select
                      value={experienceFilter}
                      onChange={(e) => setExperienceFilter(e.target.value)}
                      className="bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-xs text-[#e1e1ef] focus:outline-none focus:border-[#0052ff] cursor-pointer font-mono"
                    >
                      <option value="all">All Experience Levels</option>
                      <option value="5+">5+ Years</option>
                      <option value="6+">6+ Years</option>
                      <option value="7+">7+ Years</option>
                    </select>

                    <select
                      value={jobTypeFilter}
                      onChange={(e) => setJobTypeFilter(e.target.value)}
                      className="bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-xs text-[#e1e1ef] focus:outline-none focus:border-[#0052ff] cursor-pointer font-mono"
                    >
                      <option value="all">All Employment Types</option>
                      <option value="full-time">Full-Time</option>
                      <option value="contract">Contract</option>
                    </select>

                    <button
                      onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                      className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        showFiltersDrawer ? 'bg-[#0052ff] text-white border-[#0052ff]' : 'bg-[#11131c] border-[#434656]/40 text-[#a1a3b8] hover:text-white'
                      }`}
                    >
                      <Filter className="w-4 h-4" /> Filters
                    </button>

                  </div>

                </div>

                {/* AI Intelligent Suggestion Panel */}
                <div className="bg-[#241f3e]/60 border border-[#571bc1]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#d0bcff] shrink-0" />
                    <p className="text-xs text-[#e1e1ef] font-mono leading-relaxed">
                      <strong className="text-[#d0bcff]">AI Insight:</strong> Adding <span className="text-[#4cd7f6] font-bold">Docker</span> and <span className="text-[#4cd7f6] font-bold">Terraform</span> to your profile could increase your average candidate match score by ~8% across 42 additional opportunities.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('preferences')}
                    className="text-xs font-mono text-[#4cd7f6] hover:underline font-bold shrink-0 cursor-pointer"
                  >
                    Update Preferences →
                  </button>
                </div>

                {/* Recommended Job Cards Grid */}
                {filteredRecommendedJobs.length === 0 ? (
                  <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-12 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-[#4cd7f6] mx-auto" />
                    <h3 className="text-lg font-bold font-geist text-white">No jobs match your current filter selection</h3>
                    <p className="text-xs font-mono text-[#a1a3b8] max-w-md mx-auto">
                      Try clearing search filters or adjusting your remote preference. AI recommendations automatically update as search criteria change!
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setRemoteFilter('all');
                        setExperienceFilter('all');
                        setJobTypeFilter('all');
                      }}
                      className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredRecommendedJobs.map((job) => {
                  const isSaved = savedJobIds.includes(job.id);
                  const isApplied = applications.some(a => a.jobId === job.id || (a.company === job.company && a.jobTitle === job.title));

                  return (
                    <div 
                      key={job.id} 
                      className="bg-[#191b25] border border-[#434656]/30 hover:border-[#0052ff]/50 rounded-2xl p-6 transition-all shadow-lg flex flex-col justify-between space-y-5 relative group"
                    >
                      {/* Top Bar: Company Logo, Title, Match Score */}
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            {job.companyLogo && job.companyLogo.trim().length > 0 ? (
                              <img
                                src={job.companyLogo}
                                alt={job.company}
                                className="w-12 h-12 rounded-xl object-cover bg-[#11131c] border border-[#434656]/40 p-1 shrink-0 cursor-pointer"
                                onClick={() => handleOpenCompanyByName(job.company)}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120';
                                }}
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-xl bg-[#11131c] border border-[#434656]/40 p-1 shrink-0 cursor-pointer flex items-center justify-center text-[#4cd7f6] font-bold"
                                onClick={() => handleOpenCompanyByName(job.company)}
                              >
                                {job.company?.charAt(0) || 'C'}
                              </div>
                            )}
                            <div>
                              <button
                                onClick={() => handleOpenCompanyByName(job.company)}
                                className="text-xs font-mono font-bold text-[#a1a3b8] hover:text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                {job.company} <Building2 className="w-3 h-3 text-[#0052ff]" />
                              </button>
                              <h3 
                                onClick={() => setSelectedJobDetails(job)}
                                className="text-base sm:text-lg font-bold font-geist text-white hover:text-[#4cd7f6] transition-colors cursor-pointer mt-0.5"
                              >
                                {job.title}
                              </h3>
                              <p className="text-xs font-mono text-[#a1a3b8] mt-1 flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#4cd7f6]" /> {job.location}</span>
                                <span>•</span>
                                <span className="text-[#e1e1ef] font-bold">{job.salaryRange || job.salary}</span>
                              </p>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <div className="text-right shrink-0">
                            <span className="text-xl font-bold font-mono text-[#8d90a2] block">{job.matchScore}%</span>
                            <span className="text-[10px] font-mono text-[#4cd7f6] uppercase tracking-wider font-semibold">
                              {job.matchConfidence || 'High Match'}
                            </span>
                          </div>
                        </div>

                        {/* AI Summary Banner */}
                        <div className="mt-4 bg-[#11131c] border border-[#434656]/20 rounded-xl p-3 text-xs text-[#c3c5d9] leading-relaxed flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-[#4cd7f6] shrink-0 mt-0.5" />
                          <span>{job.recommendationReason}</span>
                        </div>

                        {/* Required & Missing Skills */}
                        <div className="mt-4 space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono text-[#a1a3b8] uppercase mr-1">Required:</span>
                            {job.requiredSkills?.slice(0, 4).map((sk, idx) => (
                              <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0052ff]/10 text-[#4cd7f6] border border-[#0052ff]/30">
                                {sk}
                              </span>
                            ))}
                          </div>
                          {job.missingSkills && job.missingSkills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-mono text-[#a1a3b8] uppercase mr-1">Missing:</span>
                              {job.missingSkills.slice(0, 2).map((sk, idx) => (
                                <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#571bc1]/20 text-[#d0bcff] border border-[#571bc1]/40">
                                  + {sk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-4 border-t border-[#434656]/30 flex items-center justify-between gap-2">
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedJobDetails(job)}
                            className="text-xs font-mono text-[#4cd7f6] hover:underline font-bold px-2 py-1 cursor-pointer"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => setSelectedWhyMatchModal(job)}
                            className="p-1.5 rounded-lg text-[#a1a3b8] hover:text-white hover:bg-[#11131c] cursor-pointer"
                            title="Why Am I Seeing This?"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleCompareJob(job.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              comparedJobIds.includes(job.id)
                                ? 'bg-[#0052ff]/20 border-[#0052ff] text-[#4cd7f6]'
                                : 'border-transparent text-[#a1a3b8] hover:text-white hover:bg-[#11131c]'
                            }`}
                            title={comparedJobIds.includes(job.id) ? "Remove from Comparison" : "Compare Side-by-Side"}
                          >
                            <Columns className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleHideJob(job.id)}
                            className="p-1.5 rounded-lg text-[#a1a3b8] hover:text-red-400 hover:bg-[#11131c] cursor-pointer"
                            title="Hide Recommendation"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSaveJob(job)}
                            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                              isSaved ? 'bg-[#571bc1]/20 border-[#571bc1] text-[#d0bcff]' : 'bg-[#11131c] border-[#434656]/40 text-[#a1a3b8] hover:text-white'
                            }`}
                            title={isSaved ? "Remove from Saved" : "Save Job"}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#d0bcff]' : ''}`} />
                          </button>

                          <button
                            onClick={() => handleApplyToJob(job)}
                            className={`text-xs font-mono font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                              isApplied
                                ? 'bg-[#212433] text-[#4cd7f6] border border-[#0052ff]/40'
                                : 'bg-[#0052ff] hover:bg-[#0052ff]/90 text-white shadow-md'
                            }`}
                          >
                            {isApplied ? 'Applied' : 'Apply Now'} <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
            </>
          )}

          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 2: SAVED JOBS PAGE */}
        {/* ====================================================================== */}
        {activeTab === 'saved' && (
          <div className="p-6 max-w-[1280px] mx-auto w-full space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex items-center justify-between shadow-xl">
              <div>
                <h1 className="text-2xl font-bold font-geist text-white flex items-center gap-2">
                  <Heart className="w-6 h-6 text-[#571bc1] fill-current" /> Saved Opportunities ({savedJobs.length})
                </h1>
                <p className="text-xs font-mono text-[#a1a3b8] mt-1">
                  Manage your bookmarked opportunities, attach application notes, and move candidates into the tracker.
                </p>
              </div>
            </div>

            {savedJobs.length === 0 ? (
              <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-12 text-center space-y-4">
                <Bookmark className="w-12 h-12 text-[#a1a3b8] mx-auto" />
                <h3 className="text-lg font-bold font-geist text-white">No saved jobs yet</h3>
                <p className="text-xs font-mono text-[#a1a3b8] max-w-md mx-auto">
                  Click the bookmark button on any recommendation card to save jobs here for later review and notes.
                </p>
                <button
                  onClick={() => setActiveTab('recommended')}
                  className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Explore Recommended Jobs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedJobs.map((job) => {
                  const currentNote = jobNotes[job.id] || '';

                  return (
                    <div key={job.id} className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {job.companyLogo && job.companyLogo.trim().length > 0 ? (
                              <img
                                src={job.companyLogo}
                                alt={job.company}
                                className="w-12 h-12 rounded-xl object-cover bg-[#11131c] border border-[#434656]/40 p-1 cursor-pointer"
                                onClick={() => handleOpenCompanyByName(job.company)}
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-xl bg-[#11131c] border border-[#434656]/40 p-1 cursor-pointer flex items-center justify-center text-[#4cd7f6] font-bold"
                                onClick={() => handleOpenCompanyByName(job.company)}
                              >
                                {job.company?.charAt(0) || 'C'}
                              </div>
                            )}
                            <div>
                              <button
                                onClick={() => handleOpenCompanyByName(job.company)}
                                className="text-xs font-mono font-bold text-[#a1a3b8] hover:text-[#4cd7f6] cursor-pointer"
                              >
                                {job.company}
                              </button>
                              <h3 
                                onClick={() => setSelectedJobDetails(job)}
                                className="text-base font-bold font-geist text-white hover:text-[#4cd7f6] cursor-pointer"
                              >
                                {job.title}
                              </h3>
                              <p className="text-xs font-mono text-[#a1a3b8]">{job.location} • {job.salaryRange || job.salary}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold font-mono text-[#8d90a2]">{job.matchScore}%</span>
                        </div>

                        {/* Editable Notes Section */}
                        <div className="mt-4">
                          <label className="text-[11px] font-mono text-[#a1a3b8] uppercase block mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-[#0052ff]" /> Personal Notes
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Add notes e.g. Contacted recruiter, tailored cover letter..."
                            value={currentNote}
                            onChange={(e) => handleSaveJobNote(job.id, e.target.value)}
                            className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl p-2.5 text-xs text-white placeholder-[#a1a3b8] focus:outline-none focus:border-[#0052ff]"
                          />
                        </div>
                      </div>

                      {/* Saved Actions */}
                      <div className="pt-4 border-t border-[#434656]/30 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSaveJob(job)}
                            className="text-xs font-mono text-red-400 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => handleShareJob(job)}
                            className="p-1.5 rounded-lg text-[#a1a3b8] hover:text-white cursor-pointer"
                            title="Share Link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJobDetails(job)}
                            className="bg-[#11131c] hover:bg-[#212433] text-white border border-[#434656]/40 px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer"
                          >
                            View Job
                          </button>
                          <button
                            onClick={() => handleApplyToJob(job)}
                            className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold px-4 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            Apply <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 3: APPLICATION TRACKER (KANBAN & LIST) */}
        {/* ====================================================================== */}
        {activeTab === 'tracker' && (
          <div className="p-6 max-w-[1440px] mx-auto w-full space-y-6 animate-in fade-in duration-200">
            
            {/* Tracker Header Bar */}
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div>
                <h1 className="text-2xl font-bold font-geist text-white flex items-center gap-2">
                  <Columns className="w-6 h-6 text-[#0052ff]" /> Application Pipeline Tracker
                </h1>
                <p className="text-xs font-mono text-[#a1a3b8] mt-1">
                  Drag and drop application cards across 8 status columns or edit interviewer details and notes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Switcher */}
                <div className="flex items-center bg-[#11131c] p-1 rounded-xl border border-[#434656]/30">
                  <button
                    onClick={() => setTrackerMode('kanban')}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      trackerMode === 'kanban' ? 'bg-[#0052ff] text-white' : 'text-[#a1a3b8] hover:text-white'
                    }`}
                    title="Kanban Board View"
                  >
                    <Columns className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTrackerMode('list')}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      trackerMode === 'list' ? 'bg-[#0052ff] text-white' : 'text-[#a1a3b8] hover:text-white'
                    }`}
                    title="Structured List View"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingApplication(null);
                    setAppRole('');
                    setAppCompany('');
                    setAppNotes('');
                    setShowAddApplicationModal(true);
                  }}
                  className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Application
                </button>
              </div>
            </div>

            {/* Applications List/Kanban or Empty State */}
            {applications.length === 0 ? (
              <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-12 text-center space-y-4 shadow-xl">
                <Briefcase className="w-12 h-12 text-[#4cd7f6] mx-auto opacity-80" />
                <h3 className="text-xl font-bold font-geist text-white">No applications yet.</h3>
                <p className="text-xs sm:text-sm font-mono text-[#a1a3b8] max-w-md mx-auto">
                  Apply for jobs from Job Hub to start tracking your progress.
                </p>
                <button
                  onClick={() => setActiveTab('recommended')}
                  className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg inline-flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" /> Explore Job Recommendations
                </button>
              </div>
            ) : trackerMode === 'kanban' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 overflow-x-auto pb-4">
                {kanbanStages.map((stage) => {
                  const stageApps = applications.filter(a => a.status === stage.id);

                  return (
                    <div 
                      key={stage.id} 
                      className="bg-[#191b25]/80 border border-[#434656]/30 rounded-2xl p-3 flex flex-col min-w-[260px] h-[75vh]"
                    >
                      {/* Stage Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#434656]/30 mb-3">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: stage.color }} 
                          />
                          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">{stage.label}</h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#a1a3b8] bg-[#11131c] px-2 py-0.5 rounded-md border border-[#434656]/30">
                          {stageApps.length}
                        </span>
                      </div>

                      {/* Stage Cards Container */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {stageApps.length === 0 ? (
                          <div className="h-24 border border-dashed border-[#434656]/30 rounded-xl flex items-center justify-center text-[11px] font-mono text-[#a1a3b8]">
                            No roles in {stage.label}
                          </div>
                        ) : (
                          stageApps.map((app) => (
                            <div 
                              key={app.id} 
                              className="bg-[#11131c] hover:bg-[#212433] border border-[#434656]/30 hover:border-[#0052ff]/40 rounded-xl p-3.5 space-y-3 transition-all cursor-pointer shadow-md group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-mono text-[#a1a3b8] font-bold block">{app.company}</span>
                                  <h4 className="text-xs font-bold font-geist text-white mt-0.5 group-hover:text-[#4cd7f6] transition-colors">
                                    {app.jobTitle}
                                  </h4>
                                </div>
                                {app.matchScore && (
                                  <span className="text-[10px] font-mono font-bold text-[#8d90a2] bg-[#0052ff]/10 px-1.5 py-0.5 rounded border border-[#0052ff]/30 shrink-0">
                                    {app.matchScore}%
                                  </span>
                                )}
                              </div>

                              <div className="text-[10px] font-mono text-[#a1a3b8] flex items-center justify-between">
                                <span className="bg-[#191b25] px-2 py-0.5 rounded border border-[#434656]/30">{app.locationType}</span>
                                <span>{app.timeAgo || 'Recent'}</span>
                              </div>

                              {app.notes && (
                                <p className="text-[11px] text-[#c3c5d9] bg-[#191b25] p-2 rounded-lg border border-[#434656]/20 line-clamp-2">
                                  {app.notes}
                                </p>
                              )}

                              {/* Column Status Switcher */}
                              <div className="pt-2 border-t border-[#434656]/20 flex items-center justify-between">
                                <select
                                  value={app.status}
                                  onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationCard['status'])}
                                  className="bg-[#191b25] border border-[#434656]/40 rounded px-1.5 py-1 text-[10px] text-[#4cd7f6] focus:outline-none cursor-pointer font-mono"
                                >
                                  {kanbanStages.map(s => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
                                  ))}
                                </select>

                                {app.jobId && (
                                  <button
                                    onClick={() => {
                                      const j = allJobs.find(item => item.id === app.jobId);
                                      if (j) setSelectedJobDetails(j);
                                    }}
                                    className="text-[10px] font-mono text-[#a1a3b8] hover:text-white"
                                  >
                                    View
                                  </button>
                                )}
                              </div>

                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              /* Structured List Mode */
              <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#212433] text-[#a1a3b8] border-b border-[#434656]/30 uppercase font-bold">
                    <tr>
                      <th className="p-4">Company & Role</th>
                      <th className="p-4">Status Stage</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Applied Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#434656]/20 text-[#e1e1ef]">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#212433]/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold font-geist text-white text-sm">{app.jobTitle}</div>
                          <div className="text-[#a1a3b8]">{app.company}</div>
                        </td>
                        <td className="p-4">
                          <select
                            value={app.status}
                            onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationCard['status'])}
                            className="bg-[#11131c] border border-[#434656]/40 rounded-lg px-2.5 py-1 text-xs text-[#4cd7f6] focus:outline-none cursor-pointer font-mono"
                          >
                            {kanbanStages.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-[#a1a3b8]">{app.locationType}</td>
                        <td className="p-4 text-[#a1a3b8]">{app.appliedDate || app.timeAgo || 'N/A'}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              const j = allJobs.find(item => item.id === app.jobId || item.company === app.company);
                              if (j) setSelectedJobDetails(j);
                            }}
                            className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Job Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 4: JOB ANALYTICS PAGE */}
        {/* ====================================================================== */}
        {activeTab === 'analytics' && (
          <JobAnalyticsView applications={applications} savedJobs={savedJobs} />
        )}

        {/* ====================================================================== */}
        {/* TAB 5: USER PREFERENCES PAGE */}
        {/* ====================================================================== */}
        {activeTab === 'preferences' && (
          <PreferencesView user={activeUser} onSavePreferences={handleSavePreferences} />
        )}

      </div>

      {/* MODAL 1: Job Details Modal */}
      {selectedJobDetails && (
        <JobDetailsModal
          job={selectedJobDetails}
          isSaved={savedJobIds.includes(selectedJobDetails.id)}
          onClose={() => setSelectedJobDetails(null)}
          onSaveToggle={handleToggleSaveJob}
          onApply={handleApplyToJob}
          onOpenCompany={handleOpenCompanyByName}
          onOpenWhyMatch={(j) => setSelectedWhyMatchModal(j)}
        />
      )}

      {/* MODAL 2: Company Profile Modal */}
      {selectedCompanyModal && (
        <CompanyModal
          company={selectedCompanyModal}
          companyJobs={allJobs.filter(j => j.company.toLowerCase() === selectedCompanyModal.name.toLowerCase())}
          onClose={() => setSelectedCompanyModal(null)}
          onSelectJob={(j) => {
            setSelectedCompanyModal(null);
            setSelectedJobDetails(j);
          }}
        />
      )}

      {/* MODAL 3: Why Am I Seeing This AI Explainability Modal */}
      {selectedWhyMatchModal && (
        <WhyMatchModal
          job={selectedWhyMatchModal}
          user={activeUser}
          onClose={() => setSelectedWhyMatchModal(null)}
        />
      )}

      {/* MODAL 4: Manual Add Application Modal */}
      {showAddApplicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#191b25] border border-[#434656]/40 rounded-2xl w-full max-w-lg p-6 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#434656]/30 pb-4">
              <h3 className="text-lg font-bold font-geist text-white">Add New Application to Tracker</h3>
              <button onClick={() => setShowAddApplicationModal(false)} className="text-[#a1a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewApplicationSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-white block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Google, OpenAI"
                  value={appCompany}
                  onChange={(e) => setAppCompany(e.target.value)}
                  className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl px-3.5 py-2.5 text-white placeholder-[#a1a3b8] focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="text-white block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  value={appRole}
                  onChange={(e) => setAppRole(e.target.value)}
                  className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl px-3.5 py-2.5 text-white placeholder-[#a1a3b8] focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white block mb-1">Status Stage</label>
                  <select
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value as ApplicationCard['status'])}
                    className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                  >
                    {kanbanStages.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white block mb-1">Work Type</label>
                  <select
                    value={appLocation}
                    onChange={(e) => setAppLocation(e.target.value as 'Remote' | 'Hybrid' | 'On-site')}
                    className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white block mb-1">Notes / Recruiter Contact</label>
                <textarea
                  rows={3}
                  placeholder="Recruiter email, interview date, or custom notes..."
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl p-3 text-white placeholder-[#a1a3b8] focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddApplicationModal(false)}
                  className="bg-[#11131c] hover:bg-[#212433] text-[#a1a3b8] px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Add to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Job Comparison Bar */}
      {comparedJobIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#191b25] border border-[#0052ff]/50 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4cd7f6]" />
            <span className="text-xs font-mono text-white font-bold">
              {comparedJobIds.length} Job{comparedJobIds.length > 1 ? 's' : ''} Selected for Comparison
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompareModal(true)}
              className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              Compare Side-by-Side
            </button>
            <button
              onClick={() => setComparedJobIds([])}
              className="text-xs font-mono text-[#a1a3b8] hover:text-white px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: Side-by-Side Job Comparison Modal */}
      {showCompareModal && (
        <CompareJobsModal
          jobs={allJobs.filter(j => comparedJobIds.includes(j.id))}
          onClose={() => setShowCompareModal(false)}
          onRemoveJob={(jobId) => setComparedJobIds(prev => prev.filter(id => id !== jobId))}
          onApply={handleApplyToJob}
          onSaveJob={(jobId) => {
            const j = allJobs.find(item => item.id === jobId);
            if (j) handleToggleSaveJob(j);
          }}
          savedJobIds={savedJobIds}
        />
      )}

      {/* MODAL 6: Resume Upload & Analysis Modal */}
      <ResumeUploadParserModal
        user={activeUser}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSaveParsedResume={(parsedData, fileName, fileText) => {
          if (onUploadResume) {
            onUploadResume(fileText, fileName);
          } else if (onUpdateUser) {
            onUpdateUser({ atsScore: 85, resumeText: fileText });
          }
          setIsUploadModalOpen(false);
          showToast(`Resume "${fileName}" uploaded & analyzed! Job recommendations unlocked.`);
        }}
        onSyncWithProfilePrompt={() => {
          showToast("Profile auto-synced with parsed resume skills and experience!");
        }}
      />

    </div>
  );
};
