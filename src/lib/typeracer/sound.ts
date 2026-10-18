/**
 * Web Audio API Tactile Sound Engine for TypeRacer & Touch Typing Academy
 * Provides realistic mechanical keyboard switch sound profiles, error cues,
 * countdown beeps, and victory chimes with persistent user mute preferences.
 */

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private readonly storageKey = 'tinykite_typeracer_sound_enabled';

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
    }
  }

  public init(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, val ? 'true' : 'false');
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  /**
   * Tactile Mechanical Switch Click (Simulates crisp mechanical tactile bump)
   */
  public playKeyClick(): void {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // High click transient
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.035);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.035);

      // Low housing bottom-out clack
      const clackOsc = this.ctx.createOscillator();
      const clackGain = this.ctx.createGain();
      clackOsc.type = 'sine';
      clackOsc.frequency.setValueAtTime(220, t);
      clackOsc.frequency.exponentialRampToValueAtTime(80, t + 0.025);

      clackGain.gain.setValueAtTime(0.04, t);
      clackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      clackOsc.connect(clackGain);
      clackGain.connect(this.ctx.destination);
      clackOsc.start(t);
      clackOsc.stop(t + 0.025);
    } catch (_) {}
  }

  /**
   * Tactile Mechanical Spacebar Click (Deeper resonance for large stabilizer keycap)
   */
  public playSpaceClick(): void {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.045);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.045);
    } catch (_) {}
  }

  /**
   * Alias for playError to match client engine naming
   */
  public playErrorThud(): void {
    this.playError();
  }

  /**
   * Carriage Return (Enter ↵) Sound
   */
  public playReturnClick(): void {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.14);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    } catch (_) {}
  }

  /**
   * Mistake Audio Cue: Low soft dull thud (non-jarring but distinct)
   */
  public playError(): void {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.07);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch (_) {}
  }

  /**
   * Ready... Set... GO! Audio Beeps
   */
  public playCountdownBeep(isGo: boolean = false): void {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isGo ? 'triangle' : 'sine';
      const freq = isGo ? 880 : 440;
      const dur = isGo ? 0.35 : 0.16;

      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
    } catch (_) {}
  }

  /**
   * Finish Chime (Ascending triad / arpeggio)
   */
  public playFinishChime(isVictory: boolean = false): void {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const notes = isVictory ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteStart = t + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);
        gain.gain.setValueAtTime(0.14, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch (_) {}
  }
  public isMuted(): boolean {
    return !this.enabled;
  }

  public toggleMute(): boolean {
    this.setEnabled(!this.enabled);
    return !this.enabled;
  }
}

export const sound = new SoundEngine();
export const soundEngine = sound;
