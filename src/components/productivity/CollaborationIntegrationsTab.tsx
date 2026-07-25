import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check, Copy, Calendar, Video, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

export const CollaborationIntegrationsTab: React.FC = () => {
  const { integrations, toggleIntegration, profile } = useEcosystem();

  const [copiedLink, setCopiedLink] = useState(false);
  const [shareRole, setShareRole] = useState('Mentor Review');

  const shareableUrl = `https://hireflow.ai/share/portfolio/${profile.name.toLowerCase().replace(/\s+/g, '-')}-7f39a`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const integrationList = [
    {
      key: 'googleCalendar' as const,
      name: 'Google Calendar',
      category: 'Calendar Sync',
      icon: '📅',
      desc: 'Bidirectional sync for interview invites & study blocks',
      status: integrations.googleCalendar
    },
    {
      key: 'outlookCalendar' as const,
      name: 'Microsoft Outlook Calendar',
      category: 'Calendar Sync',
      icon: '📆',
      desc: 'Corporate calendar synchronization for interviews & followups',
      status: integrations.outlookCalendar
    },
    {
      key: 'zoom' as const,
      name: 'Zoom Video Communications',
      category: 'Meeting Links',
      icon: '📹',
      desc: 'Auto-generate mock interview & coaching video rooms',
      status: integrations.zoom
    },
    {
      key: 'googleMeet' as const,
      name: 'Google Meet',
      category: 'Meeting Links',
      icon: '🎥',
      desc: 'Instant interview room link attachment for scheduled events',
      status: integrations.googleMeet
    },
    {
      key: 'teams' as const,
      name: 'Microsoft Teams',
      category: 'Collaboration',
      icon: '💬',
      desc: 'Enterprise interview channel notifications & alerts',
      status: integrations.teams
    },
    {
      key: 'slack' as const,
      name: 'Slack Integration',
      category: 'Notifications',
      icon: '🔔',
      desc: 'Daily briefing & task reminders sent directly to Slack DMs',
      status: integrations.slack
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0052ff]/10 text-[#0052ff] border border-[#0052ff]/20">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-geist text-white flex items-center gap-2">
              Collaboration & Integrations Platform
            </h2>
            <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">
              Connect external calendars, meeting providers & share progress with mentors & coaches.
            </p>
          </div>
        </div>
      </div>

      {/* Shareable Link Generator */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#0052ff]" /> Shareable Career Access Link
            </h3>
            <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">
              Generate read-only access links for mentors, career coaches or recruiters to review your ATS Resume & Interview Prep.
            </p>
          </div>

          <select
            value={shareRole}
            onChange={e => setShareRole(e.target.value)}
            className="bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="Mentor Review">Mentor Review Access</option>
            <option value="Career Coach">Career Coach Access</option>
            <option value="Peer Review">Peer Review Access</option>
            <option value="Recruiter Share">Recruiter Shareable Link</option>
          </select>
        </div>

        <div className="flex items-center gap-3 bg-[#13151f] p-3 rounded-xl border border-[#434656]/30">
          <input
            type="text"
            readOnly
            value={shareableUrl}
            className="bg-transparent text-xs font-mono text-[#4cd7f6] w-full focus:outline-none"
          />
          <button
            onClick={copyShareLink}
            className="px-4 py-2 rounded-lg bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Third Party Integrations Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Connected Third-Party Providers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {integrationList.map(item => (
            <div
              key={item.key}
              className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <h4 className="text-sm font-bold font-geist text-white">{item.name}</h4>
                </div>
                <p className="text-xs text-[#c3c5d9] font-mono leading-relaxed">{item.desc}</p>
                {item.status.connected && item.status.email && (
                  <span className="text-[10px] font-mono text-emerald-400 block pt-1">
                    Connected as: {item.status.email || item.status.user || item.status.workspace}
                  </span>
                )}
              </div>

              <button
                onClick={() => toggleIntegration(item.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors ${
                  item.status.connected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-[#252836] text-[#c3c5d9] hover:text-white'
                }`}
              >
                {item.status.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
