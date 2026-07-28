import React, { useState } from 'react';
import { UserProfile, ResumeVersion, ParsedResumeData } from '../../types';
import { 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  Eye, 
  Layout, 
  Save, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Sparkles, 
  Wand2, 
  Download 
} from 'lucide-react';

interface ResumeBuilderTabProps {
  user: UserProfile;
  activeVersion: ResumeVersion;
  onUpdateResumeData: (updatedData: ParsedResumeData) => void;
  onDownloadResume: (format: 'PDF' | 'DOCX' | 'TXT') => void;
}

export const ResumeBuilderTab: React.FC<ResumeBuilderTabProps> = ({
  user,
  activeVersion,
  onUpdateResumeData,
  onDownloadResume
}) => {
  const [activeEditorTab, setActiveEditorTab] = useState<'contact' | 'summary' | 'experience' | 'projects' | 'skills' | 'education'>('contact');
  const [selectedTemplate, setSelectedTemplate] = useState<'modern_tech' | 'executive' | 'minimalist' | 'ats_standard'>(
    (activeVersion.template as any) || 'modern_tech'
  );

  const [formData, setFormData] = useState<ParsedResumeData>(
    activeVersion.parsedData || {
      fullName: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      linkedIn: user.linkedInUrl || "",
      gitHub: user.gitHubUrl || "",
      portfolio: user.portfolioUrl || "",
      summary: "",
      education: [
        { id: 'edu_1', degree: "B.S. in Computer Science", institution: "Stanford University", year: "2018", gpa: "3.9/4.0" }
      ],
      experience: [
        {
          id: 'exp_1',
          company: "Apple",
          role: "Senior Software Engineer",
          period: "2021 - Present",
          location: "Cupertino, CA",
          bullets: [
            "Architected and deployed highly available distributed streaming services handling 10k+ req/sec using Kafka & Redis.",
            "Led frontend performance migration to Next.js and TypeScript, reducing p99 latency by 35%.",
            "Automated AWS multi-region infrastructure (EC2, EKS, S3) with Terraform CI/CD pipelines."
          ]
        },
        {
          id: 'exp_2',
          company: "TechCorp",
          role: "Software Engineer II",
          period: "2018 - 2021",
          location: "San Francisco, CA",
          bullets: [
            "Engineered high-throughput GraphQL APIs processing 50M daily requests with Node.js and PostgreSQL.",
            "Mentored 4 junior engineers and implemented automated E2E testing using Playwright."
          ]
        }
      ],
      projects: [
        {
          id: 'proj_1',
          name: "CloudScale Engine",
          description: "High-performance distributed event broker built with Go and WebSockets.",
          technologies: ["Go", "Kafka", "Docker", "Kubernetes"]
        }
      ],
      skills: ["TypeScript", "React", "Next.js", "Node.js", "Go", "Python", "AWS", "Docker", "Kubernetes", "PostgreSQL", "Kafka", "Redis"],
      certifications: ["AWS Certified Solutions Architect"],
      languages: ["English (Native)", "Spanish (Professional)"],
      achievements: ["Top 1% Contributor on GitHub"]
    }
  );

  const handleFieldChange = (field: keyof ParsedResumeData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdateResumeData(updated);
  };

  const handleAddExperience = () => {
    const newExp = {
      id: `exp_${Date.now()}`,
      company: "New Tech Company",
      role: "Senior Engineer",
      period: "2024 - Present",
      location: "San Francisco, CA",
      bullets: ["Led technical development of cloud microservices handling high traffic."]
    };
    handleFieldChange('experience', [...formData.experience, newExp]);
  };

  const handleRemoveExperience = (index: number) => {
    const updated = formData.experience.filter((_, i) => i !== index);
    handleFieldChange('experience', updated);
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    const copy = [...formData.experience];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= copy.length) return;
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    handleFieldChange('experience', copy);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052ff]/15 text-[#b7c4ff] text-xs font-mono mb-2">
            <Layout className="w-3.5 h-3.5 text-[#4cd7f6]" /> Interactive Guided Resume Builder
          </div>
          <h2 className="text-2xl font-bold font-geist text-white">
            Resume Builder &amp; Live Preview
          </h2>
          <p className="text-xs text-[#c3c5d9] mt-0.5">
            Real-time live rendering with instant template switching and drag-and-drop section ordering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onDownloadResume('PDF')}
            className="px-4 py-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0052ff]/25"
          >
            <Download className="w-4 h-4" /> Download Resume PDF
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left Editor | Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* Section Selector Tabs */}
          <div className="flex overflow-x-auto gap-2 bg-[#191b25] p-2 rounded-xl border border-[#434656]/30">
            {[
              { id: 'contact', label: 'Contact', icon: User },
              { id: 'summary', label: 'Summary', icon: FileText },
              { id: 'experience', label: 'Experience', icon: Briefcase },
              { id: 'projects', label: 'Projects', icon: Code },
              { id: 'skills', label: 'Skills', icon: Award },
              { id: 'education', label: 'Education', icon: GraduationCap }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveEditorTab(tab.id as any)}
                  className={`px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeEditorTab === tab.id 
                      ? 'bg-[#0052ff] text-white font-bold' 
                      : 'text-[#c3c5d9] hover:bg-[#282934]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Content Area */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-xl space-y-4">
            {activeEditorTab === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-geist text-white">Contact &amp; Social Links</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#8d90a2] block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      className="w-full bg-[#11131c] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#8d90a2] block mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="w-full bg-[#11131c] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#8d90a2] block mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="w-full bg-[#11131c] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#8d90a2] block mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={formData.linkedIn}
                      onChange={(e) => handleFieldChange('linkedIn', e.target.value)}
                      className="w-full bg-[#11131c] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeEditorTab === 'summary' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-geist text-white">Professional Summary</h3>
                <textarea
                  rows={5}
                  value={formData.summary}
                  onChange={(e) => handleFieldChange('summary', e.target.value)}
                  className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-[#0052ff]"
                />
              </div>
            )}

            {activeEditorTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold font-geist text-white">Work Experience</h3>
                  <button
                    onClick={handleAddExperience}
                    className="px-3 py-1 bg-[#0052ff] text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.experience.map((exp, idx) => (
                    <div key={exp.id || idx} className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold font-mono text-[#4cd7f6]">Role #{idx + 1}</span>
                        <div className="flex gap-1">
                          <button onClick={() => moveExperience(idx, 'up')} className="p-1 text-[#8d90a2] hover:text-white cursor-pointer"><MoveUp className="w-3.5 h-3.5" /></button>
                          <button onClick={() => moveExperience(idx, 'down')} className="p-1 text-[#8d90a2] hover:text-white cursor-pointer"><MoveDown className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleRemoveExperience(idx)} className="p-1 text-red-400 hover:text-red-300 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const copy = [...formData.experience];
                            copy[idx].role = e.target.value;
                            handleFieldChange('experience', copy);
                          }}
                          placeholder="Role"
                          className="bg-[#191b25] border border-[#434656]/40 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const copy = [...formData.experience];
                            copy[idx].company = e.target.value;
                            handleFieldChange('experience', copy);
                          }}
                          placeholder="Company"
                          className="bg-[#191b25] border border-[#434656]/40 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>

                      <textarea
                        rows={3}
                        value={exp.bullets.join('\n')}
                        onChange={(e) => {
                          const copy = [...formData.experience];
                          copy[idx].bullets = e.target.value.split('\n');
                          handleFieldChange('experience', copy);
                        }}
                        placeholder="Bullet points (one per line)"
                        className="w-full bg-[#191b25] border border-[#434656]/40 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeEditorTab === 'skills' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-geist text-white">Skills</h3>
                <input
                  type="text"
                  value={formData.skills.join(', ')}
                  onChange={(e) => handleFieldChange('skills', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Rendered Resume Preview & Template Selector */}
        <div className="lg:col-span-6 space-y-4">
          {/* Template Selector Bar */}
          <div className="bg-[#191b25] p-3 rounded-2xl border border-[#434656]/30 flex items-center justify-between">
            <span className="text-xs font-mono text-[#8d90a2] flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#4cd7f6]" /> Live Rendered Preview
            </span>

            <div className="flex gap-1">
              {[
                { id: 'modern_tech', name: 'Modern Tech' },
                { id: 'executive', name: 'Executive' },
                { id: 'minimalist', name: 'Minimalist' },
                { id: 'ats_standard', name: 'ATS Standard' }
              ].map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id as any)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    selectedTemplate === tmpl.id 
                      ? 'bg-[#0052ff] text-white font-bold' 
                      : 'bg-[#11131c] text-[#8d90a2] hover:text-white'
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Rendered Live Canvas Container */}
          <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-2xl min-h-[600px] border border-slate-300 font-sans space-y-6 text-left">
            {/* Template Header */}
            <div className={`pb-4 border-b ${selectedTemplate === 'executive' ? 'border-amber-600 text-center' : 'border-slate-300'}`}>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{formData.fullName}</h1>
              <p className="text-xs text-slate-600 mt-1 font-mono">
                {formData.email} • {formData.phone} • {formData.linkedIn}
              </p>
            </div>

            {/* Summary */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-xs text-slate-800 leading-relaxed">
                {formData.summary}
              </p>
            </div>

            {/* Work Experience */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
                Experience
              </h2>
              <div className="space-y-4">
                {formData.experience.map((exp, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-900">{exp.role} <span className="font-normal text-slate-600">— {exp.company}</span></span>
                      <span className="text-[10px] font-mono text-slate-500">{exp.period}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-800">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className="leading-tight">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                Technical Skills
              </h2>
              <p className="text-xs text-slate-800 font-mono">
                {formData.skills.join(' • ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
