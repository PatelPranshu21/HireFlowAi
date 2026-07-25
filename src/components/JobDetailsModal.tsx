import React, { useState } from 'react';
import { X, Building2, MapPin, DollarSign, Calendar, Briefcase, ExternalLink, Bookmark, CheckCircle2, AlertCircle, Sparkles, BookOpen, Layers, Send, Globe, ChevronLeft } from 'lucide-react';
import { JobRecommendation, CompanyInfo } from '../types';

interface JobDetailsModalProps {
  job: JobRecommendation;
  companyInfo?: CompanyInfo;
  isSaved: boolean;
  onClose: () => void;
  onSaveToggle: (job: JobRecommendation) => void;
  onApply: (job: JobRecommendation) => void;
  onOpenCompany: (companyName: string) => void;
  onOpenWhyMatch: (job: JobRecommendation) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  companyInfo,
  isSaved,
  onClose,
  onSaveToggle,
  onApply,
  onOpenCompany,
  onOpenWhyMatch
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'process' | 'prep'>('overview');

  const reqSkills = job.requiredSkills || [];
  const missingSkills = job.missingSkills || [];
  const responsibilities = job.responsibilities || [
    'Collaborate with product and design teams to deliver exceptional digital experiences.',
    'Write clean, testable, and well-documented TypeScript and React code.',
    'Optimize web performance and ensure application security and accessibility.'
  ];
  const requirements = job.requirements || [
    '5+ years of software engineering experience in modern frontend/fullstack frameworks.',
    'Strong knowledge of TypeScript, React, state management, and CSS architectures.',
    'Demonstrated experience building scalable REST APIs and microservices.'
  ];
  const benefits = job.benefits || [
    'Competitive Base Salary + Performance Bonus + Equity Grants',
    'Comprehensive Healthcare, Dental & Vision (100% covered for employee)',
    '401(k) / Retirement Pension with company match',
    'Flexible Work Options (Hybrid/Remote) & Home Office Stipend'
  ];
  const hiringProcess = job.hiringProcess || [
    'Recruiter Screen (30 mins)',
    'Technical Live Coding / System Design (60 mins)',
    'Virtual Onsite Loop (3-4 rounds covering technical skills, architecture & leadership)'
  ];
  const prepTips = job.preparationTips || [
    'Review key algorithms, data structures, and state management patterns.',
    'Prepare STAR method stories highlighting past technical ownership.',
    'Familiarize yourself with the company’s product suite and architectural priorities.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#191b25] border border-[#434656]/40 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#212433] p-6 border-b border-[#434656]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div className="flex items-start gap-4">
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl bg-[#11131c] hover:bg-[#2e3245] text-[#a1a3b8] hover:text-white transition-colors cursor-pointer shrink-0"
              title="Go Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <img 
              src={job.companyLogo} 
              alt={job.company} 
              className="w-14 h-14 rounded-xl object-cover bg-[#11131c] border border-[#434656]/40 p-1 cursor-pointer"
              onClick={() => onOpenCompany(job.company)}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-geist text-white">{job.title}</h2>
                <span className="text-xs font-mono font-bold text-[#8d90a2] bg-[#0052ff]/10 border border-[#0052ff]/30 px-2.5 py-0.5 rounded-full">
                  {job.matchScore}% AI Match
                </span>
              </div>
              <p className="text-xs font-mono text-[#a1a3b8] mt-1 flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => onOpenCompany(job.company)} 
                  className="font-bold text-white hover:text-[#4cd7f6] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#0052ff]" /> {job.company}
                </button>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#4cd7f6]" /> {job.location}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-[#8d90a2]" /> {job.salaryRange || job.salary}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => onSaveToggle(job)}
              className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isSaved 
                  ? 'bg-[#571bc1]/20 border-[#571bc1] text-[#d0bcff]' 
                  : 'bg-[#11131c] border-[#434656]/40 text-[#a1a3b8] hover:text-white hover:bg-[#212433]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#d0bcff]' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => onApply(job)}
              className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              Apply Now <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Insight Bar */}
        <div className="bg-[#241f3e] border-b border-[#571bc1]/30 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#d0bcff] font-mono">
            <Sparkles className="w-4 h-4 shrink-0 text-[#d0bcff]" />
            <span>AI Recommendation: {job.recommendationReason || 'High candidate match for target role.'}</span>
          </div>
          <button 
            onClick={() => onOpenWhyMatch(job)}
            className="text-[11px] font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer font-bold"
          >
            Why Am I Seeing This?
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex border-b border-[#434656]/30 bg-[#11131c] px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'border-[#0052ff] text-[#4cd7f6]' : 'border-transparent text-[#a1a3b8] hover:text-white'
            }`}
          >
            Job Overview
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'requirements' ? 'border-[#0052ff] text-[#4cd7f6]' : 'border-transparent text-[#a1a3b8] hover:text-white'
            }`}
          >
            Requirements & Skills
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'process' ? 'border-[#0052ff] text-[#4cd7f6]' : 'border-transparent text-[#a1a3b8] hover:text-white'
            }`}
          >
            Hiring Process & Benefits
          </button>
          <button
            onClick={() => setActiveTab('prep')}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'prep' ? 'border-[#0052ff] text-[#4cd7f6]' : 'border-transparent text-[#a1a3b8] hover:text-white'
            }`}
          >
            AI Preparation Tips
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">

          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Job Description */}
              <div>
                <h3 className="text-xs font-mono uppercase text-[#a1a3b8] font-bold tracking-wider mb-2">Role Summary</h3>
                <p className="text-sm text-[#e1e1ef] leading-relaxed bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
                  {job.description}
                </p>
              </div>

              {/* Responsibilities */}
              <div>
                <h3 className="text-xs font-mono uppercase text-[#a1a3b8] font-bold tracking-wider mb-3">Key Responsibilities</h3>
                <div className="space-y-2">
                  {responsibilities.map((resp, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#11131c] p-3 rounded-xl border border-[#434656]/20 text-xs text-[#c3c5d9]">
                      <CheckCircle2 className="w-4 h-4 text-[#4cd7f6] shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Info Box */}
              <div className="bg-[#11131c] border border-[#434656]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold font-geist text-white">About {job.company}</h4>
                  <p className="text-xs text-[#a1a3b8] mt-1 leading-relaxed">
                    {job.companyDescription || `${job.company} is a leading organization hiring software engineers to innovate and scale.`}
                  </p>
                </div>
                <button
                  onClick={() => onOpenCompany(job.company)}
                  className="bg-[#212433] hover:bg-[#2e3245] text-[#4cd7f6] border border-[#0052ff]/30 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  View Company Profile
                </button>
              </div>

            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-6">
              
              {/* Skills Analysis Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/30">
                  <h4 className="text-xs font-mono font-bold text-[#8d90a2] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#8d90a2]" /> Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {reqSkills.map((sk, idx) => (
                      <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#0052ff]/10 text-[#4cd7f6] border border-[#0052ff]/30">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/30">
                  <h4 className="text-xs font-mono font-bold text-[#d0bcff] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#571bc1]" /> Recommended Skill Improvements
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((sk, idx) => (
                      <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#571bc1]/20 text-[#d0bcff] border border-[#571bc1]/40">
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requirements List */}
              <div>
                <h3 className="text-xs font-mono uppercase text-[#a1a3b8] font-bold tracking-wider mb-3">Qualifications & Experience</h3>
                <div className="space-y-2">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#11131c] p-3.5 rounded-xl border border-[#434656]/20 text-xs text-[#e1e1ef]">
                      <Briefcase className="w-4 h-4 text-[#0052ff] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'process' && (
            <div className="space-y-6">
              
              {/* Hiring Process */}
              <div>
                <h3 className="text-xs font-mono uppercase text-[#a1a3b8] font-bold tracking-wider mb-3">Interview Pipeline</h3>
                <div className="space-y-3">
                  {hiringProcess.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
                      <span className="w-8 h-8 rounded-full bg-[#0052ff]/20 text-[#4cd7f6] border border-[#0052ff]/40 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        0{idx + 1}
                      </span>
                      <span className="text-xs font-mono text-[#e1e1ef]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-xs font-mono uppercase text-[#a1a3b8] font-bold tracking-wider mb-3">Benefits & Perks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-[#c3c5d9] bg-[#11131c] p-3 rounded-lg border border-[#434656]/20">
                      <CheckCircle2 className="w-4 h-4 text-[#4cd7f6] shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'prep' && (
            <div className="space-y-6">
              <div className="bg-[#241f3e] border border-[#571bc1]/40 rounded-xl p-5">
                <div className="flex items-center gap-2 text-[#d0bcff] font-bold font-mono text-sm mb-2">
                  <Sparkles className="w-5 h-5 text-[#d0bcff]" />
                  HireFlow AI Interview Strategy
                </div>
                <p className="text-xs text-[#e1e1ef] leading-relaxed">
                  Our AI analyzed recent candidate feedback for <span className="text-[#4cd7f6] font-bold">{job.company}</span>. Here are key preparation steps to maximize your offer likelihood.
                </p>
              </div>

              <div className="space-y-3">
                {prepTips.map((tip, idx) => (
                  <div key={idx} className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/30 flex items-start gap-3 text-xs text-[#e1e1ef]">
                    <BookOpen className="w-4 h-4 text-[#0052ff] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#212433] p-4 border-t border-[#434656]/30 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-mono text-[#a1a3b8] hover:text-white cursor-pointer px-4 py-2"
          >
            Close
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSaveToggle(job)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer ${
                isSaved 
                  ? 'bg-[#571bc1]/20 border-[#571bc1] text-[#d0bcff]' 
                  : 'bg-[#11131c] border-[#434656]/40 text-white hover:bg-[#2e3245]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#d0bcff]' : ''}`} />
              {isSaved ? 'Saved' : 'Save Job'}
            </button>
            <button
              onClick={() => onApply(job)}
              className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg"
            >
              Apply on Official Careers Site <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
