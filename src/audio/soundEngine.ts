/**
 * Web Audio API Sound Engine for Focus Wave
 * Provides high-fidelity procedural ambient sound synthesis for zero-latency,
 * seamless, 100% reliable soundscapes that require no external network streams.
 */

import { SoundId } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private masterGain: GainNode | null = null;
  private channelGains: Map<SoundId, GainNode> = new Map();
  private activeNodes: Map<SoundId, { stop: () => void }> = new Map();
  private noiseBuffers: Map<string, AudioBuffer> = new Map();
  private isMasterMuted = false;

  public init(): boolean {
    if (this.isInitialized && this.ctx && this.ctx.state === 'running') {
      return true;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.generateNoiseBuffers();
      this.isInitialized = true;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return true;
    } catch (err) {
      console.error('Failed to initialize Web Audio Engine:', err);
      return false;
    }
  }

  public async ensureContext(): Promise<boolean> {
    if (!this.ctx) {
      return this.init();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx.state === 'running';
  }

  private generateNoiseBuffers() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 4; // 4 seconds of noise buffer

    // 1. White Noise
    const whiteBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const whiteData = whiteBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      whiteData[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffers.set('white', whiteBuffer);

    // 2. Pink Noise
    const pinkBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const pinkData = pinkBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      pinkData[i] *= 0.11; // Scale to ~1.0
      b6 = white * 0.115926;
    }
    this.noiseBuffers.set('pink', pinkBuffer);

    // 3. Brown Noise
    const brownBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const brownData = brownBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      brownData[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brownData[i];
      brownData[i] *= 3.5; // Gain adjustment
    }
    this.noiseBuffers.set('brown', brownBuffer);
  }

  public setChannelVolume(id: SoundId, volume: number, isMuted: boolean) {
    this.ensureContext();
    const effectiveVolume = isMuted || this.isMasterMuted ? 0 : (volume / 100);

    let gainNode = this.channelGains.get(id);
    if (!gainNode && this.ctx && this.masterGain) {
      gainNode = this.ctx.createGain();
      gainNode.connect(this.masterGain);
      this.channelGains.set(id, gainNode);
    }

    if (gainNode && this.ctx) {
      const targetGain = effectiveVolume * effectiveVolume; // Logarithmic curve for natural hearing
      gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);

      if (effectiveVolume > 0) {
        if (!this.activeNodes.has(id)) {
          this.startSoundGenerator(id, gainNode);
        }
      } else {
        // Stop node if volume is 0 to save processing
        if (this.activeNodes.has(id) && volume === 0) {
          const node = this.activeNodes.get(id);
          node?.stop();
          this.activeNodes.delete(id);
        }
      }
    }
  }

  public setMasterMute(muted: boolean) {
    this.isMasterMuted = muted;
    this.channelGains.forEach((gainNode, id) => {
      if (this.ctx) {
        const currentVol = muted ? 0 : gainNode.gain.value;
        gainNode.gain.setTargetAtTime(currentVol, this.ctx.currentTime, 0.05);
      }
    });
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  private startSoundGenerator(id: SoundId, outputGain: GainNode) {
    if (!this.ctx) return;

    switch (id) {
      case 'rain':
        this.createRainSound(outputGain);
        break;
      case 'thunder':
        this.createThunderSound(outputGain);
        break;
      case 'coffee':
        this.createCoffeeSound(outputGain);
        break;
      case 'fireplace':
        this.createFireplaceSound(outputGain);
        break;
      case 'ocean':
        this.createOceanSound(outputGain);
        break;
      case 'wind':
        this.createWindSound(outputGain);
        break;
    }
  }

  // --- Rain Generator ---
  private createRainSound(gainNode: GainNode) {
    if (!this.ctx) return;
    const pinkBuffer = this.noiseBuffers.get('pink');
    if (!pinkBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = pinkBuffer;
    noiseSource.loop = true;

    // Filter for steady downpour
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    // Highpass to eliminate muddy sub bass in rain
    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(200, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(hpFilter);
    hpFilter.connect(gainNode);

    noiseSource.start();

    this.activeNodes.set('rain', {
      stop: () => {
        try { noiseSource.stop(); } catch {}
      }
    });
  }

  // --- Thunder Generator ---
  private createThunderSound(gainNode: GainNode) {
    if (!this.ctx) return;
    const brownBuffer = this.noiseBuffers.get('brown');
    if (!brownBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = brownBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(rumbleGain);
    rumbleGain.connect(gainNode);

    noiseSource.start();

    // Thunder roll interval
    const interval = setInterval(() => {
      if (!this.ctx || !this.activeNodes.has('thunder')) return;
      if (Math.random() < 0.3) { // 30% chance of thunder burst every few seconds
        const now = this.ctx.currentTime;
        rumbleGain.gain.cancelScheduledValues(now);
        rumbleGain.gain.setValueAtTime(0.3, now);
        rumbleGain.gain.linearRampToValueAtTime(0.95, now + 0.6); // Clap
        rumbleGain.gain.exponentialRampToValueAtTime(0.2, now + 3.5); // Rolling echo
      }
    }, 4500);

    this.activeNodes.set('thunder', {
      stop: () => {
        clearInterval(interval);
        try { noiseSource.stop(); } catch {}
      }
    });
  }

  // --- Coffee Shop Generator ---
  private createCoffeeSound(gainNode: GainNode) {
    if (!this.ctx) return;
    const pinkBuffer = this.noiseBuffers.get('pink');
    if (!pinkBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = pinkBuffer;
    noiseSource.loop = true;

    // Filter simulating room ambience
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(subFilter);
    subFilter.connect(gainNode);

    noiseSource.start();

    // Occasional gentle cup clink sound simulation
    const clinkInterval = setInterval(() => {
      if (!this.ctx || !this.activeNodes.has('coffee')) return;
      if (Math.random() < 0.25) {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        const freq = 2000 + Math.random() * 1500;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        oscGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
      }
    }, 3000);

    this.activeNodes.set('coffee', {
      stop: () => {
        clearInterval(clinkInterval);
        try { noiseSource.stop(); } catch {}
      }
    });
  }

  // --- Fireplace Generator ---
  private createFireplaceSound(gainNode: GainNode) {
    if (!this.ctx) return;
    const brownBuffer = this.noiseBuffers.get('brown');
    const whiteBuffer = this.noiseBuffers.get('white');
    if (!brownBuffer || !whiteBuffer) return;

    // 1. Warm flame roar
    const roarSource = this.ctx.createBufferSource();
    roarSource.buffer = brownBuffer;
    roarSource.loop = true;

    const roarFilter = this.ctx.createBiquadFilter();
    roarFilter.type = 'lowpass';
    roarFilter.frequency.setValueAtTime(350, this.ctx.currentTime);

    const roarGain = this.ctx.createGain();
    roarGain.gain.setValueAtTime(0.6, this.ctx.currentTime);

    roarSource.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(gainNode);
    roarSource.start();

    // 2. Crackle / Pop generator
    const crackleInterval = setInterval(() => {
      if (!this.ctx || !this.activeNodes.has('fireplace')) return;
      const popCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < popCount; i++) {
        const delay = Math.random() * 0.1;
        const now = this.ctx.currentTime + delay;
        
        const popSource = this.ctx.createBufferSource();
        popSource.buffer = whiteBuffer;
        
        const popFilter = this.ctx.createBiquadFilter();
        popFilter.type = 'highpass';
        popFilter.frequency.setValueAtTime(1500 + Math.random() * 2000, now);

        const popGain = this.ctx.createGain();
        const vol = 0.03 + Math.random() * 0.08;
        popGain.gain.setValueAtTime(vol, now);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        popSource.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(gainNode);

        popSource.start(now);
        popSource.stop(now + 0.04);
      }
    }, 180);

    this.activeNodes.set('fireplace', {
      stop: () => {
        clearInterval(crackleInterval);
        try { roarSource.stop(); } catch {}
      }
    });
  }

  // --- Ocean Waves Generator ---
  private createOceanSound(gainNode: GainNode) {
    if (!this.ctx) return;
    const brownBuffer = this.noiseBuffers.get('brown');
    if (!brownBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = brownBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    // Dynamic wave modulation via LFO Oscillator
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // ~12 second wave period

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(300, this.ctx.currentTime); // Filter sweep depth

    lfo.connect(filter.frequency);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(gainNode);

    noiseSource.start();
    lfo.start();

    this.activeNodes.set('ocean', {
      stop: () => {
        try {
          noiseSource.stop();
          lfo.stop();
        } catch {}
      }
    });
  }

  // --- Wind Generator ---
  private createWindSound(gainNode: GainNode) {
    if (!this.ctx) return;
    const pinkBuffer = this.noiseBuffers.get('pink');
    if (!pinkBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = pinkBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // LFO for howling breeze effect
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(gainNode);

    noiseSource.start();
    lfo.start();

    this.activeNodes.set('wind', {
      stop: () => {
        try {
          noiseSource.stop();
          lfo.stop();
        } catch {}
      }
    });
  }

  // --- Chime Alert Sound for Pomodoro Completion ---
  public playPomodoroChime() {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 Tibetan singing bowl chord

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 3.5);

      osc.connect(gain);
      if (this.masterGain) {
        gain.connect(this.masterGain);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 3.6);
    });
  }

  // Stop all active audio generators
  public stopAll() {
    this.activeNodes.forEach(node => node.stop());
    this.activeNodes.clear();
  }
}

export const soundEngine = new SoundEngine();
