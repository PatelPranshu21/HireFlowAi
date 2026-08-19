import React from 'react';
import { ResumeAnalysisResult, AtsCategoryScore } from '../../types';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  FileQuestion
} from 'lucide-react';

interface AtsScoreCategoryBreakdownTabProps {
  analysis: ResumeAnalysisResult;
  onApplyCategoryTip?: (category: string) => void;
}

export const AtsScoreCategoryBreakdownTab: React.FC<AtsScoreCategoryBreakdownTabProps> = ({
  analysis
}) => {
  const categories: AtsCategoryScore[] = analysis.categoryScores || (analysis as any).categoryBreakdown || [];

  const highCount = categories.filter(c => c.score >= 85).length;
  const needsFixCount = categories.filter(c => c.score < 75).length;

  if (categories.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0052ff]/15 border border-[#0052ff]/30 flex items-center justify-center text-[#4cd7f6] mx-auto mb-4">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-geist text-white mb-2">No Category Breakdown Available</h3>
          <p className="text-xs text-[#c3c5d9] max-w-md mx-auto leading-relaxed">
            Upload or analyze a resume to generate an in-depth 10-point ATS category audit spanning structure, impact, keywords, and readability.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Animated Gauge & Hero Card */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 md:p-8 relative overflow-hidden ai-gradient-border shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0052ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Radial Score Gauge */}
          <div className="relative w-40 h-40 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path 
                className="text-[#282934] stroke-current" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                strokeWidth="3.5" 
              />
              {analysis.overallScore > 0 && (
                <path 
                  className="text-[#0052ff] stroke-current transition-all duration-1000 ease-out" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  strokeDasharray={`${analysis.overallScore}, 100`} 
                  strokeLinecap="round" 
                  strokeWidth="3.5" 
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold font-geist text-white">
                {analysis.overallScore > 0 ? analysis.overallScore : '--'}
              </span>
              <span className="text-xs font-mono text-[#8d90a2]">
                {analysis.overallScore > 0 ? '/ 100 ATS' : 'ATS Score'}
              </span>
            </div>
          </div>

          {/* Text & Quick Diagnostics */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052ff]/15 text-[#b7c4ff] border border-[#0052ff]/30 text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-[#4cd7f6]" />
              Multi-Factor ATS Audit Score
            </div>
            <h2 className="text-2xl font-bold font-geist text-white">
              Overall ATS Compatibility Assessment
            </h2>
            <p className="text-sm text-[#c3c5d9] leading-relaxed max-w-2xl">
              {analysis.overallScore > 0 ? analysis.summary : 'Upload your resume to analyze your ATS compatibility.'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">
                <CheckCircle2 className="w-4 h-4" /> {highCount} High Performing Categories
              </div>
              {needsFixCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
                  <AlertCircle className="w-4 h-4" /> {needsFixCount} Categories Need Optimization
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 10 Detailed Category Cards Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#4cd7f6]" />
              10-Point ATS Category Breakdown
            </h3>
            <p className="text-xs text-[#c3c5d9] mt-0.5">Detailed breakdown across all criteria evaluated by enterprise recruiter ATS scanners.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => {
            const isHigh = cat.score >= 85;
            const isMedium = cat.score >= 75 && cat.score < 85;

            return (
              <div 
                key={cat.category}
                className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-5 hover:border-[#b7c4ff]/40 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-base font-bold font-geist text-white flex items-center gap-2">
                      {cat.category}
                      {isHigh ? (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 font-mono text-[10px] rounded font-bold">Excellent</span>
                      ) : isMedium ? (
                        <span className="px-2 py-0.5 bg-amber-400/10 text-amber-300 font-mono text-[10px] rounded font-bold">Good</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 font-mono text-[10px] rounded font-bold">Needs Fix</span>
                      )}
                    </h4>
                    <span className="text-lg font-bold font-mono text-[#b7c4ff]">{cat.score}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#282934] h-2 rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        isHigh ? 'bg-gradient-to-r from-green-500 to-[#4cd7f6]' : isMedium ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>

                  <p className="text-xs text-[#c3c5d9] leading-relaxed mb-3">
                    {cat.explanation}
                  </p>
                </div>

                <div className="bg-[#11131c] rounded-lg p-3 border border-[#434656]/20 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#4cd7f6] shrink-0 mt-0.5" />
                  <p className="text-xs font-mono text-[#e1e1ef]">
                    <span className="text-[#8d90a2] block uppercase text-[9px] mb-0.5">Action Tip:</span>
                    {cat.tip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
