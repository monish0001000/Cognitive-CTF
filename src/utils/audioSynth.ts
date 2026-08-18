/**
 * Psychoacoustic Ultrasonic Audio Synthesizer & Spectrum Generator
 * Synthesizes multi-carrier neuro-forensic acoustic signals with embedded ultrasonic watermark.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private bandpassFilter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;

      this.bandpassFilter = this.ctx.createBiquadFilter();
      this.bandpassFilter.type = "bandpass";
      this.bandpassFilter.frequency.value = 16450;
      this.bandpassFilter.Q.value = 8.4;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.15;

      this.bandpassFilter.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public startSignal(freq = 16450, qFactor = 8.4, bypassFilter = false): boolean {
    const ctx = this.init();
    if (this.isPlaying) return true;

    this.oscillators = [];

    // 1. Base Neuro Drone
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.value = 110;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.08;
    osc1.connect(droneGain);

    // 2. Harmonic Mid-Carrier
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 880;
    const midGain = ctx.createGain();
    midGain.gain.value = 0.04;
    osc2.connect(midGain);

    // 3. High Harmonic Resonance
    const osc3 = ctx.createOscillator();
    osc3.type = "triangle";
    osc3.frequency.value = 3520;
    const highGain = ctx.createGain();
    highGain.gain.value = 0.03;
    osc3.connect(highGain);

    // 4. Ultrasonic Forensics Carrier (16,450 Hz with FSK chirp)
    const oscUltra = ctx.createOscillator();
    oscUltra.type = "sine";
    oscUltra.frequency.value = 16450;

    // FSK Modulation for Ultrasonic Watermark
    this.lfo = ctx.createOscillator();
    this.lfo.type = "square";
    this.lfo.frequency.value = 3.2; // 3.2 Hz pulse
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 45; // ±45 Hz FSK deviation
    this.lfo.connect(lfoGain);
    lfoGain.connect(oscUltra.frequency);

    const ultraGain = ctx.createGain();
    ultraGain.gain.value = 0.35;
    oscUltra.connect(ultraGain);

    // Route to Filter or Direct
    const mixer = ctx.createGain();
    mixer.gain.value = 1.0;
    droneGain.connect(mixer);
    midGain.connect(mixer);
    highGain.connect(mixer);
    ultraGain.connect(mixer);

    if (this.bandpassFilter && !bypassFilter) {
      this.bandpassFilter.frequency.value = freq;
      this.bandpassFilter.Q.value = qFactor;
      mixer.connect(this.bandpassFilter);
    } else if (this.analyser) {
      mixer.connect(this.analyser);
    }

    const now = ctx.currentTime;
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    oscUltra.start(now);
    this.lfo.start(now);

    this.oscillators = [osc1, osc2, osc3, oscUltra];
    this.isPlaying = true;
    return true;
  }

  public stopSignal(): void {
    if (!this.isPlaying) return;
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    if (this.lfo) {
      try {
        this.lfo.stop();
        this.lfo.disconnect();
      } catch {
        // ignore
      }
    }
    this.oscillators = [];
    this.isPlaying = false;
  }

  public updateFilter(frequency: number, q: number, bypass = false): void {
    if (this.bandpassFilter && this.ctx) {
      this.bandpassFilter.frequency.setTargetAtTime(frequency, this.ctx.currentTime, 0.05);
      this.bandpassFilter.Q.setTargetAtTime(q, this.ctx.currentTime, 0.05);
      if (bypass) {
        this.bandpassFilter.type = "allpass";
      } else {
        this.bandpassFilter.type = "bandpass";
      }
    }
  }

  public setVolume(volume: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();
