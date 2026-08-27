// Web Audio API Synthesizer for Calming Soundscapes, ASMR Typing & Ambient Feedback
import { AmbientSoundscape, TypingSoundPack } from '../types';

class SoundEffects {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private activeAmbientNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private currentAmbient: AmbientSoundscape = 'off';
  private currentVolume = 0.5;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public vibrate(pattern: number | number[] = 15) {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore vibration restrictions
      }
    }
  }

  // --- Release Chime ---
  public playReleaseSound() {
    try {
      this.init();
      if (!this.ctx) return;
      this.vibrate([20, 50, 30]);

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, now);
      osc1.frequency.exponentialRampToValueAtTime(864, now + 0.8);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.14, now + 0.1);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(648, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1296, now + 0.85);

      gain2.gain.setValueAtTime(0.001, now + 0.05);
      gain2.gain.linearRampToValueAtTime(0.09, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 1.25);
      osc2.start(now + 0.05);
      osc2.stop(now + 1.35);
    } catch {
      // Audio autoplay safeguard
    }
  }

  // --- General UI Click ---
  public playClickSound() {
    try {
      this.init();
      if (!this.ctx) return;
      this.vibrate(8);

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  // --- Pentatonic & Solfeggio Resonant Frequencies (C4..C6) ---
  private static PENTATONIC = [
    261.63, 293.66, 329.63, 392.0, 440.0,
    523.25, 587.33, 659.25, 783.99, 880.0,
    1046.5, 1174.66, 1318.51
  ];

  private getWordHash(word?: string): number {
    let hash = 0;
    const clean = (word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) return 42;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash << 5) - hash + clean.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // --- ASMR Typing Sound Packs (Unique Tone per Word) ---
  public playTypingSound(
    pack: TypingSoundPack = 'classic',
    word?: string,
    char?: string,
    isWordBoundary: boolean = false
  ) {
    try {
      this.init();
      if (!this.ctx) return;
      this.vibrate(isWordBoundary ? 8 : 4);
      const now = this.ctx.currentTime;
      const hash = this.getWordHash(word);
      const charCode = (char || 'a').charCodeAt(0);
      const charStep = charCode % 5;
      const scale = SoundEffects.PENTATONIC;
      const baseIdx = hash % (scale.length - 5);
      const wordFreq = scale[baseIdx + charStep];

      switch (pack) {
        case 'typewriter': {
          if (isWordBoundary) {
            // Carriage return bell chime + mechanical latch
            const bell = this.ctx.createOscillator();
            const bGain = this.ctx.createGain();
            bell.type = 'sine';
            bell.frequency.setValueAtTime(2093.0, now);
            bGain.gain.setValueAtTime(0.001, now);
            bGain.gain.linearRampToValueAtTime(0.09, now + 0.006);
            bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
            bell.connect(bGain);
            bGain.connect(this.ctx.destination);
            bell.start(now);
            bell.stop(now + 0.4);

            const clack = this.ctx.createOscillator();
            const cGain = this.ctx.createGain();
            clack.type = 'triangle';
            clack.frequency.setValueAtTime(320, now);
            clack.frequency.exponentialRampToValueAtTime(70, now + 0.05);
            cGain.gain.setValueAtTime(0.07, now);
            cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            clack.connect(cGain);
            cGain.connect(this.ctx.destination);
            clack.start(now);
            clack.stop(now + 0.065);
          } else {
            // Sharp vintage typewriter clack tuned to word
            const strikeFreq = 1200 + (hash % 600) + charStep * 40;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(strikeFreq, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.03);

            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
          }
          break;
        }

        case 'mechanical': {
          // Thocky Custom Switch
          const baseThock = 140 + (hash % 70) + (isWordBoundary ? -25 : charStep * 6);
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(baseThock * 3.2, now);
          osc.frequency.exponentialRampToValueAtTime(baseThock, now + (isWordBoundary ? 0.07 : 0.045));

          gain.gain.setValueAtTime(isWordBoundary ? 0.09 : 0.065, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (isWordBoundary ? 0.08 : 0.05));

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + (isWordBoundary ? 0.09 : 0.06));
          break;
        }

        case 'waterdrop': {
          if (isWordBoundary) {
            [wordFreq, wordFreq * 1.5].forEach((freq, idx) => {
              const d = this.ctx!.createOscillator();
              const dg = this.ctx!.createGain();
              const t = now + idx * 0.055;
              d.type = 'sine';
              d.frequency.setValueAtTime(freq, t);
              d.frequency.exponentialRampToValueAtTime(freq * 1.55, t + 0.07);
              dg.gain.setValueAtTime(0.05, t);
              dg.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
              d.connect(dg);
              dg.connect(this.ctx!.destination);
              d.start(t);
              d.stop(t + 0.13);
            });
          } else {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(wordFreq, now);
            osc.frequency.exponentialRampToValueAtTime(wordFreq * 1.5, now + 0.06);

            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
          }
          break;
        }

        case 'bubble': {
          const popFreq = 380 + (hash % 300) + charStep * 30;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(popFreq, now);
          osc.frequency.exponentialRampToValueAtTime(popFreq * 2.1, now + 0.05);

          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }

        case 'kalimba': {
          if (isWordBoundary) {
            const chord = [
              scale[baseIdx],
              scale[(baseIdx + 2) % scale.length],
              scale[(baseIdx + 4) % scale.length]
            ];
            chord.forEach((freq, idx) => {
              const k = this.ctx!.createOscillator();
              const kg = this.ctx!.createGain();
              const t = now + idx * 0.035;
              k.type = 'sine';
              k.frequency.setValueAtTime(freq, t);
              kg.gain.setValueAtTime(0.001, t);
              kg.gain.linearRampToValueAtTime(0.045, t + 0.008);
              kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
              k.connect(kg);
              kg.connect(this.ctx!.destination);
              k.start(t);
              k.stop(t + 0.4);
            });
          } else {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(wordFreq, now);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.055, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.28);
          }
          break;
        }

        case 'classic':
        default: {
          const bodyFreq = 520 + (hash % 480) + (isWordBoundary ? 80 : charStep * 25);
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(bodyFreq, now);
          osc.frequency.exponentialRampToValueAtTime(bodyFreq * 0.3, now + (isWordBoundary ? 0.04 : 0.025));

          gain.gain.setValueAtTime(0.045, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (isWordBoundary ? 0.045 : 0.03));

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + (isWordBoundary ? 0.05 : 0.035));
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  // --- Delete Sound ---
  public playDeleteSound() {
    try {
      this.init();
      if (!this.ctx) return;
      this.vibrate([10, 30, 10]);

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // ignore
    }
  }

  // --- Save / Keep Sound ---
  public playSaveSound() {
    try {
      this.init();
      if (!this.ctx) return;
      this.vibrate(20);

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // ignore
    }
  }

  public playShatterSound() {
    try {
      this.init();
      if (!this.ctx) return;
      this.vibrate([40, 30, 80]);
      const now = this.ctx.currentTime;

      // 1. Harsh White Noise Crack Burst
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1600, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);

      // 2. High-Pitched Crystalline Shatter Shards (Multiple glass harmonic rings)
      const frequencies = [3400, 4800, 6200, 7800, 9200];
      frequencies.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() * 400 - 200), now + idx * 0.02);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.5 + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.02 + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45 + idx * 0.05);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.02);
        osc.stop(now + 0.55 + idx * 0.05);
      });
    } catch {
      // ignore
    }
  }

  private htmlAudioElements: Record<string, HTMLAudioElement> = {};

  // --- Generative & Studio Ambient Soundscapes ---
  public setAmbientSoundscape(soundscape: AmbientSoundscape, volume = 0.5) {
    this.currentAmbient = soundscape;
    this.currentVolume = volume;

    this.stopAmbient();

    if (soundscape === 'off') return;

    const urls: Record<string, string> = {
      zen432: '/sounds/zen432.wav',
      rain: '/sounds/rain.wav',
      breeze: '/sounds/breeze.wav',
      stream: '/sounds/stream.wav',
      brown: '/sounds/brown.wav',
    };

    const url = urls[soundscape];
    if (url && typeof Audio !== 'undefined') {
      try {
        let audio = this.htmlAudioElements[soundscape];
        if (!audio) {
          audio = new Audio(url);
          audio.loop = true;
          audio.preload = 'auto';
          this.htmlAudioElements[soundscape] = audio;
        }
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      } catch {
        // Fallback to Web Audio
      }
    }
  }

  public setAmbientVolume(volume: number) {
    this.currentVolume = volume;
    if (this.currentAmbient !== 'off' && this.htmlAudioElements[this.currentAmbient]) {
      this.htmlAudioElements[this.currentAmbient].volume = Math.max(0, Math.min(1, volume));
    }
  }

  public stopAmbient() {
    Object.values(this.htmlAudioElements).forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
  }
}

export const soundEffects = new SoundEffects();

