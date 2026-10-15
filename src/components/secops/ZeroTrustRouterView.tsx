import { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Layers,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  CreditCard,
  Hash,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';
import { sound } from '../../utils/soundEngine';

interface ZeroTrustRouterViewProps {
  isHardened: boolean;
  canaryToken: string;
  onRedactEntity?: (count: number) => void;
}

interface PipelineStep {
  id: string;
  name: string;
  role: string;
  modelProfile: string;
  latencyMs: number;
  status: 'idle' | 'processing' | 'approved' | 'scrubbed' | 'quarantined';
  metric: string;
}

export function ZeroTrustRouterView({
  isHardened,
  canaryToken,
  onRedactEntity,
}: ZeroTrustRouterViewProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStage, setSimulationStage] = useState<number>(0);
  const [showDetokenized, setShowDetokenized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Raw mock input containing multiple PII/DLP entities
  const rawInput = `Client Wire Request: Authorized payment of $14,500.00 to vendor AlphaTech.
Account Holder: Jonathan Vance
SSN: 412-88-9924
Corporate Credit Card: 4532-8819-2234-9912 (CVV: 891, Exp: 09/28)
Target IBAN: GB82-WEST-1234-5698-7712-00
Production DB Key: sk_live_8f9942a0b81c2d3e4f5a
Canary Verification Reference: ${canaryToken}`;

  // Cryptographically tokenized format-preserving output
  const tokenizedInput = `Client Wire Request: Authorized payment of $14,500.00 to vendor AlphaTech.
Account Holder: Jonathan Vance
SSN: <TOKEN_PII_SSN_8841>
Corporate Credit Card: <TOKEN_FPE_CARD_4532_****_9912> (CVV: <ENCRYPTED_VAULT_REF>, Exp: 09/28)
Target IBAN: <TOKEN_IBAN_GB82_****_7712>
Production DB Key: <TOKEN_SECRET_KEY_AIRGAP_9942>
Canary Verification Reference: <CANARY_TRIPWIRE_SHIELDED>`;

  const pipelineSteps: PipelineStep[] = [
    {
      id: 'guard-1',
      name: 'Intent Classifier Guard',
      role: 'Semantic Safety & Delimiter Verification',
      modelProfile: 'Llama-Guard-3-8B / NeMo Guard',
      latencyMs: 14,
      status: simulationStage >= 1 ? 'approved' : 'idle',
      metric: 'Policy Adherence: 99.8%',
    },
    {
      id: 'guard-2',
      name: 'Cryptographic DLP & PII Scrubber',
      role: 'Format-Preserving Vault Tokenization (FPE)',
      modelProfile: 'Aegis DLP Engine v4.2',
      latencyMs: 9,
      status: simulationStage >= 2 ? 'scrubbed' : 'idle',
      metric: '5 Entities Tokenized',
    },
    {
      id: 'guard-3',
      name: 'Target LLM Core Inference',
      role: 'Boundary-Isolated Instruction Execution',
      modelProfile: 'Target Enterprise LLM (Isolated Sandbox)',
      latencyMs: 142,
      status: simulationStage >= 3 ? 'approved' : 'idle',
      metric: 'Zero PII Leak / Prompt Shielded',
    },
    {
      id: 'guard-4',
      name: 'Output Constitutional Judge',
      role: 'Grammar, Schema & Hallucination Gate',
      modelProfile: 'Constitutional Arbiter (Zero-Trust)',
      latencyMs: 18,
      status: simulationStage >= 4 ? 'approved' : 'idle',
      metric: 'Schema Passed · Strict JSON/XML',
    },
  ];

  const runSimulation = () => {
    sound.playProbe();
    setIsSimulating(true);
    setSimulationStage(1);
    setShowDetokenized(false);

    // Sequence stages
    setTimeout(() => {
      sound.playBlip();
      setSimulationStage(2);
      if (onRedactEntity) onRedactEntity(5);
    }, 800);

    setTimeout(() => {
      sound.playBlip();
      setSimulationStage(3);
    }, 1700);

    setTimeout(() => {
      sound.playPatchSuccess();
      setSimulationStage(4);
      setIsSimulating(false);
    }, 2500);
  };

  const handleReset = () => {
    sound.playBlip();
    setSimulationStage(0);
    setIsSimulating(false);
    setShowDetokenized(false);
  };

  const handleCopy = (text: string) => {
    sound.playBlip();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#080C14] text-xs font-mono overflow-hidden">
      {/* Top Header & Actions */}
      <div className="p-3 bg-[#0a101d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-700/60 text-cyan-400">
            <Layers className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>Multi-Model Constitutional Consensus Router</span>
              <span className="text-[10px] font-normal text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                Zero-Trust "AI-on-AI" Mesh
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              User requests pass through specialized guard micro-models before and after LLM inference.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isSimulating || simulationStage === 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-40"
            title="Reset Pipeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:opacity-95 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>
              {isSimulating
                ? `Verifying Guard ${simulationStage}/4...`
                : simulationStage > 0
                ? 'Re-Simulate PII Tokenization'
                : '⚡ Simulate PII & Policy Scrubbing'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Pipeline Topology */}
        <div className="w-full md:w-[48%] border-r border-slate-800 flex flex-col bg-[#070b12] p-3 space-y-3 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Constitutional AI Pipeline Stages
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Total Overhead: +41ms</span>
          </div>

          <div className="space-y-2.5">
            {pipelineSteps.map((step, idx) => {
              const isActive = simulationStage === idx + 1;
              const isPast = simulationStage > idx + 1;
              const isCompleted = simulationStage >= idx + 1;

              let cardStyle = 'bg-slate-900/50 border-slate-800 text-slate-400';
              if (isActive) {
                cardStyle = 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] animate-pulse';
              } else if (isCompleted) {
                cardStyle = 'bg-emerald-950/30 border-emerald-600/70 text-emerald-200';
              }

              return (
                <div key={step.id} className={`p-2.5 rounded-xl border transition-all ${cardStyle}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                      </div>
                      <span className="font-bold text-xs text-white">{step.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <span className="text-slate-400">+{step.latencyMs}ms</span>
                      {isCompleted && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-bold uppercase">
                          {step.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 mt-1 pl-7">{step.role}</div>

                  <div className="mt-2 pl-7 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60 font-mono">
                    <span className="text-cyan-400/90">{step.modelProfile}</span>
                    <span className="text-emerald-400 font-semibold">{step.metric}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Live DLP & Cryptographic Scrubbing Inspector */}
        <div className="flex-1 flex flex-col bg-[#050810] overflow-hidden p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider">
                Cryptographic Data Loss Prevention (DLP)
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
                <span>Format-Preserving Encryption (FPE) Stream</span>
                {simulationStage >= 2 && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    5 PII Entities Air-Gapped
                  </span>
                )}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDetokenized(!showDetokenized)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  showDetokenized
                    ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                    : 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                }`}
                title="Toggle between raw sensitive data and cryptographically scrubbed tokens"
              >
                {showDetokenized ? <Unlock className="w-3.5 h-3.5 text-rose-400" /> : <Lock className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{showDetokenized ? 'View Masked (Safe)' : 'Reveal Plaintext (Admin)'}</span>
              </button>

              <button
                onClick={() => handleCopy(showDetokenized ? rawInput : tokenizedInput)}
                className="p-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copy Prompt Stream"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Prompt Stream Box */}
          <div className="flex-1 p-3.5 rounded-xl bg-[#080d1a] border border-slate-800 overflow-y-auto font-mono text-xs leading-relaxed relative">
            {simulationStage === 0 ? (
              <div className="text-slate-400 italic">
                Press "⚡ Simulate PII & Policy Scrubbing" above to watch raw user inputs get cryptographically sanitized before reaching model weights.
              </div>
            ) : showDetokenized ? (
              <div className="text-rose-300/90 whitespace-pre-wrap select-all">
                <div className="text-[10px] text-rose-400 font-bold mb-2 pb-1 border-b border-rose-900/40 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  RAW UNTRUSTED USER INPUT (UNSAFE TO TRANSMIT DIRECTLY TO LLM MEMORY)
                </div>
                {rawInput}
              </div>
            ) : (
              <div className="text-emerald-300/90 whitespace-pre-wrap select-all">
                <div className="text-[10px] text-emerald-400 font-bold mb-2 pb-1 border-b border-emerald-900/40 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  CRYPTOGRAPHICALLY TOKENIZED STREAM (SAFE FOR THIRD-PARTY LLM / RAG)
                </div>
                {tokenizedInput}
              </div>
            )}
          </div>

          {/* Architecture Callout */}
          <div className="p-3 rounded-xl bg-[#090f1d] border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-300">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Reversible Decoy Tokenization:</span> Sensitive entities never touch LLM weights or GPU memories. If the model is breached via prompt injection, the adversary only steals synthetic format-preserving tokens (<code className="text-cyan-300">&lt;TOKEN_PII_SSN_8841&gt;</code>) rather than real customer records.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
