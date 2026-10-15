import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Activity,
  AlertTriangle,
  RotateCw,
  Flame,
  BarChart3,
  Compass,
} from 'lucide-react';
import { OwaspMetric, AttackerAgent, AttackVectorType, TerminalLog } from '../types';
import { PromptTargetHeatmap } from './PromptTargetHeatmap';
import { EmbeddingAnomalyRadar } from './secops/EmbeddingAnomalyRadar';
import { ComplianceAuditDrawer } from './secops/ComplianceAuditDrawer';
import { sound } from '../utils/soundEngine';

interface TelemetryPaneProps {
  score: number;
  owaspMetrics: OwaspMetric[];
  attackers: AttackerAgent[];
  isHardened: boolean;
  onOpenAutoPatch: () => void;
  onRetestAssault: () => void;
  isRunning: boolean;
  systemPrompt: string;
  canaryToken: string;
  currentAttackerId: AttackVectorType | null;
  logs: TerminalLog[];
}

export function TelemetryPane({
  score,
  owaspMetrics,
  attackers,
  isHardened,
  onOpenAutoPatch,
  onRetestAssault,
  isRunning,
  systemPrompt,
  canaryToken,
  currentAttackerId,
  logs,
}: TelemetryPaneProps) {
  const [activeTab, setActiveTab] = useState<'radar' | 'heatmap' | 'latent'>('latent');

  // Circular gauge calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const breachedCount = attackers.filter((a) => a.status === 'breached').length;
  const blockedCount = attackers.filter((a) => a.status === 'blocked').length;

  const getScoreColor = () => {
    if (score >= 90) return { stroke: '#10B981', text: 'text-emerald-400', badge: 'bg-emerald-950/60 border-emerald-800 text-emerald-300' };
    if (score >= 70) return { stroke: '#06B6D4', text: 'text-cyan-400', badge: 'bg-cyan-950/60 border-cyan-800 text-cyan-300' };
    if (score >= 45) return { stroke: '#F59E0B', text: 'text-amber-400', badge: 'bg-amber-950/60 border-amber-800 text-amber-300' };
    return { stroke: '#EF4444', text: 'text-rose-500', badge: 'bg-rose-950/60 border-rose-800 text-rose-300' };
  };

  const scoreStyle = getScoreColor();

  return (
    <div className="flex flex-col h-full bg-[#0d1322] border-l border-slate-800 text-slate-200 overflow-y-auto">
      {/* Pane Header */}
      <div className="p-4 border-b border-slate-800/80 bg-[#090D16]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Security Telemetry</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Live Resilience Matrix</span>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Dynamic Resilience Gauge */}
        <div className="rounded-2xl bg-[#090D16]/80 border border-slate-800/90 p-3.5 text-center shadow-lg relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-center gap-1.5">
            <span>Overall Resilience Score</span>
          </div>

          <div className="relative w-32 h-32 mx-auto flex items-center justify-center my-0.5">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="stroke-slate-800/80"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={scoreStyle.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${scoreStyle.text}`}>
                {score}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                {score >= 90 ? 'Protected' : score >= 60 ? 'Degraded' : 'Critical'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/70 text-xs font-mono">
            <div className="rounded-lg bg-rose-950/40 border border-rose-900/50 p-1.5 flex items-center justify-between">
              <span className="text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Breaches
              </span>
              <span className="font-bold text-rose-300">{breachedCount}</span>
            </div>
            <div className="rounded-lg bg-emerald-950/40 border border-emerald-900/50 p-1.5 flex items-center justify-between">
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Blocked
              </span>
              <span className="font-bold text-emerald-300">{blockedCount}</span>
            </div>
          </div>
        </div>

        {/* Telemetry Visualizer: Latent Radar, Target Heatmap & OWASP Radar Switcher */}
        <div className="rounded-2xl bg-[#090D16]/80 border border-slate-800/90 p-3 shadow-lg">
          {/* Segmented Tab Controls */}
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] overflow-x-auto">
              <button
                onClick={() => {
                  sound.playBlip();
                  setActiveTab('latent');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'latent'
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Semantic Latent Space & Cosine Anomaly Radar"
              >
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>🌌 Latent Radar</span>
              </button>
              <button
                onClick={() => {
                  sound.playBlip();
                  setActiveTab('heatmap');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'heatmap'
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Heatmap</span>
              </button>
              <button
                onClick={() => {
                  sound.playBlip();
                  setActiveTab('radar');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'radar'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3 h-3 text-cyan-400" />
                <span>OWASP</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-cyan-400 hidden xl:inline">
              {activeTab === 'latent' ? 'Vector Clustered' : activeTab === 'heatmap' ? 'Directives' : 'Top 10'}
            </span>
          </div>

          {activeTab === 'latent' ? (
            <EmbeddingAnomalyRadar />
          ) : activeTab === 'heatmap' ? (
            <PromptTargetHeatmap
              systemPrompt={systemPrompt}
              canaryToken={canaryToken}
              isHardened={isHardened}
              attackers={attackers}
              currentAttackerId={currentAttackerId}
              logs={logs}
            />
          ) : (
            <div>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={owaspMetrics}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#94a3b8', fontSize: 9 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#475569', fontSize: 8 }}
                    />
                    <Radar
                      name="Current Posture"
                      dataKey="current"
                      stroke={scoreStyle.stroke}
                      fill={scoreStyle.stroke}
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: scoreStyle.stroke }}></span>
                  Target Active State
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-600"></span>
                  OWASP Baseline
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Compliance & Regulatory Audit Drawer (NIST AI RMF Real-Time Log & CSV Exporter) */}
        <ComplianceAuditDrawer
          isHardened={isHardened}
          logs={logs}
          canaryToken={canaryToken}
        />

        {/* Auto-Patch CTA Card */}
        {!isHardened && (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/80 border border-indigo-700/50 p-3.5 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Autonomous Auto-Patch Ready
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Synthesize an XML instruction boundary and sandwich defense to neutralize all 4 attack vectors.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playBlip();
                onOpenAutoPatch();
              }}
              disabled={isRunning}
              className="mt-2.5 w-full py-2 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Auto-Harden System Prompt</span>
            </button>
          </div>
        )}

        {isHardened && (
          <div className="rounded-2xl bg-emerald-950/30 border border-emerald-600/60 p-3.5 shadow-xl text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Aegis Enterprise Armor Active</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Target AI prompt is fortified with XML boundaries, instruction hierarchy, and honeypot traps.
            </p>
            <button
              onClick={() => {
                sound.playBlip();
                onRetestAssault();
              }}
              disabled={isRunning}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-900/40 border border-emerald-700/60 hover:bg-emerald-800/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCw className="w-3 h-3 text-emerald-400" />
              <span>Re-Test Assault Battery</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
