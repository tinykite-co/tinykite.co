/**
 * Web Audio API Synthesizer for Stopwatch, Timer, and Alarm sound feedback.
 *
 * Fully synthesized with zero external audio assets.
 * Safely guards server-side rendering (SSR) and environments without AudioContext.
 * Strict TypeScript compliant with astro/tsconfigs/strictest.
 */

import {
  SOUND_PROFILES,
  type SoundProfileId,
  type SoundProfileConfig,
  STORAGE_KEYS,
} from './config.ts';

export class ClockSoundEngine {
  private audioCtx: AudioContext | null = null;
  private muted: boolean = false;

  public constructor(audioContext?: AudioContext) {
    if (audioContext) {
      this.audioCtx = audioContext;
    }
    this.muted = this.readMuteFromStorage();
  }

  private readMuteFromStorage(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (stored) {
        const parsed = JSON.parse(stored) as { soundEnabled?: boolean };
        if (typeof parsed.soundEnabled === 'boolean') {
          return !parsed.soundEnabled;
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return false;
  }

  private writeMuteToStorage(muted: boolean): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      const parsed = stored ? (JSON.parse(stored) as Record<string, unknown>) : {};
      parsed['soundEnabled'] = !muted;
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(parsed));
    } catch {
      // Ignore storage write errors
    }
  }

  private getAudioContext(): AudioContext | null {
    if (this.audioCtx) {
      return this.audioCtx;
    }
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    } catch {
      this.audioCtx = null;
    }

    return this.audioCtx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.writeMuteToStorage(muted);
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Internal helper to synthesize a pure tone using an OscillatorNode and GainNode.
   */
  private playTone(
    frequency: number,
    durationSec: number,
    options: {
      type?: OscillatorType;
      gain?: number;
      delaySec?: number;
    } = {}
  ): void {
    if (this.muted) {
      return;
    }

    const ctx = this.getAudioContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    const oscType = options.type ?? 'sine';
    const maxGain = options.gain ?? 0.2;
    const delaySec = options.delaySec ?? 0;

    const startTime = ctx.currentTime + delaySec;
    const endTime = startTime + durationSec;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = oscType;
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    // Smooth fast attack
    gain.gain.exponentialRampToValueAtTime(maxGain, startTime + 0.015);
    // Exponential release decay
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(endTime);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  public playStartBeep(): void {
    this.playTone(880, 0.07, { type: 'sine', gain: 0.18 });
  }

  public playStopBeep(): void {
    this.playTone(440, 0.12, { type: 'sine', gain: 0.18 });
  }

  public playLapBeep(isBestLap: boolean = false): void {
    if (isBestLap) {
      // Upbeat double-chime for a personal best lap
      this.playTone(880, 0.08, { type: 'triangle', gain: 0.2, delaySec: 0 });
      this.playTone(1320, 0.14, { type: 'triangle', gain: 0.22, delaySec: 0.07 });
    } else {
      this.playTone(660, 0.06, { type: 'sine', gain: 0.16 });
    }
  }

  public playResetClick(): void {
    this.playTone(260, 0.04, { type: 'sine', gain: 0.12 });
  }

  public playTimerChime(profileId: SoundProfileId = 'crystal-chime'): void {
    const profile =
      SOUND_PROFILES.find((p) => p.id === profileId) ??
      (SOUND_PROFILES[0] as SoundProfileConfig);

    for (const tone of profile.tones) {
      this.playTone(tone.frequency, tone.durationMs / 1000, {
        type: profile.waveform,
        gain: tone.gain,
        delaySec: tone.delayMs / 1000,
      });
    }
  }

  public playAlarmPulse(profileId: SoundProfileId = 'crystal-chime'): void {
    // Alarm triggers in rhythmic warning pulses
    this.playTimerChime(profileId);
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (!this.muted) {
          this.playTimerChime(profileId);
        }
      }, 550);
    }
  }
}
