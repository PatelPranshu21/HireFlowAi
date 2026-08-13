import React, { useState } from 'react';
import { useEcosystem } from '../context/EcosystemContext';
import { UserService } from '../services/userService';
import { Sparkles, Bot, Send, X, ChevronUp, ChevronDown, CheckCircle2, AlertCircle, Award, ArrowRight } from 'lucide-react';
import { ChatMessage } from '../types';

export const AiCareerCoachWidget: React.FC = () => {
  const { profile, coachMessages, navigateWithEcosystem } = useEcosystem();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'proactive' | 'chat'>('proactive');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${profile.name}! I am your HireFlow AI Career Coach. I continuously monitor your ATS Score, Job Matches, Interview Readiness, and Career Roadmap. How can I assist your career journey today?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isSending) return;

    const userText = inputMsg;
    setInputMsg('');
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const token = UserService.getAuthToken();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userText,
          context: 'career_coach',
          conversationHistory: history,
          contextData: {
            userProfile: {
              name: profile.name,
              title: profile.title,
              targetRole: profile.targetRole,
              targetJobDescription: profile.targetJobDescription,
              skills: profile.skills,
              experienceLevel: profile.experienceLevel,
              targetSalary: profile.targetSalary,
              location: profile.location,
              bio: profile.bio
            },
            atsScore: profile.atsScore,
            employabilityScore: profile.analytics?.employabilityScore
          }
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const data = await res.json();
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'ai',
          text: data.reply || data.text || "I was unable to answer your query right now. Please try asking again.",
          timestamp: 'Just now'
        }
      ]);
    } catch (err) {
      console.error("Career Coach error:", err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'ai',
          text: "I encountered an error connecting to the AI Career Coach. Please try again.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const unreadCount = coachMessages.length;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanded Coach Window */}
      {isOpen && (
        <div className="mb-3 w-[360px] md:w-[420px] h-[520px] bg-[#11131c] border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0052ff] to-[#571bc1] p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold font-geist text-sm leading-tight flex items-center gap-2">
                  AI Career Coach
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-white/70 font-mono">Telemetry & Proactive Strategy</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-white/5 shrink-0 text-xs font-medium text-white/60">
            <button
              onClick={() => setActiveTab('proactive')}
              className={`flex-1 py-2.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'proactive'
                  ? 'text-white border-b-2 border-blue-500 font-semibold bg-white/5'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Proactive Insights ({coachMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'text-white border-b-2 border-blue-500 font-semibold bg-white/5'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              Ask AI Coach
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {activeTab === 'proactive' ? (
              <>
                <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-1">
                  Real-time Ecosystem Insights
                </div>

                {coachMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      {msg.type === 'milestone' || msg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      )}
                      <p className="text-xs text-white/90 leading-relaxed font-sans">{msg.message}</p>
                    </div>

                    {msg.actionText && msg.actionTab && (
                      <button
                        onClick={() => {
                          navigateWithEcosystem(msg.actionTab!);
                          setIsOpen(false);
                        }}
                        className="self-end text-[11px] font-mono font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer pt-1"
                      >
                        {msg.actionText} <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white/10 text-white/90 border border-white/10 rounded-bl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 border border-white/10 text-white/50 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                        AI Coach thinking...
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSend} className="pt-3 border-t border-white/10 flex gap-2">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Ask about resume, jobs, interviews..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-white/30"
                  />
                  <button
                    type="submit"
                    disabled={isSending}
                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-[#0052ff] to-[#571bc1] hover:from-[#0042d6] hover:to-[#4815a5] text-white p-3.5 rounded-2xl shadow-xl shadow-blue-500/25 flex items-center gap-2.5 transition-all cursor-pointer hover:scale-105 active:scale-95 group"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#11131c]" />
        </div>
        <span className="text-xs font-bold font-geist tracking-wide hidden sm:inline">
          {isOpen ? 'Close AI Coach' : 'AI Career Coach'}
        </span>
        {unreadCount > 0 && !isOpen && (
          <span className="bg-white text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
