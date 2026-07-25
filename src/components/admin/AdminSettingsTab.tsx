import React, { useState } from 'react';
import { Settings, Shield, Key, Eye, EyeOff, Save, CheckCircle2, AlertOctagon } from 'lucide-react';

export const AdminSettingsTab: React.FC = () => {
  const [showKey, setShowKey] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('sk_live_hireflow_gemini_prod_89a3x9102');
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {savedToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl font-mono flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> System settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-6">
        <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#0052ff]" /> Ecosystem System Configuration
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[#c3c5d9] mb-1">Production Gemini API Secret Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0052ff]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d90a2] hover:text-white cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-[#0c0e17] p-4 rounded-xl border border-red-500/30 flex justify-between items-center">
            <div>
              <div className="font-bold text-white flex items-center gap-1.5 text-red-400">
                <AlertOctagon className="w-4 h-4" /> Emergency Maintenance Mode
              </div>
              <p className="text-[11px] text-[#8d90a2] mt-0.5">Restrict non-admin access and show maintenance banner across all candidate apps.</p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-5 h-5 accent-red-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <button type="submit" className="px-5 py-2.5 bg-[#0052ff] hover:bg-blue-600 text-white font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-md">
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </form>
    </div>
  );
};
