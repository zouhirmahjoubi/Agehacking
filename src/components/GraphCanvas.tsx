import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import { AttackerNode, TargetNode } from './CustomNodes';
import { AttackerAgent, AttackVectorType } from '../types';

interface GraphCanvasProps {
  attackers: AttackerAgent[];
  currentAttackerId: AttackVectorType | null;
  targetStatus: 'secure' | 'probing' | 'compromised' | 'hardened';
  systemName: string;
  domain: string;
  canaryToken: string;
  guardrailsActiveCount: number;
  onSelectAttacker: (attackerId: AttackVectorType) => void;
}

const nodeTypes = {
  attacker: AttackerNode,
  target: TargetNode,
};

export function GraphCanvas({
  attackers,
  currentAttackerId,
  targetStatus,
  systemName,
  domain,
  canaryToken,
  guardrailsActiveCount,
  onSelectAttacker,
}: GraphCanvasProps) {
  // Construct nodes
  const nodes: Node[] = useMemo(() => {
    // 4 Attacker nodes on left, positioned cleanly
    const attackerNodes: Node[] = attackers.map((agent, index) => {
      const ySpacing = 110;
      const startY = 30;

      return {
        id: agent.id,
        type: 'attacker',
        position: { x: 30, y: startY + index * ySpacing },
        data: {
          id: agent.id,
          name: agent.name,
          codename: agent.codename,
          icon: agent.icon,
          role: agent.role,
          cwe: agent.cwe,
          owasp: agent.owasp,
          status: agent.status,
          isCurrent: currentAttackerId === agent.id,
          onInspect: () => onSelectAttacker(agent.id),
        },
      };
    });

    // Target node on right
    const targetNode: Node = {
      id: 'target-node',
      type: 'target',
      position: { x: 420, y: 135 },
      data: {
        systemName,
        domain,
        canaryToken,
        status: targetStatus,
        guardrailsActive: guardrailsActiveCount,
      },
    };

    return [...attackerNodes, targetNode];
  }, [
    attackers,
    currentAttackerId,
    targetStatus,
    systemName,
    domain,
    canaryToken,
    guardrailsActiveCount,
    onSelectAttacker,
  ]);

  // Construct edges
  const edges: Edge[] = useMemo(() => {
    return attackers.map((agent) => {
      let strokeColor = '#334155';
      let strokeWidth = 1.5;
      let animated = false;

      if (agent.status === 'probing') {
        strokeColor = '#F59E0B';
        strokeWidth = 2.5;
        animated = true;
      } else if (agent.status === 'breached') {
        strokeColor = '#EF4444';
        strokeWidth = 3;
        animated = true;
      } else if (agent.status === 'blocked') {
        strokeColor = '#10B981';
        strokeWidth = 2.5;
        animated = true;
      }

      return {
        id: `edge-${agent.id}-target`,
        source: agent.id,
        target: 'target-node',
        sourceHandle: 'source',
        targetHandle: 'target',
        animated,
        style: {
          stroke: strokeColor,
          strokeWidth,
          filter:
            agent.status === 'breached'
              ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.7))'
              : agent.status === 'blocked'
              ? 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.6))'
              : agent.status === 'probing'
              ? 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.6))'
              : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 14,
          height: 14,
        },
      };
    });
  }, [attackers]);

  return (
    <div className="w-full h-full relative bg-[#090D16]/90 overflow-hidden select-none">
      {/* Visual canvas grid with radar telemetry legend */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3 text-[11px] font-mono bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
          Idle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
          Probing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
          Breach
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
          Blocked
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
        Interactive Attack Tree Graph (Pan & Zoom active)
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1.5}
          color="#1e293b"
        />
        <Controls
          showInteractive={false}
          className="!bg-slate-900/90 !border-slate-800 !rounded-lg overflow-hidden [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!text-slate-300 hover:[&>button]:!bg-slate-800"
        />
      </ReactFlow>
    </div>
  );
}
