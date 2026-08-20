import React from 'react';
import { X, Sparkles, CheckCircle, AlertTriangle, Target, Lightbulb, Star, BarChart3, Layers } from 'lucide-react';
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
  const matchedSkills: string[] = job.matchedSkills || job.matched_skills || [];
  const missingSkills: string[] = job.missingSkills || job.missing_skills || [];
  const preferredSkills: string[] = job.preferredSkills || job.preferred_skills || [];
  const matchScore = Number(job.matchScore ?? job.match_score ?? 0);
  const similarityScore = Number(job.similarityScore ?? job.similarity_score ?? 0);
  
  const totalRequired = matchedSkills.length + missingSkills.length;
  const requiredSkillCoverage = totalRequired > 0 
    ? Math.round((matchedSkills.length / totalRequired) * 100) 
    : (job.skillMatchScore ?? 100);

  const confidence: 'Very High' | 'High' | 'Moderate' | 'Low' = job.matchConfidence || (
    matchScore >= 88 ? 'Very High' : matchScore >= 75 ? 'High' : matchScore >= 50 ? 'Moderate' : 'Low'
  );

  const whyMatch = job.recommendationReason || job.whyMatch || job.why_match || `Match computed based on your technical skills and profile alignment for ${job.company}.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#191b25] border border-[#434656]/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#212433] p-5 border-b border-[#434656]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#571bc1]/20 border border-[#571bc1]/40 text-[#d0bcff]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-geist text-white">Why Am I Seeing This Job?</h3>
              <p className="text-xs font-mono text-[#a1a3b8]">Authoritative AI Match Diagnostics & Explainability</p>
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
              <span className="text-2xl font-bold font-mono text-[#8d90a2] block">{matchScore}%</span>
              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                confidence === 'Very High' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : confidence === 'High'
                  ? 'bg-[#0052ff]/15 text-[#4cd7f6] border border-[#0052ff]/30'
                  : confidence === 'Moderate'
                  ? 'bg-[#571bc1]/20 text-[#d0bcff] border border-[#571bc1]/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {confidence} Match
              </span>
            </div>
          </div>

          {/* Component Score Transparency Breakdown */}
          <div className="bg-[#11131c] border border-[#434656]/30 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#a1a3b8] tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#4cd7f6]" /> Score Composition Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-[#212433] p-3 rounded-lg border border-[#434656]/30">
                <span className="text-[10px] font-mono text-[#a1a3b8] block uppercase">Required Skills</span>
                <span className="text-base font-bold font-mono text-white">{requiredSkillCoverage}%</span>
                <span className="text-[10px] font-mono text-[#a1a3b8] block mt-0.5">
                  {matchedSkills.length}/{totalRequired || matchedSkills.length} core skills
                </span>
              </div>
              <div className="bg-[#212433] p-3 rounded-lg border border-[#434656]/30">
                <span className="text-[10px] font-mono text-[#a1a3b8] block uppercase">Text Similarity</span>
                <span className="text-base font-bold font-mono text-white">{similarityScore}%</span>
                <span className="text-[10px] font-mono text-[#a1a3b8] block mt-0.5">
                  TF-IDF resume overlap
                </span>
              </div>
              <div className="bg-[#212433] p-3 rounded-lg border border-[#434656]/30">
                <span className="text-[10px] font-mono text-[#a1a3b8] block uppercase">Overall Match</span>
                <span className="text-base font-bold font-mono text-[#8d90a2]">{matchScore}%</span>
                <span className="text-[10px] font-mono text-[#a1a3b8] block mt-0.5">
                  Weighted deterministic score
                </span>
              </div>
            </div>
          </div>

          {/* Core Reasoning */}
          <div>
            <h4 className="text-xs font-mono uppercase text-[#a1a3b8] tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#0052ff]" /> Recommendation Rationale
            </h4>
            <div className="bg-[#241f3e]/40 border border-[#571bc1]/30 rounded-xl p-4 text-xs text-[#e1e1ef] leading-relaxed">
              {whyMatch}
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Matching Skills */}
            <div className="bg-[#11131c] border border-[#434656]/20 rounded-xl p-4">
              <h5 className="text-xs font-mono font-bold text-[#4cd7f6] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#4cd7f6]" />
                Matched Skills ({matchedSkills.length})
              </h5>
              {matchedSkills.length === 0 ? (
                <p className="text-xs font-mono text-[#a1a3b8]">No direct keyword overlap identified.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map((sk, idx) => (
                    <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#0052ff]/15 text-[#4cd7f6] border border-[#0052ff]/30">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Skill Gaps */}
            <div className="bg-[#11131c] border border-[#434656]/20 rounded-xl p-4">
              <h5 className="text-xs font-mono font-bold text-[#d0bcff] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#571bc1]" />
                Missing Required Skills ({missingSkills.length})
              </h5>
              {missingSkills.length === 0 ? (
                <p className="text-xs font-mono text-[#4cd7f6]">✓ No required skill gaps detected for this role.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.map((sk, idx) => (
                    <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#571bc1]/20 text-[#d0bcff] border border-[#571bc1]/40">
                      ○ {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Preferred / Bonus Skills (if present) */}
          {preferredSkills.length > 0 && (
            <div className="bg-[#11131c] border border-[#434656]/20 rounded-xl p-4">
              <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400" />
                Preferred & Bonus Skills Matched ({preferredSkills.length})
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {preferredSkills.map((sk, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/30">
                    ★ {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Candidate Profile Skills */}
          <div className="bg-[#11131c] border border-[#434656]/20 rounded-xl p-4 space-y-3">
            <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0052ff]" />
              Candidate Profile Skills
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {(user.skills && user.skills.length > 0 ? user.skills : ['General Software Engineering']).map((s, idx) => (
                <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#212433] text-[#c3c5d9] border border-[#434656]/30">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Actionable Advice to Boost Score */}
          <div className="bg-[#11131c] border border-[#0052ff]/30 rounded-xl p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#0052ff] shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider">How To Increase Match Score</h5>
              <p className="text-xs text-[#c3c5d9] mt-1 leading-relaxed">
                {missingSkills.length > 0 ? (
                  <>
                    Adding <span className="text-[#4cd7f6] font-bold font-mono">{missingSkills.slice(0, 3).join(', ')}</span> to your resume and projects will directly maximize your interview callback match score.
                  </>
                ) : similarityScore < 40 ? (
                  <>
                    You have <span className="text-[#4cd7f6] font-bold">100% required skill coverage</span>! Tailoring your project summaries to reflect specific domain keywords used by <span className="text-white font-bold">{job.company}</span> will increase your overall text similarity score.
                  </>
                ) : (
                  <>
                    Your profile strongly matches all technical and domain requirements for this position.
                  </>
                )}
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
