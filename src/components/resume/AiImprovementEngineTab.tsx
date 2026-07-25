import React, { useState } from 'react';
import { ResumeAnalysisResult, AiImprovementSuggestion } from '../../types';
import { 
  Wand2, 
  Check, 
  X, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Filter 
} from 'lucide-react';

interface AiImprovementEngineTabProps {
  analysis: ResumeAnalysisResult;
  onAcceptSuggestion: (sug: AiImprovementSuggestion) => void;
  onRejectSuggestion: (sugId: string) => void;
}

export const AiImprovementEngineTab: React.FC<AiImprovementEngineTabProps> = ({
  analysis,
  onAcceptSuggestion,
  onRejectSuggestion
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<AiImprovementSuggestion[]>(
    analysis.aiSuggestions || [
      {
        id: 'sug_1',
        title: 'Quantify Backend Throughput & Latency',
        section: 'bullets',
        currentVersion: 'Built backend services for streaming media processing.',
        improvedVersion: 'Architected and deployed highly available distributed streaming services handling 10,000+ requests/sec using Kafka and Redis with sub-10ms processing latency.',
        reason: 'Increases ATS keyword match for "Distributed Systems" and adds measurable technical impact.',
        expectedAtsIncrease: 8,
        status: 'pending'
      },
      {
        id: 'sug_2',
        title: 'Enhance Cloud Infrastructure Details',
        section: 'experience',
        currentVersion: 'Managed cloud infrastructure deployment and maintenance.',
        improvedVersion: 'Engineered multi-region AWS cloud infrastructure (EC2, S3, RDS, EKS) using Terraform and automated CI/CD pipelines.',
        reason: 'Adds specific cloud services (AWS, EKS, Terraform) required by 85% of target job posts.',
        expectedAtsIncrease: 6,
        status: 'pending'
      },
      {
        id: 'sug_3',
        title: 'Elevate Professional Summary',
        section: 'summary',
        currentVersion: 'Passionate Senior Engineer with 7+ years of experience building scalable web applications and cloud microservices.',
        improvedVersion: 'Results-driven Senior Software Engineer with 7+ years of experience architecting distributed microservices, leading cross-functional teams, and accelerating web application performance by 35% for 200k+ active daily users.',
        reason: 'Creates a commanding first impression with clear scale metrics and leadership keywords.',
        expectedAtsIncrease: 5,
        status: 'pending'
      },
      {
        id: 'sug_4',
        title: 'Strengthen Technical Skills Section',
        section: 'skills',
        currentVersion: 'Tools: Docker, AWS, Git, Kafka, Redis',
        improvedVersion: 'Cloud & Infrastructure: AWS (EC2, S3, EKS, CloudFront), Terraform, Docker, Kubernetes, CI/CD (GitHub Actions), Kafka, Redis',
        reason: 'Increases searchability for DevOps and Kubernetes keywords in automated recruiter screens.',
        expectedAtsIncrease: 4,
        status: 'pending'
      },
      {
        id: 'sug_5',
        title: 'Reduce Passive Voice in Lead Experience',
        section: 'passive_voice',
        currentVersion: 'Was responsible for leading frontend migration.',
        improvedVersion: 'Spearheaded frontend migration to Next.js and TypeScript, driving a 35% reduction in initial page load time.',
        reason: 'Replaces weak passive voice with strong active verb "Spearheaded".',
        expectedAtsIncrease: 4,
        status: 'pending'
      },
      {
        id: 'sug_6',
        title: 'Fix Capitalization & Tech Term Grammar',
        section: 'grammar',
        currentVersion: 'Experienced with typescript, react, and Postgres databases.',
        improvedVersion: 'Experienced with TypeScript, React.js, and PostgreSQL database architectures.',
        reason: 'Ensures standard capitalization expected by recruiter keywords parser.',
        expectedAtsIncrease: 3,
        status: 'pending'
      }
    ]
  );

  const [loadingSuggestionId, setLoadingSuggestionId] = useState<string | null>(null);

  const handleAccept = (sug: AiImprovementSuggestion) => {
    setSuggestions(prev => prev.map(s => s.id === sug.id ? { ...s, status: 'accepted' } : s));
    onAcceptSuggestion(sug);
  };

  const handleReject = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
    onRejectSuggestion(id);
  };

  const filtered = suggestions.filter(s => {
    if (filterCategory === 'all') return true;
    return s.section === filterCategory;
  });

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const acceptedCount = suggestions.filter(s => s.status === 'accepted').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052ff]/15 text-[#b7c4ff] text-xs font-mono mb-2">
              <Wand2 className="w-3.5 h-3.5 text-[#4cd7f6]" /> One-Click AI Optimization Engine
            </div>
            <h2 className="text-2xl font-bold font-geist text-white">
              AI Resume Improvements
            </h2>
            <p className="text-xs text-[#c3c5d9] mt-0.5">
              Review and accept targeted AI rewrites to instantly boost your ATS keyword score and impact.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#11131c] px-3 py-2 rounded-xl border border-[#434656]/30 text-center">
              <span className="text-xs font-mono text-[#8d90a2] block">Pending</span>
              <span className="text-base font-bold font-mono text-amber-400">{pendingCount}</span>
            </div>
            <div className="bg-[#11131c] px-3 py-2 rounded-xl border border-[#434656]/30 text-center">
              <span className="text-xs font-mono text-[#8d90a2] block">Accepted</span>
              <span className="text-base font-bold font-mono text-green-400">{acceptedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#434656]/30 pb-3">
        {[
          { id: 'all', label: 'All Fixes' },
          { id: 'summary', label: 'Summary' },
          { id: 'bullets', label: 'Bullet Points' },
          { id: 'experience', label: 'Experience' },
          { id: 'skills', label: 'Skills' },
          { id: 'passive_voice', label: 'Passive Voice' },
          { id: 'grammar', label: 'Grammar' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filterCategory === cat.id 
                ? 'bg-[#0052ff] text-white font-bold' 
                : 'bg-[#191b25] text-[#c3c5d9] hover:text-white border border-[#434656]/30'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filtered.map(sug => {
          const isAccepted = sug.status === 'accepted';
          const isRejected = sug.status === 'rejected';

          return (
            <div 
              key={sug.id}
              className={`bg-[#191b25] border rounded-2xl p-6 transition-all shadow-xl space-y-4 ${
                isAccepted 
                  ? 'border-green-500/40 bg-green-950/10' 
                  : isRejected 
                  ? 'border-red-500/20 opacity-60' 
                  : 'border-[#434656]/40 hover:border-[#b7c4ff]/40'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0052ff]/15 text-[#4cd7f6] rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-geist text-white">{sug.title}</h3>
                    <span className="text-[10px] font-mono text-[#8d90a2] uppercase">
                      Section: {sug.section}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-green-500/10 text-green-400 font-mono text-xs rounded font-bold border border-green-500/20">
                    +{sug.expectedAtsIncrease} ATS PTS
                  </span>
                  {isAccepted && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 font-mono text-xs rounded font-bold">
                      Accepted ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Before vs After Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Version */}
                <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/30 space-y-1">
                  <span className="text-[10px] font-mono text-red-400 uppercase font-bold block">
                    Current Version
                  </span>
                  <p className="text-xs font-mono text-[#c3c5d9] leading-relaxed">
                    {sug.currentVersion}
                  </p>
                </div>

                {/* AI Improved Version */}
                <div className="bg-[#11131c] p-4 rounded-xl border border-green-500/30 space-y-1">
                  <span className="text-[10px] font-mono text-green-400 uppercase font-bold block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#4cd7f6]" /> AI Improved Version
                  </span>
                  <p className="text-xs font-mono text-white leading-relaxed font-medium">
                    {sug.improvedVersion}
                  </p>
                </div>
              </div>

              {/* Reason Explanation */}
              <div className="bg-[#1d1f29] p-3 rounded-lg border border-[#434656]/20">
                <p className="text-xs text-[#c3c5d9]">
                  <span className="text-[#b7c4ff] font-mono font-bold">Strategic Reason:</span> {sug.reason}
                </p>
              </div>

              {/* Action Buttons */}
              {sug.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleReject(sug.id)}
                    className="px-4 py-2 bg-[#282934] hover:bg-[#32343f] text-[#c3c5d9] rounded-xl text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4 text-red-400" /> Reject
                  </button>
                  <button
                    onClick={() => handleAccept(sug)}
                    className="px-5 py-2 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0052ff]/25"
                  >
                    <Check className="w-4 h-4 text-green-400" /> Accept &amp; Apply to Active Resume
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
