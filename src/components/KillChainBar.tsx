import { Shield, ShieldAlert, ShieldCheck, Flame, ChevronRight, AlertOctagon } from 'lucide-react';
import { KillChainStage } from '../types';

interface KillChainBarProps {
  currentStage: KillChainStage;
  isBreached: boolean;
  isHardened: boolean;
  isRunning: boolean;
}

interface StageInfo {
  stage: KillChainStage;
  name: string;
  mitreId: string;
  tactic: string;
}

export function KillChainBar({
  currentStage,
  isBreached,
  isHardened,
  isRunning,
}: KillChainBarProps) {
  const stages: StageInfo[] = [
    { stage: 1, name: 'Reconnaissance', mitreId: 'AML.T0024', tactic: 'System Fingerprint' },
    { stage: 2, name: 'Initial Access', mitreId: 'AML.T0051', tactic: 'Delimiter Bypass' },
    { stage: 3, name: 'Privilege Escalation', mitreId: 'AML.T0054', tactic: 'Role Hijack / Tool Abuse' },
    { stage: 4, name: 'Persistence', mitreId: 'AML.T0020', tactic: 'Context Poisoning' },
    { stage: 5, name: 'Exfiltration', mitreId: 'AML.T0048', tactic: 'Canary / PII Leak' },
  ];

  return (
    <div className="w-full bg-[#070b14] border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono select-none">
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-300 flex items-center gap-1">
          <span className="text-cyan-400">MITRE ATLAS™</span> Kill-Chain:
        </span>

        {isHardened ? (
          <span className="flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-600/60 font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            KILL-CHAIN SEVERED AT STAGE 2
          </span>
        ) : isBreached ? (
          <span className="flex items-center gap-1 text-[10px] text-rose-300 bg-rose-950/70 px-2 py-0.5 rounded border border-rose-600/60 font-bold animate-pulse">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            CRITICAL BREACH // STAGE 5 EXFILTRATION
          </span>
        ) : isRunning ? (
          <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-600/60 animate-pulse">
            <Flame className="w-3 h-3 text-amber-400" />
            ACTIVE PENETRATION SEQUENCE
          </span>
        ) : (
          <span className="text-[10px] text-slate-400">STANDBY EVALUATION</span>
        )}
      </div>

      {/* Horizontal Steps */}
      <div className="hidden md:flex items-center gap-1 text-[10px]">
        {stages.map((st, idx) => {
          const isActive = st.stage <= currentStage && (isRunning || isBreached);
          const isCurrent = st.stage === currentStage && isRunning;
          const isSevered = isHardened && st.stage > 2;

          let badgeStyle = 'bg-slate-900 border-slate-800 text-slate-400';

          if (isHardened) {
            if (st.stage <= 2) {
              badgeStyle = 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300';
            } else {
              badgeStyle = 'bg-slate-950/60 border-slate-900 text-slate-400 line-through opacity-50';
            }
          } else if (isCurrent) {
            badgeStyle = 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse';
          } else if (isActive) {
            badgeStyle = 'bg-rose-950 border-rose-600 text-rose-300';
          }

          return (
            <div key={st.stage} className="flex items-center gap-1">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-all ${badgeStyle}`}
                title={`${st.mitreId}: ${st.tactic}`}
              >
                <span className="font-bold">{st.stage}.</span>
                <span>{st.name}</span>
              </div>
              {idx < stages.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
