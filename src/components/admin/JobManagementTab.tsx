import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Star, 
  Eye, 
  CheckCircle2, 
  EyeOff, 
  Trash2, 
  X,
  ExternalLink,
  Award
} from 'lucide-react';
import { JobAdmin } from '../../types/admin';

interface JobManagementTabProps {
  jobs: JobAdmin[];
  onAddJob: (job: JobAdmin) => void;
  onUpdateJob: (job: JobAdmin) => void;
  onDeleteJob: (id: string) => void;
}

export const JobManagementTab: React.FC<JobManagementTabProps> = ({
  jobs,
  onAddJob,
  onUpdateJob,
  onDeleteJob
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    company: '',
    provider: 'Internal' as any,
    location: 'Remote (US)',
    salary: '$160,000 - $220,000',
    status: 'Approved' as any
  });

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    const matchesProvider = providerFilter === 'ALL' || j.provider === providerFilter;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.company) return;

    const newJob: JobAdmin = {
      id: `job_${Date.now()}`,
      title: form.title,
      company: form.company,
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=100&q=80',
      provider: form.provider,
      location: form.location,
      salary: form.salary,
      applicationsCount: 0,
      views: 1,
      avgMatchScore: 88,
      status: form.status,
      postedDate: new Date().toISOString().split('T')[0]
    };

    onAddJob(newJob);
    setIsAddModalOpen(false);
    setForm({
      title: '',
      company: '',
      provider: 'Internal',
      location: 'Remote (US)',
      salary: '$160,000 - $220,000',
      status: 'Approved'
    });
  };

  const handleToggleFeature = (job: JobAdmin) => {
    const nextStatus = job.status === 'Featured' ? 'Approved' : 'Featured';
    onUpdateJob({ ...job, status: nextStatus });
  };

  const handleToggleHide = (job: JobAdmin) => {
    const nextStatus = job.status === 'Hidden' ? 'Approved' : 'Hidden';
    onUpdateJob({ ...job, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Bar */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d90a2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search job postings across providers by title, company..."
            className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#c3c5d9]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Featured">Featured</option>
            <option value="Hidden">Hidden</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#c3c5d9]"
          >
            <option value="ALL">All Providers</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Greenhouse">Greenhouse</option>
            <option value="Lever">Lever</option>
            <option value="Internal">Internal</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Post Job</span>
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl overflow-hidden shadow-md font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0c0e17] border-b border-[#434656]/30 text-[#8d90a2] uppercase text-[10px]">
                <th className="py-3 px-4">Job Title & Company</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Salary Range</th>
                <th className="py-3 px-4">Match Score</th>
                <th className="py-3 px-4">Apps</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#434656]/20">
              {filteredJobs.map((j) => (
                <tr key={j.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {j.logo ? (
                        <img src={j.logo} alt="" className="w-8 h-8 rounded-lg object-cover border border-[#434656]/30" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#0052ff]/10 text-[#4cd7f6] flex items-center justify-center font-bold text-xs border border-[#434656]/30">
                          {j.company?.charAt(0) || 'J'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white font-geist flex items-center gap-1">
                          {j.title}
                          {j.status === 'Featured' && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        </div>
                        <div className="text-[11px] text-[#8d90a2]">{j.company}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[#4cd7f6]">{j.provider}</td>
                  <td className="py-3 px-4 text-[#c3c5d9]">{j.location}</td>
                  <td className="py-3 px-4 font-bold text-white">{j.salary}</td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-400">{j.avgMatchScore}%</span>
                  </td>

                  <td className="py-3 px-4 text-white font-bold">{j.applicationsCount}</td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      j.status === 'Featured'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : j.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {j.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleFeature(j)}
                        className="p-1.5 hover:bg-amber-500/10 text-amber-400 rounded-lg transition-all cursor-pointer"
                        title={j.status === 'Featured' ? 'Unfeature Job' : 'Mark as Featured Job'}
                      >
                        <Star className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleHide(j)}
                        className="p-1.5 hover:bg-white/10 text-[#c3c5d9] rounded-lg transition-all cursor-pointer"
                        title={j.status === 'Hidden' ? 'Unhide Job' : 'Hide Job'}
                      >
                        {j.status === 'Hidden' ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => onDeleteJob(j.id)}
                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-base font-bold font-geist text-white">Post Custom Opportunity</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-[#8d90a2] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#c3c5d9] mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#c3c5d9] mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Stripe"
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c3c5d9] mb-1">Provider Source</label>
                  <select
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value as any })}
                    className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="Internal">Internal Direct</option>
                    <option value="LinkedIn">LinkedIn API</option>
                    <option value="Greenhouse">Greenhouse</option>
                    <option value="Lever">Lever</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#c3c5d9] mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#434656]/30">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-[#0c0e17] hover:bg-white/10 text-xs font-mono text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl cursor-pointer"
              >
                Publish Job
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
