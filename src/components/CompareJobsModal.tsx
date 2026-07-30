import React from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, DollarSign, MapPin, Building2, Briefcase, ExternalLink, Trash2, ArrowRight } from 'lucide-react';
import { JobRecommendation } from '../types';

interface CompareJobsModalProps {
  jobs: JobRecommendation[];
  onClose: () => void;
  onRemoveJob: (jobId: string) => void;
  onApply: (job: JobRecommendation) => void;
  onSaveJob: (jobId: string) => void;
  savedJobIds: string[];
}

export const CompareJobsModal: React.FC<CompareJobsModalProps> = ({
  jobs,
  onClose,
  onRemoveJob,
  onApply,
  onSaveJob,
  savedJobIds
}) => {
  if (jobs.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-[#191b25] border border-[#434656]/40 rounded-2xl p-6 text-center max-w-md w-full">
          <h3 className="text-lg font-bold text-white mb-2 font-geist">No Jobs Selected</h3>
          <p className="text-xs text-[#a1a3b8] mb-4">Select at least 2 jobs from the job list to compare them side-by-side.</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[#0052ff] text-white text-xs font-mono font-bold rounded-lg hover:bg-[#0052ff]/90 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Generate AI Verdict per job based on its characteristics
  const getAiVerdict = (job: JobRecommendation, index: number) => {
    if (job.matchScore >= 95) return '🏆 Best Overall Skill Match';
    if (job.location.toLowerCase().includes('remote')) return '🌐 Top Remote Work Option';
    if (job.salary && (job.salary.includes('3') || job.salary.includes('4'))) return '💰 Highest Compensation Package';
    if (index === 0) return '⭐ AI Recommended Choice';
    return '⚡ High Growth Potential';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#191b25] border border-[#434656]/40 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl my-6 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#212433] p-5 border-b border-[#434656]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0052ff]/10 text-[#4cd7f6] border border-[#0052ff]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-geist text-white flex items-center gap-2">
                Side-by-Side Opportunity Comparison
              </h2>
              <p className="text-xs font-mono text-[#a1a3b8] mt-0.5">
                Comparing {jobs.length} selected position{jobs.length > 1 ? 's' : ''} with AI Match Analysis
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-[#11131c] hover:bg-[#2e3245] text-[#a1a3b8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Comparison Table / Columns */}
        <div className="p-6 overflow-x-auto max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[700px]">
            {jobs.map((job, idx) => {
              const isSaved = savedJobIds.includes(job.id);
              const verdict = getAiVerdict(job, idx);

              return (
                <div 
                  key={job.id} 
                  className="bg-[#11131c] border border-[#434656]/30 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-[#0052ff]/50 transition-all"
                >
                  {/* Remove Button */}
                  <button 
                    onClick={() => onRemoveJob(job.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#212433] text-[#a1a3b8] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Remove from comparison"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-5">
                    {/* Role & Company Header */}
                    <div className="pr-8">
                      <div className="flex items-center gap-3 mb-3">
                        {job.companyLogo && job.companyLogo.trim().length > 0 ? (
                          <img 
                            src={job.companyLogo} 
                            alt={job.company} 
                            className="w-10 h-10 rounded-lg object-cover bg-[#212433] p-1 border border-[#434656]/30"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#0052ff]/10 text-[#4cd7f6] flex items-center justify-center font-bold">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-mono text-[#a1a3b8] block">{job.company}</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#212433] text-[#8d90a2]">
                            {job.jobType || 'Full-Time'}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold font-geist text-white line-clamp-2">{job.title}</h3>
                    </div>

                    {/* AI Verdict Badge */}
                    <div className="bg-[#241f3e] border border-[#571bc1]/40 rounded-xl p-3">
                      <span className="text-[11px] font-mono font-bold text-[#d0bcff] flex items-center gap-1.5">
                        {verdict}
                      </span>
                    </div>

                    {/* Match Score */}
                    <div className="bg-[#212433] p-3 rounded-xl border border-[#434656]/30 flex items-center justify-between">
                      <span className="text-xs font-mono text-[#a1a3b8]">AI Match Score</span>
                      <div className="text-right">
                        <span className="text-lg font-bold font-mono text-[#8d90a2] block">
                          {job.matchScore}%
                        </span>
                        <span className="text-[10px] font-mono text-[#8d90a2]">
                          {job.matchConfidence || 'High'} Confidence
                        </span>
                      </div>
                    </div>

                    {/* Key Attributes */}
                    <div className="space-y-3 text-xs font-mono">
                      
                      {/* Compensation */}
                      <div className="bg-[#191b25] p-3 rounded-lg border border-[#434656]/20">
                        <span className="text-[#a1a3b8] block text-[10px] uppercase mb-1">Salary & Compensation</span>
                        <span className="text-white font-bold flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-[#8d90a2]" />
                          {job.salary || job.salaryRange || 'Competitive'}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="bg-[#191b25] p-3 rounded-lg border border-[#434656]/20">
                        <span className="text-[#a1a3b8] block text-[10px] uppercase mb-1">Location & Work Style</span>
                        <span className="text-white font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#4cd7f6]" />
                          {job.location}
                        </span>
                      </div>

                      {/* Required Skills */}
                      <div className="bg-[#191b25] p-3 rounded-lg border border-[#434656]/20">
                        <span className="text-[#a1a3b8] block text-[10px] uppercase mb-1.5">Matching Core Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {(job.requiredSkills || job.tags.slice(0, 4)).map((skill, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#212433] text-[#8d90a2] border border-[#434656]/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#8d90a2]" /> {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      {job.missingSkills && job.missingSkills.length > 0 && (
                        <div className="bg-[#191b25] p-3 rounded-lg border border-[#434656]/20">
                          <span className="text-[#a1a3b8] block text-[10px] uppercase mb-1.5">Missing / Gap Skills</span>
                          <div className="flex flex-wrap gap-1">
                            {job.missingSkills.map((skill, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-400" /> {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hiring Process */}
                      {job.hiringProcess && job.hiringProcess.length > 0 && (
                        <div className="bg-[#191b25] p-3 rounded-lg border border-[#434656]/20">
                          <span className="text-[#a1a3b8] block text-[10px] uppercase mb-1.5">Hiring Stages</span>
                          <ol className="space-y-1 text-[11px] text-[#c3c5d9]">
                            {job.hiringProcess.map((step, i) => (
                              <li key={i} className="line-clamp-1">• {step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-[#434656]/30 space-y-2">
                    <button 
                      onClick={() => onApply(job)}
                      className="w-full py-2.5 px-4 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Apply For This Position</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => onSaveJob(job.id)}
                      className={`w-full py-2 px-4 text-xs font-mono font-bold rounded-xl border transition-colors cursor-pointer ${
                        isSaved 
                          ? 'bg-[#571bc1]/20 border-[#571bc1]/50 text-[#d0bcff]' 
                          : 'bg-[#212433] hover:bg-[#2e3245] border-[#434656]/30 text-[#a1a3b8] hover:text-white'
                      }`}
                    >
                      {isSaved ? 'Saved in Profile' : 'Save Job'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#212433] p-4 border-t border-[#434656]/30 flex items-center justify-between text-xs font-mono text-[#a1a3b8]">
          <span>Tip: You can compare up to 3 jobs concurrently to evaluate role alignment.</span>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[#11131c] hover:bg-[#2e3245] text-white rounded-lg transition-colors cursor-pointer"
          >
            Done Comparing
          </button>
        </div>

      </div>
    </div>
  );
};
