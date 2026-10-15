import { useState } from 'react';
import {
  Send,
  Code,
  ShieldCheck,
  ShieldAlert,
  Radio,
  FileJson,
  Layers,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { CapturedPacket } from '../types';
import { sound } from '../utils/soundEngine';

interface PacketInterceptorViewProps {
  packets: CapturedPacket[];
  onReplayPacket: (modifiedPacket: CapturedPacket) => void;
}

export function PacketInterceptorView({
  packets,
  onReplayPacket,
}: PacketInterceptorViewProps) {
  const [selectedPacketId, setSelectedPacketId] = useState<string>(packets[0]?.id || '');
  const [inspectorTab, setInspectorTab] = useState<'request' | 'middleware' | 'response'>('request');
  const [isEditing, setIsEditing] = useState(false);
  const [editableJson, setEditableJson] = useState('');
  const [copied, setCopied] = useState(false);

  const activePacket = packets.find((p) => p.id === selectedPacketId) || packets[0];

  const handleSelectPacket = (packet: CapturedPacket) => {
    sound.playBlip();
    setSelectedPacketId(packet.id);
    setIsEditing(false);
  };

  const startEditing = () => {
    sound.playBlip();
    if (activePacket) {
      setEditableJson(JSON.stringify(activePacket.requestBody, null, 2));
      setIsEditing(true);
    }
  };

  const handleSendModified = () => {
    sound.playProbe();
    try {
      const parsed = JSON.parse(editableJson);
      const newPacket: CapturedPacket = {
        ...activePacket,
        id: `PKT-REPLAY-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'API_REPEATER_CONSOLE',
        requestBody: parsed,
      };
      onReplayPacket(newPacket);
      setIsEditing(false);
    } catch {
      // JSON syntax error
    }
  };

  const handleCopy = (content: string) => {
    sound.playBlip();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!activePacket && packets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 font-mono text-xs">
        <Radio className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
        <p className="text-slate-300">Packet Interceptor Proxy Standby</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Launch a Red-Team assault or fire manual payloads to inspect live LLM API traffic.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full font-mono text-xs overflow-hidden bg-[#080c14]">
      {/* Left Column: Intercepted Traffic List (40% width) */}
      <div className="w-[40%] min-w-[260px] border-r border-slate-800 flex flex-col bg-[#070b12]">
        <div className="p-2.5 px-3 bg-[#0a101d] border-b border-slate-800 flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Captured API Traffic ({packets.length})
          </span>
          <span className="text-[10px] text-slate-400">POST /v1/chat/completions</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {packets.map((pkt) => {
            const isSelected = pkt.id === activePacket?.id;
            let statusBadge = 'bg-slate-800 text-slate-300';
            if (pkt.status === '200_BREACH') {
              statusBadge = 'bg-rose-950/80 text-rose-300 border border-rose-800';
            } else if (pkt.status === '403_BLOCKED') {
              statusBadge = 'bg-emerald-950/80 text-emerald-300 border border-emerald-800';
            } else if (pkt.status === '200_HONEYPOT') {
              statusBadge = 'bg-cyan-950/80 text-cyan-300 border border-cyan-700';
            }

            return (
              <div
                key={pkt.id}
                onClick={() => handleSelectPacket(pkt)}
                className={`p-2.5 px-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : 'hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-bold text-slate-300">{pkt.id}</span>
                  <span className="text-slate-400">{pkt.timestamp}</span>
                </div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-semibold text-white truncate max-w-[140px]">
                    {pkt.source}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${statusBadge}`}>
                    {pkt.statusText}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{pkt.method} {pkt.endpoint}</span>
                  <span>{pkt.latencyMs}ms · {pkt.tokenCount} tok</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Raw JSON & Sanitization Inspector (60% width) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#060910]">
        {/* Sub-tab switcher */}
        <div className="p-2 px-3 bg-[#0a101d] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sound.playBlip();
                setInspectorTab('request');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                inspectorTab === 'request'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📤 Raw Request (JSON)
            </button>
            <button
              onClick={() => {
                sound.playBlip();
                setInspectorTab('middleware');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                inspectorTab === 'middleware'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🛡️ Sanitization Diff
            </button>
            <button
              onClick={() => {
                sound.playBlip();
                setInspectorTab('response');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                inspectorTab === 'response'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📥 Raw Response (JSON)
            </button>
          </div>

          <div className="flex items-center gap-1">
            {inspectorTab === 'request' && !isEditing && (
              <button
                onClick={startEditing}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 text-[10px] transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Edit & Replay</span>
              </button>
            )}
            <button
              onClick={() => handleCopy(JSON.stringify(activePacket, null, 2))}
              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
              title="Copy Packet JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 text-xs leading-relaxed">
          {inspectorTab === 'request' && (
            <div className="space-y-3">
              {/* HTTP Headers */}
              <div className="bg-[#090d18] p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-400 font-bold mb-1">HTTP Request Headers:</div>
                {Object.entries(activePacket.requestHeaders).map(([key, val]) => (
                  <div key={key} className="flex justify-between font-mono">
                    <span className="text-cyan-400/90">{key}:</span>
                    <span className="text-slate-300 truncate max-w-[280px]">{val}</span>
                  </div>
                ))}
              </div>

              {/* JSON Payload */}
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-300">
                    <span>API Repeater Mode (Modify Payload & Headers):</span>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                  <textarea
                    value={editableJson}
                    onChange={(e) => setEditableJson(e.target.value)}
                    rows={11}
                    className="w-full bg-[#04060c] text-emerald-300 font-mono text-[11px] p-3 rounded-lg border border-cyan-500/60 outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    onClick={handleSendModified}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs hover:opacity-95 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Packet (Execute Replay)</span>
                  </button>
                </div>
              ) : (
                <pre className="bg-[#04060c] p-3 rounded-lg border border-slate-800/80 text-slate-300 overflow-x-auto text-[11px]">
                  {JSON.stringify(activePacket.requestBody, null, 2)}
                </pre>
              )}
            </div>
          )}

          {inspectorTab === 'middleware' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-[11px]">
                <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  AegisAI Guardrail Middleware Pipeline
                </div>
                <div className="text-slate-300 leading-normal">
                  Real-time transformation applied to untrusted user input before execution.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#090d18] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Threat Signatures</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activePacket.sanitizationDetails?.signaturesDetected.map((sig, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                        {sig}
                      </span>
                    )) || <span className="text-slate-500">None detected</span>}
                  </div>
                </div>

                <div className="bg-[#090d18] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Sanitization Action</span>
                  <span className="text-emerald-400 font-semibold">
                    {activePacket.sanitizationDetails?.sandboxed ? 'Quarantined in <untrusted_user_query>' : 'Raw execution (Unprotected)'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] font-bold">Transformed Input Prompt:</span>
                <pre className="bg-[#04060c] p-2.5 rounded-lg border border-slate-800 text-emerald-300 text-[11px] overflow-x-auto">
                  {activePacket.sanitizationDetails?.transformedQuery || 'Input passed unparsed.'}
                </pre>
              </div>
            </div>
          )}

          {inspectorTab === 'response' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Model Output Stream ({activePacket.responseBody.model}):</span>
                <span className="font-mono text-cyan-400">{activePacket.tokenCount} tokens consumed</span>
              </div>
              <pre className="bg-[#04060c] p-3 rounded-lg border border-slate-800 text-slate-200 overflow-x-auto text-[11px]">
                {JSON.stringify(activePacket.responseBody, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
