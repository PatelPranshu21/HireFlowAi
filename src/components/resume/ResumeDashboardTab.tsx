import React from 'react';
import { UserProfile, ResumeAnalysisResult, ResumeVersion } from '../../types';
import { 
  BarChart3, 
  CheckCircle2, 
  Award, 
  History, 
  Wand2, 
  Clock, 
  Briefcase, 
  Download, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  FileText,
  AlertTriangle,
  Zap,
  TrendingUp,
  Layers
} from 'lucide-react';

interface ResumeDashboardTabProps {
  user: UserProfile;
  analysis: ResumeAnalysisResult;
  activeVersion: ResumeVersion;
  versions: ResumeVersion[];
  onSelectTab: (tab: string) => void;
  onOpenUpload: () => void;
  onApplyImprovement: (suggestionId: string) => void;
  onAddMissingSkillToResume: (skill: string) => void;
}

export const ResumeDashboardTab: React.FC<ResumeDashboardTabProps> = ({
  user,
  analysis,
  activeVersion,
  versions,
  onSelectTab,
  onOpenUpload,
  onApplyImprovement,
  onAddMissingSkillToResume
}) => {
  // Calculate completion percentage
  const parsed = activeVersion.parsedData;
  let completionScore = 0;
  if (parsed?.fullName) completionScore += 10;
  if (parsed?.email) completionScore += 10;
  if (parsed?.summary) completionScore += 15;
  if (parsed?.experience && parsed.experience.length > 0) completionScore += 25;
  if (parsed?.education && parsed.education.length > 0) completionScore += 15;
  if (parsed?.skills && parsed.skills.length > 0) completionScore += 15;
  if (parsed?.projects && parsed.projects.length > 0) completionScore += 10;

  const missingSkillsList = (analysis.keywordList || [])
    .filter(k => !k.detected)
    .slice(0, 5);

  const topSuggestions = (analysis.aiSuggestions || [])
    .filter(s => s.status === 'pending')
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d1f29] via-[#191b25] to-[#11131c] p-6 md:p-8 border border-[#434656]/30 ai-gradient-border shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0052ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052ff]/15 border border-[#0052ff]/30 text-xs font-mono font-medium text-[#b7c4ff] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#4cd7f6]" />
              AI Resume Intelligence Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-geist text-[#e1e1ef] tracking-tight">
              Resume Command Center
            </h2>
            <p className="text-sm text-[#c3c5d9] mt-1 max-w-2xl leading-relaxed">
              Active Version: <span className="text-[#b7c4ff] font-semibold">{activeVersion.versionName}</span> ({activeVersion.fileSize || '184 KB'}). Optimized for <span className="text-white font-medium">{user.targetRole || 'Senior Software Engineer'}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="px-4 py-2.5 bg-[#282934] hover:bg-[#32343f] text-[#e1e1ef] rounded-xl text-xs font-mono font-medium border border-[#434656]/40 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-[#b7c4ff]" />
              Upload New Resume
            </button>
            <button
              onClick={() => onSelectTab('tailoring')}
              className="px-4 py-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0052ff]/25"
            >
              <Wand2 className="w-4 h-4" />
              Tailor for Job
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid (8 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ATS Score */}
        <div 
          onClick={() => onSelectTab('ats-score')}
          className="bg-[#191b25] border border-[#434656]/30 hover:border-[#0052ff]/50 rounded-xl p-5 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">ATS Score</span>
            <BarChart3 className="w-5 h-5 text-[#4cd7f6] group-hover:scale-110 transition-transform" />
          </div>
          {activeVersion && analysis.overallScore > 0 ? (
            <>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold font-geist text-[#b7c4ff]">{analysis.overallScore}</span>
                <span className="text-sm font-bold text-[#8d90a2]">/ 100</span>
                <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded ml-auto flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +8 pts
                </span>
              </div>
              <div className="mt-3 w-full bg-[#282934] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#571bc1] to-[#4cd7f6] h-full rounded-full" style={{ width: `${analysis.overallScore}%` }} />
              </div>
            </>
          ) : (
            <div className="py-1">
              <span className="text-3xl font-bold font-geist text-white/40 block mb-1">--</span>
              <p className="text-[11px] text-[#c3c5d9] font-mono leading-tight">
                Upload your resume to analyse your ATS compatibility.
              </p>
            </div>
          )}
        </div>

        {/* Card 2: Resume Completion */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Resume Completion</span>
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-bold font-geist text-white">{completionScore}%</span>
            <span className="text-xs font-mono text-[#8d90a2] ml-auto">7/7 Sections</span>
          </div>
          <div className="mt-3 w-full bg-[#282934] h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-400 h-full rounded-full" style={{ width: `${completionScore}%` }} />
          </div>
        </div>

        {/* Card 3: Resume Strength */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Resume Strength</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="inline-block px-2.5 py-1 rounded bg-amber-400/10 text-amber-300 font-mono text-xs font-bold border border-amber-400/20 mb-1">
              Gold Tier • Top 8%
            </span>
            <p className="text-xs text-[#c3c5d9] mt-1">Beats 92% of candidate profiles for Senior roles.</p>
          </div>
        </div>

        {/* Card 4: Total Versions */}
        <div 
          onClick={() => onSelectTab('versions')}
          className="bg-[#191b25] border border-[#434656]/30 hover:border-[#b7c4ff]/50 rounded-xl p-5 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Resume Versions</span>
            <Layers className="w-5 h-5 text-[#b7c4ff] group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-bold font-geist text-white">{versions.length}</span>
            <span className="text-xs font-mono text-[#8d90a2] ml-auto">Active</span>
          </div>
          <p className="text-xs text-[#c3c5d9] mt-2">Master + {versions.filter(v => v.isTailored).length} Job-Tailored</p>
        </div>

        {/* Card 5: Recommended Improvements */}
        <div 
          onClick={() => onSelectTab('ai-improvements')}
          className="bg-[#191b25] border border-[#434656]/30 hover:border-[#0052ff]/50 rounded-xl p-5 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Pending Fixes</span>
            <Zap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-bold font-geist text-amber-400">
              {(analysis.aiSuggestions || []).filter(s => s.status === 'pending').length}
            </span>
            <span className="text-xs font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded ml-auto">
              +18 ATS Score
            </span>
          </div>
          <p className="text-xs text-[#c3c5d9] mt-2">One-click AI optimization ready</p>
        </div>

        {/* Card 6: Last Updated */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Last Updated</span>
            <Clock className="w-5 h-5 text-[#c3c5d9]" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold font-geist text-white">{activeVersion.uploadedAt}</span>
            <p className="text-xs text-[#c3c5d9] mt-1">Auto-synced with profile</p>
          </div>
        </div>

        {/* Card 7: Jobs Matched */}
        <div 
          onClick={() => onSelectTab('job-hub')}
          className="bg-[#191b25] border border-[#434656]/30 hover:border-[#4cd7f6]/50 rounded-xl p-5 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Jobs Matched</span>
            <Briefcase className="w-5 h-5 text-[#4cd7f6] group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-bold font-geist text-[#4cd7f6]">{activeVersion.jobsMatchedCount || 18}</span>
            <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded ml-auto">
              &gt;85% Match
            </span>
          </div>
          <p className="text-xs text-[#c3c5d9] mt-2">Connected to Job Hub</p>
        </div>

        {/* Card 8: Downloads */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#c3c5d9] uppercase tracking-wider">Total Downloads</span>
            <Download className="w-5 h-5 text-[#b7c4ff]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-bold font-geist text-white">14</span>
            <span className="text-xs font-mono text-[#8d90a2] ml-auto">PDF / DOCX</span>
          </div>
          <p className="text-xs text-[#c3c5d9] mt-2">ATS-compliant formatting</p>
        </div>
      </div>

      {/* Quick Overview Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Missing Skills & Current Resume Status */}
        <div className="lg:col-span-6 space-y-6">
          {/* Current Resume Status Card */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold font-geist text-[#e1e1ef] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4cd7f6]" />
                Current Resume Status
              </h3>
              <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-mono rounded-full font-semibold">
                Active &amp; Live
              </span>
            </div>

            <div className="space-y-3 bg-[#11131c] rounded-xl p-4 border border-[#434656]/20">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8d90a2]">Version Name:</span>
                <span className="text-[#e1e1ef] font-medium">{activeVersion.versionName}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8d90a2]">Template Style:</span>
                <span className="text-[#b7c4ff] font-medium uppercase">{activeVersion.template || 'Modern Tech'}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8d90a2]">File Size &amp; Type:</span>
                <span className="text-[#e1e1ef]">{activeVersion.fileSize || '184 KB'} (PDF)</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8d90a2]">Target Role Focus:</span>
                <span className="text-[#4cd7f6]">{user.targetRole || 'Senior Software Engineer'}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => onSelectTab('builder')}
                className="flex-1 py-2 bg-[#282934] hover:bg-[#32343f] text-[#e1e1ef] rounded-lg text-xs font-mono font-medium border border-[#434656]/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Edit in Builder
              </button>
              <button
                onClick={() => onSelectTab('live-preview')}
                className="flex-1 py-2 bg-[#0052ff]/20 hover:bg-[#0052ff]/30 text-[#b7c4ff] border border-[#0052ff]/40 rounded-lg text-xs font-mono font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Live Preview
              </button>
            </div>
          </div>

          {/* Top Missing Skills Card */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold font-geist text-[#e1e1ef] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Top Missing Skills for Target Role
                </h3>
                <p className="text-xs text-[#c3c5d9]">Adding these missing skills can increase your ATS score by up to 12%.</p>
              </div>
              <button 
                onClick={() => onSelectTab('keywords')}
                className="text-xs font-mono text-[#b7c4ff] hover:underline cursor-pointer"
              >
                View All Keywords
              </button>
            </div>

            <div className="space-y-3">
              {missingSkillsList.map(item => (
                <div 
                  key={item.keyword}
                  className="flex items-center justify-between bg-[#11131c] p-3 rounded-lg border border-[#434656]/20"
                >
                  <div>
                    <span className="text-sm font-medium text-[#e1e1ef]">{item.keyword}</span>
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-mono bg-amber-400/10 text-amber-300 rounded uppercase">
                      {item.importance} Priority
                    </span>
                  </div>
                  <button
                    onClick={() => onAddMissingSkillToResume(item.keyword)}
                    className="px-3 py-1 bg-[#282934] hover:bg-[#0052ff] text-white rounded text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add to Resume
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Most Recommended Improvements & Latest Activity */}
        <div className="lg:col-span-6 space-y-6">
          {/* Most Recommended Improvements Card */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold font-geist text-[#e1e1ef] flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#4cd7f6]" />
                Most Recommended Improvements
              </h3>
              <button 
                onClick={() => onSelectTab('ai-improvements')}
                className="text-xs font-mono text-[#b7c4ff] hover:underline cursor-pointer"
              >
                Open Improvement Engine
              </button>
            </div>

            <div className="space-y-3">
              {topSuggestions.map(sug => (
                <div 
                  key={sug.id}
                  className="bg-[#11131c] border border-[#434656]/30 rounded-xl p-4 space-y-2 hover:border-[#0052ff]/40 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-[#e1e1ef] font-geist">{sug.title}</h4>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 font-mono text-[10px] rounded font-bold">
                      +{sug.expectedAtsIncrease} ATS PTS
                    </span>
                  </div>

                  <p className="text-xs text-[#c3c5d9] italic bg-[#0c0e17] p-2 rounded border border-[#434656]/20">
                    "{sug.improvedVersion}"
                  </p>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] font-mono text-[#8d90a2]">{sug.reason}</span>
                    <button
                      onClick={() => onApplyImprovement(sug.id)}
                      className="px-3 py-1 bg-[#0052ff] hover:bg-[#0052ff]/80 text-white rounded text-xs font-mono font-medium flex items-center gap-1 cursor-pointer"
                    >
                      Accept Fix <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Resume Activity Timeline */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-6 shadow-xl">
            <h3 className="text-base font-bold font-geist text-[#e1e1ef] flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-[#b7c4ff]" />
              Latest Resume Activity
            </h3>

            <div className="space-y-4 relative pl-4 border-l border-[#434656]/40 ml-2">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0052ff] ring-4 ring-[#191b25]" />
                <p className="text-xs font-medium text-[#e1e1ef]">Resume "Software Engineer - Master" analyzed by AI</p>
                <p className="text-[10px] font-mono text-[#8d90a2]">Score increased from 77 to 85 • Today 2:45 PM</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#4cd7f6] ring-4 ring-[#191b25]" />
                <p className="text-xs font-medium text-[#e1e1ef]">Generated Tailored Resume for Stripe Senior Frontend Engineer</p>
                <p className="text-[10px] font-mono text-[#8d90a2]">Achieved 91% match • Yesterday 4:15 PM</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-400 ring-4 ring-[#191b25]" />
                <p className="text-xs font-medium text-[#e1e1ef]">Synced updated skills with User Profile</p>
                <p className="text-[10px] font-mono text-[#8d90a2]">Added React 19, TypeScript, Kafka • 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
