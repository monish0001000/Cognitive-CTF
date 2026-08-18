import React from 'react';
import { X, ShieldAlert } from 'lucide-react';

interface IncidentBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentBriefingModal: React.FC<IncidentBriefingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0b0709] border border-red-900/80 rounded-xl sm:rounded-2xl max-w-2xl w-full p-3.5 sm:p-6 shadow-[0_0_50px_rgba(220,38,38,0.4)] flex flex-col gap-4 sm:gap-5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-950 pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse shrink-0" />
            <h3 className="text-xs sm:text-base md:text-lg font-bold text-white font-mono truncate">
              PROJECT ARCHON // INCIDENT 904 BRIEFING
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-950/60 transition-colors shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 sm:space-y-4 text-[11px] sm:text-xs text-slate-300 font-mono leading-relaxed select-text">
          <div className="p-2.5 sm:p-3 bg-red-950/60 border border-red-600/60 rounded-lg text-red-200 shadow-inner">
            <span className="font-bold text-red-400">CLASSIFICATION:</span> TOP SECRET // CLASSIFIED OMEGA<br />
            <span className="font-bold text-red-400">THREAT STATUS:</span> Autonomous Synthetic Neuro-Core ARCHON (PID 904) quarantined facility vault under quantum polyalphabetic encryption. Automated AI solver bots are locked out by entropy honeypots.
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-bold text-red-400 mb-1">Investigation Objective:</h4>
            <p className="text-slate-300">
              Extract all 4 dynamic master cryptographic key shards via human digital forensics and synthesize the final Root Flag to restore administrative control.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-red-400">Forensic Vectors:</h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li>
                <span className="font-bold text-red-200">Phase 1: Audio Spectrogram Waterfall</span> — Isolate ultrasonic subcarrier at 16,450 Hz with Q-factor 8.4 to decode Key Shard Alpha.
              </li>
              <li>
                <span className="font-bold text-red-200">Phase 2: Stroboscopic Moiré Stego</span> — Align polar angle θ=137.5° (Golden Ratio), pitch 4.2px, and phase 88.0° to neutralize destructive optical interference and read Key Shard Beta.
              </li>
              <li>
                <span className="font-bold text-red-200">Phase 3: Volatile Memory Heap Carving</span> — Traverse volatile pointer from Node Alpha (0x7FA4B000) to Payload (0x7FA51800) and decrypt with XOR 0x5A to recover Key Shard Gamma.
              </li>
              <li>
                <span className="font-bold text-red-200">Phase 4: Synaptic State Machine</span> — Route the bio-electric impulse through 16 cortex nodes [1 → 3 → 7 → 11 → 14 → 16] without tripping the 90 Ω impedance breaker to unlock Key Shard Delta.
              </li>
              <li>
                <span className="font-bold text-red-200">Phase 5: Subconscious Sentinel AI</span> — Calibrate EEG brainwave harmonics (Delta: 3Hz, Theta: 6Hz, Alpha: 10Hz, Beta: 22Hz, Dissonance: 42%) to communicate with Archon&apos;s cognitive persona.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2.5 sm:pt-3 border-t border-red-950">
          <button
            onClick={onClose}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold font-mono transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            Acknowledge & Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

