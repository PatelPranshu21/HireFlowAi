import React from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  FileText,
  Target,
  Zap,
  Flame,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Play,
  CheckCircle2,
  Video
} from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

interface ProductivityDashboardTabProps {
  onSelectSubTab: (tab: string) => void;
}

export const ProductivityDashboardTab: React.FC<ProductivityDashboardTabProps> = ({
  onSelectSubTab
}) => {
  const {
    calendarEvents,
    prodTasks,
    prodGoals,
    prodNotes,
    streaks,
    toggleCalendarEvent,
    toggleProdTask,
    generateAiDailySchedule
  } = useEcosystem();

  const todayEvents = calendarEvents.filter(e => e.date === 'Today' || e.date === 'Tomorrow' || e.date.includes('07/25'));
  const pendingTasks = prodTasks.filter(t => !t.completed).slice(0, 4);
  const activeGoals = prodGoals.filter(g => !g.completed).slice(0, 3);
  const pinnedNotes = prodNotes.filter(n => n.pinned || n.favorite).slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Hero Executive Summary Card */}
      <div className="bg-gradient-to-r from-[#191b25] via-[#13151f] to-[#191b25] border border-[#0052ff]/30 p-6 rounded-3xl flex flex-wrap justify-between items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#0052ff]/20 text-[#4cd7f6] border border-[#0052ff]/30 font-bold">
              AI Productivity Engine
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {streaks.learningStreakDays} Day Streak!
            </span>
          </div>

          <h2 className="text-2xl font-bold font-geist text-white">
            Daily Career Command Center
          </h2>

          <p className="text-xs text-[#c3c5d9] font-mono leading-relaxed">
            Your schedule, high-priority tasks, STAR prep notes & goal targets are fully synchronized across Resume Suite, Job Hub, and Interview Intelligence.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectSubTab('ai-planner')}
              className="bg-gradient-to-r from-[#571bc1] to-[#0052ff] hover:opacity-95 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Generate AI Daily Schedule
            </button>

            <button
              onClick={() => onSelectSubTab('focus-mode')}
              className="bg-[#252836] hover:bg-[#32364a] text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-purple-400" /> Start Focus Session
            </button>
          </div>
        </div>

        {/* Quick Metrics Badge Group */}
        <div className="grid grid-cols-2 gap-3 z-10">
          <div className="bg-[#13151f]/80 p-4 rounded-2xl border border-[#434656]/30 text-center w-36">
            <span className="text-[10px] font-mono text-[#c3c5d9] uppercase block">Productivity</span>
            <span className="text-2xl font-bold font-geist text-emerald-400">{streaks.productivityScore}%</span>
            <span className="text-[10px] font-mono text-[#c3c5d9]">Top 5% Performer</span>
          </div>

          <div className="bg-[#13151f]/80 p-4 rounded-2xl border border-[#434656]/30 text-center w-36">
            <span className="text-[10px] font-mono text-[#c3c5d9] uppercase block">Focus Time</span>
            <span className="text-2xl font-bold font-geist text-[#4cd7f6]">{streaks.totalFocusHours}h</span>
            <span className="text-[10px] font-mono text-[#c3c5d9]">38.5h Total Study</span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Today's Schedule + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule Card */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#0052ff]" /> Today's Schedule & Events
            </h3>
            <button
              onClick={() => onSelectSubTab('calendar')}
              className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Calendar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayEvents.length === 0 ? (
              <p className="text-xs text-[#c3c5d9] font-mono py-4 text-center">No events scheduled for today.</p>
            ) : (
              todayEvents.map(evt => (
                <div
                  key={evt.id}
                  className="p-3.5 bg-[#13151f] rounded-xl border border-[#434656]/30 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCalendarEvent(evt.id)}
                      className={`p-1 rounded ${evt.completed ? 'text-emerald-400' : 'text-[#434656] hover:text-white'}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className={`text-xs font-bold font-geist text-white ${evt.completed ? 'line-through opacity-60' : ''}`}>
                        {evt.title}
                      </h4>
                      <span className="text-[10px] font-mono text-[#4cd7f6] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {evt.time} {evt.company ? `• ${evt.company}` : ''}
                      </span>
                    </div>
                  </div>

                  {evt.meetingLink && (
                    <a
                      href={evt.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#0052ff]/20 text-[#0052ff] hover:bg-[#0052ff] hover:text-white transition-colors"
                      title="Join Meeting"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Tasks Card */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#10b981]" /> High-Priority Career Tasks
            </h3>
            <button
              onClick={() => onSelectSubTab('tasks')}
              className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Task Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div
                key={task.id}
                className="p-3.5 bg-[#13151f] rounded-xl border border-[#434656]/30 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleProdTask(task.id)}
                    className="p-1 text-[#434656] hover:text-white cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <div>
                    <h4 className="text-xs font-bold font-geist text-white">{task.title}</h4>
                    <span className="text-[10px] font-mono text-[#c3c5d9]">
                      {task.category} • Due: {task.dueDate}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                  task.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Layout: Active Goals & Pinned Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Progress */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#3b82f6]" /> Active Career Roadmap Goals
            </h3>
            <button
              onClick={() => onSelectSubTab('goals')}
              className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Goals <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeGoals.map(goal => {
              const percent = Math.min(100, Math.round((goal.currentProgress / goal.targetProgress) * 100));
              return (
                <div key={goal.id} className="p-3.5 bg-[#13151f] rounded-xl border border-[#434656]/30 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white font-bold">{goal.title}</span>
                    <span className="text-[#3b82f6]">{goal.currentProgress}/{goal.targetProgress} {goal.unit} ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#191b25] rounded-full overflow-hidden border border-[#434656]/20">
                    <div className="h-full bg-[#3b82f6] transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pinned Notes Quick Access */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#f59e0b]" /> Pinned Notes & Cheat Sheets
            </h3>
            <button
              onClick={() => onSelectSubTab('notes')}
              className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Knowledge Base <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pinnedNotes.map(note => (
              <div key={note.id} className="p-3.5 bg-[#13151f] rounded-xl border border-[#434656]/30 space-y-1">
                <span className="text-[10px] font-mono text-[#f59e0b] uppercase font-bold">{note.category}</span>
                <h4 className="text-xs font-bold font-geist text-white">{note.title}</h4>
                <p className="text-[11px] text-[#c3c5d9] font-mono line-clamp-2">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
