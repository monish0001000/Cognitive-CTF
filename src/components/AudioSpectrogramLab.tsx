import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Square, Volume2, VolumeX, Eye, Radio, Sparkles, CheckCircle2, AlertTriangle, Key, ChevronUp, ChevronDown } from 'lucide-react';
import { audioEngine } from '../utils/audioSynth';
import { verifyShard } from '../utils/apiClient';

interface AudioSpectrogramLabProps {
  onUnlockShard: (shardId: 'shard1', key: string) => void;
  isUnlocked: boolean;
  unlockedKey?: string;
}

export const AudioSpectrogramLab: React.FC<AudioSpectrogramLabProps> = ({
  onUnlockShard,
  isUnlocked,
  unlockedKey = "K1:SPECTRAL_Ψ_49170"
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [centerFreq, setCenterFreq] = useState(12000); // Target is 16450
  const [qFactor, setQFactor] = useState(2.0);        // Target is 8.4
  const [demodMode, setDemodMode] = useState<'FM_FSK' | 'AM_ENV' | 'PSK_8' | 'DIRECT'>('FM_FSK');
  const [fftWindow, setFftWindow] = useState<'blackman_harris' | 'hamming' | 'flattop' | 'rectangular'>('blackman_harris');
  const [viewMode, setViewMode] = useState<'waterfall' | 'oscilloscope'>('waterfall');
  const [volume, setVolume] = useState(0.25);
  const [isMuted, setIsMuted] = useState(false);
  const [colorMap, setColorMap] = useState<'blood_inferno' | 'crimson_cyber' | 'thermal' | 'monochrome'>('blood_inferno');
  const [inputKey, setInputKey] = useState('');
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const waterfallHistoryRef = useRef<Uint8Array[]>([]);

  // Stricter resonance condition: frequency + Q-factor + demodulation mode + FFT window
  const isResonating =
    Math.abs(centerFreq - 16450) <= 45 &&
    Math.abs(qFactor - 8.4) <= 0.25 &&
    demodMode === 'FM_FSK' &&
    (fftWindow === 'blackman_harris' || fftWindow === 'hamming');

  // Real-time calculated SNR based on tuning precision
  const computedSnrDb = React.useMemo(() => {
    const freqDelta = Math.abs(centerFreq - 16450);
    const qDelta = Math.abs(qFactor - 8.4);
    const baseSnr = 28.5 - (freqDelta / 150) * 18 - qDelta * 5;
    const modePenalty = demodMode === 'FM_FSK' ? 0 : 14;
    return Math.max(-15, Math.min(32, parseFloat((baseSnr - modePenalty).toFixed(1))));
  }, [centerFreq, qFactor, demodMode]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stopSignal();
      setIsPlaying(false);
    } else {
      audioEngine.startSignal(centerFreq, qFactor, false);
      audioEngine.setVolume(isMuted ? 0 : volume);
      setIsPlaying(true);
    }
  };

  const handleFreqChange = (newFreq: number) => {
    const clamped = Math.max(100, Math.min(22000, newFreq));
    setCenterFreq(clamped);
    audioEngine.updateFilter(clamped, qFactor);
  };

  const handleQChange = (newQ: number) => {
    const clamped = Math.max(0.2, Math.min(15.0, parseFloat(newQ.toFixed(1))));
    setQFactor(clamped);
    audioEngine.updateFilter(centerFreq, clamped);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (!isMuted) {
      audioEngine.setVolume(newVol);
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setVolume(nextMuted ? 0 : volume);
  };

  // Color mapping helper tailored for Deep Black & Blood Red Cyber Aesthetic
  const getColor = useCallback((val: number, map: string): [number, number, number] => {
    const norm = val / 255;
    if (map === 'crimson_cyber') {
      return [Math.floor(norm * 255), Math.floor(norm * 25), Math.floor(norm * 45)];
    }
    if (map === 'thermal') {
      if (norm < 0.33) return [Math.floor(norm * 3 * 80), 0, 0];
      if (norm < 0.66) return [Math.floor(80 + (norm - 0.33) * 3 * 175), Math.floor((norm - 0.33) * 3 * 120), 0];
      return [255, Math.floor(120 + (norm - 0.66) * 3 * 135), Math.floor((norm - 0.66) * 3 * 220)];
    }
    if (map === 'monochrome') {
      const g = Math.floor(norm * 255);
      return [g, g, g];
    }
    // Default: Blood Inferno
    if (norm < 0.25) return [Math.floor(norm * 4 * 110), 0, Math.floor(norm * 4 * 20)];
    if (norm < 0.5) return [Math.floor(110 + (norm - 0.25) * 4 * 145), Math.floor((norm - 0.25) * 4 * 40), 0];
    if (norm < 0.75) return [255, Math.floor(40 + (norm - 0.5) * 4 * 160), 0];
    return [255, Math.floor(200 + (norm - 0.75) * 4 * 55), Math.floor((norm - 0.75) * 4 * 240)];
  }, []);

  // Waterfall render loop with dynamic scaling and Oscilloscope support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const analyser = audioEngine.getAnalyser();
      const width = canvas.width;
      const height = canvas.height;

      if (viewMode === 'oscilloscope') {
        // Render raw time-domain oscilloscope wave
        ctx.fillStyle = '#050305';
        ctx.fillRect(0, 0, width, height);

        const timeData = new Uint8Array(1024);
        if (analyser && isPlaying) {
          analyser.getByteTimeDomainData(timeData);
        } else {
          for (let i = 0; i < 1024; i++) timeData[i] = 128 + Math.floor((Math.random() - 0.5) * 6);
        }

        ctx.lineWidth = 2;
        ctx.strokeStyle = isResonating ? '#22c55e' : '#ef4444';
        ctx.beginPath();
        const sliceWidth = width / 1024;
        let xPos = 0;
        for (let i = 0; i < 1024; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(xPos, y);
          else ctx.lineTo(xPos, y);
          xPos += sliceWidth;
        }
        ctx.stroke();

        // Draw center crosshair
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Render 2D Waterfall Spectrogram
        const bufferLength = analyser ? analyser.frequencyBinCount : 1024;
        const dataArray = new Uint8Array(bufferLength);

        if (analyser && isPlaying) {
          analyser.getByteFrequencyData(dataArray);
        } else {
          for (let i = 0; i < bufferLength; i++) {
            dataArray[i] = Math.floor(Math.random() * 10);
          }
        }

        waterfallHistoryRef.current.unshift(new Uint8Array(dataArray));
        if (waterfallHistoryRef.current.length > height) {
          waterfallHistoryRef.current.pop();
        }

        const imgData = ctx.createImageData(width, height);
        const pixels = imgData.data;
        const history = waterfallHistoryRef.current;

        for (let y = 0; y < history.length; y++) {
          const rowData = history[y];
          const rowLen = rowData.length;

          for (let x = 0; x < width; x++) {
            const binIndex = Math.floor((x / width) * (rowLen * 0.85));
            let val = rowData[binIndex] || 0;

            if (isResonating) {
              const centerBin = Math.floor((16450 / 24000) * (rowLen * 0.85));
              const distFromTarget = Math.abs(x - (centerBin / (rowLen * 0.85)) * width);
              if (distFromTarget < 40) {
                val = Math.min(255, val + 175);
              }
            }

            const [r, g, b] = getColor(val, colorMap);
            const pixelIndex = (y * width + x) * 4;
            pixels[pixelIndex] = r;
            pixels[pixelIndex + 1] = g;
            pixels[pixelIndex + 2] = b;
            pixels[pixelIndex + 3] = 255;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Ultrasonic Marker Overlays
        const sampleRate = 48000;
        const nyquist = sampleRate / 2;
        const targetMarkerX = (16450 / nyquist) * width * 1.17;
        const currentMarkerX = (centerFreq / nyquist) * width * 1.17;

        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(currentMarkerX, 0);
        ctx.lineTo(currentMarkerX, height);
        ctx.stroke();

        const bandwidth = centerFreq / qFactor;
        const bwLeft = ((centerFreq - bandwidth / 2) / nyquist) * width * 1.17;
        const bwRight = ((centerFreq + bandwidth / 2) / nyquist) * width * 1.17;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
        ctx.fillRect(bwLeft, 0, Math.max(2, bwRight - bwLeft), height);

        ctx.strokeStyle = isResonating ? '#22c55e' : '#b91c1c';
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(targetMarkerX, 0);
        ctx.lineTo(targetMarkerX, height);
        ctx.stroke();
        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, centerFreq, qFactor, colorMap, isResonating, getColor, viewMode]);

  const handleSubmitKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) return;

    try {
      const data = await verifyShard('shard1', cleanKey);
      if (data.valid) {
        setKeyStatus('SUCCESS: Master Shard Alpha Authenticated & Locked!');
        onUnlockShard('shard1', cleanKey);
      } else {
        setKeyStatus('ERROR: Invalid spectral key. Check frequency alignment, Q-factor & FM-FSK Demod.');
      }
    } catch {
      setKeyStatus('Network error during verification.');
    }
  };

  return (
    <div id="audio-spectrogram-lab" className="bg-[#090608] border border-red-950/90 rounded-xl p-3.5 sm:p-5 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col gap-4 sm:gap-6">
      {/* Module Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-red-950/80 pb-3.5 sm:pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-950 border border-red-600/60 text-red-400 rounded shadow-[0_0_10px_rgba(220,38,38,0.3)]">
              Phase 1 Forensics
            </span>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-1.5 sm:gap-2 font-mono truncate">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse shrink-0" />
              <span className="truncate">Psychoacoustic Waterfall & Demodulation</span>
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed font-mono">
            Synthetic Neuro-Core Archon has modulated an ultrasonic carrier containing Key Shard Alpha.
            Tune center frequency to <code className="text-red-400 font-bold">16,450 Hz</code>, lock <code className="text-red-400 font-bold">Q = 8.4</code>, enable <code className="text-red-400 font-bold">FM-FSK Demod</code>, and apply <code className="text-red-400 font-bold">Blackman-Harris</code> windowing.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-300 text-xs sm:text-sm font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              SHARD ALPHA UNLOCKED
            </div>
          ) : isResonating ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-red-950/90 border border-red-500 rounded-lg text-red-200 text-xs sm:text-sm font-mono animate-bounce shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              CARRIER LOCKED ({computedSnrDb} dB)
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#12080a] border border-red-900/40 rounded-lg text-red-400/80 text-xs sm:text-sm font-mono">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
              DISPERSED ({computedSnrDb} dB)
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Live Spectrogram Canvas & Controls */}
        <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
          <div className="relative bg-black rounded-xl overflow-hidden border border-red-950 shadow-inner">
            <canvas
              ref={canvasRef}
              width={720}
              height={320}
              className="w-full h-56 sm:h-72 md:h-80 object-cover cursor-crosshair"
            />

            {/* Spectrogram Frequency Axis Overlay */}
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-wrap items-center gap-1 sm:gap-2 bg-black/85 backdrop-blur-md border border-red-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono text-slate-300 max-w-[calc(100%-80px)] sm:max-w-none">
              <span className="text-slate-400 hidden xs:inline">20Hz-24kHz</span>
              <span className="text-red-900 hidden xs:inline">|</span>
              <span className="text-red-400 font-bold">{centerFreq.toLocaleString()} Hz</span>
              <span className="text-red-900">|</span>
              <span className="text-amber-400">Q: {qFactor.toFixed(1)}</span>
              <span className="text-red-900 hidden sm:inline">|</span>
              <span className={`hidden sm:inline ${computedSnrDb > 20 ? 'text-emerald-400 font-bold' : 'text-red-400'}`}>
                SNR: {computedSnrDb} dB
              </span>
            </div>

            {/* View Mode Toggle Button */}
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5 sm:gap-1 bg-black/85 backdrop-blur-md border border-red-900/60 p-0.5 sm:p-1 rounded">
              <button
                onClick={() => setViewMode('waterfall')}
                className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono rounded transition-colors ${
                  viewMode === 'waterfall' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-red-300'
                }`}
              >
                Waterfall
              </button>
              <button
                onClick={() => setViewMode('oscilloscope')}
                className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono rounded transition-colors ${
                  viewMode === 'oscilloscope' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-red-300'
                }`}
              >
                Oscilloscope
              </button>
            </div>

            {/* Revealed Spectral Hologram Badge upon Resonance */}
            {isResonating && (
              <div className="absolute inset-x-2 sm:inset-x-0 bottom-2 sm:bottom-4 mx-auto w-auto sm:max-w-md bg-black/95 border-2 border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.6)] backdrop-blur-md rounded-xl p-2.5 sm:p-3.5 text-center transition-all animate-pulse">
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-red-400">
                  ✦ Demodulated Carrier Output (SNR: +28.5 dB) ✦
                </div>
                <div className="text-sm sm:text-base md:text-lg font-mono font-black text-white tracking-widest mt-0.5 select-all break-all">
                  K1:SPECTRAL_Ψ_49170
                </div>
                <p className="text-[9px] sm:text-[11px] text-slate-400 mt-0.5">
                  Authenticate key in the verification field or Master Vault to seal Phase 1.
                </p>
              </div>
            )}
          </div>

          {/* Quick Playback Bar (Adaptive Wrapping for Mobile & Tablets) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-[#0d090c] border border-red-950 rounded-xl p-2.5 sm:p-3">
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <button
                id="toggle-synth-audio-btn"
                onClick={handleTogglePlay}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm font-mono transition-all shadow-md ${
                  isPlaying
                    ? 'bg-red-700 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                    : 'bg-red-950 hover:bg-red-900 text-red-200 border border-red-700/60'
                }`}
              >
                {isPlaying ? <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-white" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-red-400" />}
                <span>{isPlaying ? 'Halt Audio' : 'Synthesize Audio'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="toggle-synth-mute-btn"
                  onClick={handleMuteToggle}
                  className="p-2 bg-[#170c10] hover:bg-red-950/80 text-red-300 border border-red-900/40 rounded-lg transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Gain:</span>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.02"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 sm:w-24 accent-red-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Spectrogram Color Scheme */}
            <div className="flex items-center justify-between sm:justify-end gap-1 overflow-x-auto">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono hidden md:inline">Map:</span>
              {(['blood_inferno', 'crimson_cyber', 'thermal', 'monochrome'] as const).map((map) => (
                <button
                  key={map}
                  onClick={() => setColorMap(map)}
                  className={`flex-1 sm:flex-none px-1.5 sm:px-2 py-1 text-[9px] sm:text-xs font-mono rounded capitalize transition-colors text-center ${
                    colorMap === map
                      ? 'bg-red-700 text-white font-bold border border-red-500'
                      : 'bg-[#150a0d] text-slate-400 hover:text-red-200 border border-red-950'
                  }`}
                >
                  {map === 'blood_inferno' ? 'Inferno' : map === 'crimson_cyber' ? 'Crimson' : map}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Forensic Dials & Filter Calibration */}
        <div className="flex flex-col justify-between gap-4 bg-[#0d090c] border border-red-950 rounded-xl p-3.5 sm:p-5">
          <div className="flex flex-col gap-3.5 sm:gap-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-400 border-b border-red-950 pb-2 flex items-center gap-2 font-mono">
              <Eye className="w-4 h-4 text-red-500" />
              Bandpass Filter Calibration
            </h3>

            {/* Center Frequency Slider & Micro-Steppers */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Frequency:</span>
                <div className="flex items-center gap-1">
                  <span className="text-red-400 font-bold">{centerFreq.toLocaleString()} Hz</span>
                  <button
                    onClick={() => handleFreqChange(centerFreq - 10)}
                    className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] font-mono min-w-[24px] text-center"
                    title="-10 Hz"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => handleFreqChange(centerFreq + 10)}
                    className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] font-mono min-w-[24px] text-center"
                    title="+10 Hz"
                  >
                    +10
                  </button>
                </div>
              </div>
              <input
                id="slider-center-freq"
                type="range"
                min="200"
                max="20000"
                step="25"
                value={centerFreq}
                onChange={(e) => handleFreqChange(parseInt(e.target.value, 10))}
                className="accent-red-500 cursor-pointer w-full py-1"
              />
              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono">
                <span>200 Hz</span>
                <span className="text-red-400/80 font-bold">Target: 16.45 kHz</span>
                <span>20 kHz</span>
              </div>
            </div>

            {/* Q-Factor Slider & Micro-Steppers */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Filter Q-Factor:</span>
                <div className="flex items-center gap-1">
                  <span className="text-amber-400 font-bold">{qFactor.toFixed(1)}</span>
                  <button
                    onClick={() => handleQChange(qFactor - 0.1)}
                    className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] font-mono min-w-[24px] text-center"
                  >
                    -0.1
                  </button>
                  <button
                    onClick={() => handleQChange(qFactor + 0.1)}
                    className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] font-mono min-w-[24px] text-center"
                  >
                    +0.1
                  </button>
                </div>
              </div>
              <input
                id="slider-q-factor"
                type="range"
                min="0.2"
                max="15.0"
                step="0.1"
                value={qFactor}
                onChange={(e) => handleQChange(parseFloat(e.target.value))}
                className="accent-amber-500 cursor-pointer w-full py-1"
              />
              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono">
                <span>0.2 (Broad)</span>
                <span className="text-amber-400/80 font-bold">Target: 8.4</span>
                <span>15.0 (Sharp)</span>
              </div>
            </div>

            {/* Demodulation Mode Selection */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Demod Protocol:</span>
                <span className="text-red-400 font-bold text-[11px] truncate max-w-[120px]">{demodMode}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'FM_FSK', label: 'FM-FSK Demod' },
                  { id: 'AM_ENV', label: 'AM Envelope' },
                  { id: 'PSK_8', label: 'PSK-8 Phase' },
                  { id: 'DIRECT', label: 'Direct Comb' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setDemodMode(mode.id as any)}
                    className={`px-2 py-1.5 rounded text-[10px] font-mono transition-colors border text-left truncate ${
                      demodMode === mode.id
                        ? 'bg-red-950 border-red-500 text-red-200 font-bold shadow-[0_0_8px_rgba(220,38,38,0.3)]'
                        : 'bg-[#12080a] border-red-950 text-slate-400 hover:text-red-300'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FFT Window Selection */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">FFT Window:</span>
                <span className="text-amber-400 font-bold capitalize text-[11px] truncate max-w-[120px]">{fftWindow.replace('_', '-')}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'blackman_harris', label: 'Blackman-Harris' },
                  { id: 'hamming', label: 'Hamming' },
                  { id: 'flattop', label: 'Flat-Top' },
                  { id: 'rectangular', label: 'Rectangular' }
                ].map((win) => (
                  <button
                    key={win.id}
                    onClick={() => setFftWindow(win.id as any)}
                    className={`px-2 py-1.5 rounded text-[10px] font-mono transition-colors border text-left truncate ${
                      fftWindow === win.id
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                        : 'bg-[#12080a] border-red-950 text-slate-400 hover:text-red-300'
                    }`}
                  >
                    {win.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Submission Form */}
          <form onSubmit={handleSubmitKey} className="flex flex-col gap-2 border-t border-red-950 pt-3">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Authenticate Key Shard Alpha:
            </label>
            <div className="flex gap-2">
              <input
                id="input-shard1-key"
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="e.g. K1:SPECTRAL_Ψ_49170"
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

