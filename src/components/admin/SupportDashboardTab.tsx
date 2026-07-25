import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  User, 
  Tag
} from 'lucide-react';
import { SupportTicketAdmin } from '../../types/admin';

interface SupportDashboardTabProps {
  tickets: SupportTicketAdmin[];
  onReplyTicket: (ticketId: string, replyText: string) => void;
  onUpdateStatus: (ticketId: string, status: any) => void;
}

export const SupportDashboardTab: React.FC<SupportDashboardTabProps> = ({
  tickets,
  onReplyTicket,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketAdmin | null>(null);
  const [replyInput, setReplyInput] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyInput.trim()) return;

    onReplyTicket(selectedTicket.id, replyInput);
    setReplyInput('');

    // Update local selected ticket view
    setSelectedTicket(prev => prev ? ({
      ...prev,
      messages: [
        ...prev.messages,
        { id: `msg_${Date.now()}`, sender: 'support', text: replyInput, time: 'Just now' }
      ]
    }) : null);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d90a2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate tickets by name, subject, or ticket ID..."
            className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#c3c5d9]"
        >
          <option value="ALL">All Ticket Statuses</option>
          <option value="Open">Open</option>
          <option value="Pending">Pending</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Ticket List & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Queue List (1 col) */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 shadow-md space-y-3 h-[600px] overflow-y-auto">
          <h4 className="text-xs font-mono text-[#8d90a2] uppercase tracking-wider mb-2">Candidate Support Queue</h4>
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedTicket?.id === t.id
                  ? 'bg-[#0052ff]/10 border-[#0052ff]'
                  : 'bg-[#0c0e17] border-[#434656]/20 hover:border-[#434656]/50'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-mono text-[#4cd7f6]">{t.id}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  t.status === 'Open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {t.status}
                </span>
              </div>
              <h5 className="font-bold text-xs font-geist text-white line-clamp-1">{t.subject}</h5>
              <div className="text-[11px] font-mono text-[#8d90a2] mt-1">{t.userName} • {t.category}</div>
            </div>
          ))}
        </div>

        {/* Selected Ticket Conversation Thread (2 cols) */}
        <div className="lg:col-span-2 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md flex flex-col justify-between h-[600px]">
          {selectedTicket ? (
            <>
              <div>
                <div className="flex justify-between items-start border-b border-[#434656]/30 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img src={selectedTicket.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[#434656]" />
                    <div>
                      <h3 className="text-base font-bold font-geist text-white">{selectedTicket.subject}</h3>
                      <p className="text-xs font-mono text-[#8d90a2]">{selectedTicket.userName} ({selectedTicket.userEmail})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateStatus(selectedTicket.id, selectedTicket.status === 'Closed' ? 'Open' : 'Closed')}
                      className="px-3 py-1.5 bg-[#0c0e17] hover:bg-white/10 border border-[#434656]/30 rounded-xl text-xs font-mono text-white transition-all cursor-pointer"
                    >
                      {selectedTicket.status === 'Closed' ? 'Reopen Ticket' : 'Mark Closed'}
                    </button>
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="space-y-3 overflow-y-auto max-h-[360px] pr-2">
                  {selectedTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl max-w-[85%] font-mono text-xs ${
                        m.sender === 'support'
                          ? 'bg-[#0052ff]/20 border border-[#0052ff]/40 text-white ml-auto'
                          : 'bg-[#0c0e17] border border-[#434656]/30 text-[#c3c5d9]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 text-[10px] text-[#8d90a2]">
                        <span className="font-bold">{m.sender === 'support' ? 'Support Agent' : selectedTicket.userName}</span>
                        <span>{m.time}</span>
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex gap-2 pt-3 border-t border-[#434656]/30 mt-auto">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type official support reply..."
                  className="flex-1 bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#8d90a2] font-mono text-xs">
              <MessageSquare className="w-10 h-10 text-[#434656] mb-2" />
              <span>Select a support ticket from the queue to view thread.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
