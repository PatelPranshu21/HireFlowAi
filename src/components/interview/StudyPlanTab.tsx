import React, { useState } from 'react';
import { studyPlansList } from '../../data/interviewData';
import { StudyPlanConfig } from '../../types';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Target, 
  BookOpen, 
  Flame, 
  Award,
  Sparkles
} from 'lucide-react';

export const StudyPlanTab: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlanConfig[]>(studyPlansList);
  const [selectedDays, setSelectedDays] = useState<number>(14);

  const activePlan = plans.find(p => p.days === selectedDays) || plans[1];

  const handleToggleTask = (dayNum: number) => {
    setPlans(prev => prev.map(p => {
      if (p.days !== selectedDays) return p;
      return {
        ...p,
        dailyTasks: p.dailyTasks.map(task => task.day === dayNum ? { ...task, completed: !task.completed } : task)
      };
    }));
  };

  const completedCount = activePlan.dailyTasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / activePlan.dailyTasks.length) * 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-geist text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#0052ff]" />
            AI Interview Study Roadmap
          </h2>
          <p className="text-xs text-[#c3c5d9] mt-1">
            Structured day-by-day preparation schedules covering Algorithms, System Design, STAR Stories & Mock Practice.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-4 bg-[#11131c] px-5 py-3 rounded-xl border border-[#434656]/30">
          <div>
            <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Plan Completion</span>
            <p className="text-lg font-bold font-geist text-white">{progressPercent}% Completed</p>
          </div>
          <div className="w-20 bg-[#282934] h-2 rounded-full overflow-hidden">
            <div className="bg-[#0052ff] h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Select Plan Duration Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[7, 14, 30, 60].map(days => {
          const isSelected = selectedDays === days;
          return (
            <button
              key={days}
              onClick={() => setSelectedDays(days)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-[#191b25] border-[#0052ff] ai-gradient-border shadow-lg' 
                  : 'bg-[#191b25]/60 border-[#434656]/30 hover:border-[#434656]/60'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-bold text-white">{days}-Day Roadmap</span>
                <Clock className={`w-4 h-4 ${isSelected ? 'text-[#4cd7f6]' : 'text-[#8d90a2]'}`} />
              </div>
              <span className="text-[10px] font-mono text-[#c3c5d9]">
                {days === 7 ? 'Sprint Mode' : days === 14 ? 'Intensive Prep' : days === 30 ? 'Comprehensive' : 'Mastery'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold font-geist text-white">{activePlan.title}</h3>
          <p className="text-xs text-[#c3c5d9] mt-1">{activePlan.description}</p>
        </div>

        <div className="space-y-3">
          {activePlan.dailyTasks.map(task => (
            <div
              key={task.day}
              onClick={() => handleToggleTask(task.day)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                task.completed ? 'bg-[#11131c]/50 border-[#00d26a]/30' : 'bg-[#11131c] border-[#434656]/20 hover:border-[#434656]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-[#00d26a] bg-[#0c0e17] border-[#434656]/50 focus:ring-0 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#4cd7f6]">Day {task.day}</span>
                    <span className="px-2 py-0.5 rounded bg-[#282934] font-mono text-[10px] text-[#c3c5d9]">
                      {task.category}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${task.completed ? 'line-through text-[#8d90a2]' : 'text-white'}`}>
                    {task.topic}
                  </p>
                </div>
              </div>

              {task.completed && (
                <span className="text-[10px] font-mono text-[#00d26a] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
