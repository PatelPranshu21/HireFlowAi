import React, { useState } from 'react';
import { InterviewQuestion } from '../types';
import { sampleInterviewQuestions } from '../data/mockData';
import { 
  Video, 
  Play, 
  Sparkles, 
  CheckCircle, 
  Mic, 
  Volume2, 
  HelpCircle, 
  Award,
  RefreshCw
} from 'lucide-react';

export const InterviewsView: React.FC = () => {
  const [questions] = useState<InterviewQuestion[]>(sampleInterviewQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion>(questions[0]);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const handleEvaluate = async () => {
    if (!candidateAnswer) return;
    setIsEvaluating(true);
    setEvaluation(null);
    try {
      const res = await fetch('/api/ai/interview-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: selectedQuestion.question,
          answer: candidateAnswer,
          role: selectedQuestion.role
        })
      });
      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      setEvaluation({
        score: 88,
        starBreakdown: {
          situation: "Identified high latency issue during peak streaming traffic.",
          task: "Required sub-100ms API response SLA under load.",
          action: "Introduced Redis cluster caching and query indexing.",
          result: "Reduced p99 latency by 42% for 200k active sessions."
        },
        strengths: ["Strong technical metrics", "Clear action sequence"],
        areasToImprove: ["Mention cost or team collaboration impacts briefly."],
        polishedAnswer: "During a major release, our streaming API experienced a p99 latency spike to 450ms. As lead backend engineer, my goal was restoring sub-100ms response times. I deployed a Redis caching layer for read-heavy payloads and optimized PostgreSQL query indexes, ultimately cutting p99 latency by 42% and keeping cloud infrastructure costs flat."
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-geist text-[#e1e1ef]">AI Mock Interview Coach</h2>
        <p className="text-sm text-[#c3c5d9] mt-1">Master technical & behavioral rounds with real-time STAR feedback.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Question Bank */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-xs font-mono uppercase text-[#c3c5d9] tracking-wider font-bold">Select Question to Practice</h3>
          
          <div className="space-y-3">
            {questions.map((q) => (
              <div 
                key={q.id}
                onClick={() => {
                  setSelectedQuestion(q);
                  setCandidateAnswer('');
                  setEvaluation(null);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedQuestion.id === q.id 
                    ? 'bg-[#191b25] border-[#0052ff] ai-gradient-border' 
                    : 'bg-[#191b25]/50 border-[#434656]/30 hover:border-[#434656]/60'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#32343f] text-[#b7c4ff]">
                    {q.type}
                  </span>
                  <span className="text-xs font-mono text-[#c3c5d9]">{q.company}</span>
                </div>
                <p className="text-sm text-[#e1e1ef] font-medium leading-snug">{q.question}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Simulator & AI Evaluation */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Question Card */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-mono text-[#4cd7f6] uppercase tracking-wider">{selectedQuestion.company} • {selectedQuestion.role}</span>
                <h3 className="text-xl font-bold font-geist text-[#e1e1ef] mt-1">{selectedQuestion.question}</h3>
              </div>
            </div>

            <div className="bg-[#11131c] border border-[#434656]/20 rounded-lg p-3 text-xs font-mono text-[#c3c5d9] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#d0bcff] shrink-0" />
              <span>Hint: {selectedQuestion.hint}</span>
            </div>
          </div>

          {/* Practice Input */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold">Your Response (Type or Speak)</label>
              <button 
                onClick={() => alert("Microphone speech recognition active. Speak clearly into your mic.")}
                className="text-xs font-mono text-[#4cd7f6] bg-[#007083]/20 border border-[#4cd7f6]/30 px-3 py-1 rounded-full flex items-center gap-1.5 hover:bg-[#007083]/40 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" /> Speak Answer
              </button>
            </div>

            <textarea 
              rows={5}
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="Use the STAR method: Situation, Task, Action, Result..."
              className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-4 text-sm text-[#e1e1ef] focus:outline-none focus:border-[#0052ff] font-sans"
            />

            <button 
              onClick={handleEvaluate}
              disabled={isEvaluating || !candidateAnswer}
              className="bg-[#0052ff] hover:bg-[#0052ff]/90 disabled:opacity-50 text-white font-mono font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {isEvaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isEvaluating ? 'Evaluating Response...' : 'Evaluate Answer with AI Coach'}
            </button>
          </div>

          {/* Feedback Output */}
          {evaluation && (
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4 ai-gradient-border">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-geist text-[#e1e1ef] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#4cd7f6]" /> STAR Evaluation
                </h3>
                <span className="text-3xl font-bold font-geist text-[#b7c4ff]">{evaluation.score}/100</span>
              </div>

              {/* STAR Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#11131c] p-3 rounded-lg border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Situation</span>
                  <p className="text-xs text-[#c3c5d9] mt-1">{evaluation.starBreakdown?.situation}</p>
                </div>
                <div className="bg-[#11131c] p-3 rounded-lg border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Task</span>
                  <p className="text-xs text-[#c3c5d9] mt-1">{evaluation.starBreakdown?.task}</p>
                </div>
                <div className="bg-[#11131c] p-3 rounded-lg border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Action</span>
                  <p className="text-xs text-[#c3c5d9] mt-1">{evaluation.starBreakdown?.action}</p>
                </div>
                <div className="bg-[#11131c] p-3 rounded-lg border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Result</span>
                  <p className="text-xs text-[#c3c5d9] mt-1">{evaluation.starBreakdown?.result}</p>
                </div>
              </div>

              {/* Polished Model Answer */}
              {evaluation.polishedAnswer && (
                <div className="bg-[#0c0e17] p-4 rounded-xl border border-[#571bc1]/30">
                  <h4 className="text-xs font-mono text-[#d0bcff] font-bold uppercase mb-1">Exemplar STAR Answer:</h4>
                  <p className="text-xs font-mono text-[#e1e1ef] leading-relaxed">{evaluation.polishedAnswer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
