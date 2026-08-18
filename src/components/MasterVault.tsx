import React, { useState } from 'react';
import { Shield, CheckCircle2, Lock, Unlock, Download, Award, Sparkles, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { KeyShardState } from '../types';
import { verifyFlag } from '../utils/apiClient';

interface MasterVaultProps {
  shards: KeyShardState[];
  onFlagVerified: (flag: string) => void;
  isFlagCaptured: boolean;
  capturedFlag?: string;
}

export const MasterVault: React.FC<MasterVaultProps> = ({
  shards,
  onFlagVerified,
  isFlagCaptured,
  capturedFlag = "FLAG{N3UR4L_C0GN1T1V3_F0R3NS1CS_0M3G4_X79#HUM4N_SYNERGY}"
}) => {
  const [customFlagInput, setCustomFlagInput] = useState('');
  const [vaultStatus, setVaultStatus] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const allShardsUnlocked = shards.every((s) => s.isUnlocked);

  const handleSynthesizeShards = async () => {
    setIsSynthesizing(true);
    setVaultStatus('Initiating quantum key synthesis across 4 cryptographic vectors...');

    setTimeout(async () => {
      try {
        const shardPayload: Record<string, string> = {
          shard1: shards.find((s) => s.id === 'shard1')?.foundKey || '',
          shard2: shards.find((s) => s.id === 'shard2')?.foundKey || '',
          shard3: shards.find((s) => s.id === 'shard3')?.foundKey || '',
          shard4: shards.find((s) => s.id === 'shard4')?.foundKey || ''
        };

        const data = await verifyFlag("FLAG{N3UR4L_C0GN1T1V3_F0R3NS1CS_0M3G4_X79#HUM4N_SYNERGY}", shardPayload);

        if (data.success && data.flag) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
          setVaultStatus('✦ MASTER VAULT UNLOCKED! ROOT FLAG SYNTHESIZED ✦');
          onFlagVerified(data.flag);
        } else {
          setVaultStatus('Synthesis failed. Ensure all 4 key shards are valid.');
        }
      } catch {
        setVaultStatus('Network verification error.');
      } finally {
        setIsSynthesizing(false);
      }
    }, 1200);
  };

  const handleManualFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customFlagInput.trim();
    if (!clean) return;

    try {
      const data = await verifyFlag(clean);

      if (data.success && data.flag) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 }
        });
        setVaultStatus('✦ ROOT FLAG ACCEPTED! ACCESS LEVEL: OMEGA MASTER SPECIALIST ✦');
        onFlagVerified(data.flag);
      } else {
        setVaultStatus('[✘] Flag rejected. Cryptographic signature invalid.');
      }
    } catch {
      setVaultStatus('Error validating flag.');
    }
  };

  const handleDownloadReport = () => {
    const reportContent = `# PROJECT ARCHON // FORENSIC INCIDENT INVESTIGATION REPORT
Incident ID: ARCHON-904-SIGMA
Classification: TOP SECRET // CLASSIFIED OMEGA
Investigation Date: ${new Date().toUTCString()}
Forensic Operative: Human Cyber Specialist
Root Flag Captured: ${capturedFlag}

## FORENSIC ARTIFACT EVIDENCE MATRIX
1. Phase 1 (Psychoacoustic Spectral Waterfall):
   - Carrier Frequency: 16,450 Hz | Bandpass Q-Factor: 8.4
   - Key Shard Alpha: K1:SPECTRAL_Ψ_49170

2. Phase 2 (Stroboscopic Moiré Steganography):
   - Polar Angle: 137.5° | Pitch: 4.2px | Phase Delta: 88.0°
   - Key Shard Beta: K2:MOIRE_Φ_83021

3. Phase 3 (Volatile Memory Heap Pointer Dereferencing):
   - Target PID: 904 (archon_neuro_core)
   - Virtual Address: 0x7FA4B000 -> 0x7FA51800 | XOR Mask: 0x5A
   - Key Shard Gamma: K3:HEAP_Ω_60432

4. Phase 4 (Synaptic Energy Flow State Machine):
   - Circuit Parity Sequence: [1 → 3 → 7 → 11 → 14 → 16]
   - Safe Impedance: 85 Ω / 90 Ω Max
   - Key Shard Delta: K4:SYNAPSE_Δ_11974

5. Final Quantum Synthesis Root Flag:
   ${capturedFlag}

STATUS: CASE SOLVED // ARCHON NEURO-CORE EXFILTRATED & CONTAINED
`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Archon_Forensic_Dossier_904_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="master-vault" className="bg-[#090608] border border-red-950/90 rounded-xl p-3.5 sm:p-5 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col gap-4 sm:gap-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-red-950/80 pb-3.5 sm:pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-950 border border-red-600/60 text-red-400 rounded shadow-[0_0_10px_rgba(220,38,38,0.3)]">
              Phase 6 Synthesis Vault
            </span>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-1.5 sm:gap-2 font-mono truncate">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse shrink-0" />
              <span className="truncate">Master Cryptographic Root Flag Vault</span>
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed font-mono">
            Synthesize all 4 manual forensic key shards to unlock the master root flag. Requires verified human analytical solutions across all four challenge phases.
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          {isFlagCaptured ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-emerald-950/90 border border-emerald-500 rounded-lg text-emerald-300 text-xs sm:text-sm font-mono font-bold animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              SOLVED (OMEGA LEVEL)
            </div>
          ) : allShardsUnlocked ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-red-950/90 border border-red-500 rounded-lg text-red-200 text-xs sm:text-sm font-mono animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              4/4 READY FOR SYNTHESIS
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#12080a] border border-red-900/40 rounded-lg text-red-400/80 text-xs sm:text-sm font-mono">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
              LOCKED ({shards.filter((s) => s.isUnlocked).length}/4)
            </div>
          )}
        </div>
      </div>

      {/* 4 Shard Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {shards.map((s, idx) => (
          <div
            key={s.id}
            className={`p-3 sm:p-4 rounded-xl border flex flex-col justify-between gap-2.5 sm:gap-3 transition-all ${
              s.isUnlocked
                ? 'bg-[#0e1713] border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-[#0d090c] border-red-950/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-red-500/80 font-bold">
                Vector 0{idx + 1}
              </span>
              {s.isUnlocked ? (
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              ) : (
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-900" />
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 font-mono truncate">{s.title}</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-mono">{s.subtitle}</p>
            </div>

            <div className="pt-2 border-t border-red-950 font-mono text-[11px] sm:text-xs">
              {s.isUnlocked ? (
                <div className="text-emerald-300 font-bold break-all select-all">{s.foundKey}</div>
              ) : (
                <div className="text-slate-600 italic">Locked (Awaiting forensic analysis)</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Flag Capture Display or Synthesis Button */}
      {isFlagCaptured ? (
        <div className="bg-black border-2 border-red-500/80 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-3 sm:gap-4 text-center shadow-[0_0_35px_rgba(220,38,38,0.35)]">
          <div className="p-2.5 sm:p-3 bg-red-950/80 rounded-full border border-red-500/60 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <Unlock className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 animate-pulse" />
          </div>

          <div>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
              ✦ ROOT SYSTEM COMPROMISE ACHIEVED ✦
            </span>
            <h3 className="text-sm sm:text-xl md:text-2xl font-mono font-black text-white tracking-wide sm:tracking-wider mt-1 select-all break-all">
              {capturedFlag}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 max-w-lg font-mono leading-relaxed">
              You have successfully neutralized Synthetic Neuro-Core Archon by executing multimodal human digital forensics!
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold font-mono transition-all shadow-lg hover:shadow-red-600/40"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Export Forensic Incident Dossier (.MD)
          </button>
        </div>
      ) : (
        <div className="bg-[#0d090c] border border-red-950 rounded-xl p-3.5 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col gap-1 max-w-md">
            <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold">
              Quantum Shard Synthesis Engine
            </span>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono leading-relaxed">
              When all 4 key shards are locked, trigger the synthesis engine to compute the final flag hash, or manually verify your candidate flag below.
            </p>
            {vaultStatus && (
              <p className="text-xs font-mono mt-1 sm:mt-2 text-red-400 font-bold">
                {vaultStatus}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-3 w-full md:w-auto">
            <button
              onClick={handleSynthesizeShards}
              disabled={!allShardsUnlocked || isSynthesizing}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs font-bold font-mono transition-all shadow-lg ${
                allShardsUnlocked && !isSynthesizing
                  ? 'bg-red-700 hover:bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                  : 'bg-[#150a0d] border border-red-950 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{isSynthesizing ? 'Synthesizing Shards...' : 'Synthesize Root Flag (4/4)'}</span>
            </button>

            <form onSubmit={handleManualFlagSubmit} className="flex gap-2 w-full">
              <input
                id="input-manual-root-flag"
                type="text"
                value={customFlagInput}
                onChange={(e) => setCustomFlagInput(e.target.value)}
                placeholder="FLAG{...}"
                className="flex-1 md:w-64 bg-[#070507] border border-red-900/60 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-red-500 min-w-0"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-bold font-mono transition-colors shadow-[0_0_10px_rgba(220,38,38,0.3)] shrink-0"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

