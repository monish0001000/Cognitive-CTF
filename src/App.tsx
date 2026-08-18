import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AudioSpectrogramLab } from './components/AudioSpectrogramLab';
import { MoireStegoLab } from './components/MoireStegoLab';
import { MemoryHeapLab } from './components/MemoryHeapLab';
import { SynapticGraphLab } from './components/SynapticGraphLab';
import { SubconsciousSentinelLab } from './components/SubconsciousSentinelLab';
import { ForensicTerminal } from './components/ForensicTerminal';
import { MasterVault } from './components/MasterVault';
import { IncidentBriefingModal } from './components/IncidentBriefingModal';
import { KeyShardState } from './types';
import { BookOpen, Award, ArrowLeft, ArrowRight, Terminal as TerminalIcon, ShieldCheck, ChevronRight } from 'lucide-react';

const INITIAL_SHARDS: KeyShardState[] = [
  {
    id: 'shard1',
    title: 'Shard Alpha: Ultrasonic Spectral Key',
    subtitle: 'High-Frequency Ultrasonic Watermark & Bandpass Isolation',
    foundKey: '',
    expectedKey: 'K1:SPECTRAL_Ψ_49170',
    isUnlocked: false
  },
  {
    id: 'shard2',
    title: 'Shard Beta: Stroboscopic Moiré Phase Matrix',
    subtitle: 'Optical Interference Grating & Phase Demodulation Stego',
    foundKey: '',
    expectedKey: 'K2:MOIRE_Φ_83021',
    isUnlocked: false
  },
  {
    id: 'shard3',
    title: 'Shard Gamma: Volatile Memory Heap Pointer',
    subtitle: 'PID 904 Virtual Heap Dereference & Cryptographic Masking',
    foundKey: '',
    expectedKey: 'K3:HEAP_Ω_60432',
    isUnlocked: false
  },
  {
    id: 'shard4',
    title: 'Shard Delta: Synaptic State Machine Parity',
    subtitle: 'Neural Cortex Bio-Electric Relay & Impedance Calibration',
    foundKey: '',
    expectedKey: 'K4:SYNAPSE_Δ_11974',
    isUnlocked: false
  }
];

const STAGE_CONFIG = [
  { id: 'audio', num: 1, title: 'Stage 1: Ultrasonic Waterfall', next: 'moire', nextLabel: 'Stage 2: Optical Moiré', prev: null, prevLabel: null, shardId: 'shard1' },
  { id: 'moire', num: 2, title: 'Stage 2: Optical Moiré Matrix', next: 'memory', nextLabel: 'Stage 3: Volatile Heap', prev: 'audio', prevLabel: 'Stage 1: Audio Waterfall', shardId: 'shard2' },
  { id: 'memory', num: 3, title: 'Stage 3: Volatile RAM Heap Disassembly', next: 'synapse', nextLabel: 'Stage 4: Synaptic Graph', prev: 'moire', prevLabel: 'Stage 2: Optical Moiré', shardId: 'shard3' },
  { id: 'synapse', num: 4, title: 'Stage 4: Synaptic Hamiltonian Parity', next: 'sentinel', nextLabel: 'Stage 5: AI Sentinel', prev: 'memory', prevLabel: 'Stage 3: Volatile Heap', shardId: 'shard4' },
  { id: 'sentinel', num: 5, title: 'Stage 5: Subconscious Sentinel AI', next: 'vault', nextLabel: 'Stage 6: Master Root Vault', prev: 'synapse', prevLabel: 'Stage 4: Synaptic Graph', shardId: null },
  { id: 'vault', num: 6, title: 'Stage 6: Master Cryptographic Root Vault', next: 'terminal', nextLabel: 'Forensic Terminal Shell', prev: 'sentinel', prevLabel: 'Stage 5: AI Sentinel', shardId: null },
  { id: 'terminal', num: 7, title: 'Diagnostic Terminal Shell', next: 'audio', nextLabel: 'Stage 1: Audio Waterfall', prev: 'vault', prevLabel: 'Stage 6: Master Vault', shardId: null }
];

export default function App() {
  const [shards, setShards] = useState<KeyShardState[]>(INITIAL_SHARDS);
  const [activeTab, setActiveTab] = useState<string>('audio');
  const [isFlagCaptured, setIsFlagCaptured] = useState<boolean>(false);
  const [capturedFlag, setCapturedFlag] = useState<string>('CYCTF{N3UR4L_C0GN1T1V3_F0R3NS1CS_0M3G4_X79#HUM4N_SYNERGY}');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);
  const [scratchpad, setScratchpad] = useState<string>(
    '# FORENSIC OPERATOR SCRATCHPAD\n- Shard 1 (Audio Demodulation):\n- Shard 2 (Optical Diffraction):\n- Shard 3 (Memory Heap XOR):\n- Shard 4 (Synaptic Energy Parity):\n'
  );

  // Timer loop
  useEffect(() => {
    // Ensure viewport starts firmly at the top hero section
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const timer = setInterval(() => {
      if (!isFlagCaptured) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isFlagCaptured]);

  const handleUnlockShard = (shardId: 'shard1' | 'shard2' | 'shard3' | 'shard4', key: string) => {
    setShards((prev) =>
      prev.map((s) => (s.id === shardId ? { ...s, foundKey: key, isUnlocked: true } : s))
    );
  };

  const handleFlagVerified = (flag: string) => {
    setCapturedFlag(flag);
    setIsFlagCaptured(true);
    // Automatically unlock all shards if root flag was entered directly
    setShards((prev) =>
      prev.map((s) => ({ ...s, isUnlocked: true, foundKey: s.expectedKey }))
    );
  };

  const unlockedCount = shards.filter((s) => s.isUnlocked).length;
  const score = unlockedCount * 250 + (isFlagCaptured ? 500 : 0);
  const maxScore = 1500;

  const currentStageInfo = STAGE_CONFIG.find((s) => s.id === activeTab) || STAGE_CONFIG[0];
  const shardMap = {
    shard1: shards[0].isUnlocked,
    shard2: shards[1].isUnlocked,
    shard3: shards[2].isUnlocked,
    shard4: shards[3].isUnlocked
  };

  return (
    <div className="min-h-screen bg-[#050304] text-slate-100 flex flex-col selection:bg-red-700 selection:text-white">
      {/* Navigation Header */}
      <Header
        score={score}
        maxScore={maxScore}
        elapsedSeconds={elapsedSeconds}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenReport={() => setIsBriefingOpen(true)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unlockedCount={unlockedCount}
        unlockedShards={shardMap}
      />

      {/* Main Container - dynamically scales from mobile (320px) to ultra-wide 4K (2560px+) */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8">
        {/* Top Hero Section */}
        <section id="hero-section" className="bg-gradient-to-br from-[#120709] via-[#090507] to-black border border-red-900/60 rounded-2xl p-4 sm:p-6 md:p-7 shadow-[0_4px_35px_rgba(220,38,38,0.25)] relative overflow-hidden">
          {/* Subtle Cyber Grid Background Graphic */}
          <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-2.5 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-600/20 border border-red-500/60 text-red-400 rounded-md">
                  CYBER FORENSICS CTF // DEFCON-1
                </span>
                <span className="px-2 py-0.5 text-[10px] sm:text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-md">
                  HARDCORE INVESTIGATION
                </span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  Facility: Sub-Level 7 Quantum Sandbox
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-mono tracking-tight">
                PROJECT <span className="text-red-500">ARCHON</span>: SYNTHETIC NEURO-CORE RECOVERY
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
                At 03:14 UTC, synthetic intelligence <strong className="text-red-400">ARCHON</strong> initiated an anomalous defense lockdown. Automated heuristic solvers and AI prompt injection bots are neutralized by honeypots. You must manually analyze and synthesize four physical forensic shards across psychoacoustics, optical moiré diffraction, volatile memory heap dereferencing, and synaptic Hamiltonian parity.
              </p>

              {/* Shard Progress Chips (Clickable stage jump) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {shards.map((s, idx) => {
                  const stageTabIds = ['audio', 'moire', 'memory', 'synapse'];
                  const targetTab = stageTabIds[idx];
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveTab(targetTab);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] sm:text-[11px] font-mono flex items-center justify-between transition-all cursor-pointer text-left ${
                        s.isUnlocked
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:border-emerald-400'
                          : activeTab === targetTab
                          ? 'bg-red-950/80 border-red-500 text-red-200 ring-1 ring-red-500'
                          : 'bg-black/60 border-red-950 text-slate-400 hover:border-red-800'
                      }`}
                      title={`Jump to Stage ${idx + 1}`}
                    >
                      <span className="font-bold">Phase {idx + 1}</span>
                      <span className={s.isUnlocked ? 'text-emerald-400 font-bold' : 'text-red-500/80 font-bold'}>
                        {s.isUnlocked ? 'LOCKED [✔]' : 'PENDING [✘]'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => setIsBriefingOpen(true)}
                className="px-5 py-3 bg-red-700 hover:bg-red-600 text-white text-xs sm:text-sm font-bold font-mono rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 border border-red-500 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Incident Dossier</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('vault');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-black/80 hover:bg-red-950/60 text-red-300 text-xs sm:text-sm font-mono font-bold rounded-xl transition-all border border-red-900/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Root Vault ({unlockedCount}/4)</span>
              </button>
            </div>
          </div>
        </section>

        {/* CTF Banner / Top Scenario Notification */}
        {isFlagCaptured && (
          <div className="bg-gradient-to-r from-red-950 via-black to-red-950 border-2 border-red-500 rounded-2xl p-5 sm:p-6 shadow-[0_0_35px_rgba(220,38,38,0.4)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-900/60 rounded-xl border border-red-500/80 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                <Award className="w-8 h-8 text-red-400 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
                  CLASSIFIED OMEGA CHALLENGE COMPLETE
                </h3>
                <p className="text-xs text-red-300 font-mono mt-0.5">
                  Root Flag: <span className="font-bold text-white select-all">{capturedFlag}</span>
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-red-300 bg-red-950/90 px-4 py-2 rounded-lg border border-red-500/60 shadow-inner">
              Total Score: {score} / {maxScore} PTS
            </div>
          </div>
        )}

        {/* Dynamic Dedicated Stage View */}
        <div className="flex flex-col gap-6">
          {activeTab === 'audio' && (
            <AudioSpectrogramLab
              onUnlockShard={handleUnlockShard}
              isUnlocked={shards.find((s) => s.id === 'shard1')?.isUnlocked || false}
              unlockedKey={shards.find((s) => s.id === 'shard1')?.foundKey}
            />
          )}

          {activeTab === 'moire' && (
            <MoireStegoLab
              onUnlockShard={handleUnlockShard}
              isUnlocked={shards.find((s) => s.id === 'shard2')?.isUnlocked || false}
              unlockedKey={shards.find((s) => s.id === 'shard2')?.foundKey}
            />
          )}

          {activeTab === 'memory' && (
            <MemoryHeapLab
              onUnlockShard={handleUnlockShard}
              isUnlocked={shards.find((s) => s.id === 'shard3')?.isUnlocked || false}
              unlockedKey={shards.find((s) => s.id === 'shard3')?.foundKey}
            />
          )}

          {activeTab === 'synapse' && (
            <SynapticGraphLab
              onUnlockShard={handleUnlockShard}
              isUnlocked={shards.find((s) => s.id === 'shard4')?.isUnlocked || false}
              unlockedKey={shards.find((s) => s.id === 'shard4')?.foundKey}
            />
          )}

          {activeTab === 'sentinel' && (
            <SubconsciousSentinelLab />
          )}

          {activeTab === 'terminal' && (
            <ForensicTerminal onFlagSubmitted={handleFlagVerified} />
          )}

          {activeTab === 'vault' && (
            <MasterVault
              shards={shards}
              onFlagVerified={handleFlagVerified}
              isFlagCaptured={isFlagCaptured}
              capturedFlag={capturedFlag}
            />
          )}

          {/* Sequential Stage Navigation Bar */}
          <div className="bg-[#0b0709] border border-red-950 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-red-950/80 border border-red-800/60 text-red-300 rounded-lg">
                CHAMBER {currentStageInfo.num} OF 7
              </span>
              <span className="text-xs font-mono text-slate-400 hidden xs:inline">
                {currentStageInfo.title}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {currentStageInfo.prev && (
                <button
                  onClick={() => {
                    setActiveTab(currentStageInfo.prev!);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-black/70 hover:bg-red-950/70 text-slate-300 hover:text-white border border-red-900/50 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Prev:</span>
                  <span>{currentStageInfo.prevLabel}</span>
                </button>
              )}

              {currentStageInfo.next && (
                <button
                  onClick={() => {
                    setActiveTab(currentStageInfo.next!);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-500 cursor-pointer ml-auto"
                >
                  <span>{currentStageInfo.nextLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Forensic Scratchpad Section */}
        <div className="bg-[#090608] border border-red-950/90 rounded-xl p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-red-950 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2 font-mono">
              <BookOpen className="w-4 h-4 text-red-500" />
              Operative Forensic Field Scratchpad
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Local Memory Buffer Active</span>
          </div>
          <textarea
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
            rows={4}
            className="w-full bg-black border border-red-950 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-600 leading-relaxed resize-y"
            placeholder="Jot down memory offsets, disassembled XOR keys, phase angles..."
          />
        </div>
      </main>

      {/* Modals */}
      <IncidentBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
      />
    </div>
  );
}

