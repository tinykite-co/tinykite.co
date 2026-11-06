/**
 * Unified Client Application Controller for Stopwatch, Timer, Alarm, and World Clock.
 *
 * Implements 60fps rAF analog chronograph loop, 250ms precision ticker,
 * multi-timer state transitions, sound synthesis, CSV/clipboard exports,
 * WCAG accessible tab navigation, and tactile keyboard shortcuts.
 * Strict TypeScript compliant with astro/tsconfigs/strictest.
 */

import {
  type SoundProfileId,
  WORLD_CITIES,
  DEFAULT_PREFERENCES,
  type StopwatchPreferences,
} from './config.ts';
import {
  StopwatchEngine,
  formatDuration,
  computeAnalogAngles,
} from './stopwatch-engine.ts';
import {
  TimerEngine,
  parseHmsToMs,
} from './timer-engine.ts';
import {
  type AlarmItem,
  type DayOfWeek,
  createAlarm,
  toggleAlarm,
  snoozeAlarm,
  dismissAlarm,
  shouldAlarmTrigger,
  getNextAlarmMsFromNow,
  formatAlarmTime,
  formatRepeatDaysLabel,
  formatCountdownUntilAlarm,
} from './alarm-engine.ts';
import {
  getWorldClockReading,
  type WorldClockReading,
} from './world-clock.ts';
import { ClockSoundEngine } from './sound.ts';
import { StopwatchStorage } from './storage.ts';

type ActiveTab = 'stopwatch' | 'timer' | 'alarm' | 'worldclock';

export class ChronoAppController {
  private swEngine: StopwatchEngine;
  private timerEngine: TimerEngine;
  private soundEngine: ClockSoundEngine;
  private storage: StopwatchStorage;

  private prefs: StopwatchPreferences;
  private activeTab: ActiveTab = 'stopwatch';
  private tickerIntervalId: number | null = null;
  private rafId: number | null = null;

  private ringingAlarm: AlarmItem | null = null;
  private cityFilterQuery: string = '';
  private deferredInstallPrompt: any = null;
  private defaultDocumentTitle = 'Desktop Precision Chrono Suite · Stopwatch & Timer | TinyKite';

  public constructor() {
    if (typeof document !== 'undefined' && document.title) {
      this.defaultDocumentTitle = document.title;
    }
    this.swEngine = new StopwatchEngine();
    this.timerEngine = new TimerEngine();
    this.soundEngine = new ClockSoundEngine();
    this.storage = new StopwatchStorage();

    this.prefs = this.storage.getPreferences() ?? { ...DEFAULT_PREFERENCES };

    // Initialize Hero Timer (25m Focus = 1,500,000ms)
    this.timerEngine.addTimer('hero', '25m Focus', 1_500_000);

    // Initialize 2 helpful secondary multi-timers
    this.timerEngine.addTimer('multi_reading', '10m Reading', 600_000);
    this.timerEngine.addTimer('multi_break', '5m Break', 300_000);

    if (this.prefs.targetPaceSeconds !== null) {
      this.swEngine.setTargetPaceMs(this.prefs.targetPaceSeconds * 1000);
    }
    this.soundEngine.setMuted(!this.prefs.soundEnabled);
  }

  public init(): void {
    this.initTabRouting();
    this.bindGlobalControls();
    this.bindStopwatch();
    this.bindTimer();
    this.bindAlarm();
    this.bindWorldClock();
    this.bindKeyboardShortcuts();
    this.initServiceWorkerAndOffline();

    this.renderAll();
    this.startTicker();
  }

  public destroy(): void {
    if (this.tickerIntervalId !== null) {
      clearInterval(this.tickerIntervalId);
      this.tickerIntervalId = null;
    }
    this.stopStopwatchRaf();
  }

  // --- TAB NAVIGATION & ROUTING ---

  private initTabRouting(): void {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.toLowerCase().replace('#', '');
    const pathname = window.location.pathname.toLowerCase();
    const rootInitialTab = document.getElementById('chrono-app-root')?.dataset.initialTab as ActiveTab | undefined;

    let initialTab: ActiveTab = 'stopwatch';
    if (hash === 'timer' || hash === 'alarm' || hash === 'worldclock' || hash === 'stopwatch') {
      initialTab = hash;
    } else if (pathname.includes('/timer')) {
      initialTab = 'timer';
    } else if (pathname.includes('/alarm')) {
      initialTab = 'alarm';
    } else if (pathname.includes('/clock')) {
      initialTab = 'worldclock';
    } else if (pathname.includes('/stopwatch')) {
      initialTab = 'stopwatch';
    } else if (rootInitialTab && ['stopwatch', 'timer', 'alarm', 'worldclock'].includes(rootInitialTab)) {
      initialTab = rootInitialTab;
    }

    this.switchTab(initialTab, false);

    window.addEventListener('popstate', (e) => {
      const stateTab = e.state?.tab as ActiveTab | undefined;
      if (stateTab && ['stopwatch', 'timer', 'alarm', 'worldclock'].includes(stateTab)) {
        this.switchTab(stateTab, false);
      } else {
        const path = window.location.pathname.toLowerCase();
        let detected: ActiveTab = 'stopwatch';
        if (path.includes('/timer')) detected = 'timer';
        else if (path.includes('/alarm')) detected = 'alarm';
        else if (path.includes('/clock')) detected = 'worldclock';
        else if (path.includes('/stopwatch')) detected = 'stopwatch';
        this.switchTab(detected, false);
      }
    });

    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.toLowerCase().replace('#', '');
      if (newHash === 'timer' || newHash === 'alarm' || newHash === 'worldclock' || newHash === 'stopwatch') {
        this.switchTab(newHash, false);
      }
    });
  }

  public switchTab(tab: ActiveTab, updateHistory: boolean = true): void {
    this.activeTab = tab;

    const routeSlug = tab === 'worldclock' ? 'clock' : tab;
    const titles: Record<ActiveTab, string> = {
      stopwatch: 'Stopwatch · Clock by TinyKite',
      timer: 'Timer · Clock by TinyKite',
      alarm: 'Alarm · Clock by TinyKite',
      worldclock: 'Clock by TinyKite',
    };
    if (typeof document !== 'undefined') {
      document.title = titles[tab] || 'Clock by TinyKite';
    }

    if (updateHistory && typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isSubpath = pathname.startsWith('/stopwatch/');
      const targetPath = isSubpath ? `/stopwatch/${routeSlug}/` : `/${routeSlug}/`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    }

    const tabs: ActiveTab[] = ['stopwatch', 'timer', 'alarm', 'worldclock'];
    for (const t of tabs) {
      const btn = document.getElementById(`tab-btn-${t}`);
      const panel = document.getElementById(`panel-${t}`);
      const isSelected = t === tab;

      if (btn) {
        btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        btn.setAttribute('tabindex', isSelected ? '0' : '-1');

        if (isSelected) {
          btn.className =
            'tab-btn px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs min-h-[34px] flex items-center gap-1.5 cursor-pointer';
        } else {
          btn.className =
            'tab-btn px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white min-h-[34px] flex items-center gap-1.5 cursor-pointer';
        }
      }

      if (panel) {
        if (isSelected) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      }
    }

    if (tab === 'worldclock') {
      this.renderWorldClock();
    }
  }

  // --- RENDER ALL & TICKER ---

  private renderAll(): void {
    this.renderHeaderControls();
    this.renderStopwatchStatic();
    this.renderTimerHero();
    this.renderMultiTimers();
    this.renderAlarmsList();
    this.renderWorldClock();
    this.renderSavedSessionsList();
  }

  private startTicker(): void {
    this.tick();
    this.tickerIntervalId = window.setInterval(() => {
      this.tick();
    }, 250);
  }

  private tick(): void {
    const now = new Date();
    const nowMs = now.getTime();

    // 1. Live Wall Clock in Header
    this.updateHeaderClock(now);

    // 2. Timer Engine Tick
    const { updated: _updated, justCompletedIds } = this.timerEngine.tickAll(nowMs);
    this.renderTimerHero();
    this.renderMultiTimers();

    if (justCompletedIds.length > 0) {
      if (justCompletedIds.includes('hero')) {
        this.soundEngine.playTimerChime(this.prefs.activeSoundProfile);
        const banner = document.getElementById('timer-completed-banner');
        if (banner) banner.classList.remove('hidden');
        this.updateTimerStartButton(false);
      } else {
        this.soundEngine.playTimerChime(this.prefs.activeSoundProfile);
      }
    }

    // 3. Alarm Engine Check
    const alarms = this.storage.getAlarms();
    for (const alarm of alarms) {
      if (shouldAlarmTrigger(alarm, now)) {
        this.triggerAlarm(alarm);
        break;
      }
    }
    this.updateAlarmBanner(alarms, now);

    // 4. World Clock & Local Clock Ticks
    if (this.activeTab === 'worldclock') {
      this.renderLocalDeskClock(now);
      this.updateWorldClockTimes(now);
    }

    // 5. Dynamic Document Title
    this.updateDocumentTitle();
  }

  private updateHeaderClock(now: Date): void {
    const el = document.getElementById('header-live-clock');
    if (!el) return;

    const span = el.querySelector('span:last-child');
    if (!span) return;

    const hour24 = now.getHours();
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    if (this.prefs.use24Hour) {
      span.textContent = `${String(hour24).padStart(2, '0')}:${minute}:${second}`;
    } else {
      const period = hour24 >= 12 ? 'PM' : 'AM';
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
      span.textContent = `${String(hour12)}:${minute}:${second} ${period}`;
    }
  }

  private updateDocumentTitle(): void {
    const swStatus = this.swEngine.getStatus();
    const heroTimer = this.timerEngine.getTimer('hero');

    if (swStatus === 'running') {
      const snap = this.swEngine.getSnapshot();
      const timeStr = this.prefs.showMilliseconds ? snap.formattedTotal.fullWithMs : snap.formattedTotal.compact;
      document.title = `⏱ ${timeStr} · Clock by TinyKite`;
    } else if (heroTimer && heroTimer.status === 'running') {
      const totalSec = Math.ceil(heroTimer.remainingMs / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      document.title = `⏳ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} · Clock by TinyKite`;
    } else {
      document.title = this.defaultDocumentTitle;
    }
  }

  // --- GLOBAL UTILITIES (SOUND, 12/24H, FULLSCREEN) ---

  private bindGlobalControls(): void {
    // 12H / 24H Toggle
    const btnFormat = document.getElementById('btn-format-toggle');
    if (btnFormat) {
      btnFormat.addEventListener('click', () => {
        this.prefs.use24Hour = !this.prefs.use24Hour;
        this.storage.savePreferences({ use24Hour: this.prefs.use24Hour });
        btnFormat.textContent = this.prefs.use24Hour ? '24H' : '12H';
        this.renderAll();
      });
    }

    // Sound Toggle
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isMuted = this.soundEngine.toggleMute();
        this.prefs.soundEnabled = !isMuted;
        this.storage.savePreferences({ soundEnabled: !isMuted });
        this.renderSoundButton();
      });
    }

    // Fullscreen Toggle
    const btnFullscreen = document.getElementById('btn-fullscreen-toggle');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    // Chrono Theme Toggle
    const btnTheme = document.getElementById('btn-chrono-theme-toggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        try {
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch {}
      });
    }

    // Tab buttons click
    const tabBtns = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab') as ActiveTab | null;
        if (tab) {
          this.switchTab(tab);
        }
      });
    });
  }

  private toggleFullscreen(): void {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen().catch(() => {});
    } else {
      void document.exitFullscreen().catch(() => {});
    }
  }

  private renderHeaderControls(): void {
    const btnFormat = document.getElementById('btn-format-toggle');
    if (btnFormat) {
      btnFormat.textContent = this.prefs.use24Hour ? '24H' : '12H';
    }
    this.renderSoundButton();
  }

  private renderSoundButton(): void {
    const icon = document.getElementById('sound-toggle-icon');
    const label = document.getElementById('sound-toggle-label');
    const isMuted = this.soundEngine.isMuted();

    if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
    if (label) label.textContent = isMuted ? 'Muted' : 'Sound On';
  }

  // --- STOPWATCH CONTROLLER & 60FPS RAF LOOP ---

  private bindStopwatch(): void {
    // Start / Pause
    const btnStart = document.getElementById('btn-sw-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.toggleStopwatch();
      });
    }

    // Lap
    const btnLap = document.getElementById('btn-sw-lap');
    if (btnLap) {
      btnLap.addEventListener('click', () => {
        this.recordStopwatchLap();
      });
    }

    // Reset
    const btnReset = document.getElementById('btn-sw-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.resetStopwatch();
      });
    }

    // Millisecond Toggle (.cc vs .mmm)
    const btnMs = document.getElementById('btn-ms-toggle');
    if (btnMs) {
      btnMs.textContent = this.prefs.showMilliseconds ? '.mmm' : '.cc';
      btnMs.addEventListener('click', () => {
        this.prefs.showMilliseconds = !this.prefs.showMilliseconds;
        this.storage.savePreferences({ showMilliseconds: this.prefs.showMilliseconds });
        btnMs.textContent = this.prefs.showMilliseconds ? '.mmm' : '.cc';
        this.updateStopwatchDigital(this.swEngine.getSnapshot());
      });
    }

    // Target Ghost Pacer
    const inputPace = document.getElementById('input-target-pace') as HTMLInputElement | null;
    if (inputPace) {
      if (this.prefs.targetPaceSeconds !== null) {
        inputPace.value = String(this.prefs.targetPaceSeconds);
      }
      inputPace.addEventListener('input', () => {
        const val = parseFloat(inputPace.value);
        const paceSec = Number.isFinite(val) && val > 0 ? val : null;
        this.prefs.targetPaceSeconds = paceSec;
        this.swEngine.setTargetPaceMs(paceSec !== null ? paceSec * 1000 : null);
        this.storage.savePreferences({ targetPaceSeconds: paceSec });
        this.updatePaceBadge(this.swEngine.getSnapshot());
      });
    }

    // Ghost Pacer Pills
    const pacePills = document.querySelectorAll<HTMLButtonElement>('.btn-pace-preset, .pace-preset-btn');
    pacePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const paceStr = pill.getAttribute('data-pace') || pill.getAttribute('data-seconds');
        const pace = paceStr ? parseFloat(paceStr) : 0;
        if (inputPace) inputPace.value = String(pace);
        this.prefs.targetPaceSeconds = pace > 0 ? pace : null;
        this.swEngine.setTargetPaceMs(pace > 0 ? pace * 1000 : null);
        this.storage.savePreferences({ targetPaceSeconds: this.prefs.targetPaceSeconds });
        this.updatePaceBadge(this.swEngine.getSnapshot());
      });
    });

    const btnPaceClear = document.getElementById('btn-pace-clear') || document.getElementById('btn-clear-pace');
    if (btnPaceClear) {
      btnPaceClear.addEventListener('click', () => {
        if (inputPace) inputPace.value = '';
        this.prefs.targetPaceSeconds = null;
        this.swEngine.setTargetPaceMs(null);
        this.storage.savePreferences({ targetPaceSeconds: null });
        this.updatePaceBadge(this.swEngine.getSnapshot());
      });
    }

    // Copy Laps & Export CSV
    const btnCopyLaps = document.getElementById('btn-copy-laps');
    if (btnCopyLaps) {
      btnCopyLaps.addEventListener('click', () => {
        this.copyLapsToClipboard();
      });
    }

    const btnExportCsv = document.getElementById('btn-export-csv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        this.exportLapsCsv();
      });
    }

    // Save Session Buttons
    const btnSaveSession = document.getElementById('btn-save-session');
    if (btnSaveSession) {
      btnSaveSession.addEventListener('click', () => {
        const details = document.getElementById('sw-saved-sessions-panel') as HTMLDetailsElement | null;
        if (details && details.tagName.toLowerCase() === 'details' && !details.open) {
          details.open = true;
        }
        this.saveCurrentSession();
      });
    }

    const btnSaveSubmit = document.getElementById('btn-save-session-submit');
    if (btnSaveSubmit) {
      btnSaveSubmit.addEventListener('click', () => {
        this.saveCurrentSession();
      });
    }
  }

  private toggleStopwatch(): void {
    const status = this.swEngine.getStatus();
    if (status === 'running') {
      this.swEngine.pause();
      this.soundEngine.playStopBeep();
      this.stopStopwatchRaf();
      this.updateStopwatchUi();
    } else {
      this.swEngine.start();
      this.soundEngine.playStartBeep();
      this.startStopwatchRaf();
      this.updateStopwatchUi();
    }
  }

  private recordStopwatchLap(): void {
    if (this.swEngine.getStatus() === 'idle') return;

    const lap = this.swEngine.recordLap();
    if (lap) {
      const isBest = lap.status === 'fastest';
      this.soundEngine.playLapBeep(isBest);
      this.renderLapsTable();
      this.renderTelemetryHud();
    }
  }

  private resetStopwatch(): void {
    this.swEngine.reset();
    this.soundEngine.playResetClick();
    this.stopStopwatchRaf();
    this.updateStopwatchUi();
    this.renderLapsTable();
    this.renderTelemetryHud();
    this.resetDialAngles();
  }

  private startStopwatchRaf(): void {
    if (this.rafId !== null) return;

    const loop = (): void => {
      if (this.swEngine.getStatus() === 'running') {
        const snap = this.swEngine.getSnapshot();
        this.updateStopwatchDigital(snap);
        this.updateStopwatchAnalogHands(snap.dialAngles);
        this.updatePaceBadge(snap);
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(loop);
  }

  private stopStopwatchRaf(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private updateStopwatchUi(): void {
    const snap = this.swEngine.getSnapshot();
    const status = snap.status;

    // Status Badge
    const badge = document.getElementById('sw-status-badge');
    if (badge) {
      badge.textContent = status === 'idle' ? 'READY' : status.toUpperCase();
      if (status === 'running') {
        badge.className = 'px-3 py-1 text-xs font-black tracking-widest rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30';
      } else if (status === 'paused') {
        badge.className = 'px-3 py-1 text-xs font-black tracking-widest rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30';
      } else {
        badge.className = 'px-3 py-1 text-xs font-black tracking-widest rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30';
      }
    }

    // Start / Pause Button
    const btnStart = document.getElementById('btn-sw-start');
    const startIcon = document.getElementById('sw-start-icon');
    const startLabel = document.getElementById('sw-start-label');

    if (btnStart && startIcon && startLabel) {
      if (status === 'running') {
        startIcon.textContent = '⏸';
        startLabel.textContent = 'Pause';
        btnStart.className = 'refraction-btn min-h-[54px] rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all active:scale-95';
      } else if (status === 'paused') {
        startIcon.textContent = '▶';
        startLabel.textContent = 'Resume';
        btnStart.className = 'refraction-btn min-h-[54px] rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95';
      } else {
        startIcon.textContent = '▶';
        startLabel.textContent = 'Start';
        btnStart.className = 'refraction-btn min-h-[54px] rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95';
      }
    }

    // Lap & Reset button states
    const btnLap = document.getElementById('btn-sw-lap') as HTMLButtonElement | null;
    const btnReset = document.getElementById('btn-sw-reset') as HTMLButtonElement | null;

    if (btnLap) btnLap.disabled = status === 'idle';
    if (btnReset) btnReset.disabled = status === 'idle' && snap.totalElapsedMs === 0;

    this.updateStopwatchDigital(snap);
    this.updateStopwatchAnalogHands(snap.dialAngles);
    this.updatePaceBadge(snap);
  }

  private updateStopwatchDigital(snap: ReturnType<StopwatchEngine['getSnapshot']>): void {
    const mainEl = document.getElementById('sw-digital-main');
    const fracEl = document.getElementById('sw-digital-fraction');
    const lapEl = document.getElementById('sw-current-lap-time');

    if (mainEl && fracEl) {
      const h = snap.formattedTotal.hours;
      const m = snap.formattedTotal.minutes;
      const s = snap.formattedTotal.seconds;
      mainEl.textContent = h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;

      fracEl.textContent = this.prefs.showMilliseconds
        ? `.${snap.formattedTotal.milliseconds}`
        : `.${snap.formattedTotal.centiseconds}`;
    }

    if (lapEl) {
      lapEl.textContent = this.prefs.showMilliseconds
        ? snap.formattedCurrentLap.fullWithMs
        : snap.formattedCurrentLap.compact;
    }
  }

  private updateStopwatchAnalogHands(angles: ReturnType<typeof computeAnalogAngles>): void {
    const secHand = document.getElementById('analog-second-hand');
    const minHand = document.getElementById('analog-minute-hand');
    const lapHand = document.getElementById('analog-lap-hand');

    if (secHand) secHand.setAttribute('transform', `rotate(${angles.secondDeg.toFixed(2)} 160 160)`);
    if (minHand) minHand.setAttribute('transform', `rotate(${angles.minuteDeg.toFixed(2)} 160 108)`);
    if (lapHand) lapHand.setAttribute('transform', `rotate(${angles.lapSecondDeg.toFixed(2)} 160 160)`);
  }

  private resetDialAngles(): void {
    const secHand = document.getElementById('analog-second-hand');
    const minHand = document.getElementById('analog-minute-hand');
    const lapHand = document.getElementById('analog-lap-hand');

    if (secHand) secHand.setAttribute('transform', 'rotate(0 160 160)');
    if (minHand) minHand.setAttribute('transform', 'rotate(0 160 108)');
    if (lapHand) lapHand.setAttribute('transform', 'rotate(0 160 160)');
  }

  private updatePaceBadge(snap: ReturnType<StopwatchEngine['getSnapshot']>): void {
    const badge = document.getElementById('pace-delta-badge');
    if (!badge) return;

    if (snap.targetPaceMs === null || snap.paceDeltaMs === null) {
      badge.textContent = 'Pace: Off';
      badge.className =
        'px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-black/[0.06] dark:border-white/[0.08]';
      return;
    }

    const deltaSec = snap.paceDeltaMs / 1000;
    if (deltaSec <= 0) {
      const val = Math.abs(deltaSec).toFixed(1);
      badge.textContent = `-${val}s (Ahead)`;
      badge.className =
        'px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30';
    } else {
      const val = deltaSec.toFixed(1);
      badge.textContent = `+${val}s (Behind)`;
      badge.className =
        'px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30';
    }
  }

  private renderStopwatchStatic(): void {
    this.updateStopwatchUi();
    this.renderLapsTable();
    this.renderTelemetryHud();
  }

  private renderLapsTable(): void {
    const tbody = document.getElementById('sw-laps-tbody');
    const emptyState = document.getElementById('sw-laps-empty');
    const countBadge = document.getElementById('sw-lap-count-badge');
    const snap = this.swEngine.getSnapshot();

    if (!tbody) return;

    if (snap.laps.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (countBadge) countBadge.textContent = '0 Laps';
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (countBadge) countBadge.textContent = `${snap.laps.length} Lap${snap.laps.length === 1 ? '' : 's'}`;

    // Render newest lap on top
    const reversed = [...snap.laps].reverse();
    const rows = reversed.map((lap) => {
      const lapTimeStr = formatDuration(lap.lapDurationMs).compact;
      const splitTimeStr = formatDuration(lap.totalSplitMs).compact;

      let badgeHtml = '';
      if (lap.status === 'fastest') {
        badgeHtml = '<span class="ml-1.5 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">⚡ Fastest</span>';
      } else if (lap.status === 'slowest') {
        badgeHtml = '<span class="ml-1.5 px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-700 dark:text-rose-400 text-[10px] font-bold">🐢 Slowest</span>';
      }

      const deltaSec = (lap.deltaFromAvgMs / 1000).toFixed(2);
      const deltaPrefix = lap.deltaFromAvgMs > 0 ? `+${deltaSec}s` : `${deltaSec}s`;
      const deltaColor = lap.deltaFromAvgMs > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400';

      return `
        <tr class="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
          <td class="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
            Lap ${lap.lapNumber} ${badgeHtml}
          </td>
          <td class="py-2 px-3 text-slate-900 dark:text-slate-100 font-semibold">${lapTimeStr}</td>
          <td class="py-2 px-3 text-slate-500 dark:text-slate-400">${splitTimeStr}</td>
          <td class="py-2 px-3 ${deltaColor} font-bold">${deltaPrefix}</td>
        </tr>
      `;
    });

    tbody.innerHTML = rows.join('');
  }

  private renderTelemetryHud(): void {
    const snap = this.swEngine.getSnapshot();
    const stats = snap.stats;

    const bestEl = document.getElementById('stat-best-lap');
    const worstEl = document.getElementById('stat-worst-lap');
    const avgEl = document.getElementById('stat-avg-lap');
    const consEl = document.getElementById('stat-consistency');
    const stdEl = document.getElementById('stat-stddev');

    if (bestEl) bestEl.textContent = stats.bestLapMs !== null ? formatDuration(stats.bestLapMs).compact : '--:--.--';
    if (worstEl) worstEl.textContent = stats.worstLapMs !== null ? formatDuration(stats.worstLapMs).compact : '--:--.--';
    if (avgEl) avgEl.textContent = stats.averageLapMs !== null ? formatDuration(stats.averageLapMs).compact : '--:--.--';
    if (consEl) consEl.textContent = stats.consistencyScore !== null ? `${stats.consistencyScore}%` : '--%';
    if (stdEl) {
      stdEl.textContent = stats.stdDevMs !== null ? `σ ±${(stats.stdDevMs / 1000).toFixed(2)}s` : 'σ ±0.0s';
    }
  }

  private copyLapsToClipboard(): void {
    const snap = this.swEngine.getSnapshot();
    if (snap.laps.length === 0) return;

    const lines = snap.laps.map(
      (l) => `Lap ${l.lapNumber}: ${formatDuration(l.lapDurationMs).compact} | Split: ${formatDuration(l.totalSplitMs).compact}`
    );
    const text = lines.join('\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('btn-copy-laps');
        if (btn) {
          const original = btn.innerHTML;
          btn.innerHTML = '<span>✓ Copied!</span>';
          setTimeout(() => {
            btn.innerHTML = original;
          }, 1500);
        }
      });
    }
  }

  private exportLapsCsv(): void {
    const snap = this.swEngine.getSnapshot();
    if (snap.laps.length === 0) return;

    let csv = 'Lap,Lap Time (ms),Total Split (ms),Delta vs Avg (ms),Status\n';
    for (const lap of snap.laps) {
      csv += `${lap.lapNumber},${lap.lapDurationMs},${lap.totalSplitMs},${lap.deltaFromAvgMs},${lap.status}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tinykite-stopwatch-laps-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private saveCurrentSession(): void {
    const snap = this.swEngine.getSnapshot();
    if (snap.totalElapsedMs === 0) return;

    const titleInput = document.getElementById('input-session-title') as HTMLInputElement | null;
    const title = titleInput?.value.trim() || `Stopwatch Run ${new Date().toLocaleDateString()}`;

    const session = this.swEngine.createSavedSession(title);
    this.storage.saveSession(session);
    if (titleInput) titleInput.value = '';
    const details = document.getElementById('sw-saved-sessions-panel') as HTMLDetailsElement | null;
    if (details && details.tagName.toLowerCase() === 'details') {
      details.open = true;
    }
    this.renderSavedSessionsList();
  }

  private renderSavedSessionsList(): void {
    const container = document.getElementById('sw-sessions-list');
    if (!container) return;

    const sessions = this.storage.getSessions();
    if (sessions.length === 0) {
      container.innerHTML = `
        <div class="p-4 rounded-xl text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/40 border border-black/[0.04] dark:border-white/[0.06]">
          No saved sessions yet. Record a run and click "Save Current" above.
        </div>
      `;
      return;
    }

    const cards = sessions.map((s) => {
      const dateStr = new Date(s.createdAtIso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      const durStr = formatDuration(s.totalElapsedMs).compact;

      return `
        <div class="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-bold text-slate-800 dark:text-slate-100">${s.title}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              ${dateStr} · <span class="font-mono font-semibold">${durStr}</span> · ${s.laps.length} laps
              ${s.stats.consistencyScore !== null ? `· ${s.stats.consistencyScore}% consistency` : ''}
            </div>
          </div>
          <button
            type="button"
            class="btn-delete-session text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold p-1"
            data-session-id="${s.id}"
            title="Delete session"
          >
            ✕ Delete
          </button>
        </div>
      `;
    });

    container.innerHTML = cards.join('');

    container.querySelectorAll<HTMLButtonElement>('.btn-delete-session').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-session-id');
        if (id) {
          this.storage.deleteSession(id);
          this.renderSavedSessionsList();
        }
      });
    });
  }

  // --- TIMER CONTROLLER ---

  private bindTimer(): void {
    // Start / Pause Hero Timer
    const btnStart = document.getElementById('btn-timer-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        const timer = this.timerEngine.getTimer('hero');
        if (!timer) return;

        if (timer.status === 'running') {
          this.timerEngine.pauseTimer('hero');
          this.updateTimerStartButton(false);
        } else {
          this.timerEngine.startTimer('hero');
          this.updateTimerStartButton(true);
          const banner = document.getElementById('timer-completed-banner');
          if (banner) banner.classList.add('hidden');
        }
        this.renderTimerHero();
      });
    }

    // Reset Hero Timer
    const btnReset = document.getElementById('btn-timer-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.timerEngine.resetTimer('hero');
        this.updateTimerStartButton(false);
        const banner = document.getElementById('timer-completed-banner');
        if (banner) banner.classList.add('hidden');
        this.renderTimerHero();
      });
    }

    // Quick Time Boost (+1m, +5m)
    const btnPlus1 = document.getElementById('btn-timer-plus-1m');
    if (btnPlus1) {
      btnPlus1.addEventListener('click', () => {
        this.timerEngine.addTime('hero', 60_000);
        this.renderTimerHero();
      });
    }

    const btnPlus5 = document.getElementById('btn-timer-plus-5m');
    if (btnPlus5) {
      btnPlus5.addEventListener('click', () => {
        this.timerEngine.addTime('hero', 300_000);
        this.renderTimerHero();
      });
    }

    // Completion Banner actions
    const btnRepeat = document.getElementById('btn-timer-repeat');
    if (btnRepeat) {
      btnRepeat.addEventListener('click', () => {
        this.timerEngine.resetTimer('hero');
        this.timerEngine.startTimer('hero');
        this.updateTimerStartButton(true);
        const banner = document.getElementById('timer-completed-banner');
        if (banner) banner.classList.add('hidden');
        this.renderTimerHero();
      });
    }

    const btnDismiss = document.getElementById('btn-timer-dismiss');
    if (btnDismiss) {
      btnDismiss.addEventListener('click', () => {
        const banner = document.getElementById('timer-completed-banner');
        if (banner) banner.classList.add('hidden');
      });
    }

    // Kid & Study Preset Buttons
    const presetBtns = document.querySelectorAll<HTMLButtonElement>('.btn-timer-preset');
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const durStr = btn.getAttribute('data-duration-ms');
        const label = btn.getAttribute('data-label') || 'Timer';
        const dur = durStr ? parseInt(durStr, 10) : 60_000;

        this.timerEngine.removeTimer('hero');
        this.timerEngine.addTimer('hero', label, dur);
        this.updateTimerStartButton(false);
        const banner = document.getElementById('timer-completed-banner');
        if (banner) banner.classList.add('hidden');
        this.renderTimerHero();
      });
    });

    // Custom Duration: Set Hero Timer
    const btnSetHero = document.getElementById('btn-set-hero-timer');
    if (btnSetHero) {
      btnSetHero.addEventListener('click', () => {
        const hInput = document.getElementById('timer-input-hours') as HTMLInputElement | null;
        const mInput = document.getElementById('timer-input-minutes') as HTMLInputElement | null;
        const sInput = document.getElementById('timer-input-seconds') as HTMLInputElement | null;
        const lblInput = document.getElementById('timer-input-label') as HTMLInputElement | null;

        const h = hInput ? parseInt(hInput.value, 10) || 0 : 0;
        const m = mInput ? parseInt(mInput.value, 10) || 0 : 0;
        const s = sInput ? parseInt(sInput.value, 10) || 0 : 0;
        const label = lblInput?.value.trim() || 'Custom Timer';

        const ms = parseHmsToMs(h, m, s);
        if (ms <= 0) return;

        this.timerEngine.removeTimer('hero');
        this.timerEngine.addTimer('hero', label, ms);
        this.updateTimerStartButton(false);
        const banner = document.getElementById('timer-completed-banner');
        if (banner) banner.classList.add('hidden');
        this.renderTimerHero();
      });
    }

    // Custom Duration: Add Parallel Multi-Timer
    const btnAddMulti = document.getElementById('btn-add-multi-timer');
    if (btnAddMulti) {
      btnAddMulti.addEventListener('click', () => {
        const hInput = document.getElementById('timer-input-hours') as HTMLInputElement | null;
        const mInput = document.getElementById('timer-input-minutes') as HTMLInputElement | null;
        const sInput = document.getElementById('timer-input-seconds') as HTMLInputElement | null;
        const lblInput = document.getElementById('timer-input-label') as HTMLInputElement | null;

        const h = hInput ? parseInt(hInput.value, 10) || 0 : 0;
        const m = mInput ? parseInt(mInput.value, 10) || 0 : 0;
        const s = sInput ? parseInt(sInput.value, 10) || 0 : 0;
        const label = lblInput?.value.trim() || 'Parallel Timer';

        const ms = parseHmsToMs(h, m, s);
        if (ms <= 0) return;

        const id = `multi_${Date.now()}`;
        this.timerEngine.addTimer(id, label, ms);
        this.renderMultiTimers();
      });
    }

    // Sound Preview Chime Test
    const btnTestSound = document.getElementById('btn-test-timer-sound');
    if (btnTestSound) {
      btnTestSound.addEventListener('click', () => {
        const soundSelect = document.getElementById('select-timer-sound') as HTMLSelectElement | null;
        const soundId = (soundSelect?.value as SoundProfileId) || 'crystal-chime';
        this.soundEngine.playTimerChime(soundId);
      });
    }

    const soundSelect = document.getElementById('select-timer-sound') as HTMLSelectElement | null;
    if (soundSelect) {
      soundSelect.addEventListener('change', () => {
        this.prefs.activeSoundProfile = soundSelect.value as SoundProfileId;
        this.storage.savePreferences({ activeSoundProfile: this.prefs.activeSoundProfile });
      });
    }
  }

  private updateTimerStartButton(isRunning: boolean): void {
    const btnStart = document.getElementById('btn-timer-start');
    const startIcon = document.getElementById('timer-start-icon');
    const startLabel = document.getElementById('timer-start-label');

    if (btnStart && startIcon && startLabel) {
      if (isRunning) {
        startIcon.textContent = '⏸';
        startLabel.textContent = 'Pause';
        btnStart.className =
          'refraction-btn min-h-[50px] rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all active:scale-95';
      } else {
        startIcon.textContent = '▶';
        startLabel.textContent = 'Start Timer';
        btnStart.className =
          'refraction-btn min-h-[50px] rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all active:scale-95';
      }
    }
  }

  private renderTimerHero(): void {
    const snap = this.timerEngine.getSnapshot('hero', this.prefs.use24Hour);
    if (!snap) return;

    // Center display
    const labelEl = document.getElementById('timer-hero-label');
    const dispEl = document.getElementById('timer-digital-display');
    const endEl = document.getElementById('timer-end-time-pill');
    const ringEl = document.getElementById('timer-progress-ring');

    if (labelEl) labelEl.textContent = snap.label;

    if (dispEl) {
      const totalSec = Math.ceil(snap.remainingMs / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      if (h > 0) {
        dispEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      } else {
        dispEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    }

    if (endEl) {
      endEl.textContent = snap.endTimeFormatted ? `🔔 Ends at ${snap.endTimeFormatted}` : '🔔 Ends at --:--';
    }

    // Circular Progress Ring (Circumference ~753.98)
    if (ringEl) {
      const circ = 753.98;
      const offset = circ * (1 - snap.progressFraction);
      ringEl.setAttribute('stroke-dashoffset', offset.toFixed(2));
    }
  }

  private renderMultiTimers(): void {
    const container = document.getElementById('multi-timers-list');
    if (!container) return;

    const allTimers = this.timerEngine.getAllSnapshots(this.prefs.use24Hour).filter((t) => t.id !== 'hero');

    if (allTimers.length === 0) {
      container.innerHTML = `
        <div class="p-3 text-center text-xs text-slate-400 dark:text-slate-500">
          No parallel timers active. Add one using the custom duration tool above.
        </div>
      `;
      return;
    }

    const items = allTimers.map((t) => {
      const totalSec = Math.ceil(t.remainingMs / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      const isRunning = t.status === 'running';

      return `
        <div class="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-black/[0.08] dark:border-white/[0.1] space-y-2">
          <div class="flex items-center justify-between">
            <div class="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">${t.label}</div>
            <div class="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">${timeStr}</div>
          </div>
          <!-- Progress bar -->
          <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div class="h-full bg-amber-500 transition-all duration-300" style="width: ${(t.progressFraction * 100).toFixed(1)}%;"></div>
          </div>
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="btn-multi-toggle refraction-btn px-2.5 py-0.5 text-[11px] font-bold rounded-lg ${isRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}"
                data-id="${t.id}"
              >
                ${isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                type="button"
                class="btn-multi-reset refraction-btn px-2 py-0.5 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                data-id="${t.id}"
              >
                ↺
              </button>
            </div>
            <button
              type="button"
              class="btn-multi-remove text-xs text-rose-500 hover:text-rose-600 p-0.5"
              data-id="${t.id}"
              title="Remove timer"
            >
              ✕
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = items.join('');

    container.querySelectorAll<HTMLButtonElement>('.btn-multi-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          this.timerEngine.toggleTimer(id);
          this.renderMultiTimers();
        }
      });
    });

    container.querySelectorAll<HTMLButtonElement>('.btn-multi-reset').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          this.timerEngine.resetTimer(id);
          this.renderMultiTimers();
        }
      });
    });

    container.querySelectorAll<HTMLButtonElement>('.btn-multi-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          this.timerEngine.removeTimer(id);
          this.renderMultiTimers();
        }
      });
    });
  }

  // --- ALARM CONTROLLER ---

  private bindAlarm(): void {
    // Time picker sync
    const hourInput = document.getElementById('alarm-input-hour') as HTMLInputElement | null;
    const minInput = document.getElementById('alarm-input-minute') as HTMLInputElement | null;
    const timePicker = document.getElementById('alarm-input-time') as HTMLInputElement | null;

    if (timePicker && hourInput && minInput) {
      timePicker.addEventListener('input', () => {
        const parts = timePicker.value.split(':');
        if (parts.length === 2) {
          const h = parseInt(parts[0] ?? '0', 10);
          const m = parseInt(parts[1] ?? '0', 10);
          hourInput.value = String(h);
          minInput.value = String(m);
        }
      });

      const syncPicker = (): void => {
        const h = String(parseInt(hourInput.value || '0', 10)).padStart(2, '0');
        const m = String(parseInt(minInput.value || '0', 10)).padStart(2, '0');
        timePicker.value = `${h}:${m}`;
      };

      hourInput.addEventListener('input', syncPicker);
      minInput.addEventListener('input', syncPicker);
    }

    // Label preset chips
    const chips = document.querySelectorAll<HTMLButtonElement>('.alarm-label-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const label = chip.getAttribute('data-label');
        const lblInput = document.getElementById('alarm-input-label') as HTMLInputElement | null;
        if (label && lblInput) {
          lblInput.value = label;
        }
      });
    });

    // Repeat Day Toggle Buttons
    const dayBtns = document.querySelectorAll<HTMLButtonElement>('.alarm-day-btn');
    dayBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        if (btn.classList.contains('active')) {
          btn.classList.add('bg-amber-500', 'text-slate-950', 'border-amber-500');
          btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
        } else {
          btn.classList.remove('bg-amber-500', 'text-slate-950', 'border-amber-500');
          btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
        }
      });
    });

    // Day Presets (Weekdays, Everyday, Once)
    const btnWeekdays = document.getElementById('btn-days-weekdays');
    if (btnWeekdays) {
      btnWeekdays.addEventListener('click', () => {
        dayBtns.forEach((b) => {
          const day = parseInt(b.getAttribute('data-day') || '-1', 10);
          const isWk = day >= 1 && day <= 5;
          this.setDayBtnActive(b, isWk);
        });
      });
    }

    const btnEveryday = document.getElementById('btn-days-everyday');
    if (btnEveryday) {
      btnEveryday.addEventListener('click', () => {
        dayBtns.forEach((b) => {
          this.setDayBtnActive(b, true);
        });
      });
    }

    const btnOnce = document.getElementById('btn-days-once');
    if (btnOnce) {
      btnOnce.addEventListener('click', () => {
        dayBtns.forEach((b) => {
          this.setDayBtnActive(b, false);
        });
      });
    }

    // Create Alarm Button
    const btnCreate = document.getElementById('btn-create-alarm');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        this.createAlarmFromForm();
      });
    }

    // Ringing Modal Actions
    const btnSnooze = document.getElementById('btn-alarm-snooze');
    if (btnSnooze) {
      btnSnooze.addEventListener('click', () => {
        if (this.ringingAlarm) {
          const snoozed = snoozeAlarm(this.ringingAlarm);
          this.storage.saveAlarm(snoozed);
          this.closeRingingModal();
          this.renderAlarmsList();
        }
      });
    }

    const btnDismiss = document.getElementById('btn-alarm-dismiss');
    if (btnDismiss) {
      btnDismiss.addEventListener('click', () => {
        if (this.ringingAlarm) {
          const dismissed = dismissAlarm(this.ringingAlarm);
          this.storage.saveAlarm(dismissed);
          this.closeRingingModal();
          this.renderAlarmsList();
        }
      });
    }
  }

  private setDayBtnActive(btn: HTMLButtonElement, active: boolean): void {
    if (active) {
      btn.classList.add('active', 'bg-amber-500', 'text-slate-950', 'border-amber-500');
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
    } else {
      btn.classList.remove('active', 'bg-amber-500', 'text-slate-950', 'border-amber-500');
      btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
    }
  }

  private createAlarmFromForm(): void {
    const hInput = document.getElementById('alarm-input-hour') as HTMLInputElement | null;
    const mInput = document.getElementById('alarm-input-minute') as HTMLInputElement | null;
    const lblInput = document.getElementById('alarm-input-label') as HTMLInputElement | null;
    const soundSelect = document.getElementById('alarm-select-sound') as HTMLSelectElement | null;
    const snoozeSelect = document.getElementById('alarm-select-snooze') as HTMLSelectElement | null;

    const hour = hInput ? parseInt(hInput.value, 10) || 0 : 7;
    const minute = mInput ? parseInt(mInput.value, 10) || 0 : 30;
    const label = lblInput?.value.trim() || 'Alarm';
    const sound = (soundSelect?.value as SoundProfileId) || 'crystal-chime';
    const snooze = snoozeSelect ? parseInt(snoozeSelect.value, 10) || 5 : 5;

    const repeatDays: DayOfWeek[] = [];
    document.querySelectorAll<HTMLButtonElement>('.alarm-day-btn.active').forEach((btn) => {
      const d = parseInt(btn.getAttribute('data-day') || '-1', 10);
      if (d >= 0 && d <= 6) {
        repeatDays.push(d as DayOfWeek);
      }
    });

    const newAlarm = createAlarm({
      id: `alarm_${Date.now()}`,
      hour24: hour,
      minute,
      label,
      enabled: true,
      repeatDays,
      soundProfile: sound,
      snoozeMinutes: snooze,
    });

    this.storage.saveAlarm(newAlarm);
    this.renderAlarmsList();
  }

  private renderAlarmsList(): void {
    const container = document.getElementById('alarms-list-container');
    const badge = document.getElementById('alarms-count-badge');
    const tabActiveBadge = document.getElementById('alarm-active-badge');
    if (!container) return;

    const alarms = this.storage.getAlarms();
    const enabledCount = alarms.filter((a) => a.enabled).length;

    if (badge) badge.textContent = `${alarms.length} configured`;

    if (tabActiveBadge) {
      if (enabledCount > 0) {
        tabActiveBadge.textContent = String(enabledCount);
        tabActiveBadge.classList.remove('hidden');
      } else {
        tabActiveBadge.classList.add('hidden');
      }
    }

    if (alarms.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
          No alarms created yet. Add one using the form on the left.
        </div>
      `;
      return;
    }

    const now = new Date();
    this.updateAlarmBanner(alarms, now);

    const items = alarms.map((alarm) => {
      const { timeText, period } = formatAlarmTime(alarm.hour24, alarm.minute, this.prefs.use24Hour);
      const repeatLabel = formatRepeatDaysLabel(alarm.repeatDays);
      const msUntil = getNextAlarmMsFromNow(alarm, now);
      const countdownStr = msUntil !== null ? formatCountdownUntilAlarm(msUntil) : 'Disabled';

      return `
        <div class="p-4 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-between gap-3 ${!alarm.enabled ? 'opacity-60' : ''}">
          <div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-mono font-black tabular-nums text-slate-900 dark:text-slate-50">${timeText}</span>
              ${period ? `<span class="text-xs font-bold text-slate-500">${period}</span>` : ''}
              <span class="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">${alarm.label}</span>
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">${repeatLabel}</span>
              <span class="font-mono text-amber-600 dark:text-brand-gold">${countdownStr}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Toggle Switch -->
            <button
              type="button"
              class="btn-toggle-alarm px-3 py-1 text-xs font-bold rounded-lg transition-all ${alarm.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}"
              data-alarm-id="${alarm.id}"
            >
              ${alarm.enabled ? 'ON' : 'OFF'}
            </button>
            <!-- Delete Button -->
            <button
              type="button"
              class="btn-delete-alarm text-xs text-rose-500 hover:text-rose-600 p-1"
              data-alarm-id="${alarm.id}"
              title="Delete alarm"
            >
              ✕
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = items.join('');

    container.querySelectorAll<HTMLButtonElement>('.btn-toggle-alarm').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-alarm-id');
        if (id) {
          const alarm = alarms.find((a) => a.id === id);
          if (alarm) {
            const toggled = toggleAlarm(alarm);
            this.storage.saveAlarm(toggled);
            this.renderAlarmsList();
          }
        }
      });
    });

    container.querySelectorAll<HTMLButtonElement>('.btn-delete-alarm').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-alarm-id');
        if (id) {
          this.storage.deleteAlarm(id);
          this.renderAlarmsList();
        }
      });
    });
  }

  private updateAlarmBanner(alarms: readonly AlarmItem[], now: Date): void {
    const titleEl = document.getElementById('alarm-next-title');
    const subEl = document.getElementById('alarm-next-subtitle');
    const pill = document.getElementById('alarm-next-status-pill');

    if (!titleEl || !subEl || !pill) return;

    let earliestAlarm: AlarmItem | null = null;
    let minMs: number = Number.POSITIVE_INFINITY;

    for (const alarm of alarms) {
      if (alarm.enabled) {
        const ms = getNextAlarmMsFromNow(alarm, now);
        if (ms !== null && ms < minMs) {
          minMs = ms;
          earliestAlarm = alarm;
        }
      }
    }

    if (earliestAlarm && Number.isFinite(minMs)) {
      const countdown = formatCountdownUntilAlarm(minMs);
      const { timeText, period } = formatAlarmTime(earliestAlarm.hour24, earliestAlarm.minute, this.prefs.use24Hour);
      titleEl.textContent = `⏰ Next alarm: ${earliestAlarm.label} (${timeText} ${period}) ${countdown}`;
      subEl.textContent = `Repeats: ${formatRepeatDaysLabel(earliestAlarm.repeatDays)}`;
      pill.textContent = 'Active';
      pill.className = 'px-2.5 py-1 text-xs font-mono font-bold rounded-full bg-amber-500/15 text-amber-800 dark:text-brand-gold border border-amber-500/30';
    } else {
      titleEl.textContent = 'No active alarms scheduled';
      subEl.textContent = 'Enable an alarm below to receive sound chimes';
      pill.textContent = 'Idle';
      pill.className = 'px-2.5 py-1 text-xs font-mono font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-black/[0.06] dark:border-white/[0.08]';
    }
  }

  private triggerAlarm(alarm: AlarmItem): void {
    this.ringingAlarm = alarm;
    this.soundEngine.playAlarmPulse(alarm.soundProfile);

    const modal = document.getElementById('alarm-ringing-modal');
    const lbl = document.getElementById('ringing-alarm-label');
    const time = document.getElementById('ringing-alarm-time');

    if (lbl) lbl.textContent = alarm.label;
    if (time) {
      const { timeText, period } = formatAlarmTime(alarm.hour24, alarm.minute, this.prefs.use24Hour);
      time.textContent = `${timeText} ${period}`.trim();
    }
    if (modal) modal.classList.remove('hidden');
  }

  private closeRingingModal(): void {
    this.ringingAlarm = null;
    const modal = document.getElementById('alarm-ringing-modal');
    if (modal) modal.classList.add('hidden');
  }

  // --- WORLD CLOCK CONTROLLER ---

  private bindWorldClock(): void {
    const btnAdd = document.getElementById('btn-add-city');
    const citySelect = document.getElementById('select-add-city') as HTMLSelectElement | null;
    const filterInput = document.getElementById('input-filter-cities') as HTMLInputElement | null;

    if (btnAdd && citySelect) {
      btnAdd.addEventListener('click', () => {
        const cityId = citySelect.value;
        if (cityId) {
          const current = this.storage.getPinnedCityIds();
          if (!current.includes(cityId)) {
            this.storage.savePinnedCityIds([...current, cityId]);
            this.renderWorldClock();
          }
        }
      });
    }

    if (filterInput) {
      filterInput.addEventListener('input', () => {
        this.cityFilterQuery = filterInput.value.toLowerCase().trim();
        this.renderWorldClock();
      });
    }
  }

  private renderWorldClock(): void {
    const now = new Date();
    this.renderLocalDeskClock(now);
    this.updateWorldClockSelect();
    this.renderPinnedCitiesGrid(now);
  }

  private renderLocalDeskClock(now: Date): void {
    const tzEl = document.getElementById('local-clock-tz');
    const dateEl = document.getElementById('local-clock-date');
    const digEl = document.getElementById('local-clock-digital');

    const hHand = document.getElementById('local-clock-analog-hour');
    const mHand = document.getElementById('local-clock-analog-minute');
    const sHand = document.getElementById('local-clock-analog-second');

    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tzEl) tzEl.textContent = localTz;

    if (dateEl) {
      dateEl.textContent = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(now);
    }

    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    const minPad = String(minute).padStart(2, '0');
    const secPad = String(second).padStart(2, '0');

    if (digEl) {
      if (this.prefs.use24Hour) {
        digEl.textContent = `${String(hour).padStart(2, '0')}:${minPad}:${secPad}`;
      } else {
        const period = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 === 0 ? 12 : hour % 12;
        digEl.textContent = `${String(h12)}:${minPad}:${secPad} ${period}`;
      }
    }

    // Mini Swiss Clock Hands
    if (hHand) {
      const hDeg = (hour % 12 + minute / 60) * 30;
      hHand.setAttribute('transform', `rotate(${hDeg.toFixed(1)} 50 50)`);
    }
    if (mHand) {
      const mDeg = (minute + second / 60) * 6;
      mHand.setAttribute('transform', `rotate(${mDeg.toFixed(1)} 50 50)`);
    }
    if (sHand) {
      const sDeg = second * 6;
      sHand.setAttribute('transform', `rotate(${sDeg} 50 50)`);
    }
  }

  private updateWorldClockSelect(): void {
    const citySelect = document.getElementById('select-add-city') as HTMLSelectElement | null;
    if (!citySelect) return;

    const pinnedIds = this.storage.getPinnedCityIds();
    const available = WORLD_CITIES.filter((c) => !pinnedIds.includes(c.id));

    if (available.length === 0) {
      citySelect.innerHTML = '<option value="">All cities pinned</option>';
      citySelect.disabled = true;
    } else {
      citySelect.disabled = false;
      citySelect.innerHTML = available
        .map((c) => `<option value="${c.id}">${c.name}, ${c.country}</option>`)
        .join('');
    }
  }

  private renderPinnedCitiesGrid(now: Date): void {
    const grid = document.getElementById('world-clock-grid');
    if (!grid) return;

    const pinnedIds = this.storage.getPinnedCityIds();
    let cities = WORLD_CITIES.filter((c) => pinnedIds.includes(c.id));

    if (this.cityFilterQuery) {
      cities = cities.filter(
        (c) =>
          c.name.toLowerCase().includes(this.cityFilterQuery) ||
          c.country.toLowerCase().includes(this.cityFilterQuery)
      );
    }

    if (cities.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-8 text-center text-xs text-slate-400 dark:text-slate-500 refraction-panel">
          No matching cities pinned. Choose a city above to pin it to your desk.
        </div>
      `;
      return;
    }

    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cards = cities.map((city) => {
      const reading = getWorldClockReading(city, now, localTz, this.prefs.use24Hour);
      return this.buildCityCardHtml(reading);
    });

    grid.innerHTML = cards.join('');

    grid.querySelectorAll<HTMLButtonElement>('.btn-unpin-city').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cityId = btn.getAttribute('data-city-id');
        if (cityId) {
          const updated = this.storage.getPinnedCityIds().filter((id) => id !== cityId);
          this.storage.savePinnedCityIds(updated);
          this.renderWorldClock();
        }
      });
    });
  }

  private updateWorldClockTimes(now: Date): void {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const pinnedIds = this.storage.getPinnedCityIds();
    const cities = WORLD_CITIES.filter((c) => pinnedIds.includes(c.id));

    for (const city of cities) {
      const reading = getWorldClockReading(city, now, localTz, this.prefs.use24Hour);
      const timeEl = document.getElementById(`wc-time-${city.id}`);
      const periodEl = document.getElementById(`wc-period-${city.id}`);

      if (timeEl) timeEl.textContent = reading.formattedTime;
      if (periodEl) periodEl.textContent = reading.period;
    }
  }

  private buildCityCardHtml(reading: WorldClockReading): string {
    const solarIcons: Record<string, { icon: string; label: string }> = {
      day: { icon: '☀️', label: 'Day' },
      night: { icon: '🌙', label: 'Night' },
      dawn: { icon: '🌅', label: 'Dawn' },
      dusk: { icon: '🌇', label: 'Dusk' },
    };
    const solar = solarIcons[reading.solarPhase] ?? { icon: '☀️', label: 'Day' };

    return `
      <div class="refraction-panel p-5 relative group hover:border-amber-500/40 transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between mb-2">
            <div>
              <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">${reading.cityName}</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">${reading.country}</p>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-1">
                <span>${solar.icon}</span>
                <span>${solar.label}</span>
              </span>
              <button
                type="button"
                class="btn-unpin-city text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                data-city-id="${reading.cityId}"
                title="Unpin city"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="my-3 flex items-baseline gap-1.5">
            <span id="wc-time-${reading.cityId}" class="text-3xl font-mono font-black tabular-nums tracking-tight text-slate-900 dark:text-slate-50">
              ${reading.formattedTime}
            </span>
            <span id="wc-period-${reading.cityId}" class="text-xs font-bold text-slate-500 dark:text-slate-400">
              ${reading.period}
            </span>
          </div>
        </div>

        <div class="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
          <span class="text-slate-500 dark:text-slate-400">${reading.formattedDate}</span>
          <span class="font-mono font-bold text-amber-600 dark:text-brand-gold">
            ${reading.relativeDayLabel}, ${reading.offsetHoursLabel}
          </span>
        </div>
      </div>
    `;
  }

  // --- GLOBAL KEYBOARD SHORTCUTS ---

  private bindKeyboardShortcuts(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Ignore keystrokes when typing in text inputs or selects
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.code) {
        case 'Space': {
          e.preventDefault();
          if (this.activeTab === 'stopwatch') {
            this.toggleStopwatch();
          } else if (this.activeTab === 'timer') {
            const btn = document.getElementById('btn-timer-start');
            if (btn) btn.click();
          }
          break;
        }
        case 'KeyL': {
          e.preventDefault();
          if (this.activeTab === 'stopwatch') {
            this.recordStopwatchLap();
          } else if (this.activeTab === 'timer') {
            const btn = document.getElementById('btn-timer-plus-1m');
            if (btn) btn.click();
          }
          break;
        }
        case 'KeyR': {
          e.preventDefault();
          if (this.activeTab === 'stopwatch') {
            this.resetStopwatch();
          } else if (this.activeTab === 'timer') {
            const btn = document.getElementById('btn-timer-reset');
            if (btn) btn.click();
          }
          break;
        }
        case 'Digit1': {
          e.preventDefault();
          this.switchTab('stopwatch');
          break;
        }
        case 'Digit2': {
          e.preventDefault();
          this.switchTab('timer');
          break;
        }
        case 'Digit3': {
          e.preventDefault();
          this.switchTab('alarm');
          break;
        }
        case 'Digit4': {
          e.preventDefault();
          this.switchTab('worldclock');
          break;
        }
        case 'KeyM': {
          e.preventDefault();
          const btn = document.getElementById('btn-sound-toggle');
          if (btn) btn.click();
          break;
        }
        case 'KeyF': {
          e.preventDefault();
          this.toggleFullscreen();
          break;
        }
        case 'Escape': {
          const installModal = document.getElementById('pwa-install-modal');
          if (installModal && !installModal.classList.contains('hidden')) {
            e.preventDefault();
            this.closePwaInstallModal();
          }
          break;
        }
      }
    });
  }

  // --- OFFLINE & SERVICE WORKER SUPPORT ---

  private initServiceWorkerAndOffline(): void {
    if (typeof window === 'undefined') return;

    this.updateOfflineStatus();

    window.addEventListener('online', () => {
      this.updateOfflineStatus();
    });

    window.addEventListener('offline', () => {
      this.updateOfflineStatus();
    });

    if ('serviceWorker' in navigator) {
      // Register '/sw.js' with { scope: '/' } first (controls entire origin on production/root preview),
      // and fall back to relative './sw.js' if root registration fails (e.g. subpath hosting on Pagehub)
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          reg.update().catch(() => {});
          // Unregister stale narrower-scope registrations so /stopwatch/sw.js never shadows root sw.js
          if (navigator.serviceWorker.getRegistrations) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
              for (const r of registrations) {
                if (r.scope !== reg.scope && r.scope.includes('/stopwatch/')) {
                  r.unregister().catch(() => {});
                }
              }
            }).catch(() => {});
          }

          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (installing.state === 'activated') {
                  this.updateOfflineStatus();
                }
              });
            }
          });
          return navigator.serviceWorker.ready;
        })
        .then((readyReg) => {
          this.updateOfflineStatus();
          this.cacheActivePageUrls(readyReg);
        })
        .catch(() => {
          // If root registration fails, fall back to relative './sw.js'
          navigator.serviceWorker
            .register('./sw.js')
            .then((reg) => {
              reg.update().catch(() => {});
              reg.addEventListener('updatefound', () => {
                const installing = reg.installing;
                if (installing) {
                  installing.addEventListener('statechange', () => {
                    if (installing.state === 'activated') {
                      this.updateOfflineStatus();
                    }
                  });
                }
              });
              return navigator.serviceWorker.ready;
            })
            .then((readyReg) => {
              this.updateOfflineStatus();
              this.cacheActivePageUrls(readyReg);
            })
            .catch(() => {});
        });
    }

    // In-app PWA install button handling
    const installBtn = document.getElementById('btn-install-pwa');
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Adopt prompt captured early in <head> if present
    if ((window as any).__deferredPwaPrompt) {
      this.deferredInstallPrompt = (window as any).__deferredPwaPrompt;
    }

    if (isStandalone) {
      if (installBtn) {
        installBtn.classList.add('hidden');
        installBtn.classList.remove('inline-flex');
      }
    } else {
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredInstallPrompt = e;
        (window as any).__deferredPwaPrompt = e;
        if (installBtn) {
          installBtn.classList.remove('hidden');
          installBtn.classList.add('inline-flex');
        }
      });

      if (installBtn) {
        installBtn.addEventListener('click', async () => {
          const promptEvent = this.deferredInstallPrompt || (window as any).__deferredPwaPrompt;
          if (promptEvent && typeof promptEvent.prompt === 'function') {
            promptEvent.prompt();
            try {
              const choiceResult = await promptEvent.userChoice;
              if (choiceResult && choiceResult.outcome === 'accepted') {
                installBtn.classList.add('hidden');
                installBtn.classList.remove('inline-flex');
              }
            } catch {
              // Ignore prompt dismissal errors
            }
            this.deferredInstallPrompt = null;
            (window as any).__deferredPwaPrompt = null;
          } else {
            // No native prompt available -> open accessible install guide modal
            this.openPwaInstallModal();
          }
        });
      }

      window.addEventListener('appinstalled', () => {
        this.deferredInstallPrompt = null;
        (window as any).__deferredPwaPrompt = null;
        this.closePwaInstallModal();
        if (installBtn) {
          installBtn.classList.add('hidden');
          installBtn.classList.remove('inline-flex');
        }
      });

      // Desktop PWA Install modal controls
      const closeModalBtn = document.getElementById('btn-close-install-modal');
      const closeModalFooterBtn = document.getElementById('btn-close-install-modal-footer');
      const modalBackdrop = document.getElementById('pwa-install-modal-backdrop');
      closeModalBtn?.addEventListener('click', () => this.closePwaInstallModal());
      closeModalFooterBtn?.addEventListener('click', () => this.closePwaInstallModal());
      modalBackdrop?.addEventListener('click', () => this.closePwaInstallModal());

      const refreshBtn = document.getElementById('btn-refresh-pwa-cache');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
          refreshBtn.setAttribute('disabled', 'true');
          refreshBtn.textContent = 'Clearing cache & reloading...';
          try {
            if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const r of registrations) {
                await r.unregister();
              }
            }
            if ('caches' in window) {
              const keys = await caches.keys();
              for (const key of keys) {
                await caches.delete(key);
              }
            }
          } catch {
            // Ignore clear errors
          }
          window.location.reload();
        });
      }
    }
  }

  private openPwaInstallModal(): void {
    const modal = document.getElementById('pwa-install-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  }

  private closePwaInstallModal(): void {
    const modal = document.getElementById('pwa-install-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  private updateOfflineStatus(): void {
    const badge = document.getElementById('offline-status-badge');
    const textEl = document.getElementById('offline-status-text');
    const dot = document.getElementById('offline-status-dot');

    if (!textEl) return;

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (!isOnline) {
      textEl.textContent = 'Offline Mode';
      if (dot) {
        dot.className = 'w-2 h-2 rounded-full bg-amber-500 animate-pulse';
      }
      if (badge) {
        badge.className =
          'px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-xs flex items-center gap-1.5 transition-colors';
        badge.title = 'Running in offline mode without internet connection';
      }
    } else {
      textEl.textContent = 'Offline Ready';
      if (dot) {
        dot.className = 'w-2 h-2 rounded-full bg-emerald-500';
      }
      if (badge) {
        badge.className =
          'px-2.5 py-1 text-xs font-semibold rounded-full bg-white/80 dark:bg-slate-900/80 border border-black/[0.08] dark:border-white/[0.12] text-slate-800 dark:text-slate-200 shadow-xs flex items-center gap-1.5 transition-colors';
        badge.title = 'Works 100% offline without internet';
      }
    }
  }

  private cacheActivePageUrls(registration: ServiceWorkerRegistration): void {
    const urlsToCache: string[] = [];

    // Current page URL and pathname
    urlsToCache.push(window.location.href);
    urlsToCache.push(window.location.pathname);

    // Normalize both with and without trailing slash
    if (window.location.pathname.endsWith('/')) {
      urlsToCache.push(window.location.pathname.slice(0, -1));
    } else {
      urlsToCache.push(`${window.location.pathname}/`);
    }

    // All script tags
    document.querySelectorAll<HTMLScriptElement>('script[src]').forEach((s) => {
      if (s.src) urlsToCache.push(s.src);
    });

    // All image tags
    document.querySelectorAll<HTMLImageElement>('img[src]').forEach((img) => {
      if (img.src) urlsToCache.push(img.src);
    });

    // All link stylesheets, icons, manifests
    document.querySelectorAll<HTMLLinkElement>('link[href]').forEach((l) => {
      if (l.href) urlsToCache.push(l.href);
    });

    const uniqueUrls = Array.from(new Set(urlsToCache));

    const postToWorker = (sw: ServiceWorker | null): void => {
      if (sw) {
        sw.postMessage({
          type: 'CACHE_URLS',
          urls: uniqueUrls,
        });
      }
    };

    if (registration.active) {
      postToWorker(registration.active);
    } else if (navigator.serviceWorker.controller) {
      postToWorker(navigator.serviceWorker.controller);
    }

    if (registration.installing) {
      registration.installing.addEventListener('statechange', (e: Event) => {
        const sw = e.target as ServiceWorker | null;
        if (sw && sw.state === 'activated') {
          postToWorker(sw);
        }
      });
    }
  }
}

// Auto-boot controller on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const app = new ChronoAppController();
      app.init();
    });
  } else {
    const app = new ChronoAppController();
    app.init();
  }
}
