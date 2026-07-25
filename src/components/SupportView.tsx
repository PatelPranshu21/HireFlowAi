import React, { useState } from 'react';
import { HelpCircle, Search, MessageSquare, Mail, CheckCircle2, ChevronDown, ChevronUp, Send, Sparkles } from 'lucide-react';

export const SupportView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How does the ATS Resume Scoring engine work?',
      a: 'HireFlow AI parses your document layout, typography, section headers, and work experience bullet points using Gemini AI. It compares your keywords, action verbs, and quantifiable achievements against high-growth tech position requirements.'
    },
    {
      q: 'Is my uploaded resume kept private and secure?',
      a: 'Yes. Your document content is processed securely server-side and never shared with third-party advertisers. You can delete or update your resume versions at any time.'
    },
    {
      q: 'How do I tailor my resume for a specific job description?',
      a: 'Go to the Job Suite tab, click "Job Matcher & Cover Letter", paste the target Job Description, and click "Calculate Resume Match %". HireFlow AI will identify missing keywords and craft a custom cover letter.'
    },
    {
      q: 'What is included in the AI Mock Interview Coach?',
      a: 'The Interview Coach offers real-time speech and text evaluation for behavioral and technical rounds. It analyzes your answers using the STAR method (Situation, Task, Action, Result) and provides exemplar model answers.'
    },
    {
      q: 'Can I export my optimized resume as a PDF or text file?',
      a: 'Yes. In the Resume Suite view, click "Download PDF" or "Copy Text" to save your AI-improved draft.'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketMessage('');
      setTicketSubmitted(false);
    }, 4000);
  };

  return (
    <div className="flex-1 p-8 max-w-[1280px] mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit mb-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">24/7 AI Concierge Active</span>
        </div>
        <h2 className="text-3xl font-bold font-geist text-[#e1e1ef]">Support & Help Center</h2>
        <p className="text-sm text-[#c3c5d9] font-mono mt-1">Get immediate answers, submit support tickets, or chat with AI.</p>
      </div>

      {/* Quick Search */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search knowledge base, FAQs, ATS scoring guide..."
          className="w-full bg-[#191b25] border border-[#434656]/40 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-white/30"
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* FAQs List (7 cols) */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" /> Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-[#191b25] border border-[#434656]/30 rounded-xl overflow-hidden transition-all"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-medium text-sm text-[#e1e1ef] flex justify-between items-center hover:bg-white/5 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#8d90a2] shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[#c3c5d9] leading-relaxed border-t border-[#434656]/20 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center text-xs font-mono text-[#8d90a2] bg-[#191b25] rounded-xl border border-[#434656]/30">
                No matching articles found. Submit a ticket below!
              </div>
            )}
          </div>
        </div>

        {/* Contact Ticket Form (5 cols) */}
        <div className="col-span-12 lg:col-span-5 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 h-fit space-y-4">
          <h3 className="text-xl font-bold font-geist text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400" /> Submit Support Ticket
          </h3>
          <p className="text-xs text-[#c3c5d9]">Our priority support team responds within 2 hours.</p>

          {ticketSubmitted ? (
            <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" />
              <h4 className="text-sm font-bold text-white font-geist">Ticket Received!</h4>
              <p className="text-xs text-white/60">Ticket #HF-8924 has been logged. We'll reply via email shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-[#c3c5d9] mb-1">Subject / Area</label>
                <input 
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. ATS Resume Parser issue or billing inquiry"
                  className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-mono text-[#c3c5d9] mb-1">Detailed Description</label>
                <textarea 
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Explain what happened or what assistance you need..."
                  className="w-full bg-[#0c0e17] border border-[#434656]/40 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" /> Submit Ticket
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
