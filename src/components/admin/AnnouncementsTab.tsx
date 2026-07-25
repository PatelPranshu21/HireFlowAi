import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X, 
  Trash2, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { AnnouncementAdmin } from '../../types/admin';

interface AnnouncementsTabProps {
  announcements: AnnouncementAdmin[];
  onAddAnnouncement: (anc: AnnouncementAdmin) => void;
  onUpdateAnnouncement: (anc: AnnouncementAdmin) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  announcements,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetAudience: 'All' as any,
    bannerType: 'info' as any
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    const newAnc: AnnouncementAdmin = {
      id: `anc_${Date.now()}`,
      title: form.title,
      message: form.message,
      targetAudience: form.targetAudience,
      active: true,
      bannerType: form.bannerType,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddAnnouncement(newAnc);
    setIsAddOpen(false);
    setForm({ title: '', message: '', targetAudience: 'All', bannerType: 'info' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 flex justify-between items-center shadow-md">
        <div>
          <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" /> Platform Announcements & Broadcast Banners
          </h3>
          <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">Broadcast live system alerts, maintenance updates, and release notes to candidate dashboards.</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 shadow-md flex justify-between items-start gap-4">
            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  a.bannerType === 'info' ? 'bg-[#0052ff]/20 text-[#0052ff]' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {a.bannerType}
                </span>
                <span className="text-[#8d90a2]">Target: {a.targetAudience}</span>
                <span className="text-[#8d90a2]">• {a.createdAt}</span>
              </div>
              <h4 className="text-base font-bold font-geist text-white mt-1">{a.title}</h4>
              <p className="text-[#c3c5d9]">{a.message}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onUpdateAnnouncement({ ...a, active: !a.active })}
                className="cursor-pointer"
                title={a.active ? 'Disable Broadcast' : 'Activate Broadcast'}
              >
                {a.active ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-[#8d90a2]" />}
              </button>

              <button
                onClick={() => onDeleteAnnouncement(a.id)}
                className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Broadcast Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-base font-bold font-geist text-white">New Broadcast Announcement</h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-[#8d90a2] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-[#c3c5d9] mb-1">Banner Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. HireFlow AI v2.5 Live"
                className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#c3c5d9] mb-1">Message Content</label>
              <textarea
                rows={3}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#c3c5d9] mb-1">Target Audience</label>
                <select
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value as any })}
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="All">All Registered Candidates</option>
                  <option value="Trial">Free Trial Users Only</option>
                  <option value="Pro">Pro & Premium Users</option>
                </select>
              </div>

              <div>
                <label className="block text-[#c3c5d9] mb-1">Banner Type</label>
                <select
                  value={form.bannerType}
                  onChange={(e) => setForm({ ...form, bannerType: e.target.value as any })}
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="info">Info Blue</option>
                  <option value="success">Success Green</option>
                  <option value="warning">Warning Amber</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#434656]/30">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 bg-[#0c0e17] hover:bg-white/10 text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 font-semibold text-white rounded-xl cursor-pointer"
              >
                Broadcast Banner
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
