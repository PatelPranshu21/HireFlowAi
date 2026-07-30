import React, { useState } from 'react';
import { UserProfile } from '../types';
import { UserAvatar } from '../utils/userUtils';
import { User, Mail, Briefcase, Award, Linkedin, Github, FileText, Check, Edit3, Sparkles } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigateTab: (tab: any) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onNavigateTab }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title);
  const [email, setEmail] = useState(user.email);
  const [targetRole, setTargetRole] = useState(user.targetRole || 'Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState(user.experienceLevel || 'Mid Level');
  const [linkedIn, setLinkedIn] = useState(user.linkedInUrl || '');
  const [saved, setSaved] = useState(false);

  const skills = ['TypeScript', 'React 19', 'Node.js', 'Express', 'Python', 'AWS Cloud', 'PostgreSQL', 'Docker', 'System Design'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      title,
      email,
      targetRole,
      experienceLevel,
      linkedInUrl: linkedIn
    });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 p-8 max-w-[1280px] mx-auto w-full space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-3xl p-8 relative overflow-hidden ai-gradient-border">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <UserAvatar user={user} size="xl" className="border-2 border-blue-500 shadow-xl" />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold font-geist text-white">{user.name}</h2>
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-0.5 rounded-full text-xs font-mono font-bold">
                  {user.tier}
                </span>
              </div>
              <p className="text-base text-[#c3c5d9] mt-1">{user.title}</p>
              <p className="text-xs font-mono text-white/50 mt-1">{user.email} • {experienceLevel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigateTab('resume-suite')}
              className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <FileText className="w-4 h-4" /> View Resume Analysis ({user.atsScore} pts)
            </button>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4" /> Profile updated successfully!
        </div>
      )}

      {/* Edit Form or Read View */}
      {isEditing ? (
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold font-geist text-white mb-6">Edit Candidate Profile</h3>
          <form onSubmit={handleSave} className="space-y-4 text-sm text-[#e1e1ef]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Full Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Current Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#c3c5d9] mb-1">Target Role</label>
                <input 
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#c3c5d9] mb-1">LinkedIn URL</label>
                <input 
                  type="text"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs font-mono cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" /> Career Profile & Target
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-[#c3c5d9]">
                <div className="p-3 bg-[#11131c] rounded-xl border border-[#434656]/20">
                  <span className="text-white/40 block mb-1">Target Position</span>
                  <span className="text-white text-sm font-bold">{targetRole}</span>
                </div>
                <div className="p-3 bg-[#11131c] rounded-xl border border-[#434656]/20">
                  <span className="text-white/40 block mb-1">Experience Level</span>
                  <span className="text-white text-sm font-bold">{experienceLevel}</span>
                </div>
              </div>
            </div>

            {/* Core Skills */}
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> Verified Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((sk, idx) => (
                  <span key={idx} className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-mono font-medium">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Telemetry */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold font-geist text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> ATS Readiness Score
              </h3>
              <div className="text-center py-4 bg-[#11131c] rounded-2xl border border-[#434656]/20">
                {user.atsScore > 0 ? (
                  <>
                    <span className="text-5xl font-bold font-geist text-blue-400">{user.atsScore}</span>
                    <span className="text-xs font-mono text-white/40 block mt-1">/ 100 Overall Score</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold font-geist text-white/40 mb-1 block">--</span>
                    <span className="text-xs font-mono text-white/40 block mt-1 px-4 leading-relaxed">
                      Upload your resume to analyse your ATS compatibility.
                    </span>
                  </>
                )}
              </div>
              <button 
                onClick={() => onNavigateTab('resume-suite')}
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 py-2.5 rounded-xl text-xs font-mono font-bold cursor-pointer"
              >
                Optimize ATS Bullet Points
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
