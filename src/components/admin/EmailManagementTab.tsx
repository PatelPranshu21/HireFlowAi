import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Edit3, 
  FileText, 
  X, 
  Sparkles 
} from 'lucide-react';
import { EmailTemplateAdmin } from '../../types/admin';

interface EmailManagementTabProps {
  templates: EmailTemplateAdmin[];
  onUpdateTemplate: (template: EmailTemplateAdmin) => void;
}

export const EmailManagementTab: React.FC<EmailManagementTabProps> = ({ templates, onUpdateTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateAdmin>(templates[0]);
  const [subject, setSubject] = useState(templates[0]?.subject || '');
  const [body, setBody] = useState(templates[0]?.previewHtml || '');
  const [testEmailAddress, setTestEmailAddress] = useState('candidate@example.com');
  const [testSentToast, setTestSentToast] = useState(false);

  const handleSelect = (tmpl: EmailTemplateAdmin) => {
    setSelectedTemplate(tmpl);
    setSubject(tmpl.subject);
    setBody(tmpl.previewHtml);
  };

  const handleSave = () => {
    onUpdateTemplate({ ...selectedTemplate, subject, previewHtml: body });
  };

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    setTestSentToast(true);
    setTimeout(() => setTestSentToast(false), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Toast Alert */}
      {testSentToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl font-mono flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Test email dispatched to {testEmailAddress}!</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 shadow-md space-y-3">
          <h4 className="text-xs font-mono text-[#8d90a2] uppercase tracking-wider mb-2">System Email Templates</h4>
          {templates.map((t) => (
            <div
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedTemplate.id === t.id ? 'bg-[#0052ff]/20 border-[#0052ff]' : 'bg-[#0c0e17] border-[#434656]/20'
              }`}
            >
              <h5 className="font-bold text-white font-geist">{t.name}</h5>
              <p className="text-[11px] text-[#8d90a2] truncate mt-0.5">{t.subject}</p>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-4">
          <h4 className="text-base font-bold font-geist text-white">Edit Template: {selectedTemplate.name}</h4>

          <div>
            <label className="block text-[#c3c5d9] mb-1">Email Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
            />
          </div>

          <div>
            <label className="block text-[#c3c5d9] mb-1">HTML / Markdown Email Body</label>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#434656]/30">
            <form onSubmit={handleSendTest} className="flex gap-2 items-center">
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2 text-white text-xs"
              />
              <button type="submit" className="px-3 py-2 bg-[#0c0e17] hover:bg-white/10 text-white rounded-xl border border-[#434656]/30 cursor-pointer">
                Send Test
              </button>
            </form>

            <button onClick={handleSave} className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-white font-semibold rounded-xl cursor-pointer">
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
