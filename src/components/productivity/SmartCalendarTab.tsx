import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Video,
  CheckCircle2,
  Sparkles,
  MapPin,
  ExternalLink,
  Filter,
  ListFilter,
  MoreHorizontal
} from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { CalendarEvent } from '../../types';
import { EventModal } from './EventModal';

export const SmartCalendarTab: React.FC = () => {
  const {
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    toggleCalendarEvent,
    generateAiDailySchedule,
    integrations
  } = useEcosystem();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'agenda'>('week');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const filteredEvents = calendarEvents.filter(evt => {
    if (filterType === 'all') return true;
    return evt.type === filterType;
  });

  const getTypeBadgeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'interview':
      case 'mock_interview':
        return 'bg-[#571bc1]/20 text-[#d0bcff] border-[#571bc1]/40';
      case 'assessment':
      case 'exam':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'coding_practice':
      case 'study_session':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'resume_review':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'coaching':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-[#007083]/20 text-[#4cd7f6] border-[#007083]/40';
    }
  };

  const daysOfWeek = ['Mon 07/20', 'Tue 07/21', 'Wed 07/22', 'Thu 07/23', 'Fri 07/24', 'Sat 07/25 (Today)', 'Sun 07/26'];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#191b25] border border-[#434656]/30 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0052ff]/10 text-[#0052ff] border border-[#0052ff]/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-geist text-white flex items-center gap-2">
              Smart AI Calendar
              {integrations.googleCalendar.connected && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Synced
                </span>
              )}
            </h2>
            <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">
              Sync interview slots, take-home tests, study blocks & AI career recommendations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Auto Schedule Button */}
          <button
            onClick={generateAiDailySchedule}
            className="bg-gradient-to-r from-[#571bc1] to-[#0052ff] hover:opacity-95 text-white text-xs font-mono font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> AI Generate Schedule
          </button>

          {/* View Mode Selector */}
          <div className="bg-[#13151f] p-1 rounded-xl border border-[#434656]/30 flex gap-1">
            {(['day', 'week', 'month', 'agenda'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize cursor-pointer transition-colors ${
                  viewMode === mode
                    ? 'bg-[#0052ff] text-white font-bold'
                    : 'text-[#c3c5d9] hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSelectedEvent(null);
              setIsModalOpen(true);
            }}
            className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#13151f] p-3 rounded-xl border border-[#434656]/20">
        <div className="flex items-center gap-2 text-xs font-mono text-[#c3c5d9]">
          <Filter className="w-4 h-4 text-[#0052ff]" /> Filter:
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#191b25] border border-[#434656]/30 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#0052ff]"
          >
            <option value="all">All Event Types ({calendarEvents.length})</option>
            <option value="interview">Interviews</option>
            <option value="mock_interview">Mock Interviews</option>
            <option value="assessment">Assessments</option>
            <option value="coding_practice">Coding Practice</option>
            <option value="study_session">Study Sessions</option>
            <option value="resume_review">Resume Reviews</option>
            <option value="deadline">Deadlines</option>
            <option value="exam">Exams</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#c3c5d9]">
          <button className="p-1.5 rounded-lg hover:bg-[#252836] text-[#c3c5d9] hover:text-white cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-white">July 20 - 26, 2026</span>
          <button className="p-1.5 rounded-lg hover:bg-[#252836] text-[#c3c5d9] hover:text-white cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode Rendering */}
      {viewMode === 'agenda' ? (
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-[#191b25] rounded-2xl border border-[#434656]/20">
              <CalendarIcon className="w-10 h-10 text-[#434656] mx-auto mb-3" />
              <p className="text-sm font-geist text-[#c3c5d9]">No calendar events match the current filter.</p>
            </div>
          ) : (
            filteredEvents.map(evt => (
              <div
                key={evt.id}
                className={`bg-[#191b25] border border-[#434656]/30 hover:border-[#0052ff]/50 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 transition-all ${
                  evt.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => toggleCalendarEvent(evt.id)}
                    className={`mt-1 p-1 rounded-full cursor-pointer transition-colors ${
                      evt.completed ? 'text-emerald-400 bg-emerald-500/10' : 'text-[#434656] hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getTypeBadgeColor(evt.type)}`}>
                        {evt.type.replace('_', ' ')}
                      </span>
                      {evt.company && (
                        <span className="text-xs font-mono text-[#4cd7f6] font-bold">{evt.company}</span>
                      )}
                      {evt.priority === 'high' && (
                        <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                          High Priority
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-bold font-geist text-white ${evt.completed ? 'line-through' : ''}`}>
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="text-xs text-[#c3c5d9] font-mono max-w-2xl">{evt.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[#c3c5d9]">
                  <div className="flex flex-col items-end">
                    <span className="flex items-center gap-1 text-white font-bold">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#0052ff]" /> {evt.date}
                    </span>
                    <span className="flex items-center gap-1 text-[#4cd7f6] mt-0.5">
                      <Clock className="w-3.5 h-3.5" /> {evt.time}
                    </span>
                  </div>

                  {evt.meetingLink && (
                    <a
                      href={evt.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#0052ff]/20 text-[#0052ff] hover:bg-[#0052ff] hover:text-white transition-colors cursor-pointer"
                      title="Join Meeting"
                    >
                      <Video className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setSelectedEvent(evt);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-[#252836] text-[#c3c5d9] hover:text-white cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Week / Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map(evt => (
            <div
              key={evt.id}
              className={`bg-[#191b25] border border-[#434656]/30 hover:border-[#0052ff]/50 rounded-2xl p-5 flex flex-col justify-between transition-all group ${
                evt.completed ? 'opacity-60' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getTypeBadgeColor(evt.type)}`}>
                    {evt.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    {evt.company && (
                      <span className="text-xs font-mono text-[#c3c5d9] font-bold">{evt.company}</span>
                    )}
                    <button
                      onClick={() => toggleCalendarEvent(evt.id)}
                      className={`p-1 rounded cursor-pointer ${evt.completed ? 'text-emerald-400' : 'text-[#434656] hover:text-white'}`}
                      title={evt.completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className={`text-base font-bold text-white font-geist mb-2 group-hover:text-[#4cd7f6] transition-colors ${evt.completed ? 'line-through' : ''}`}>
                  {evt.title}
                </h3>

                {evt.description && (
                  <p className="text-xs text-[#c3c5d9] font-mono line-clamp-2 mb-3 leading-relaxed">
                    {evt.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[#434656]/20 flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-3 text-[#4cd7f6]">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" /> {evt.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {evt.time}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedEvent(evt);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-[#c3c5d9] hover:text-white hover:bg-[#252836] cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialEvent={selectedEvent}
        onSave={evt => {
          if ('id' in evt) {
            updateCalendarEvent(evt as CalendarEvent);
          } else {
            addCalendarEvent(evt);
          }
        }}
        onDelete={id => deleteCalendarEvent(id)}
      />
    </div>
  );
};
