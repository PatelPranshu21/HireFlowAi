import React, { useState } from 'react';
import { Download, FileSpreadsheet, Database, FileText, CheckCircle2 } from 'lucide-react';

export const ExportCenterTab: React.FC = () => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const triggerExport = (dataset: string, format: string) => {
    setDownloadingFormat(`${dataset}_${format}`);
    setTimeout(() => {
      const sampleData = dataset === 'users' 
        ? 'ID,Name,Email,Role,Status\nusr_1,Sarah Jenkins,sarah@example.com,Candidate,Active\nusr_2,Michael Chang,michael@example.com,Admin,Active'
        : 'ID,Amount,Currency,Status\ntx_101,19.00,USD,Succeeded\ntx_102,49.00,USD,Succeeded';
      
      const blob = new Blob([sampleData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hireflow_${dataset}_dump_${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setDownloadingFormat(null);
    }, 800);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 shadow-md">
        <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
          <Download className="w-6 h-6 text-[#4cd7f6]" /> Data Export & Database Backup Center
        </h3>
        <p className="text-xs text-[#c3c5d9] mt-0.5">Generate compliance-grade exports in CSV, JSON, or SQL format.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-4">
          <h4 className="text-base font-bold font-geist text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0052ff]" /> Full Candidate Database Export
          </h4>
          <p className="text-[#c3c5d9]">Export all user records, resume scores, applications, and subscription details.</p>
          <div className="flex gap-2">
            <button onClick={() => triggerExport('users', 'csv')} className="px-4 py-2 bg-[#0052ff] text-white rounded-xl font-semibold cursor-pointer">
              Download CSV
            </button>
            <button onClick={() => triggerExport('users', 'json')} className="px-4 py-2 bg-[#0c0e17] border border-[#434656]/30 text-white rounded-xl cursor-pointer">
              Download JSON
            </button>
          </div>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-4">
          <h4 className="text-base font-bold font-geist text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Revenue & Financial Ledger Export
          </h4>
          <p className="text-[#c3c5d9]">Export transaction ledgers, Stripe charges, and refund histories for accounting.</p>
          <div className="flex gap-2">
            <button onClick={() => triggerExport('financials', 'csv')} className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded-xl cursor-pointer">
              Download Financial Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
