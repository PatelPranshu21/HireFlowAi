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
  ChevronUp,
  FileQuestion
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

  const sections: SectionAnalysisItem[] = analysis.sectionAnalyses || (analysis as any).sectionAnalysis || [];

  const handleApply = (sectionName: string, changeText: string) => {
    if (!changeText) return;
    onApplySectionChange(sectionName, changeText);
    setAppliedSections(prev => ({ ...prev, [sectionName]: true }));
  };

  if (sections.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0052ff]/15 border border-[#0052ff]/30 flex items-center justify-center text-[#4cd7f6] mx-auto mb-4">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-geist text-white mb-2">No Section Analysis Available</h3>
          <p className="text-xs text-[#c3c5d9] max-w-md mx-auto leading-relaxed">
            Upload or analyze a resume to generate an evidence-based, section-by-section AI audit of your professional summary, work experience, technical skills, projects, and education.
          </p>
        </div>
      </div>
    );
  }

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
            <p className="text-xs text-[#c3c5d9]">Evidence-based strengths, weaknesses, and optimization advice generated from your uploaded resume.</p>
          </div>
        </div>
      </div>

      {/* Sections Accordion List */}
      <div className="space-y-4">
        {sections.map(sec => {
          const isExpanded = expandedSection === sec.sectionName;
          const isApplied = appliedSections[sec.sectionName];
          const isDetected = sec.isDetected !== false && sec.score > 0;

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
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold font-geist text-white">{sec.sectionName}</h3>
                  
                  {isDetected ? (
                    <>
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
                    </>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400" /> Section not detected
                    </span>
                  )}
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
                      {sec.strengths && sec.strengths.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-[#e1e1ef]">
                          {sec.strengths.map((str, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-400">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-[#8d90a2] italic">No detected strengths in this section.</p>
                      )}
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-[#191b25] p-4 rounded-xl border border-red-500/20 space-y-2">
                      <h4 className="text-xs font-mono text-red-400 uppercase font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Areas for Improvement
                      </h4>
                      {sec.weaknesses && sec.weaknesses.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-[#e1e1ef]">
                          {sec.weaknesses.map((wk, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              <span>{wk}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-[#8d90a2] italic">No major weaknesses detected for this section.</p>
                      )}
                    </div>
                  </div>

                  {/* AI Suggestions Box */}
                  {sec.suggestions && sec.suggestions.length > 0 && (
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
                  )}

                  {/* Recommended Changes & One-Click Apply */}
                  {sec.recommendedChanges && sec.recommendedChanges.length > 0 && (
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
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
