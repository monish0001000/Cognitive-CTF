import React, { useState } from 'react';
import { Share2, Zap, RotateCcw, Sparkles, CheckCircle2, ShieldAlert, Key } from 'lucide-react';
import { CortexNode } from '../types';
import { verifyShard } from '../utils/apiClient';

interface SynapticGraphLabProps {
  onUnlockShard: (shardId: 'shard4', key: string) => void;
  isUnlocked: boolean;
  unlockedKey?: string;
}

const INITIAL_NODES: CortexNode[] = [
  { id: 1, name: 'Prefrontal [INIT]', type: 'cortex', impedanceOhms: 12, x: 60, y: 80, active: true, connections: [2, 3, 4] },
  { id: 2, name: 'Motor Cortex', type: 'cortex', impedanceOhms: 35, x: 180, y: 50, active: false, connections: [1, 5] },
  { id: 3, name: 'Thalamus [RELAY]', type: 'relay', impedanceOhms: 15, x: 160, y: 140, active: false, connections: [1, 6, 7] },
  { id: 4, name: 'Parietal Lobe', type: 'cortex', impedanceOhms: 40, x: 80, y: 220, active: false, connections: [1, 8] },
  { id: 5, name: 'Sensory Strip', type: 'cortex', impedanceOhms: 45, x: 300, y: 60, active: false, connections: [2, 9] },
  { id: 6, name: 'Cerebellum', type: 'subcortex', impedanceOhms: 50, x: 260, y: 150, active: false, connections: [3, 10] },
  { id: 7, name: 'Hippocampus [MEM]', type: 'subcortex', impedanceOhms: 18, x: 240, y: 230, active: false, connections: [3, 11, 12] },
  { id: 8, name: 'Occipital Lobe', type: 'cortex', impedanceOhms: 60, x: 140, y: 290, active: false, connections: [4, 12] },
  { id: 9, name: 'Basal Ganglia', type: 'subcortex', impedanceOhms: 55, x: 420, y: 70, active: false, connections: [5, 13] },
  { id: 10, name: 'Brainstem Bridge', type: 'subcortex', impedanceOhms: 65, x: 380, y: 150, active: false, connections: [6, 13, 14] },
  { id: 11, name: 'Broca Area [SYN]', type: 'relay', impedanceOhms: 14, x: 360, y: 240, active: false, connections: [7, 14, 15] },
  { id: 12, name: 'Wernicke Area', type: 'cortex', impedanceOhms: 48, x: 260, y: 310, active: false, connections: [7, 8, 15] },
  { id: 13, name: 'Hypothalamus', type: 'subcortex', impedanceOhms: 70, x: 500, y: 100, active: false, connections: [9, 10, 16] },
  { id: 14, name: 'Amygdala [GATE]', type: 'relay', impedanceOhms: 16, x: 480, y: 190, active: false, connections: [10, 11, 16] },
  { id: 15, name: 'Temporal Lobe', type: 'cortex', impedanceOhms: 52, x: 400, y: 310, active: false, connections: [11, 12, 16] },
  { id: 16, name: 'Archon Core [VAULT]', type: 'core', impedanceOhms: 10, x: 580, y: 220, active: false, connections: [13, 14, 15] }
];

export const SynapticGraphLab: React.FC<SynapticGraphLabProps> = ({
  onUnlockShard,
  isUnlocked,
  unlockedKey = "K4:SYNAPSE_Δ_11974"
}) => {
  const [activePath, setActivePath] = useState<number[]>([1]);
  const [inputKey, setInputKey] = useState('');
  const [keyStatus, setKeyStatus] = useState<string | null>(null);
  const [circuitTrip, setCircuitTrip] = useState(false);
  const [stabilizerActive, setStabilizerActive] = useState(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  const TARGET_PARITY_PATH = [1, 3, 7, 11, 14, 16];

  // Calculate total circuit impedance & capacitance
  const totalImpedance = activePath.reduce((acc, id) => {
    const node = INITIAL_NODES.find((n) => n.id === id);
    return acc + (node?.impedanceOhms || 0);
  }, 0);

  const totalCapacitancePf = activePath.length * 14.5;
  const signalDelayMs = (totalImpedance * 0.12).toFixed(1);

  const isSolved =
    activePath.length === TARGET_PARITY_PATH.length &&
    activePath.every((val, idx) => val === TARGET_PARITY_PATH[idx]);

  const handleNodeClick = (targetId: number) => {
    if (circuitTrip) return;
    const currentId = activePath[activePath.length - 1];
    const currentNode = INITIAL_NODES.find((n) => n.id === currentId);

    // If clicking the current head node, step backwards
    if (targetId === currentId && activePath.length > 1) {
      setActivePath(activePath.slice(0, -1));
      return;
    }

    // Check if target node is directly connected
    if (currentNode && currentNode.connections.includes(targetId)) {
      if (activePath.includes(targetId)) {
        // Prevent loop
        return;
      }
      const newPath = [...activePath, targetId];
      const newImpedance = newPath.reduce((acc, id) => {
        const node = INITIAL_NODES.find((n) => n.id === id);
        return acc + (node?.impedanceOhms || 0);
      }, 0);

      // Check current threshold (max 90 Ω)
      if (newImpedance > 90) {
        setCircuitTrip(true);
        setTimeout(() => setCircuitTrip(false), 2000);
        return;
      }

      setActivePath(newPath);
    }
  };

  const handleReset = () => {
    setActivePath([1]);
    setCircuitTrip(false);
  };

  const handleSubmitKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) return;

    try {
      const data = await verifyShard('shard4', cleanKey);
      if (data.valid) {
        setKeyStatus('SUCCESS: Master Shard Delta Authenticated & Locked!');
        onUnlockShard('shard4', cleanKey);
      } else {
        setKeyStatus('ERROR: Invalid synapse key. Check parity circuit flow.');
      }
    } catch {
      setKeyStatus('Network error during verification.');
    }
  };

  const hoveredNode = hoveredNodeId ? INITIAL_NODES.find(n => n.id === hoveredNodeId) : null;

  return (
    <div id="synaptic-graph-lab" className="bg-[#090608] border border-red-950/90 rounded-xl p-3.5 sm:p-5 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-red-950/80 pb-3.5 sm:pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-950 border border-red-600/60 text-red-400 rounded shadow-[0_0_10px_rgba(220,38,38,0.3)]">
              Phase 4 Forensics
            </span>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-1.5 sm:gap-2 font-mono truncate">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse shrink-0" />
              <span className="truncate">Synaptic Energy Flow & Bio-Electric Graph</span>
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed font-mono">
            Route the bio-electric pulse across the neural cortex nodes from Node 1 to Archon Core (Node 16). Balance pathway impedances to avoid tripping the circuit breaker and extract Key Shard Delta.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-300 text-xs sm:text-sm font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              SHARD DELTA UNLOCKED
            </div>
          ) : isSolved ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-red-950/90 border border-red-500 rounded-lg text-red-200 text-xs sm:text-sm font-mono animate-bounce shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              RESONANCE HARMONIZED
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#12080a] border border-red-900/40 rounded-lg text-red-400/80 text-xs sm:text-sm font-mono">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
              OPEN ({activePath.length}/6 | {totalImpedance}Ω)
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Interactive SVG Graph */}
        <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
          <div className={`relative bg-black rounded-xl overflow-hidden border transition-all ${circuitTrip ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.6)]' : 'border-red-950 shadow-inner'}`}>
            <svg viewBox="0 0 660 380" className="w-full h-56 sm:h-80 md:h-96">
              {/* Circuit Connections */}
              {INITIAL_NODES.map((node) =>
                node.connections.map((targetId) => {
                  if (node.id > targetId) return null;
                  const target = INITIAL_NODES.find((n) => n.id === targetId);
                  if (!target) return null;

                  const isPathEdge =
                    activePath.includes(node.id) &&
                    activePath.includes(target.id) &&
                    Math.abs(activePath.indexOf(node.id) - activePath.indexOf(target.id)) === 1;

                  return (
                    <line
                      key={`${node.id}-${target.id}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isPathEdge ? '#ef4444' : '#301319'}
                      strokeWidth={isPathEdge ? 3.5 : 1.5}
                      strokeDasharray={isPathEdge ? 'none' : '4 4'}
                    />
                  );
                })
              )}

              {/* Node Glyphs */}
              {INITIAL_NODES.map((node) => {
                const isActive = activePath.includes(node.id);
                const isHead = activePath[activePath.length - 1] === node.id;
                const isStart = node.id === 1;
                const isEnd = node.id === 16;

                let fill = '#0a0507';
                let stroke = '#450a0a';
                if (isActive) {
                  fill = isHead ? '#991b1b' : '#450a0a';
                  stroke = '#ef4444';
                } else if (isStart) {
                  stroke = '#f87171';
                } else if (isEnd) {
                  stroke = '#dc2626';
                }

                return (
                  <g
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="cursor-pointer transition-transform hover:scale-110 select-none"
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isHead ? 18 : 15}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={2.5}
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {node.id}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 26}
                      textAnchor="middle"
                      fill={isActive ? '#fca5a5' : '#7f1d1d'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {node.name.split(' ')[0]} ({node.impedanceOhms}Ω)
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hovered Node Diagnostics Tooltip */}
            {hoveredNode && (
              <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-black/90 border border-red-900/80 px-2 py-1 rounded text-[10px] sm:text-[11px] font-mono text-slate-300 backdrop-blur-sm pointer-events-none max-w-[calc(100%-16px)]">
                <span className="text-red-400 font-bold">Node #{hoveredNode.id}: {hoveredNode.name}</span>
                <div className="text-[9px] sm:text-[10px] text-slate-400">
                  {hoveredNode.type.toUpperCase()} | {hoveredNode.impedanceOhms} Ω | Links: [{hoveredNode.connections.join(', ')}]
                </div>
              </div>
            )}

            {/* Solved Overlay */}
            {isSolved && (
              <div className="absolute inset-x-2 bottom-2 sm:inset-x-0 sm:bottom-4 mx-auto w-fit max-w-[90%] sm:max-w-md bg-black/95 border-2 border-red-500/90 shadow-[0_0_30px_rgba(220,38,38,0.5)] backdrop-blur-md rounded-xl p-2.5 sm:p-3 text-center transition-all animate-pulse">
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-400 font-mono">
                  ✦ Synaptic Circuit Stabilized ✦
                </div>
                <div className="text-xs sm:text-base md:text-lg font-mono font-black text-white tracking-wider sm:tracking-widest mt-0.5 select-all break-all">
                  K4:SYNAPSE_Δ_11974
                </div>
                <p className="text-[9px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 font-mono">
                  Impedance: 85 Ω / 90 Ω max | Sequence Verified!
                </p>
              </div>
            )}

            {/* Trip Warning Banner */}
            {circuitTrip && (
              <div className="absolute inset-0 bg-red-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 text-center">
                <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 animate-bounce" />
                <div className="text-xs sm:text-sm font-bold text-red-200 uppercase tracking-wider font-mono">
                  Circuit Breaker Tripped!
                </div>
                <div className="text-[11px] sm:text-xs text-red-300 font-mono">
                  Impedance exceeded 90 Ω safety threshold. Resetting circuit path...
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 bg-[#0d090c] border border-red-950 rounded-xl p-2.5 sm:p-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] sm:text-xs text-slate-400 font-mono">Impedance:</span>
                <span className={`text-[11px] sm:text-xs font-mono font-bold ${totalImpedance > 90 ? 'text-red-400 animate-pulse' : 'text-red-300'}`}>
                  {totalImpedance} Ω / 90 Ω
                </span>
              </div>
              <span className="text-red-900 hidden sm:inline">|</span>
              <div className="text-[11px] sm:text-xs text-slate-400 font-mono">
                Cap: <span className="text-amber-300">{totalCapacitancePf} pF</span>
              </div>
              <span className="text-red-900 hidden sm:inline">|</span>
              <div className="text-[11px] sm:text-xs text-slate-400 font-mono">
                Delay: <span className="text-slate-200">{signalDelayMs} ms</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setStabilizerActive(!stabilizerActive)}
                className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                  stabilizerActive ? 'bg-red-950 text-red-200 border-red-700' : 'bg-[#12080a] text-slate-500 border-red-950'
                }`}
              >
                Jitter Lock: {stabilizerActive ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#170b0e] hover:bg-red-950 border border-red-900/60 text-red-200 rounded text-xs font-mono transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-red-400" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Sequence Rules & Key Submission */}
        <div className="flex flex-col justify-between gap-4 bg-[#0d090c] border border-red-950 rounded-xl p-3.5 sm:p-5">
          <div className="flex flex-col gap-3.5 sm:gap-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-400 border-b border-red-950 pb-2 flex items-center gap-2 font-mono">
              <Share2 className="w-4 h-4 text-red-500" />
              Routing Matrix
            </h3>

            <div className="flex flex-col gap-2 text-xs text-slate-400 font-mono leading-relaxed">
              <p>
                Route electrical flow along the critical synaptic relay nodes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] sm:text-xs">
                <li>Start at <span className="text-red-300 font-bold">Node 1 (Prefrontal)</span></li>
                <li>Relay through <span className="text-red-400 font-bold">Node 3 (Thalamus)</span></li>
                <li>Route via <span className="text-red-400 font-bold">Node 7 (Hippocampus)</span></li>
                <li>Switch at <span className="text-red-400 font-bold">Node 11 (Broca)</span></li>
                <li>Gated at <span className="text-red-400 font-bold">Node 14 (Amygdala)</span></li>
                <li>Terminate in <span className="text-red-500 font-bold">Node 16 (Core)</span></li>
              </ul>
            </div>
          </div>

          {/* Key Submission Form */}
          <form onSubmit={handleSubmitKey} className="flex flex-col gap-2 border-t border-red-950 pt-3">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Authenticate Key Shard Delta:
            </label>
            <div className="flex gap-2">
              <input
                id="input-shard4-key"
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="e.g. K4:SYNAPSE_Δ_11974"
                className="flex-1 bg-[#070507] border border-red-900/60 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-red-500 min-w-0"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-xs font-bold font-mono transition-colors shadow-[0_0_10px_rgba(220,38,38,0.4)] shrink-0"
              >
                Verify
              </button>
            </div>
            {keyStatus && (
              <p className={`text-[11px] font-mono mt-1 ${keyStatus.startsWith('SUCCESS') ? 'text-emerald-400' : 'text-red-400'}`}>
                {keyStatus}
              </p>
            )}
            {isUnlocked && (
              <div className="mt-1 p-2 bg-emerald-950/40 border border-emerald-600/40 rounded text-emerald-300 text-xs font-mono break-all">
                Locked: {unlockedKey}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

