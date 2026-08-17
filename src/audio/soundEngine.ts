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

    // 4. Procedural Realistic Cozy Fireplace Crackle Buffer (Stereo, 8 seconds, organic & slow)
    const fireDuration = 8;
    const fireSampleRate = this.ctx.sampleRate;
    const fireBuffer = this.ctx.createBuffer(2, fireSampleRate * fireDuration, fireSampleRate);
    const leftChannel = fireBuffer.getChannelData(0);
    const rightChannel = fireBuffer.getChannelData(1);

    // Natural, relaxed pacing: ~38 micro-crackle events per second with organic clustering
    const totalEvents = Math.floor(fireDuration * 38);
    for (let e = 0; e < totalEvents; e++) {
      const startSample = Math.floor(Math.random() * (fireSampleRate * fireDuration - fireSampleRate * 0.06));
      const pan = Math.random(); // Stereo balance
      const randType = Math.random();

      if (randType < 0.72) {
        // A. Soft ember spark & gentle wood fissure (Noise-based micro-snap, NO sine waves)
        const decayTime = 0.003 + Math.random() * 0.007; // 3ms - 10ms
        const amp = 0.08 + Math.random() * 0.16;
        const len = Math.min(Math.floor(decayTime * fireSampleRate * 4), fireSampleRate * fireDuration - startSample);
        
        // Simple 1-pole filter state for warm crisp texture
        let prev = 0;
        const filterCoeff = 0.35 + Math.random() * 0.3;

        for (let i = 0; i < len; i++) {
          const t = i / fireSampleRate;
          const env = Math.exp(-t / decayTime);
          const rawNoise = Math.random() * 2 - 1;
          prev = prev * filterCoeff + rawNoise * (1 - filterCoeff);
          const val = amp * (rawNoise * 0.6 + prev * 0.4) * env;
          leftChannel[startSample + i] += val * (1 - pan);
          rightChannel[startSample + i] += val * pan;
        }
      } else if (randType < 0.94) {
        // B. Muffled warm wood pop (gas pocket releasing, warm low-passed noise)
        const decayTime = 0.008 + Math.random() * 0.018; // 8ms - 26ms
        const amp = 0.12 + Math.random() * 0.18;
        const len = Math.min(Math.floor(decayTime * fireSampleRate * 4), fireSampleRate * fireDuration - startSample);

        let lp = 0;
        for (let i = 0; i < len; i++) {
          const t = i / fireSampleRate;
          const env = Math.exp(-t / decayTime);
          const rawNoise = Math.random() * 2 - 1;
          lp = lp * 0.82 + rawNoise * 0.18; // Warm lowpass
          const val = amp * lp * env;
          leftChannel[startSample + i] += val * (1 - pan);
          rightChannel[startSample + i] += val * pan;
        }
      } else {
        // C. Micro resin sizzle (cluster of 3-5 tiny sparks)
        const sparks = 3 + Math.floor(Math.random() * 3);
        for (let s = 0; s < sparks; s++) {
          const subStart = startSample + Math.floor(s * (fireSampleRate * (0.004 + Math.random() * 0.006)));
          if (subStart >= fireSampleRate * fireDuration - fireSampleRate * 0.02) continue;
          const decayTime = 0.0015 + Math.random() * 0.004;
          const amp = 0.04 + Math.random() * 0.07;
          const len = Math.min(Math.floor(decayTime * fireSampleRate * 3), fireSampleRate * fireDuration - subStart);

          for (let i = 0; i < len; i++) {
            const t = i / fireSampleRate;
            const env = Math.exp(-t / decayTime);
            const val = amp * (Math.random() * 2 - 1) * env;
            leftChannel[subStart + i] += val * (1 - pan);
            rightChannel[subStart + i] += val * pan;
          }
        }
      }
    }

    // Normalize fire crackle buffer to prevent clipping and ensure comfortable warm volume
    let maxPeak = 0;
    for (let i = 0; i < leftChannel.length; i++) {
      if (Math.abs(leftChannel[i]) > maxPeak) maxPeak = Math.abs(leftChannel[i]);
      if (Math.abs(rightChannel[i]) > maxPeak) maxPeak = Math.abs(rightChannel[i]);
    }
    if (maxPeak > 0) {
      const normFactor = 0.80 / maxPeak;
      for (let i = 0; i < leftChannel.length; i++) {
        leftChannel[i] *= normFactor;
        rightChannel[i] *= normFactor;
      }
    }
    this.noiseBuffers.set('fire_crackle', fireBuffer);
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
    const pinkBuffer = this.noiseBuffers.get('pink');
    if (!brownBuffer || !pinkBuffer) return;

    // 1. Continuous ambient storm bed (audible baseline atmosphere)
    const bedSource = this.ctx.createBufferSource();
    bedSource.buffer = brownBuffer;
    bedSource.loop = true;

    const bedFilter = this.ctx.createBiquadFilter();
    bedFilter.type = 'bandpass';
    bedFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
    bedFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const bedGain = this.ctx.createGain();
    bedGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    bedSource.connect(bedFilter);
    bedFilter.connect(bedGain);
    bedGain.connect(gainNode);
    bedSource.start();

    // 2. Dynamic rolling thunderclap synthesis
    let thunderTimeout: ReturnType<typeof setTimeout> | null = null;
    let isRunning = true;

    const triggerThunderRoll = () => {
      if (!this.ctx || !isRunning || !this.activeNodes.has('thunder')) return;

      const now = this.ctx.currentTime;
      const rollDuration = 3.5 + Math.random() * 2.5; // 3.5s to 6s roll

      // Low boom source (brown noise)
      const rollSource = this.ctx.createBufferSource();
      rollSource.buffer = brownBuffer;

      const rollFilter = this.ctx.createBiquadFilter();
      rollFilter.type = 'lowpass';
      rollFilter.frequency.setValueAtTime(450, now);
      rollFilter.frequency.exponentialRampToValueAtTime(180, now + rollDuration);

      const rollGain = this.ctx.createGain();
      const peakVol = 0.6 + Math.random() * 0.35;
      rollGain.gain.setValueAtTime(0.01, now);
      rollGain.gain.linearRampToValueAtTime(peakVol, now + 0.35 + Math.random() * 0.3);
      rollGain.gain.exponentialRampToValueAtTime(0.15, now + rollDuration * 0.6);
      rollGain.gain.exponentialRampToValueAtTime(0.001, now + rollDuration);

      // Mid crackle/rumble body for mobile clarity (pink noise)
      const midSource = this.ctx.createBufferSource();
      midSource.buffer = pinkBuffer;

      const midFilter = this.ctx.createBiquadFilter();
      midFilter.type = 'bandpass';
      midFilter.frequency.setValueAtTime(320 + Math.random() * 180, now);
      midFilter.Q.setValueAtTime(2.0, now);

      const midGain = this.ctx.createGain();
      midGain.gain.setValueAtTime(0.01, now);
      midGain.gain.linearRampToValueAtTime(peakVol * 0.45, now + 0.4);
      midGain.gain.exponentialRampToValueAtTime(0.001, now + rollDuration * 0.8);

      rollSource.connect(rollFilter);
      rollFilter.connect(rollGain);
      rollGain.connect(gainNode);

      midSource.connect(midFilter);
      midFilter.connect(midGain);
      midGain.connect(gainNode);

      rollSource.start(now);
      rollSource.stop(now + rollDuration + 0.1);
      midSource.start(now);
      midSource.stop(now + rollDuration + 0.1);

      // Schedule next thunder roll in 4 to 8 seconds
      const nextDelay = 4000 + Math.random() * 4500;
      thunderTimeout = setTimeout(triggerThunderRoll, nextDelay);
    };

    // Trigger initial thunder boom shortly after activation (0.4s)
    thunderTimeout = setTimeout(triggerThunderRoll, 400);

    this.activeNodes.set('thunder', {
      stop: () => {
        isRunning = false;
        if (thunderTimeout) clearTimeout(thunderTimeout);
        try { bedSource.stop(); } catch {}
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
    const crackleBuffer = this.noiseBuffers.get('fire_crackle');
    const brownBuffer = this.noiseBuffers.get('brown');
    const pinkBuffer = this.noiseBuffers.get('pink');
    if (!crackleBuffer || !brownBuffer || !pinkBuffer) return;

    // 1. Organic Stereo Wood Crackle Bed (Continuous soothing natural crackle)
    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const crackleWarmthFilter = this.ctx.createBiquadFilter();
    crackleWarmthFilter.type = 'lowpass';
    crackleWarmthFilter.frequency.setValueAtTime(2800, this.ctx.currentTime);

    const crackleGain = this.ctx.createGain();
    crackleGain.gain.setValueAtTime(0.70, this.ctx.currentTime);

    crackleSource.connect(crackleWarmthFilter);
    crackleWarmthFilter.connect(crackleGain);
    crackleGain.connect(gainNode);
    crackleSource.start();

    // 2. Steady Deep Hearth & Burning Log Warmth (Subtle low-end body)
    const emberSource = this.ctx.createBufferSource();
    emberSource.buffer = brownBuffer;
    emberSource.loop = true;

    const emberFilter = this.ctx.createBiquadFilter();
    emberFilter.type = 'lowpass';
    emberFilter.frequency.setValueAtTime(160, this.ctx.currentTime);

    const emberGain = this.ctx.createGain();
    emberGain.gain.setValueAtTime(0.32, this.ctx.currentTime);

    emberSource.connect(emberFilter);
    emberFilter.connect(emberGain);
    emberGain.connect(gainNode);
    emberSource.start();

    // 3. Subtle Warm Glowing Charcoal Air (Gentle steady whisper of heat)
    const airSource = this.ctx.createBufferSource();
    airSource.buffer = pinkBuffer;
    airSource.loop = true;

    const airFilter = this.ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.setValueAtTime(750, this.ctx.currentTime);
    airFilter.Q.setValueAtTime(0.4, this.ctx.currentTime);

    const airGain = this.ctx.createGain();
    airGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    airSource.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(gainNode);
    airSource.start();

    // 4. Natural Occasional Wood Fiber Fracture (Soft, non-tonal, every 4-8s)
    let isRunning = true;
    let popTimeout: ReturnType<typeof setTimeout> | null = null;

    const triggerNaturalWoodPop = () => {
      if (!this.ctx || !isRunning || !this.activeNodes.has('fireplace')) return;

      const now = this.ctx.currentTime;
      const whiteBuffer = this.noiseBuffers.get('white');
      const brownBuff = this.noiseBuffers.get('brown');

      // Soft non-tonal wood fracture snap
      if (whiteBuffer) {
        const snapSource = this.ctx.createBufferSource();
        snapSource.buffer = whiteBuffer;

        const snapFilter = this.ctx.createBiquadFilter();
        snapFilter.type = 'bandpass';
        snapFilter.frequency.setValueAtTime(950 + Math.random() * 600, now);
        snapFilter.Q.setValueAtTime(1.6, now);

        const snapGain = this.ctx.createGain();
        snapGain.gain.setValueAtTime(0.045 + Math.random() * 0.035, now);
        snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

        snapSource.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(gainNode);

        snapSource.start(now);
        snapSource.stop(now + 0.02);
      }

      // Soft muffled low thump
      if (brownBuff) {
        const thumpSource = this.ctx.createBufferSource();
        thumpSource.buffer = brownBuff;

        const thumpFilter = this.ctx.createBiquadFilter();
        thumpFilter.type = 'lowpass';
        thumpFilter.frequency.setValueAtTime(120, now);

        const thumpGain = this.ctx.createGain();
        thumpGain.gain.setValueAtTime(0.06 + Math.random() * 0.04, now);
        thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        thumpSource.connect(thumpFilter);
        thumpFilter.connect(thumpGain);
        thumpGain.connect(gainNode);

        thumpSource.start(now);
        thumpSource.stop(now + 0.04);
      }

      // Schedule next natural wood pop (every 3.5 to 7.5 seconds)
      const nextDelay = 3500 + Math.random() * 4000;
      popTimeout = setTimeout(triggerNaturalWoodPop, nextDelay);
    };

    popTimeout = setTimeout(triggerNaturalWoodPop, 2000);

    this.activeNodes.set('fireplace', {
      stop: () => {
        isRunning = false;
        if (popTimeout) clearTimeout(popTimeout);
        try {
          crackleSource.stop();
          emberSource.stop();
          airSource.stop();
        } catch {}
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
