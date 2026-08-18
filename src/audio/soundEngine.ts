/**
 * Studio-Grade Audio Engine for Focus Wave
 * High-gain Web Audio amplification with studio dynamic range compressor to deliver
 * rich, clear, and powerful volume at 100% (and full fidelity across all slider levels).
 * Uses real-world field recordings for ambient channels and pure sine synthesis for binaural beats.
 */

import { SoundId, BinauralPreset } from '../types';

export const SOUND_AUDIO_URLS: Record<SoundId, string> = {
  rain: 'https://actions.google.com/sounds/v1/weather/light_rain.ogg',
  thunder: 'https://actions.google.com/sounds/v1/weather/thunderstorm.ogg',
  coffee: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
  fireplace: 'https://actions.google.com/sounds/v1/ambiences/fire.ogg',
  ocean: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
  wind: 'https://actions.google.com/sounds/v1/weather/soft_wind.ogg',
};

// Calibrated loudness boost multipliers per channel to ensure great presence at 100%
const CHANNEL_BOOST_MULTIPLIERS: Record<SoundId, number> = {
  rain: 2.8,
  thunder: 3.0,
  coffee: 3.5,
  fireplace: 3.8,
  ocean: 3.0,
  wind: 3.2,
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isMasterMuted = false;
  private masterVolume = 1.0;

  // Real Audio Elements & Web Audio Nodes per Channel
  private audioElements: Map<SoundId, HTMLAudioElement> = new Map();
  private channelSources: Map<SoundId, MediaElementAudioSourceNode> = new Map();
  private channelGains: Map<SoundId, GainNode> = new Map();
  private channelVolumes: Map<SoundId, { volume: number; isMuted: boolean }> = new Map();

  // Web Audio Studio Master Bus
  private masterCompressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;

  // Binaural Beats & Chime
  private binauralLeftOsc: OscillatorNode | null = null;
  private binauralRightOsc: OscillatorNode | null = null;
  private binauralGain: GainNode | null = null;
  private activeBinauralPreset: BinauralPreset | null = null;

  constructor() {
    this.initAudioElements();
  }

  private initAudioElements() {
    if (typeof window === 'undefined') return;

    (Object.keys(SOUND_AUDIO_URLS) as SoundId[]).forEach((id) => {
      try {
        const audio = new Audio();
        audio.src = SOUND_AUDIO_URLS[id];
        audio.loop = true;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        audio.volume = 1.0; // Keep element volume maxed to let Web Audio GainNode control amplitude

        this.audioElements.set(id, audio);
        this.channelVolumes.set(id, { volume: 0, isMuted: false });
      } catch (err) {
        console.warn(`Could not preload audio element for ${id}:`, err);
      }
    });
  }

  public init(): boolean {
    if (this.isInitialized && this.ctx && this.ctx.state === 'running') {
      return true;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Studio-grade Dynamics Compressor to prevent digital clipping while allowing high gain
      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.masterCompressor.knee.setValueAtTime(10, this.ctx.currentTime);
      this.masterCompressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.masterCompressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      // Routing: Compressor -> Master Gain -> Destination
      this.masterCompressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Connect each HTMLAudioElement to Web Audio graph with a dedicated GainNode
      this.connectAudioNodes();

      this.isInitialized = true;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return true;
    } catch (err) {
      console.error('Failed to initialize Web Audio Context:', err);
      return false;
    }
  }

  private connectAudioNodes() {
    if (!this.ctx || !this.masterCompressor) return;

    this.audioElements.forEach((audio, id) => {
      if (this.channelSources.has(id)) return;

      try {
        const source = this.ctx!.createMediaElementSource(audio);
        const gainNode = this.ctx!.createGain();

        const state = this.channelVolumes.get(id) || { volume: 0, isMuted: false };
        const multiplier = CHANNEL_BOOST_MULTIPLIERS[id] || 3.0;
        const initialGain = state.isMuted || this.isMasterMuted ? 0 : (state.volume / 100) * multiplier;

        gainNode.gain.setValueAtTime(initialGain, this.ctx!.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.masterCompressor!);

        this.channelSources.set(id, source);
        this.channelGains.set(id, gainNode);
      } catch (err) {
        console.warn(`Web Audio MediaElement connection note for ${id}:`, err);
      }
    });
  }

  public async ensureContext(): Promise<boolean> {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    // In case audio nodes weren't connected on construct
    if (this.ctx && this.masterCompressor && this.channelSources.size < this.audioElements.size) {
      this.connectAudioNodes();
    }
    return true;
  }

  /**
   * Updates channel volume (0 - 100) and mute state with amplified gain curve
   */
  public setChannelVolume(id: SoundId, volume: number, isMuted: boolean) {
    this.ensureContext();
    this.channelVolumes.set(id, { volume, isMuted });

    const audio = this.audioElements.get(id);
    if (!audio) return;

    const effectivePercent = isMuted || this.isMasterMuted ? 0 : volume / 100;
    const multiplier = CHANNEL_BOOST_MULTIPLIERS[id] || 3.0;
    const targetGain = effectivePercent * multiplier;

    const gainNode = this.channelGains.get(id);

    if (gainNode && this.ctx) {
      // Smooth parameter ramp for seamless volume sliders
      gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.03);
    } else {
      // Fallback direct element volume if Web Audio source isn't attached
      audio.volume = Math.max(0, Math.min(1, effectivePercent * this.masterVolume));
    }

    if (effectivePercent > 0) {
      if (audio.paused) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.debug(`Audio play postponed for ${id}:`, err?.message);
          });
        }
      }
    } else {
      // Pause if volume is 0 to save battery and network
      if (!audio.paused && volume === 0) {
        audio.pause();
      }
    }
  }

  /**
   * Master Mute / Unmute across all channels
   */
  public setMasterMute(muted: boolean) {
    this.isMasterMuted = muted;

    this.channelVolumes.forEach((state, id) => {
      this.setChannelVolume(id, state.volume, state.isMuted);
    });

    if (this.binauralGain && this.ctx) {
      const bVol = muted ? 0 : 0.15;
      this.binauralGain.gain.setTargetAtTime(bVol, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Master Volume (0.0 to 1.0)
   */
  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }

    this.channelVolumes.forEach((state, id) => {
      this.setChannelVolume(id, state.volume, state.isMuted);
    });
  }

  /**
   * Binaural Beats Brainwave Generator (Alpha, Beta, Theta, Delta)
   */
  public startBinauralBeat(preset: BinauralPreset, volume: number = 0.2) {
    this.ensureContext();
    if (!this.ctx || !this.masterCompressor) return;

    this.stopBinaural();

    const baseFreq = 216; // Pure resonant tuning
    const beatFreq = preset.frequency;

    const leftFreq = baseFreq;
    const rightFreq = baseFreq + beatFreq;

    const leftOsc = this.ctx.createOscillator();
    const rightOsc = this.ctx.createOscillator();

    leftOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(leftFreq, this.ctx.currentTime);

    rightOsc.type = 'sine';
    rightOsc.frequency.setValueAtTime(rightFreq, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    const leftGain = this.ctx.createGain();
    const rightGain = this.ctx.createGain();
    this.binauralGain = this.ctx.createGain();

    const targetGain = this.isMasterMuted ? 0 : volume * 0.22;
    this.binauralGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);

    leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0); // Left

    rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1); // Right

    merger.connect(this.binauralGain);
    this.binauralGain.connect(this.masterCompressor);

    leftOsc.start();
    rightOsc.start();

    this.binauralLeftOsc = leftOsc;
    this.binauralRightOsc = rightOsc;
    this.activeBinauralPreset = preset;
  }

  public stopBinaural() {
    try {
      if (this.binauralLeftOsc) {
        this.binauralLeftOsc.stop();
        this.binauralLeftOsc.disconnect();
      }
      if (this.binauralRightOsc) {
        this.binauralRightOsc.stop();
        this.binauralRightOsc.disconnect();
      }
    } catch {}

    this.binauralLeftOsc = null;
    this.binauralRightOsc = null;
    this.activeBinauralPreset = null;
  }

  public getActiveBinauralPreset(): BinauralPreset | null {
    return this.activeBinauralPreset;
  }

  /**
   * Tibetan Meditation Bowl Chime for Pomodoro timer completion
   */
  public playPomodoroChime() {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 Harmonious major triad

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.24, now + idx * 0.1 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 3.4);

      osc.connect(gain);
      if (this.masterCompressor) {
        gain.connect(this.masterCompressor);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 3.6);
    });
  }

  /**
   * Stop all active audio elements and synthesis
   */
  public stopAll() {
    this.audioElements.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    this.channelGains.forEach((gain) => {
      if (this.ctx) {
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    });

    this.channelVolumes.forEach((_, id) => {
      this.channelVolumes.set(id, { volume: 0, isMuted: false });
    });

    this.stopBinaural();
  }
}

export const soundEngine = new SoundEngine();
