// Web Audio API & Web Haptics synthesizer for calming ambient feedback

class SoundEffects {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Trigger web vibration if available
  public vibrate(pattern: number | number[] = 15) {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore error if vibration isn't allowed without gesture
      }
    }
  }

  // Soothing release chime (gentle ethereal dual chime)
  public playReleaseSound() {
    try {
      this.init();
      if (!this.ctx) return;
      this.vibrate([20, 50, 30]);

      const now = this.ctx.currentTime;
      
      // Fundamental soft sine wave
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, now); // A4 432Hz calming tuning
      osc1.frequency.exponentialRampToValueAtTime(864, now + 0.8);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      // Harmony
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(648, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1296, now + 0.85);

      gain2.gain.setValueAtTime(0.001, now + 0.05);
      gain2.gain.linearRampToValueAtTime(0.08, now + 0.15);
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
      // Audio autoplay restrictions safeguard
    }
  }

  // Soft tactile click
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

  // Delete sound (subtle low thud)
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

  // Save sound (gentle sparkle)
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
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // ignore
    }
  }
}

export const soundEffects = new SoundEffects();
