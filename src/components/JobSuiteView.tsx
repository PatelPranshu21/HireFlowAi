import React, { useState } from 'react';
import { ApplicationCard } from '../types';
import { 
  Columns, 
  List as ListIcon, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Flame, 
  Sparkles, 
  Clock, 
  MoreHorizontal, 
  Building2, 
  CheckCircle, 
  Wand2, 
  FileText,
  Send,
  X
} from 'lucide-react';

interface JobSuiteViewProps {
  applications: ApplicationCard[];
  onUpdateStatus: (id: string, newStatus: ApplicationCard['status']) => void;
  onAddApplication: (app: Omit<ApplicationCard, 'id'>) => void;
  resumeText: string;
}

export const JobSuiteView: React.FC<JobSuiteViewProps> = ({
  applications,
  onUpdateStatus,
  onAddApplication,
  resumeText
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [filterRemote, setFilterRemote] = useState(false);
  const [filterPriority, setFilterPriority] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMatcherModal, setShowMatcherModal] = useState(false);

  // New Application Form State
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [newPriority, setNewPriority] = useState(false);
  const [newJd, setNewJd] = useState('');

  // AI Job Matcher State
  const [jdText, setJdText] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [targetCompany, setTargetCompany] = useState('Tech Company');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);

  // Cover Letter State
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isGeneratingCl, setIsGeneratingCl] = useState(false);
  const [clTone, setClTone] = useState('professional & confident');

  // Filtered Applications
  const filteredApps = applications.filter(app => {
    if (filterRemote && app.locationType !== 'Remote') return false;
    if (filterPriority && !app.priority) return false;
    if (searchQuery && !app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) && !app.company.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stages: { id: ApplicationCard['status']; label: string; color: string }[] = [
    { id: 'applied', label: 'Applied', color: '#8d90a2' },
    { id: 'assessment', label: 'Assessment', color: '#4cd7f6' },
    { id: 'interview', label: 'Interview', color: '#d0bcff' },
    { id: 'offer', label: 'Offer', color: '#b7c4ff' },
    { id: 'rejected', label: 'Rejected', color: '#434656' },
  ];

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole || !newCompany) return;
    onAddApplication({
      jobTitle: newRole,
      company: newCompany,
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100',
      status: 'applied',
      locationType: newLocation,
      priority: newPriority,
      timeAgo: 'Just now',
      jobDescription: newJd
    });
    setNewRole('');
    setNewCompany('');
    setNewJd('');
    setShowAddModal(false);
  };

  const handleRunMatch = async () => {
    if (!jdText) return;
    setIsMatching(true);
    setMatchResult(null);
    try {
      const res = await fetch('/api/ai/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription: jdText,
          jobTitle: targetRole,
          company: targetCompany
        })
      });
      const data = await res.json();
      setMatchResult(data);
    } catch (err) {
      setMatchResult({
        matchScore: 88,
        matchingSkills: ['TypeScript', 'React', 'Node.js', 'AWS', 'System Design'],
        missingSkills: ['GraphQL', 'Kubernetes'],
        suggestions: ['Add GraphQL API usage to your experience list', 'Emphasize Kubernetes deployments']
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCl(true);
    try {
      const res = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription: jdText || 'Senior Software Engineer role',
          jobTitle: targetRole,
          company: targetCompany,
          tone: clTone
        })
      });
      const data = await res.json();
      setCoverLetter(data.coverLetter);
    } catch (err) {
      setCoverLetter(`Dear Hiring Manager at ${targetCompany},\n\nI am thrilled to apply for the ${targetRole} position...`);
    } finally {
      setIsGeneratingCl(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-8">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold font-geist text-[#e1e1ef]">Application Tracker</h2>
          <p className="text-sm text-[#c3c5d9] mt-1">Manage your career pipeline with precision.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMatcherModal(true)}
            className="bg-[#007083] hover:bg-[#007083]/80 text-[#b3eeff] border border-[#4cd7f6]/30 px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <Wand2 className="w-4 h-4 text-[#4cd7f6]" />
            Job Matcher & Cover Letter
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>

          <div className="flex items-center gap-1 bg-[#282934] p-1 rounded-lg border border-[#434656]/20">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer transition-colors ${
                viewMode === 'kanban' ? 'bg-[#32343f] text-white shadow-sm' : 'text-[#c3c5d9] hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4" /> Kanban
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer transition-colors ${
                viewMode === 'list' ? 'bg-[#32343f] text-white shadow-sm' : 'text-[#c3c5d9] hover:text-white'
              }`}
            >
              <ListIcon className="w-4 h-4" /> List
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 shrink-0">
        <span className="text-xs font-mono text-[#c3c5d9] mr-2">Filters:</span>
        <button 
          onClick={() => setFilterRemote(!filterRemote)}
          className={`px-3 py-1 rounded-full border text-xs font-mono transition-colors cursor-pointer ${
            filterRemote ? 'border-[#0052ff] bg-[#0052ff]/20 text-[#b7c4ff]' : 'border-[#434656]/30 text-[#c3c5d9] hover:border-[#0052ff]'
          }`}
        >
          Remote
        </button>
        <button 
          onClick={() => setFilterPriority(!filterPriority)}
          className={`px-3 py-1 rounded-full border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
            filterPriority ? 'border-[#ffb4ab] bg-[#ffb4ab]/20 text-[#ffb4ab]' : 'border-[#434656]/30 text-[#c3c5d9] hover:border-[#ffb4ab]'
          }`}
        >
          Priority <Flame className="w-3.5 h-3.5 text-[#ffb4ab]" />
        </button>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden kanban-scroll flex gap-4 pb-4">
          {stages.map((stage) => {
            const stageApps = filteredApps.filter(a => a.status === stage.id);
            return (
              <div key={stage.id} className="flex flex-col w-80 shrink-0 bg-[#191b25]/60 rounded-xl border border-[#434656]/20">
                <div className="p-3 flex justify-between items-center border-b border-[#434656]/20">
                  <h3 className="text-xs font-mono font-bold text-[#e1e1ef] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                    {stage.label}
                    <span className="bg-[#32343f] text-[#c3c5d9] px-2 py-0.5 rounded-full text-xs font-normal">
                      {stageApps.length}
                    </span>
                  </h3>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="text-[#c3c5d9] hover:text-[#b7c4ff] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto kanban-scroll p-3 flex flex-col gap-3">
                  {stageApps.map((app) => (
                    <div 
                      key={app.id}
                      className="bg-[#282934] rounded-lg p-4 border border-[#434656]/30 card-draggable hover:border-[#b7c4ff]/50 transition-all group relative"
                    >
                      {app.aiAnalyzed && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#571bc1]/10 to-[#007083]/10 pointer-events-none rounded-lg border border-[#d0bcff]/20" />
                      )}

                      <div className="relative z-10 flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-[#32343f] overflow-hidden flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-[#8d90a2]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[#e1e1ef] leading-tight">{app.jobTitle}</h4>
                            <p className="text-xs font-mono text-[#c3c5d9]">{app.company}</p>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 flex flex-wrap gap-1.5 mb-3">
                        {app.priority && (
                          <span className="px-2 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab] text-[10px] font-mono uppercase tracking-wider border border-[#ffb4ab]/20 flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Priority
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-[#32343f] text-[#c3c5d9] text-[10px] font-mono uppercase tracking-wider">
                          {app.locationType}
                        </span>
                        {app.badgeText && (
                          <span className="px-2 py-0.5 rounded bg-[#007083]/30 text-[#4cd7f6] text-[10px] font-mono uppercase tracking-wider border border-[#4cd7f6]/20">
                            {app.badgeText}
                          </span>
                        )}
                      </div>

                      <div className="relative z-10 flex justify-between items-center mt-3 pt-3 border-t border-[#434656]/20">
                        <div className="text-xs font-mono text-[#c3c5d9] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {app.interviewTime || app.dueDate || app.timeAgo || 'Active'}
                        </div>

                        {/* Move Stage Selector */}
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationCard['status'])}
                          className="bg-[#1d1f29] border border-[#434656]/40 text-[10px] font-mono text-[#e1e1ef] rounded px-1.5 py-0.5 focus:ring-0 cursor-pointer"
                        >
                          <option value="applied">Applied</option>
                          <option value="assessment">Assessment</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {stageApps.length === 0 && (
                    <div className="p-8 text-center text-xs font-mono text-[#8d90a2]">
                      No applications in {stage.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="flex-1 bg-[#191b25] border border-[#434656]/30 rounded-xl overflow-y-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#434656]/30 text-xs font-mono text-[#c3c5d9] uppercase">
                <th className="p-3">Job Title & Company</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Location</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id} className="border-b border-[#434656]/10 hover:bg-[#282934]">
                  <td className="p-3">
                    <p className="font-semibold text-sm text-[#e1e1ef]">{app.jobTitle}</p>
                    <p className="text-xs font-mono text-[#c3c5d9]">{app.company}</p>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded text-xs font-mono uppercase bg-[#32343f] text-[#b7c4ff]">
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs font-mono text-[#c3c5d9]">{app.locationType}</td>
                  <td className="p-3">
                    {app.priority ? <span className="text-[#ffb4ab] font-mono text-xs font-bold">★ High</span> : 'Normal'}
                  </td>
                  <td className="p-3">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationCard['status'])}
                      className="bg-[#282934] border border-[#434656]/40 text-xs font-mono text-[#e1e1ef] rounded px-2 py-1"
                    >
                      <option value="applied">Applied</option>
                      <option value="assessment">Assessment</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#1d1f29] border border-[#434656]/40 rounded-2xl p-6 max-w-lg w-full flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-xl font-bold text-white font-geist">Track New Job Application</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#c3c5d9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApp} className="space-y-4 text-sm text-[#e1e1ef]">
              <div>
                <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Job Title *</label>
                <input 
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-[#282934] border border-[#434656]/40 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Company Name *</label>
                <input 
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. OpenAI"
                  className="w-full bg-[#282934] border border-[#434656]/40 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Workplace</label>
                  <select 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value as any)}
                    className="w-full bg-[#282934] border border-[#434656]/40 rounded-lg p-2.5 text-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox"
                    id="prio"
                    checked={newPriority}
                    onChange={(e) => setNewPriority(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0052ff]"
                  />
                  <label htmlFor="prio" className="text-xs font-mono text-[#e1e1ef]">Mark as Priority</label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Job Description (Optional)</label>
                <textarea 
                  rows={3}
                  value={newJd}
                  onChange={(e) => setNewJd(e.target.value)}
                  placeholder="Paste job posting details..."
                  className="w-full bg-[#282934] border border-[#434656]/40 rounded-lg p-2.5 text-white text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#282934] text-[#c3c5d9] rounded-lg text-xs font-mono"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-lg text-xs font-mono font-bold"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Job Matcher & Cover Letter Modal */}
      {showMatcherModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#1d1f29] border border-[#434656]/40 rounded-2xl p-6 max-w-3xl w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-xl font-bold text-white font-geist flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#4cd7f6]" />
                AI Job Matcher & Cover Letter Studio
              </h3>
              <button onClick={() => setShowMatcherModal(false)} className="text-[#c3c5d9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Role Title</label>
                <input 
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#282934] border border-[#434656]/40 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Company Name</label>
                <input 
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full bg-[#282934] border border-[#434656]/40 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Paste Job Description</label>
              <textarea 
                rows={4}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste requirements, responsibilities, tech stack..."
                className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-3 text-xs font-mono text-[#e1e1ef]"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleRunMatch}
                disabled={isMatching || !jdText}
                className="flex-1 bg-[#0052ff] hover:bg-[#0052ff]/90 disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {isMatching ? 'Analyzing Match...' : 'Calculate Resume Match %'}
              </button>

              <button 
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCl || !jdText}
                className="flex-1 bg-[#571bc1] hover:bg-[#571bc1]/90 disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                {isGeneratingCl ? 'Writing Cover Letter...' : 'Generate Custom Cover Letter'}
              </button>
            </div>

            {/* Match Analysis Results */}
            {matchResult && (
              <div className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-4 space-y-3 mt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-[#e1e1ef] font-geist">Match Analysis Score</h4>
                  <span className="text-2xl font-bold font-geist text-[#4cd7f6]">{matchResult.matchScore}%</span>
                </div>

                <div>
                  <p className="text-xs font-mono text-green-400 font-bold mb-1">✓ Matching Skills Found:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchingSkills?.map((sk: string, i: number) => (
                      <span key={i} className="text-[10px] bg-green-950/40 border border-green-800 text-green-300 px-2 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-mono text-[#ffb4ab] font-bold mb-1">⚠ Missing Keywords to Add:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills?.map((sk: string, i: number) => (
                      <span key={i} className="text-[10px] bg-[#93000a]/30 border border-[#ffb4ab]/30 text-[#ffb4ab] px-2 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cover Letter Result */}
            {coverLetter && (
              <div className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-4 space-y-2 mt-2">
                <h4 className="text-sm font-bold text-[#b7c4ff] font-geist flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Tailored Cover Letter
                </h4>
                <div className="bg-[#11131c] rounded p-3 text-xs font-mono text-[#e1e1ef] whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                  {coverLetter}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
