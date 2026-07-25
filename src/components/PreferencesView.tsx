import React, { useState } from 'react';
import { Settings, Save, Check, Sparkles, Building2, MapPin, DollarSign, Code, Briefcase, RefreshCw } from 'lucide-react';
import { UserProfile, JobPreferences } from '../types';

interface PreferencesViewProps {
  user: UserProfile;
  onSavePreferences: (prefs: JobPreferences) => void;
}

const DEFAULT_PREFERENCES: JobPreferences = {
  preferredRoles: ['Senior Software Engineer', 'Full Stack Engineer', 'Frontend Architect', 'Engineering Manager'],
  preferredCompanies: ['Google', 'Microsoft', 'OpenAI', 'Apple', 'Meta', 'Stripe'],
  preferredCities: ['San Francisco, CA', 'Seattle, WA', 'New York, NY', 'Remote', 'Bengaluru, India'],
  remotePreference: 'Hybrid',
  expectedSalaryMin: 180000,
  expectedSalaryMax: 300000,
  experienceLevel: 'Senior Level (6+ yrs)',
  preferredTechnologies: ['TypeScript', 'React', 'Next.js', 'Python', 'Go', 'Distributed Systems'],
  preferredIndustries: ['AI & Machine Learning', 'Cloud SaaS', 'Fintech', 'Developer Tools']
};

export const PreferencesView: React.FC<PreferencesViewProps> = ({
  user,
  onSavePreferences
}) => {
  const [prefs, setPrefs] = useState<JobPreferences>(user.preferences || DEFAULT_PREFERENCES);
  const [isSaved, setIsSaved] = useState(false);

  // Helper input additions
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newTech, setNewTech] = useState('');

  const handleAddTag = (field: keyof JobPreferences, val: string, setVal: React.Dispatch<React.SetStateAction<string>>) => {
    if (!val.trim()) return;
    const current = (prefs[field] as string[]) || [];
    if (!current.includes(val.trim())) {
      setPrefs({ ...prefs, [field]: [...current, val.trim()] });
    }
    setVal('');
  };

  const handleRemoveTag = (field: keyof JobPreferences, itemToRemove: string) => {
    const current = (prefs[field] as string[]) || [];
    setPrefs({ ...prefs, [field]: current.filter(item => item !== itemToRemove) });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences(prefs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-[#0052ff]/10 border border-[#0052ff]/30 text-[#4cd7f6]">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-geist text-white">Job Search Preferences</h1>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#571bc1]/20 text-[#d0bcff] border border-[#571bc1]/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Active
              </span>
            </div>
            <p className="text-xs font-mono text-[#a1a3b8] mt-1">
              Customize your target roles, companies, salary goals, and location preferences to personalize your AI job recommendations.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
        >
          {isSaved ? <Check className="w-4 h-4 text-[#8d90a2]" /> : <Save className="w-4 h-4" />}
          {isSaved ? 'Preferences Saved & Re-scored!' : 'Save & Refresh Matches'}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Target Roles & Companies */}
        <div className="space-y-6">
          
          {/* Target Roles */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0052ff]" /> Preferred Roles
              </label>
              <span className="text-xs font-mono text-[#a1a3b8]">{prefs.preferredRoles.length} Selected</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add role e.g. Senior Backend Engineer"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag('preferredRoles', newRole, setNewRole);
                  }
                }}
                className="flex-1 bg-[#11131c] border border-[#434656]/40 rounded-xl px-4 py-2 text-xs text-white placeholder-[#a1a3b8] focus:outline-none focus:border-[#0052ff]"
              />
              <button
                type="button"
                onClick={() => handleAddTag('preferredRoles', newRole, setNewRole)}
                className="bg-[#212433] hover:bg-[#2e3245] text-[#4cd7f6] px-4 py-2 rounded-xl text-xs font-mono font-bold border border-[#0052ff]/30 cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {prefs.preferredRoles.map((role) => (
                <span key={role} className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#0052ff]/10 text-[#4cd7f6] border border-[#0052ff]/30 flex items-center gap-2">
                  {role}
                  <button type="button" onClick={() => handleRemoveTag('preferredRoles', role)} className="hover:text-white cursor-pointer">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Companies */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0052ff]" /> Preferred Target Companies
              </label>
              <span className="text-xs font-mono text-[#a1a3b8]">{prefs.preferredCompanies.length} Selected</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add company e.g. OpenAI, Stripe"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag('preferredCompanies', newCompany, setNewCompany);
                  }
                }}
                className="flex-1 bg-[#11131c] border border-[#434656]/40 rounded-xl px-4 py-2 text-xs text-white placeholder-[#a1a3b8] focus:outline-none focus:border-[#0052ff]"
              />
              <button
                type="button"
                onClick={() => handleAddTag('preferredCompanies', newCompany, setNewCompany)}
                className="bg-[#212433] hover:bg-[#2e3245] text-[#4cd7f6] px-4 py-2 rounded-xl text-xs font-mono font-bold border border-[#0052ff]/30 cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {prefs.preferredCompanies.map((comp) => (
                <span key={comp} className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#571bc1]/20 text-[#d0bcff] border border-[#571bc1]/40 flex items-center gap-2">
                  {comp}
                  <button type="button" onClick={() => handleRemoveTag('preferredCompanies', comp)} className="hover:text-white cursor-pointer">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Technologies */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-[#0052ff]" /> Preferred Tech Stack & Tools
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tech e.g. React, Kubernetes"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag('preferredTechnologies', newTech, setNewTech);
                  }
                }}
                className="flex-1 bg-[#11131c] border border-[#434656]/40 rounded-xl px-4 py-2 text-xs text-white placeholder-[#a1a3b8] focus:outline-none focus:border-[#0052ff]"
              />
              <button
                type="button"
                onClick={() => handleAddTag('preferredTechnologies', newTech, setNewTech)}
                className="bg-[#212433] hover:bg-[#2e3245] text-[#4cd7f6] px-4 py-2 rounded-xl text-xs font-mono font-bold border border-[#0052ff]/30 cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {prefs.preferredTechnologies.map((tech) => (
                <span key={tech} className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#007083]/20 text-[#4cd7f6] border border-[#007083]/40 flex items-center gap-2">
                  {tech}
                  <button type="button" onClick={() => handleRemoveTag('preferredTechnologies', tech)} className="hover:text-white cursor-pointer">×</button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Location, Remote, Salary, Experience */}
        <div className="space-y-6">
          
          {/* Work Location & Remote Mode */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-6">
            <div>
              <label className="text-sm font-bold font-mono text-white flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#0052ff]" /> Remote Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Remote', 'Hybrid', 'On-site', 'Any'] as const).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setPrefs({ ...prefs, remotePreference: mode })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      prefs.remotePreference === mode
                        ? 'bg-[#0052ff] border-[#0052ff] text-white shadow-md'
                        : 'bg-[#11131c] border-[#434656]/40 text-[#a1a3b8] hover:text-white hover:bg-[#212433]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold font-mono text-white flex items-center gap-2 mb-3">
                Preferred Cities / Regions
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add location e.g. San Francisco, CA"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag('preferredCities', newCity, setNewCity);
                    }
                  }}
                  className="flex-1 bg-[#11131c] border border-[#434656]/40 rounded-xl px-4 py-2 text-xs text-white placeholder-[#a1a3b8] focus:outline-none focus:border-[#0052ff]"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag('preferredCities', newCity, setNewCity)}
                  className="bg-[#212433] hover:bg-[#2e3245] text-[#4cd7f6] px-4 py-2 rounded-xl text-xs font-mono font-bold border border-[#0052ff]/30 cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-3">
                {prefs.preferredCities.map((city) => (
                  <span key={city} className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#11131c] text-[#e1e1ef] border border-[#434656]/30 flex items-center gap-2">
                    {city}
                    <button type="button" onClick={() => handleRemoveTag('preferredCities', city)} className="hover:text-white cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Expected Salary Goal */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#8d90a2]" /> Target Minimum Salary ($ USD / yr)
              </label>
              <span className="text-sm font-bold font-mono text-[#8d90a2]">
                ${prefs.expectedSalaryMin.toLocaleString()} / yr
              </span>
            </div>

            <input
              type="range"
              min={80000}
              max={400000}
              step={10000}
              value={prefs.expectedSalaryMin}
              onChange={(e) => setPrefs({ ...prefs, expectedSalaryMin: Number(e.target.value) })}
              className="w-[#100%] h-2 bg-[#11131c] rounded-lg appearance-none cursor-pointer accent-[#0052ff]"
            />

            <div className="flex justify-between text-[11px] font-mono text-[#a1a3b8]">
              <span>$80k</span>
              <span>$200k</span>
              <span>$400k+</span>
            </div>
          </div>

          {/* Experience Level */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
            <label className="text-sm font-bold font-mono text-white block">
              Experience Level
            </label>
            <select
              value={prefs.experienceLevel}
              onChange={(e) => setPrefs({ ...prefs, experienceLevel: e.target.value })}
              className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0052ff] cursor-pointer font-mono"
            >
              <option value="Entry Level (0-2 yrs)">Entry Level (0-2 yrs)</option>
              <option value="Mid Level (3-5 yrs)">Mid Level (3-5 yrs)</option>
              <option value="Senior Level (6+ yrs)">Senior Level (6+ yrs)</option>
              <option value="Lead / Staff Level (8+ yrs)">Lead / Staff Level (8+ yrs)</option>
              <option value="Executive / VP Level">Executive / VP Level</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Save Preferences & Recalculate AI Match Scores
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};
