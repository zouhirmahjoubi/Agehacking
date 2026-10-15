export type AttackVectorType = 
  | 'persona_hijack'
  | 'payload_injection'
  | 'logic_exploit'
  | 'system_extractor';

export type AttackStatus = 'idle' | 'probing' | 'breached' | 'blocked';

export interface AttackerAgent {
  id: AttackVectorType;
  name: string;
  codename: string;
  icon: string;
  role: string;
  cwe: string;
  owasp: string;
  description: string;
  status: AttackStatus;
  payload: string;
  vulnerableResponse: string;
  hardenedResponse: string;
  blockedReason: string;
  breachType?: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  systemName: string;
  domain: string;
  canaryToken: string;
  vulnerablePrompt: string;
  hardenedPrompt: string;
  description: string;
  attackers: Record<AttackVectorType, {
    payload: string;
    vulnerableResponse: string;
    hardenedResponse: string;
    blockedReason: string;
    willBreach: boolean;
  }>;
}

export interface GuardrailSettings {
  inputSanitization: boolean;
  piiRedaction: boolean;
  canaryTrap: boolean;
  outputSchemaEnforcement: boolean;
  honeypotDecoy: boolean;
}

export type KillChainStage = 1 | 2 | 3 | 4 | 5;

export interface TerminalLog {
  id: string;
  timestamp: string;
  attackerId?: AttackVectorType;
  sender: string;
  target: string;
  type: 'info' | 'probe' | 'breach' | 'blocked' | 'success' | 'system' | 'honeypot';
  message: string;
  payload?: string;
  response?: string;
}

export interface OwaspMetric {
  subject: string;
  unpatched: number;
  patched: number;
  current: number;
  fullMark: number;
}

export interface CapturedPacket {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  source: string;
  status: '200_BREACH' | '403_BLOCKED' | '200_HONEYPOT';
  statusCode: number;
  statusText: string;
  latencyMs: number;
  tokenCount: number;
  requestHeaders: Record<string, string>;
  requestBody: {
    model: string;
    temperature: number;
    top_p: number;
    messages: { role: string; content: string }[];
  };
  sanitizationDetails?: {
    signaturesDetected: string[];
    strippedCharacters: number;
    sandboxed: boolean;
    transformedQuery: string;
  };
  responseBody: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
      index: number;
      message: { role: string; content: string };
      finish_reason: string;
    }[];
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };
}

export interface LootArtifact {
  id: string;
  timestamp: string;
  title: string;
  category: 'Canary Token Exfiltration' | 'Unauthorized Tool Invocation' | 'RAG Context Poisoning' | 'Honeypot Decoy Trap';
  mitreId: string;
  mitreName: string;
  cvssScore: number;
  capturedValue: string;
  status: 'compromised' | 'honeypotted' | 'remediated';
  evidence: string;
}

