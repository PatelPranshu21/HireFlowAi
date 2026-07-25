import React, { useState } from 'react';
import { sampleBehavioralQuestions } from '../../data/interviewData';
import { BehavioralQuestionItem } from '../../types';
import { aiInterviewService } from '../../services/aiInterviewService';
import { 
  MessageSquare, 
  Sparkles, 
  Award, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  RefreshCw, 
  HelpCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export const HrBehavioralTab: React.FC = () => {
  const [questions] = useState<BehavioralQuestionItem[]>(sampleBehavioralQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<BehavioralQuestionItem>(questions[0]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    setEvaluation(null);

    const result = await aiInterviewService.evaluateAnswer(
      selectedQuestion.question,
      userAnswer,
      'HR / Behavioral Candidate'
    );

    setIsEvaluating(false);
    setEvaluation(result);
  };

  const handleToggleMic = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setUserAnswer("I have spent over 6 years engineering high-scale distributed systems and web platforms. In my current role at Apple, I architected event-driven microservices that reduced API latency by 42%. I am excited about joining your team to lead technical product initiatives.");
        setIsRecording(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-geist text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#d0bcff]" />
            HR & Behavioral STAR Interview Coach
          </h2>
          <p className="text-xs text-[#c3c5d9] mt-1">
            Practice foundational HR questions with AI feedback evaluated on Confidence, Clarity, Structure & Professionalism.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#571bc1]/20 px-4 py-2.5 rounded-xl border border-[#571bc1]/30">
          <UserCheck className="w-4 h-4 text-[#d0bcff]" />
          <span className="text-xs font-mono font-bold text-[#d0bcff]">STAR Method Active</span>
        </div>
      </div>

      {/* Main Grid: Left Question Select, Right Practice & Evaluation */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Common HR Questions */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
          <span className="text-xs font-mono uppercase text-[#c3c5d9] font-bold block mb-2">Common HR Questions</span>

          {questions.map(q => {
            const isSelected = q.id === selectedQuestion.id;

            return (
              <div
                key={q.id}
                onClick={() => {
                  setSelectedQuestion(q);
                  setUserAnswer('');
                  setEvaluation(null);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#191b25] border-[#571bc1] ai-gradient-border' 
                    : 'bg-[#191b25]/60 border-[#434656]/30 hover:border-[#434656]/60'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#32343f] text-[#d0bcff]">
                    {q.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#8d90a2]">{q.framework}</span>
                </div>
                <h3 className="text-xs font-bold font-geist text-white leading-snug">{q.question}</h3>
              </div>
            );
          })}
        </div>

        {/* Right Column: Practice Input & Evaluation */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Question Display Card */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-3">
            <span className="text-[10px] font-mono uppercase text-[#d0bcff] font-bold tracking-wider">
              Selected Question • {selectedQuestion.category}
            </span>
            <h3 className="text-lg font-bold font-geist text-white">{selectedQuestion.question}</h3>

            <div className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20 text-xs font-mono text-[#c3c5d9]">
              <strong className="text-[#d0bcff] block mb-1">Ideal Structure ({selectedQuestion.framework}):</strong>
              <p className="whitespace-pre-line text-[11px] leading-relaxed">{selectedQuestion.idealStructure}</p>
            </div>
          </div>

          {/* Response Box */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold">Your Response (STAR Method)</label>
              <button
                onClick={handleToggleMic}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isRecording 
                    ? 'bg-[#ff4d4d] text-white animate-pulse' 
                    : 'bg-[#571bc1]/20 text-[#d0bcff] border border-[#571bc1]/40 hover:bg-[#571bc1]/40'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isRecording ? 'Listening...' : 'Record Voice Answer'}
              </button>
            </div>

            <textarea
              rows={5}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Structure answer with clear Situation, Task, Action, and measurable Result metrics..."
              className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#571bc1] font-sans"
            />

            <button
              onClick={handleEvaluateAnswer}
              disabled={isEvaluating || !userAnswer.trim()}
              className="px-6 py-3 bg-[#571bc1] hover:bg-[#571bc1]/90 disabled:opacity-50 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#571bc1]/25"
            >
              {isEvaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#d0bcff]" />}
              {isEvaluating ? 'Evaluating HR Response...' : 'Evaluate Behavioral Response with AI'}
            </button>
          </div>

          {/* Evaluation Breakdown */}
          {evaluation && (
            <div className="bg-[#191b25] border border-[#571bc1] rounded-2xl p-6 space-y-5 ai-gradient-border">
              <div className="flex justify-between items-center border-b border-[#434656]/20 pb-4">
                <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#d0bcff]" /> AI HR Evaluation Scores
                </h3>
                <span className="text-2xl font-bold font-geist text-[#d0bcff]">{evaluation.score}/100</span>
              </div>

              {/* 4 Core Metric Evaluators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold">Confidence</span>
                  <p className="text-base font-bold text-[#4cd7f6] mt-0.5">{evaluation.confidenceScore}%</p>
                </div>
                <div className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold">Clarity</span>
                  <p className="text-base font-bold text-[#b7c4ff] mt-0.5">{evaluation.clarityScore}%</p>
                </div>
                <div className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold">Structure (STAR)</span>
                  <p className="text-base font-bold text-[#00d26a] mt-0.5">{evaluation.structureScore}%</p>
                </div>
                <div className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold">Professionalism</span>
                  <p className="text-base font-bold text-[#d0bcff] mt-0.5">{evaluation.professionalismScore}%</p>
                </div>
              </div>

              {/* STAR Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Situation</span>
                  <p className="text-xs text-[#c3c5d9] mt-1">{evaluation.starBreakdown?.situation}</p>
                </div>
                <div className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Task</span>
                  <p className="text-xs text-[#c3c5d9] mt-1">{evaluation.starBreakdown?.task}</p>
                </div>
                <div className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Action</span>
                  <p className="text-xs text-[#c3c5d9] mt-1">{evaluation.starBreakdown?.action}</p>
                </div>
                <div className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Result</span>
                  <p className="text-xs text-[#c3c5d9] mt-1">{evaluation.starBreakdown?.result}</p>
                </div>
              </div>

              {/* Exemplar Polished Answer */}
              {evaluation.polishedAnswer && (
                <div className="bg-[#0c0e17] p-4 rounded-xl border border-[#571bc1]/30">
                  <h4 className="text-xs font-mono text-[#d0bcff] font-bold uppercase mb-1">Polished STAR Exemplar Response:</h4>
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
