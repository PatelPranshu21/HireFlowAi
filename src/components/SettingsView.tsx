import React, { useState } from 'react';
import { UserProfile, JobPreferences } from '../types';
import { User, CreditCard, Clock, Sliders, Check, Sparkles, ShieldCheck, Bell, DollarSign, Calendar, FileText } from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

const TIMEZONE_OPTIONS = [
  'America/Los_Angeles (Pacific Time - UTC-7)',
  'America/Denver (Mountain Time - UTC-6)',
  'America/Chicago (Central Time - UTC-5)',
  'America/New_York (Eastern Time - UTC-4)',
  'Europe/London (GMT / BST - UTC+1)',
  'Europe/Paris (CET - UTC+2)',
  'Asia/Tokyo (JST - UTC+9)',
  'Asia/Kolkata (IST - UTC+5:30)',
  'UTC (Coordinated Universal Time)'
];

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser }) => {
  // Profile state
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [title, setTitle] = useState(user.title || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [timezone, setTimezone] = useState(user.timezone || TIMEZONE_OPTIONS[0]);

  // Preferences state
  const [preferences, setPreferences] = useState<JobPreferences>({
    preferredRoles: user.preferences?.preferredRoles || ['Software Engineer'],
    preferredCompanies: user.preferences?.preferredCompanies || [],
    preferredCities: user.preferences?.preferredCities || ['Remote'],
    remotePreference: user.preferences?.remotePreference || 'Remote',
    expectedSalaryMin: user.preferences?.expectedSalaryMin || 120000,
    expectedSalaryMax: user.preferences?.expectedSalaryMax || 180000,
    experienceLevel: user.preferences?.experienceLevel || 'Mid Level',
    preferredTechnologies: user.preferences?.preferredTechnologies || ['React', 'TypeScript', 'Node.js'],
    preferredIndustries: user.preferences?.preferredIndustries || ['Technology']
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    atsUpdates: true,
    interviewReminders: true,
    dailyBriefings: true
  });

  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      email,
      title,
      phone,
      timezone,
      preferences
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const formattedNextBilling = user.nextBillingDate 
    ? new Date(user.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Aug 29, 2026';

  return (
    <div className="flex-1 p-6 md:p-8 max-w-[1280px] mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold font-geist text-[#e1e1ef]">Account Settings & Preferences</h2>
        <p className="text-sm text-[#c3c5d9] font-mono mt-1">
          Authenticated User: <span className="text-[#4cd7f6] font-semibold">{user.email}</span> • ID: <span className="text-[#8d90a2]">{user.id}</span>
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Section 1: Name, Email, Profile & Timezone (Col 7) */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-geist text-white mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-[#4cd7f6]" /> Profile & Identity
              </h3>

              <div className="space-y-4 text-sm text-[#e1e1ef]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Full Name</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff] font-geist"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Email Address</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff] font-geist"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Target Professional Title</label>
                    <input 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff] font-geist"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Phone Number</label>
                    <input 
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff] font-geist"
                    />
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-xs font-mono text-[#c3c5d9] mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#4cd7f6]" /> Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff] font-geist cursor-pointer"
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Preferences */}
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-geist text-white mb-5 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#b7c4ff]" /> Career & AI Preferences
              </h3>

              <div className="space-y-4 text-sm text-[#e1e1ef]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Preferred Roles (comma separated)</label>
                    <input 
                      type="text"
                      value={preferences.preferredRoles.join(', ')}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        preferredRoles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff] font-geist"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Remote Work Preference</label>
                    <select
                      value={preferences.remotePreference}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        remotePreference: e.target.value as any
                      })}
                      className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff] font-geist cursor-pointer"
                    >
                      <option value="Remote">Remote Only</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                      <option value="Any">Any Location</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#c3c5d9] mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-green-400" /> Expected Minimum Salary ($/yr)
                    </label>
                    <input 
                      type="number"
                      value={preferences.expectedSalaryMin}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        expectedSalaryMin: Number(e.target.value) || 0
                      })}
                      className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#c3c5d9] mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-green-400" /> Expected Maximum Salary ($/yr)
                    </label>
                    <input 
                      type="number"
                      value={preferences.expectedSalaryMax}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        expectedSalaryMax: Number(e.target.value) || 0
                      })}
                      className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff] font-mono"
                    />
                  </div>
                </div>

                {/* Notifications Preferences */}
                <div className="pt-2 border-t border-[#434656]/20">
                  <h4 className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#d0bcff]" /> Notification Preferences
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2.5 bg-[#0c0e17] p-3 rounded-xl border border-[#434656]/30 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={notifications.emailAlerts}
                        onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                        className="rounded border-[#434656] text-[#0052ff] focus:ring-0"
                      />
                      <span className="text-xs text-white">Email High-Match Job Alerts</span>
                    </label>

                    <label className="flex items-center gap-2.5 bg-[#0c0e17] p-3 rounded-xl border border-[#434656]/30 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={notifications.atsUpdates}
                        onChange={(e) => setNotifications({ ...notifications, atsUpdates: e.target.checked })}
                        className="rounded border-[#434656] text-[#0052ff] focus:ring-0"
                      />
                      <span className="text-xs text-white">ATS Score Boost Updates</span>
                    </label>

                    <label className="flex items-center gap-2.5 bg-[#0c0e17] p-3 rounded-xl border border-[#434656]/30 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={notifications.interviewReminders}
                        onChange={(e) => setNotifications({ ...notifications, interviewReminders: e.target.checked })}
                        className="rounded border-[#434656] text-[#0052ff] focus:ring-0"
                      />
                      <span className="text-xs text-white">Interview Calendar Reminders</span>
                    </label>

                    <label className="flex items-center gap-2.5 bg-[#0c0e17] p-3 rounded-xl border border-[#434656]/30 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={notifications.dailyBriefings}
                        onChange={(e) => setNotifications({ ...notifications, dailyBriefings: e.target.checked })}
                        className="rounded border-[#434656] text-[#0052ff] focus:ring-0"
                      />
                      <span className="text-xs text-white">AI Daily Briefing Modal</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono font-bold text-xs px-8 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0052ff]/20 transition-all"
              >
                {saved ? <Check className="w-4 h-4 text-green-400" /> : <Sparkles className="w-4 h-4 text-[#4cd7f6]" />}
                {saved ? 'Saved Profile & Preferences!' : 'Save Profile & Preferences'}
              </button>
            </div>
          </div>

          {/* Section 3: Subscription, Plan & Billing (Col 5) */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Subscription & Active Plan */}
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-geist text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#d0bcff]" /> Subscription & Plan
              </h3>

              <div className="bg-[#11131c] border border-[#571bc1]/40 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-mono text-[#8d90a2] block uppercase tracking-wider">Current Plan</span>
                    <h4 className="text-xl font-bold font-geist text-[#b7c4ff] mt-0.5">{user.subscriptionPlan || user.tier || 'Pro Plan'}</h4>
                  </div>
                  <span className="bg-[#571bc1] text-white px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-green-400" />
                    {user.subscriptionStatus === 'trialing' ? 'Active Trial' : 'Active'}
                  </span>
                </div>

                <div className="text-xs text-[#c3c5d9] space-y-1.5 pt-2 border-t border-[#434656]/30">
                  <div className="flex justify-between">
                    <span className="text-[#8d90a2]">Subscription Status:</span>
                    <span className="font-mono text-white capitalize">{user.subscriptionStatus || 'active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8d90a2]">Next Renewal Date:</span>
                    <span className="font-mono text-white">{formattedNextBilling}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8d90a2]">Included Audits:</span>
                    <span className="font-mono text-green-400 font-bold">Unlimited Scans</span>
                  </div>
                </div>
              </div>

              {/* Plan Capabilities */}
              <div className="mt-4 space-y-2 text-xs text-[#c3c5d9]">
                <p className="font-mono text-[#8d90a2] text-[11px] uppercase tracking-wider">Included Capabilities:</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 bg-[#0c0e17] p-2.5 rounded-lg border border-[#434656]/20">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span>Instant ATS Resume Parsing & Bullet Rewriter</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0c0e17] p-2.5 rounded-lg border border-[#434656]/20">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span>Real-time High-Match Job Opportunities</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0c0e17] p-2.5 rounded-lg border border-[#434656]/20">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span>AI Mock Technical & STAR Behavioral Interviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-geist text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" /> Billing History
              </h3>

              {user.transactionHistory && user.transactionHistory.length > 0 ? (
                <div className="space-y-3">
                  {user.transactionHistory.map((tx) => (
                    <div key={tx.id} className="bg-[#11131c] border border-[#434656]/30 p-3.5 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-white">{tx.planName}</div>
                        <div className="text-[10px] font-mono text-[#8d90a2]">{tx.date} • {tx.invoiceNumber}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-green-400">${tx.amount}</div>
                        <span className="text-[10px] font-mono text-[#4cd7f6]">{tx.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#11131c] border border-[#434656]/30 p-4 rounded-xl text-xs text-[#c3c5d9] space-y-2">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-[#8d90a2]">Payment Method:</span>
                    <span className="text-white font-bold">Visa ending in •••• 4242</span>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-[#8d90a2]">Billing Cycle:</span>
                    <span className="text-white">Monthly Auto-renew</span>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-[#8d90a2]">Last Statement:</span>
                    <span className="text-green-400 font-bold">$0.00 (Active Free Access)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Gemini Status */}
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5">
              <h4 className="text-xs font-bold font-geist text-white mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#4cd7f6]" /> AI Provider Integration
              </h4>
              <p className="text-xs font-mono text-green-400 flex items-center gap-1">
                ✓ Server-side GEMINI_API_KEY injected & active.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

