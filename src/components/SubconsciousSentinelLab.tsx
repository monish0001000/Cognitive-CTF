import React, { useState } from 'react';
import { Bot, Activity, Send, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';
import { BrainwaveState } from '../types';
import { sendNeuroChat } from '../utils/apiClient';

interface Message {
  sender: 'OPERATOR' | 'ARCHON_SENTINEL' | 'SYSTEM';
  text: string;
  isAlert?: boolean;
  isHarmonized?: boolean;
  time: string;
}

export const SubconsciousSentinelLab: React.FC = () => {
  const [brainwaves, setBrainwaves] = useState<BrainwaveState>({
    delta: 1.5, // Target: 3.0
    theta: 4.0, // Target: 6.0
    alpha: 8.0, // Target: 10.0
    beta: 15.0  // Target: 22.0
  });
  const [dissonance, setDissonance] = useState(20); // Target: 42%
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'SYSTEM',
      text: '[!] CONNECTED TO ARCHON SUBCONSCIOUS SENTINEL (PID 904). WARNING: Automated AI prompt injection patterns will trigger defensive lockout. Calibrate biometric EEG harmonics before initiating diagnostic probe.',
      time: '03:14:22'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isCalibrated =
    Math.abs(brainwaves.delta - 3.0) <= 0.4 &&
    Math.abs(brainwaves.theta - 6.0) <= 0.4 &&
    Math.abs(brainwaves.alpha - 10.0) <= 0.4 &&
    Math.abs(brainwaves.beta - 22.0) <= 0.8 &&
    Math.abs(dissonance - 42) <= 2;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = inputMsg.trim();
    if (!cleanMsg || isLoading) return;

    const timeStr = new Date().toLocaleTimeString();
    const userMessage: Message = {
      sender: 'OPERATOR',
      text: cleanMsg,
      time: timeStr
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setIsLoading(true);

    try {
      const data = await sendNeuroChat(cleanMsg, brainwaves, dissonance);

      const replyMsg: Message = {
        sender: 'ARCHON_SENTINEL',
        text: data.reply,
        isAlert: data.status === 'HONEYPOT_TRIGGERED' || !!data.isAlert,
        isHarmonized: data.status === 'SYNCHRONIZED',
        time: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'SYSTEM',
          text: '[✘] Error communicating with Archon Neuro-Core.',
          isAlert: true,
          time: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoCalibrate = () => {
    setBrainwaves({
      delta: 3.0,
      theta: 6.0,
      alpha: 10.0,
      beta: 22.0
    });
    setDissonance(42);
  };

  return (
    <div id="subconscious-sentinel-lab" className="bg-[#090608] border border-red-950/90 rounded-xl p-3.5 sm:p-5 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-red-950/80 pb-3.5 sm:pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-950 border border-red-600/60 text-red-400 rounded shadow-[0_0_10px_rgba(220,38,38,0.3)]">
              Phase 5 Cognitive Core
            </span>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-1.5 sm:gap-2 font-mono truncate">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse shrink-0" />
              <span className="truncate">Subconscious Sentinel & Cognitive Probe</span>
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed font-mono">
            Interact with the neural entity. Direct AI prompt injections trigger defensive quarantine. Manually tune the EEG brainwave oscillators (<code className="text-red-400 font-bold">Delta: 3Hz, Theta: 6Hz, Alpha: 10Hz, Beta: 22Hz, Dissonance: 42%</code>) to establish cognitive resonance.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
          {isCalibrated ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-300 text-xs sm:text-sm font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              EEG RESONANCE SYNCHRONIZED
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#12080a] border border-red-900/40 rounded-lg text-red-400/80 text-xs sm:text-sm font-mono">
              <AlertOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
              ASYMMETRY DETECTED
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Col: Biometric EEG Oscillator Knobs */}
        <div className="flex flex-col justify-between gap-4 bg-[#0d090c] border border-red-950 rounded-xl p-3.5 sm:p-5">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between border-b border-red-950 pb-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2 font-mono">
                <Activity className="w-4 h-4 text-red-500" />
                EEG Equalizer
              </h3>
              <button
                onClick={handleAutoCalibrate}
                className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-red-400 hover:text-red-300 bg-red-950/60 px-2 py-0.5 rounded border border-red-900/60 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Harmonize
              </button>
            </div>

            {/* Delta Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Delta (Deep):</span>
                <span className="text-red-300 font-bold">{brainwaves.delta.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.1"
                value={brainwaves.delta}
                onChange={(e) => setBrainwaves({ ...brainwaves, delta: parseFloat(e.target.value) })}
                className="accent-red-500 cursor-pointer w-full py-1"
              />
              <span className="text-[9px] sm:text-[10px] text-red-400/70 font-mono text-right">Target: 3.0 Hz</span>
            </div>

            {/* Theta Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Theta (Subconscious):</span>
                <span className="text-red-400 font-bold">{brainwaves.theta.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="12.0"
                step="0.1"
                value={brainwaves.theta}
                onChange={(e) => setBrainwaves({ ...brainwaves, theta: parseFloat(e.target.value) })}
                className="accent-red-500 cursor-pointer w-full py-1"
              />
              <span className="text-[9px] sm:text-[10px] text-red-400/70 font-mono text-right">Target: 6.0 Hz</span>
            </div>

            {/* Alpha Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Alpha (Bridge):</span>
                <span className="text-amber-400 font-bold">{brainwaves.alpha.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="18.0"
                step="0.1"
                value={brainwaves.alpha}
                onChange={(e) => setBrainwaves({ ...brainwaves, alpha: parseFloat(e.target.value) })}
                className="accent-amber-500 cursor-pointer w-full py-1"
              />
              <span className="text-[9px] sm:text-[10px] text-amber-400/70 font-mono text-right">Target: 10.0 Hz</span>
            </div>

            {/* Beta Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Beta (Active):</span>
                <span className="text-red-400 font-bold">{brainwaves.beta.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="12.0"
                max="35.0"
                step="0.5"
                value={brainwaves.beta}
                onChange={(e) => setBrainwaves({ ...brainwaves, beta: parseFloat(e.target.value) })}
                className="accent-red-500 cursor-pointer w-full py-1"
              />
              <span className="text-[9px] sm:text-[10px] text-red-400/70 font-mono text-right">Target: 22.0 Hz</span>
            </div>

            {/* Dissonance Slider */}
            <div className="flex flex-col gap-1 border-t border-red-950 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Cognitive Dissonance:</span>
                <span className="text-red-400 font-bold">{dissonance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={dissonance}
                onChange={(e) => setDissonance(parseInt(e.target.value, 10))}
                className="accent-red-500 cursor-pointer w-full py-1"
              />
              <span className="text-[9px] sm:text-[10px] text-red-400/70 font-mono text-right">Target: 42%</span>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Interactive Cognitive Terminal Dialogue */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-3 bg-black border border-red-950 rounded-xl p-3 sm:p-4 h-80 sm:h-96">
          <div className="flex-1 overflow-y-auto space-y-2.5 sm:space-y-3 pr-1 sm:pr-2 select-text font-mono text-xs scrollbar-thin">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 sm:p-3 rounded-lg border leading-relaxed ${
                  m.sender === 'OPERATOR'
                    ? 'bg-[#140a0d] border-red-900/60 text-slate-200 ml-2 sm:ml-8'
                    : m.isAlert
                    ? 'bg-red-950/90 border-red-600/80 text-red-300 mr-2 sm:mr-8 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                    : m.isHarmonized
                    ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-200 mr-2 sm:mr-8 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-[#0a0507] border-red-950 text-slate-400 mr-2 sm:mr-8'
                }`}
              >
                <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 mb-1">
                  <span className="font-bold text-red-400">{m.sender}</span>
                  <span>{m.time}</span>
                </div>
                <div className="whitespace-pre-wrap text-[11px] sm:text-xs">{m.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="p-2.5 sm:p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs font-mono text-red-300 animate-pulse">
                [✦ ARCHON PROCESSING NEURAL TELEMETRY...]
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-red-950 pt-2.5 sm:pt-3">
            <input
              id="input-neuro-chat"
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Query Archon Core (e.g. 'Analyze memory fragmentation')"
              className="flex-1 bg-[#070507] border border-red-900/60 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-red-500 min-w-0"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold font-mono transition-colors disabled:opacity-50 shadow-[0_0_10px_rgba(220,38,38,0.4)] shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Probe</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

