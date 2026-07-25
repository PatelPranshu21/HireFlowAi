import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, Link as LinkIcon, AlertCircle, FileText, Trash2, Check } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => void;
  onDelete?: (id: string) => void;
  initialEvent?: CalendarEvent | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent
}) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [company, setCompany] = useState(initialEvent?.company || '');
  const [date, setDate] = useState(initialEvent?.date || 'Today');
  const [time, setTime] = useState(initialEvent?.time || '10:00 AM');
  const [type, setType] = useState<CalendarEvent['type']>(initialEvent?.type || 'interview');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(initialEvent?.priority || 'medium');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [meetingLink, setMeetingLink] = useState(initialEvent?.meetingLink || '');
  const [notes, setNotes] = useState(initialEvent?.notes || '');
  const [colorTag, setColorTag] = useState(initialEvent?.colorTag || '#0052ff');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: any = {
      title,
      company: company || undefined,
      date,
      time,
      type,
      priority,
      description: description || undefined,
      location: location || undefined,
      meetingLink: meetingLink || undefined,
      notes: notes || undefined,
      colorTag,
      completed: initialEvent?.completed || false
    };

    if (initialEvent?.id) {
      payload.id = initialEvent.id;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#434656]/30 flex justify-between items-center bg-[#13151f]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0052ff]/10 text-[#0052ff]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-geist text-white">
                {initialEvent ? 'Edit Calendar Event' : 'Schedule New Event'}
              </h3>
              <p className="text-xs text-[#c3c5d9] font-mono">
                Integrated with Career Ecosystem & Reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#c3c5d9] hover:text-white hover:bg-[#252836] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Technical Interview"
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#0052ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Event Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0052ff]"
              >
                <option value="interview">Interview</option>
                <option value="mock_interview">Mock Interview</option>
                <option value="assessment">Assessment / Take-Home</option>
                <option value="study_session">Study Session</option>
                <option value="coding_practice">Coding Practice</option>
                <option value="resume_review">Resume Review</option>
                <option value="deadline">Application Deadline</option>
                <option value="exam">Certification Exam</option>
                <option value="coaching">Career Coaching</option>
                <option value="followup">Recruiter Followup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0052ff]"
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Date</label>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="Today, Tomorrow, YYYY-MM-DD"
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Company / Organization (Optional)</label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Apple, Stripe, Google"
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0052ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Meeting Link / URL (Optional)</label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-[#c3c5d9] absolute left-3 top-2.5" />
              <input
                type="url"
                value={meetingLink}
                onChange={e => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/... or Google Meet"
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0052ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Description & Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Key prep topics, interviewers, or take-home criteria..."
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#0052ff]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#434656]/30 flex justify-between items-center">
            {initialEvent && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this event?')) {
                    onDelete(initialEvent.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-mono cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Event
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#252836] text-[#c3c5d9] text-xs font-mono hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" /> Save Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
