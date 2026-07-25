import React, { useState } from 'react';
import { X, Calendar, Clock, Building2, Plus, Sparkles } from 'lucide-react';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (evt: any) => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  onAddEvent
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('Google');
  const [date, setDate] = useState('2026-07-28');
  const [time, setTime] = useState('14:00');
  const [type, setType] = useState('Mock Interview');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      id: `evt_${Date.now()}`,
      title,
      company,
      date,
      time,
      type
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#191b25] border border-[#0052ff] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl ai-gradient-border">
        <div className="flex justify-between items-center border-b border-[#434656]/30 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0052ff]" />
            <h3 className="text-base font-bold font-geist text-white">Schedule Interview Event</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#8d90a2] hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold block mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Google L5 Technical System Design Round"
              className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0052ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold block mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold block mb-1">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0052ff]"
              >
                <option value="Mock Interview">Mock Interview</option>
                <option value="Real Interview">Real Interview</option>
                <option value="Coding Practice">Coding Practice</option>
                <option value="System Design Prep">System Design Prep</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold block mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#282934] text-[#c3c5d9] rounded-xl font-mono text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Schedule Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
