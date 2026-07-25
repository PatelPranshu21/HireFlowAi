import React, { useState } from 'react';
import { ResumeAnalysisResult, KeywordItem } from '../../types';
import { 
  Key, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Code, 
  Briefcase, 
  Layers 
} from 'lucide-react';

interface AtsKeywordAnalysisTabProps {
  analysis: ResumeAnalysisResult;
  onAddKeywordToResume: (keyword: string) => void;
}

export const AtsKeywordAnalysisTab: React.FC<AtsKeywordAnalysisTabProps> = ({
  analysis,
  onAddKeywordToResume
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'detected' | 'missing'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const keywordsList: KeywordItem[] = analysis.keywordList || [
    { keyword: 'React.js', detected: true, importance: 'High', category: 'Frameworks', frequency: 6 },
    { keyword: 'TypeScript', detected: true, importance: 'High', category: 'Languages', frequency: 5 },
    { keyword: 'Node.js', detected: true, importance: 'High', category: 'Frameworks', frequency: 4 },
    { keyword: 'AWS (EC2, S3)', detected: true, importance: 'High', category: 'Cloud & Infrastructure', frequency: 3 },
    { keyword: 'Distributed Systems', detected: false, importance: 'High', category: 'Architecture' },
    { keyword: 'Kubernetes', detected: false, importance: 'High', category: 'Cloud & Infrastructure' },
    { keyword: 'GraphQL', detected: false, importance: 'Medium', category: 'API Design' },
    { keyword: 'Terraform', detected: true, importance: 'Medium', category: 'DevOps', frequency: 2 },
    { keyword: 'Kafka', detected: true, importance: 'High', category: 'Architecture', frequency: 2 },
    { keyword: 'Redis', detected: true, importance: 'Medium', category: 'Databases', frequency: 3 },
    { keyword: 'gRPC', detected: false, importance: 'Medium', category: 'API Design' },
    { keyword: 'CI/CD Pipelines', detected: false, importance: 'High', category: 'DevOps' },
    { keyword: 'PostgreSQL', detected: true, importance: 'High', category: 'Databases', frequency: 2 },
    { keyword: 'Team Leadership', detected: true, importance: 'Medium', category: 'Soft Skills', frequency: 2 },
    { keyword: 'Agile/Scrum', detected: true, importance: 'Low', category: 'Methodology', frequency: 1 },
    { keyword: 'Microservices Architecture', detected: true, importance: 'High', category: 'Architecture', frequency: 4 }
  ];

  const detectedCount = keywordsList.filter(k => k.detected).length;
  const missingCount = keywordsList.filter(k => !k.detected).length;
  const keywordDensityScore = Math.round((detectedCount / keywordsList.length) * 100);

  const filtered = keywordsList.filter(k => {
    const matchesSearch = k.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' ? true : filterType === 'detected' ? k.detected : !k.detected;
    const matchesCat = filterCategory === 'all' ? true : k.category === filterCategory;
    return matchesSearch && matchesType && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Density & Overview Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052ff]/15 text-[#b7c4ff] text-xs font-mono mb-2">
              <Key className="w-3.5 h-3.5 text-[#4cd7f6]" /> Keyword Intelligence Engine
            </div>
            <h2 className="text-2xl font-bold font-geist text-white">
              ATS Keyword Coverage &amp; Density
            </h2>
            <p className="text-xs text-[#c3c5d9] mt-0.5">
              Comparison against required keywords for Senior Software Engineer roles.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center bg-[#11131c] px-4 py-3 rounded-xl border border-[#434656]/30">
              <span className="text-[10px] font-mono text-[#8d90a2] uppercase block">Coverage Score</span>
              <span className="text-2xl font-bold font-mono text-[#4cd7f6]">{keywordDensityScore}%</span>
            </div>
            <div className="text-center bg-[#11131c] px-4 py-3 rounded-xl border border-[#434656]/30">
              <span className="text-[10px] font-mono text-[#8d90a2] uppercase block">Detected</span>
              <span className="text-2xl font-bold font-mono text-green-400">{detectedCount}</span>
            </div>
            <div className="text-center bg-[#11131c] px-4 py-3 rounded-xl border border-[#434656]/30">
              <span className="text-[10px] font-mono text-[#8d90a2] uppercase block">Missing</span>
              <span className="text-2xl font-bold font-mono text-amber-400">{missingCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#191b25] p-4 rounded-xl border border-[#434656]/30">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#8d90a2]" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#11131c] border border-[#434656]/40 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex rounded-lg bg-[#11131c] p-1 border border-[#434656]/30">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-[#0052ff] text-white font-bold' : 'text-[#8d90a2] hover:text-white'
              }`}
            >
              All ({keywordsList.length})
            </button>
            <button
              onClick={() => setFilterType('detected')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                filterType === 'detected' ? 'bg-green-500/20 text-green-400 font-bold' : 'text-[#8d90a2] hover:text-white'
              }`}
            >
              Detected ({detectedCount})
            </button>
            <button
              onClick={() => setFilterType('missing')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                filterType === 'missing' ? 'bg-amber-400/20 text-amber-300 font-bold' : 'text-[#8d90a2] hover:text-white'
              }`}
            >
              Missing ({missingCount})
            </button>
          </div>
        </div>
      </div>

      {/* Keywords Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div 
            key={item.keyword}
            className={`bg-[#191b25] border rounded-xl p-4 transition-all flex flex-col justify-between shadow-lg ${
              item.detected 
                ? 'border-green-500/30 hover:border-green-500/50' 
                : 'border-amber-400/30 hover:border-amber-400/50 bg-amber-950/5'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold font-geist text-white flex items-center gap-2">
                  {item.detected ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  {item.keyword}
                </span>

                <span className={`px-2 py-0.5 text-[10px] font-mono rounded uppercase font-bold ${
                  item.importance === 'High' 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                    : item.importance === 'Medium' 
                    ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' 
                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
                }`}>
                  {item.importance}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-[#8d90a2] mb-3">
                <span className="bg-[#11131c] px-2 py-0.5 rounded border border-[#434656]/20">
                  {item.category}
                </span>
                {item.detected && (
                  <span>Found {item.frequency || 1}x in resume</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#434656]/20 flex justify-end">
              {!item.detected ? (
                <button
                  onClick={() => onAddKeywordToResume(item.keyword)}
                  className="w-full py-1.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-lg text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Insert Keyword into Draft
                </button>
              ) : (
                <span className="text-[10px] font-mono text-green-400 font-semibold flex items-center gap-1">
                  ✓ Verified by ATS Scanner
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
