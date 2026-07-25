import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Download, 
  Eye, 
  Ban, 
  CheckCircle2, 
  Key, 
  ShieldAlert, 
  Award, 
  Briefcase, 
  FileText, 
  MoreVertical,
  X,
  Edit3,
  Trash2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { AdminUser } from '../../types/admin';

interface UserManagementTabProps {
  users: AdminUser[];
  onUpdateUser: (updatedUser: AdminUser) => void;
  onAddUser: (newUser: AdminUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  onUpdateUser,
  onAddUser,
  onDeleteUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');

  // Modals state
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<AdminUser | null>(null);
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<AdminUser | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [resetPasswordToast, setResetPasswordToast] = useState<string | null>(null);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'Admin' as 'Admin' | 'Super Admin' | 'Auditor',
    subscriptionPlan: 'Pro' as any,
    accountStatus: 'Active' as any,
    location: 'San Francisco, CA'
  });

  // Filter logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.accountStatus === statusFilter;
    const matchesPlan = planFilter === 'ALL' || user.subscriptionPlan === planFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesPlan;
  });

  const handleExportCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Plan', 'EmployabilityScore', 'Applications'];
    const rows = filteredUsers.map(u => [
      u.id, `"${u.name}"`, u.email, u.role, u.accountStatus, u.subscriptionPlan, u.employabilityScore, u.applicationsCount
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hireflow_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleSuspend = (user: AdminUser) => {
    const nextStatus = user.accountStatus === 'Suspended' ? 'Active' : 'Suspended';
    onUpdateUser({ ...user, accountStatus: nextStatus });
  };

  const handleResetPassword = (user: AdminUser) => {
    setResetPasswordToast(`Password reset link generated for ${user.email}! Link copied to admin clipboard.`);
    setTimeout(() => setResetPasswordToast(null), 4000);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;

    const created: AdminUser = {
      id: `usr_${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: newUserForm.role,
      accountStatus: newUserForm.accountStatus,
      registrationDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Just now',
      subscriptionPlan: newUserForm.subscriptionPlan,
      trialStatus: 'active',
      employabilityScore: 82,
      resumeScore: 80,
      applicationsCount: 0,
      location: newUserForm.location
    };

    onAddUser(created);
    setIsAddUserModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      role: 'Admin',
      subscriptionPlan: 'Pro',
      accountStatus: 'Active',
      location: 'San Francisco, CA'
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {resetPasswordToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl text-xs font-mono flex items-center justify-between shadow-lg animate-fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {resetPasswordToast}
          </span>
          <button onClick={() => setResetPasswordToast(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control & Action Bar */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d90a2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidates by name, email, or user ID..."
            className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff] placeholder-[#8d90a2]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#c3c5d9] focus:outline-none focus:border-[#0052ff] cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Auditor">Auditor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#c3c5d9] focus:outline-none focus:border-[#0052ff] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#c3c5d9] focus:outline-none focus:border-[#0052ff] cursor-pointer"
          >
            <option value="ALL">All Plans</option>
            <option value="3-Day Free Trial">Free Trial</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Premium">Premium</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          {/* Action Buttons */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-[#0c0e17] hover:bg-white/10 border border-[#434656]/30 text-xs font-mono text-[#e1e1ef] hover:text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-3.5 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0c0e17] border-b border-[#434656]/30 text-[11px] font-mono text-[#8d90a2] uppercase tracking-wider">
                <th className="py-3 px-4">Candidate / User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Apps</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#434656]/20 text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-[#434656]/40" />
                      <div>
                        <div className="font-bold text-white font-geist flex items-center gap-1.5">
                          {u.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#8d90a2]">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      u.role === 'Super Admin' 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : u.role === 'Admin'
                        ? 'bg-[#0052ff]/20 text-[#0052ff] border border-[#0052ff]/30'
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1 w-max ${
                      u.accountStatus === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : u.accountStatus === 'Suspended'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        u.accountStatus === 'Active' ? 'bg-emerald-400' : u.accountStatus === 'Suspended' ? 'bg-red-400' : 'bg-amber-400'
                      }`} />
                      {u.accountStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono font-medium">
                    <button
                      onClick={() => setSelectedUserForPlan(u)}
                      className="hover:underline text-left cursor-pointer flex items-center gap-1 text-[#4cd7f6]"
                    >
                      {u.subscriptionPlan}
                      <Edit3 className="w-3 h-3 text-[#8d90a2]" />
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-[#0c0e17] rounded-full h-1.5 overflow-hidden border border-[#434656]/30">
                        <div 
                          className={`h-full rounded-full ${u.employabilityScore >= 85 ? 'bg-emerald-400' : u.employabilityScore >= 70 ? 'bg-amber-400' : 'bg-red-400'}`} 
                          style={{ width: `${u.employabilityScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-white font-semibold">{u.employabilityScore}%</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-white">{u.applicationsCount}</td>

                  <td className="py-3 px-4 font-mono text-[11px] text-[#8d90a2]">{u.registrationDate}</td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedUserForDetail(u)}
                        className="p-1.5 hover:bg-white/10 text-[#c3c5d9] hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="View Full Candidate Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleResetPassword(u)}
                        className="p-1.5 hover:bg-amber-500/10 text-amber-400/80 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
                        title="Reset User Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleSuspend(u)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          u.accountStatus === 'Suspended'
                            ? 'hover:bg-emerald-500/10 text-emerald-400'
                            : 'hover:bg-red-500/10 text-red-400/80 hover:text-red-300'
                        }`}
                        title={u.accountStatus === 'Suspended' ? 'Activate User' : 'Suspend User'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8d90a2] font-mono">
                    No candidate accounts match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUserForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-[#434656]/30 pb-4">
              <div className="flex items-center gap-3">
                <img src={selectedUserForDetail.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-[#434656]" />
                <div>
                  <h3 className="text-xl font-bold font-geist text-white">{selectedUserForDetail.name}</h3>
                  <p className="text-xs font-mono text-[#8d90a2]">{selectedUserForDetail.email} • {selectedUserForDetail.location}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUserForDetail(null)}
                className="text-[#8d90a2] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-[#0c0e17] p-3 rounded-xl border border-[#434656]/20">
                <span className="text-[#8d90a2]">Employability</span>
                <div className="text-lg font-bold text-emerald-400 mt-1">{selectedUserForDetail.employabilityScore}%</div>
              </div>

              <div className="bg-[#0c0e17] p-3 rounded-xl border border-[#434656]/20">
                <span className="text-[#8d90a2]">ATS Resume Score</span>
                <div className="text-lg font-bold text-[#0052ff] mt-1">{selectedUserForDetail.resumeScore}%</div>
              </div>

              <div className="bg-[#0c0e17] p-3 rounded-xl border border-[#434656]/20">
                <span className="text-[#8d90a2]">Job Applications</span>
                <div className="text-lg font-bold text-purple-400 mt-1">{selectedUserForDetail.applicationsCount}</div>
              </div>

              <div className="bg-[#0c0e17] p-3 rounded-xl border border-[#434656]/20">
                <span className="text-[#8d90a2]">Plan</span>
                <div className="text-lg font-bold text-amber-400 mt-1">{selectedUserForDetail.subscriptionPlan}</div>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <h4 className="font-bold text-white text-sm">Account Telemetry & Info</h4>
              <div className="bg-[#0c0e17] p-4 rounded-xl border border-[#434656]/20 space-y-2 text-[#c3c5d9]">
                <div className="flex justify-between"><span>User ID:</span> <span className="text-white">{selectedUserForDetail.id}</span></div>
                <div className="flex justify-between"><span>Registration Date:</span> <span className="text-white">{selectedUserForDetail.registrationDate}</span></div>
                <div className="flex justify-between"><span>Last Active Session:</span> <span className="text-white">{selectedUserForDetail.lastLogin}</span></div>
                <div className="flex justify-between"><span>Account Status:</span> <span className="text-emerald-400">{selectedUserForDetail.accountStatus}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#434656]/30">
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="px-4 py-2 bg-[#0c0e17] hover:bg-white/10 text-xs font-mono text-white rounded-xl transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Upgrade / Change Modal */}
      {selectedUserForPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-base font-bold font-geist text-white">Modify Plan: {selectedUserForPlan.name}</h3>
              <button onClick={() => setSelectedUserForPlan(null)} className="text-[#8d90a2] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-mono text-[#c3c5d9]">Select a new subscription tier for candidate {selectedUserForPlan.email}:</p>

            <div className="space-y-2 font-mono text-xs">
              {['3-Day Free Trial', 'Basic', 'Pro', 'Premium', 'Enterprise'].map((plan) => (
                <button
                  key={plan}
                  onClick={() => {
                    onUpdateUser({ ...selectedUserForPlan, subscriptionPlan: plan as any });
                    setSelectedUserForPlan(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                    selectedUserForPlan.subscriptionPlan === plan
                      ? 'bg-[#0052ff]/20 border-[#0052ff] text-white font-bold'
                      : 'bg-[#0c0e17] border-[#434656]/30 text-[#c3c5d9] hover:bg-white/5'
                  }`}
                >
                  <span>{plan}</span>
                  {selectedUserForPlan.subscriptionPlan === plan && <CheckCircle2 className="w-4 h-4 text-[#0052ff]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateUserSubmit} className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-lg font-bold font-geist text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0052ff]" /> Provision New Candidate Account
              </h3>
              <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="text-[#8d90a2] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#c3c5d9] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Jordan Miller"
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="block text-[#c3c5d9] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="e.g. jordan@example.com"
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c3c5d9] mb-1">Admin Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#c3c5d9] mb-1">Subscription Plan</label>
                  <select
                    value={newUserForm.subscriptionPlan}
                    onChange={(e) => setNewUserForm({ ...newUserForm, subscriptionPlan: e.target.value as any })}
                    className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                  >
                    <option value="3-Day Free Trial">3-Day Free Trial</option>
                    <option value="Basic">Basic ($9/mo)</option>
                    <option value="Pro">Pro ($19/mo)</option>
                    <option value="Premium">Premium ($49/mo)</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#434656]/30">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 bg-[#0c0e17] hover:bg-white/10 text-xs font-mono text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
