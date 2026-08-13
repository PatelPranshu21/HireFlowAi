import React, { useState } from 'react';
import { UserProfile, ResumeAnalysisResult } from '../../types';
import { UserService } from '../../services/userService';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User as UserIcon, 
  RefreshCw, 
  Zap, 
  MessageSquare, 
  ChevronRight 
} from 'lucide-react';

interface AiCareerCoachDrawerProps {
  user: UserProfile;
  analysis: ResumeAnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AiCareerCoachDrawer: React.FC<AiCareerCoachDrawerProps> = ({
  user,
  analysis,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `Hello ${user.name || 'there'}! I am your HireFlow AI Resume Coach. I've analyzed your ${user.targetRole || 'Software Engineer'} resume. Your current ATS score is ${analysis?.overallScore || analysis?.atsScore || 82}/100. How can I help optimize your resume today?`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (promptText?: string) => {
    const query = promptText || input;
    if (!query.trim() || isThinking) return;

    const userMsg: ChatMessage = { sender: 'user', text: query, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    if (!promptText) setInput('');
    setIsThinking(true);

    try {
      const history = messages.map(m => ({
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
          message: query,
          context: 'resume_coach',
          conversationHistory: history,
          contextData: {
            userProfile: {
              name: user.name,
              title: user.title,
              targetRole: user.targetRole,
              targetJobDescription: user.targetJobDescription,
              skills: user.skills,
              experienceLevel: user.experienceLevel
            },
            atsScore: analysis?.atsScore || analysis?.overallScore || 82,
            formattingScore: analysis?.formattingScore || 90,
            impactScore: analysis?.impactScore || 75,
            relevanceScore: analysis?.relevanceScore || 80,
            overallScore: analysis?.overallScore || 82,
            summaryReport: analysis?.summary || '',
            keyStrengths: analysis?.keyStrengths || [],
            criticalGaps: analysis?.criticalGaps || [],
            missingKeywords: analysis?.missingKeywords || [],
            matchingKeywords: analysis?.matchingKeywords || [],
            actionableSuggestions: analysis?.actionableSuggestions || [],
            resumeText: user.primaryResumeText || user.resumeText || user.rawResumeText || ''
          }
        })
      });

      let errorMessage = "I encountered an error connecting to the AI Resume Coach. Please try again or check your server connection.";
      if (!res.ok) {
        try {
          const errData = await res.json();
          if (errData.error) {
            errorMessage = errData.error;
          }
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: data.reply || data.suggestion || "I was unable to analyze that right now. Please try asking again.",
        time: 'Just now'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Coach error:", err);
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: err.message || "I encountered an error connecting to the AI Resume Coach. Please try again or check your server connection.",
        time: 'Just now'
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#191b25] border-l border-[#434656]/40 z-50 flex flex-col shadow-2xl animate-slideLeft">
      {/* Drawer Header */}
      <div className="p-4 bg-[#1d1f29] border-b border-[#434656]/30 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#0052ff]/20 text-[#4cd7f6] rounded-xl border border-[#0052ff]/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-geist text-white">AI Career &amp; Resume Coach</h3>
            <p className="text-[10px] font-mono text-[#8d90a2]">Powered by Gemini 2.5 Intelligence</p>
          </div>
        </div>

        <button onClick={onClose} className="p-1 text-[#8d90a2] hover:text-white rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-[#11131c] border-b border-[#434656]/20 flex overflow-x-auto gap-2">
        {[
          "How do I reach 95+ ATS score?",
          "How to explain gaps?",
          "Best keywords for Senior Frontend?",
          "How to quantify achievements?"
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 bg-[#191b25] hover:bg-[#282934] text-[10px] font-mono text-[#b7c4ff] border border-[#434656]/30 rounded-lg shrink-0 cursor-pointer transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-[#0052ff] flex items-center justify-center text-white shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-[#0052ff] text-white font-sans rounded-tr-none' 
                : 'bg-[#11131c] text-[#e1e1ef] border border-[#434656]/30 font-sans rounded-tl-none'
            }`}>
              {m.text}
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-[#282934] flex items-center justify-center text-white shrink-0 mt-1">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#4cd7f6] p-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> AI Coach is generating advice...
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="p-4 bg-[#1d1f29] border-t border-[#434656]/30">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask your AI coach anything about your resume..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0052ff]"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
