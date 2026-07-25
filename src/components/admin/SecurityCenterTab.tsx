import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Key, 
  Globe, 
  CheckCircle2, 
  AlertOctagon, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { SecurityThreatLog } from '../../types/admin';

interface SecurityCenterTabProps {
  threats: SecurityThreatLog[];
}

export const SecurityCenterTab: React.FC<SecurityCenterTabProps> = ({ threats }) => {
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [blockedIps, setBlockedIps] = useState(['185.220.101.4', '45.142.120.9']);
  const [newIpInput, setNewIpInput] = useState('');

  const handleBlockIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;
    setBlockedIps(prev => Array.from(new Set([...prev, newIpInput.trim()])));
    setNewIpInput('');
  };

  const handleUnblockIp = (ip: string) => {
    setBlockedIps(prev => prev.filter(i => i !== ip));
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 flex justify-between items-center shadow-md">
        <div>
          <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" /> Platform Security & Threat Defense Center
          </h3>
          <p className="text-xs text-[#c3c5d9] mt-0.5">IP firewall rules, failed login monitoring, rate-limiting, and 2FA enforcement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Telemetry & IP Firewall */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#0052ff]" /> Firewall IP Blacklist Manager
          </h4>

          <form onSubmit={handleBlockIp} className="flex gap-2">
            <input
              type="text"
              value={newIpInput}
              onChange={(e) => setNewIpInput(e.target.value)}
              placeholder="Enter IP address to block (e.g. 192.168.1.100)..."
              className="flex-1 bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
            />
            <button type="submit" className="px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-xl font-bold transition-all cursor-pointer">
              Block IP
            </button>
          </form>

          <div className="space-y-2 pt-2">
            <span className="text-[#8d90a2] text-[11px]">Currently Blocked IPs ({blockedIps.length})</span>
            {blockedIps.map((ip) => (
              <div key={ip} className="bg-[#0c0e17] p-2.5 rounded-xl border border-[#434656]/20 flex justify-between items-center text-white">
                <span>{ip}</span>
                <button onClick={() => handleUnblockIp(ip)} className="text-red-400 hover:text-white cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Controls */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Admin Security Enforcement
          </h4>

          <div className="bg-[#0c0e17] p-4 rounded-xl border border-[#434656]/20 flex justify-between items-center">
            <div>
              <div className="font-bold text-white">Require 2FA for Admin Accounts</div>
              <p className="text-[11px] text-[#8d90a2]">Enforce TOTP authenticator app on login</p>
            </div>
            <button onClick={() => setEnforce2FA(!enforce2FA)} className="cursor-pointer">
              {enforce2FA ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-[#8d90a2]" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
