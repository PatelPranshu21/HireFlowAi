import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Download, 
  X,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { PaymentTransactionAdmin, GatewayConfig } from '../../types/admin';

interface PaymentManagementTabProps {
  transactions: PaymentTransactionAdmin[];
  gateways: GatewayConfig[];
  onUpdateGateway: (gateway: GatewayConfig) => void;
  onProcessRefund: (transactionId: string) => void;
}

export const PaymentManagementTab: React.FC<PaymentManagementTabProps> = ({
  transactions,
  gateways,
  onUpdateGateway,
  onProcessRefund
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [gatewayFilter, setGatewayFilter] = useState('ALL');
  const [selectedRefundTx, setSelectedRefundTx] = useState<PaymentTransactionAdmin | null>(null);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchesGateway = gatewayFilter === 'ALL' || tx.gateway === gatewayFilter;
    return matchesSearch && matchesStatus && matchesGateway;
  });

  const totalVolume = (transactions || []).reduce((acc, tx) => acc + (tx.status === 'Succeeded' ? tx.amount : 0), 0);
  const refundedVolume = (transactions || []).reduce((acc, tx) => acc + (tx.status === 'Refunded' ? tx.amount : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Gateway Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gateways.map((gw) => (
          <div key={gw.id} className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 shadow-md flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-mono text-[#8d90a2] uppercase tracking-wider">{gw.currency}</span>
                <h4 className="text-lg font-bold font-geist text-white mt-0.5">{gw.name}</h4>
              </div>

              <button
                onClick={() => onUpdateGateway({ ...gw, active: !gw.active })}
                className="cursor-pointer"
                title={gw.active ? 'Disable Gateway' : 'Enable Gateway'}
              >
                {gw.active ? (
                  <ToggleRight className="w-7 h-7 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-[#8d90a2]" />
                )}
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono pt-2 border-t border-[#434656]/20">
              <div className="flex justify-between items-center">
                <span className="text-[#8d90a2]">Webhook Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {gw.webhookHealth}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8d90a2]">Mode:</span>
                <span className={`font-semibold ${gw.testMode ? 'text-amber-400' : 'text-[#0052ff]'}`}>
                  {gw.testMode ? 'Test Sandbox' : 'Live Production'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#8d90a2]">Last Webhook Event:</span>
                <span className="text-[#c3c5d9]">{gw.lastSynced}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 shadow-md">
          <span className="text-xs font-mono text-[#8d90a2] uppercase">Total Succeeded Volume</span>
          <div className="text-2xl font-bold font-geist text-emerald-400 mt-1">${totalVolume.toFixed(2)}</div>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 shadow-md">
          <span className="text-xs font-mono text-[#8d90a2] uppercase">Refunded Volume</span>
          <div className="text-2xl font-bold font-geist text-amber-400 mt-1">${refundedVolume.toFixed(2)}</div>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 shadow-md">
          <span className="text-xs font-mono text-[#8d90a2] uppercase">Total Invoices Dispatched</span>
          <div className="text-2xl font-bold font-geist text-white mt-1">{transactions.length}</div>
        </div>
      </div>

      {/* Filter & Transactions Table */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d90a2]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions by user name, email, or invoice ID..."
              className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#c3c5d9] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Succeeded">Succeeded</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>

            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#c3c5d9] focus:outline-none"
            >
              <option value="ALL">All Gateways</option>
              <option value="Stripe">Stripe</option>
              <option value="Razorpay">Razorpay</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#0c0e17] border-b border-[#434656]/30 text-[#8d90a2] uppercase text-[10px]">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer Name & Email</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#434656]/20">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{tx.id}</td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-white font-geist">{tx.userName}</div>
                    <div className="text-[11px] text-[#8d90a2]">{tx.userEmail}</div>
                  </td>

                  <td className="py-3 px-4 text-[#4cd7f6]">{tx.planName}</td>

                  <td className="py-3 px-4 font-bold text-white">${tx.amount.toFixed(2)}</td>

                  <td className="py-3 px-4 text-[#c3c5d9]">{tx.gateway}</td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.status === 'Succeeded'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : tx.status === 'Refunded'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {tx.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[#8d90a2]">{tx.date}</td>

                  <td className="py-3 px-4 text-right">
                    {tx.status === 'Succeeded' && (
                      <button
                        onClick={() => setSelectedRefundTx(tx)}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Refund Modal */}
      {selectedRefundTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-base font-bold font-geist text-white">Process Refund: {selectedRefundTx.id}</h3>
              <button onClick={() => setSelectedRefundTx(null)} className="text-[#8d90a2] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-mono text-[#c3c5d9]">
              Are you sure you want to issue a full refund of <strong className="text-white">${selectedRefundTx.amount}</strong> to <strong className="text-white">{selectedRefundTx.userEmail}</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRefundTx(null)}
                className="px-4 py-2 bg-[#0c0e17] hover:bg-white/10 text-xs font-mono text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onProcessRefund(selectedRefundTx.id);
                  setSelectedRefundTx(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-semibold text-black rounded-xl cursor-pointer"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
