import React, { useState } from 'react';
import { companyInterviewProfiles } from '../../data/interviewData';
import { CompanyInterviewProfile } from '../../types';
import { 
  Building2, 
  Search, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Code, 
  MessageSquare, 
  Play, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface CompanyPrepTabProps {
  onStartCompanyMock: (companyName: string) => void;
}

export const CompanyPrepTab: React.FC<CompanyPrepTabProps> = ({ onStartCompanyMock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('google');
  const [companyProfiles, setCompanyProfiles] = useState<CompanyInterviewProfile[]>(companyInterviewProfiles);

  // Filter companies
  const filteredCompanies = companyProfiles.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.techStack.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || c.category.includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  const selectedCompany = companyProfiles.find(c => c.id === selectedCompanyId) || companyProfiles[0];

  const handleToggleChecklist = (companyId: string, taskId: string) => {
    setCompanyProfiles(prev => prev.map(c => {
      if (c.id !== companyId) return c;
      return {
        ...c,
        prepChecklist: c.prepChecklist.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task)
      };
    }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search & Filter Header */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-geist text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#0052ff]" />
              Company-Specific Interview Guides
            </h2>
            <p className="text-xs text-[#c3c5d9] mt-1">
              Preparation blueprints for 21+ top tier tech companies, including hiring process, questions, salary ranges & checklists.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#8d90a2] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company or tech stack..."
              className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-[#8d90a2] focus:outline-none focus:border-[#0052ff]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-2 pt-2 scrollbar-none">
          {['All', 'FAANG / Big Tech', 'E-Commerce & Cloud', 'Fintech & Payments', 'Enterprise SaaS', 'IT Services & Consulting'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-[#0052ff] text-white' 
                  : 'bg-[#11131c] text-[#c3c5d9] hover:bg-[#282934]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Company Selector & Detailed View */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Company Cards List */}
        <div className="col-span-12 lg:col-span-4 space-y-3 max-h-[800px] overflow-y-auto pr-1">
          {filteredCompanies.map(comp => {
            const isSelected = comp.id === selectedCompany.id;
            const completedChecklistCount = comp.prepChecklist.filter(t => t.completed).length;

            return (
              <div
                key={comp.id}
                onClick={() => setSelectedCompanyId(comp.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#191b25] border-[#0052ff] ai-gradient-border shadow-lg' 
                    : 'bg-[#191b25]/60 border-[#434656]/30 hover:border-[#434656]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    {comp.logo ? (
                      <img src={comp.logo} alt={comp.name} className="w-8 h-8 rounded-lg object-cover border border-[#434656]/30" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#0052ff]/10 text-[#4cd7f6] flex items-center justify-center font-bold text-xs border border-[#434656]/30">
                        {comp.name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold font-geist text-white">{comp.name}</h3>
                      <span className="text-[10px] font-mono text-[#c3c5d9]">{comp.category}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    comp.estimatedDifficulty === 'Hard' ? 'bg-[#ff4d4d]/20 text-[#ff8080]' : 'bg-[#0052ff]/20 text-[#4cd7f6]'
                  }`}>
                    {comp.estimatedDifficulty}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-[#c3c5d9] pt-2 border-t border-[#434656]/20 mt-2">
                  <span>{comp.salaryRange.split('/')[0]}</span>
                  <span>Checklist: {completedChecklistCount}/{comp.prepChecklist.length}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Company Profile Guide */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 md:p-8 space-y-6">
            {/* Profile Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#434656]/20 pb-6">
              <div className="flex items-center gap-4">
                {selectedCompany.logo ? (
                  <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-14 h-14 rounded-2xl object-cover border border-[#434656]/40" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#0052ff]/10 text-[#4cd7f6] flex items-center justify-center font-bold text-lg border border-[#434656]/40">
                    {selectedCompany.name?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold font-geist text-white">{selectedCompany.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0052ff]/20 text-[#4cd7f6] font-mono text-xs font-bold border border-[#0052ff]/30">
                      {selectedCompany.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#c3c5d9] mt-1">{selectedCompany.overview}</p>
                </div>
              </div>

              <button
                onClick={() => onStartCompanyMock(selectedCompany.name)}
                className="px-5 py-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-[#0052ff]/25 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                Start {selectedCompany.name} Mock
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#11131c] p-3.5 rounded-xl border border-[#434656]/20">
                <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#00d26a]" /> Salary Range
                </span>
                <p className="text-xs font-bold text-white mt-1 font-mono">{selectedCompany.salaryRange}</p>
              </div>

              <div className="bg-[#11131c] p-3.5 rounded-xl border border-[#434656]/20">
                <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#ff8000]" /> Hiring Timeline
                </span>
                <p className="text-xs font-bold text-white mt-1 font-mono">{selectedCompany.hiringTimeline}</p>
              </div>

              <div className="bg-[#11131c] p-3.5 rounded-xl border border-[#434656]/20">
                <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#4cd7f6]" /> Difficulty
                </span>
                <p className="text-xs font-bold text-[#4cd7f6] mt-1 font-mono">{selectedCompany.estimatedDifficulty}</p>
              </div>

              <div className="bg-[#11131c] p-3.5 rounded-xl border border-[#434656]/20">
                <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#b7c4ff]" /> Checklist
                </span>
                <p className="text-xs font-bold text-[#b7c4ff] mt-1 font-mono">
                  {selectedCompany.prepChecklist.filter(t => t.completed).length}/{selectedCompany.prepChecklist.length} Tasks
                </p>
              </div>
            </div>

            {/* Interview Process Stages */}
            <div>
              <h3 className="text-sm font-bold font-geist text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0052ff]" />
                {selectedCompany.name} Interview Process & Stages
              </h3>

              <div className="space-y-2">
                {selectedCompany.interviewStages.map((stage, idx) => (
                  <div key={idx} className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#0052ff]/20 text-[#4cd7f6] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#0052ff]/30">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-[#e1e1ef] font-medium">{stage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack & Focus Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20 space-y-2">
                <h4 className="text-xs font-mono text-[#4cd7f6] uppercase font-bold flex items-center gap-1.5">
                  <Code className="w-4 h-4" /> Coding & Algorithmic Focus
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedCompany.codingFocus.map((f, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-[#0052ff]/10 text-[#b7c4ff] font-mono text-[11px] border border-[#0052ff]/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20 space-y-2">
                <h4 className="text-xs font-mono text-[#d0bcff] uppercase font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Behavioral & Culture Focus
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedCompany.behaviouralFocus.map((f, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-[#571bc1]/10 text-[#d0bcff] font-mono text-[11px] border border-[#571bc1]/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preparation Checklist */}
            <div className="bg-[#11131c] p-5 rounded-xl border border-[#434656]/30">
              <h3 className="text-sm font-bold font-geist text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00d26a]" />
                {selectedCompany.name} Preparation Checklist
              </h3>

              <div className="space-y-2">
                {selectedCompany.prepChecklist.map(item => (
                  <label
                    key={item.id}
                    onClick={() => handleToggleChecklist(selectedCompany.id, item.id)}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#191b25] transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-[#0052ff] bg-[#0c0e17] border-[#434656]/50 focus:ring-0 cursor-pointer"
                    />
                    <span className={`text-xs ${item.completed ? 'line-through text-[#8d90a2]' : 'text-white'}`}>
                      {item.task}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
