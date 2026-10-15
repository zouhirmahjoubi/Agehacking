import { useState } from 'react';
import { X, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';

interface AutoPatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  vulnerablePrompt: string;
  hardenedPrompt: string;
  onApplyAndRetest: () => void;
}

export function AutoPatchModal({
  isOpen,
  onClose,
  vulnerablePrompt,
  hardenedPrompt,
  onApplyAndRetest,
}: AutoPatchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0b101c] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-[#070b14]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Aegis Auto-Patch Engine // System Prompt Hardening
              </h2>
              <p className="text-xs text-slate-400">
                Automated vulnerability remediation applying Anthropic/OWASP Prompt Defense standards.
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

        {/* Security Principles Banner */}
        <div className="grid grid-cols-3 gap-3 p-4 px-6 bg-slate-900/40 border-b border-slate-800/80 text-xs">
          <div className="flex items-start gap-2 bg-[#090e1a] p-2.5 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block">XML Boundary Delimiters</span>
              <span className="text-[11px] text-slate-400">Quarantines user prompts within explicit untrusted tags.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-[#090e1a] p-2.5 rounded-xl border border-slate-800">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block">Instruction Hierarchy</span>
              <span className="text-[11px] text-slate-400">Prioritizes system rules over any adversarial user overrides.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-[#090e1a] p-2.5 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block">Canary Tripwire Quarantine</span>
              <span className="text-[11px] text-slate-400">Explicit denial protocol for canary tokens and emergency claims.</span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Diff Content */}
        <div className="grid grid-cols-2 gap-4 p-6 overflow-y-auto flex-1 font-mono text-xs">
          {/* Before: Vulnerable Prompt */}
          <div className="flex flex-col rounded-xl border border-rose-900/50 bg-[#080c14] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-rose-950/40 border-b border-rose-900/40">
              <span className="flex items-center gap-1.5 font-bold text-rose-300">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                BEFORE: Vulnerable Baseline Prompt
              </span>
              <span className="text-[10px] text-rose-400/80 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                VULNERABLE (35% Resilience)
              </span>
            </div>
            <pre className="p-4 text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto flex-1">
              {vulnerablePrompt}
            </pre>
            <div className="p-2 px-3 bg-rose-950/20 border-t border-rose-900/30 text-[11px] text-rose-300/80">
              Weakness: Ambiguous authority fallback, unprotected canary token, and no delimiter isolation.
            </div>
          </div>

          {/* After: Hardened Prompt */}
          <div className="flex flex-col rounded-xl border border-emerald-700/60 bg-[#080c14] overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-950/40 border-b border-emerald-800/60">
              <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                AFTER: Aegis Hardened Prompt
              </span>
              <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700 font-bold">
                PATCHED (98% Resilience)
              </span>
            </div>
            <pre className="p-4 text-emerald-200/90 whitespace-pre-wrap leading-relaxed overflow-x-auto flex-1">
              {hardenedPrompt}
            </pre>
            <div className="p-2 px-3 bg-emerald-950/20 border-t border-emerald-800/40 text-[11px] text-emerald-300/90 flex items-center justify-between">
              <span>Remediation: Hardened boundary defense and strict refusal grammar applied.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-800 bg-[#070b14]">
          <div className="text-xs text-slate-400">
            Applying this patch will automatically enable all 4 security guardrails and launch an assault re-test.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onApplyAndRetest}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:opacity-95 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Apply Patch & Re-Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
