import React, { useState } from 'react';
import { 
  NavigationTab, 
  UserProfile, 
  TaskItem, 
  JobRecommendation, 
  ActivityLog, 
  ResumeAnalysisResult, 
  ResumeVersion, 
  ApplicationCard, 
  NotificationItem 
} from './types';
import { 
  initialUserProfile, 
  initialTasks, 
  initialJobRecommendations, 
  initialActivityLogs, 
  defaultResumeAnalysis, 
  defaultResumeVersions, 
  initialApplications, 
  sampleNotifications 
} from './data/mockData';

import { LandingPage } from './components/LandingPage';
import { SideNavBar, TopNavBar } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ResumeSuiteView } from './components/ResumeSuiteView';
import { JobSuiteView } from './components/JobSuiteView';
import { InterviewsView } from './components/InterviewsView';
import { CareerToolsView } from './components/CareerToolsView';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { AdminView } from './components/AdminView';
import { NotificationsModal } from './components/NotificationsModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('landing');
  const [user, setUser] = useState<UserProfile>(initialUserProfile);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [recommendations] = useState<JobRecommendation[]>(initialJobRecommendations);
  const [activities, setActivities] = useState<ActivityLog[]>(initialActivityLogs);
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult>(defaultResumeAnalysis);
  const [versions, setVersions] = useState<ResumeVersion[]>(defaultResumeVersions);
  const [applications, setApplications] = useState<ApplicationCard[]>(initialApplications);
  const [notifications, setNotifications] = useState<NotificationItem[]>(sampleNotifications);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Handlers
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updated }));
  };

  const handleUploadResume = (fileText: string, fileName: string) => {
    const newVer: ResumeVersion = {
      id: Date.now().toString(),
      versionName: fileName,
      fileName,
      uploadedAt: 'Just now',
      score: 85,
      content: fileText
    };
    setVersions(prev => [newVer, ...prev]);
    // Optionally trigger analysis
    setAnalysis(prev => ({
      ...prev,
      overallScore: 85,
      summary: `Analyzed ${fileName}. Resume score improved!`
    }));
  };

  const handleApplyBulletSuggestion = (bulletText: string) => {
    setTasks(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: `Applied suggestion: "${bulletText.substring(0, 30)}..."`,
        tag: 'Applied',
        tagColor: '#0052ff',
        completed: true
      }
    ]);
  };

  const handleUpdateApplicationStatus = (id: string, newStatus: ApplicationCard['status']) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    setActivities(prev => [
      {
        id: Date.now().toString(),
        title: `Updated Application Stage to ${newStatus.toUpperCase()}`,
        subtitle: 'Just now',
        timestamp: 'Just now',
        type: 'application'
      },
      ...prev
    ]);
  };

  const handleAddApplication = (newApp: Omit<ApplicationCard, 'id'>) => {
    const created: ApplicationCard = {
      ...newApp,
      id: Date.now().toString()
    };
    setApplications(prev => [created, ...prev]);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // If in landing page view, render LandingPage standalone
  if (currentTab === 'landing') {
    return <LandingPage onStartForFree={() => setCurrentTab('dashboard')} />;
  }

  return (
    <div className="bg-[#11131c] text-[#e1e1ef] font-sans min-h-screen flex antialiased">
      {/* Persistent Side Bar */}
      <SideNavBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onAnalyzeResumeClick={() => setCurrentTab('resume-suite')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          user={user}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onAnalyzeResumeClick={() => setCurrentTab('resume-suite')}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              user={user}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              recommendations={recommendations}
              activities={activities}
              onNavigateTab={setCurrentTab}
              onAnalyzeResumeClick={() => setCurrentTab('resume-suite')}
            />
          )}

          {currentTab === 'resume-suite' && (
            <ResumeSuiteView
              user={user}
              analysis={analysis}
              versions={versions}
              onUploadResume={handleUploadResume}
              onApplyBulletSuggestion={handleApplyBulletSuggestion}
            />
          )}

          {currentTab === 'job-suite' && (
            <JobSuiteView
              applications={applications}
              onUpdateStatus={handleUpdateApplicationStatus}
              onAddApplication={handleAddApplication}
              resumeText={versions[0]?.content || ''}
            />
          )}

          {currentTab === 'interviews' && (
            <InterviewsView />
          )}

          {currentTab === 'career-tools' && (
            <CareerToolsView user={user} />
          )}

          {currentTab === 'calendar' && (
            <CalendarView />
          )}

          {currentTab === 'settings' && (
            <SettingsView user={user} onUpdateUser={handleUpdateUser} />
          )}

          {currentTab === 'admin' && (
            <AdminView />
          )}
        </main>
      </div>

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />
      )}
    </div>
  );
}
