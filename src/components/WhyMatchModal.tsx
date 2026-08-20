import React from 'react';
import { X, Sparkles, CheckCircle, AlertTriangle, Target, Lightbulb, Star, BarChart3, Layers, Briefcase, FileText, Award } from 'lucide-react';
import { JobRecommendation, UserProfile, MatchLabel } from '../types';

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
  const missingSkillsRaw = job.missingSkills !== undefined ? job.missingSkills : (job.missing_skills !== undefined ? job.missing_skills : null);
  const preferredSkills: string[] = job.preferredSkills || job.preferred_skills || [];
  const matchScore = Number(job.matchScore ?? job.match_score ?? 0);
  const similarityScore = Number(job.similarityScore ?? job.similarity_score ?? 0);
  
  const scoreBreakdown = job.scoreBreakdown || job.score_breakdown;
  const requiredSkillsAvailable = job.requiredSkillsAvailable ?? job.required_skills_available ?? (
    scoreBreakdown ? scoreBreakdown.requiredSkillsAvailable : (missingSkillsRaw !== null)
  );

  const missingSkills = Array.isArray(missingSkillsRaw) ? missingSkillsRaw : [];
  const totalRequired = matchedSkills.length + missingSkills.length;
  const requiredSkillScore = scoreBreakdown?.requiredSkills !== undefined 
    ? scoreBreakdown.requiredSkills 
    : (job.requiredSkillScore ?? job.required_skill_score ?? (
        requiredSkillsAvailable && totalRequired > 0 
          ? Math.round((matchedSkills.length / totalRequired) * 100) 
          : null
      ));

  const roleAlignmentScore = scoreBreakdown?.roleAlignment ?? job.roleAlignmentScore ?? job.role_alignment_score ?? 75;
  const additionalScore = scoreBreakdown?.additionalSignals ?? job.additionalScore ?? job.additional_score ?? 80;

  // Authoritative Match Label
  const matchLabel: MatchLabel = (job.matchLabel || job.match_label || (
    matchScore >= 85 ? 'Exceptional Match' :
    matchScore >= 70 ? 'Strong Match' :
    matchScore >= 55 ? 'Moderate Match' :
    matchScore >= 40 ? 'Low Match' : 'Weak Match'
  )) as MatchLabel;

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
              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded inline-block mt-0.5 ${
                matchLabel === 'Exceptional Match'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : matchLabel === 'Strong Match'
                  ? 'bg-[#0052ff]/15 text-[#4cd7f6] border border-[#0052ff]/30'
                  : matchLabel === 'Moderate Match'
                  ? 'bg-[#571bc1]/20 text-[#d0bcff] border border-[#571bc1]/40'
                  : matchLabel === 'Low Match'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {matchLabel}
              </span>
            </div>
          </div>

          {/* Component Score Transparency Breakdown */}
          <div className="bg-[#11131c] border border-[#434656]/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase text-[#a1a3b8] tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#4cd7f6]" /> Score Composition Breakdown
              </h4>
              <span className="text-[10px] font-mono text-[#a1a3b8]">Authoritative Formula</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-[#212433] p-3 rounded-lg border border-[#434656]/30">
                <span className="text-[10px] font-mono text-[#a1a3b8] block uppercase">Required Skills</span>
                <span className="text-base font-bold font-mono text-white">
                  {requiredSkillsAvailable && requiredSkillScore !== null ? `${requiredSkillScore}%` : 'N/A'}
                </span>
                <span className="text-[10px] font-mono text-[#4cd7f6] block mt-0.5">
                  70% Weight
                </span>
              </div>
              <div className="bg-[#212433] p-3 rounded-lg border border-[#434656]/30">
                <span className="text-[10px] font-mono text-[#a1a3b8] block uppercase">Role Alignment</span>
                <span className="text-base font-bold font-mono text-white">{roleAlignmentScore}%</span>
                <span className="text-[10px] font-mono text-[#4cd7f6] block mt-0.5">
                  15% Weight
                </span>
              </div>
              <div className="bg-[#212433] p-3 rounded-lg border border-[#434656]/30">
                <span className="text-[10px] font-mono text-[#a1a3b8] block uppercase">Text Similarity</span>
                <span className="text-base font-bold font-mono text-white">{similarityScore}%</span>
                <span className="text-[10px] font-mono text-[#4cd7f6] block mt-0.5">
                  10% Weight
                </span>
              </div>
              <div className="bg-[#212433] p-3 rounded-lg border border-[#434656]/30">
                <span className="text-[10px] font-mono text-[#a1a3b8] block uppercase">Additional</span>
                <span className="text-base font-bold font-mono text-white">{additionalScore}%</span>
                <span className="text-[10px] font-mono text-[#4cd7f6] block mt-0.5">
                  5% Weight
                </span>
              </div>
            </div>
            <div className="bg-[#212433]/60 p-2.5 rounded-lg border border-[#434656]/20 flex items-center justify-between text-xs font-mono">
              <span className="text-[#a1a3b8]">Overall Weighted Score:</span>
              <span className="text-[#8d90a2] font-bold text-sm">{matchScore}% ({matchLabel})</span>
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
                <p className="text-xs font-mono text-[#a1a3b8]">No direct skill requirements matched.</p>
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
                Missing Required Skills ({missingSkillsRaw !== null ? missingSkills.length : 'N/A'})
              </h5>
              {missingSkillsRaw === null ? (
                <p className="text-xs font-mono text-[#a1a3b8]">Required skill information unavailable for this role.</p>
              ) : missingSkills.length === 0 ? (
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
                {!requiredSkillsAvailable ? (
                  <>
                    Detailed skill requirements were not provided by the employer. Emphasizing full-lifecycle experience and related tech in your resume will strengthen overall alignment.
                  </>
                ) : missingSkills.length > 0 ? (
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
