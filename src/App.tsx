import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  UserProfile, 
  TaskItem, 
  JobRecommendation, 
  ActivityLog, 
  ResumeAnalysisResult, 
  ResumeVersion, 
  ApplicationCard, 
  NotificationItem,
  TransactionItem 
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

import { EcosystemProvider, useEcosystem } from './context/EcosystemContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AiCareerCoachWidget } from './components/AiCareerCoachWidget';
import { DailyBriefingModal } from './components/DailyBriefingModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { PricingView } from './components/PricingView';
import { CheckoutView } from './components/CheckoutView';
import { OnboardingWizardView } from './components/OnboardingWizardView';
import { TrialBanner } from './components/TrialBanner';
import { SideNavBar, TopNavBar } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ResumeSuiteView } from './components/ResumeSuiteView';
import { JobSuiteView } from './components/JobSuiteView';
import { InterviewsView } from './components/InterviewsView';
import { CareerToolsView } from './components/CareerToolsView';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { AdminView } from './components/AdminView';
import { SupportView } from './components/SupportView';
import { ProfileView } from './components/ProfileView';
import { BillingView } from './components/BillingView';
import { NotificationsModal } from './components/NotificationsModal';

function MainAppContent() {
  const {
    profile,
    tasks,
    recommendations,
    activities,
    applications,
    notifications,
    setIsGlobalSearchOpen,
    setIsDailyBriefingOpen,
    uploadResume,
    applyBulletSuggestion,
    updateProfileDetails,
    markAllNotificationsRead,
    addNotification
  } = useEcosystem();

  // Expose global modal triggers for top nav search bar & briefing button
  useEffect(() => {
    (window as any).__openGlobalSearch = () => setIsGlobalSearchOpen(true);
    (window as any).__openDailyBriefing = () => setIsDailyBriefingOpen(true);
  }, [setIsGlobalSearchOpen, setIsDailyBriefingOpen]);

  // Auth state - default to authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Subscription Checkout State
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{
    name: 'Basic' | 'Pro' | 'Premium';
    price: number;
    billingCycle: 'monthly' | 'yearly';
  }>({
    name: 'Pro',
    price: 19,
    billingCycle: 'monthly'
  });

  const userVersions = profile.resumeVersions || [];
  const [analysis] = useState<ResumeAnalysisResult>(defaultResumeAnalysis);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [authRedirectMessage, setAuthRedirectMessage] = useState<string>('');

  // Sync tab with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavigationTab;
      if (hash && [
        'landing', 'login', 'signup', 'pricing', 'checkout', 'dashboard', 'resume-suite', 
        'job-suite', 'interviews', 'career-tools', 'calendar', 
        'settings', 'admin', 'support', 'profile', 'billing'
      ].includes(hash)) {
        handleNavigate(hash, false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  // Protected route navigation wrapper
  const handleNavigate = (tab: NavigationTab, updateHash: boolean = true) => {
    const protectedTabs: NavigationTab[] = [
      'dashboard', 'resume-suite', 'job-suite', 'interviews', 
      'career-tools', 'calendar', 'settings', 'admin', 
      'support', 'profile', 'billing'
    ];

    if (!isAuthenticated && protectedTabs.includes(tab)) {
      setAuthRedirectMessage('Please sign in to access your HireFlow AI dashboard.');
      setCurrentTab('login');
      if (updateHash) window.location.hash = 'login';
      return;
    }

    setAuthRedirectMessage('');
    setCurrentTab(tab);
    if (updateHash) {
      window.location.hash = tab;
    }
    setIsMobileMenuOpen(false);
  };

  const { state: authState, login, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    handleNavigate('landing');
  };

  const handleLoginSuccess = (userProfile?: UserProfile, isNewAccount: boolean = false) => {
    setIsAuthenticated(true);
    if (userProfile) {
      login(userProfile);
      updateProfileDetails(userProfile);
    } else {
      login();
    }
    
    if (isNewAccount) {
      handleNavigate('pricing');
    } else {
      updateProfileDetails({
        hasCompletedOnboarding: true,
        hasSelectedPlan: true
      });
      handleNavigate('dashboard');
    }
  };

  // Subscription Plan Handlers
  const handleSelectTrial = () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Exactly 3 days (72 hours) from now

    updateProfileDetails({
      tier: '3-Day Free Trial',
      subscriptionPlan: '3-Day Free Trial',
      subscriptionStatus: 'trialing',
      trialStartDate: now.toISOString(),
      trialExpiryDate: expiry.toISOString(),
      hasSelectedPlan: true
    });

    addNotification({
      title: '3-Day Free Trial Activated',
      message: 'Your 3-Day Free Trial is active and will expire after 3 days. Enjoy full access to ATS scoring & AI matchers.',
      type: 'success'
    });

    if (!profile.hasCompletedOnboarding) {
      handleNavigate('onboarding');
    } else {
      handleNavigate('dashboard');
    }
  };

  const handleSelectPaidPlan = (planName: 'Basic' | 'Pro' | 'Premium', price: number, billingCycle: 'monthly' | 'yearly') => {
    setSelectedCheckoutPlan({ name: planName, price, billingCycle });
    handleNavigate('checkout');
  };

  const handlePaymentSuccess = (planName: 'Basic' | 'Pro' | 'Premium', transaction: TransactionItem) => {
    updateProfileDetails({
      tier: planName === 'Pro' ? 'Gold Tier' : (planName === 'Premium' ? 'Premium Plan' : 'Basic'),
      subscriptionPlan: planName,
      subscriptionStatus: 'active',
      hasSelectedPlan: true,
      nextBillingDate: '2026-08-25',
      transactionHistory: [transaction, ...(profile.transactionHistory || [])]
    });

    addNotification({
      title: 'Subscription activated',
      message: `Your ${planName} Plan subscription has been activated! All premium AI features are now unlocked.`,
      type: 'success'
    });

    if (!profile.hasCompletedOnboarding) {
      handleNavigate('onboarding');
    } else {
      handleNavigate('dashboard');
    }
  };

  // Render Unauthenticated Views (Landing, Login, Signup)
  if (currentTab === 'landing') {
    return (
      <LandingPage 
        onStartForFree={() => handleNavigate('login')} 
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentTab === 'login' || currentTab === 'signup') {
    return (
      <AuthView 
        mode={currentTab}
        onNavigate={handleNavigate}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // If user is unauthenticated or profile is null, force login screen
  if (!authState.isAuthenticated || !authState.profile) {
    return (
      <AuthView 
        mode="login"
        onNavigate={handleNavigate}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentTab === 'pricing') {
    return (
      <PricingView
        user={profile}
        onSelectTrial={handleSelectTrial}
        onSelectPaidPlan={handleSelectPaidPlan}
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentTab === 'checkout') {
    return (
      <CheckoutView
        user={profile}
        selectedPlan={selectedCheckoutPlan}
        onPaymentSuccess={handlePaymentSuccess}
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentTab === 'onboarding') {
    return (
      <OnboardingWizardView
        user={profile}
        onUpdateUser={updateProfileDetails}
        onNavigate={handleNavigate}
        onUploadResumeFile={async (file: File) => {
          let text = '';
          try {
            text = await file.text();
          } catch (e) {
            text = `Resume Content from ${file.name}\nSkills & Experience extracted successfully.`;
          }
          if (!text || text.trim().length === 0) {
            text = `Resume Content from ${file.name}\nSkills & Experience extracted successfully.`;
          }
          uploadResume(text, file.name);
          updateProfileDetails({ hasUploadedResume: true });
        }}
      />
    );
  }

  // Render Authenticated App Layout
  return (
    <div className="bg-[#11131c] text-[#e1e1ef] font-sans min-h-screen flex antialiased relative">
      {/* Sidebar Navigation */}
      <SideNavBar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        user={profile}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onAnalyzeResumeClick={() => handleNavigate('resume-suite')}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Container - md:pl-64 prevents sidebar overlapping! */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Trial Expiration Banner */}
        <TrialBanner user={profile} onNavigate={handleNavigate} />

        <TopNavBar
          currentTab={currentTab}
          onSelectTab={handleNavigate}
          user={profile}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onAnalyzeResumeClick={() => handleNavigate('resume-suite')}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              user={profile}
              tasks={tasks}
              onToggleTask={() => {}}
              recommendations={recommendations}
              activities={activities}
              onNavigateTab={handleNavigate}
              onAnalyzeResumeClick={() => handleNavigate('resume-suite')}
              onUpdateUser={updateProfileDetails}
            />
          )}

          {currentTab === 'resume-suite' && (
            <ResumeSuiteView
              user={profile}
              analysis={analysis}
              versions={userVersions}
              onUploadResume={uploadResume}
              onApplyBulletSuggestion={applyBulletSuggestion}
              onSelectJobHubTab={() => handleNavigate('job-suite')}
            />
          )}

          {currentTab === 'job-suite' && (
            <JobSuiteView
              applications={applications}
              onUpdateStatus={() => {}}
              onAddApplication={() => {}}
              resumeText={profile.resumeText || userVersions[0]?.content || ''}
              user={profile}
              onUpdateUser={updateProfileDetails}
              onNavigateTab={handleNavigate}
              onUploadResume={uploadResume}
              notifications={notifications}
              onAddNotification={() => {}}
            />
          )}

          {currentTab === 'interviews' && (
            <InterviewsView
              user={profile}
              applications={applications}
              versions={userVersions}
            />
          )}

          {currentTab === 'career-tools' && (
            <CareerToolsView 
              user={profile} 
              onNavigateTab={handleNavigate}
              onUploadResumeClick={() => handleNavigate('resume-suite')}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView />
          )}

          {currentTab === 'profile' && (
            <ProfileView 
              user={profile} 
              onUpdateUser={updateProfileDetails} 
              onNavigateTab={handleNavigate} 
            />
          )}

          {currentTab === 'billing' && (
            <BillingView 
              user={profile} 
              onUpdateUser={updateProfileDetails} 
            />
          )}

          {currentTab === 'support' && (
            <SupportView />
          )}

          {currentTab === 'settings' && (
            <SettingsView user={profile} onUpdateUser={updateProfileDetails} />
          )}

          {currentTab === 'admin' && (
            <AdminView />
          )}
        </main>
      </div>

      {/* Persistent Global Ecosystem Modals & Widgets */}
      <AiCareerCoachWidget />
      <DailyBriefingModal />
      <GlobalSearchModal />

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllRead={markAllNotificationsRead}
        />
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  return (
    <AuthProvider>
      <EcosystemProvider onNavigateTab={(tab) => {
        setActiveTab(tab);
        window.location.hash = tab;
      }}>
        <MainAppContent />
      </EcosystemProvider>
    </AuthProvider>
  );
}
