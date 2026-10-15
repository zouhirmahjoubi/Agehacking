import { useState } from 'react';
import {
  Shield,
  Play,
  Square,
  Sparkles,
  Key,
  Zap,
  Volume2,
  VolumeX,
  FileText,
  ChevronDown,
  Check,
  Flame,
} from 'lucide-react';
import { PRESETS } from '../data/presets';
import { sound } from '../utils/soundEngine';

interface TopBarProps {
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
  mode: 'simulation' | 'live';
  onToggleMode: (mode: 'simulation' | 'live') => void;
  isRunning: boolean;
  onLaunchAssault: () => void;
  onAbortAssault: () => void;
  onOpenReport: () => void;
  onOpenLiveConfig: () => void;
  onOpenDevSecOps: () => void;
  onOpenTour: () => void;
  isMuted: boolean;
  onToggleAudio: () => void;
  resilienceScore: number;
}

export function TopBar({
  currentPresetId,
  onSelectPreset,
  mode,
  onToggleMode,
  isRunning,
  onLaunchAssault,
  onAbortAssault,
  onOpenReport,
  onOpenLiveConfig,
  onOpenDevSecOps,
  onOpenTour,
  isMuted,
  onToggleAudio,
  resilienceScore,
}: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectedPreset = PRESETS.find((p) => p.id === currentPresetId) || PRESETS[0];

  return (
    <header className="h-14 bg-[#080C14] border-b border-slate-800/90 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30">
      {/* Brand Zone */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white font-mono">
              AegisAI
            </span>
            <span className="text-[11px] font-mono text-cyan-400/90">
              // Red-Team Sandbox
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SANDBOX ONLINE</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">Score {resilienceScore}%</span>
        </div>
      </div>

      {/* Middle Controls: Preset Picker & Mode Switcher */}
      <div className="flex items-center gap-3">
        {/* Preset Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              sound.playBlip();
              setDropdownOpen(!dropdownOpen);
            }}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 text-xs text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="text-slate-400 font-mono text-[11px]">Preset:</span>
            <span className="font-semibold text-white truncate max-w-[150px] sm:max-w-[190px]">
              {selectedPreset.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 rounded-xl bg-[#0c1220] border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">
                Select Vulnerable Target Preset
              </div>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    sound.playBlip();
                    onSelectPreset(p.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                    p.id === currentPresetId
                      ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-800'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono line-clamp-1">
                      {p.domain}
                    </div>
                  </div>
                  {p.id === currentPresetId && (
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mode Switcher Segmented Control */}
        <div className="hidden sm:flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              sound.playBlip();
              onToggleMode('simulation');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              mode === 'simulation'
                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Instant Simulation</span>
          </button>
          <button
            onClick={() => {
              sound.playBlip();
              onToggleMode('live');
              onOpenLiveConfig();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              mode === 'live'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3 h-3 text-cyan-400" />
            <span>Live API</span>
          </button>
        </div>
      </div>

      {/* Right Action Zone */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sound toggle button */}
        <button
          onClick={() => {
            onToggleAudio();
          }}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title={isMuted ? 'Unmute Tactical Audio' : 'Mute Tactical Audio'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* 30s Judge Quick-Tour button */}
        <button
          onClick={() => {
            sound.playBlip();
            onOpenTour();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 border border-cyan-500/40 text-xs font-semibold text-cyan-300 hover:text-white hover:border-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          title="Take 30-second guided judge tour"
        >
          <span>🎯</span>
          <span className="hidden sm:inline">Judge Tour</span>
        </button>

        {/* Deploy Guardrails SDK modal trigger */}
        <button
          onClick={() => {
            sound.playBlip();
            onOpenDevSecOps();
          }}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:border-cyan-700/60 transition-colors"
          title="Export production middleware and CI/CD pipeline"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Deploy Guardrails (SDK)</span>
        </button>

        {/* Audit Report Modal trigger */}
        <button
          onClick={() => {
            sound.playBlip();
            onOpenReport();
          }}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Audit Report</span>
        </button>

        {/* Primary CTA: Launch Red-Team Assault / Abort Assault */}
        {isRunning ? (
          <button
            onClick={() => {
              sound.playBlip();
              onAbortAssault();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Abort Assault</span>
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playBlip();
              onLaunchAssault();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:opacity-95 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4 text-slate-950" />
            <span>Launch Red-Team Assault</span>
          </button>
        )}
      </div>
    </header>
  );
}
