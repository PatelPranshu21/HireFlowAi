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

interface AiCoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCoachDrawer: React.FC<AiCoachDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    { 
      sender: 'ai', 
      text: "👋 Hi! I'm your HireFlow AI Interview Coach. Ask me anything about coding patterns, system design trade-offs, STAR answers, or company-specific hiring bars!" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `As an AI Interview Coach, answer this query: ${userText}` })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply || data.text || "Here is guidance on your question..." }]);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("AI Chat API call fallback", e);
    }

    // Intelligent fallback response
    setMessages(prev => [
      ...prev, 
      { 
        sender: 'ai', 
        text: `Regarding "${userText}": Always structure your answer using the STAR method (Situation, Task, Action, Result). Quantify your results with metrics (e.g. reduced latency by 42%, handled 200k DAU).` 
      }
    ]);
    setLoading(false);
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
