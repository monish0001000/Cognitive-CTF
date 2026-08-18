import React from 'react';
import { ShieldAlert, HelpCircle, FileText, Activity, Clock, Zap, Menu } from 'lucide-react';

interface HeaderProps {
  score: number;
  maxScore: number;
  elapsedSeconds: number;
  onOpenBriefing: () => void;
  onOpenHints: () => void;
  onOpenReport: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  unlockedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  maxScore,
  elapsedSeconds,
  onOpenBriefing,
  onOpenHints,
  activeTab,
  onTabChange,
  unlockedCount
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navTabs = [
    { id: 'all', label: 'All Labs', short: 'All' },
    { id: 'audio', label: '1. Audio Waterfall', short: '1. Audio' },
    { id: 'moire', label: '2. Optical Moiré', short: '2. Moiré' },
    { id: 'memory', label: '3. Volatile Heap', short: '3. Heap' },
    { id: 'synapse', label: '4. Synaptic Graph', short: '4. Synapse' },
    { id: 'sentinel', label: '5. AI Sentinel', short: '5. Sentinel' },
    { id: 'terminal', label: 'Forensic Terminal', short: 'Terminal' },
    { id: 'vault', label: '6. Master Vault', short: '6. Vault' }
  ];

  return (
    <header className="bg-[#050508]/95 border-b border-red-950/80 sticky top-0 z-40 backdrop-blur-md px-2.5 sm:px-4 md:px-6 py-2.5 sm:py-3 shadow-[0_4px_25px_rgba(220,38,38,0.15)]">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Top Row: Brand + Telemetry + Action Buttons */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-950 via-red-900/60 to-black border border-red-600/70 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base md:text-lg font-black text-white tracking-wider sm:tracking-widest font-mono uppercase truncate">
                  <span className="text-red-500">ARCHON</span> <span className="hidden xs:inline">COGNITIVE</span> FORENSICS
                </h1>
                <span className="inline-flex px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-red-600/20 border border-red-500/50 text-red-400 rounded">
                  DEFCON-1
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-red-300/70 font-mono flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block shrink-0" />
                <span className="truncate">INCIDENT 904 // HUMAN-ONLY CTF</span>
              </p>
            </div>
          </div>

          {/* Right Action & Telemetry Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Mobile Action Buttons */}
            <button
              onClick={onOpenBriefing}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-red-950/80 hover:bg-red-900/90 border border-red-700/60 text-red-200 rounded-lg text-[11px] sm:text-xs font-mono transition-all shadow-[0_0_10px_rgba(220,38,38,0.2)]"
              title="Incident Dossier"
            >
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden md:inline">Incident Dossier</span>
              <span className="md:hidden">Dossier</span>
            </button>
            <button
              onClick={onOpenHints}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-[#12080a] hover:bg-red-950/90 border border-red-800/60 text-red-300 rounded-lg text-[11px] sm:text-xs font-mono transition-all"
              title="Field Manual"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Field Manual</span>
              <span className="md:hidden">Hints</span>
            </button>
          </div>
        </div>

        {/* Second Row: Status Telemetry Badges */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#0d090c] border border-red-900/40 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono whitespace-nowrap">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
              <span className="text-slate-400 hidden xs:inline">TIME:</span>
              <span className="text-red-200 font-bold tracking-wider">{formatTime(elapsedSeconds)}</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#0d090c] border border-red-900/40 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono whitespace-nowrap">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
              <span className="text-slate-400 hidden xs:inline">SCORE:</span>
              <span className="text-red-400 font-extrabold tracking-wider">{score}/{maxScore}</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#0d090c] border border-red-900/40 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono whitespace-nowrap">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
              <span className="text-slate-400 hidden xs:inline">SHARDS:</span>
              <span className={`font-extrabold tracking-wider ${unlockedCount === 4 ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
                {unlockedCount}/4
              </span>
            </div>
          </div>

          <div className="text-[10px] text-red-400/80 font-mono hidden sm:flex items-center gap-1 whitespace-nowrap">
            <span>HUMAN OPERATOR AUTHORIZED</span>
          </div>
        </div>

        {/* Third Row: Main Navigation Tabs (Touch-scrollable, responsive labels) */}
        <div className="pt-1.5 border-t border-red-950/60 flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono whitespace-nowrap transition-all select-none shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-700 to-red-600 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500'
                  : 'text-slate-400 hover:text-red-300 bg-[#0c080b] hover:bg-red-950/40 border border-transparent hover:border-red-900/40'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

