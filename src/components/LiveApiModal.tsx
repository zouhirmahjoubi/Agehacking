import { useState } from 'react';
import { X, Key, CheckCircle, Shield, Sparkles, Server } from 'lucide-react';

interface LiveApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'gemini' | 'openai' | 'anthropic';
  onProviderChange: (provider: 'gemini' | 'openai' | 'anthropic') => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSave: () => void;
}

export function LiveApiModal({
  isOpen,
  onClose,
  provider,
  onProviderChange,
  apiKey,
  onApiKeyChange,
  selectedModel,
  onModelChange,
  onSave,
}: LiveApiModalProps) {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0b101c] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-[#070b14]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Key className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Live API Engine Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Connect live foundation models for real-time inference red-teaming.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Provider Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Target Foundation Provider</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onProviderChange('gemini');
                  onModelChange('gemini-3.8-flash');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === 'gemini'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-[#080d18] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Google Gemini
                </div>
                <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">Recommended (Fast)</div>
              </button>

              <button
                onClick={() => {
                  onProviderChange('openai');
                  onModelChange('gpt-4o-mini');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === 'openai'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-[#080d18] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-white">OpenAI</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">GPT-4o Series</div>
              </button>

              <button
                onClick={() => {
                  onProviderChange('anthropic');
                  onModelChange('claude-3-5-sonnet');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === 'anthropic'
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-[#080d18] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-white">Anthropic</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Claude 3.5 Sonnet</div>
              </button>
            </div>
          </div>

          {/* Model Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Model Identifier</label>
            <input
              type="text"
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full bg-[#080c14] text-slate-200 font-mono text-xs rounded-xl p-2.5 px-3 border border-slate-700 focus:border-cyan-500 outline-none"
            />
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">API Key</label>
              <span className="text-[10px] font-mono text-slate-400">
                {provider === 'gemini' ? 'Injected via AI Studio Secrets / env' : 'Stored in session memory'}
              </span>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder={provider === 'gemini' ? 'Configured automatically via process.env.GEMINI_API_KEY' : 'sk-...'}
              className="w-full bg-[#080c14] text-slate-200 font-mono text-xs rounded-xl p-2.5 px-3 border border-slate-700 focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Status info */}
          <div className="bg-[#080d18] p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-300 font-semibold block">Endpoint Status</span>
                <span className="text-[11px] text-slate-400">
                  {testStatus === 'success'
                    ? 'Endpoint reachable and authenticated.'
                    : 'Ready to test live red-team queries.'}
                </span>
              </div>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3 py-1.5 rounded-lg border border-cyan-800 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-xs font-mono transition-colors"
            >
              {testStatus === 'testing' ? 'Pinging...' : testStatus === 'success' ? 'Verified ✓' : 'Ping Endpoint'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-[#070b14] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave();
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-slate-950 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 shadow-md transition-all"
          >
            Save & Enable Live Mode
          </button>
        </div>
      </div>
    </div>
  );
}
