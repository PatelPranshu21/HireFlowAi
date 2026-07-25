import React, { useState } from 'react';
import { ResumeAnalysisResult, SectionAnalysisItem } from '../../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Layers, 
  Check, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

interface AiSectionAnalysisTabProps {
  analysis: ResumeAnalysisResult;
  onApplySectionChange: (sectionName: string, changeText: string) => void;
}

export const AiSectionAnalysisTab: React.FC<AiSectionAnalysisTabProps> = ({
  analysis,
  onApplySectionChange
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('Work Experience');
  const [appliedSections, setAppliedSections] = useState<Record<string, boolean>>({});

  const sections: SectionAnalysisItem[] = analysis.sectionAnalyses || [
    {
      id: 'sa_1',
      sectionName: 'Professional Summary',
      strengths: ['Clearly states 7+ years of senior experience', 'Mentions key tech stack (React, Node, AWS)'],
      weaknesses: ['Lacks target leadership focus', 'Does not mention distributed scale'],
      suggestions: ['Include team lead experience and scale of microservices managed.'],
      recommendedChanges: ['Change to: "High-impact Senior Software Engineer with 7+ years architecting cloud microservices and leading frontend initiatives driving 35%+ performance improvements."'],
      priority: 'High',
      estimatedAtsGain: 6
    },
    {
      id: 'sa_2',
      sectionName: 'Work Experience',
      strengths: ['Prominent tech companies (Apple, TechCorp)', 'Clear timeline and promotion history'],
      weaknesses: ['First bullet at Apple lacks metrics', 'Generic cloud deployment phrase'],
      suggestions: ['Replace generic "built backend services" with specific throughput numbers.', 'Specify Terraform and EKS for cloud.'],
      recommendedChanges: ['Quantify Apple bullet 1 to 10k+ req/sec using Kafka & Redis.'],
      priority: 'High',
      estimatedAtsGain: 8
    },
    {
      id: 'sa_3',
      sectionName: 'Projects',
      strengths: ['Relevant distributed event broker project', 'Includes modern tech stack tags (Go, Kafka, Docker)'],
      weaknesses: ['Missing live demo link', 'Lacks user traction or benchmark numbers'],
      suggestions: ['Mention latency benchmark (e.g. sub-5ms processing).'],
      recommendedChanges: ['Add benchmark data: "Achieved sub-5ms event delivery latency across 1M daily messages."'],
      priority: 'Medium',
      estimatedAtsGain: 4
    },
    {
      id: 'sa_4',
      sectionName: 'Skills',
      strengths: ['Categorized cleanly', 'High overlap with Senior roles'],
      weaknesses: ['Missing Kubernetes and GraphQL', 'Missing CI/CD pipelines tag'],
      suggestions: ['Add Docker, Kubernetes, GraphQL, CI/CD, Terraform.'],
      recommendedChanges: ['Append Kubernetes and GraphQL to Tools section.'],
      priority: 'High',
      estimatedAtsGain: 5
    },
    {
      id: 'sa_5',
      sectionName: 'Education',
      strengths: ['Stanford BS in Computer Science', 'GPA 3.9/4.0 clearly listed'],
      weaknesses: ['No major weaknesses detected.'],
      suggestions: ['No changes required for education.'],
      recommendedChanges: ['Keep current formatting.'],
      priority: 'Low',
      estimatedAtsGain: 1
    },
    {
      id: 'sa_6',
      sectionName: 'Achievements & Certifications',
      strengths: ['AWS Certified Solutions Architect included', 'Hackathon winner credential'],
      weaknesses: ['Missing year for AWS certification renewal'],
      suggestions: ['Specify certification issue/expiry dates.'],
      recommendedChanges: ['Add "AWS Certified Solutions Architect (2024)"'],
      priority: 'Low',
      estimatedAtsGain: 2
    }
  ];

  const handleApply = (sectionName: string, changeText: string) => {
    onApplySectionChange(sectionName, changeText);
    setAppliedSections(prev => ({ ...prev, [sectionName]: true }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#0052ff]/20 text-[#b7c4ff] rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-geist text-white">Section-by-Section AI Analysis</h2>
            <p className="text-xs text-[#c3c5d9]">Comprehensive strengths, weaknesses, and recommended changes across all 7 resume sections.</p>
          </div>
        </div>
      </div>

      {/* Sections Accordion List */}
      <div className="space-y-4">
        {sections.map(sec => {
          const isExpanded = expandedSection === sec.sectionName;
          const isApplied = appliedSections[sec.sectionName];

          return (
            <div 
              key={sec.id}
              className={`bg-[#191b25] border rounded-2xl overflow-hidden transition-all ${
                isExpanded ? 'border-[#b7c4ff]/40 shadow-xl' : 'border-[#434656]/30 hover:border-[#434656]/60'
              }`}
            >
              {/* Header Bar */}
              <div 
                onClick={() => setExpandedSection(isExpanded ? null : sec.sectionName)}
                className="p-5 flex items-center justify-between cursor-pointer bg-[#1d1f29]/80 hover:bg-[#1d1f29] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold font-geist text-white">{sec.sectionName}</h3>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    sec.priority === 'High' 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : sec.priority === 'Medium' 
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' 
                      : 'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>
                    {sec.priority} Priority
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#0052ff]/15 text-[#b7c4ff] font-mono text-[10px] rounded font-bold">
                    +{sec.estimatedAtsGain}% ATS Gain
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {isApplied && (
                    <span className="text-xs font-mono text-green-400 flex items-center gap-1 font-semibold">
                      <Check className="w-4 h-4" /> Changes Applied
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-[#8d90a2]" /> : <ChevronDown className="w-5 h-5 text-[#8d90a2]" />}
                </div>
              </div>

              {/* Expanded Section Details */}
              {isExpanded && (
                <div className="p-6 border-t border-[#434656]/30 space-y-6 bg-[#11131c]">
                  {/* Grid of Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-[#191b25] p-4 rounded-xl border border-green-500/20 space-y-2">
                      <h4 className="text-xs font-mono text-green-400 uppercase font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Section Strengths
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#e1e1ef]">
                        {sec.strengths.map((str, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-400">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-[#191b25] p-4 rounded-xl border border-red-500/20 space-y-2">
                      <h4 className="text-xs font-mono text-red-400 uppercase font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Areas for Improvement
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#e1e1ef]">
                        {sec.weaknesses.map((wk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-400">•</span>
                            <span>{wk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* AI Suggestions Box */}
                  <div className="bg-[#191b25] p-4 rounded-xl border border-[#434656]/30 space-y-2">
                    <h4 className="text-xs font-mono text-[#4cd7f6] uppercase font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Strategic Advice
                    </h4>
                    {sec.suggestions.map((sug, i) => (
                      <p key={i} className="text-xs text-[#c3c5d9] leading-relaxed">
                        {sug}
                      </p>
                    ))}
                  </div>

                  {/* Recommended Changes & One-Click Apply */}
                  <div className="bg-[#1d1f29] p-4 rounded-xl border border-[#0052ff]/30 space-y-3">
                    <h4 className="text-xs font-mono text-[#b7c4ff] uppercase font-bold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" /> Recommended Text Change
                    </h4>
                    {sec.recommendedChanges.map((rec, i) => (
                      <p key={i} className="text-xs font-mono text-[#e1e1ef] bg-[#11131c] p-3 rounded border border-[#434656]/30 italic">
                        "{rec}"
                      </p>
                    ))}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleApply(sec.sectionName, sec.recommendedChanges[0] || '')}
                        disabled={isApplied}
                        className="px-4 py-2 bg-[#0052ff] hover:bg-[#0052ff]/90 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0052ff]/25"
                      >
                        {isApplied ? <Check className="w-4 h-4 text-green-400" /> : <ArrowRight className="w-4 h-4" />}
                        {isApplied ? 'Change Applied to Active Draft' : 'Apply Change to Draft'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
