import React, { useState } from 'react';
import { Settings, Save, Bell, Clock, Globe, Shield, Check } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

export const ProductivitySettingsTab: React.FC = () => {
  const { prodSettings, updateProdSettings, pushCoachMessage } = useEcosystem();

  const [workingHoursStart, setWorkingHoursStart] = useState(prodSettings.workingHoursStart || '08:30');
  const [workingHoursEnd, setWorkingHoursEnd] = useState(prodSettings.workingHoursEnd || '18:00');
  const [timezone, setTimezone] = useState(prodSettings.timezone || 'PST (UTC-7)');
  const [defaultView, setDefaultView] = useState(prodSettings.defaultCalendarView || 'week');
  const [focusLength, setFocusLength] = useState(prodSettings.defaultFocusLength || 25);
  const [breakLength, setBreakLength] = useState(prodSettings.breakLength || 5);
  const [reminders, setReminders] = useState(prodSettings.reminderPreferences);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProdSettings({
      workingHoursStart,
      workingHoursEnd,
      timezone,
      defaultCalendarView: defaultView as any,
      defaultFocusLength: Number(focusLength),
      breakLength: Number(breakLength),
      reminderPreferences: reminders
    });

    setSavedSuccess(true);
    pushCoachMessage({
      type: 'success',
      message: 'Productivity and Calendar preferences updated!',
      actionTab: 'calendar'
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      <div className="bg-[#191b25] border border-[#434656]/30 p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0052ff]/10 text-[#0052ff] border border-[#0052ff]/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-geist text-white">Productivity & Calendar Settings</h2>
            <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">Configure working hours, timezones, focus defaults & alerts.</p>
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? 'Settings Saved!' : 'Save Preferences'}
        </button>
      </div>

      {/* Working Hours & Timezone */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold font-geist text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0052ff]" /> Working Hours & Timezone
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Workday Start</label>
            <input
              type="text"
              value={workingHoursStart}
              onChange={e => setWorkingHoursStart(e.target.value)}
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Workday End</label>
            <input
              type="text"
              value={workingHoursEnd}
              onChange={e => setWorkingHoursEnd(e.target.value)}
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="PST (UTC-7)">PST (Pacific Daylight Time)</option>
              <option value="EST (UTC-4)">EST (Eastern Daylight Time)</option>
              <option value="CST (UTC-5)">CST (Central Daylight Time)</option>
              <option value="GMT (UTC+0)">GMT (Greenwich Mean Time)</option>
              <option value="IST (UTC+5:30)">IST (Indian Standard Time)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Focus & Calendar Defaults */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold font-geist text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" /> Focus & Calendar Defaults
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Default Calendar View</label>
            <select
              value={defaultView}
              onChange={e => setDefaultView(e.target.value as any)}
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="day">Day View</option>
              <option value="week">Week View</option>
              <option value="month">Month View</option>
              <option value="agenda">Agenda View</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Default Focus Session (mins)</label>
            <input
              type="number"
              value={focusLength}
              onChange={e => setFocusLength(Number(e.target.value))}
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Break Duration (mins)</label>
            <input
              type="number"
              value={breakLength}
              onChange={e => setBreakLength(Number(e.target.value))}
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Reminder Preferences */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold font-geist text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" /> Smart Notification & Alert Triggers
        </h3>

        <div className="space-y-3">
          {[
            { key: 'interviews', label: 'Upcoming Interview Reminders (15m & 1h before)' },
            { key: 'deadlines', label: 'Take-Home Assessment & Application Deadline Alerts' },
            { key: 'goals', label: 'Daily & Weekly Goal Progress Summaries' },
            { key: 'studySessions', label: 'AI Daily Schedule Practice Prompts' }
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-3 bg-[#13151f] rounded-xl border border-[#434656]/20 cursor-pointer">
              <span className="text-xs font-mono text-white">{item.label}</span>
              <input
                type="checkbox"
                checked={(reminders as any)[item.key]}
                onChange={e => setReminders({ ...reminders, [item.key]: e.target.checked })}
                className="w-4 h-4 accent-[#0052ff] rounded cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>
    </form>
  );
};
