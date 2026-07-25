import React, { useState } from 'react';
import { UserProfile, ResumeVersion, TailorResumeResponse } from '../../types';
import { 
  Wand2, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Copy, 
  FileText, 
  RefreshCw, 
  Layers 
} from 'lucide-react';

interface ResumeTailoringTabProps {
  user: UserProfile;
  activeVersion: ResumeVersion;
  onSaveTailoredVersion: (newVersion: ResumeVersion) => void;
  onJobHubNotify?: () => void;
}

const mockJobPosts = [
  {
    id: 'jp_1',
    company: 'Stripe',
    title: 'Senior Frontend Engineer',
    location: 'San Francisco, CA (Hybrid)',
    description: `Stripe is looking for a Senior Frontend Engineer to build high-performance payment interfaces and UI component systems. Requirements: 6+ years React, TypeScript, Next.js, Web Vitals, Design Systems, REST/GraphQL APIs, distributed web architecture.`
  },
  {
    id: 'jp_2',
    company: 'Apple',
    title: 'Senior Cloud Systems Developer',
    location: 'Cupertino, CA',
    description: `Join Apple Cloud Infrastructure. Requirements: Go, Python, AWS (EC2, S3, EKS), Terraform, Kubernetes, Docker, Kafka streaming pipelines, distributed systems.`
  },
  {
    id: 'jp_3',
    company: 'Linear',
    title: 'Staff Full Stack Architect',
    location: 'Remote',
    description: `Linear is hiring a Staff Architect for sync engine and real-time collaboration tools. Requirements: TypeScript, WebSockets, Node.js, Postgres, Redis, performance optimization.`
  }
];

export const ResumeTailoringTab: React.FC<ResumeTailoringTabProps> = ({
  user,
  activeVersion,
  onSaveTailoredVersion,
  onJobHubNotify
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('jp_1');
  const [targetCompany, setTargetCompany] = useState('Stripe');
  const [targetRole, setTargetRole] = useState('Senior Frontend Engineer');
  const [jobDescriptionText, setJobDescriptionText] = useState(mockJobPosts[0].description);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<TailorResumeResponse | null>(null);

  const handleSelectPredefinedJob = (jobId: string) => {
    const found = mockJobPosts.find(j => j.id === jobId);
    if (found) {
      setSelectedJobId(found.id);
      setTargetCompany(found.company);
      setTargetRole(found.title);
      setJobDescriptionText(found.description);
    }
  };

  const handleGenerateTailoredResume = async () => {
    setIsTailoring(true);
    setTailorResult(null);

    try {
      const res = await fetch('/api/ai/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: targetRole,
          company: targetCompany,
          jobDescription: jobDescriptionText,
          resumeContent: activeVersion.content || activeVersion.parsedData?.summary || ''
        })
      });

      const data: TailorResumeResponse = await res.json();
      setTailorResult(data);

      // Create tailored version
      const newTailoredVersion: ResumeVersion = {
        id: `v_tailored_${Date.now()}`,
        versionName: `Tailored - ${targetCompany} (${targetRole})`,
        fileName: `${targetCompany.toLowerCase()}_${targetRole.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`,
        uploadedAt: 'Just now',
        fileSize: '190 KB',
        score: data.matchScore || 91,
        template: activeVersion.template || 'modern_tech',
        jobsMatchedCount: 14,
        isTailored: true,
        targetCompany: targetCompany,
        targetRole: targetRole,
        content: data.tailoredContent || activeVersion.content
      };

      onSaveTailoredVersion(newTailoredVersion);
      if (onJobHubNotify) onJobHubNotify();
    } catch (err) {
      console.error("Tailoring error:", err);
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden ai-gradient-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052ff]/15 text-[#b7c4ff] text-xs font-mono mb-2">
              <Wand2 className="w-3.5 h-3.5 text-[#4cd7f6]" /> AI Job-Specific Resume Tailoring
            </div>
            <h2 className="text-2xl font-bold font-geist text-white">
              Targeted Resume Customizer
            </h2>
            <p className="text-xs text-[#c3c5d9] mt-0.5 max-w-2xl">
              Paste any job description to automatically adjust keywords, bullet points, and section emphasis to match candidate recruiter requirements without overwriting your master version.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Job Selection & Tailoring Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Input & Quick Select */}
        <div className="lg:col-span-6 space-y-6">
          {/* Quick Select from Job Hub */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold font-geist text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#4cd7f6]" /> Quick Select from Job Hub
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {mockJobPosts.map(j => (
                <button
                  key={j.id}
                  onClick={() => handleSelectPredefinedJob(j.id)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex justify-between items-center ${
                    selectedJobId === j.id 
                      ? 'bg-[#0052ff]/15 border-[#0052ff] text-white' 
                      : 'bg-[#11131c] border-[#434656]/30 text-[#c3c5d9] hover:border-[#b7c4ff]/40'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{j.title}</h4>
                    <p className="text-[10px] font-mono text-[#8d90a2]">{j.company} • {j.location}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#b7c4ff]">Select →</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Role & Job Description Inputs */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold font-geist text-white">Target Job Details</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-[#8d90a2] block mb-1">Company Name</label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full bg-[#11131c] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#8d90a2] block mb-1">Target Job Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#11131c] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-[#0052ff]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#8d90a2] block mb-1">Job Description Text</label>
              <textarea
                rows={7}
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the full job post requirements here..."
                className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-[#0052ff]"
              />
            </div>

            <button
              onClick={handleGenerateTailoredResume}
              disabled={isTailoring || !jobDescriptionText}
              className="w-full py-3 bg-[#0052ff] hover:bg-[#0052ff]/90 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#0052ff]/25"
            >
              {isTailoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#4cd7f6]" />
                  AI Tailoring Resume for {targetCompany}...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Tailored Resume Version
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Tailoring Analysis & Results */}
        <div className="lg:col-span-6 space-y-6">
          {tailorResult ? (
            <div className="bg-[#191b25] border border-[#0052ff]/40 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-[#434656]/30 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h3 className="text-base font-bold font-geist text-white">Tailoring Complete!</h3>
                </div>

                <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 text-xs font-mono text-green-400 font-bold">
                  {tailorResult.matchScore}% Match Score
                </div>
              </div>

              {/* Missing Skills & Keywords */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-[#b7c4ff] uppercase font-bold">Newly Added Keywords &amp; Focus</h4>
                <div className="flex flex-wrap gap-2">
                  {tailorResult.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#0052ff]/15 text-[#4cd7f6] text-xs font-mono rounded-lg border border-[#0052ff]/30">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modifications Applied */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-[#b7c4ff] uppercase font-bold">Strategic Modifications Made</h4>
                <div className="space-y-2">
                  {tailorResult.suggestedModifications.map((mod, i) => (
                    <div key={i} className="bg-[#11131c] p-3 rounded-lg border border-[#434656]/20 text-xs text-[#e1e1ef] flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailored Content Preview Box */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-[#8d90a2] uppercase">Tailored Resume Content Preview</h4>
                <pre className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/30 text-[11px] font-mono text-[#e1e1ef] max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {tailorResult.tailoredContent}
                </pre>
              </div>

              <div className="p-3 bg-[#0052ff]/10 rounded-xl border border-[#0052ff]/20 text-xs text-[#b7c4ff] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#4cd7f6]" />
                Saved as new version in Version Manager! Job Hub recommendations updated.
              </div>
            </div>
          ) : (
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-[#282934] border border-[#434656]/40 flex items-center justify-center text-[#4cd7f6]">
                <Wand2 className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-bold font-geist text-white">Ready for AI Tailoring</h3>
                <p className="text-xs text-[#c3c5d9] mt-1 leading-relaxed">
                  Select a job post on the left or paste custom requirements, then click "Generate Tailored Resume" to create an optimized version tailored specifically for recruiter search filters.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
