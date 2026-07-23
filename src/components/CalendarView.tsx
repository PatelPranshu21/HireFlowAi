import React from 'react';
import { Calendar as CalendarIcon, Clock, Video, FileCheck, Plus } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const events = [
    { id: '1', title: 'Senior Designer Round 2 Interview', company: 'CreativeMinds', date: 'Tomorrow', time: '2:00 PM', type: 'interview' },
    { id: '2', title: 'EcoTech Take-Home Assessment Due', company: 'EcoTech Solutions', date: 'In 2 days', time: '11:59 PM', type: 'assessment' },
    { id: '3', title: 'Follow up on Stripe Application', company: 'Stripe', date: 'Friday', time: '10:00 AM', type: 'followup' }
  ];

  return (
    <div className="flex-1 p-8 max-w-[1280px] mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold font-geist text-[#e1e1ef]">Career Calendar</h2>
          <p className="text-sm text-[#c3c5d9] mt-1 font-mono">Keep track of interview slots, take-home tests, and follow-up deadlines.</p>
        </div>
        <button 
          onClick={() => alert("Calendar Sync: Synced with Google Calendar & Outlook")}
          className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Event / Sync Calendar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((evt) => (
          <div key={evt.id} className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                  evt.type === 'interview' ? 'bg-[#571bc1]/20 text-[#d0bcff] border border-[#571bc1]/30' : 'bg-[#007083]/20 text-[#4cd7f6]'
                }`}>
                  {evt.type}
                </span>
                <span className="text-xs font-mono text-[#c3c5d9]">{evt.company}</span>
              </div>
              <h3 className="text-base font-bold text-white font-geist mb-2">{evt.title}</h3>
            </div>

            <div className="pt-4 border-t border-[#434656]/20 flex justify-between items-center text-xs font-mono text-[#4cd7f6]">
              <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {evt.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {evt.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
