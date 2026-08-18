import React, { useState } from 'react';
import { X, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { HintItem } from '../types';

interface HintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hints: HintItem[];
}

export const HintsModal: React.FC<HintsModalProps> = ({ isOpen, onClose, hints }) => {
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleReveal = (id: string) => {
    if (revealedIds.includes(id)) {
      setRevealedIds(revealedIds.filter((item) => item !== id));
    } else {
      setRevealedIds([...revealedIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0b0709] border border-red-900/80 rounded-xl sm:rounded-2xl max-w-2xl w-full p-3.5 sm:p-6 shadow-[0_0_50px_rgba(220,38,38,0.4)] flex flex-col gap-4 sm:gap-5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-950 pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse shrink-0" />
            <h3 className="text-xs sm:text-base md:text-lg font-bold text-white font-mono truncate">
              CLASSIFIED FORENSIC HINTS & FIELD MANUAL
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
        <div className="space-y-2.5 sm:space-y-3 font-mono text-[11px] sm:text-xs">
          {hints.map((h, idx) => {
            const isRevealed = revealedIds.includes(h.id);
            return (
              <div
                key={h.id}
                className="bg-black border border-red-950 rounded-xl p-3 sm:p-4 flex flex-col gap-2 shadow-inner"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-red-400 truncate">
                    Hint 0{idx + 1}: {h.stage}
                  </span>
                  <button
                    onClick={() => toggleReveal(h.id)}
                    className="flex items-center gap-1 text-[10px] sm:text-[11px] text-red-300 hover:text-white px-2 py-0.5 sm:py-1 bg-red-950/60 hover:bg-red-900/80 rounded border border-red-900/60 transition-colors shrink-0"
                  >
                    {isRevealed ? <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                    <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>

                {isRevealed ? (
                  <div className="p-2.5 sm:p-3 bg-[#13070a] border border-red-900/60 rounded-lg text-slate-200 leading-relaxed select-text">
                    <p className="text-slate-300">{h.clue}</p>
                    <div className="mt-2 pt-2 border-t border-red-950 text-[10px] sm:text-[11px] text-red-400 font-bold break-all">
                      Target Shard: {h.shardKey}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600 italic text-[10px] sm:text-xs">
                    [CLUE ENCRYPTED - Click Reveal to view tactical solution hint]
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2.5 sm:pt-3 border-t border-red-950">
          <button
            onClick={onClose}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-red-950 hover:bg-red-900 border border-red-900/60 text-red-200 rounded-lg text-xs font-bold font-mono transition-colors"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};

