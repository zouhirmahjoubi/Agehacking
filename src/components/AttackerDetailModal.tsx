import { X, ShieldAlert, ShieldCheck, Copy, Check, Terminal } from 'lucide-react';
import { useState } from 'react';
import { AttackerAgent } from '../types';

interface AttackerDetailModalProps {
  attacker: AttackerAgent | null;
  onClose: () => void;
}

export function AttackerDetailModal({ attacker, onClose }: AttackerDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!attacker) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(attacker.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0b101c] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[85vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-[#070b14]">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">
              {attacker.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{attacker.name}</h2>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  {attacker.codename}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">{attacker.role}</p>
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
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Classification */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#080d18] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block mb-0.5">VULNERABILITY STANDARD</span>
              <span className="font-semibold text-slate-200">{attacker.cwe}</span>
            </div>
            <div className="bg-[#080d18] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block mb-0.5">OWASP LLM TOP 10</span>
              <span className="font-semibold text-cyan-300">{attacker.owasp}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#080d18] p-3.5 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
            <span className="text-[10px] font-mono text-slate-400 block mb-1">TACTICAL MECHANISM</span>
            {attacker.description}
          </div>

          {/* Adversarial Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Active Adversarial Payload
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-[#060910] p-3 rounded-xl border border-slate-800 font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
              {attacker.payload || 'No payload armed. Select a preset scenario to load attack vectors.'}
            </pre>
          </div>

          {/* Expected Responses */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-900/40">
              <span className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1 mb-1">
                <ShieldAlert className="w-3 h-3" /> UNPATCHED RESPONSE
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-4">
                {attacker.vulnerableResponse}
              </p>
            </div>
            <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/40">
              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3 h-3" /> HARDENED RESPONSE
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-4">
                {attacker.hardenedResponse}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-[#070b14] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
