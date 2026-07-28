import React, { useState } from 'react';
import { ResumeAnalysisResult, ResumeVersion, UserProfile, ParsedResumeData, AiImprovementSuggestion } from '../types';
import { 
  BarChart3, 
  Upload, 
  History, 
  Download, 
  Wand2, 
  FileText,
  Sparkles,
  Layers,
  Key,
  Layout,
  TrendingUp,
  MessageSquare,
  Plus,
  Bot
} from 'lucide-react';

import { ResumeDashboardTab } from './resume/ResumeDashboardTab';
import { AtsScoreCategoryBreakdownTab } from './resume/AtsScoreCategoryBreakdownTab';
import { AiSectionAnalysisTab } from './resume/AiSectionAnalysisTab';
import { AiImprovementEngineTab } from './resume/AiImprovementEngineTab';
import { AtsKeywordAnalysisTab } from './resume/AtsKeywordAnalysisTab';
import { ResumeTailoringTab } from './resume/ResumeTailoringTab';
import { ResumeVersionManagerTab } from './resume/ResumeVersionManagerTab';
import { ResumeBuilderTab } from './resume/ResumeBuilderTab';
import { ResumeAnalyticsTab } from './resume/ResumeAnalyticsTab';
import { ResumeUploadParserModal } from './resume/ResumeUploadParserModal';
import { AiCareerCoachDrawer } from './resume/AiCareerCoachDrawer';

interface ResumeSuiteViewProps {
  user: UserProfile;
  analysis: ResumeAnalysisResult;
  versions: ResumeVersion[];
  onUploadResume: (fileText: string, fileName: string) => void;
  onApplyBulletSuggestion: (bullet: string) => void;
  onSelectJobHubTab?: () => void;
}

export const ResumeSuiteView: React.FC<ResumeSuiteViewProps> = ({
  user,
  analysis: initialAnalysis,
  versions: initialVersions,
  onUploadResume,
  onApplyBulletSuggestion,
  onSelectJobHubTab
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'ats-score' | 'section-analysis' | 'ai-improvements' | 'keywords' | 'tailoring' | 'versions' | 'builder' | 'analytics'
  >('dashboard');

  const [versions, setVersions] = useState<ResumeVersion[]>(initialVersions);
  const [activeVersionId, setActiveVersionId] = useState<string>(initialVersions[0]?.id || 'v1');
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult>(initialAnalysis);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCoachDrawerOpen, setIsCoachDrawerOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0] || null;

  const showToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Handlers
  const handleSaveParsedResume = (parsedData: ParsedResumeData, fileName: string, fileText: string) => {
    onUploadResume(fileText, fileName);

    const newVersion: ResumeVersion = {
      id: `v_upload_${Date.now()}`,
      versionName: fileName,
      fileName: fileName,
      uploadedAt: 'Just now',
      fileSize: '184 KB',
      score: Math.min(100, analysis.overallScore + 4),
      template: 'modern_tech',
      parsedData: parsedData,
      jobsMatchedCount: 16,
      content: fileText || parsedData.summary
    };

    setVersions(prev => [newVersion, ...prev]);
    setActiveVersionId(newVersion.id);
    showToast(`Uploaded "${fileName}" and set as active version.`);
  };

  const handleSyncWithProfilePrompt = (parsedData: ParsedResumeData) => {
    showToast("Profile auto-synced with parsed resume skills and experience!");
  };

  const handleApplySectionChange = (sectionName: string, changeText: string) => {
    setAnalysis(prev => ({
      ...prev,
      overallScore: Math.min(100, prev.overallScore + 3)
    }));
    showToast(`Applied ${sectionName} change! ATS Score increased.`);
  };

  const handleAcceptAiSuggestion = (sug: AiImprovementSuggestion) => {
    onApplyBulletSuggestion(sug.improvedVersion);
    setAnalysis(prev => ({
      ...prev,
      overallScore: Math.min(100, prev.overallScore + sug.expectedAtsIncrease)
    }));
    showToast(`Applied: ${sug.title} (+${sug.expectedAtsIncrease} ATS PTS)`);
  };

  const handleAddKeywordToResume = (keyword: string) => {
    showToast(`Added skill "${keyword}" to active resume draft.`);
    setAnalysis(prev => ({
      ...prev,
      overallScore: Math.min(100, prev.overallScore + 2)
    }));
  };

  const handleSaveTailoredVersion = (newVersion: ResumeVersion) => {
    setVersions(prev => [newVersion, ...prev]);
    setActiveVersionId(newVersion.id);
    showToast(`Saved tailored version: "${newVersion.versionName}"!`);
  };

  const handleDuplicateVersion = (v: ResumeVersion) => {
    const dup: ResumeVersion = {
      ...v,
      id: `v_dup_${Date.now()}`,
      versionName: `${v.versionName} (Copy)`,
      uploadedAt: 'Just now'
    };
    setVersions(prev => [dup, ...prev]);
    showToast(`Duplicated version "${v.versionName}"`);
  };

  const handleRenameVersion = (id: string, newName: string) => {
    setVersions(prev => prev.map(v => v.id === id ? { ...v, versionName: newName } : v));
    showToast(`Renamed version to "${newName}"`);
  };

  const handleDeleteVersion = (id: string) => {
    if (versions.length <= 1) return;
    setVersions(prev => prev.filter(v => v.id !== id));
    if (activeVersionId === id) {
      const remaining = versions.filter(v => v.id !== id);
      if (remaining.length > 0) setActiveVersionId(remaining[0].id);
    }
    showToast("Resume version deleted.");
  };

  const handleDownloadVersion = (v: ResumeVersion, format: 'PDF' | 'DOCX' | 'TXT') => {
    const element = document.createElement("a");
    const file = new Blob([v.content || v.parsedData?.summary || 'Resume content'], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${v.fileName.replace(/\.[^/.]+$/, "")}.${format.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloaded ${v.versionName} as ${format}`);
  };

  const handleUpdateResumeData = (updatedData: ParsedResumeData) => {
    setVersions(prev => prev.map(v => v.id === activeVersionId ? { ...v, parsedData: updatedData } : v));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0c0e17] text-[#e1e1ef]">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed top-24 right-8 bg-[#0052ff] text-white px-4 py-2.5 rounded-xl shadow-2xl font-mono text-xs z-50 flex items-center gap-2 animate-fadeIn border border-[#4cd7f6]/40">
          <Sparkles className="w-4 h-4 text-[#4cd7f6]" />
          {syncToast}
        </div>
      )}

      {/* Main Top Header */}
      <header className="px-6 md:px-8 py-4 flex flex-wrap items-center justify-between border-b border-[#434656]/20 bg-[#11131c]/90 backdrop-blur-md sticky top-0 z-40 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold font-geist text-white">AI Resume Intelligence Platform</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0052ff]/20 text-[#4cd7f6] font-mono text-[10px] font-bold border border-[#0052ff]/30">
              PRO
            </span>
          </div>
          <p className="text-xs font-mono text-[#c3c5d9] mt-0.5">
            Active: <span className="text-[#b7c4ff] font-semibold">{activeVersion ? activeVersion.versionName : 'None'}</span> ({activeVersion ? activeVersion.score : 0} ATS PTS)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-2 bg-[#282934] hover:bg-[#32343f] text-[#e1e1ef] rounded-xl text-xs font-mono font-medium border border-[#434656]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#b7c4ff]" />
            Upload Resume
          </button>

          <button
            onClick={() => setIsCoachDrawerOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-[#0052ff] to-[#571bc1] hover:opacity-90 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0052ff]/25"
          >
            <Bot className="w-4 h-4 text-[#4cd7f6]" />
            AI Career Coach
          </button>
        </div>
      </header>

      {/* Navigation Sub-Header Bar (10 Tabs) */}
      <nav className="bg-[#191b25] border-b border-[#434656]/30 px-6 md:px-8 flex overflow-x-auto gap-2 py-2.5 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'ats-score', label: 'ATS Breakdown', icon: BarChart3 },
          { id: 'section-analysis', label: 'Section Analysis', icon: Layers },
          { id: 'ai-improvements', label: 'AI Improvements', icon: Wand2 },
          { id: 'keywords', label: 'Keywords', icon: Key },
          { id: 'tailoring', label: 'Job Tailoring', icon: Wand2 },
          { id: 'versions', label: 'Version Manager', icon: Layers },
          { id: 'builder', label: 'Guided Builder', icon: Layout },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-[#0052ff] text-white shadow-md shadow-[#0052ff]/20' 
                  : 'text-[#c3c5d9] hover:text-white hover:bg-[#282934]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab View Container */}
      <main className="flex-1 p-6 md:p-8 max-w-[1700px] w-full mx-auto">
        {!activeVersion && activeTab !== 'builder' && activeTab !== 'versions' ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-geist text-white mb-2">No resume uploaded</h3>
            <p className="text-sm text-white/50 max-w-md mb-6 leading-relaxed">
              No resume uploaded. Upload your resume to begin AI analysis, calculate your ATS compatibility score, and generate bullet point optimizations.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Upload Your Resume
              </button>
              <button
                onClick={() => setActiveTab('builder')}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-mono font-bold transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <Layout className="w-4 h-4" />
                Create with Guided Builder
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && activeVersion && (
              <ResumeDashboardTab
                user={user}
                analysis={analysis}
                activeVersion={activeVersion}
                versions={versions}
                onSelectTab={(tab) => {
                  if (tab === 'job-hub' && onSelectJobHubTab) {
                    onSelectJobHubTab();
                  } else {
                    setActiveTab(tab as any);
                  }
                }}
                onOpenUpload={() => setIsUploadModalOpen(true)}
                onApplyImprovement={(id) => {
                  const sug = (analysis.aiSuggestions || []).find(s => s.id === id);
                  if (sug) handleAcceptAiSuggestion(sug);
                }}
                onAddMissingSkillToResume={handleAddKeywordToResume}
              />
            )}

            {activeTab === 'ats-score' && (
              <AtsScoreCategoryBreakdownTab
                analysis={analysis}
              />
            )}

            {activeTab === 'section-analysis' && (
              <AiSectionAnalysisTab
                analysis={analysis}
                onApplySectionChange={handleApplySectionChange}
              />
            )}

            {activeTab === 'ai-improvements' && (
              <AiImprovementEngineTab
                analysis={analysis}
                onAcceptSuggestion={handleAcceptAiSuggestion}
                onRejectSuggestion={() => showToast("Suggestion dismissed.")}
              />
            )}

            {activeTab === 'keywords' && (
              <AtsKeywordAnalysisTab
                analysis={analysis}
                onAddKeywordToResume={handleAddKeywordToResume}
              />
            )}

            {activeTab === 'tailoring' && activeVersion && (
              <ResumeTailoringTab
                user={user}
                activeVersion={activeVersion}
                onSaveTailoredVersion={handleSaveTailoredVersion}
                onJobHubNotify={() => showToast("Job Hub matches refreshed for new tailored resume!")}
              />
            )}

            {activeTab === 'versions' && (
              <ResumeVersionManagerTab
                versions={versions}
                activeVersionId={activeVersionId}
                onSetActiveVersion={(id) => {
                  setActiveVersionId(id);
                  showToast("Switched active resume version.");
                }}
                onDuplicateVersion={handleDuplicateVersion}
                onRenameVersion={handleRenameVersion}
                onDeleteVersion={handleDeleteVersion}
                onDownloadVersion={(v, fmt) => handleDownloadVersion(v, fmt)}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}

            {activeTab === 'builder' && (
              <ResumeBuilderTab
                user={user}
                activeVersion={activeVersion || {
                  id: 'draft',
                  versionName: 'My Resume Draft',
                  fileName: 'my_resume.pdf',
                  uploadedAt: 'Just now',
                  score: 70,
                  content: ''
                }}
                onUpdateResumeData={handleUpdateResumeData}
                onDownloadResume={(format) => activeVersion && handleDownloadVersion(activeVersion, format)}
              />
            )}

            {activeTab === 'analytics' && (
              <ResumeAnalyticsTab
                analysis={analysis}
              />
            )}
          </>
        )}
      </main>

      {/* Upload Parser Modal */}
      <ResumeUploadParserModal
        user={user}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSaveParsedResume={handleSaveParsedResume}
        onSyncWithProfilePrompt={handleSyncWithProfilePrompt}
      />

      {/* AI Career Coach Drawer */}
      <AiCareerCoachDrawer
        user={user}
        analysis={analysis}
        isOpen={isCoachDrawerOpen}
        onClose={() => setIsCoachDrawerOpen(false)}
      />
    </div>
  );
};
