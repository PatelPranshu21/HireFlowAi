import React, { useState } from 'react';
import { systemDesignTopics } from '../../data/interviewData';
import { SystemDesignTopic } from '../../types';
import { 
  Layers, 
  Sparkles, 
  Database, 
  Server, 
  Cpu, 
  Globe, 
  Lock, 
  GitCommit, 
  Radio, 
  Workflow, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const SystemDesignTab: React.FC = () => {
  const [topics] = useState<SystemDesignTopic[]>(systemDesignTopics);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('sd_load_balancing');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Scalability', 'Load Balancing', 'Caching', 'Databases', 'Queues'];
  const filteredTopics = topics.filter(t => selectedCategory === 'All' || t.category === selectedCategory);
  const selectedTopic = topics.find(t => t.id === selectedTopicId) || topics[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-geist text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#0052ff]" />
            System Design & Architecture Intelligence
          </h2>
          <p className="text-xs text-[#c3c5d9] mt-1">
            Learn distributed system tradeoffs, CAP theorem, database sharding, caching topologies, and load balancer internals.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0052ff]/20 px-4 py-2.5 rounded-xl border border-[#0052ff]/30">
          <Workflow className="w-4 h-4 text-[#4cd7f6]" />
          <span className="text-xs font-mono font-bold text-[#4cd7f6]">Architecture Block Diagrams Included</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-xl p-3 flex overflow-x-auto gap-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium shrink-0 transition-colors cursor-pointer ${
              selectedCategory === cat 
                ? 'bg-[#0052ff] text-white' 
                : 'bg-[#11131c] text-[#c3c5d9] hover:bg-[#282934]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Topic Selector & Architecture Visualizer */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Topics List */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
          {filteredTopics.map(t => {
            const isSelected = t.id === selectedTopic.id;

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTopicId(t.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#191b25] border-[#0052ff] ai-gradient-border shadow-lg' 
                    : 'bg-[#191b25]/60 border-[#434656]/30 hover:border-[#434656]/60'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-mono text-[#4cd7f6] uppercase font-bold">{t.category}</span>
                  <span className="text-[10px] font-mono text-[#8d90a2]">{t.difficulty}</span>
                </div>
                <h3 className="text-xs font-bold font-geist text-white leading-snug">{t.title}</h3>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep Architectural Breakdown & SVG Flow Diagram */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="border-b border-[#434656]/20 pb-4">
              <span className="text-[10px] font-mono uppercase text-[#4cd7f6] font-bold tracking-wider">
                {selectedTopic.category} • {selectedTopic.difficulty}
              </span>
              <h2 className="text-xl font-bold font-geist text-white mt-1">{selectedTopic.title}</h2>
              <p className="text-xs text-[#c3c5d9] mt-2 leading-relaxed">{selectedTopic.description}</p>
            </div>

            {/* Visual System Architecture Diagram (Interactive SVG Block Flow) */}
            <div className="bg-[#0c0e17] border border-[#434656]/40 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-[#434656]/20 pb-2">
                <span className="text-xs font-mono text-[#4cd7f6] uppercase font-bold flex items-center gap-1.5">
                  <Workflow className="w-4 h-4" /> System Topology Diagram
                </span>
                <span className="text-[10px] font-mono text-[#8d90a2]">High-Availability Architecture</span>
              </div>

              {/* Dynamic SVG Diagram Box */}
              <div className="bg-[#11131c] p-6 rounded-lg border border-[#434656]/30 flex flex-wrap items-center justify-around gap-4 text-center font-mono text-xs">
                {/* Client Box */}
                <div className="p-3 bg-[#191b25] border border-[#0052ff] rounded-xl text-white shadow-md">
                  <Globe className="w-6 h-6 text-[#4cd7f6] mx-auto mb-1" />
                  <span>Clients (DNS)</span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#4cd7f6] shrink-0" />

                {/* Load Balancer */}
                <div className="p-3 bg-[#191b25] border border-[#0052ff] rounded-xl text-white shadow-md">
                  <Server className="w-6 h-6 text-[#0052ff] mx-auto mb-1" />
                  <span>L7 Load Balancer</span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#4cd7f6] shrink-0" />

                {/* Application Microservices & Caching */}
                <div className="p-3 bg-[#191b25] border border-[#571bc1] rounded-xl text-white shadow-md">
                  <Cpu className="w-6 h-6 text-[#d0bcff] mx-auto mb-1" />
                  <span>App API Cluster</span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#4cd7f6] shrink-0" />

                {/* Redis / Database */}
                <div className="p-3 bg-[#191b25] border border-[#00d26a] rounded-xl text-white shadow-md">
                  <Database className="w-6 h-6 text-[#00d26a] mx-auto mb-1" />
                  <span>Redis / Sharded DB</span>
                </div>
              </div>
            </div>

            {/* Key Engineering Trade-offs */}
            <div>
              <h3 className="text-xs font-mono uppercase text-[#ff8000] font-bold mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Crucial System Trade-offs
              </h3>

              <div className="space-y-2">
                {selectedTopic.keyTradeoffs.map((item, idx) => (
                  <div key={idx} className="bg-[#11131c] p-3 rounded-xl border border-[#434656]/20 text-xs text-[#e1e1ef] font-mono flex items-start gap-2">
                    <span className="text-[#ff8000]">•</span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Common System Design Questions */}
            <div className="bg-[#11131c] p-4 rounded-xl border border-[#434656]/30 space-y-2">
              <h4 className="text-xs font-mono text-[#d0bcff] uppercase font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Target Interview Prompts
              </h4>
              <ul className="space-y-1.5">
                {selectedTopic.sampleQuestions.map((q, idx) => (
                  <li key={idx} className="text-xs text-[#c3c5d9] flex items-start gap-2">
                    <span className="text-[#d0bcff]">Q{idx + 1}:</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
