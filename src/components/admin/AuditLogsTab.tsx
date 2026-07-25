import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Download, 
  Filter, 
  AlertTriangle, 
  Info, 
  Clock 
} from 'lucide-react';
import { AuditLogAdmin } from '../../types/admin';

interface AuditLogsTabProps {
  logs: AuditLogAdmin[];
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(l => 
    l.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.targetEntity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'AdminEmail', 'AdminRole', 'Action', 'TargetEntity', 'IP', 'Severity'];
    const rows = filteredLogs.map(l => [
      l.id, l.timestamp, l.adminEmail, l.adminRole, l.action, `"${l.targetEntity}"`, l.ipAddress, l.severity
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hireflow_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search & Export Header */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d90a2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter audit logs by admin email, action type, or target entity..."
            className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none"
          />
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-[#0c0e17] hover:bg-white/10 border border-[#434656]/30 text-xs font-mono text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-[#4cd7f6]" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Audit Trail Table */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl overflow-hidden shadow-md font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0c0e17] border-b border-[#434656]/30 text-[#8d90a2] uppercase text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#434656]/20">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-[#8d90a2]">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-white">{log.adminEmail}</td>
                  <td className="py-3 px-4 text-[#4cd7f6]">{log.adminRole}</td>
                  <td className="py-3 px-4 font-bold text-[#0052ff]">{log.action}</td>
                  <td className="py-3 px-4 text-[#c3c5d9]">{log.targetEntity}</td>
                  <td className="py-3 px-4 text-[#8d90a2]">{log.ipAddress}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.severity === 'Warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
