import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Globe, 
  MapPin, 
  Users, 
  Briefcase, 
  Edit3, 
  Trash2, 
  X,
  ExternalLink
} from 'lucide-react';
import { CompanyAdmin } from '../../types/admin';

interface CompanyManagementTabProps {
  companies: CompanyAdmin[];
  onAddCompany: (comp: CompanyAdmin) => void;
  onUpdateCompany: (comp: CompanyAdmin) => void;
  onDeleteCompany: (id: string) => void;
}

export const CompanyManagementTab: React.FC<CompanyManagementTabProps> = ({
  companies,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingComp, setEditingComp] = useState<CompanyAdmin | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    industry: 'Cloud / AI',
    location: 'San Francisco, CA',
    hiringStatus: 'Hiring Active' as any,
    employees: '5,000+',
    website: 'https://example.com',
    description: ''
  });

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.hiringStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStartEdit = (comp: CompanyAdmin) => {
    setEditingComp(comp);
    setForm({
      name: comp.name,
      industry: comp.industry,
      location: comp.location,
      hiringStatus: comp.hiringStatus,
      employees: comp.employees,
      website: comp.website,
      description: comp.description
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    if (editingComp) {
      onUpdateCompany({
        ...editingComp,
        name: form.name,
        industry: form.industry,
        location: form.location,
        hiringStatus: form.hiringStatus,
        employees: form.employees,
        website: form.website,
        description: form.description
      });
      setEditingComp(null);
    } else {
      const newComp: CompanyAdmin = {
        id: `comp_${Date.now()}`,
        name: form.name,
        logo: 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?auto=format&fit=crop&w=100&q=80',
        industry: form.industry,
        location: form.location,
        hiringStatus: form.hiringStatus,
        employees: form.employees,
        openJobsCount: 0,
        website: form.website,
        description: form.description
      };
      onAddCompany(newComp);
      setIsAddModalOpen(false);
    }

    setForm({
      name: '',
      industry: 'Cloud / AI',
      location: 'San Francisco, CA',
      hiringStatus: 'Hiring Active',
      employees: '5,000+',
      website: 'https://example.com',
      description: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d90a2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search target company directory by name, industry, location..."
            className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#c3c5d9]"
          >
            <option value="ALL">All Hiring Statuses</option>
            <option value="Hiring Active">Hiring Active</option>
            <option value="Hiring Paused">Hiring Paused</option>
            <option value="Frozen">Frozen</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCompanies.map((c) => (
          <div key={c.id} className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-[#434656]/60 transition-all">
            <div>
              <div className="flex justify-between items-start mb-3">
                {c.logo ? (
                  <img src={c.logo} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-[#434656]/30" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#0052ff]/10 text-[#4cd7f6] flex items-center justify-center font-bold text-sm border border-[#434656]/30">
                    {c.name?.charAt(0) || 'C'}
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  c.hiringStatus === 'Hiring Active' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {c.hiringStatus}
                </span>
              </div>

              <h4 className="text-lg font-bold font-geist text-white flex items-center gap-1.5">
                {c.name}
              </h4>
              <p className="text-xs font-mono text-[#4cd7f6] mb-2">{c.industry}</p>
              <p className="text-xs font-mono text-[#c3c5d9] line-clamp-2 mb-3">{c.description}</p>

              <div className="space-y-1 text-xs font-mono text-[#8d90a2] mb-4">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {c.location}</div>
                <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {c.employees} Employees</div>
                <div className="flex items-center gap-1.5 text-emerald-400"><Briefcase className="w-3.5 h-3.5" /> {c.openJobsCount} Open Jobs Listed</div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#434656]/20 flex items-center justify-between">
              <a 
                href={c.website} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-mono text-[#0052ff] hover:underline flex items-center gap-1"
              >
                Website <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartEdit(c)}
                  className="p-1.5 hover:bg-white/10 text-white rounded-lg transition-all cursor-pointer"
                  title="Edit Company"
                >
                  <Edit3 className="w-4 h-4 text-[#0052ff]" />
                </button>

                <button
                  onClick={() => onDeleteCompany(c.id)}
                  className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer"
                  title="Delete Company"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Company Modal */}
      {(isAddModalOpen || editingComp) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveSubmit} className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-base font-bold font-geist text-white">
                {editingComp ? `Edit Company Specs: ${editingComp.name}` : 'Register Target Company'}
              </h3>
              <button 
                type="button" 
                onClick={() => { setIsAddModalOpen(false); setEditingComp(null); }} 
                className="text-[#8d90a2] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#c3c5d9] mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. OpenAI"
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c3c5d9] mb-1">Industry</label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#c3c5d9] mb-1">Hiring Status</label>
                  <select
                    value={form.hiringStatus}
                    onChange={(e) => setForm({ ...form, hiringStatus: e.target.value as any })}
                    className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="Hiring Active">Hiring Active</option>
                    <option value="Hiring Paused">Hiring Paused</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#c3c5d9] mb-1">Company Overview</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#434656]/30">
              <button
                type="button"
                onClick={() => { setIsAddModalOpen(false); setEditingComp(null); }}
                className="px-4 py-2 bg-[#0c0e17] hover:bg-white/10 text-xs font-mono text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl cursor-pointer"
              >
                Save Company
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
