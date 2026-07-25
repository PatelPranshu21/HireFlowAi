import React, { useState } from 'react';
import { UserProfile, ApplicationCard, ResumeVersion, InterviewFeedbackReport } from '../types';
import { InterviewDashboardTab } from './interview/InterviewDashboardTab';
import { AiMockInterviewTab } from './interview/AiMockInterviewTab';
import { CompanyPrepTab } from './interview/CompanyPrepTab';
import { CodingPracticeTab } from './interview/CodingPracticeTab';
import { HrBehavioralTab } from './interview/HrBehavioralTab';
import { SystemDesignTab } from './interview/SystemDesignTab';
import { StudyPlanTab } from './interview/StudyPlanTab';
import { GamificationProgressTab } from './interview/GamificationProgressTab';
import { AiCoachDrawer } from './interview/AiCoachDrawer';
import { ScheduleInterviewModal } from './interview/ScheduleInterviewModal';
import { 
  BarChart3, 
  Bot, 
  Building2, 
  Code, 
  MessageSquare, 
  Layers, 
  Calendar, 
  Award, 
  Sparkles, 
  Plus, 
  Flame,
  Zap,
  Play
} from 'lucide-react';

interface InterviewsViewProps {
  user?: UserProfile;
  applications?: ApplicationCard[];
  versions?: ResumeVersion[];
}

export const InterviewsView: React.FC<InterviewsViewProps> = ({
  user = {
    id: 'u1',
    name: 'Alex Rivera',
    email: 'alex@hireflow.ai',
    subscriptionStatus: 'active',
    planType: 'pro',
    targetRole: 'Senior Software Engineer'
  },
  applications = [
    {
      id: 'app_g',
      jobTitle: 'Senior Frontend Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      salary: '$180,000 - $240,000',
      type: 'Full-time',
      appliedDate: '2 days ago',
      status: 'interview',
      interviewTime: 'Tomorrow, 2:00 PM',
      companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&q=80&w=100'
    },
    {
      id: 'app_m',
      jobTitle: 'Full Stack Engineer',
      company: 'Microsoft',
      location: 'Redmond, WA',
      salary: '$170,000 - $220,000',
      type: 'Full-time',
      appliedDate: '1 week ago',
      status: 'interview',
      interviewTime: 'Friday, 10:00 AM',
      companyLogo: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&q=80&w=100'
    }
  ],
  versions = []
}) => {
  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mock' | 'companies' | 'coding' | 'behavioral' | 'system-design' | 'roadmap' | 'achievements'>('dashboard');

  // AI Coach & Schedule Modals State
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // User Gamification & Stats State
  const [readinessScore, setReadinessScore] = useState(84);
  const [mocksCompleted, setMocksCompleted] = useState(4);
  const [codingSolved, setCodingSolved] = useState(22);
  const [behavioralPracticed, setBehavioralPracticed] = useState(12);
  const [streakDays, setStreakDays] = useState(7);
  const [xpPoints, setXpPoints] = useState(720);

  // Weak & Strong Areas
  const [weakAreas, setWeakAreas] = useState<string[]>(['Dynamic Programming 2D', 'System Design Sharding', 'Memory Allocation Trade-offs']);
  const [strongAreas, setStrongAreas] = useState<string[]>(['React Architecture', 'STAR Storytelling', 'REST API Idempotency']);

  // Calendar Scheduled Events State
  const [scheduledEvents, setScheduledEvents] = useState<any[]>([
    { id: 'evt_1', title: 'Google L5 Technical System Design Round', company: 'Google', date: 'Jul 28, 2026', time: '14:00', type: 'Real Interview' },
    { id: 'evt_2', title: 'Full Stack AI Mock Interview Session', company: 'HireFlow AI', date: 'Jul 29, 2026', time: '10:00', type: 'Mock Practice' }
  ]);

  // Handle session completion from AI Mock Interview tab
  const handleSessionComplete = (report: InterviewFeedbackReport) => {
    setMocksCompleted(prev => prev + 1);
    setXpPoints(prev => prev + 150);
    setReadinessScore(prev => Math.min(98, prev + 3));
  };

  // Launch Company Mock Interview
  const handleStartCompanyMock = (companyName: string) => {
    setActiveTab('mock');
  };

  const handleAddEvent = (evt: any) => {
    setScheduledEvents(prev => [evt, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0c0e17] text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Platform Header & Navigation Tabs */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#434656]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#0052ff]/20 text-[#4cd7f6] border border-[#0052ff]/40 shadow-lg shadow-[#0052ff]/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold font-geist text-white">Interview Intelligence Platform</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0052ff]/20 text-[#4cd7f6] font-mono text-[10px] font-bold border border-[#0052ff]/30">
                  AI Engine v3.6
                </span>
              </div>
              <p className="text-xs text-[#c3c5d9] mt-0.5">
                AI-powered mock interviews, 21+ company guides, coding sandbox, system design & STAR storytelling.
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAiCoachOpen(true)}
              className="px-4 py-2 bg-[#571bc1]/20 hover:bg-[#571bc1]/30 text-[#d0bcff] rounded-xl text-xs font-mono font-bold border border-[#571bc1]/40 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#d0bcff]" />
              Ask AI Coach
            </button>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Schedule Event
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs Bar */}
        <div className="flex overflow-x-auto gap-2 scrollbar-none pt-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'mock', label: 'AI Mock Interview', icon: Play },
            { id: 'companies', label: 'Company Guides', icon: Building2 },
            { id: 'coding', label: 'Coding Practice', icon: Code },
            { id: 'behavioral', label: 'HR & STAR', icon: MessageSquare },
            { id: 'system-design', label: 'System Design', icon: Layers },
            { id: 'roadmap', label: 'Study Roadmap', icon: Calendar },
            { id: 'achievements', label: 'Achievements', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#0052ff] text-white shadow-lg shadow-[#0052ff]/25' 
                    : 'bg-[#11131c] text-[#c3c5d9] hover:bg-[#282934] hover:text-white border border-[#434656]/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8d90a2]'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic View Rendering */}
      <div>
        {activeTab === 'dashboard' && (
          <InterviewDashboardTab
            user={user}
            applications={applications}
            resumeData={versions[0]}
            readinessScore={readinessScore}
            mocksCompletedCount={mocksCompleted}
            codingSolvedCount={codingSolved}
            behavioralPracticedCount={behavioralPracticed}
            streakDays={streakDays}
            xpPoints={xpPoints}
            weakAreas={weakAreas}
            strongAreas={strongAreas}
            upcomingEvents={scheduledEvents}
            onSelectTab={(tab) => setActiveTab(tab as any)}
            onStartMockInterview={() => setActiveTab('mock')}
            onScheduleInterviewModal={() => setIsScheduleModalOpen(true)}
          />
        )}

        {activeTab === 'mock' && (
          <AiMockInterviewTab
            user={user}
            resumeData={versions[0]}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {activeTab === 'companies' && (
          <CompanyPrepTab
            onStartCompanyMock={handleStartCompanyMock}
          />
        )}

        {activeTab === 'coding' && (
          <CodingPracticeTab />
        )}

        {activeTab === 'behavioral' && (
          <HrBehavioralTab />
        )}

        {activeTab === 'system-design' && (
          <SystemDesignTab />
        )}

        {activeTab === 'roadmap' && (
          <StudyPlanTab />
        )}

        {activeTab === 'achievements' && (
          <GamificationProgressTab
            streakDays={streakDays}
            xpPoints={xpPoints}
            readinessScore={readinessScore}
          />
        )}
      </div>

      {/* AI Coach Floating Drawer */}
      <AiCoachDrawer
        isOpen={isAiCoachOpen}
        onClose={() => setIsAiCoachOpen(false)}
      />

      {/* Schedule Interview Event Modal */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
};
