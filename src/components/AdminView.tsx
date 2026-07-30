import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Award, 
  CreditCard, 
  FileText, 
  Building2, 
  Briefcase, 
  Sparkles, 
  BarChart2, 
  MessageSquare, 
  Megaphone, 
  Shield, 
  ShieldAlert, 
  Activity, 
  Mail, 
  Download, 
  Settings,
  LogOut,
  Lock,
  UserCheck
} from 'lucide-react';

// Data and Types
import { 
  initialAdminUsers, 
  initialAdminPlans, 
  initialTransactions, 
  initialGateways, 
  initialContentItems, 
  initialCompaniesAdmin, 
  initialJobsAdmin, 
  initialAiTelemetry, 
  initialSupportTickets, 
  initialAnnouncements, 
  initialAuditLogs, 
  initialSecurityThreats, 
  initialServiceHealth, 
  initialEmailTemplates 
} from '../data/adminMockData';

import { 
  AdminUser, 
  SubscriptionPlanAdmin, 
  PaymentTransactionAdmin, 
  GatewayConfig, 
  ContentItemAdmin, 
  CompanyAdmin, 
  JobAdmin, 
  AiTelemetryData, 
  SupportTicketAdmin, 
  AnnouncementAdmin, 
  EmailTemplateAdmin 
} from '../types/admin';

// Sub-Tab Components
import { AdminDashboardOverview } from './admin/AdminDashboardOverview';
import { UserManagementTab } from './admin/UserManagementTab';
import { SubscriptionManagementTab } from './admin/SubscriptionManagementTab';
import { PaymentManagementTab } from './admin/PaymentManagementTab';
import { ContentManagementTab } from './admin/ContentManagementTab';
import { CompanyManagementTab } from './admin/CompanyManagementTab';
import { JobManagementTab } from './admin/JobManagementTab';
import { AiManagementTab } from './admin/AiManagementTab';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { SupportDashboardTab } from './admin/SupportDashboardTab';
import { AnnouncementsTab } from './admin/AnnouncementsTab';
import { AuditLogsTab } from './admin/AuditLogsTab';
import { SecurityCenterTab } from './admin/SecurityCenterTab';
import { SystemMonitoringTab } from './admin/SystemMonitoringTab';
import { EmailManagementTab } from './admin/EmailManagementTab';
import { ExportCenterTab } from './admin/ExportCenterTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';

export type AdminSubTab = 
  | 'dashboard'
  | 'users'
  | 'subscriptions'
  | 'payments'
  | 'content'
  | 'companies'
  | 'jobs'
  | 'ai'
  | 'analytics'
  | 'support'
  | 'announcements'
  | 'audit'
  | 'security'
  | 'monitoring'
  | 'email'
  | 'exports'
  | 'settings';

export const AdminView: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default logged in for seamless preview
  const [adminUser, setAdminUser] = useState({
    id: 'adm_master_01',
    name: 'Admin Console',
    email: 'admin@hireflow.ai',
    avatar: '',
    role: 'Super Admin' as const,
    twoFactorEnabled: true,
    lastLoginIp: '192.168.1.42',
    sessionExpiresAt: 'In 8 hours'
  });

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin@hireflow.ai');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [loginRole, setLoginRole] = useState<'Super Admin' | 'Admin' | 'Auditor'>('Super Admin');

  // Navigation State
  const [activeTab, setActiveTab] = useState<AdminSubTab>('dashboard');

  // Application Data State
  const [users, setUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [plans, setPlans] = useState<SubscriptionPlanAdmin[]>(initialAdminPlans);
  const [transactions, setTransactions] = useState<PaymentTransactionAdmin[]>(initialTransactions);
  const [gateways, setGateways] = useState<GatewayConfig[]>(initialGateways);
  const [contentItems, setContentItems] = useState<ContentItemAdmin[]>(initialContentItems);
  const [companies, setCompanies] = useState<CompanyAdmin[]>(initialCompaniesAdmin);
  const [jobs, setJobs] = useState<JobAdmin[]>(initialJobsAdmin);
  const [telemetry, setTelemetry] = useState<AiTelemetryData>(initialAiTelemetry);
  const [tickets, setTickets] = useState<SupportTicketAdmin[]>(initialSupportTickets);
  const [announcements, setAnnouncements] = useState<AnnouncementAdmin[]>(initialAnnouncements);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [threats, setThreats] = useState(initialSecurityThreats);
  const [health, setHealth] = useState(initialServiceHealth);
  const [emailTemplates, setEmailTemplates] = useState(initialEmailTemplates);

  // Handlers for Data Mutations
  const handleUpdateUser = (updated: AdminUser) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const handleAddUser = (newU: AdminUser) => {
    setUsers(prev => [newU, ...prev]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleUpdatePlan = (updated: SubscriptionPlanAdmin) => {
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleAddPlan = (newP: SubscriptionPlanAdmin) => {
    setPlans(prev => [...prev, newP]);
  };

  const handleUpdateGateway = (gw: GatewayConfig) => {
    setGateways(prev => prev.map(g => g.id === gw.id ? gw : g));
  };

  const handleProcessRefund = (txId: string) => {
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'Refunded' } : t));
  };

  const handleAddContent = (item: ContentItemAdmin) => {
    setContentItems(prev => [item, ...prev]);
  };

  const handleUpdateContent = (item: ContentItemAdmin) => {
    setContentItems(prev => prev.map(c => c.id === item.id ? item : c));
  };

  const handleDeleteContent = (id: string) => {
    setContentItems(prev => prev.filter(c => c.id !== id));
  };

  const handleAddCompany = (comp: CompanyAdmin) => {
    setCompanies(prev => [comp, ...prev]);
  };

  const handleUpdateCompany = (comp: CompanyAdmin) => {
    setCompanies(prev => prev.map(c => c.id === comp.id ? comp : c));
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const handleAddJob = (job: JobAdmin) => {
    setJobs(prev => [job, ...prev]);
  };

  const handleUpdateJob = (job: JobAdmin) => {
    setJobs(prev => prev.map(j => j.id === job.id ? job : j));
  };

  const handleDeleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleUpdateTelemetry = (updated: Partial<AiTelemetryData>) => {
    setTelemetry(prev => ({ ...prev, ...updated }));
  };

  const handleReplyTicket = (ticketId: string, replyText: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'Pending',
          messages: [
            ...t.messages,
            { id: `msg_${Date.now()}`, sender: 'support', text: replyText, time: 'Just now' }
          ]
        };
      }
      return t;
    }));
  };

  const handleUpdateTicketStatus = (ticketId: string, status: any) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
  };

  const handleAddAnnouncement = (anc: AnnouncementAdmin) => {
    setAnnouncements(prev => [anc, ...prev]);
  };

  const handleUpdateAnnouncement = (anc: AnnouncementAdmin) => {
    setAnnouncements(prev => prev.map(a => a.id === anc.id ? anc : a));
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateEmailTemplate = (tmpl: EmailTemplateAdmin) => {
    setEmailTemplates(prev => prev.map(t => t.id === tmpl.id ? tmpl : t));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminUser({
      id: 'adm_master_01',
      name: 'Alex Vance',
      email: loginEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: loginRole,
      twoFactorEnabled: true,
      lastLoginIp: '192.168.1.42',
      sessionExpiresAt: 'In 8 hours'
    });
    setIsAuthenticated(true);
  };

  // Lock Screen Render
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#13151f] flex items-center justify-center p-4">
        <form onSubmit={handleLoginSubmit} className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#0052ff]/10 border border-[#0052ff]/30 text-[#0052ff] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-geist text-white">HireFlow Admin Suite</h2>
            <p className="text-xs font-mono text-[#8d90a2]">Production Intelligence & Control Portal</p>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[#c3c5d9] mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>

            <div>
              <label className="block text-[#c3c5d9] mb-1">Master Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>

            <div>
              <label className="block text-[#c3c5d9] mb-1">Role Privilege Level</label>
              <select
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value as any)}
                className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff]"
              >
                <option value="Super Admin">Super Admin (Full Read/Write)</option>
                <option value="Admin">Admin (Operations Only)</option>
                <option value="Auditor">Auditor (Read Only Logs)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0052ff] hover:bg-blue-600 text-xs font-bold text-white rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Authenticate Admin Session</span>
          </button>
        </form>
      </div>
    );
  }

  const tabsNavList: { id: AdminSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Candidates', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: Award },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'ai', label: 'AI Telemetry', icon: Sparkles },
    { id: 'analytics', label: 'Analytics BI', icon: BarChart2 },
    { id: 'support', label: 'Support Queue', icon: MessageSquare },
    { id: 'announcements', label: 'Broadcasts', icon: Megaphone },
    { id: 'audit', label: 'Audit Trail', icon: Shield },
    { id: 'security', label: 'Security Firewall', icon: ShieldAlert },
    { id: 'monitoring', label: 'System Health', icon: Activity },
    { id: 'email', label: 'Email Templates', icon: Mail },
    { id: 'exports', label: 'Data Exports', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#13151f] text-[#c3c5d9] p-4 md:p-6 space-y-6">
      {/* Top Bar Header */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0052ff]/10 border border-[#0052ff]/30 text-[#0052ff] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-geist text-white tracking-tight">HireFlow Admin Platform</h1>
              <span className="px-2 py-0.5 bg-[#0052ff]/20 border border-[#0052ff]/30 text-[#0052ff] rounded text-[10px] font-mono font-bold">
                v2.5 PROD
              </span>
            </div>
            <p className="text-xs font-mono text-[#8d90a2]">Ecosystem Intelligence, User Governance & Business Operations</p>
          </div>
        </div>

        {/* Admin Session Profile */}
        <div className="flex items-center gap-3 self-end md:self-auto font-mono text-xs">
          <div className="flex items-center gap-2 bg-[#0c0e17] px-3 py-1.5 rounded-xl border border-[#434656]/30">
            {adminUser.avatar ? (
              <img src={adminUser.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-[#434656]" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                {adminUser.name?.charAt(0) || 'A'}
              </div>
            )}
            <span className="font-bold text-white font-geist">{adminUser.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {adminUser.role}
            </span>
          </div>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="p-2 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer"
            title="Sign Out Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Sub-Tab Navigation Pills */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-2 shadow-md overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabsNavList.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0052ff] text-white font-semibold shadow-md'
                    : 'text-[#8d90a2] hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8d90a2]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Sub-Tab View */}
      <div className="transition-all duration-200">
        {activeTab === 'dashboard' && (
          <AdminDashboardOverview
            users={users}
            plans={plans}
            transactions={transactions}
            telemetry={telemetry}
            onNavigateSubTab={(tab) => setActiveTab(tab as AdminSubTab)}
          />
        )}
        {activeTab === 'users' && (
          <UserManagementTab
            users={users}
            onUpdateUser={handleUpdateUser}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
        {activeTab === 'subscriptions' && (
          <SubscriptionManagementTab
            plans={plans}
            onUpdatePlan={handleUpdatePlan}
            onAddPlan={handleAddPlan}
          />
        )}
        {activeTab === 'payments' && (
          <PaymentManagementTab
            transactions={transactions}
            gateways={gateways}
            onUpdateGateway={handleUpdateGateway}
            onProcessRefund={handleProcessRefund}
          />
        )}
        {activeTab === 'content' && (
          <ContentManagementTab
            contentItems={contentItems}
            onAddContent={handleAddContent}
            onUpdateContent={handleUpdateContent}
            onDeleteContent={handleDeleteContent}
          />
        )}
        {activeTab === 'companies' && (
          <CompanyManagementTab
            companies={companies}
            onAddCompany={handleAddCompany}
            onUpdateCompany={handleUpdateCompany}
            onDeleteCompany={handleDeleteCompany}
          />
        )}
        {activeTab === 'jobs' && (
          <JobManagementTab
            jobs={jobs}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
          />
        )}
        {activeTab === 'ai' && (
          <AiManagementTab
            telemetry={telemetry}
            onUpdateTelemetry={handleUpdateTelemetry}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'support' && (
          <SupportDashboardTab
            tickets={tickets}
            onReplyTicket={handleReplyTicket}
            onUpdateStatus={handleUpdateTicketStatus}
          />
        )}
        {activeTab === 'announcements' && (
          <AnnouncementsTab
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
          />
        )}
        {activeTab === 'audit' && <AuditLogsTab logs={auditLogs} />}
        {activeTab === 'security' && <SecurityCenterTab threats={threats} />}
        {activeTab === 'monitoring' && <SystemMonitoringTab health={health} />}
        {activeTab === 'email' && (
          <EmailManagementTab
            templates={emailTemplates}
            onUpdateTemplate={handleUpdateEmailTemplate}
          />
        )}
        {activeTab === 'exports' && <ExportCenterTab />}
        {activeTab === 'settings' && <AdminSettingsTab />}
      </div>
    </div>
  );
};
