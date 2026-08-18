import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2 } from 'lucide-react';
import { TerminalLog } from '../types';
import { executeTerminalCommand } from '../utils/apiClient';

interface ForensicTerminalProps {
  onFlagSubmitted?: (flag: string) => void;
}

export const ForensicTerminal: React.FC<ForensicTerminalProps> = ({ onFlagSubmitted }) => {
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      command: 'sysinfo',
      output: `[+] PROJECT ARCHON // FORENSIC VOLATILITY TERMINAL v4.9.2
[+] Target Image: /evidence/neural_core_v4.raw [512 MB]
[+] Profile: CognitiveOS_x86_64_Omega
Type 'help' to inspect available forensic plugins.`,
      timestamp: '03:14:00'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRunCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw) return;

    if (raw.toLowerCase() === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    }

    setCmdHistory((prev) => [...prev, raw]);
    setHistoryIndex(-1);

    try {
      const data = await executeTerminalCommand(raw);

      const newLog: TerminalLog = {
        id: 'cmd-' + Date.now(),
        command: raw,
        output: data.output || 'No output.',
        timestamp: new Date().toLocaleTimeString(),
        isError: data.output?.includes('[✘]') || data.output?.includes('Error:')
      };

      setLogs((prev) => [...prev, newLog]);

      if (raw.startsWith('submit-flag ') && onFlagSubmitted) {
        const flagCandidate = raw.replace('submit-flag ', '').trim();
        onFlagSubmitted(flagCandidate);
      }
    } catch {
      setLogs((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          command: raw,
          output: '[!] Terminal execution failed. Remote socket error.',
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        }
      ]);
    }

    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIndex + 1 < cmdHistory.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const quickCommands = ['help', 'sysinfo', 'pslist', 'vadinfo', 'gdb archon', 'hexdump'];

  return (
    <div id="forensic-terminal" className="bg-black border border-red-950/90 rounded-xl p-3 sm:p-4 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col gap-2.5 sm:gap-3 font-mono text-xs">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-red-950 pb-2">
        <div className="flex items-center gap-2 text-slate-300 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="font-bold flex items-center gap-1.5 text-slate-200 truncate">
            <TerminalIcon className="w-4 h-4 text-red-500 shrink-0" />
            <span className="truncate">Archon Forensic Shell (Volatility & GDB)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLogs([])}
            className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-red-950/50 transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Command Chips for Fast Mobile/Tablet Inspection */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] text-slate-500 shrink-0 uppercase tracking-wider">Quick:</span>
        {quickCommands.map((qc) => (
          <button
            key={qc}
            type="button"
            onClick={() => {
              setInputVal(qc);
            }}
            className="px-2 py-0.5 bg-[#140a0e] hover:bg-red-950 border border-red-900/40 text-red-300 rounded text-[10px] whitespace-nowrap transition-colors"
          >
            {qc}
          </button>
        ))}
      </div>

      {/* Terminal Log Area */}
      <div className="h-56 sm:h-64 md:h-72 overflow-y-auto space-y-2.5 sm:space-y-3 select-text pr-1 sm:pr-2 leading-relaxed scrollbar-thin text-[11px] sm:text-xs">
        {logs.map((log) => (
          <div key={log.id} className="space-y-1">
            <div className="flex items-center gap-1.5 sm:gap-2 text-red-400 font-semibold flex-wrap">
              <span className="text-slate-600 text-[10px]">[{log.timestamp}]</span>
              <span className="text-[11px] sm:text-xs text-red-500">operator@archon:~$</span>
              <span className="text-white font-mono text-[11px] sm:text-xs break-all">{log.command}</span>
            </div>
            <pre className={`whitespace-pre-wrap pl-2 sm:pl-4 font-mono text-[10px] sm:text-xs ${log.isError ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
              {log.output}
            </pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Line */}
      <form onSubmit={handleRunCommand} className="flex items-center gap-1.5 sm:gap-2 border-t border-red-950 pt-2">
        <span className="text-red-500 font-bold shrink-0 text-[10px] sm:text-xs">op@archon:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 'volatility -f brain.raw malfind'"
          className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-600 min-w-0"
        />
        <button
          type="submit"
          className="px-2.5 sm:px-3 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 rounded text-xs transition-colors flex items-center gap-1 font-mono font-bold shadow-[0_0_10px_rgba(220,38,38,0.3)] shrink-0"
        >
          <Play className="w-3 h-3 fill-current" />
          <span className="hidden sm:inline">Exec</span>
        </button>
      </form>
    </div>
  );
};

