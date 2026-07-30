import React from 'react';
import { X, Building2, MapPin, Users, Globe, ExternalLink, Award, DollarSign, CheckCircle2, Sparkles, Briefcase } from 'lucide-react';
import { CompanyInfo, JobRecommendation } from '../types';

interface CompanyModalProps {
  company: CompanyInfo;
  companyJobs: JobRecommendation[];
  onClose: () => void;
  onSelectJob: (job: JobRecommendation) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  company,
  companyJobs,
  onClose,
  onSelectJob
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#191b25] border border-[#434656]/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="relative bg-[#212433] p-6 border-b border-[#434656]/30 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.name} 
                className="w-16 h-16 rounded-xl object-cover bg-[#11131c] border border-[#434656]/40 p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#11131c] border border-[#434656]/40 p-1 flex items-center justify-center text-[#4cd7f6] font-bold text-xl">
                {company.name?.charAt(0) || 'C'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-geist text-white">{company.name}</h2>
                <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#0052ff]/10 text-[#4cd7f6] border border-[#0052ff]/30">
                  {company.industry}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#a1a3b8] mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#4cd7f6]" /> {company.headquarters}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#4cd7f6]" /> {company.employees}</span>
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 text-[#4cd7f6] hover:underline cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-[#11131c] hover:bg-[#2e3245] text-[#a1a3b8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* AI Recommendation Badge */}
          <div className="bg-[#241f3e] border border-[#571bc1]/40 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#571bc1]/20 text-[#d0bcff]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono uppercase text-[#d0bcff] font-bold tracking-wider">AI Candidate Compatibility</h4>
              <p className="text-xs text-[#e1e1ef] mt-1 leading-relaxed">{company.aiRecommendation}</p>
            </div>
          </div>

          {/* About Company */}
          <div>
            <h3 className="text-sm font-bold font-mono text-[#a1a3b8] uppercase tracking-wider mb-2">Company Overview</h3>
            <p className="text-sm text-[#c3c5d9] leading-relaxed bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
              {company.description}
            </p>
          </div>

          {/* Company Culture & Response Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
              <h4 className="text-xs font-mono uppercase text-[#4cd7f6] font-bold mb-2">Company Culture</h4>
              <p className="text-xs text-[#c3c5d9] leading-relaxed">
                {company.companyCulture || 'Fast-paced, engineering-driven environment focused on technical innovation, autonomy, and continuous learning.'}
              </p>
            </div>
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
              <h4 className="text-xs font-mono uppercase text-[#8d90a2] font-bold mb-2">Estimated Response Time</h4>
              <p className="text-sm font-bold font-mono text-white mb-1">
                {company.estimatedResponseTime || '3 - 5 Business Days'}
              </p>
              <p className="text-[11px] text-[#a1a3b8]">Average time to recruiter contact after application submission.</p>
            </div>
          </div>

          {/* Core Technologies Used */}
          <div>
            <h3 className="text-sm font-bold font-mono text-[#a1a3b8] uppercase tracking-wider mb-2">Tech Stack & Infrastructure</h3>
            <div className="flex flex-wrap gap-2">
              {(company.technologiesUsed || ['TypeScript', 'React', 'Node.js', 'Python', 'Kubernetes', 'AWS', 'PostgreSQL', 'Docker']).map((tech, i) => (
                <span key={i} className="text-xs font-mono px-3 py-1 rounded-lg bg-[#212433] text-[#e1e1ef] border border-[#434656]/40">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Hiring Process Steps */}
          <div>
            <h3 className="text-sm font-bold font-mono text-[#a1a3b8] uppercase tracking-wider mb-3">Hiring Process</h3>
            <div className="space-y-2">
              {(company.hiringProcessSteps || [
                '1. Initial Recruiter Screening (30 mins)',
                '2. Technical Screener / Coding Assessment (45 mins)',
                '3. Virtual Onsite Loop (3 Technical + 1 System Design + 1 Behavioral)',
                '4. Executive / Hiring Manager Alignment & Offer'
              ]).map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs text-[#e1e1ef] bg-[#11131c] p-3 rounded-lg border border-[#434656]/20">
                  <div className="w-6 h-6 rounded-full bg-[#0052ff]/20 text-[#4cd7f6] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <span>{step.replace(/^\d+\.\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
              <span className="text-xs font-mono text-[#a1a3b8] block mb-1">Open Roles</span>
              <span className="text-xl font-bold font-geist text-[#4cd7f6] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0052ff]" />
                {company.openPositionsCount} Jobs
              </span>
            </div>
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
              <span className="text-xs font-mono text-[#a1a3b8] block mb-1">Average Compensation</span>
              <span className="text-sm font-bold font-mono text-[#8d90a2] flex items-center gap-1 mt-1">
                <DollarSign className="w-4 h-4 text-[#8d90a2]" />
                {company.averageSalary}
              </span>
            </div>
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
              <span className="text-xs font-mono text-[#a1a3b8] block mb-1">Interview Difficulty</span>
              <span className="text-sm font-bold font-mono text-[#d0bcff] flex items-center gap-1 mt-1">
                <Award className="w-4 h-4 text-[#571bc1]" />
                {company.interviewDifficulty}
              </span>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-sm font-bold font-mono text-[#a1a3b8] uppercase tracking-wider mb-3">Key Benefits & Perks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {company.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#e1e1ef] bg-[#11131c] p-3 rounded-lg border border-[#434656]/20">
                  <CheckCircle2 className="w-4 h-4 text-[#4cd7f6] shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Similar Companies */}
          <div>
            <h3 className="text-sm font-bold font-mono text-[#a1a3b8] uppercase tracking-wider mb-2">Similar Companies in Industry</h3>
            <div className="flex flex-wrap gap-2">
              {(company.similarCompanies || ['Microsoft', 'Amazon', 'Meta', 'OpenAI', 'Stripe']).map((comp, idx) => (
                <span key={idx} className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#11131c] text-[#8d90a2] border border-[#434656]/30 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0052ff]" />
                  {comp}
                </span>
              ))}
            </div>
          </div>

          {/* Open Opportunities at Company */}
          <div>
            <h3 className="text-sm font-bold font-mono text-[#a1a3b8] uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Matching Roles at {company.name}</span>
              <span className="text-xs font-normal text-[#4cd7f6]">{companyJobs.length} Positions</span>
            </h3>

            {companyJobs.length === 0 ? (
              <div className="bg-[#11131c] p-6 text-center rounded-xl border border-[#434656]/20 text-xs font-mono text-[#a1a3b8]">
                No specific roles listed right now. Check back soon or visit {company.name}'s careers page!
              </div>
            ) : (
              <div className="space-y-3">
                {companyJobs.map(job => (
                  <div 
                    key={job.id} 
                    className="bg-[#11131c] hover:bg-[#212433] transition-all p-4 rounded-xl border border-[#434656]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    onClick={() => onSelectJob(job)}
                  >
                    <div>
                      <h4 className="text-sm font-bold font-geist text-white hover:text-[#4cd7f6] transition-colors">{job.title}</h4>
                      <p className="text-xs font-mono text-[#a1a3b8] mt-1">{job.location} • {job.salaryRange || job.salary}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono font-bold text-[#8d90a2] bg-[#0052ff]/10 border border-[#0052ff]/30 px-2.5 py-1 rounded-md">
                        {job.matchScore}% Match
                      </span>
                      <button className="text-xs font-mono bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                        View Role
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#212433] p-4 border-t border-[#434656]/30 flex justify-end">
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-mono font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            Visit Official Careers Page <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
