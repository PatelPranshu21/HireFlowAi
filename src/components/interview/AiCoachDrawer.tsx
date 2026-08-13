import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  HelpCircle, 
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { UserService } from '../../services/userService';

interface AiCoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeQuestion?: any;
  activeSession?: any;
}

export const AiCoachDrawer: React.FC<AiCoachDrawerProps> = ({ isOpen, onClose, activeQuestion, activeSession }) => {
  const { profile } = useEcosystem();
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    { 
      sender: 'ai', 
      text: `👋 Hi ${profile?.name?.split(' ')[0] || 'there'}! I'm your HireFlow AI Interview Coach. Ask me anything about interview preparation, STAR responses, technical tradeoffs, weaknesses, or company hiring bars!` 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (promptText?: string) => {
    const userText = promptText || input;
    if (!userText.trim() || loading) return;

    if (!promptText) setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

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
          message: userText,
          context: 'interview_coach',
          conversationHistory: history,
          contextData: {
            targetRole: profile?.targetRole || 'Software Engineer',
            activeQuestion: activeQuestion ? {
              question: activeQuestion.question || activeQuestion.text,
              category: activeQuestion.category,
              difficulty: activeQuestion.difficulty || 'Medium',
              userAnswer: activeQuestion.userAnswer || activeQuestion.answer || null,
              aiFeedback: activeQuestion.feedback || null,
              starAnalysis: activeQuestion.starAnalysis || null,
              score: activeQuestion.score || null
            } : null,
            activeSession: activeSession ? {
              title: activeSession.title || activeSession.role || profile?.targetRole || 'Software Engineer',
              company: activeSession.company || 'Tech Company',
              interviewType: activeSession.type || activeSession.interviewType || 'Technical & Behavioral',
              score: activeSession.score || 85
            } : null,
            userProfile: {
              name: profile?.name,
              title: profile?.title || 'Software Engineer',
              experienceLevel: profile?.experienceLevel || 'Mid-Senior',
              skills: profile?.skills || []
            }
          }
        })
      });

      let errorMessage = "I encountered an error contacting the Interview Coach service. Please try again.";
      if (!res.ok) {
        try {
          const errData = await res.json();
          if (errData.error) {
            errorMessage = errData.error;
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply || data.text || "I was unable to evaluate that request right now. Please try asking again." }]);
    } catch (e: any) {
      console.error("AI Interview Coach Error:", e);
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: e.message || "I encountered an error contacting the Interview Coach service. Please try again." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#11131c] border-l border-[#434656]/30 z-50 shadow-2xl flex flex-col animate-slideLeft">
      {/* Drawer Header */}
      <div className="p-4 bg-[#191b25] border-b border-[#434656]/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#0052ff]/20 text-[#4cd7f6]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-geist text-white">AI Interview Coach</h3>
            <span className="text-[10px] font-mono text-[#00d26a]">Active & Synced</span>
          </div>
        </div>

        <button onClick={onClose} className="p-1.5 text-[#8d90a2] hover:text-white rounded-lg hover:bg-[#282934] cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-[#0052ff] text-white font-sans' 
                : 'bg-[#191b25] border border-[#434656]/30 text-[#e1e1ef] font-sans'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#191b25] p-3 rounded-2xl text-xs font-mono text-[#4cd7f6] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> AI Coach thinking...
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2 border-t border-[#434656]/20 bg-[#191b25] flex gap-2 overflow-x-auto scrollbar-none">
        {['Explain Redis vs Memcached', 'STAR answer for conflict', 'Google hiring bar tips'].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => setInput(chip)}
            className="px-2.5 py-1 bg-[#11131c] hover:bg-[#282934] text-[#c3c5d9] text-[10px] font-mono rounded-lg border border-[#434656]/30 shrink-0 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-[#191b25] border-t border-[#434656]/30 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI Coach a question..."
          className="flex-1 bg-[#11131c] border border-[#434656]/40 rounded-xl px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-[#0052ff]"
        />
        <button
          onClick={handleSend}
          className="p-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-xl cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
