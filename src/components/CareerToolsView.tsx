import React, { useState } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { 
  BrainCircuit, 
  Send, 
  Linkedin, 
  DollarSign, 
  BookOpen, 
  Bot, 
  User, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface CareerToolsViewProps {
  user: UserProfile;
}

export const CareerToolsView: React.FC<CareerToolsViewProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${user.name}! I am your HireFlow AI Career Strategist. I can help optimize your LinkedIn headline, craft salary negotiation counteroffers, or map learning paths for missing skills. What would you like to work on?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Tool Modals
  const [linkedInHeadline, setLinkedInHeadline] = useState('');
  const [salaryOffer, setSalaryOffer] = useState('');
  const [negotiationLetter, setNegotiationLetter] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputText,
          history: messages
        })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply || "Focus on quantifying your engineering outcomes and building distributed systems experience.",
          timestamp: 'Just now'
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I recommend highlighting your distributed systems and cloud architecture achievements on your profile.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleOptimizeLinkedIn = () => {
    setLinkedInHeadline("Senior Software Engineer @ Apple | Distributed Systems, React & Cloud Architectures | Tech Lead");
  };

  const handleGenerateNegotiation = () => {
    if (!salaryOffer) return;
    setNegotiationLetter(
      `Dear Hiring Manager,\n\nThank you so much for extending the offer for the Senior Software Engineer role at $${salaryOffer}. Based on market compensation benchmarks for Senior Engineers in tier-1 tech markets and my experience leading high-throughput cloud infrastructure, I would love to explore aligning base compensation at $${(parseInt(salaryOffer) * 1.15).toFixed(0)} or including a performance equity grant.\n\nBest regards,\n${user.name}`
    );
  };

  return (
    <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold font-geist text-[#e1e1ef]">AI Career Suite</h2>
        <p className="text-sm text-[#c3c5d9] mt-1 font-mono">Specialized AI copilots for LinkedIn, Salary Negotiation, and Strategy.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Chat Strategist (7 cols) */}
        <div className="col-span-12 lg:col-span-7 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-col h-[600px]">
          <div className="flex items-center gap-3 pb-4 border-b border-[#434656]/30 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#571bc1]/20 border border-[#571bc1]/40 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#d0bcff]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-geist">HireFlow Career Strategist</h3>
              <p className="text-xs font-mono text-[#4cd7f6]">Powered by Gemini 3.6 Flash</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-[#571bc1] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`p-4 rounded-xl text-xs font-mono leading-relaxed max-w-lg ${
                  msg.sender === 'user'
                    ? 'bg-[#0052ff] text-white rounded-tr-none'
                    : 'bg-[#11131c] text-[#e1e1ef] border border-[#434656]/30 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-2 items-center text-xs font-mono text-[#c3c5d9]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4cd7f6]" /> AI is thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-3 border-t border-[#434656]/20">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about job search strategy, salary benchmarks, resume tips..."
              className="flex-1 bg-[#0c0e17] border border-[#434656]/40 rounded-xl px-4 py-2.5 text-xs text-[#e1e1ef] focus:outline-none focus:border-[#0052ff]"
            />
            <button 
              type="submit"
              className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-5 rounded-xl text-xs font-mono font-bold flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Specialized Widgets (5 cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* LinkedIn Optimizer */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#0077b5]">
              <Linkedin className="w-5 h-5 fill-current" />
              <h3 className="text-base font-bold text-white font-geist">LinkedIn Headline Generator</h3>
            </div>
            <p className="text-xs text-[#c3c5d9]">Generate high-visibility keywords for recruiter search indexing.</p>

            {linkedInHeadline && (
              <div className="bg-[#0c0e17] p-3 rounded-lg border border-[#0077b5]/40 text-xs font-mono text-[#e1e1ef]">
                {linkedInHeadline}
              </div>
            )}

            <button 
              onClick={handleOptimizeLinkedIn}
              className="w-full bg-[#0077b5]/20 hover:bg-[#0077b5]/30 text-[#70b5f9] border border-[#0077b5]/40 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Generate Headline
            </button>
          </div>

          {/* Salary Negotiation Assistant */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-green-400">
              <DollarSign className="w-5 h-5" />
              <h3 className="text-base font-bold text-white font-geist">Salary Counteroffer Coach</h3>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#c3c5d9]">Enter Base Salary Offer ($):</label>
              <input 
                type="number" 
                value={salaryOffer} 
                onChange={(e) => setSalaryOffer(e.target.value)}
                placeholder="e.g. 180000"
                className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-2 text-xs text-white mt-1"
              />
            </div>

            <button 
              onClick={handleGenerateNegotiation}
              disabled={!salaryOffer}
              className="w-full bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-700/40 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              Generate Counteroffer Script
            </button>

            {negotiationLetter && (
              <div className="bg-[#0c0e17] p-3 rounded-lg border border-green-800/40 text-xs font-mono text-[#e1e1ef] whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto">
                {negotiationLetter}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
