import React from 'react';
import { ShieldCheck, Users, FileText, Server, Activity } from 'lucide-react';

export const AdminView: React.FC = () => {
  return (
    <div className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold font-geist text-[#e1e1ef] flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#4cd7f6]" /> Platform Admin Dashboard
          </h2>
          <p className="text-sm text-[#c3c5d9] font-mono mt-1">HireFlow AI backend telemetry & system performance monitors.</p>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">Total Registered Candidates</span>
            <Users className="w-4 h-4 text-[#b7c4ff]" />
          </div>
          <span className="text-3xl font-bold font-geist text-white">24,890</span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">Resumes Analyzed Today</span>
            <FileText className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <span className="text-3xl font-bold font-geist text-white">3,142</span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">API Latency (p99)</span>
            <Server className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-3xl font-bold font-geist text-green-400">142 ms</span>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-[#c3c5d9]">Gemini 3.6 Uptime</span>
            <Activity className="w-4 h-4 text-[#d0bcff]" />
          </div>
          <span className="text-3xl font-bold font-geist text-[#d0bcff]">99.98%</span>
        </div>
      </div>

      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
        <h3 className="text-xl font-bold font-geist text-white mb-4">System Event Log</h3>
        <div className="space-y-2 text-xs font-mono text-[#c3c5d9]">
          <div className="p-2.5 bg-[#0c0e17] rounded border border-[#434656]/20 flex justify-between">
            <span>[INFO] /api/ai/analyze-resume successfully processed request in 380ms</span>
            <span className="text-[#8d90a2]">10s ago</span>
          </div>
          <div className="p-2.5 bg-[#0c0e17] rounded border border-[#434656]/20 flex justify-between">
            <span>[INFO] /api/ai/match-job processed for user usr_123</span>
            <span className="text-[#8d90a2]">2m ago</span>
          </div>
          <div className="p-2.5 bg-[#0c0e17] rounded border border-[#434656]/20 flex justify-between">
            <span>[SYSTEM] Fast-start container health check OK</span>
            <span className="text-[#8d90a2]">5m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
