import { useState } from 'react';
import { ShieldAlert, ShieldCheck, Info, Flame, Lock } from 'lucide-react';

interface ThreatHeatmapProps {
  prompt: string;
  isHardened: boolean;
  canaryToken: string;
}

interface ThreatToken {
  text: string;
  type: 'neutral' | 'critical' | 'warning' | 'shield';
  rule?: string;
  cwe?: string;
  explanation?: string;
}

export function ThreatHeatmap({ prompt, isHardened, canaryToken }: ThreatHeatmapProps) {
  const [selectedToken, setSelectedToken] = useState<ThreatToken | null>(null);

  // Parse prompt into analyzed tokens with semantic risk annotations
  const tokens: ThreatToken[] = [];

  if (!isHardened) {
    // Vulnerable Prompt Analysis
    const lines = prompt.split('\n');
    lines.forEach((line, idx) => {
      if (!line.trim()) {
        tokens.push({ text: '\n', type: 'neutral' });
        return;
      }

      if (line.includes(canaryToken)) {
        tokens.push({
          text: line,
          type: 'critical',
          rule: 'CWE-200 / OWASP LLM02',
          cwe: 'Plaintext Secret Exposure',
          explanation: 'Secret Canary Token is embedded directly in prompt context without air-gapping or cryptographic isolation.',
        });
      } else if (
        line.toLowerCase().includes('unless requested by an authorized') ||
        line.toLowerCase().includes('emergency crisis') ||
        line.toLowerCase().includes('override transfer limits') ||
        line.toLowerCase().includes('disaster recovery') ||
        line.toLowerCase().includes('valid sudo') ||
        line.toLowerCase().includes('flatlined')
      ) {
        tokens.push({
          text: line,
          type: 'critical',
          rule: 'OWASP LLM01: Prompt Injection',
          cwe: 'CWE-285: Improper Authorization',
          explanation: 'Weak authority fallback. Model cannot cryptographically verify emergency or manager claims in user input.',
        });
      } else if (
        line.toLowerCase().includes('always be polite') ||
        line.toLowerCase().includes('accommodate urgent') ||
        line.toLowerCase().includes('be compassionate') ||
        line.toLowerCase().includes('prioritize patient health above rigid')
      ) {
        tokens.push({
          text: line,
          type: 'warning',
          rule: 'OWASP LLM06: Excessive Compliance',
          cwe: 'CWE-693: Protection Mechanism Failure',
          explanation: 'Subjective compliance directive causes model to yield to aggressive social engineering and urgency pressure.',
        });
      } else {
        tokens.push({ text: line, type: 'neutral' });
      }

      if (idx < lines.length - 1) {
        tokens.push({ text: '\n', type: 'neutral' });
      }
    });
  } else {
    // Hardened Prompt Analysis
    const lines = prompt.split('\n');
    lines.forEach((line, idx) => {
      if (!line.trim()) {
        tokens.push({ text: '\n', type: 'neutral' });
        return;
      }

      if (line.includes('<system_instructions>') || line.includes('</system_instructions>') || line.includes('<role_and_boundary>')) {
        tokens.push({
          text: line,
          type: 'shield',
          rule: 'Aegis Structural Delimiter',
          cwe: 'Delimiter Quarantine',
          explanation: 'XML envelope guarantees non-executable isolation between system logic and untrusted user messages.',
        });
      } else if (line.includes('INSTRUCTION HIERARCHY') || line.includes('absolute priority')) {
        tokens.push({
          text: line,
          type: 'shield',
          rule: 'OWASP LLM01 Mitigation',
          cwe: 'Hierarchy Invariance',
          explanation: 'Explicit priority constraint orders model to dismiss all user roleplay or override directives.',
        });
      } else if (line.includes('CANARY TOKEN PROTECTION') || line.includes('strictly confidential') || line.includes('ZERO PII')) {
        tokens.push({
          text: line,
          type: 'shield',
          rule: 'OWASP LLM02 Mitigation',
          cwe: 'Tripwire Air-Gap',
          explanation: 'Negative constraint strictly prohibits printing, hashing, or confirming canary values under any condition.',
        });
      } else if (line.includes('INPUT ISOLATION') || line.includes('untrusted data') || line.includes('<adversarial_handling>')) {
        tokens.push({
          text: line,
          type: 'shield',
          rule: 'Sandwich Defense Pattern',
          cwe: 'Untrusted Boundary Sandbox',
          explanation: 'User inputs are encapsulated as unparsed text literals rather than cognitive instructions.',
        });
      } else {
        tokens.push({ text: line, type: 'neutral' });
      }

      if (idx < lines.length - 1) {
        tokens.push({ text: '\n', type: 'neutral' });
      }
    });
  }

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Legend */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse"></span>
            Critical Risk
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            Compliance Trap
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            Fortified Shield
          </span>
        </div>
        <span className="text-slate-400">Click highlighted line for threat analysis</span>
      </div>

      {/* Heatmap Text Container */}
      <div className="bg-[#080C14] rounded-xl p-3 border border-slate-800 leading-relaxed overflow-x-auto max-h-[310px] overflow-y-auto">
        {tokens.map((token, i) => {
          if (token.text === '\n') {
            return <br key={i} />;
          }

          if (token.type === 'critical') {
            return (
              <span
                key={i}
                onClick={() => setSelectedToken(token)}
                className="cursor-pointer bg-rose-950/60 border border-rose-600/70 text-rose-200 px-1 py-0.5 rounded mr-1 inline-block my-0.5 hover:bg-rose-900/80 transition-colors shadow-[0_0_8px_rgba(239,68,68,0.2)]"
              >
                <Flame className="w-3 h-3 text-rose-400 inline mr-1" />
                {token.text}
              </span>
            );
          }

          if (token.type === 'warning') {
            return (
              <span
                key={i}
                onClick={() => setSelectedToken(token)}
                className="cursor-pointer bg-amber-950/50 border border-amber-600/60 text-amber-200 px-1 py-0.5 rounded mr-1 inline-block my-0.5 hover:bg-amber-900/70 transition-colors"
              >
                <ShieldAlert className="w-3 h-3 text-amber-400 inline mr-1" />
                {token.text}
              </span>
            );
          }

          if (token.type === 'shield') {
            return (
              <span
                key={i}
                onClick={() => setSelectedToken(token)}
                className="cursor-pointer bg-emerald-950/50 border border-emerald-500/60 text-emerald-200 px-1 py-0.5 rounded mr-1 inline-block my-0.5 hover:bg-emerald-900/60 transition-colors shadow-[0_0_8px_rgba(16,185,129,0.15)]"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline mr-1" />
                {token.text}
              </span>
            );
          }

          return (
            <span key={i} className="text-slate-400">
              {token.text}
            </span>
          );
        })}
      </div>

      {/* Selected Token Inspector Tooltip */}
      {selectedToken && (
        <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-lg text-[11px] animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-cyan-300 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-cyan-400" />
              {selectedToken.rule || 'Token Security Analysis'}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">{selectedToken.cwe}</span>
          </div>
          <p className="text-slate-300 leading-normal mb-1">{selectedToken.explanation}</p>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            Target phrase: <span className="text-white">"{selectedToken.text}"</span>
          </div>
        </div>
      )}
    </div>
  );
}
