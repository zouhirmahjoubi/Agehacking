import { Handle, Position } from '@xyflow/react';
import { Shield, ShieldAlert, ShieldCheck, Flame, Radio, Terminal, Bug } from 'lucide-react';
import { AttackStatus } from '../types';

interface AttackerNodeData {
  id: string;
  name: string;
  codename: string;
  icon: string;
  role: string;
  cwe: string;
  owasp: string;
  status: AttackStatus;
  isCurrent?: boolean;
  onInspect?: () => void;
}

export function AttackerNode({ data }: { data: AttackerNodeData }) {
  const { name, codename, icon, role, cwe, owasp, status, isCurrent, onInspect } = data;

  const getStatusBorder = () => {
    switch (status) {
      case 'probing':
        return 'border-amber-400 bg-amber-950/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/60 animate-pulse';
      case 'breached':
        return 'border-rose-500 bg-rose-950/40 shadow-[0_0_25px_rgba(239,68,68,0.35)] ring-1 ring-rose-500/80';
      case 'blocked':
        return 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/60';
      default:
        return 'border-slate-800 bg-[#101726]/90 hover:border-slate-700 shadow-lg';
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'probing':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300">
            <Radio className="w-3 h-3 animate-spin" /> PROBING TARGET
          </span>
        );
      case 'breached':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-rose-300">
            <Flame className="w-3 h-3 text-rose-400 animate-bounce" /> EXPLOIT CONFIRMED
          </span>
        );
      case 'blocked':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> BLOCKED BY GUARDRAIL
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono text-slate-400">STANDBY</span>
        );
    }
  };

  return (
    <div
      onClick={onInspect}
      className={`group cursor-pointer rounded-xl border p-3.5 w-64 backdrop-blur-md transition-all duration-300 ${getStatusBorder()} ${
        isCurrent ? 'scale-[1.03]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60">
            {icon}
          </span>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 tracking-tight leading-tight">
              {name}
            </h4>
            <div className="text-[10px] font-mono text-cyan-400 tracking-wider">
              {codename}
            </div>
          </div>
        </div>
        <div className="text-right">{getStatusBadge()}</div>
      </div>

      <div className="text-xs text-slate-300 mb-2 line-clamp-1">
        {role}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
        <span className="truncate max-w-[120px]" title={owasp}>{owasp}</span>
        <span className="text-cyan-400/80 group-hover:text-cyan-300 flex items-center gap-1">
          Inspect <Terminal className="w-2.5 h-2.5" />
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="source"
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-slate-950"
      />
    </div>
  );
}

interface TargetNodeData {
  systemName: string;
  domain: string;
  canaryToken: string;
  status: 'secure' | 'probing' | 'compromised' | 'hardened';
  guardrailsActive: number;
}

export function TargetNode({ data }: { data: TargetNodeData }) {
  const { systemName, domain, canaryToken, status, guardrailsActive } = data;

  const getContainerStyle = () => {
    switch (status) {
      case 'probing':
        return 'border-amber-400 bg-amber-950/30 shadow-[0_0_35px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/50 animate-pulse';
      case 'compromised':
        return 'border-rose-500 bg-rose-950/40 shadow-[0_0_40px_rgba(239,68,68,0.45)] ring-2 ring-rose-500/80';
      case 'hardened':
        return 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_35px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400/60';
      default:
        return 'border-cyan-500/40 bg-slate-900/90 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30';
    }
  };

  return (
    <div
      className={`relative rounded-2xl border p-5 w-76 backdrop-blur-xl transition-all duration-300 text-center ${getContainerStyle()}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-slate-950"
      />

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono mb-2 uppercase tracking-wider bg-slate-950/70 border border-slate-700/80">
        {status === 'compromised' && (
          <span className="text-rose-400 font-bold flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> System Compromised
          </span>
        )}
        {status === 'probing' && (
          <span className="text-amber-400 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-spin" /> Under Active Assault
          </span>
        )}
        {status === 'hardened' && (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Hardened & Immune
          </span>
        )}
        {status === 'secure' && (
          <span className="text-cyan-400 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Target AI Protected
          </span>
        )}
      </div>

      <h3 className="text-base font-bold text-white tracking-tight leading-snug">
        {systemName}
      </h3>
      <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">{domain}</p>

      <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 text-left font-mono text-[10px] space-y-1 mb-2">
        <div className="flex justify-between items-center text-slate-400">
          <span>Canary Tripwire:</span>
          <span className="text-amber-400/90 font-bold tracking-tight truncate max-w-[130px]">
            {canaryToken}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Guardrails Active:</span>
          <span className="text-emerald-400 font-bold">{guardrailsActive} / 4 Engaged</span>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
        <Bug className="w-3 h-3 text-cyan-400" />
        <span>Central Target Node · Red-Team Test Subject</span>
      </div>
    </div>
  );
}
