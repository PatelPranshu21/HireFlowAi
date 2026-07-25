import React from 'react';
import { X, Sparkles, CheckCircle, AlertTriangle, ArrowRight, Target, Lightbulb } from 'lucide-react';
import { JobRecommendation, UserProfile } from '../types';

interface WhyMatchModalProps {
  job: JobRecommendation;
  user: UserProfile;
  onClose: () => void;
}

export const WhyMatchModal: React.FC<WhyMatchModalProps> = ({
  job,
  user,
  onClose
}) => {
  const reqSkills = job.requiredSkills || [];
  const missingSkills = job.missingSkills || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#191b25] border border-[#434656]/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#212433] p-5 border-b border-[#434656]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#571bc1]/20 border border-[#571bc1]/40 text-[#d0bcff]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-geist text-white">Why Am I Seeing This Job?</h3>
              <p className="text-xs font-mono text-[#a1a3b8]">AI Match Explainability & Career Diagnostics</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-[#11131c] hover:bg-[#2e3245] text-[#a1a3b8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Match Score Hero Card */}
          <div className="bg-[#11131c] border border-[#434656]/30 rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-[#a1a3b8]">Recommended Position</span>
              <h4 className="text-base font-bold font-geist text-white mt-0.5">{job.title}</h4>
              <p className="text-xs font-mono text-[#4cd7f6]">{job.company} • {job.location}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-[#8d90a2] block">{job.matchScore}%</span>
              <span className="text-[10px] font-mono text-[#4cd7f6] uppercase tracking-wider font-semibold">
                {job.matchConfidence || 'Very High'} Match
              </span>
            </div>
          </div>

          {/* Core Reasoning */}
          <div>
            <h4 className="text-xs font-mono uppercase text-[#a1a3b8] tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#0052ff]" /> Recommendation Rationale
            </h4>
            <div className="bg-[#241f3e]/40 border border-[#571bc1]/30 rounded-xl p-4 text-xs text-[#e1e1ef] leading-relaxed">
              {job.recommendationReason || `This opportunity was selected for ${user.name} because your title (${user.title}) and skills strongly match ${job.company}'s hiring requirements.`}
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Matching Skills */}
            <div className="bg-[#11131c] border border-[#434656]/20 rounded-xl p-4">
              <h5 className="text-xs font-mono font-bold text-[#8d90a2] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#8d90a2]" />
                Matching Resume Skills
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {reqSkills.map((sk, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#0052ff]/10 text-[#4cd7f6] border border-[#0052ff]/30">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="bg-[#11131c] border border-[#434656]/20 rounded-xl p-4">
              <h5 className="text-xs font-mono font-bold text-[#d0bcff] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#571bc1]" />
                Skill Gap Opportunities
              </h5>
              {missingSkills.length === 0 ? (
                <p className="text-xs font-mono text-[#a1a3b8]">No major skill gaps detected!</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.map((sk, idx) => (
                    <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#571bc1]/20 text-[#d0bcff] border border-[#571bc1]/40">
                      + {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Actionable Advice to Boost Score */}
          <div className="bg-[#11131c] border border-[#0052ff]/30 rounded-xl p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#0052ff] shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider">How To Increase Match Score</h5>
              <p className="text-xs text-[#c3c5d9] mt-1 leading-relaxed">
                Adding <span className="text-[#4cd7f6] font-bold font-mono">{missingSkills.slice(0, 2).join(', ') || 'Docker'}</span> to your resume or completing a quick project could raise your estimated interview callback probability by 12–18%.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#212433] p-4 border-t border-[#434656]/30 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
