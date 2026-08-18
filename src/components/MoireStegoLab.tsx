import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Eye, Layers, Compass, Sparkles, CheckCircle2, AlertTriangle, Key, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { verifyShard } from '../utils/apiClient';

interface MoireStegoLabProps {
  onUnlockShard: (shardId: 'shard2', key: string) => void;
  isUnlocked: boolean;
  unlockedKey?: string;
}

export const MoireStegoLab: React.FC<MoireStegoLabProps> = ({
  onUnlockShard,
  isUnlocked,
  unlockedKey = "K2:MOIRE_Φ_83021"
}) => {
  const [angle, setAngle] = useState(45.0);             // Target: 137.5°
  const [pitch, setPitch] = useState(6.5);              // Target: 4.2 px
  const [phaseOffset, setPhaseOffset] = useState(20.0);    // Target: 88.0°
  const [gratingProfile, setGratingProfile] = useState<'ronchi' | 'sinusoidal' | 'fresnel' | 'crosshatch'>('ronchi');
  const [wavelengthNm, setWavelengthNm] = useState<632.8 | 532.0 | 405.0 | 850.0>(632.8);
  const [astigmatism, setAstigmatism] = useState(0.0);    // Target: 0.0 (Corrected)
  const [zoom, setZoom] = useState(1.0);
  const [channelMode, setChannelMode] = useState<'crimson_laser' | 'polarized_red' | 'inverted'>('crimson_laser');
  const [inputKey, setInputKey] = useState('');
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stricter optical resonance condition
  const isAligned =
    Math.abs(angle - 137.5) <= 0.8 &&
    Math.abs(pitch - 4.2) <= 0.15 &&
    Math.abs(phaseOffset - 88.0) <= 1.5 &&
    wavelengthNm === 632.8 &&
    (gratingProfile === 'ronchi' || gratingProfile === 'sinusoidal') &&
    Math.abs(astigmatism) <= 0.2;

  // Real-time calculated optical fringe contrast (%)
  const fringeContrast = React.useMemo(() => {
    const angleDelta = Math.abs(angle - 137.5);
    const pitchDelta = Math.abs(pitch - 4.2);
    const phaseDelta = Math.abs(phaseOffset - 88.0);
    const wavePenalty = wavelengthNm === 632.8 ? 0 : 35;
    const profilePenalty = gratingProfile === 'ronchi' ? 0 : gratingProfile === 'sinusoidal' ? 5 : 45;
    const astigPenalty = Math.abs(astigmatism) * 20;

    const penalty = (angleDelta / 20) * 30 + (pitchDelta / 2) * 30 + (phaseDelta / 30) * 20 + wavePenalty + profilePenalty + astigPenalty;
    return Math.max(0, Math.min(99.4, parseFloat((100 - penalty).toFixed(1))));
  }, [angle, pitch, phaseOffset, wavelengthNm, gratingProfile, astigmatism]);

  const handleSubmitKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) return;

    try {
      const data = await verifyShard('shard2', cleanKey);
      if (data.valid) {
        setKeyStatus('SUCCESS: Master Shard Beta Authenticated & Locked!');
        onUnlockShard('shard2', cleanKey);
      } else {
        setKeyStatus('ERROR: Invalid moiré key. Check optical alignment parameters & 632.8nm He-Ne laser.');
      }
    } catch {
      setKeyStatus('Network error during verification.');
    }
  };

  // Optical lattice canvas rendering
  const renderLattice = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Deep black optical substrate
    ctx.fillStyle = '#060406';
    ctx.fillRect(0, 0, width, height);

    // Save state
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);

    const radAngle = (angle * Math.PI) / 180;
    const radPhase = (phaseOffset * Math.PI) / 180;

    // Laser Color Palette
    let strokeColorBase = 'rgba(239, 68, 68, 0.45)';
    let strokeColorRot = 'rgba(255, 100, 100, 0.45)';
    if (wavelengthNm === 532.0) {
      strokeColorBase = 'rgba(34, 197, 94, 0.45)';
      strokeColorRot = 'rgba(74, 222, 128, 0.45)';
    } else if (wavelengthNm === 405.0) {
      strokeColorBase = 'rgba(168, 85, 247, 0.45)';
      strokeColorRot = 'rgba(192, 132, 252, 0.45)';
    } else if (wavelengthNm === 850.0) {
      strokeColorBase = 'rgba(153, 27, 27, 0.35)';
      strokeColorRot = 'rgba(127, 29, 29, 0.35)';
    }

    const maxDim = Math.max(width, height) * 1.5;

    // Layer 1: Base Physical Substrate Grating
    ctx.strokeStyle = strokeColorBase;
    ctx.lineWidth = 1.2;

    if (gratingProfile === 'fresnel') {
      for (let r = 5; r < maxDim; r += pitch * 1.5) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      for (let x = -maxDim; x < maxDim; x += pitch) {
        ctx.beginPath();
        ctx.moveTo(x, -maxDim);
        ctx.lineTo(x, maxDim);
        ctx.stroke();
        if (gratingProfile === 'crosshatch') {
          ctx.moveTo(-maxDim, x);
          ctx.lineTo(maxDim, x);
          ctx.stroke();
        }
      }
    }

    // Layer 2: Polarized Foreground Filter Grating
    ctx.rotate(radAngle);
    ctx.strokeStyle = strokeColorRot;
    ctx.lineWidth = 1.2;

    for (let y = -maxDim; y < maxDim; y += pitch * 1.01) {
      const astigShift = astigmatism * (y / 10);
      ctx.beginPath();
      ctx.moveTo(-maxDim + Math.sin(radPhase) * pitch + astigShift, y);
      ctx.lineTo(maxDim + Math.sin(radPhase) * pitch + astigShift, y);
      ctx.stroke();
    }

    ctx.restore();

    // If Optical alignment condition is satisfied, render constructive visual holographic badge
    if (isAligned) {
      ctx.save();
      ctx.fillStyle = 'rgba(7, 3, 5, 0.94)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;

      const cardW = Math.min(width - 30, 420);
      const cardH = 145;
      const cardX = (width - cardW) / 2;
      const cardY = (height - cardH) / 2;

      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();

      // Optical watermark glyph styling
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('✦ OPTICAL LATTICE CONSTRUCTIVE PHASE LOCKED ✦', width / 2, cardY + 28);

      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('K2:MOIRE_Φ_83021', width / 2, cardY + 68);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#f87171';
      ctx.fillText(`θ = 137.5° | Pitch = 4.2px | Δφ = 88.0° | 632.8nm`, width / 2, cardY + 98);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Optical Fringe Contrast: ${fringeContrast}% (Key Shard Beta)`, width / 2, cardY + 120);

      ctx.restore();
    }
  }, [angle, pitch, phaseOffset, zoom, channelMode, isAligned, wavelengthNm, gratingProfile, astigmatism, fringeContrast]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderLattice();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [renderLattice]);

  return (
    <div id="moire-stego-lab" className="bg-[#090608] border border-red-950/90 rounded-xl p-3.5 sm:p-5 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-red-950/80 pb-3.5 sm:pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-950 border border-red-600/60 text-red-400 rounded shadow-[0_0_10px_rgba(220,38,38,0.3)]">
              Phase 2 Forensics
            </span>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-1.5 sm:gap-2 font-mono truncate">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse shrink-0" />
              <span className="truncate">Stroboscopic Moiré & Optical Steganography</span>
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed font-mono">
            Synthetic Neuro-Core Archon encoded Key Shard Beta in a micro-interference grating.
            Calibrate Polar Angle (<code className="text-red-400 font-bold">θ = 137.5°</code>), Grating Pitch (<code className="text-red-400 font-bold">4.2 px</code>), Phase Offset (<code className="text-red-400 font-bold">Δφ = 88.0°</code>), and Wavelength (<code className="text-red-400 font-bold">632.8 nm He-Ne</code>).
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-300 text-xs sm:text-sm font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              SHARD BETA UNLOCKED
            </div>
          ) : isAligned ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-red-950/90 border border-red-500 rounded-lg text-red-200 text-xs sm:text-sm font-mono animate-bounce shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              PHASE ALIGNED ({fringeContrast}%)
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#12080a] border border-red-900/40 rounded-lg text-red-400/80 text-xs sm:text-sm font-mono">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
              INTERFERENCE ({fringeContrast}%)
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Interactive Optical Canvas */}
        <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
          <div className="relative bg-black rounded-xl overflow-hidden border border-red-950 shadow-inner flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={720}
              height={320}
              className="w-full h-56 sm:h-72 md:h-80 object-cover cursor-crosshair"
            />

            {/* Canvas Overlay Telemetry */}
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-wrap items-center gap-1 sm:gap-2 bg-black/85 backdrop-blur-md border border-red-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono text-slate-300 max-w-[calc(100%-80px)] sm:max-w-none">
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400 shrink-0" />
              <span className="text-red-300">θ: {angle.toFixed(1)}°</span>
              <span className="text-red-900">|</span>
              <span className="text-red-300">λ: {pitch.toFixed(1)}px</span>
              <span className="text-red-900">|</span>
              <span className="text-amber-400">Δφ: {phaseOffset.toFixed(1)}°</span>
              <span className="text-red-900 hidden sm:inline">|</span>
              <span className={`hidden sm:inline ${fringeContrast > 80 ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                Contrast: {fringeContrast}%
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 flex items-center gap-0.5 sm:gap-1 bg-black/85 backdrop-blur-md border border-red-900/60 p-0.5 sm:p-1 rounded">
              <button
                onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-red-950"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] sm:text-[11px] font-mono px-1 text-red-200">{(zoom * 100).toFixed(0)}%</span>
              <button
                onClick={() => setZoom(Math.min(2.5, zoom + 0.1))}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-red-950"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Grating & Laser Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-[#0d090c] border border-red-950 rounded-xl p-2.5 sm:p-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Laser Wavelength (nm):</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { val: 632.8, label: '632.8', sub: 'Red' },
                  { val: 532.0, label: '532.0', sub: 'Grn' },
                  { val: 405.0, label: '405.0', sub: 'Vio' },
                  { val: 850.0, label: '850.0', sub: 'IR' }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setWavelengthNm(item.val as any)}
                    className={`px-1 py-1.5 text-[9px] sm:text-[10px] font-mono rounded transition-colors text-center truncate ${
                      wavelengthNm === item.val
                        ? 'bg-red-700 text-white font-bold border border-red-500'
                        : 'bg-[#150a0d] text-slate-400 hover:text-red-200 border border-red-950'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[8px] opacity-70">({item.sub})</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Grating Profile:</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'ronchi', label: 'Ronchi' },
                  { id: 'sinusoidal', label: 'Sinusoid' },
                  { id: 'fresnel', label: 'Fresnel' },
                  { id: 'crosshatch', label: 'Cross' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGratingProfile(item.id as any)}
                    className={`px-1 py-1.5 text-[9px] sm:text-[10px] font-mono rounded transition-colors text-center truncate ${
                      gratingProfile === item.id
                        ? 'bg-amber-950/80 text-amber-200 font-bold border border-amber-500'
                        : 'bg-[#150a0d] text-slate-400 hover:text-red-200 border border-red-950'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Optical Knobs & Key Verification */}
        <div className="flex flex-col justify-between gap-4 bg-[#0d090c] border border-red-950 rounded-xl p-3.5 sm:p-5">
          <div className="flex flex-col gap-3.5 sm:gap-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-400 border-b border-red-950 pb-2 flex items-center gap-2 font-mono">
              <Eye className="w-4 h-4 text-red-500" />
              Optical Goniometer
            </h3>

            {/* Angle Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Polar Angle (θ):</span>
                <div className="flex items-center gap-1">
                  <span className="text-red-400 font-bold">{angle.toFixed(1)}°</span>
                  <button
                    onClick={() => setAngle(Math.max(0, parseFloat((angle - 0.5).toFixed(1))))}
                    className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] min-w-[24px] text-center"
                  >
                    -0.5°
                  </button>
                  <button
                    onClick={() => setAngle(Math.min(360, parseFloat((angle + 0.5).toFixed(1))))}
                    className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] min-w-[24px] text-center"
                  >
                    +0.5°
                  </button>
                </div>
              </div>
              <input
                id="slider-polar-angle"
                type="range"
                min="0"
                max="360"
                step="0.5"
                value={angle}
                onChange={(e) => setAngle(parseFloat(e.target.value))}
                className="accent-red-500 cursor-pointer w-full py-1"
              />
              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono">
                <span>0°</span>
                <span className="text-slate-500">Goniometer Rotation</span>
                <span>360°</span>
              </div>
            </div>

            {/* Pitch Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Grating Pitch (λ):</span>
                <div className="flex items-center gap-1">
                  <span className="text-amber-400 font-bold">{pitch.toFixed(1)} px</span>
                  <button
                    onClick={() => setPitch(Math.max(1.0, parseFloat((pitch - 0.1).toFixed(1))))}
                    className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] min-w-[24px] text-center"
                  >
                    -0.1
                  </button>
                  <button
                    onClick={() => setPitch(Math.min(15.0, parseFloat((pitch + 0.1).toFixed(1))))}
                    className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] min-w-[24px] text-center"
                  >
                    +0.1
                  </button>
                </div>
              </div>
              <input
                id="slider-grating-pitch"
                type="range"
                min="1.0"
                max="15.0"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="accent-amber-500 cursor-pointer w-full py-1"
              />
              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono">
                <span>1.0 px (Dense)</span>
                <span className="text-slate-500">Spatial Frequency</span>
                <span>15.0 px (Sparse)</span>
              </div>
            </div>

            {/* Phase Delta Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Phase (Δφ):</span>
                <div className="flex items-center gap-1">
                  <span className="text-red-400 font-bold">{phaseOffset.toFixed(1)}°</span>
                  <button
                    onClick={() => setPhaseOffset(Math.max(0, parseFloat((phaseOffset - 1).toFixed(1))))}
                    className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] min-w-[24px] text-center"
                  >
                    -1°
                  </button>
                  <button
                    onClick={() => setPhaseOffset(Math.min(180, parseFloat((phaseOffset + 1).toFixed(1))))}
                    className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] min-w-[24px] text-center"
                  >
                    +1°
                  </button>
                </div>
              </div>
              <input
                id="slider-phase-offset"
                type="range"
                min="0"
                max="180"
                step="1"
                value={phaseOffset}
                onChange={(e) => setPhaseOffset(parseFloat(e.target.value))}
                className="accent-red-500 cursor-pointer w-full py-1"
              />
              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono">
                <span>0°</span>
                <span className="text-slate-500">Interference Phase</span>
                <span>180°</span>
              </div>
            </div>

            {/* Astigmatism Correction Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Astigmatism:</span>
                <span className="text-red-300 font-bold">{astigmatism.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="2.0"
                step="0.1"
                value={astigmatism}
                onChange={(e) => setAstigmatism(parseFloat(e.target.value))}
                className="accent-red-500 cursor-pointer w-full py-1"
              />
              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono">
                <span>-2.0</span>
                <span className="text-emerald-400/80 font-bold">Target: 0.0</span>
                <span>+2.0</span>
              </div>
            </div>
          </div>

          {/* Key Submission Form */}
          <form onSubmit={handleSubmitKey} className="flex flex-col gap-2 border-t border-red-950 pt-3">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Authenticate Key Shard Beta:
            </label>
            <div className="flex gap-2">
              <input
                id="input-shard2-key"
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="e.g. K2:MOIRE_Φ_83021"
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

