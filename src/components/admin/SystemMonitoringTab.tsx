import React from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Zap, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { ServiceHealthItem } from '../../types/admin';

interface SystemMonitoringTabProps {
  health: ServiceHealthItem[];
}

export const SystemMonitoringTab: React.FC<SystemMonitoringTabProps> = ({ health }) => {
  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 flex justify-between items-center shadow-md">
        <div>
          <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" /> Infrastructure & Service Health Monitor
          </h3>
          <p className="text-xs text-[#c3c5d9] mt-0.5">Real-time status checks for Cloud Run containers, Firestore, Gemini AI engine, Stripe webhook, and SMTP services.</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {health.map((srv) => (
          <div key={srv.name} className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 shadow-md space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="text-base font-bold font-geist text-white">{srv.name}</h4>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                srv.status === 'Operational' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {srv.status}
              </span>
            </div>

            <div className="space-y-1 text-[#8d90a2]">
              <div className="flex justify-between"><span>Uptime SLA:</span> <span className="text-emerald-400 font-bold">{srv.uptimePercent}%</span></div>
              <div className="flex justify-between"><span>Response Latency:</span> <span className="text-white font-bold">{srv.latencyMs} ms</span></div>
              <div className="flex justify-between"><span>Last Health Check:</span> <span className="text-[#c3c5d9]">{srv.lastChecked}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
