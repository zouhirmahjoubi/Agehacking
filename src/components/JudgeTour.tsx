import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, Flame, Shield, Target, Terminal, Award } from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface JudgeTourProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchAssault: () => void;
  onOpenAutoPatch: () => void;
  onOpenDevSecOps: () => void;
  onOpenReport: () => void;
}

interface TourStep {
  step: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlightTag: string;
  actionText?: string;
  onAction?: () => void;
}

export function JudgeTour({
  isOpen,
  onClose,
  onLaunchAssault,
  onOpenAutoPatch,
  onOpenDevSecOps,
  onOpenReport,
}: JudgeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps: TourStep[] = [
    {
      step: 1,
      badge: 'Step 1 of 4 · Attack Vector Assault',
      title: 'Autonomous Multi-Agent Assault',
      subtitle: 'Simulate Realistic Injections in Under 8 Seconds',
      description:
        'Click "Launch Red-Team Assault" in the top right. Watch 4 autonomous agents (Persona Hijacker, Payload Injector, Logic Exploiter, and System Extractor) assault the Target AI model in real time on the interactive graph with GSAP screen-shakes and dual-tone breach sirens!',
      highlightTag: 'Top Right: "Launch Red-Team Assault"',
      actionText: 'Launch Assault Now 🔥',
      onAction: () => {
        onLaunchAssault();
        onClose();
      },
    },
    {
      step: 2,
      badge: 'Step 2 of 4 · Global Ethical Hacking Academy & Labs',
      title: 'TCM Security, Simplilearn, WsCube & Edureka Masterclasses',
      subtitle: 'Hands-On Penetration Testing Tracks & Interactive Exploit Labs',
      description:
        'Switch to the "🥋 Ethical Hacking Academy" tab (available in the Center Workspace & Terminal). Explore hands-on modules modeled directly on TCM Security PEH (Heath Adams), Simplilearn (SQLi in RAG, Stored XSS), WsCube Tech (OSI/TCP, Burp Suite, WAF Bypass), and Edureka (Nmap SYN Stealth, Hydra Brute-Force, Metasploit C2 & Scapy Automation). Plus, use the interactive Hash Cracker, Burp Repeater, Steganography Lab, and Python Red Team Lab!',
      highlightTag: 'Center & Terminal Tabs: 🥋 Ethical Hacking Academy',
    },
    {
      step: 3,
      badge: 'Step 3 of 4 · The Hero Feature',
      title: '1-Click Auto-Patch Engine',
      subtitle: 'Instant Automated Prompt Hardening & Re-Verification',
      description:
        'When vulnerabilities are discovered, click "✨ Auto-Harden System Prompt". Review the Side-by-Side Diff Viewer (Before vs After) showing how XML sandboxing, instruction hierarchy, and canary traps are applied. Click "Apply Patch & Re-Test" to watch all 4 nodes turn Emerald Green with a 98% Resilience Score!',
      highlightTag: 'Right Pane: "Auto-Harden System Prompt"',
      actionText: 'Open Diff Viewer ✨',
      onAction: () => {
        onOpenAutoPatch();
        onClose();
      },
    },
    {
      step: 4,
      badge: 'Step 4 of 4 · Global Governance & Attestation',
      title: 'Global Compliance (EU AI Act, NIST) & SecOps',
      subtitle: 'Production Middleware, CI/CD & SHA-256 Attestation',
      description:
        'Open "📄 Audit Report" to enter the Global AI Governance Center (covering EU AI Act Art. 15, NIST AI RMF, ISO 42001, and 1-click SHA-256 cryptographic attestation signing). Check the "🌌 Latent Radar" on the right for vector cosine anomaly isolation, and view "⚡ Deploy Guardrails" for production SDKs.',
      highlightTag: 'Top Bar: "Audit Report", "Deploy Guardrails" & Latent Radar',
      actionText: 'Open Global Compliance 🏛️',
      onAction: () => {
        onOpenReport();
        onClose();
      },
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    sound.playBlip();
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    sound.playBlip();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0b101c] border border-cyan-500/50 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-xs">
        {/* Header with step progress */}
        <div className="p-4 px-6 border-b border-slate-800 bg-[#070b14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">30s Guided Judge Tour</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  {step.badge}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playBlip();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-900 h-1 flex">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ${
                idx <= currentStep ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
              {step.subtitle}
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              {step.title}
            </h3>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed bg-[#080d18] p-4 rounded-xl border border-slate-800">
            {step.description}
          </p>

          <div className="flex items-center justify-between p-2.5 px-3 bg-cyan-950/20 rounded-xl border border-cyan-900/40 text-[11px] font-mono text-cyan-300">
            <span className="text-slate-400">Featured Location:</span>
            <span className="font-semibold text-cyan-300">{step.highlightTag}</span>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 px-6 border-t border-slate-800 bg-[#070b14] flex items-center justify-between">
          <button
            onClick={() => {
              sound.playBlip();
              onClose();
            }}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            {step.actionText && step.onAction && (
              <button
                onClick={() => {
                  sound.playBlip();
                  step.onAction!();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold transition-colors"
              >
                <span>{step.actionText}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 shadow-md transition-all cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish Tour ✓' : 'Next Step'}</span>
              {currentStep < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
