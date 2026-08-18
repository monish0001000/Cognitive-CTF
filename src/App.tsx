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
import { HintsModal } from './components/HintsModal';
import { KeyShardState, HintItem } from './types';
import { fetchHints } from './utils/apiClient';
import { BookOpen, Award } from 'lucide-react';

const INITIAL_SHARDS: KeyShardState[] = [
  {
    id: 'shard1',
    title: 'Shard Alpha: Ultrasonic Spectral Key',
    subtitle: '16.45 kHz Bandpass Q-Factor 8.4 Waterfall Isolation',
    foundKey: '',
    expectedKey: 'K1:SPECTRAL_Ψ_49170',
    isUnlocked: false
  },
  {
    id: 'shard2',
    title: 'Shard Beta: Stroboscopic Moiré Phase Matrix',
    subtitle: 'θ=137.5° Golden Angle & 4.2px Grating Lattice Stego',
    foundKey: '',
    expectedKey: 'K2:MOIRE_Φ_83021',
    isUnlocked: false
  },
  {
    id: 'shard3',
    title: 'Shard Gamma: Volatile Memory Heap Pointer',
    subtitle: 'PID 904 Virtual Heap Dereference & XOR 0x5A Mask',
    foundKey: '',
    expectedKey: 'K3:HEAP_Ω_60432',
    isUnlocked: false
  },
  {
    id: 'shard4',
    title: 'Shard Delta: Synaptic State Machine Parity',
    subtitle: '16-Node Cortex Impedance Balancing [1→3→7→11→14→16]',
    foundKey: '',
    expectedKey: 'K4:SYNAPSE_Δ_11974',
    isUnlocked: false
  }
];

export default function App() {
  const [shards, setShards] = useState<KeyShardState[]>(INITIAL_SHARDS);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isFlagCaptured, setIsFlagCaptured] = useState<boolean>(false);
  const [capturedFlag, setCapturedFlag] = useState<string>('FLAG{N3UR4L_C0GN1T1V3_F0R3NS1CS_0M3G4_X79#HUM4N_SYNERGY}');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);
  const [isHintsOpen, setIsHintsOpen] = useState<boolean>(false);
  const [hints, setHints] = useState<HintItem[]>([]);
  const [scratchpad, setScratchpad] = useState<string>(
    '# FORENSIC OPERATOR SCRATCHPAD\n- Shard 1 Freq: 16,450 Hz, Q: 8.4\n- Shard 2 Angle: 137.5°, Pitch: 4.2px, Phase: 88°\n- Shard 3 XOR Key: 0x5A\n- Shard 4 Circuit: [1 -> 3 -> 7 -> 11 -> 14 -> 16]\n'
  );

  // Timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isFlagCaptured) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isFlagCaptured]);

  // Fetch initial hints from server with static fallback
  useEffect(() => {
    fetchHints().then((data) => {
      if (data && data.length > 0) {
        setHints(data);
      }
    });
  }, []);

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

  return (
    <div className="min-h-screen bg-[#050304] text-slate-100 flex flex-col selection:bg-red-700 selection:text-white">
      {/* Navigation Header */}
      <Header
        score={score}
        maxScore={maxScore}
        elapsedSeconds={elapsedSeconds}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenHints={() => setIsHintsOpen(true)}
        onOpenReport={() => setIsBriefingOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unlockedCount={unlockedCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-6 sm:gap-8">
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

        {/* Dynamic Tab Views */}
        {(activeTab === 'all' || activeTab === 'audio') && (
          <AudioSpectrogramLab
            onUnlockShard={handleUnlockShard}
            isUnlocked={shards.find((s) => s.id === 'shard1')?.isUnlocked || false}
            unlockedKey={shards.find((s) => s.id === 'shard1')?.foundKey}
          />
        )}

        {(activeTab === 'all' || activeTab === 'moire') && (
          <MoireStegoLab
            onUnlockShard={handleUnlockShard}
            isUnlocked={shards.find((s) => s.id === 'shard2')?.isUnlocked || false}
            unlockedKey={shards.find((s) => s.id === 'shard2')?.foundKey}
          />
        )}

        {(activeTab === 'all' || activeTab === 'memory') && (
          <MemoryHeapLab
            onUnlockShard={handleUnlockShard}
            isUnlocked={shards.find((s) => s.id === 'shard3')?.isUnlocked || false}
            unlockedKey={shards.find((s) => s.id === 'shard3')?.foundKey}
          />
        )}

        {(activeTab === 'all' || activeTab === 'synapse') && (
          <SynapticGraphLab
            onUnlockShard={handleUnlockShard}
            isUnlocked={shards.find((s) => s.id === 'shard4')?.isUnlocked || false}
            unlockedKey={shards.find((s) => s.id === 'shard4')?.foundKey}
          />
        )}

        {(activeTab === 'all' || activeTab === 'sentinel') && (
          <SubconsciousSentinelLab />
        )}

        {(activeTab === 'all' || activeTab === 'terminal') && (
          <ForensicTerminal onFlagSubmitted={handleFlagVerified} />
        )}

        {(activeTab === 'all' || activeTab === 'vault') && (
          <MasterVault
            shards={shards}
            onFlagVerified={handleFlagVerified}
            isFlagCaptured={isFlagCaptured}
            capturedFlag={capturedFlag}
          />
        )}

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
      <HintsModal
        isOpen={isHintsOpen}
        onClose={() => setIsHintsOpen(false)}
        hints={hints}
      />
    </div>
  );
}

