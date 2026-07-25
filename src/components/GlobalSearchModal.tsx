import React, { useState, useEffect } from 'react';
import { useEcosystem } from '../context/EcosystemContext';
import { Search, X, Briefcase, Building2, Code2, BookOpen, Video, Award, ArrowRight, Compass } from 'lucide-react';
import { GlobalSearchResult, NavigationTab } from '../types';

export const GlobalSearchModal: React.FC = () => {
  const { isGlobalSearchOpen, setIsGlobalSearchOpen, recommendations, profile, navigateWithEcosystem } = useEcosystem();
  const [query, setQuery] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsGlobalSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  // Aggregate search results from ecosystem
  const allResults: GlobalSearchResult[] = [];

  // 1. Jobs
  recommendations.forEach(j => {
    allResults.push({
      id: `job_${j.id}`,
      title: j.title,
      subtitle: `${j.company} • ${j.location || 'Remote'} • ${j.matchScore}% Match`,
      category: 'Job',
      badge: `${j.matchScore}% Match`,
      actionTab: 'job-suite'
    });
  });

  // 2. Companies
  const companies: string[] = Array.from(new Set(recommendations.map(j => j.company || '')));
  companies.forEach(c => {
    if (c) {
      allResults.push({
        id: `comp_${c}`,
        title: c,
        subtitle: 'Tech Company Profile & Interview Prep',
        category: 'Company',
        actionTab: 'interviews'
      });
    }
  });

  // 3. Skills & Technologies
  (profile.skills || []).forEach(s => {
    allResults.push({
      id: `skill_${s}`,
      title: s,
      subtitle: 'Verified Skill in Central Career Profile',
      category: 'Skill',
      actionTab: 'profile'
    });
  });

  // 4. Learning Roadmaps & Progress
  (profile.learningProgress || []).forEach(lp => {
    allResults.push({
      id: `lp_${lp.id}`,
      title: lp.title,
      subtitle: `${lp.category} • ${lp.progressPercent}% Completed`,
      category: 'Learning Resource',
      badge: `${lp.progressPercent}%`,
      actionTab: 'career-tools'
    });
  });

  // 5. Certifications
  (profile.certifications || []).forEach(cert => {
    allResults.push({
      id: `cert_${cert}`,
      title: cert,
      subtitle: 'Verified Certification',
      category: 'Certification',
      actionTab: 'profile'
    });
  });

  // Filtered results
  const filtered = query.trim() === ''
    ? allResults.slice(0, 8)
    : allResults.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        r.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelectResult = (result: GlobalSearchResult) => {
    setIsGlobalSearchOpen(false);
    navigateWithEcosystem(result.actionTab);
  };

  const getCategoryIcon = (category: GlobalSearchResult['category']) => {
    switch (category) {
      case 'Job': return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'Company': return <Building2 className="w-4 h-4 text-purple-400" />;
      case 'Skill': return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'Certification': return <Award className="w-4 h-4 text-amber-400" />;
      case 'Interview Question': return <Video className="w-4 h-4 text-pink-400" />;
      default: return <BookOpen className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#11131c] border border-blue-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col">
        {/* Input Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, companies, skills, roadmaps, certifications..."
            className="flex-1 bg-transparent text-sm md:text-base text-white focus:outline-none placeholder-white/30 font-sans"
            autoFocus
          />
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="p-2 max-h-[60vh] overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-xs font-mono">
              No matching records found in Central Ecosystem.
            </div>
          ) : (
            filtered.map((res) => (
              <div
                key={res.id}
                onClick={() => handleSelectResult(res)}
                className="p-3 rounded-xl hover:bg-white/10 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {getCategoryIcon(res.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white font-geist group-hover:text-blue-400 transition-colors">
                      {res.title}
                    </h4>
                    <p className="text-xs text-white/50">{res.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                    {res.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="bg-white/5 border-t border-white/10 p-2.5 px-4 flex justify-between items-center text-[11px] font-mono text-white/40">
          <span>Press ESC to close search</span>
          <span>Global Ecosystem Index: {allResults.length} records</span>
        </div>
      </div>
    </div>
  );
};
