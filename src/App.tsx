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
import { UserService } from './services/userService';
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
import { LimitReachedModal } from './components/LimitReachedModal';
import { EntitlementCheckResult } from './data/planConfig';

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

  // Auth state
  const { state: authState, login, logout, selectPlan } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authState.isAuthenticated);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authState.isAuthenticated);
  }, [authState.isAuthenticated]);

  // Protected route navigation wrapper
  const handleNavigate = (tab: NavigationTab | 'create-account', updateHash: boolean = true, isAuthOverride: boolean = false) => {
    const targetTab: NavigationTab = (tab === 'create-account' || (tab as string) === 'signup') ? 'signup' : (tab as NavigationTab);

    const protectedTabs: NavigationTab[] = [
      'dashboard', 'resume-suite', 'job-suite', 'interviews', 
      'career-tools', 'calendar', 'settings', 'admin', 
      'support', 'profile', 'billing', 'onboarding', 'pricing', 'checkout'
    ];

    // Guard 1: Unauthenticated users accessing protected routes -> redirect to login
    if (!isAuthOverride && !authState.isAuthenticated && protectedTabs.includes(targetTab)) {
      setAuthRedirectMessage('Please sign in to access your HireFlow AI dashboard.');
      setCurrentTab('login');
      if (updateHash) {
        window.location.hash = 'login';
        window.history.replaceState(null, '', '/login');
      }
      return;
    }

    // Guard 2: Authenticated users accessing public auth pages or landing -> redirect to dashboard
    if (authState.isAuthenticated && (targetTab === 'login' || targetTab === 'signup' || (tab as string) === 'create-account' || targetTab === 'landing')) {
      setCurrentTab('dashboard');
      if (updateHash) {
        window.location.hash = 'dashboard';
        window.history.replaceState(null, '', '/dashboard');
      }
      return;
    }

    setAuthRedirectMessage('');
    setCurrentTab(targetTab);
    if (updateHash) {
      window.location.hash = targetTab;
      window.history.replaceState(null, '', `/${targetTab === 'landing' ? '' : targetTab}`);
    }
    setIsMobileMenuOpen(false);
  };

  // Route guard for setup & onboarding flow
  useEffect(() => {
    if (!authState.isLoading && authState.isAuthenticated && profile) {
      const hasSelected = Boolean(profile.hasSelectedPlan) || (profile.subscriptionPlan && profile.subscriptionPlan !== 'None');
      const hasCompleted = Boolean(profile.hasCompletedOnboarding);

      if (hasCompleted) {
        if (currentTab === 'onboarding') {
          handleNavigate('dashboard');
        }
      } else if (!hasSelected) {
        // New user has not selected a plan yet -> enforce Plan Selection
        if (['dashboard', 'resume-suite', 'job-suite', 'interviews', 'career-tools', 'calendar', 'settings', 'admin', 'support', 'profile', 'billing', 'onboarding'].includes(currentTab)) {
          handleNavigate('pricing');
        }
      } else {
        // Selected plan, but not completed onboarding -> enforce Onboarding
        if (['dashboard', 'resume-suite', 'job-suite', 'interviews', 'career-tools', 'calendar', 'settings', 'admin', 'support', 'profile', 'billing'].includes(currentTab)) {
          handleNavigate('onboarding');
        }
      }
    }
  }, [authState.isLoading, authState.isAuthenticated, profile?.hasCompletedOnboarding, profile?.hasSelectedPlan, profile?.subscriptionPlan, currentTab]);

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

  const [limitModal, setLimitModal] = useState<{
    isOpen: boolean;
    entitlement: EntitlementCheckResult | null;
  }>({ isOpen: false, entitlement: null });

  useEffect(() => {
    (window as any).__showLimitReachedModal = (entitlement: EntitlementCheckResult) => {
      setLimitModal({ isOpen: true, entitlement });
    };
  }, []);

  // Handle OAuth 2.0 callback redirect parameters (#oauth_callback?token=...&tab=...&onboarding=...)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('oauth_callback')) {
      const queryString = hash.split('?')[1] || '';
      const params = new URLSearchParams(queryString);
      const token = params.get('token');
      const tabParam = params.get('tab') as NavigationTab;

      if (token) {
        UserService.setAuthToken(token);
        UserService.getCurrentUserApi().then((res) => {
          if (res.success && res.user) {
            setIsAuthenticated(true);
            login(res.user.profile);
            updateProfileDetails(res.user.profile);

            const hasSelected = Boolean(res.user.profile?.hasSelectedPlan) || (res.user.profile?.subscriptionPlan && res.user.profile.subscriptionPlan !== 'None');
            const targetTab = tabParam || (res.user.onboardingCompleted ? 'dashboard' : (hasSelected ? 'onboarding' : 'pricing'));
            handleNavigate(targetTab, true, true);
          }
        }).catch(() => {});
      }
    }
  }, [login, updateProfileDetails]);

  // Sync tab with URL hash / pathname
  useEffect(() => {
    if (authState.isLoading) return;

    const handleLocationChange = () => {
      let route = window.location.hash.replace('#', '');
      if (!route || route.startsWith('/')) {
        const path = window.location.pathname.replace(/^\//, '');
        if (path) route = path;
      }
      if (route.includes('oauth_callback')) return;

      const validTabs = [
        'landing', 'login', 'signup', 'create-account', 'pricing', 'checkout', 'onboarding',
        'dashboard', 'resume-suite', 'job-suite', 'interviews', 'career-tools', 'calendar', 
        'settings', 'admin', 'support', 'profile', 'billing'
      ];

      if (validTabs.includes(route)) {
        handleNavigate(route as any, false);
      } else if (!route || route === '') {
        if (authState.isAuthenticated) {
          handleNavigate('dashboard', false);
        } else {
          handleNavigate('landing', false);
        }
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [authState.isAuthenticated, authState.isLoading]);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    handleNavigate('login');
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
      // NEW USER FLOW: Landing -> Create Account -> Plan Selection -> Onboarding -> Dashboard
      handleNavigate('pricing');
    } else {
      const activeProfile = userProfile || profile;
      const completed = activeProfile ? Boolean(activeProfile.hasCompletedOnboarding) : false;
      const hasSelected = activeProfile ? (Boolean(activeProfile.hasSelectedPlan) || (activeProfile.subscriptionPlan && activeProfile.subscriptionPlan !== 'None')) : false;

      if (completed) {
        handleNavigate('dashboard');
      } else if (!hasSelected) {
        handleNavigate('pricing');
      } else {
        handleNavigate('onboarding');
      }
    }
  };

  // Subscription Plan Handlers
  const handleSelectTrial = async () => {
    await selectPlan('3-Day Free Trial');
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

    if (!profile?.hasCompletedOnboarding) {
      handleNavigate('onboarding');
    } else {
      handleNavigate('dashboard');
    }
  };

  const handleSelectPaidPlan = (planName: 'Basic' | 'Pro' | 'Premium', price: number, billingCycle: 'monthly' | 'yearly') => {
    setSelectedCheckoutPlan({ name: planName, price, billingCycle });
    handleNavigate('checkout');
  };

  const handlePaymentSuccess = async (planName: 'Basic' | 'Pro' | 'Premium', transaction: TransactionItem) => {
    await selectPlan(planName);
    updateProfileDetails({
      tier: planName === 'Pro' ? 'Gold Tier' : (planName === 'Premium' ? 'Premium Plan' : 'Basic'),
      subscriptionPlan: planName,
      subscriptionStatus: 'active',
      hasSelectedPlan: true,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      transactionHistory: [transaction, ...(profile?.transactionHistory || [])]
    });

    addNotification({
      title: 'Subscription activated',
      message: `Your ${planName} Plan subscription has been activated! All premium AI features are now unlocked.`,
      type: 'success'
    });

    if (!profile?.hasCompletedOnboarding) {
      handleNavigate('onboarding');
    } else {
      handleNavigate('dashboard');
    }
  };

  // Authentication Loading State Handler
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-white/60">Verifying session...</span>
        </div>
      </div>
    );
  }

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

      {/* Limit Reached & Trial Expiry Modal */}
      <LimitReachedModal
        isOpen={limitModal.isOpen}
        entitlement={limitModal.entitlement}
        onClose={() => setLimitModal({ isOpen: false, entitlement: null })}
        onUpgrade={() => {
          setLimitModal({ isOpen: false, entitlement: null });
          handleNavigate('billing');
        }}
      />

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
