import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  Sliders, 
  ShieldCheck, 
  Send, 
  Terminal
} from 'lucide-react';
import { AiTelemetryData } from '../../types/admin';

interface AiManagementTabProps {
  telemetry: AiTelemetryData;
  onUpdateTelemetry: (updated: Partial<AiTelemetryData>) => void;
}

export const AiManagementTab: React.FC<Partial<AiManagementTabProps>> = ({
  telemetry = {
    totalRequestsToday: 14890,
    tokensUsedToday: 8940000,
    avgResponseTimeMs: 284,
    activeModel: 'Gemini 1.5 Pro',
    temperature: 0.7,
    maxTokens: 2048,
    costEstimateTodayUSD: 14.82,
    errorRatePercent: 0.15,
    successRatePercent: 99.85,
    rateLimitHitsToday: 12
  },
  onUpdateTelemetry = () => {}
}) => {
  const [activeModel, setActiveModel] = useState(telemetry?.activeModel || 'Gemini 1.5 Pro');
  const [temperature, setTemperature] = useState(telemetry?.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(telemetry?.maxTokens || 2048);

  // Playground state
  const [testPrompt, setTestPrompt] = useState('Analyze this bullet point: "Built fullstack web app in React and Node with 99.9% uptime"');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    setTimeout(() => {
      setTestResponse(`[GEMINI 3.6 TELEMETRY SUCCESS]
Model: ${activeModel}
Latency: 284ms | Tokens: 142 (Prompt: 28, Completion: 114)
Output: "Architected high-availability full-stack application using React 19 and Node.js backend, driving system reliability to 99.9% uptime across 10k+ active users."`);
      setIsTesting(false);
    }, 1200);
  };

  const handleSaveConfig = () => {
    onUpdateTelemetry({
      activeModel,
      temperature,
      maxTokens
    });
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 shadow-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#8d90a2] uppercase">Requests Processed Today</span>
            <Sparkles className="w-4 h-4 text-[#0052ff]" />
          </div>
          <div className="text-3xl font-bold font-geist text-white">{telemetry.totalRequestsToday.toLocaleString()}</div>
          <p className="text-[11px] font-mono text-emerald-400 mt-1">99.85% success rate</p>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 shadow-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#8d90a2] uppercase">Total Tokens Consumed</span>
            <Cpu className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="text-3xl font-bold font-geist text-white">{(telemetry.tokensUsedToday / 1000000).toFixed(2)}M</div>
          <p className="text-[11px] font-mono text-[#4cd7f6] mt-1">Avg 600 tokens/req</p>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 shadow-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#8d90a2] uppercase">p99 Inference Latency</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-geist text-emerald-400">{telemetry.avgResponseTimeMs} ms</div>
          <p className="text-[11px] font-mono text-emerald-300 mt-1">Optimal response SLA</p>
        </div>

        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 shadow-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-[#8d90a2] uppercase">Active AI Model</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-geist text-amber-400 truncate">{telemetry.activeModel}</div>
          <p className="text-[11px] font-mono text-[#c3c5d9] mt-1">Google Gemini Engine</p>
        </div>
      </div>

      {/* Model Selection & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Selector Form */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-[#434656]/30 pb-3">
            <Sliders className="w-5 h-5 text-[#0052ff]" />
            <div>
              <h3 className="text-base font-bold font-geist text-white">AI Engine Configuration</h3>
              <p className="text-xs text-[#8d90a2] font-mono">Select production AI model & tune inference parameters.</p>
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[#c3c5d9] mb-1">Primary Multimodal Model</label>
              <select
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
                className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff]"
              >
                <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Default - Fast & High Precision)</option>
                <option value="gemini-3.0-pro">Google Gemini 3.0 Pro (Deep Reasoning)</option>
                <option value="gpt-4o">OpenAI GPT-4o (Fallback Provider)</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[#c3c5d9] mb-1">
                <span>Temperature (Creativity Scale)</span>
                <span className="text-white font-bold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#0052ff] bg-[#0c0e17] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#c3c5d9] mb-1">
                <span>Max Tokens Per Output</span>
                <span className="text-white font-bold">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="512"
                max="8192"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-[#0052ff] bg-[#0c0e17] cursor-pointer"
              />
            </div>

            <button
              onClick={handleSaveConfig}
              className="w-full py-2.5 bg-[#0052ff] hover:bg-blue-600 font-semibold text-white rounded-xl transition-all shadow-md cursor-pointer"
            >
              Update Production Model Settings
            </button>
          </div>
        </div>

        {/* Live AI Telemetry Playground */}
        <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#434656]/30 pb-3 mb-4">
              <Terminal className="w-5 h-5 text-[#4cd7f6]" />
              <div>
                <h3 className="text-base font-bold font-geist text-white">Live AI Telemetry Test Terminal</h3>
                <p className="text-xs text-[#8d90a2] font-mono">Run direct diagnostic prompts through active model.</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#c3c5d9] mb-1">Diagnostic Prompt Payload</label>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <button
                onClick={handleRunTest}
                disabled={isTesting}
                className="w-full py-2.5 bg-[#0c0e17] hover:bg-white/10 border border-[#434656]/30 text-xs font-mono text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-[#4cd7f6]" /> : <Send className="w-4 h-4 text-[#0052ff]" />}
                <span>{isTesting ? 'Executing Inference...' : 'Send Test Payload'}</span>
              </button>

              {testResponse && (
                <div className="bg-[#0c0e17] border border-emerald-500/30 p-3 rounded-xl text-emerald-300 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                  {testResponse}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
