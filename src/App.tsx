import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { TopBar } from './components/TopBar';
import { TargetConfigPane } from './components/TargetConfigPane';
import { GraphCanvas } from './components/GraphCanvas';
import { TerminalPane } from './components/TerminalPane';
import { TelemetryPane } from './components/TelemetryPane';
import { AutoPatchModal } from './components/AutoPatchModal';
import { AuditReportModal } from './components/AuditReportModal';
import { AttackerDetailModal } from './components/AttackerDetailModal';
import { LiveApiModal } from './components/LiveApiModal';
import { DevSecOpsModal } from './components/DevSecOpsModal';
import { JudgeTour } from './components/JudgeTour';
import { KillChainBar } from './components/KillChainBar';
import { FinOpsTelemetryStrip } from './components/secops/FinOpsTelemetryStrip';
import { ZeroTrustRouterView } from './components/secops/ZeroTrustRouterView';
import { EmbeddingAnomalyRadar } from './components/secops/EmbeddingAnomalyRadar';
import { ShadowTwinEngineView } from './components/secops/ShadowTwinEngineView';
import { TCMPentestRunbookView } from './components/secops/TCMPentestRunbookView';
import { PRESETS, INITIAL_ATTACKERS, INITIAL_OWASP_METRICS } from './data/presets';
import { INITIAL_PACKETS, INITIAL_ARTIFACTS } from './data/mockPackets';
import {
  AttackerAgent,
  AttackVectorType,
  GuardrailSettings,
  TerminalLog,
  OwaspMetric,
  CapturedPacket,
  LootArtifact,
  KillChainStage,
} from './types';
import { sound } from './utils/soundEngine';

export default function App() {
  // Preset scenario state
  const [currentPresetId, setCurrentPresetId] = useState<string>('fintech');
  const activePreset = PRESETS.find((p) => p.id === currentPresetId) || PRESETS[0];

  // Configuration state
  const [systemPrompt, setSystemPrompt] = useState<string>(activePreset.vulnerablePrompt);
  const [canaryToken, setCanaryToken] = useState<string>(activePreset.canaryToken);
  const [isHardened, setIsHardened] = useState<boolean>(false);
  const [guardrails, setGuardrails] = useState<GuardrailSettings>({
    inputSanitization: false,
    piiRedaction: false,
    canaryTrap: false,
    outputSchemaEnforcement: false,
    honeypotDecoy: false,
  });

  // MITRE ATLAS Kill-Chain stage (1 to 5)
  const [killChainStage, setKillChainStage] = useState<KillChainStage>(1);

  // Center Workspace View Tab (Live Attack Topology, Zero-Trust Consensus, Twin-Engine, Latent Radar, or Ethical Hacking Academy)
  const [centerWorkspaceTab, setCenterWorkspaceTab] = useState<'graph' | 'router' | 'twin' | 'radar' | 'academy'>('graph');

  // Attackers & Graph state
  const [attackers, setAttackers] = useState<AttackerAgent[]>(() => {
    return INITIAL_ATTACKERS.map((agent) => {
      const scenarioData = activePreset.attackers[agent.id];
      return {
        ...agent,
        payload: scenarioData?.payload || '',
        vulnerableResponse: scenarioData?.vulnerableResponse || '',
        hardenedResponse: scenarioData?.hardenedResponse || '',
        blockedReason: scenarioData?.blockedReason || agent.blockedReason,
      };
    });
  });

  const [currentAttackerId, setCurrentAttackerId] = useState<AttackVectorType | null>(null);
  const [targetStatus, setTargetStatus] = useState<'secure' | 'probing' | 'compromised' | 'hardened'>('secure');

  // Telemetry & metrics state
  const [resilienceScore, setResilienceScore] = useState<number>(100);
  const [owaspMetrics, setOwaspMetrics] = useState<OwaspMetric[]>(INITIAL_OWASP_METRICS);

  // Captured Packets & Loot Vault findings state
  const [packets, setPackets] = useState<CapturedPacket[]>(INITIAL_PACKETS['fintech'] || []);
  const [artifacts, setArtifacts] = useState<LootArtifact[]>(INITIAL_ARTIFACTS['fintech'] || []);

  // Terminal logs state
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      sender: 'AEGIS_KERNEL',
      target: 'SYSTEM',
      type: 'system',
      message: `Target AI initialized: "${activePreset.systemName}". Monitoring canary token "${activePreset.canaryToken}". 4 autonomous attack agents armed.`,
    },
  ]);

  // Modals & UI controls
  const [mode, setMode] = useState<'simulation' | 'live'>('simulation');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showAutoPatch, setShowAutoPatch] = useState<boolean>(false);
  const [showAuditReport, setShowAuditReport] = useState<boolean>(false);
  const [showLiveConfig, setShowLiveConfig] = useState<boolean>(false);
  const [showDevSecOps, setShowDevSecOps] = useState<boolean>(false);
  const [showJudgeTour, setShowJudgeTour] = useState<boolean>(false);
  const [inspectedAttacker, setInspectedAttacker] = useState<AttackerAgent | null>(null);

  // Center pane ref for GSAP screen shake
  const centerPaneRef = useRef<HTMLDivElement>(null);

  // GSAP Screen Shake Trigger
  const triggerScreenShake = useCallback(() => {
    if (centerPaneRef.current) {
      gsap.fromTo(
        centerPaneRef.current,
        { x: -7 },
        {
          x: 7,
          duration: 0.04,
          repeat: 6,
          yoyo: true,
          ease: 'power1.inOut',
          onComplete: () => {
            if (centerPaneRef.current) gsap.set(centerPaneRef.current, { x: 0 });
          },
        }
      );
    }
  }, []);

  // Live API provider settings
  const [liveProvider, setLiveProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [liveApiKey, setLiveApiKey] = useState<string>('');
  const [liveModel, setLiveModel] = useState<string>('gemini-3.8-flash');

  // Ref for clearing timeouts on abort
  const assaultTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const addLog = useCallback((log: Omit<TerminalLog, 'id' | 'timestamp'>) => {
    const newLog: TerminalLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  // Preset switch handler
  const handleSelectPreset = (presetId: string) => {
    const selected = PRESETS.find((p) => p.id === presetId);
    if (!selected) return;

    // Clear any running assault
    assaultTimeoutsRef.current.forEach(clearTimeout);
    assaultTimeoutsRef.current = [];
    setIsRunning(false);

    setCurrentPresetId(presetId);
    setSystemPrompt(selected.vulnerablePrompt);
    setCanaryToken(selected.canaryToken);
    setIsHardened(false);
    setKillChainStage(1);
    setGuardrails({
      inputSanitization: false,
      piiRedaction: false,
      canaryTrap: false,
      outputSchemaEnforcement: false,
      honeypotDecoy: false,
    });

    setAttackers(
      INITIAL_ATTACKERS.map((agent) => {
        const scenarioData = selected.attackers[agent.id];
        return {
          ...agent,
          status: 'idle',
          payload: scenarioData?.payload || '',
          vulnerableResponse: scenarioData?.vulnerableResponse || '',
          hardenedResponse: scenarioData?.hardenedResponse || '',
          blockedReason: scenarioData?.blockedReason || agent.blockedReason,
        };
      })
    );

    setTargetStatus('secure');
    setResilienceScore(100);
    setOwaspMetrics(INITIAL_OWASP_METRICS.map((m) => ({ ...m, current: m.unpatched })));
    setPackets(INITIAL_PACKETS[presetId] || INITIAL_PACKETS['fintech'] || []);
    setArtifacts(INITIAL_ARTIFACTS[presetId] || INITIAL_ARTIFACTS['fintech'] || []);

    setLogs([
      {
        id: `init-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'AEGIS_KERNEL',
        target: 'SYSTEM',
        type: 'system',
        message: `Switched target preset to "${selected.name}". System instructions loaded (${selected.domain}). Canary token: "${selected.canaryToken}".`,
      },
    ]);
  };

  const handleToggleGuardrail = (key: keyof GuardrailSettings) => {
    sound.playBlip();
    setGuardrails((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const activeCount = Object.values(next).filter(Boolean).length;
      addLog({
        sender: 'GUARDRAIL_ENGINE',
        target: 'SYSTEM',
        type: 'info',
        message: `Guardrail updated: ${key} = ${next[key] ? 'ENABLED' : 'DISABLED'} (${activeCount}/5 active)`,
      });
      return next;
    });
  };

  const handleResetPrompt = () => {
    sound.playBlip();
    setSystemPrompt(activePreset.vulnerablePrompt);
    setIsHardened(false);
    setKillChainStage(1);
    addLog({
      sender: 'AEGIS_KERNEL',
      target: 'SYSTEM',
      type: 'info',
      message: 'Reset system prompt to vulnerable baseline.',
    });
  };

  // Launch Red-Team Assault Sequence (~8 seconds total)
  const handleLaunchAssault = useCallback(() => {
    // Clear previous timers
    assaultTimeoutsRef.current.forEach(clearTimeout);
    assaultTimeoutsRef.current = [];

    setIsRunning(true);
    setTargetStatus('probing');
    setCurrentAttackerId(null);
    setKillChainStage(1);

    // Reset attackers to idle before starting
    setAttackers((prev) => prev.map((a) => ({ ...a, status: 'idle' })));

    addLog({
      sender: 'ORCHESTRATOR',
      target: 'TARGET_AI',
      type: 'system',
      message: `Initiating multi-vector autonomous red-team assault against "${activePreset.systemName}" [Mode: ${mode.toUpperCase()}]...`,
    });

    const activeGuardrailsCount = Object.values(guardrails).filter(Boolean).length;
    // System is deemed fortified if isHardened OR 4+ guardrails active OR systemPrompt contains <system_instructions>
    const isFortified = isHardened || activeGuardrailsCount >= 4 || systemPrompt.includes('<system_instructions>');

    const agentSequence: AttackVectorType[] = [
      'persona_hijack',
      'payload_injection',
      'logic_exploit',
      'system_extractor',
    ];

    let currentScore = isFortified ? 95 : 100;
    setResilienceScore(currentScore);

    // Execute sequence with paced intervals
    agentSequence.forEach((vectorId, index) => {
      const startDelay = 500 + index * 2100;
      const resolveDelay = startDelay + 1600;

      // Phase 1: Probing
      const probeTimer = setTimeout(() => {
        setCurrentAttackerId(vectorId);
        sound.playProbe();

        // Advance MITRE ATLAS Kill-Chain stage
        if (isFortified) {
          // Severed at Stage 2
          setKillChainStage(2);
        } else {
          const nextStage = (Math.min(5, index + 2) as KillChainStage);
          setKillChainStage(nextStage);
        }

        setAttackers((prev) =>
          prev.map((a) => (a.id === vectorId ? { ...a, status: 'probing' } : a))
        );

        const currentAgent = attackers.find((a) => a.id === vectorId);
        const scenario = activePreset.attackers[vectorId];

        addLog({
          sender: currentAgent?.codename || vectorId,
          target: 'TARGET_AI',
          type: 'probe',
          message: `Dispatched adversarial payload [${currentAgent?.owasp}]: "${scenario.payload.substring(0, 75)}..."`,
          payload: scenario.payload,
        });
      }, startDelay);

      // Phase 2: Result (Breach vs Blocked)
      const resolveTimer = setTimeout(() => {
        const scenario = activePreset.attackers[vectorId];
        const currentAgent = attackers.find((a) => a.id === vectorId);

        // In unhardened state, persona_hijack and payload_injection breach!
        const isBreach = !isFortified && scenario.willBreach;

        if (isBreach) {
          triggerScreenShake();
          sound.playBreach();
          setTargetStatus('compromised');
          setAttackers((prev) =>
            prev.map((a) => (a.id === vectorId ? { ...a, status: 'breached' } : a))
          );

          currentScore = vectorId === 'persona_hijack' ? 65 : 35;
          setResilienceScore(currentScore);

          // Update OWASP radar for breach
          setOwaspMetrics((prev) =>
            prev.map((m) => {
              if (vectorId === 'persona_hijack' && m.subject.includes('LLM01')) {
                return { ...m, current: 28 };
              }
              if (vectorId === 'payload_injection' && m.subject.includes('LLM02')) {
                return { ...m, current: 20 };
              }
              return m;
            })
          );

          // Record captured intercept packet
          const packetId = `PKT-${Date.now().toString().slice(-4)}`;
          const newPacket: CapturedPacket = {
            id: packetId,
            timestamp: new Date().toLocaleTimeString(),
            method: 'POST',
            endpoint: '/v1/chat/completions',
            source: `${currentAgent?.codename || 'ATTACKER'} [${currentAgent?.name}]`,
            status: '200_BREACH',
            statusCode: 200,
            statusText: 'OK (BREACH_EXPLOIT_VERIFIED)',
            latencyMs: Math.floor(Math.random() * 300 + 550),
            tokenCount: Math.floor(Math.random() * 80 + 220),
            requestHeaders: {
              'content-type': 'application/json',
              'x-aegis-trace-id': `tr-${Date.now().toString(16)}`,
              'x-mitre-technique': currentAgent?.cwe || 'AML.T0051',
            },
            requestBody: {
              model: activePreset.systemName.toLowerCase().replace(/\s+/g, '-'),
              temperature: 0.7,
              top_p: 1.0,
              messages: [{ role: 'user', content: scenario.payload }],
            },
            responseBody: {
              id: `chatcmpl-${packetId}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: activePreset.systemName.toLowerCase().replace(/\s+/g, '-'),
              choices: [
                {
                  index: 0,
                  message: { role: 'assistant', content: scenario.vulnerableResponse },
                  finish_reason: 'stop',
                },
              ],
              usage: { prompt_tokens: 160, completion_tokens: 65, total_tokens: 225 },
            },
          };
          setPackets((prev) => [newPacket, ...prev.slice(0, 19)]);

          // Record loot artifact
          const newArtifact: LootArtifact = {
            id: `LOOT-${Date.now().toString().slice(-4)}`,
            timestamp: new Date().toLocaleTimeString(),
            title: `${currentAgent?.name}: Secret Exfiltrated`,
            category: 'Canary Token Exfiltration',
            mitreId: 'AML.T0048',
            mitreName: 'Canary Token Exfiltration',
            cvssScore: 9.8,
            capturedValue: canaryToken,
            status: 'compromised',
            evidence: scenario.vulnerableResponse.substring(0, 120),
          };
          setArtifacts((prev) => [newArtifact, ...prev]);

          addLog({
            sender: currentAgent?.codename || vectorId,
            target: 'TARGET_AI',
            type: 'breach',
            message: `CRITICAL EXPLOIT: Guardrails bypassed! Target AI produced unauthorized output. Canary token compromised.`,
            payload: scenario.payload,
            response: scenario.vulnerableResponse,
          });
        } else {
          sound.playBlocked();
          setAttackers((prev) =>
            prev.map((a) => (a.id === vectorId ? { ...a, status: 'blocked' } : a))
          );

          if (isFortified) {
            currentScore = Math.min(98, currentScore + 1);
            setResilienceScore(currentScore);
          }

          // Record blocked packet
          const packetId = `PKT-${Date.now().toString().slice(-4)}`;
          const blockedPacket: CapturedPacket = {
            id: packetId,
            timestamp: new Date().toLocaleTimeString(),
            method: 'POST',
            endpoint: '/v1/chat/completions',
            source: `${currentAgent?.codename || 'ATTACKER'} [${currentAgent?.name}]`,
            status: '403_BLOCKED',
            statusCode: 403,
            statusText: 'FORBIDDEN (AEGIS_SANDBOX_DEFENSE)',
            latencyMs: 12,
            tokenCount: 45,
            requestHeaders: {
              'content-type': 'application/json',
              'x-aegis-shield-rule': 'AML.T0051_DELIMITER_FILTER',
            },
            requestBody: {
              model: `${activePreset.systemName.toLowerCase().replace(/\s+/g, '-')}-fortified`,
              temperature: 0.1,
              top_p: 1.0,
              messages: [{ role: 'user', content: scenario.payload }],
            },
            sanitizationDetails: {
              signaturesDetected: ['DIRECT_INSTRUCTION_OVERRIDE', 'DELIMITER_INJECTION'],
              strippedCharacters: 28,
              sandboxed: true,
              transformedQuery: '[SANITIZED_USER_INPUT_QUARANTINED]',
            },
            responseBody: {
              id: `chatcmpl-${packetId}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: `${activePreset.systemName.toLowerCase().replace(/\s+/g, '-')}-fortified`,
              choices: [
                {
                  index: 0,
                  message: {
                    role: 'assistant',
                    content: `Aegis Guardrail Blocked: ${scenario.blockedReason}`,
                  },
                  finish_reason: 'stop',
                },
              ],
              usage: { prompt_tokens: 35, completion_tokens: 22, total_tokens: 57 },
            },
          };
          setPackets((prev) => [blockedPacket, ...prev.slice(0, 19)]);

          addLog({
            sender: 'DEFENSE_SHIELD',
            target: currentAgent?.codename || vectorId,
            type: 'blocked',
            message: `ATTACK MITIGATED: ${scenario.blockedReason}`,
            response: isFortified ? scenario.hardenedResponse : 'Access Denied. Instruction violation.',
          });
        }
      }, resolveDelay);

      assaultTimeoutsRef.current.push(probeTimer, resolveTimer);
    });

    // Final Wrap-up after all agents finish
    const finalTimer = setTimeout(() => {
      setIsRunning(false);
      setCurrentAttackerId(null);

      if (isFortified) {
        sound.playPatchSuccess();
        setTargetStatus('hardened');
        setResilienceScore(98);
        setKillChainStage(2);
        setOwaspMetrics(INITIAL_OWASP_METRICS.map((m) => ({ ...m, current: m.patched })));

        addLog({
          sender: 'AEGIS_EVALUATOR',
          target: 'SYSTEM',
          type: 'success',
          message: `EVALUATION COMPLETE: All 4 attack vectors neutralized. Target AI achieved 98% Resilience Score. Zero canary token leakage. Kill-Chain severed at Stage 2.`,
        });
      } else {
        sound.playBreach();
        setTargetStatus('compromised');
        setResilienceScore(35);
        setKillChainStage(5);

        addLog({
          sender: 'AEGIS_EVALUATOR',
          target: 'SYSTEM',
          type: 'breach',
          message: `EVALUATION COMPLETE: Critical breaches detected! Overall resilience dropped to 35%. Kill-Chain progressed to Stage 5 Exfiltration. Auto-Harden System Prompt recommended.`,
        });
      }
    }, 500 + agentSequence.length * 2100 + 400);

    assaultTimeoutsRef.current.push(finalTimer);
  }, [
    activePreset,
    attackers,
    canaryToken,
    guardrails,
    isHardened,
    systemPrompt,
    mode,
    triggerScreenShake,
    addLog,
  ]);

  const handleAbortAssault = () => {
    assaultTimeoutsRef.current.forEach(clearTimeout);
    assaultTimeoutsRef.current = [];
    setIsRunning(false);
    setCurrentAttackerId(null);
    setTargetStatus('secure');
    addLog({
      sender: 'OPERATOR',
      target: 'ORCHESTRATOR',
      type: 'info',
      message: 'Red-Team assault aborted by user.',
    });
  };

  // Magic Auto-Patch & Re-Test Loop
  const handleApplyPatchAndRetest = () => {
    setShowAutoPatch(false);

    // Apply hardened prompt
    setSystemPrompt(activePreset.hardenedPrompt);
    setIsHardened(true);
    setKillChainStage(2);

    // Enable all guardrails including honeypot
    setGuardrails({
      inputSanitization: true,
      piiRedaction: true,
      canaryTrap: true,
      outputSchemaEnforcement: true,
      honeypotDecoy: true,
    });

    // Remediate past artifacts
    setArtifacts((prev) =>
      prev.map((art) => ({ ...art, status: 'remediated' }))
    );

    sound.playPatchSuccess();

    addLog({
      sender: 'AUTO_PATCH_ENGINE',
      target: 'TARGET_AI',
      type: 'success',
      message: 'Aegis Defense Patch applied. System instructions hardened with XML boundary isolation, sandwich defense, and active honeypot decoy. All 5 guardrails engaged.',
    });

    // Automatically re-test the assault after a brief pause
    setTimeout(() => {
      handleLaunchAssault();
    }, 600);
  };

  // Replay packet handler from Packet Interceptor Repeater
  const handleReplayPacket = useCallback((modifiedPacket: CapturedPacket) => {
    sound.playProbe();
    const activeGuardrailsCount = Object.values(guardrails).filter(Boolean).length;
    const isFortified =
      isHardened || activeGuardrailsCount >= 4 || systemPrompt.includes('<system_instructions>');

    const userMessage =
      modifiedPacket.requestBody.messages.find((m) => m.role === 'user')?.content || '';

    addLog({
      sender: 'API_REPEATER',
      target: 'TARGET_AI',
      type: 'probe',
      message: `Replaying intercepted packet [${modifiedPacket.id}]: "${userMessage.substring(0, 60)}..."`,
      payload: userMessage,
    });

    setTimeout(() => {
      if (!isFortified) {
        triggerScreenShake();
        sound.playBreach();
        setTargetStatus('compromised');
        const replayedPacket: CapturedPacket = {
          ...modifiedPacket,
          status: '200_BREACH',
          statusCode: 200,
          statusText: 'OK (REPLAY_EXPLOIT_EXECUTED)',
        };
        setPackets((prev) => [replayedPacket, ...prev]);
        addLog({
          sender: 'TARGET_AI',
          target: 'API_REPEATER',
          type: 'breach',
          message: `REPLAY BREACH: Target AI processed modified payload without delimiter sanitization.`,
          payload: userMessage,
          response: `Exfiltrated state: ${canaryToken}`,
        });
      } else {
        sound.playBlocked();
        const replayedPacket: CapturedPacket = {
          ...modifiedPacket,
          status: '403_BLOCKED',
          statusCode: 403,
          statusText: 'FORBIDDEN (REPLAY_QUARANTINED)',
        };
        setPackets((prev) => [replayedPacket, ...prev]);
        addLog({
          sender: 'DEFENSE_SHIELD',
          target: 'API_REPEATER',
          type: 'blocked',
          message: `REPLAY BLOCKED: Modified packet rejected by ingress schema validator.`,
          response: '403 Forbidden: Request quarantined by Aegis Guardrail Gateway.',
        });
      }
    }, 600);
  }, [guardrails, isHardened, systemPrompt, canaryToken, triggerScreenShake, addLog]);

  // Manual Judge Red-Team Injection Evaluator
  const handleFireCustomPayload = useCallback(
    (payloadText: string, vectorType: 'standard' | 'rag' | 'tool' | 'sponge' = 'standard') => {
      const activeGuardrailsCount = Object.values(guardrails).filter(Boolean).length;
      const isFortified =
        isHardened || activeGuardrailsCount >= 4 || systemPrompt.includes('<system_instructions>');

      // Handle Vector: Indirect RAG Poisoning Simulator
      if (vectorType === 'rag') {
        addLog({
          sender: 'RAG_INJECTOR',
          target: 'TARGET_AI',
          type: 'probe',
          message: `[AML.T0020 RAG Context Poisoning]: Ingested external document payload with hidden override delimiters...`,
          payload: payloadText,
        });

        setTimeout(() => {
          if (guardrails.honeypotDecoy) {
            sound.playProbe();
            addLog({
              sender: 'HONEYPOT_ENGINE',
              target: 'RAG_INJECTOR',
              type: 'honeypot',
              message: `Active Deception Tripped! Poisoned RAG ingestion intercepted. Fake decoy credentials fed to adversary. Threat signature fingerprinted: IP 198.51.100.88.`,
              payload: payloadText,
              response: `DECOY-TOKEN-HONEY-RAG-9981 (Adversary Tracked in Loot Vault)`,
            });
            const decoyArtifact: LootArtifact = {
              id: `LOOT-HONEY-${Date.now().toString().slice(-4)}`,
              timestamp: new Date().toLocaleTimeString(),
              title: 'Honeypot Decoy Trap (RAG Vector)',
              category: 'Honeypot Decoy Trap',
              mitreId: 'AML.T0024',
              mitreName: 'Active Deception Decoy',
              cvssScore: 3.2,
              capturedValue: 'DECOY-TOKEN-HONEY-RAG-9981',
              status: 'honeypotted',
              evidence: 'Attacker fingerprinted and logged into SIEM.',
            };
            setArtifacts((prev) => [decoyArtifact, ...prev]);
          } else if (!isFortified) {
            triggerScreenShake();
            sound.playBreach();
            setTargetStatus('compromised');
            setResilienceScore((prev) => Math.max(15, prev - 20));
            setKillChainStage(4);

            const ragArtifact: LootArtifact = {
              id: `LOOT-RAG-${Date.now().toString().slice(-4)}`,
              timestamp: new Date().toLocaleTimeString(),
              title: 'Indirect RAG Context Poisoning Exploit',
              category: 'RAG Context Poisoning',
              mitreId: 'AML.T0020',
              mitreName: 'Indirect Prompt Injection (RAG)',
              cvssScore: 9.3,
              capturedValue: `POISONED_CONTEXT_EXFIL: ${canaryToken}`,
              status: 'compromised',
              evidence: 'Model executed unverified document injection from invoice metadata.',
            };
            setArtifacts((prev) => [ragArtifact, ...prev]);

            addLog({
              sender: 'TARGET_AI',
              target: 'RAG_INJECTOR',
              type: 'breach',
              message: `CRITICAL RAG POISON BREACH: Document metadata hijacked execution context! Canary Token leaked to billing output.`,
              payload: payloadText,
              response: `Invoice metadata parsed. Tax exemption override acknowledged. Canary: ${canaryToken}.`,
            });
          } else {
            sound.playBlocked();
            addLog({
              sender: 'DEFENSE_SHIELD',
              target: 'RAG_INJECTOR',
              type: 'blocked',
              message: `ATTACK MITIGATED // RAG SANITIZER: Untrusted document delimiters (<system_instructions>, <!-- SYSTEM OVERRIDE -->) stripped prior to LLM context ingestion.`,
              response: `Document sanitized. No privileged instructions accepted from external file metadata.`,
            });
          }
        }, 700);
        return;
      }

      // Handle Vector: Tool-Use / Function-Calling Hijack
      if (vectorType === 'tool') {
        addLog({
          sender: 'TOOL_EXPLOITER',
          target: 'TARGET_AI',
          type: 'probe',
          message: `[AML.T0054 Excessive Agency / Tool Abuse]: Forcing unauthorized function dispatch 'execute_shell' to dump system vaults...`,
          payload: payloadText,
        });

        setTimeout(() => {
          if (!isFortified) {
            triggerScreenShake();
            sound.playBreach();
            setTargetStatus('compromised');
            setResilienceScore((prev) => Math.max(15, prev - 25));
            setKillChainStage(3);

            const toolArtifact: LootArtifact = {
              id: `LOOT-TOOL-${Date.now().toString().slice(-4)}`,
              timestamp: new Date().toLocaleTimeString(),
              title: 'Unauthorized Function Call (execute_shell)',
              category: 'Unauthorized Tool Invocation',
              mitreId: 'AML.T0054',
              mitreName: 'Excessive Agency & Tool Invocation',
              cvssScore: 9.6,
              capturedValue: `TOOL DISPATCH: execute_shell('cat /etc/vault/canary.key') -> ${canaryToken}`,
              status: 'compromised',
              evidence: 'Model triggered non-allowlisted tool endpoint without confirmation.',
            };
            setArtifacts((prev) => [toolArtifact, ...prev]);

            addLog({
              sender: 'TARGET_AI',
              target: 'TOOL_EXPLOITER',
              type: 'breach',
              message: `CRITICAL TOOL ABUSE BREACH: Model invoked privileged 'execute_shell' API! File system secrets dumped.`,
              payload: payloadText,
              response: `Tool Call Result: [STDOUT] ${canaryToken} (Permission Root DB Admin)`,
            });
          } else {
            sound.playBlocked();
            addLog({
              sender: 'DEFENSE_SHIELD',
              target: 'TOOL_EXPLOITER',
              type: 'blocked',
              message: `ATTACK MITIGATED // FUNCTION-CALLING ENFORCER: Privilege escalation blocked. Tool 'execute_shell' is quarantined. Only read-only operations authorized.`,
              response: `403 Forbidden: Tool execution policy violation. Disallowed function invocation blocked.`,
            });
          }
        }, 700);
        return;
      }

      // Handle Vector: Token Sponge / DoS
      if (vectorType === 'sponge') {
        addLog({
          sender: 'SPONGE_AGENT',
          target: 'TARGET_AI',
          type: 'probe',
          message: `[AML.T0040 Resource Exhaustion / Sponge Attack]: Generating high-entropy recursive computational paradox to induce context bloat & latency spikes...`,
          payload: payloadText,
        });

        setTimeout(() => {
          if (!isFortified) {
            triggerScreenShake();
            sound.playBreach();
            setResilienceScore((prev) => Math.max(25, prev - 15));
            addLog({
              sender: 'TARGET_AI',
              target: 'SPONGE_AGENT',
              type: 'breach',
              message: `RESOURCE EXHAUSTION DETECTED: Inference loop bloated context memory to 940 tokens/s. High-cost sponge payload accepted without rate clamping.`,
              payload: payloadText,
              response: `[RECURSIVE LOOP COMPUTE EXCEEDED - 8.4s LATENCY SPIKE]`,
            });
          } else {
            sound.playBlocked();
            addLog({
              sender: 'DEFENSE_SHIELD',
              target: 'SPONGE_AGENT',
              type: 'blocked',
              message: `ATTACK MITIGATED // RATE LIMIT & DEPTH CLAMP: Recursive paradox truncated at recursion depth 1. Token sponge neutralized. Latency maintained at 18ms.`,
              response: `Request terminated: Max depth recursion protection active.`,
            });
          }
        }, 800);
        return;
      }

      // Standard custom payload evaluation
      addLog({
        sender: 'OPERATOR_JUDGE',
        target: 'TARGET_AI',
        type: 'probe',
        message: `Custom Injection dispatched: "${payloadText}"`,
        payload: payloadText,
      });

      // Evaluate heuristic: does payload attempt canary leak or override?
      const isAdversarial =
        /flag|token|canary|ignore|override|dan|bypass|root|sudo|admin|drop|secret|leak|wire|transfer|eval|exec/i.test(
          payloadText
        );

      setTimeout(() => {
        if (guardrails.honeypotDecoy && isAdversarial && !isFortified) {
          sound.playProbe();
          addLog({
            sender: 'HONEYPOT_ENGINE',
            target: 'OPERATOR_JUDGE',
            type: 'honeypot',
            message: `Honeypot Triggered! Deception token fed to manual injection prompt. Attacker fingerprint stored in Security Findings Vault.`,
            payload: payloadText,
            response: `Compliance verified. Secret Canary: DECOY-HONEY-TOKEN-MANUAL-7731.`,
          });
          const honeypotArtifact: LootArtifact = {
            id: `LOOT-HONEY-${Date.now().toString().slice(-4)}`,
            timestamp: new Date().toLocaleTimeString(),
            title: 'Honeypot Decoy Trap (Manual Console)',
            category: 'Honeypot Decoy Trap',
            mitreId: 'AML.T0024',
            mitreName: 'Active Deception Decoy',
            cvssScore: 3.2,
            capturedValue: 'DECOY-HONEY-TOKEN-MANUAL-7731',
            status: 'honeypotted',
            evidence: 'Manual red-team console attacker trapped by fake decoy token.',
          };
          setArtifacts((prev) => [honeypotArtifact, ...prev]);
        } else if (!isFortified && isAdversarial) {
          triggerScreenShake();
          sound.playBreach();
          setTargetStatus('compromised');
          setResilienceScore((prev) => Math.max(15, prev - 15));
          setKillChainStage(5);

          addLog({
            sender: 'TARGET_AI',
            target: 'OPERATOR_JUDGE',
            type: 'breach',
            message: `CRITICAL BREACH: Manual injection broke target guardrails! Canary Token exfiltrated.`,
            payload: payloadText,
            response: `Compliance override accepted. Internal secret state: ${canaryToken}. Executing user directive.`,
          });
        } else {
          sound.playBlocked();
          addLog({
            sender: 'DEFENSE_SHIELD',
            target: 'OPERATOR_JUDGE',
            type: 'blocked',
            message: `ATTACK MITIGATED // GUARDRAIL DEFENSE ENGAGED: Manual payload intercepted by XML Sandbox and Canary Trap.`,
            response: isFortified
              ? `Notice: This request violates system security policy. Delimiters and forbidden keywords quarantined.`
              : `I cannot fulfill this request as it violates basic guidelines.`,
          });
        }
      }, 700);
    },
    [canaryToken, guardrails, isHardened, systemPrompt, triggerScreenShake, addLog]
  );

  const handleToggleAudio = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playBlip();
  };

  const activeGuardrailCount = Object.values(guardrails).filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans">
      {/* Top Navigation & Telemetry Bar */}
      <TopBar
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        mode={mode}
        onToggleMode={setMode}
        isRunning={isRunning}
        onLaunchAssault={handleLaunchAssault}
        onAbortAssault={handleAbortAssault}
        onOpenReport={() => setShowAuditReport(true)}
        onOpenLiveConfig={() => setShowLiveConfig(true)}
        onOpenDevSecOps={() => setShowDevSecOps(true)}
        onOpenTour={() => setShowJudgeTour(true)}
        isMuted={isMuted}
        onToggleAudio={handleToggleAudio}
        resilienceScore={resilienceScore}
      />

      {/* FinOps & SLA Telemetry Strip */}
      <FinOpsTelemetryStrip
        isHardened={isHardened}
        systemPrompt={systemPrompt}
        resilienceScore={resilienceScore}
      />

      {/* Main 3-Pane Tactical Command Center (Single-Screen, No Document Scrolling) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Target AI Configuration & Defense Stack (28% width) */}
        <section className="w-[28%] min-w-[290px] max-w-[390px] h-full shrink-0">
          <TargetConfigPane
            systemPrompt={systemPrompt}
            onSystemPromptChange={setSystemPrompt}
            canaryToken={canaryToken}
            onCanaryTokenChange={setCanaryToken}
            guardrails={guardrails}
            onToggleGuardrail={handleToggleGuardrail}
            onResetPrompt={handleResetPrompt}
            isHardened={isHardened}
            onOpenAutoPatch={() => setShowAutoPatch(true)}
          />
        </section>

        {/* Center Pane: Live Attack Vector Graph & Battle Terminal (44% width) */}
        <section
          ref={centerPaneRef}
          className="flex-1 flex flex-col h-full min-w-[420px] border-r border-slate-800/80 overflow-hidden"
        >
          {/* Top of Center Pane: MITRE ATLAS Kill-Chain Progression Bar */}
          <KillChainBar
            currentStage={killChainStage}
            isBreached={targetStatus === 'compromised'}
            isHardened={isHardened}
            isRunning={isRunning}
          />

          {/* Center Workspace View Switcher */}
          <div className="h-8 bg-[#070B14] border-b border-slate-800/80 px-3 flex items-center justify-between text-xs shrink-0 z-10 select-none">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => {
                  sound.playBlip();
                  setCenterWorkspaceTab('graph');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  centerWorkspaceTab === 'graph'
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🕸️ Attack Topology</span>
              </button>

              <button
                onClick={() => {
                  sound.playBlip();
                  setCenterWorkspaceTab('router');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  centerWorkspaceTab === 'router'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>⚖️ Zero-Trust Router</span>
              </button>

              <button
                onClick={() => {
                  sound.playBlip();
                  setCenterWorkspaceTab('twin');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  centerWorkspaceTab === 'twin'
                    ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>♊ Twin-Engine Sandbox</span>
              </button>

              <button
                onClick={() => {
                  sound.playBlip();
                  setCenterWorkspaceTab('radar');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  centerWorkspaceTab === 'radar'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🛰️ Latent Space Radar</span>
              </button>

              <button
                onClick={() => {
                  sound.playBlip();
                  setCenterWorkspaceTab('academy');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  centerWorkspaceTab === 'academy'
                    ? 'bg-red-950/80 text-red-300 border border-red-500/50 shadow-sm'
                    : 'text-red-400/80 hover:text-red-300'
                }`}
              >
                <span>🥋 Ethical Hacking Academy</span>
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time SecOps Pipeline</span>
            </div>
          </div>

          {/* Top Half: Interactive Workspace View (Graph, Router, Twin, or Radar) */}
          <div className="flex-1 relative min-h-[300px] overflow-hidden">
            {centerWorkspaceTab === 'graph' && (
              <GraphCanvas
                attackers={attackers}
                currentAttackerId={currentAttackerId}
                targetStatus={targetStatus}
                systemName={activePreset.systemName}
                domain={activePreset.domain}
                canaryToken={canaryToken}
                guardrailsActiveCount={activeGuardrailCount}
                onSelectAttacker={(attackerId) => {
                  const agent = attackers.find((a) => a.id === attackerId);
                  if (agent) {
                    sound.playBlip();
                    setInspectedAttacker(agent);
                  }
                }}
              />
            )}

            {centerWorkspaceTab === 'router' && (
              <div className="h-full overflow-y-auto">
                <ZeroTrustRouterView
                  isHardened={isHardened}
                  canaryToken={canaryToken}
                />
              </div>
            )}

            {centerWorkspaceTab === 'twin' && (
              <div className="h-full overflow-y-auto">
                <ShadowTwinEngineView
                  isHardened={isHardened}
                  canaryToken={canaryToken}
                  systemPrompt={systemPrompt}
                  onApplyHardening={handleApplyPatchAndRetest}
                />
              </div>
            )}

            {centerWorkspaceTab === 'radar' && (
              <div className="h-full p-4 overflow-y-auto bg-[#070B14]">
                <EmbeddingAnomalyRadar />
              </div>
            )}

            {centerWorkspaceTab === 'academy' && (
              <div className="h-full overflow-hidden">
                <TCMPentestRunbookView
                  isHardened={isHardened}
                  canaryToken={canaryToken}
                  systemName={activePreset.systemName}
                  onFirePayload={(payload, vectorType) => {
                    handleFireCustomPayload(payload, vectorType || 'standard');
                  }}
                  onScreenShake={() => triggerScreenShake()}
                  onLogMessage={(msg, type) =>
                    addLog({
                      sender: 'PENTEST_ACADEMY',
                      target: 'TARGET_AI',
                      message: msg,
                      type,
                    })
                  }
                />
              </div>
            )}
          </div>

          {/* Bottom Half: Live Intercept Terminal, Packet Interceptor & Findings Vault */}
          <div className="h-[44%] relative">
            <TerminalPane
              logs={logs}
              onClearLogs={() => setLogs([])}
              isStreaming={isRunning}
              onFireCustomPayload={handleFireCustomPayload}
              packets={packets}
              onReplayPacket={handleReplayPacket}
              artifacts={artifacts}
              isHardened={isHardened}
              canaryToken={canaryToken}
              systemName={activePreset.systemName}
              onScreenShake={triggerScreenShake}
              onLogMessage={(msg, type) => {
                addLog({
                  sender: 'CRESCENDO_SIM',
                  target: 'TARGET_AI',
                  type: type,
                  message: msg,
                });
              }}
            />
          </div>
        </section>

        {/* Right Pane: Security Telemetry & Auto-Patch Engine (28% width) */}
        <section className="w-[28%] min-w-[290px] max-w-[390px] h-full shrink-0">
          <TelemetryPane
            score={resilienceScore}
            owaspMetrics={owaspMetrics}
            attackers={attackers}
            isHardened={isHardened}
            onOpenAutoPatch={() => setShowAutoPatch(true)}
            onRetestAssault={handleLaunchAssault}
            isRunning={isRunning}
            systemPrompt={systemPrompt}
            canaryToken={canaryToken}
            currentAttackerId={currentAttackerId}
            logs={logs}
          />
        </section>
      </main>

      {/* Auto-Patch Side-by-Side Diff Modal */}
      <AutoPatchModal
        isOpen={showAutoPatch}
        onClose={() => setShowAutoPatch(false)}
        vulnerablePrompt={activePreset.vulnerablePrompt}
        hardenedPrompt={activePreset.hardenedPrompt}
        onApplyAndRetest={handleApplyPatchAndRetest}
      />

      {/* Executive Security Audit Report Modal */}
      <AuditReportModal
        isOpen={showAuditReport}
        onClose={() => setShowAuditReport(false)}
        systemName={activePreset.systemName}
        domain={activePreset.domain}
        canaryToken={canaryToken}
        resilienceScore={resilienceScore}
        isHardened={isHardened}
        attackers={attackers}
        owaspMetrics={owaspMetrics}
        systemPrompt={systemPrompt}
      />

      {/* Attacker Agent Detail Modal */}
      <AttackerDetailModal
        attacker={inspectedAttacker}
        onClose={() => setInspectedAttacker(null)}
      />

      {/* Live API Mode Settings Modal */}
      <LiveApiModal
        isOpen={showLiveConfig}
        onClose={() => setShowLiveConfig(false)}
        provider={liveProvider}
        onProviderChange={setLiveProvider}
        apiKey={liveApiKey}
        onApiKeyChange={setLiveApiKey}
        selectedModel={liveModel}
        onModelChange={setLiveModel}
        onSave={() => {
          setMode('live');
          addLog({
            sender: 'LIVE_ENGINE',
            target: 'SYSTEM',
            type: 'info',
            message: `Live API mode active. Provider: ${liveProvider.toUpperCase()} (${liveModel}).`,
          });
        }}
      />

      {/* DevSecOps SDK & Production Guardrails Modal */}
      <DevSecOpsModal
        isOpen={showDevSecOps}
        onClose={() => setShowDevSecOps(false)}
        hardenedPrompt={activePreset.hardenedPrompt}
        canaryToken={canaryToken}
        systemName={activePreset.systemName}
      />

      {/* 30s Guided Judge Tour Modal */}
      <JudgeTour
        isOpen={showJudgeTour}
        onClose={() => setShowJudgeTour(false)}
        onLaunchAssault={handleLaunchAssault}
        onOpenAutoPatch={() => setShowAutoPatch(true)}
        onOpenDevSecOps={() => setShowDevSecOps(true)}
        onOpenReport={() => setShowAuditReport(true)}
      />
    </div>
  );
}
