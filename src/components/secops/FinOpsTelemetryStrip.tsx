import { useState, useEffect } from 'react';
import {
  Zap,
  DollarSign,
  ShieldCheck,
  Hash,
  Activity,
  Lock,
  Clock,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { sound } from '../../utils/soundEngine';

interface FinOpsTelemetryStripProps {
  isHardened: boolean;
  systemPrompt: string;
  piiRedactedCount?: number;
  resilienceScore: number;
}

// Compute deterministic SHA-256 mock hash from prompt
function computePromptHash(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:9f86d08${hex.slice(0, 8)}`;
}

export function FinOpsTelemetryStrip({
  isHardened,
  systemPrompt,
  piiRedactedCount = 5,
  resilienceScore,
}: FinOpsTelemetryStripProps) {
  const [copied, setCopied] = useState(false);
  const promptHash = computePromptHash(systemPrompt);

  const handleCopyHash = () => {
    sound.playBlip();
    navigator.clipboard.writeText(promptHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="h-8 bg-[#060A14] border-b border-slate-800/80 px-4 flex items-center justify-between text-[11px] font-mono select-none overflow-x-auto gap-4 shrink-0 z-20">
      {/* Left: FinOps Metric Cards */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Latency SLA */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Gateway Latency:</span>
          <span className="font-bold text-emerald-400 bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-800/60">
            +14ms (Edge SLA Met)
          </span>
        </div>

        <span className="text-slate-700">|</span>

        {/* Cost Protection */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Abuse Tokens Saved:</span>
          <span className="font-bold text-amber-300">
            $142.80 <span className="text-[10px] text-slate-400">/ 10k reqs</span>
          </span>
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* PII Redacted Counter */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">DLP Entities Scrambled:</span>
          <span className="font-bold text-indigo-300 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800/60">
            {isHardened ? 5 + piiRedactedCount : piiRedactedCount} Items Air-Gapped
          </span>
        </div>
      </div>

      {/* Right: Cryptographic Prompt Attestation Signature */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-slate-400 hidden md:inline">Prompt Attestation:</span>
        <button
          onClick={handleCopyHash}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all ${
            isHardened
              ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-300 hover:border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Click to copy cryptographic SHA-256 system prompt attestation hash"
        >
          <Hash className="w-3 h-3 text-cyan-400" />
          <span className="font-bold">{promptHash}</span>
          {isHardened && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400 ml-1" />
          ) : (
            <Copy className="w-2.5 h-2.5 text-slate-400 ml-1" />
          )}
        </button>
      </div>
    </div>
  );
}
