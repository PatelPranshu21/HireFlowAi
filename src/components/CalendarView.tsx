import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  LayoutDashboard,
  Sparkles,
  CheckSquare,
  FileText,
  Target,
  Zap,
  BarChart3,
  Share2,
  Settings
} from 'lucide-react';
import { ProductivityDashboardTab } from './productivity/ProductivityDashboardTab';
import { SmartCalendarTab } from './productivity/SmartCalendarTab';
import { AiPlannerTab } from './productivity/AiPlannerTab';
import { TaskManagerTab } from './productivity/TaskManagerTab';
import { NotesSystemTab } from './productivity/NotesSystemTab';
import { GoalsTab } from './productivity/GoalsTab';
import { FocusModeTab } from './productivity/FocusModeTab';
import { ProductivityAnalyticsTab } from './productivity/ProductivityAnalyticsTab';
import { CollaborationIntegrationsTab } from './productivity/CollaborationIntegrationsTab';
import { ProductivitySettingsTab } from './productivity/ProductivitySettingsTab';

export const CalendarView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'calendar' | 'ai-planner' | 'tasks' | 'notes' | 'goals' | 'focus-mode' | 'analytics' | 'integrations' | 'settings'
  >('dashboard');

  const navTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'calendar', label: 'Smart Calendar', icon: CalendarIcon },
    { id: 'ai-planner', label: 'AI Planner', icon: Sparkles },
    { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
    { id: 'notes', label: 'Notes & Prep', icon: FileText },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'focus-mode', label: 'Focus Mode', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      {/* Sub Navigation Bar */}
      <div className="bg-[#191b25] border border-[#434656]/30 p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-lg">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#0052ff] text-white shadow-md'
                  : 'text-[#c3c5d9] hover:text-white hover:bg-[#252836]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#c3c5d9]'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active SubTab Component Content */}
      <div className="transition-all duration-200">
        {activeTab === 'dashboard' && <ProductivityDashboardTab onSelectSubTab={tab => setActiveTab(tab as any)} />}
        {activeTab === 'calendar' && <SmartCalendarTab />}
        {activeTab === 'ai-planner' && <AiPlannerTab />}
        {activeTab === 'tasks' && <TaskManagerTab />}
        {activeTab === 'notes' && <NotesSystemTab />}
        {activeTab === 'goals' && <GoalsTab />}
        {activeTab === 'focus-mode' && <FocusModeTab />}
        {activeTab === 'analytics' && <ProductivityAnalyticsTab />}
        {activeTab === 'integrations' && <CollaborationIntegrationsTab />}
        {activeTab === 'settings' && <ProductivitySettingsTab />}
      </div>
    </div>
  );
};
