import React, { useState, useEffect } from 'react';
import { UserProfile, ResumeVersion, InterviewQuestion, InterviewFeedbackReport } from '../../types';
import { aiInterviewService } from '../../services/aiInterviewService';
import { 
  Play, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  RefreshCw, 
  ArrowRight, 
  Bot, 
  Layers, 
  ChevronRight,
  RotateCcw,
  Download
} from 'lucide-react';

interface AiMockInterviewTabProps {
  user: UserProfile;
  resumeData?: ResumeVersion;
  onSessionComplete: (report: InterviewFeedbackReport) => void;
}

export const AiMockInterviewTab: React.FC<AiMockInterviewTabProps> = ({
  user,
  resumeData,
  onSessionComplete
}) => {
  // Setup State
  const [selectedDomain, setSelectedDomain] = useState<string>('Full Stack');
  const [selectedLevel, setSelectedLevel] = useState<string>('Intermediate');
  const [selectedMode, setSelectedMode] = useState<string>('Standard (30 min)');
  const [targetCompany, setTargetCompany] = useState<string>('Google');

  // Active Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<{ questionId: string; userAudioOrText: string; feedback?: any }[]>([]);

  // Evaluation & Speech State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);
  const [isMicRecording, setIsMicRecording] = useState<boolean>(false);

  // Timer State
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800); // 30 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Completed Session Report State
  const [finalReport, setFinalReport] = useState<InterviewFeedbackReport | null>(null);

  // Timer countdown hook
  useEffect(() => {
    let timer: any = null;
    if (isSessionActive && isTimerRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive, isTimerRunning, secondsRemaining]);

  // Speech Synthesis helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isSpeakingQuestion) {
        setIsSpeakingQuestion(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeakingQuestion(false);
      setIsSpeakingQuestion(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser version.");
    }
  };

  // Speech Recognition Mic simulator/Web Speech API
  const handleToggleMic = () => {
    if (isMicRecording) {
      setIsMicRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => setIsMicRecording(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateAnswer(prev => prev + ' ' + transcript);
      };
      recognition.onerror = () => setIsMicRecording(false);
      recognition.onend = () => setIsMicRecording(false);
      recognition.start();
    } else {
      // Fallback voice prompt simulation
      setIsMicRecording(true);
      setTimeout(() => {
        setCandidateAnswer(prev => prev + (prev ? ' ' : '') + 'In my previous position, I spearheaded the deployment of distributed caching in Redis which reduced p99 latency by 42% for 200,000 active daily users.');
        setIsMicRecording(false);
      }, 2500);
    }
  };

  // Start Session
  const handleStartSession = async () => {
    const resumeSkills = resumeData?.parsedData?.skills || ['React', 'Node.js', 'Python', 'AWS'];
    const generated = await aiInterviewService.generateQuestions(
      selectedDomain,
      selectedLevel,
      targetCompany,
      resumeSkills
    );

    setQuestions(generated);
    setCurrentIndex(0);
    setAnswers([]);
    setCandidateAnswer('');
    setCurrentEvaluation(null);
    setFinalReport(null);
    setIsSessionActive(true);

    const initialDuration = selectedMode.includes('10') ? 600 : selectedMode.includes('60') ? 3600 : 1800;
    setSecondsRemaining(initialDuration);
    setIsTimerRunning(true);
  };

  // Evaluate Answer for current question
  const handleEvaluateAnswer = async () => {
    if (!candidateAnswer.trim() || !questions[currentIndex]) return;
    setIsEvaluating(true);

    const currentQ = questions[currentIndex];
    const evalResult = await aiInterviewService.evaluateAnswer(
      currentQ.question,
      candidateAnswer,
      currentQ.role
    );

    setCurrentEvaluation(evalResult);
    setIsEvaluating(false);

    const newAnswers = [
      ...answers.filter(a => a.questionId !== currentQ.id),
      { questionId: currentQ.id, userAudioOrText: candidateAnswer, feedback: evalResult }
    ];
    setAnswers(newAnswers);
  };

  // Next Question or Finish
  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCandidateAnswer('');
      setCurrentEvaluation(null);
    } else {
      // Finish Session & Generate Final Report
      setIsTimerRunning(false);
      const report = await aiInterviewService.generateSessionReport(
        `${selectedDomain} (${selectedLevel}) Mock Round`,
        targetCompany,
        answers
      );
      setFinalReport(report);
      setIsSessionActive(false);
      onSessionComplete(report);
    }
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* If completed and showing final session report */}
      {finalReport && !isSessionActive && (
        <div className="bg-[#191b25] border border-[#0052ff] rounded-2xl p-6 md:p-8 space-y-6 ai-gradient-border shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#434656]/30 pb-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#00d26a]/20 text-[#00d26a] font-mono text-xs font-bold border border-[#00d26a]/30">
                Mock Interview Session Completed ✓
              </span>
              <h2 className="text-2xl font-bold font-geist text-white mt-2">{finalReport.sessionTitle} Report</h2>
              <p className="text-xs font-mono text-[#c3c5d9]">Target Company: <strong className="text-white">{finalReport.companyName}</strong></p>
            </div>

            <div className="flex items-center gap-4 bg-[#11131c] px-6 py-3 rounded-2xl border border-[#434656]/30">
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Overall Score</span>
                <p className="text-3xl font-bold font-geist text-[#b7c4ff]">{finalReport.overallScore}/100</p>
              </div>
            </div>
          </div>

          {/* Scores Breakdown Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
              <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold">Technical Depth</span>
              <p className="text-xl font-bold text-[#4cd7f6] mt-1">{finalReport.technicalScore}%</p>
            </div>
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
              <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold">Communication</span>
              <p className="text-xl font-bold text-[#b7c4ff] mt-1">{finalReport.communicationScore}%</p>
            </div>
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
              <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold">Problem Solving</span>
              <p className="text-xl font-bold text-[#00d26a] mt-1">{finalReport.problemSolvingScore}%</p>
            </div>
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/20">
              <span className="text-[10px] font-mono text-[#c3c5d9] uppercase font-bold">Confidence</span>
              <p className="text-xl font-bold text-[#d0bcff] mt-1">{finalReport.confidenceScore}%</p>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#11131c] p-5 rounded-xl border border-[#00d26a]/30">
              <h4 className="text-xs font-mono text-[#00d26a] uppercase font-bold mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Top Key Strengths
              </h4>
              <ul className="space-y-2">
                {finalReport.strengths.map((s, idx) => (
                  <li key={idx} className="text-xs text-[#e1e1ef] flex items-start gap-2">
                    <span className="text-[#00d26a]">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#11131c] p-5 rounded-xl border border-[#ff8000]/30">
              <h4 className="text-xs font-mono text-[#ff8000] uppercase font-bold mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Actionable Areas to Improve
              </h4>
              <ul className="space-y-2">
                {finalReport.improvementSuggestions.map((s, idx) => (
                  <li key={idx} className="text-xs text-[#e1e1ef] flex items-start gap-2">
                    <span className="text-[#ff8000]">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => { setFinalReport(null); setIsSessionActive(false); }}
              className="px-4 py-2.5 bg-[#282934] hover:bg-[#32343f] text-[#e1e1ef] rounded-xl text-xs font-mono font-medium flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#b7c4ff]" /> Start New Session
            </button>
          </div>
        </div>
      )}

      {/* SETUP VIEW (When no session active & no report) */}
      {!isSessionActive && !finalReport && (
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#434656]/20 pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-geist text-white flex items-center gap-2">
                <Bot className="w-6 h-6 text-[#0052ff]" />
                Configure AI Mock Interview Simulator
              </h2>
              <p className="text-xs text-[#c3c5d9] mt-1">
                Customize interview parameters. Questions will be personalized based on your resume data and target role.
              </p>
            </div>

            {resumeData?.parsedData?.skills && (
              <span className="hidden sm:inline-flex px-3 py-1 bg-[#0052ff]/10 text-[#4cd7f6] rounded-full font-mono text-[11px] border border-[#0052ff]/30">
                ✓ Resume Synced ({resumeData.parsedData.skills.length} Skills)
              </span>
            )}
          </div>

          {/* 1. Select Domain */}
          <div>
            <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold block mb-3">1. Select Interview Domain / Specialization</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                'Frontend', 'Backend', 'Full Stack', 'AI/ML', 'Data Science', 
                'Cybersecurity', 'DevOps', 'Product Manager', 'HR', 'Behavioural'
              ].map(domain => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`p-3 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer text-center ${
                    selectedDomain === domain 
                      ? 'bg-[#0052ff] border-[#4cd7f6] text-white shadow-lg shadow-[#0052ff]/25' 
                      : 'bg-[#11131c] border-[#434656]/30 text-[#c3c5d9] hover:bg-[#282934]'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Select Difficulty Level & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold block mb-3">2. Experience Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`p-3 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer text-center ${
                      selectedLevel === lvl 
                        ? 'bg-[#0052ff] border-[#4cd7f6] text-white shadow-lg shadow-[#0052ff]/25' 
                        : 'bg-[#11131c] border-[#434656]/30 text-[#c3c5d9] hover:bg-[#282934]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold block mb-3">3. Interview Duration / Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {['Quick (10 min)', 'Standard (30 min)', 'Full Interview (60 min)'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`p-3 rounded-xl border text-[11px] font-mono font-semibold transition-all cursor-pointer text-center ${
                      selectedMode === mode 
                        ? 'bg-[#0052ff] border-[#4cd7f6] text-white shadow-lg shadow-[#0052ff]/25' 
                        : 'bg-[#11131c] border-[#434656]/30 text-[#c3c5d9] hover:bg-[#282934]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Target Company */}
          <div>
            <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold block mb-2">4. Target Company Style</label>
            <div className="flex items-center gap-3">
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="bg-[#11131c] border border-[#434656]/40 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff] w-full md:w-80"
              >
                {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Uber', 'Atlassian', 'Razorpay', 'PhonePe', 'TCS'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="text-xs text-[#c3c5d9]">Generates question styles matching this firm's hiring bar.</span>
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-4 border-t border-[#434656]/20 flex justify-end">
            <button
              onClick={handleStartSession}
              className="px-6 py-3 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-xl shadow-[#0052ff]/30 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Start AI Mock Interview Session
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE INTERVIEW SIMULATOR VIEW */}
      {isSessionActive && currentQ && (
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Question & Controls */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Header Status Bar */}
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-[#0052ff]/20 text-[#4cd7f6] font-mono text-xs font-bold border border-[#0052ff]/30">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-mono text-[#c3c5d9]">
                  {selectedDomain} • {selectedLevel}
                </span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 bg-[#11131c] px-3 py-1.5 rounded-lg border border-[#434656]/30">
                <Clock className="w-4 h-4 text-[#ff8000]" />
                <span className="font-mono text-xs font-bold text-white">{formatTime(secondsRemaining)}</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#4cd7f6] font-bold tracking-wider">
                    {currentQ.company} • {currentQ.type} Question
                  </span>
                  <h3 className="text-lg md:text-xl font-bold font-geist text-white mt-1 leading-snug">
                    {currentQ.question}
                  </h3>
                </div>

                <button
                  onClick={() => speakText(currentQ.question)}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                    isSpeakingQuestion 
                      ? 'bg-[#0052ff] border-[#4cd7f6] text-white animate-pulse' 
                      : 'bg-[#11131c] border-[#434656]/30 text-[#4cd7f6] hover:bg-[#282934]'
                  }`}
                  title="Audio Speech (Text to Speech)"
                >
                  {isSpeakingQuestion ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              <div className="bg-[#11131c] border border-[#434656]/20 rounded-xl p-3 text-xs font-mono text-[#c3c5d9] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#d0bcff] shrink-0" />
                <span>Hint: {currentQ.hint}</span>
              </div>
            </div>

            {/* Answer Response Area */}
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-[#c3c5d9] uppercase font-bold">Your Response (Type or Speak)</label>
                <button
                  onClick={handleToggleMic}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isMicRecording 
                      ? 'bg-[#ff4d4d] text-white animate-pulse' 
                      : 'bg-[#007083]/20 text-[#4cd7f6] border border-[#4cd7f6]/30 hover:bg-[#007083]/40'
                  }`}
                >
                  {isMicRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  {isMicRecording ? 'Recording Speech...' : 'Speak Answer'}
                </button>
              </div>

              <textarea
                rows={6}
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder="Structure response using STAR: Situation (Context), Task (Objective), Action (Technical Execution), Result (Metrics)..."
                className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#0052ff] font-sans"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleEvaluateAnswer}
                  disabled={isEvaluating || !candidateAnswer.trim()}
                  className="px-5 py-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  {isEvaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#4cd7f6]" />}
                  {isEvaluating ? 'Evaluating STAR Answer...' : 'Evaluate Answer with AI Coach'}
                </button>

                {currentEvaluation && (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 bg-[#00d26a] hover:bg-[#00d26a]/90 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Mock Session'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time STAR Feedback Output */}
          <div className="col-span-12 lg:col-span-5">
            {currentEvaluation ? (
              <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-4 ai-gradient-border sticky top-24">
                <div className="flex justify-between items-center border-b border-[#434656]/20 pb-3">
                  <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#4cd7f6]" /> STAR Evaluation Result
                  </h3>
                  <span className="text-2xl font-bold font-geist text-[#b7c4ff]">{currentEvaluation.score}/100</span>
                </div>

                {/* STAR Breakdown */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#11131c] p-2.5 rounded-lg border border-[#434656]/20">
                    <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Situation</span>
                    <p className="text-[11px] text-[#c3c5d9] mt-0.5 leading-tight">{currentEvaluation.starBreakdown?.situation}</p>
                  </div>
                  <div className="bg-[#11131c] p-2.5 rounded-lg border border-[#434656]/20">
                    <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Task</span>
                    <p className="text-[11px] text-[#c3c5d9] mt-0.5 leading-tight">{currentEvaluation.starBreakdown?.task}</p>
                  </div>
                  <div className="bg-[#11131c] p-2.5 rounded-lg border border-[#434656]/20">
                    <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Action</span>
                    <p className="text-[11px] text-[#c3c5d9] mt-0.5 leading-tight">{currentEvaluation.starBreakdown?.action}</p>
                  </div>
                  <div className="bg-[#11131c] p-2.5 rounded-lg border border-[#434656]/20">
                    <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">Result</span>
                    <p className="text-[11px] text-[#c3c5d9] mt-0.5 leading-tight">{currentEvaluation.starBreakdown?.result}</p>
                  </div>
                </div>

                {/* Polished Exemplar STAR Answer */}
                {currentEvaluation.polishedAnswer && (
                  <div className="bg-[#0c0e17] p-3.5 rounded-xl border border-[#571bc1]/40">
                    <h4 className="text-[11px] font-mono text-[#d0bcff] font-bold uppercase mb-1">Exemplar STAR Answer:</h4>
                    <p className="text-xs font-mono text-[#e1e1ef] leading-relaxed">{currentEvaluation.polishedAnswer}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#191b25]/50 border border-dashed border-[#434656]/30 rounded-2xl p-8 text-center space-y-3 sticky top-24">
                <Bot className="w-10 h-10 text-[#434656] mx-auto" />
                <h4 className="text-sm font-bold text-[#c3c5d9]">AI Coach Waiting for Your Answer</h4>
                <p className="text-xs text-[#8d90a2] leading-relaxed max-w-xs mx-auto">
                  Type or speak your answer on the left, then click "Evaluate Answer with AI Coach" to get real-time STAR breakdown feedback.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
