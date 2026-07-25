import React, { useState } from 'react';
import { sampleCodingProblems } from '../../data/interviewData';
import { CodingProblemItem } from '../../types';
import { aiInterviewService } from '../../services/aiInterviewService';
import { 
  Code, 
  Play, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  Layers, 
  Search, 
  Eye, 
  RefreshCw,
  Award,
  Terminal
} from 'lucide-react';

export const CodingPracticeTab: React.FC = () => {
  const [problems, setProblems] = useState<CodingProblemItem[]>(sampleCodingProblems);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProblemId, setSelectedProblemId] = useState<string>('p1');

  // Code runner state
  const [userCode, setUserCode] = useState<string>(sampleCodingProblems[0].initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testOutput, setTestOutput] = useState<any>(null);

  const categories = [
    'All', 'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 
    'Trees', 'Graphs', 'Dynamic Programming', 'Greedy', 'Backtracking', 
    'Binary Search', 'Hash Maps', 'Sliding Window', 'Two Pointers'
  ];

  const filteredProblems = problems.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesDiff && matchesSearch;
  });

  const selectedProblem = problems.find(p => p.id === selectedProblemId) || problems[0];

  const handleSelectProblem = (prob: CodingProblemItem) => {
    setSelectedProblemId(prob.id);
    setUserCode(prob.initialCode);
    setShowHint(false);
    setShowSolution(false);
    setTestOutput(null);
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestOutput(null);

    const result = await aiInterviewService.evaluateCodingSolution(
      selectedProblem.title,
      userCode,
      selectedLanguage
    );

    setIsRunning(false);
    setTestOutput(result);

    if (result.passed) {
      setProblems(prev => prev.map(p => p.id === selectedProblem.id ? { ...p, status: 'solved' } : p));
    } else {
      setProblems(prev => prev.map(p => p.id === selectedProblem.id && p.status === 'unsolved' ? { ...p, status: 'attempted' } : p));
    }
  };

  const solvedCount = problems.filter(p => p.status === 'solved').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Stats Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold font-geist text-white flex items-center gap-2">
              <Code className="w-6 h-6 text-[#0052ff]" />
              Coding Interview Practice Sandbox
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0052ff]/20 text-[#4cd7f6] font-mono text-[10px] font-bold border border-[#0052ff]/30">
              14 Categories
            </span>
          </div>
          <p className="text-xs text-[#c3c5d9] mt-1">
            Master LeetCode & FAANG algorithmic patterns with live AI hints, complexity analysis, and code execution.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#11131c] px-5 py-3 rounded-xl border border-[#434656]/30">
          <div>
            <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold">Solved Progress</span>
            <p className="text-lg font-bold font-geist text-[#00d26a]">{solvedCount} / {problems.length} Solved</p>
          </div>
          <div className="w-20 bg-[#282934] h-2 rounded-full overflow-hidden">
            <div className="bg-[#00d26a] h-full" style={{ width: `${(solvedCount / problems.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-2 py-1 scrollbar-none max-w-full lg:max-w-3xl">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-[#0052ff] text-white' 
                  : 'bg-[#11131c] text-[#c3c5d9] hover:bg-[#282934]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty & Search */}
        <div className="flex items-center gap-3 shrink-0">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#11131c] border border-[#434656]/40 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8d90a2] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search problem..."
              className="bg-[#11131c] border border-[#434656]/40 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#8d90a2] focus:outline-none w-44"
            />
          </div>
        </div>
      </div>

      {/* Main Coding Workspace: Left Problem List, Right Interactive Sandbox */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Problem List */}
        <div className="col-span-12 lg:col-span-4 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          {filteredProblems.map(prob => {
            const isSelected = prob.id === selectedProblem.id;

            return (
              <div
                key={prob.id}
                onClick={() => handleSelectProblem(prob)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#191b25] border-[#0052ff] ai-gradient-border' 
                    : 'bg-[#191b25]/60 border-[#434656]/30 hover:border-[#434656]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">{prob.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      prob.difficulty === 'Easy' ? 'bg-[#00d26a]/20 text-[#00d26a]' :
                      prob.difficulty === 'Medium' ? 'bg-[#ff8000]/20 text-[#ff8000]' : 'bg-[#ff4d4d]/20 text-[#ff8080]'
                    }`}>
                      {prob.difficulty}
                    </span>
                    {prob.status === 'solved' && <CheckCircle2 className="w-4 h-4 text-[#00d26a]" />}
                  </div>
                </div>

                <h3 className="text-xs font-bold font-geist text-white">{prob.title}</h3>

                <div className="flex items-center gap-3 text-[10px] font-mono text-[#c3c5d9] mt-2">
                  <span>Time: {prob.timeComplexity}</span>
                  <span>Space: {prob.spaceComplexity}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Code Editor & Test Execution */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
            {/* Problem Title & Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#434656]/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                    selectedProblem.difficulty === 'Easy' ? 'bg-[#00d26a]/20 text-[#00d26a]' :
                    selectedProblem.difficulty === 'Medium' ? 'bg-[#ff8000]/20 text-[#ff8000]' : 'bg-[#ff4d4d]/20 text-[#ff8080]'
                  }`}>
                    {selectedProblem.difficulty}
                  </span>
                  <span className="text-xs font-mono text-[#4cd7f6]">{selectedProblem.category}</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold font-geist text-white mt-1">{selectedProblem.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-3 py-1.5 bg-[#11131c] hover:bg-[#282934] text-[#d0bcff] rounded-lg text-xs font-mono border border-[#571bc1]/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#d0bcff]" />
                  {showHint ? 'Hide Hint' : 'AI Hint'}
                </button>

                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="px-3 py-1.5 bg-[#11131c] hover:bg-[#282934] text-[#4cd7f6] rounded-lg text-xs font-mono border border-[#0052ff]/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  {showSolution ? 'Hide Solution' : 'View Solution'}
                </button>
              </div>
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="bg-[#571bc1]/10 border border-[#571bc1]/30 rounded-xl p-3.5 text-xs text-[#d0bcff] font-mono flex items-start gap-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#d0bcff]" />
                <div>
                  <strong className="block mb-0.5">AI Hint:</strong>
                  {selectedProblem.hints[0]}
                </div>
              </div>
            )}

            {/* Problem Description */}
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20 space-y-2">
              <h4 className="text-xs font-mono text-[#c3c5d9] uppercase font-bold">Problem Statement</h4>
              <p className="text-xs text-[#e1e1ef] leading-relaxed font-sans">{selectedProblem.problemDescription}</p>

              {/* Sample Test Case */}
              {selectedProblem.testCases && selectedProblem.testCases.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-[#8d90a2] uppercase">Example Test Case:</span>
                  <div className="bg-[#0c0e17] p-2.5 rounded-lg border border-[#434656]/30 font-mono text-[11px] text-[#4cd7f6] mt-1">
                    Input: {selectedProblem.testCases[0].input} | Output: {selectedProblem.testCases[0].expectedOutput}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Code Editor */}
            <div className="bg-[#0c0e17] border border-[#434656]/40 rounded-xl overflow-hidden space-y-0">
              {/* Editor Bar */}
              <div className="bg-[#11131c] px-4 py-2 flex items-center justify-between border-b border-[#434656]/30">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#4cd7f6]" />
                  <span className="text-xs font-mono text-white">Code Editor</span>
                </div>

                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-[#191b25] text-xs font-mono text-[#4cd7f6] border border-[#434656]/30 rounded px-2.5 py-1 focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python 3</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              {/* Text Area Code Editor */}
              <textarea
                rows={10}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full bg-[#0c0e17] p-4 text-xs font-mono text-[#00d26a] focus:outline-none focus:ring-0 leading-relaxed resize-y"
              />

              {/* Run Action Bar */}
              <div className="p-3 bg-[#11131c] border-t border-[#434656]/30 flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#8d90a2]">Time Limit: 2.0s • Memory Limit: 256MB</span>

                <button
                  onClick={handleRunTests}
                  disabled={isRunning}
                  className="px-5 py-2 bg-[#0052ff] hover:bg-[#0052ff]/90 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  {isRunning ? 'Executing Tests...' : 'Submit & Run Tests'}
                </button>
              </div>
            </div>

            {/* Test Execution Output */}
            {testOutput && (
              <div className={`p-4 rounded-xl border text-xs font-mono space-y-2 animate-fadeIn ${
                testOutput.passed ? 'bg-[#00d26a]/10 border-[#00d26a]/40 text-[#00d26a]' : 'bg-[#ff4d4d]/10 border-[#ff4d4d]/40 text-[#ff8080]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {testOutput.passed ? 'All Test Cases Passed! ✓' : 'Test Execution Failed'}
                  </span>
                  <span>Score: {testOutput.score}/100</span>
                </div>
                <p className="text-white text-xs">{testOutput.feedback}</p>
              </div>
            )}

            {/* Model Solution Reveal */}
            {showSolution && (
              <div className="bg-[#11131c] p-4 rounded-xl border border-[#0052ff]/40 space-y-2 animate-fadeIn">
                <h4 className="text-xs font-mono text-[#4cd7f6] uppercase font-bold">Optimal Solution Code</h4>
                <pre className="bg-[#0c0e17] p-3 rounded-lg border border-[#434656]/30 font-mono text-xs text-[#b7c4ff] overflow-x-auto">
                  {selectedProblem.solutionCode}
                </pre>
                <p className="text-xs text-[#c3c5d9] font-sans pt-1">{selectedProblem.aiExplanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
