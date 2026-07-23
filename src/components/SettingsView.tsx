import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, CreditCard, Key, Shield, Check, Sparkles } from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, title, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 p-8 max-w-[1280px] mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-geist text-[#e1e1ef]">Account Settings</h2>
        <p className="text-sm text-[#c3c5d9] font-mono mt-1">Manage profile information, AI preferences, and subscription tier.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Profile Info (7 cols) */}
        <div className="col-span-12 lg:col-span-7 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold font-geist text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-[#4cd7f6]" /> Personal Profile
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-sm text-[#e1e1ef]">
            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Full Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-3 text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Target Professional Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-3 text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Email Address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-3 text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit"
                className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer"
              >
                {saved ? <Check className="w-4 h-4 text-green-400" /> : null}
                {saved ? 'Saved Changes' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Plan & Billing (5 cols) */}
        <div className="col-span-12 lg:col-span-5 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold font-geist text-white mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#d0bcff]" /> Current Plan
            </h3>
            <div className="bg-[#11131c] border border-[#571bc1]/40 rounded-xl p-4 mt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold font-geist text-[#b7c4ff]">{user.tier}</span>
                <span className="bg-[#571bc1] text-white px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold">Active</span>
              </div>
              <p className="text-xs text-[#c3c5d9]">Includes unlimited AI resume rewrites, unlimited job description matching, and 50 mock interview credits / mo.</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold font-geist text-white mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#4cd7f6]" /> AI Provider Key status
            </h3>
            <p className="text-xs font-mono text-green-400 flex items-center gap-1">
              ✓ Server-side GEMINI_API_KEY injected automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
