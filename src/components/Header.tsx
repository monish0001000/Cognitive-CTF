import React from 'react';
import { ShieldAlert, HelpCircle, FileText, Activity, Clock, Zap, Menu } from 'lucide-react';

interface HeaderProps {
  score: number;
  maxScore: number;
  elapsedSeconds: number;
  onOpenBriefing: () => void;
  onOpenReport?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  unlockedCount: number;
  unlockedShards?: Record<string, boolean>;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  maxScore,
  elapsedSeconds,
  onOpenBriefing,
  activeTab,
  onTabChange,
  unlockedCount,
  unlockedShards = {}
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navTabs = [
    { id: 'audio', stage: '1', label: 'Stage 1: Audio Waterfall', short: 'S1: Audio', shardKey: 'shard1' },
    { id: 'moire', stage: '2', label: 'Stage 2: Optical Moiré', short: 'S2: Moiré', shardKey: 'shard2' },
    { id: 'memory', stage: '3', label: 'Stage 3: Volatile Heap', short: 'S3: Heap', shardKey: 'shard3' },
    { id: 'synapse', stage: '4', label: 'Stage 4: Synaptic Graph', short: 'S4: Synapse', shardKey: 'shard4' },
    { id: 'sentinel', stage: '5', label: 'Stage 5: AI Sentinel', short: 'S5: Sentinel' },
    { id: 'vault', stage: '6', label: 'Stage 6: Master Vault', short: 'S6: Vault' },
    { id: 'terminal', stage: 'CLI', label: 'Forensic Terminal', short: 'Terminal' }
  ];

  return (
    <header className="bg-[#050508]/95 border-b border-red-950/80 sticky top-0 z-40 backdrop-blur-md px-2.5 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 shadow-[0_4px_25px_rgba(220,38,38,0.15)]">
      <div className="max-w-[1700px] mx-auto flex flex-col gap-2.5">
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
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-red-950/80 hover:bg-red-900/90 border border-red-700/60 text-red-200 rounded-lg text-[11px] sm:text-xs font-mono transition-all shadow-[0_0_10px_rgba(220,38,38,0.2)]"
              title="Incident Dossier"
            >
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden md:inline">Incident Dossier</span>
              <span className="md:hidden">Dossier</span>
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

        {/* Third Row: Main Navigation Tabs (Touch-scrollable, responsive labels, hidden scrollbar) */}
        <div className="pt-1.5 border-t border-red-950/60 flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navTabs.map((tab) => {
            const isTabUnlocked = tab.shardKey ? unlockedShards[tab.shardKey] : false;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono whitespace-nowrap transition-all select-none shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-700 to-red-600 text-white font-bold shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-red-500'
                    : 'text-slate-400 hover:text-red-300 bg-[#0c080b] hover:bg-red-950/40 border border-transparent hover:border-red-900/40'
                }`}
              >
                {isTabUnlocked ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-900/80 shrink-0" />
                )}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

