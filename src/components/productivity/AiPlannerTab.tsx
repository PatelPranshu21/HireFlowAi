import React, { useState } from 'react';
import { Sparkles, Calendar as CalendarIcon, Clock, Check, ArrowRight, Bot, Target } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

export const AiPlannerTab: React.FC = () => {
  const {
    profile,
    calendarEvents,
    prodTasks,
    prodGoals,
    generateAiDailySchedule,
    navigateWithEcosystem
  } = useEcosystem();

  const [targetFocus, setTargetFocus] = useState('System Design & Technical Interviews');
  const [maxHours, setMaxHours] = useState(6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateAiDailySchedule();
      setIsGenerating(false);
      setGeneratedSuccess(true);
      setTimeout(() => setGeneratedSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#571bc1]/20 via-[#0052ff]/10 to-[#191b25] border border-[#571bc1]/30 p-6 rounded-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#571bc1]/30 text-[#d0bcff] border border-[#571bc1]/40">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-geist text-white flex items-center gap-2">
              Motion-AI Schedule Planner
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0052ff]/20 text-[#4cd7f6] border border-[#0052ff]/30">
                Autonomous Career Agent
              </span>
            </h2>
            <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">
              Analyzes your upcoming interviews, resume target roles, DSA goals & workload capacity to synthesize an optimal daily schedule.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-gradient-to-r from-[#571bc1] to-[#0052ff] hover:opacity-95 text-white font-mono text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg transition-all"
        >
          {isGenerating ? (
            <>Generating Schedule...</>
          ) : generatedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" /> Schedule Generated!
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" /> Auto-Synthesize AI Schedule
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Planner Parameters */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-[#0052ff]" /> Planner Parameters
          </h3>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Primary Career Focus</label>
            <select
              value={targetFocus}
              onChange={e => setTargetFocus(e.target.value)}
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0052ff]"
            >
              <option value="System Design & Technical Interviews">System Design & Technical Interviews</option>
              <option value="Resume Tailoring & High-Match Applications">Resume Tailoring & Applications</option>
              <option value="DSA & LeetCode Grind">DSA & LeetCode Grind</option>
              <option value="Certification & AWS Exam">Certification & Exam Prep</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Max Working Hours Today ({maxHours} hrs)</label>
            <input
              type="range"
              min={2}
              max={10}
              value={maxHours}
              onChange={e => setMaxHours(Number(e.target.value))}
              className="w-full accent-[#0052ff] cursor-pointer"
            />
          </div>

          <div className="p-4 bg-[#13151f] rounded-xl border border-[#434656]/20 space-y-2 text-xs font-mono text-[#c3c5d9]">
            <span className="text-white font-bold block">AI Ecosystem Inputs Evaluated:</span>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>{calendarEvents.filter(e => e.type === 'interview').length} Scheduled Interviews</li>
              <li>{prodTasks.filter(t => !t.completed).length} Active Career Tasks</li>
              <li>{prodGoals.filter(g => !g.completed).length} Unfinished Roadmap Goals</li>
            </ul>
          </div>
        </div>

        {/* AI Rationale & Proposed Schedule */}
        <div className="md:col-span-2 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold font-geist text-white flex items-center justify-between">
            AI Proposed Schedule Blueprint
            <button
              onClick={() => navigateWithEcosystem('calendar')}
              className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Calendar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </h3>

          <div className="p-4 rounded-xl bg-[#571bc1]/10 border border-[#571bc1]/30 text-xs font-mono text-white leading-relaxed space-y-2">
            <p className="font-bold text-[#d0bcff]">🤖 AI Agent Strategic Rationale:</p>
            <p className="text-[#c3c5d9]">
              {calendarEvents.length > 0 
                ? `"Analyzing ${calendarEvents.length} scheduled calendar event(s) and your target focus on '${targetFocus}'. I've prioritized interview practice sessions and high-impact resume/application tasks within your ${maxHours}-hour limit."`
                : `"Analyzing your user profile (${profile.title || 'Software Engineer'}, ATS Score: ${profile.atsScore || 0}%) and target focus on '${targetFocus}'. I've structured a focused ${maxHours}-hour daily workflow targeting high-match job applications, DSA preparation, and ATS bullet refinement."`
              }
            </p>
          </div>

          {/* Dynamic Blocks */}
          <div className="space-y-3">
            {[
              { 
                time: '09:00 AM - 10:30 AM', 
                title: calendarEvents[0]?.title ? `Prepare for: ${calendarEvents[0].title}` : `Core Skill Prep: ${targetFocus}`, 
                category: calendarEvents[0]?.title ? 'Interview' : 'Preparation', 
                badge: 'High Priority' 
              },
              { 
                time: '11:00 AM - 12:00 PM', 
                title: `ATS Resume Optimization & Bullet Refinement (Current ATS: ${profile.atsScore || 0}%)`, 
                category: 'Resume Suite', 
                badge: 'High Priority' 
              },
              { 
                time: '02:00 PM - 03:30 PM', 
                title: prodTasks.find(t => !t.completed)?.title || `Focus Session: ${profile.targetRole || 'Software Engineering'} Practice`, 
                category: 'Tasks & Focus', 
                badge: 'Medium Priority' 
              },
              { 
                time: '04:00 PM - 05:00 PM', 
                title: `Tailored Job Applications & Network Follow-ups`, 
                category: 'Applications', 
                badge: 'Medium Priority' 
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-[#13151f] rounded-xl border border-[#434656]/30 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#4cd7f6] font-bold w-36">{item.time}</span>
                  <div>
                    <h4 className="text-sm font-bold font-geist text-white">{item.title}</h4>
                    <span className="text-[10px] font-mono text-[#c3c5d9] uppercase">{item.category}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0052ff]/20 text-[#0052ff] border border-[#0052ff]/30 font-bold">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
