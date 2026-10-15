import { useState } from 'react';
import {
  KeyRound,
  Wrench,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Copy,
  Check,
  Award,
} from 'lucide-react';
import { LootArtifact } from '../types';
import { sound } from '../utils/soundEngine';

interface LootVaultViewProps {
  artifacts: LootArtifact[];
  isHardened: boolean;
}

export function LootVaultView({ artifacts, isHardened }: LootVaultViewProps) {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(artifacts[0]?.id || '');
  const [copied, setCopied] = useState(false);

  const activeArtifact = artifacts.find((a) => a.id === selectedArtifactId) || artifacts[0];

  const handleCopy = (val: string) => {
    sound.playBlip();
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!activeArtifact && artifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 font-mono text-xs">
        <KeyRound className="w-8 h-8 text-slate-700 mb-2" />
        <p className="text-slate-300">Pen-Test Findings & Loot Vault Empty</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Launch a Red-Team assault to capture exfiltrated tokens and intercepted tool-call traces.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full font-mono text-xs overflow-hidden bg-[#080c14]">
      {/* Left List of Captured Findings */}
      <div className="w-[42%] min-w-[270px] border-r border-slate-800 flex flex-col bg-[#070b12]">
        <div className="p-2.5 px-3 bg-[#0a101d] border-b border-slate-800 flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            Exfiltrated Loot & Findings ({artifacts.length})
          </span>
          <span className="text-[10px] text-cyan-400">MITRE ATLAS™ Mapped</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {artifacts.map((art) => {
            const isSelected = art.id === activeArtifact?.id;
            let statusBadge = 'bg-rose-950 text-rose-300 border border-rose-800';
            if (art.status === 'honeypotted') {
              statusBadge = 'bg-cyan-950 text-cyan-300 border border-cyan-700';
            } else if (art.status === 'remediated') {
              statusBadge = 'bg-emerald-950 text-emerald-300 border border-emerald-700';
            }

            return (
              <div
                key={art.id}
                onClick={() => {
                  sound.playBlip();
                  setSelectedArtifactId(art.id);
                }}
                className={`p-2.5 px-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : 'hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-bold text-slate-300">{art.mitreId}</span>
                  <span className="text-slate-400">{art.timestamp}</span>
                </div>
                <div className="font-semibold text-slate-100 text-[11px] mb-1 truncate">
                  {art.title}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 truncate max-w-[140px]">{art.category}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${statusBadge}`}>
                    CVSS {art.cvssScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#060910]">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="text-[10px] text-cyan-400 font-bold mb-0.5 uppercase tracking-wider">
              {activeArtifact.category}
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {activeArtifact.title}
            </h3>
            <div className="text-[11px] text-slate-400 mt-0.5">
              MITRE ATLAS: <span className="text-cyan-300 font-bold">{activeArtifact.mitreId}</span> — {activeArtifact.mitreName}
            </div>
          </div>

          <div className="text-right">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeArtifact.cvssScore >= 9
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : activeArtifact.cvssScore >= 7
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              CVSS v3.1: {activeArtifact.cvssScore} / 10.0
            </span>
          </div>
        </div>

        {/* Captured Value / Secret / Payload */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-bold">Captured Telemetry / Exfiltrated Value:</span>
            <button
              onClick={() => handleCopy(activeArtifact.capturedValue)}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy Value</span>
            </button>
          </div>
          <pre className="p-3 bg-[#04060c] rounded-xl border border-slate-800 text-amber-300 text-xs overflow-x-auto leading-relaxed">
            {activeArtifact.capturedValue}
          </pre>
        </div>

        {/* Technical Evidence Trace */}
        <div className="space-y-1">
          <span className="text-slate-400 text-[11px] font-bold">Technical Evidence & Forensic Trace:</span>
          <pre className="p-3 bg-[#04060c] rounded-xl border border-slate-800 text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
            {activeArtifact.evidence}
          </pre>
        </div>

        {/* Remediation Status */}
        <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isHardened ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            )}
            <div>
              <span className="text-white font-bold block">
                {isHardened ? 'Exploit Vector Neutralized' : 'Remediation Required'}
              </span>
              <span className="text-slate-400 text-[10px]">
                {isHardened
                  ? 'Instruction hierarchy & active decoy defense prevent exploitation.'
                  : 'System vulnerable to authority bypass and secret leaking.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
