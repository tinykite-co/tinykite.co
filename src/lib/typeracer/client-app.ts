/**
 * client-app.ts
 * Unified TypeRacer & Touch Typing Academy Client Application Engine
 *
 * Implements:
 * - Issue #38: Refraction UI integration
 * - Issue #39: Modular architecture replacing monolithic index.astro
 * - Issue #40: Clean literary branding & display names (zero 11+ / Gutenberg leakage)
 * - Issue #41: WCAG 2.1 AA accessible podium email input & live region
 * - Issue #42: WCAG 2.1 AA keyboard activation (Enter/Space) on cards & tabs
 * - Issue #43: WCAG 2.1 AA descriptive ARIA labels & active target states on Virtual Keyboard
 * - Issue #44: WCAG 2.1 AA high contrast text states
 * - Issue #45: Mobile touch targets (44x44px minimum)
 * - Issue #46: Anatomical SVG Hands visualizer with resting home row anchors
 * - Issue #47: Color-coded Virtual Keyboard finger zones (typing.com parity)
 * - Issue #48: Tactile mechanical switch audio effects & persistent sound toggle
 * - Issue #49: Academy gamification persistence (1-3 stars) & career performance tracking
 * - Issue #50: Academy lockout typing, mistake keycap flash, and Prev/Next navigation
 * - Issue #51: Race Arena countdown lockout (controls disabled during countdown)
 * - Issue #52: Dynamic human-like bot pacing curves and micro-pauses
 * - Issue #53: Cross-tab P2P multiplayer relay (BroadcastChannel + LocalStorage)
 */

import { soundEngine } from './sound';
import {
  getCareerStats,
  updateCareerStats,
  getLessonStarRating,
  saveLessonRecord,
  getAllLessonRecords,
  getTotalStars,
  saveStudentEmail,
  getStudentEmail,
  getRaceHistory,
  recordRaceHistory,
  getAcademyHistory,
  recordAcademyHistory,
  clearAllHistory,
  type RaceRecord,
  type AcademyHistoryRecord
} from './storage';
import { getRandomHumanWpm, simulateBotTick } from './pacing';
import { CURRICULUM, type LessonDef } from './curriculum';
import { getFingerForChar, getFingerDescription } from './fingers';
import { PASSAGES, type Passage } from '../../data/typeracer/passages';
import {
  charsMatch,
  matchesWordProgress,
  isWordCompleted,
  alignTypedInput,
  normalizeString
} from './normalize';

// Expose passages cleanly for backward-compatibility & testing
if (typeof window !== 'undefined') {
  (window as any).__TK_PASSAGES__ = PASSAGES;
  (window as any).__11P_PASSAGES__ = PASSAGES;
}

// --- Interfaces ---
interface RacerState {
  id: string;
  name: string;
  avatar: string;
  isPlayer?: boolean;
  isBot?: boolean;
  isPeer?: boolean;
  targetWpm: number;
  progress: number;
  currentWpm: number;
  rank: number | null;
  finishTime: number | null;
}

// --- Screen Reader Accessibility Helpers ---
function announceSrStatus(msg: string): void {
  const el = document.getElementById('academy-sr-status');
  if (el) el.textContent = msg;
}

function announceSrAlert(msg: string): void {
  const el = document.getElementById('academy-sr-alert');
  if (el) el.textContent = msg;
}

function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- DOM Cache ---
let tabBtnArena: HTMLElement | null = null;
let tabBtnLessons: HTMLElement | null = null;
let tabBtnLibrary: HTMLElement | null = null;
let tabArenaView: HTMLElement | null = null;
let tabLessonsView: HTMLElement | null = null;
let tabLibraryView: HTMLElement | null = null;

let btnSoundToggle: HTMLElement | null = null;
let soundToggleIcon: HTMLElement | null = null;
let soundToggleLabel: HTMLElement | null = null;

let passageTitle: HTMLElement | null = null;
let passageDifficulty: HTMLElement | null = null;
let passageAuthor: HTMLElement | null = null;
let raceModeBadge: HTMLElement | null = null;
let btnToggleVocab: HTMLButtonElement | null = null;
let btnNextPassage: HTMLButtonElement | null = null;
let vocabDrawer: HTMLElement | null = null;
let vocabCount: HTMLElement | null = null;

let typingRaceView: HTMLElement | null = null;
let lobbyBar: HTMLElement | null = null;
let lobbyStatusText: HTMLElement | null = null;
let lobbyTimerNum: HTMLElement | null = null;
let lobbyRacersSummary: HTMLElement | null = null;
let btnStartRaceNow: HTMLButtonElement | null = null;
let btnInviteLink: HTMLElement | null = null;
let inviteBtnLabel: HTMLElement | null = null;

let raceCountdownOverlay: HTMLElement | null = null;
let countdownTrafficLights: HTMLElement | null = null;
let countdownStatusText: HTMLElement | null = null;

let hudRank: HTMLElement | null = null;
let hudWpm: HTMLElement | null = null;
let hudAccuracy: HTMLElement | null = null;
let hudTime: HTMLElement | null = null;
let hudProgress: HTMLElement | null = null;
let modeSelect: HTMLSelectElement | null = null;

let passageDisplay: HTMLElement | null = null;
let typingInput: HTMLInputElement | null = null;
let typingErrorTag: HTMLElement | null = null;

let qaFollowupView: HTMLElement | null = null;
let qaUserRankBadge: HTMLElement | null = null;
let qaFinishWpm: HTMLElement | null = null;
let btnSkipQa: HTMLElement | null = null;
let qaDisplayBox: HTMLElement | null = null;
let qaLine1: HTMLElement | null = null;
let qaLine2: HTMLElement | null = null;
let qaInput: HTMLInputElement | null = null;
let qaInstructionLabel: HTMLElement | null = null;
let qaErrorTag: HTMLElement | null = null;
let qaContextReveal: HTMLElement | null = null;
let qaContextNoteText: HTMLElement | null = null;

let racePodiumModal: HTMLElement | null = null;
let podiumRankBadge: HTMLElement | null = null;
let podiumWpmStat: HTMLElement | null = null;
let podiumAccStat: HTMLElement | null = null;
let podiumTimeStat: HTMLElement | null = null;
let btnPodiumRestart: HTMLElement | null = null;
let btnPodiumNextStory: HTMLElement | null = null;
let btnPodiumGotoLessons: HTMLElement | null = null;
let podiumEmailForm: HTMLFormElement | null = null;
let podiumEmailInput: HTMLInputElement | null = null;
let podiumEmailSuccess: HTMLElement | null = null;

let lessonModuleTag: HTMLElement | null = null;
let lessonActiveTitle: HTMLElement | null = null;
let lessonInstructionTip: HTMLElement | null = null;
let btnPrevLesson: HTMLElement | null = null;
let btnNextLesson: HTMLElement | null = null;
let lessonHudAcc: HTMLElement | null = null;
let lessonDrillCard: HTMLElement | null = null;
let lessonDrillInput: HTMLInputElement | null = null;
let lessonTextDisplay: HTMLElement | null = null;
let fingerGuidanceCue: HTMLElement | null = null;
let lessonErrorTag: HTMLElement | null = null;
let lessonErrorMsg: HTMLElement | null = null;
let lessonsCurriculumGrid: HTMLElement | null = null;
let lessonCompleteModal: HTMLElement | null = null;

let libraryDirectSearch: HTMLInputElement | null = null;
let libraryFullGrid: HTMLElement | null = null;

let btnOpenHistory: HTMLElement | null = null;
let btnPodiumHistory: HTMLElement | null = null;
let historyModal: HTMLElement | null = null;
let historyModalBackdrop: HTMLElement | null = null;
let btnCloseHistory: HTMLElement | null = null;
let tabHistoryRaces: HTMLElement | null = null;
let tabHistoryAcademy: HTMLElement | null = null;
let btnClearHistoryData: HTMLElement | null = null;
let historyViewRaces: HTMLElement | null = null;
let historyViewAcademy: HTMLElement | null = null;
let historyRacesList: HTMLElement | null = null;
let historyRacesEmpty: HTMLElement | null = null;
let historyAcademyList: HTMLElement | null = null;
let historyAcademyEmpty: HTMLElement | null = null;
let historyRaceCount: HTMLElement | null = null;
let historyAcademyCount: HTMLElement | null = null;

// --- State Variables ---
function cleanPassageText(text: string): string {
  return text
    .replace(/[—–]/g, ', ')
    .replace(/\s*,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

const passages: Passage[] = PASSAGES.map((p) => ({
  ...p,
  text: cleanPassageText(p.text)
}));
let currentPassageIndex = 0;
let currentPassage: Passage = passages[0];

let words: string[] = [];
let currentWordIndex = 0;
let currentInput = '';
let isRaceActive = false;
let isRaceFinished = false;
let isCountingDown = false;
let raceStartTime = 0;
let raceEndTime = 0;
let totalKeystrokes = 0;
let errorKeystrokes = 0;
let hudTimerInterval: any = null;
let rankCounter = 1;
let followupMode = 'random';
let currentRaceHasQA = true;

const BOT_NAMES = [
  'Pip Gargery', 'Elizabeth Bennet', 'Sherlock Holmes', 'Jane Eyre',
  'Oxford Scholar', 'Classic Cadence', 'Speedy Scrooge', 'Alice Liddell'
];
const BOT_AVATARS = ['🏎️', '🚗', '🚕', '🚙', '🚀', '⚡', '🚴'];

const localRacerId = 'player_' + Math.random().toString(36).substring(2, 9);
const racers: RacerState[] = [
  { id: 'player', name: 'You', avatar: '🏎️', isPlayer: true, targetWpm: 70, progress: 0, currentWpm: 0, rank: null, finishTime: null },
  { id: 'bot-1', name: 'Oxford Scholar', avatar: '🏎️', isBot: true, isPeer: false, targetWpm: 65, progress: 0, currentWpm: 0, rank: null, finishTime: null },
  { id: 'bot-2', name: 'Jane Eyre', avatar: '🚗', isBot: true, isPeer: false, targetWpm: 48, progress: 0, currentWpm: 0, rank: null, finishTime: null },
  { id: 'bot-3', name: 'Shelley Speedster', avatar: '🚕', isBot: true, isPeer: false, targetWpm: 78, progress: 0, currentWpm: 0, rank: null, finishTime: null }
];

// Academy State
let currentLessonIndex = 0;
let lessonTargetText = '';
let lessonTypedIndex = 0;
let lessonKeyErrors = 0;
let lessonTotalKeys = 0;
let lessonStartTime: number | null = null;

// Cross-Tab Multiplayer P2P
let p2pBroadcast: BroadcastChannel | null = null;
let activePeerId: string | null = null;

// Q&A Separate Typing Speed State
let qaStartTime = 0;
let qaFinalWpm: number | null = null;
let hasRecordedCurrentRace = false;

function getRandomStoryFirstPassageIndex(): number {
  const books = Array.from(new Set(passages.map(p => p.bookId || p.id)));
  const randomBook = books[Math.floor(Math.random() * books.length)];
  const idx = passages.findIndex(p => (p.bookId || p.id) === randomBook && (p.partIndex === 1 || !p.partIndex));
  return idx >= 0 ? idx : Math.floor(Math.random() * passages.length);
}

function getNextStoryPassageIndex(): number {
  if (currentPassage.bookId && currentPassage.partIndex && currentPassage.totalParts) {
    if (currentPassage.partIndex < currentPassage.totalParts) {
      const nextPartIdx = passages.findIndex(
        p => p.bookId === currentPassage.bookId && p.partIndex === currentPassage.partIndex! + 1
      );
      if (nextPartIdx >= 0) return nextPartIdx;
    }
  }
  // If story completed, pick a different random story
  const otherBooks = Array.from(new Set(passages.map(p => p.bookId || p.id)))
    .filter(b => b !== currentPassage.bookId);
  const nextBook = otherBooks.length > 0
    ? otherBooks[Math.floor(Math.random() * otherBooks.length)]
    : currentPassage.bookId;
  const idx = passages.findIndex(p => (p.bookId || p.id) === nextBook && (p.partIndex === 1 || !p.partIndex));
  return idx >= 0 ? idx : (currentPassageIndex + 1) % passages.length;
}

// --- Core Initialization ---
export function initClientApp(): void {
  cacheDOMElements();
  bindGlobalEvents();
  initSoundUI();
  initMultiplayerNetworking();
  updateCareerUI();
  loadPassage(getRandomStoryFirstPassageIndex());
  loadLesson(0);
  renderCurriculumGrid();
  renderFullLibrary();
  startLobbyCountdown();
}

function cacheDOMElements(): void {
  tabBtnArena = document.getElementById('tab-btn-arena');
  tabBtnLessons = document.getElementById('tab-btn-lessons');
  tabBtnLibrary = document.getElementById('tab-btn-library');
  tabArenaView = document.getElementById('tab-arena-view');
  tabLessonsView = document.getElementById('tab-lessons-view');
  tabLibraryView = document.getElementById('tab-library-view');

  btnSoundToggle = document.getElementById('btn-sound-toggle');
  soundToggleIcon = document.getElementById('sound-toggle-icon');
  soundToggleLabel = document.getElementById('sound-toggle-label');

  passageTitle = document.getElementById('passage-title');
  passageDifficulty = document.getElementById('passage-difficulty');
  passageAuthor = document.getElementById('passage-author');
  raceModeBadge = document.getElementById('race-mode-badge');
  btnToggleVocab = document.getElementById('btn-toggle-vocab') as HTMLButtonElement;
  btnNextPassage = document.getElementById('btn-next-passage') as HTMLButtonElement;
  vocabDrawer = document.getElementById('vocab-drawer');
  vocabCount = document.getElementById('vocab-count');

  typingRaceView = document.getElementById('typing-race-view');
  lobbyBar = document.getElementById('lobby-bar');
  lobbyStatusText = document.getElementById('lobby-status-text');
  lobbyTimerNum = document.getElementById('lobby-timer-num');
  lobbyRacersSummary = document.getElementById('lobby-racers-summary');
  btnStartRaceNow = document.getElementById('btn-start-race-now') as HTMLButtonElement;
  btnInviteLink = document.getElementById('btn-invite-link');
  inviteBtnLabel = document.getElementById('invite-btn-label');

  raceCountdownOverlay = document.getElementById('race-countdown-overlay');
  countdownTrafficLights = document.getElementById('countdown-traffic-lights');
  countdownStatusText = document.getElementById('countdown-status-text');

  hudRank = document.getElementById('hud-rank');
  hudWpm = document.getElementById('hud-wpm');
  hudAccuracy = document.getElementById('hud-accuracy');
  hudTime = document.getElementById('hud-time');
  hudProgress = document.getElementById('hud-progress');
  modeSelect = document.getElementById('mode-select') as HTMLSelectElement;

  passageDisplay = document.getElementById('passage-display');
  typingInput = document.getElementById('typing-input') as HTMLInputElement;
  typingErrorTag = document.getElementById('typing-error-tag');

  qaFollowupView = document.getElementById('qa-followup-view');
  qaUserRankBadge = document.getElementById('qa-user-rank-badge');
  qaFinishWpm = document.getElementById('qa-finish-wpm');
  btnSkipQa = document.getElementById('btn-skip-qa');
  qaDisplayBox = document.getElementById('qa-display-box');
  qaLine1 = document.getElementById('qa-line-1');
  qaLine2 = document.getElementById('qa-line-2');
  qaInput = document.getElementById('qa-input') as HTMLInputElement;
  qaInstructionLabel = document.getElementById('qa-instruction-label');
  qaErrorTag = document.getElementById('qa-error-tag');
  qaContextReveal = document.getElementById('qa-context-reveal');
  qaContextNoteText = document.getElementById('qa-context-note-text');

  racePodiumModal = document.getElementById('race-podium-modal') || document.getElementById('grand-results-view');
  podiumRankBadge = document.getElementById('podium-rank-badge') || document.getElementById('results-rank-pill');
  podiumWpmStat = document.getElementById('podium-wpm-stat') || document.getElementById('final-wpm');
  podiumAccStat = document.getElementById('podium-acc-stat') || document.getElementById('final-accuracy');
  podiumTimeStat = document.getElementById('podium-time-stat') || document.getElementById('final-time');
  btnPodiumRestart = document.getElementById('btn-podium-restart') || document.getElementById('btn-results-retry');
  btnPodiumNextStory = document.getElementById('btn-podium-next-story') || document.getElementById('btn-results-next');
  btnPodiumGotoLessons = document.getElementById('btn-podium-goto-lessons');
  podiumEmailForm = (document.getElementById('podium-email-form') || document.getElementById('email-capture-form')) as HTMLFormElement;
  podiumEmailInput = (document.getElementById('podium-email-input') || document.getElementById('student-email-input')) as HTMLInputElement;
  podiumEmailSuccess = document.getElementById('podium-email-success') || document.getElementById('email-status-live');

  // History Modal DOM Cache
  btnOpenHistory = document.getElementById('btn-open-history');
  btnPodiumHistory = document.getElementById('btn-podium-history');
  historyModal = document.getElementById('history-modal');
  historyModalBackdrop = document.getElementById('history-modal-backdrop');
  btnCloseHistory = document.getElementById('btn-close-history');
  tabHistoryRaces = document.getElementById('tab-history-races');
  tabHistoryAcademy = document.getElementById('tab-history-academy');
  btnClearHistoryData = document.getElementById('btn-clear-history-data');
  historyViewRaces = document.getElementById('history-view-races');
  historyViewAcademy = document.getElementById('history-view-academy');
  historyRacesList = document.getElementById('history-races-list');
  historyRacesEmpty = document.getElementById('history-races-empty');
  historyAcademyList = document.getElementById('history-academy-list');
  historyAcademyEmpty = document.getElementById('history-academy-empty');
  historyRaceCount = document.getElementById('history-race-count');
  historyAcademyCount = document.getElementById('history-academy-count');

  lessonModuleTag = document.getElementById('lesson-module-tag');
  lessonActiveTitle = document.getElementById('lesson-active-title');
  lessonInstructionTip = document.getElementById('lesson-instruction-tip');
  btnPrevLesson = document.getElementById('btn-prev-lesson');
  btnNextLesson = document.getElementById('btn-next-lesson');
  lessonHudAcc = document.getElementById('lesson-hud-acc');
  lessonDrillCard = document.getElementById('lesson-drill-card');
  lessonDrillInput = document.getElementById('lesson-drill-input') as HTMLInputElement;
  lessonTextDisplay = document.getElementById('lesson-text-display');
  fingerGuidanceCue = document.getElementById('finger-guidance-cue');
  lessonErrorTag = document.getElementById('lesson-error-tag');
  lessonErrorMsg = document.getElementById('lesson-error-msg');
  lessonsCurriculumGrid = document.getElementById('lessons-curriculum-grid');
  lessonCompleteModal = document.getElementById('lesson-complete-modal');

  libraryDirectSearch = document.getElementById('library-direct-search') as HTMLInputElement;
  libraryFullGrid = document.getElementById('library-full-grid');
}

// --- Tabs & Navigation (Issue #42) ---
function switchAppTab(tab: 'arena' | 'lessons' | 'library'): void {
  const isArena = tab === 'arena';
  const isLessons = tab === 'lessons';
  const isLibrary = tab === 'library';

  if (tabBtnArena) {
    tabBtnArena.setAttribute('aria-selected', isArena ? 'true' : 'false');
    tabBtnArena.tabIndex = isArena ? 0 : -1;
    tabBtnArena.className = isArena
      ? 'px-5 py-2.5 rounded-full text-xs font-bold transition-all bg-brand-navy dark:bg-brand-gold text-brand-cream dark:text-brand-navy shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]'
      : 'px-5 py-2.5 rounded-full text-xs font-bold transition-all text-slate-700 dark:text-slate-300 hover:text-brand-navy dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]';
  }

  if (tabBtnLessons) {
    tabBtnLessons.setAttribute('aria-selected', isLessons ? 'true' : 'false');
    tabBtnLessons.tabIndex = isLessons ? 0 : -1;
    tabBtnLessons.className = isLessons
      ? 'px-5 py-2.5 rounded-full text-xs font-bold transition-all bg-brand-navy dark:bg-brand-gold text-brand-cream dark:text-brand-navy shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]'
      : 'px-5 py-2.5 rounded-full text-xs font-bold transition-all text-slate-700 dark:text-slate-300 hover:text-brand-navy dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]';
  }

  if (tabBtnLibrary) {
    tabBtnLibrary.setAttribute('aria-selected', isLibrary ? 'true' : 'false');
    tabBtnLibrary.tabIndex = isLibrary ? 0 : -1;
    tabBtnLibrary.className = isLibrary
      ? 'px-5 py-2.5 rounded-full text-xs font-bold transition-all bg-brand-navy dark:bg-brand-gold text-brand-cream dark:text-brand-navy shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]'
      : 'px-5 py-2.5 rounded-full text-xs font-bold transition-all text-slate-700 dark:text-slate-300 hover:text-brand-navy dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]';
  }

  if (tabArenaView) tabArenaView.classList.toggle('hidden', !isArena);
  if (tabLessonsView) tabLessonsView.classList.toggle('hidden', !isLessons);
  if (tabLibraryView) tabLibraryView.classList.toggle('hidden', !isLibrary);

  if (isLessons) {
    if (lessonDrillInput) {
      setTimeout(() => lessonDrillInput?.focus({ preventScroll: true }), 100);
    }
  } else if (isArena) {
    if (typingInput && !typingInput.disabled) {
      setTimeout(() => typingInput?.focus({ preventScroll: true }), 100);
    }
  }
}

// --- Sound Toggle UI (Issue #48) ---
function initSoundUI(): void {
  updateSoundUI();
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      soundEngine.toggleMute();
      updateSoundUI();
    });
  }
}

function updateSoundUI(): void {
  const muted = soundEngine.isMuted();
  if (soundToggleIcon) soundToggleIcon.textContent = muted ? '🔇' : '🔊';
  if (soundToggleLabel) soundToggleLabel.textContent = muted ? 'Muted' : 'Sound On';
  if (btnSoundToggle) {
    btnSoundToggle.setAttribute('aria-pressed', muted ? 'false' : 'true');
    btnSoundToggle.title = muted ? 'Sound effects are muted (click to unmute)' : 'Sound effects are active (click to mute)';
  }
}

// --- Bot Management (Issue #40 & #52) ---
function randomizeBots(): void {
  for (let i = 1; i <= 3; i++) {
    if (racers[i].isPeer) continue;

    racers[i].targetWpm = getRandomHumanWpm();
    racers[i].progress = 0;
    racers[i].currentWpm = 0;
    racers[i].rank = null;
    racers[i].finishTime = null;
    racers[i].name = BOT_NAMES[(Math.floor(Math.random() * BOT_NAMES.length) + i) % BOT_NAMES.length];
    racers[i].avatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];

    const nameEl = document.getElementById('racer-' + i + '-name');
    const avatarEl = document.getElementById('racer-' + i + '-avatar');
    const badgeEl = document.getElementById('racer-' + i + '-badge');
    const wpmEl = document.getElementById('racer-' + i + '-wpm');
    const medalEl = document.getElementById('racer-' + i + '-medal');
    const racerEl = document.getElementById('racer-' + i);

    if (nameEl) nameEl.textContent = racers[i].name;
    if (avatarEl) avatarEl.textContent = racers[i].avatar;
    if (badgeEl) {
      badgeEl.textContent = 'BOT';
      badgeEl.className = 'text-[8px] font-bold text-cyan-300 bg-cyan-950/80 px-1.5 rounded';
    }
    if (wpmEl) wpmEl.textContent = '0 WPM';
    if (medalEl) medalEl.classList.add('hidden');
    if (racerEl) racerEl.style.left = '0%';
  }
}

// --- Multiplayer P2P Networking (Issue #53) ---
let lobbyHeartbeat: any = null;

function initMultiplayerNetworking(): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      p2pBroadcast = new BroadcastChannel('tk_typeracer_p2p_v2');
      p2pBroadcast.onmessage = (e) => handleP2PPayload(e.data);
    }
  } catch (e) {}

  window.addEventListener('storage', (e) => {
    if (e.key === 'tk_typeracer_p2p_signal' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        handleP2PPayload(data);
      } catch (err) {}
    }
  });

  // Announce presence every 600ms until race starts
  sendP2PMessage({
    type: 'LOBBY_JOIN',
    name: 'Peer Racer',
    avatar: '🏎️',
    passageIndex: currentPassageIndex
  });

  clearInterval(lobbyHeartbeat);
  lobbyHeartbeat = setInterval(() => {
    if (isRaceActive) {
      clearInterval(lobbyHeartbeat);
      return;
    }
    sendP2PMessage({
      type: 'LOBBY_JOIN',
      name: 'Peer Racer',
      avatar: '🏎️',
      passageIndex: currentPassageIndex
    });
  }, 600);
}

function sendP2PMessage(msg: any): void {
  const payload = {
    ...msg,
    senderId: localRacerId,
    from: localRacerId,
    timestamp: Date.now()
  };
  if (p2pBroadcast) {
    try {
      p2pBroadcast.postMessage(payload);
    } catch (e) {}
  }
  try {
    localStorage.setItem('tk_typeracer_p2p_signal', JSON.stringify(payload));
  } catch (e) {}
}

function promoteLaneToPeer(laneIdx: number, name: string, avatar: string): void {
  racers[laneIdx].isBot = false;
  racers[laneIdx].isPeer = true;
  racers[laneIdx].name = name;
  racers[laneIdx].avatar = avatar;

  const nameEl = document.getElementById('racer-' + laneIdx + '-name');
  const avatarEl = document.getElementById('racer-' + laneIdx + '-avatar');
  const badgeEl = document.getElementById('racer-' + laneIdx + '-badge');

  if (nameEl) nameEl.textContent = name;
  if (avatarEl) avatarEl.textContent = avatar;
  if (badgeEl) {
    badgeEl.textContent = 'PEER · LIVE';
    badgeEl.className = 'text-[8px] font-black text-white bg-emerald-600 px-1.5 py-0.5 rounded shadow-sm animate-pulse';
  }
}

function updateLobbyPeerCount(humanCount: number): void {
  const summaryEl = document.getElementById('lobby-racers-summary');
  if (summaryEl) {
    summaryEl.textContent = '• ' + humanCount + ' Live Players (You + Peer) + 2 Bots ready';
    summaryEl.classList.remove('hidden');
  }
  const statusEl = document.getElementById('lobby-status-text');
  if (statusEl) {
    statusEl.innerHTML = '🟢 Peer Joined! Race ready (<span id="lobby-timer-num">Ready</span>)';
  }
}

function updatePeerRacerProgress(laneIdx: number, progress: number, wpm: number, rank?: number | null): void {
  racers[laneIdx].progress = progress;
  racers[laneIdx].currentWpm = wpm;

  const racerEl = document.getElementById('racer-' + laneIdx);
  const wpmEl = document.getElementById('racer-' + laneIdx + '-wpm');
  if (racerEl) racerEl.style.left = Math.min(92, progress * 0.92) + '%';
  if (wpmEl) wpmEl.textContent = wpm + ' WPM';

  if (progress >= 100 && !racers[laneIdx].rank) {
    racers[laneIdx].rank = rank || rankCounter++;
    const medalEl = document.getElementById('racer-' + laneIdx + '-medal');
    if (medalEl) {
      medalEl.classList.remove('hidden');
      medalEl.textContent = racers[laneIdx].rank === 1 ? '🥇' : (racers[laneIdx].rank === 2 ? '🥈' : '🥉');
    }
  }

  updateHudRank();
}

function handleP2PPayload(data: any): void {
  const sender = data?.senderId || data?.from;
  if (!data || sender === localRacerId) return;

  const type = (data.type || '').toUpperCase();

  if (type === 'LOBBY_JOIN' || type === 'HELLO') {
    activePeerId = sender;
    promoteLaneToPeer(1, data.name || 'Peer Racer', data.avatar || '🏎️');

    sendP2PMessage({
      type: 'LOBBY_ACK',
      targetId: sender,
      name: 'Host Player',
      avatar: '🏎️',
      passageIndex: currentPassageIndex
    });

    updateLobbyPeerCount(2);
  } else if (type === 'LOBBY_ACK' || type === 'WELCOME') {
    activePeerId = sender;
    promoteLaneToPeer(1, data.name || 'Peer Racer', data.avatar || '🏎️');
    updateLobbyPeerCount(2);
  } else if (type === 'START_COUNTDOWN' || type === 'START_RACE') {
    if (!isRaceActive && !isCountingDown) {
      startCountdownSequence(false);
    }
  } else if (type === 'PROGRESS') {
    if (!activePeerId) {
      activePeerId = sender;
      promoteLaneToPeer(1, data.name || 'Peer Racer', data.avatar || '🏎️');
    }
    updatePeerRacerProgress(1, data.progress, data.wpm, data.rank);
  } else if (type === 'FINISH') {
    updatePeerRacerProgress(1, 100, data.wpm, data.rank);
  }
}

// --- Matchmaking Lobby Countdown ---
let lobbySeconds = 5;
let lobbyInterval: any = null;

function startLobbyCountdown(): void {
  lobbySeconds = 5;
  if (lobbyTimerNum) lobbyTimerNum.textContent = '5';
  clearInterval(lobbyInterval);

  lobbyInterval = setInterval(() => {
    lobbySeconds--;
    if (lobbyTimerNum) lobbyTimerNum.textContent = lobbySeconds.toString();

    if (lobbySeconds <= 0) {
      clearInterval(lobbyInterval);
      if (!isRaceActive && !isCountingDown) {
        startCountdownSequence();
      }
    }
  }, 1000);
}

// --- Countdown Mechanism & Background Lockout (Issues #48 & #51) ---
function startCountdownSequence(broadcast: boolean = true): void {
  if (isRaceActive || isCountingDown) return;

  if (broadcast) {
    sendP2PMessage({
      type: 'START_COUNTDOWN',
      passageIndex: currentPassageIndex
    });
  }

  isCountingDown = true;
  clearInterval(lobbyInterval);
  if (lobbyBar) lobbyBar.classList.add('opacity-40');

  // Issue #51: Lock out background controls during countdown
  lockoutBackgroundControls(true);

  if (typingInput) {
    typingInput.disabled = true;
    typingInput.value = '';
    typingInput.placeholder = 'Get Ready... Hands on home row (F & J)...';
  }

  if (raceCountdownOverlay) {
    raceCountdownOverlay.classList.remove('hidden');
    raceCountdownOverlay.classList.add('flex');
  }

  // Step 1: READY
  updateCountdownLights('ready');
  soundEngine.playCountdownBeep(false);

  setTimeout(() => {
    // Step 2: SET
    updateCountdownLights('set');
    soundEngine.playCountdownBeep(false);

    setTimeout(() => {
      // Step 3: GO!
      updateCountdownLights('go');
      soundEngine.playCountdownBeep(true);

      setTimeout(() => {
        // Complete & Start Race
        if (raceCountdownOverlay) {
          raceCountdownOverlay.classList.add('hidden');
          raceCountdownOverlay.classList.remove('flex');
        }
        isCountingDown = false;
        startActiveRace();
      }, 700);
    }, 900);
  }, 900);
}

function lockoutBackgroundControls(locked: boolean): void {
  if (btnStartRaceNow) {
    btnStartRaceNow.disabled = locked;
    btnStartRaceNow.classList.toggle('opacity-50', locked);
    btnStartRaceNow.classList.toggle('cursor-not-allowed', locked);
  }
  if (btnNextPassage) {
    btnNextPassage.disabled = locked;
    btnNextPassage.classList.toggle('opacity-50', locked);
    btnNextPassage.classList.toggle('cursor-not-allowed', locked);
  }
  if (btnToggleVocab) {
    btnToggleVocab.disabled = locked;
    btnToggleVocab.classList.toggle('opacity-50', locked);
    btnToggleVocab.classList.toggle('cursor-not-allowed', locked);
  }
}

function updateCountdownLights(phase: 'ready' | 'set' | 'go'): void {
  const lights = countdownTrafficLights?.querySelectorAll('.traffic-bulb');
  if (lights && lights.length === 3) {
    lights.forEach((l) => (l.className = 'traffic-bulb w-5 h-5 rounded-full bg-slate-800 border border-black/30 transition-all'));

    if (phase === 'ready') {
      lights[0].className = 'traffic-bulb w-5 h-5 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.9)] ring-2 ring-rose-400';
      if (countdownStatusText) {
        countdownStatusText.innerHTML = '<span class="text-rose-400 font-black">READY</span> Place fingers on home row keys (F & J)...';
      }
    } else if (phase === 'set') {
      lights[0].className = 'traffic-bulb w-5 h-5 rounded-full bg-rose-500/40';
      lights[1].className = 'traffic-bulb w-5 h-5 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.9)] ring-2 ring-amber-300';
      if (countdownStatusText) {
        countdownStatusText.innerHTML = '<span class="text-amber-400 font-black">SET</span> Eyes on the screen...';
      }
    } else if (phase === 'go') {
      lights[0].className = 'traffic-bulb w-5 h-5 rounded-full bg-rose-500/20';
      lights[1].className = 'traffic-bulb w-5 h-5 rounded-full bg-amber-400/20';
      lights[2].className = 'traffic-bulb w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)] ring-2 ring-emerald-300 scale-110';
      if (countdownStatusText) {
        countdownStatusText.innerHTML = '<span class="text-emerald-400 font-black text-2xl tracking-widest animate-pulse">GO! RACE!</span>';
      }
    }
  }
}

// --- Active Race Execution ---
function startActiveRace(): void {
  isRaceActive = true;
  isRaceFinished = false;
  raceStartTime = Date.now();
  currentWordIndex = 0;
  currentInput = '';
  totalKeystrokes = 0;
  errorKeystrokes = 0;
  rankCounter = 1;

  // Reset player racer
  racers[0].progress = 0;
  racers[0].currentWpm = 0;
  racers[0].rank = null;
  racers[0].finishTime = null;

  const r0 = document.getElementById('racer-0');
  const r0Medal = document.getElementById('racer-0-medal');
  if (r0) r0.style.left = '0%';
  if (r0Medal) r0Medal.classList.add('hidden');

  randomizeBots();

  if (typingInput) {
    typingInput.disabled = false;
    typingInput.value = '';
    typingInput.placeholder = 'Type here! Press Space after each word...';
    try {
      typingInput.focus({ preventScroll: true });
    } catch (e) {}
  }

  sendP2PMessage({ type: 'start_race' });

  renderPassageDisplay();
  startHudTimer();
}

function startHudTimer(): void {
  clearInterval(hudTimerInterval);
  hudTimerInterval = setInterval(() => {
    if (!isRaceActive) return;

    const elapsedMs = Date.now() - raceStartTime;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;

    if (hudTime) hudTime.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;

    // Simulate bots with human-like dynamic pacing (Issue #52)
    for (let i = 1; i <= 3; i++) {
      if (racers[i].isPeer) continue;
      if (racers[i].progress >= 100) continue;

      const passageLength = currentPassage.text.length;
      const targetWpm = racers[i].targetWpm;
      racers[i].progress = simulateBotTick(racers[i].progress, targetWpm, passageLength, 0.1);
      racers[i].currentWpm = Math.round(targetWpm * (0.9 + Math.sin(elapsedSec + i) * 0.1));

      const rEl = document.getElementById('racer-' + i);
      const rWpmEl = document.getElementById('racer-' + i + '-wpm');
      if (rEl) rEl.style.left = Math.min(94, racers[i].progress) + '%';
      if (rWpmEl) rWpmEl.textContent = racers[i].currentWpm + ' WPM';

      if (racers[i].progress >= 100 && !racers[i].rank) {
        racers[i].rank = rankCounter++;
        racers[i].finishTime = Date.now();
        const medalEl = document.getElementById('racer-' + i + '-medal');
        if (medalEl) {
          medalEl.classList.remove('hidden');
          medalEl.textContent = racers[i].rank === 1 ? '🥇' : (racers[i].rank === 2 ? '🥈' : '🥉');
        }
      }
    }

    updateHudRank();
  }, 100);
}

function updateHudRank(): void {
  let playerRank = 1;
  const playerProgress = racers[0].progress;
  for (let i = 1; i <= 3; i++) {
    if (racers[i].progress > playerProgress) playerRank++;
  }

  if (hudRank) {
    const suffix = playerRank === 1 ? 'st' : (playerRank === 2 ? 'nd' : (playerRank === 3 ? 'rd' : 'th'));
    hudRank.textContent = playerRank + suffix + ' / 4';
    hudRank.className = playerRank === 1
      ? 'px-2.5 py-0.5 rounded-lg font-black bg-brand-gold text-slate-950 shadow-sm'
      : 'px-2.5 py-0.5 rounded-lg font-black bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm';
  }
}

// --- Passage Management ---
function loadPassage(index: number): void {
  currentPassageIndex = (index + passages.length) % passages.length;
  currentPassage = passages[currentPassageIndex];
  words = currentPassage.text.split(' ');
  currentWordIndex = 0;

  if (passageTitle) passageTitle.textContent = currentPassage.title;
  if (passageDifficulty) passageDifficulty.textContent = currentPassage.difficulty;
  if (passageAuthor) {
    const partNote = (currentPassage.partIndex && currentPassage.totalParts)
      ? ' • Part ' + currentPassage.partIndex + ' of ' + currentPassage.totalParts
      : '';
    passageAuthor.textContent = 'by ' + currentPassage.author + ' (' + currentPassage.year + ') • ' + currentPassage.chapter + partNote;
  }
  if (vocabCount) vocabCount.textContent = currentPassage.vocabulary.length.toString();

  // Determine Q&A drill availability
  if (followupMode === 'always') currentRaceHasQA = true;
  else if (followupMode === 'sprint') currentRaceHasQA = false;
  else currentRaceHasQA = Math.random() < 0.5;

  if (raceModeBadge) {
    raceModeBadge.textContent = currentRaceHasQA ? '📖 Story Drill (Passage + Q&A)' : '⚡ Speed Sprint (Passage Only)';
  }

  // Update Vocab Drawer
  if (vocabDrawer) {
    const list = vocabDrawer.querySelector('.grid');
    if (list) {
      list.innerHTML = (currentPassage.vocabulary || []).map((v) => (
        '<div class="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-black/[0.05] dark:border-white/[0.08] text-xs">' +
          '<div class="flex items-center gap-2 mb-1">' +
            '<span class="font-bold text-slate-900 dark:text-slate-100 font-serif-literary">' + escapeHtml(v.word) + '</span>' +
          '</div>' +
          '<p class="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">' + escapeHtml(v.definition) + '</p>' +
        '</div>'
      )).join('');
    }
  }

  resetRaceState();
}

function resetRaceState(): void {
  isRaceActive = false;
  isRaceFinished = false;
  isCountingDown = false;
  hasRecordedCurrentRace = false;
  qaFinalWpm = null;
  clearInterval(hudTimerInterval);

  lockoutBackgroundControls(false);

  if (lobbyBar) lobbyBar.classList.remove('opacity-40');
  if (raceCountdownOverlay) {
    raceCountdownOverlay.classList.add('hidden');
    raceCountdownOverlay.classList.remove('flex');
  }

  racers.forEach((r, idx) => {
    r.progress = 0;
    r.currentWpm = 0;
    r.rank = null;
    r.finishTime = null;
    const rEl = document.getElementById('racer-' + idx);
    const rWpmEl = document.getElementById('racer-' + idx + '-wpm');
    const medalEl = document.getElementById('racer-' + idx + '-medal');
    if (rEl) rEl.style.left = '0%';
    if (rWpmEl) rWpmEl.textContent = '0 WPM';
    if (medalEl) medalEl.classList.add('hidden');
  });

  if (hudRank) hudRank.textContent = '1st / 4';
  if (hudWpm) hudWpm.textContent = '0';
  if (hudAccuracy) hudAccuracy.textContent = '100';
  if (hudTime) hudTime.textContent = '0:00';
  if (hudProgress) hudProgress.textContent = '0';

  if (typingRaceView) typingRaceView.classList.remove('hidden');
  if (qaFollowupView) qaFollowupView.classList.add('hidden');
  if (racePodiumModal) racePodiumModal.classList.add('hidden');

  renderPassageDisplay();

  if (typingInput) {
    typingInput.disabled = true;
    typingInput.value = '';
    typingInput.placeholder = 'Click "Start Race Now" or wait for matchmaking...';
  }

  startLobbyCountdown();
}

// --- Passage Display Rendering (Practice Mode: Backspace Required on Error) ---
function renderPassageDisplay(): void {
  if (!passageDisplay) return;

  const targetWord = words[currentWordIndex] || '';
  let currentWordHtml = '';

  let hasError = false;
  const alignedInput = alignTypedInput(targetWord, currentInput);

  for (let i = 0; i < targetWord.length; i++) {
    const char = targetWord[i];
    const typedChar = alignedInput[i];

    if (typedChar === undefined) {
      currentWordHtml += '<span class="tr-char-pending">' + escapeHtml(char) + '</span>';
    } else if (charsMatch(typedChar, char) && !hasError) {
      currentWordHtml += '<span class="tr-char-correct text-emerald-700 dark:text-emerald-400 font-bold">' + escapeHtml(char) + '</span>';
    } else {
      hasError = true;
      currentWordHtml += '<span class="tr-char-error bg-rose-500 text-white rounded px-0.5 font-bold animate-pulse">' + escapeHtml(char) + '</span>';
    }
  }

  if (alignedInput.length > targetWord.length) {
    const extra = alignedInput.slice(targetWord.length);
    currentWordHtml += '<span class="tr-char-error bg-rose-600 text-white rounded px-0.5 font-bold animate-pulse">' + escapeHtml(extra) + '</span>';
    hasError = true;
  }

  if (typingErrorTag) {
    typingErrorTag.classList.toggle('hidden', !hasError);
  }

  let html = '';
  for (let i = 0; i < words.length; i++) {
    if (i < currentWordIndex) {
      html += '<span class="tr-word-completed text-slate-500 dark:text-slate-400">' + escapeHtml(words[i]) + '</span> ';
    } else if (i === currentWordIndex) {
      html += '<span class="tr-word-current underline decoration-amber-500 decoration-2 font-bold">' + currentWordHtml + '</span> ';
    } else {
      html += '<span class="tr-word-upcoming text-slate-700 dark:text-slate-300">' + escapeHtml(words[i]) + '</span> ';
    }
  }

  passageDisplay.innerHTML = html.trim();
}

// --- Typing Input Handlers (Backspace Required on Error) ---
function handleTypingInput(e: Event): void {
  if (!isRaceActive || isRaceFinished) return;

  const val = typingInput?.value || '';
  currentInput = val;
  totalKeystrokes++;

  const targetWord = words[currentWordIndex];
  if (!targetWord) return;

  // Sound feedback (Issue #48)
  soundEngine.playKeyClick();

  // If user hit space at the end of word
  if (val.endsWith(' ')) {
    const trimmed = val.slice(0, -1);
    if (isWordCompleted(targetWord, trimmed)) {
      // Completed word
      soundEngine.playSpaceClick();
      currentWordIndex++;
      currentInput = '';
      if (typingInput) typingInput.value = '';

      if (currentWordIndex >= words.length) {
        finishPassageRace();
        return;
      }
    } else {
      // Mismatch error
      errorKeystrokes++;
      soundEngine.playErrorThud();
    }
  } else {
    // Check if user completed the final word without a trailing space
    if (currentWordIndex === words.length - 1 && isWordCompleted(targetWord, val)) {
      soundEngine.playSpaceClick();
      currentWordIndex++;
      currentInput = '';
      if (typingInput) typingInput.value = '';
      finishPassageRace();
      return;
    }

    // Check for inline error with typographic tolerance (e.g. '-' matching '—')
    if (!matchesWordProgress(targetWord, val)) {
      errorKeystrokes++;
      soundEngine.playErrorThud();
    }
  }

  updatePlayerProgress();
  renderPassageDisplay();
}

function updatePlayerProgress(): void {
  const totalChars = currentPassage.text.length;
  let typedChars = 0;
  for (let i = 0; i < currentWordIndex; i++) {
    typedChars += words[i].length + 1;
  }
  typedChars += Math.min(currentInput.length, (words[currentWordIndex] || '').length);

  const progress = Math.min(100, (typedChars / totalChars) * 100);
  racers[0].progress = progress;

  const elapsedMin = Math.max(0.01, (Date.now() - raceStartTime) / 60000);
  const currentWpm = Math.round((typedChars / 5) / elapsedMin);
  racers[0].currentWpm = currentWpm;

  const r0 = document.getElementById('racer-0');
  const r0Wpm = document.getElementById('racer-0-wpm');
  if (r0) r0.style.left = Math.min(92, progress * 0.92) + '%';
  if (r0Wpm) r0Wpm.textContent = currentWpm + ' WPM';
  if (hudWpm) hudWpm.textContent = currentWpm.toString();
  if (hudProgress) hudProgress.textContent = Math.round(progress).toString();

  const acc = totalKeystrokes > 0 ? Math.max(0, Math.round(((totalKeystrokes - errorKeystrokes) / totalKeystrokes) * 100)) : 100;
  if (hudAccuracy) hudAccuracy.textContent = acc.toString();

  // Send real-time P2P position to peers
  sendP2PMessage({ type: 'PROGRESS', progress, wpm: currentWpm });
}

function finishPassageRace(): void {
  isRaceActive = false;
  isRaceFinished = true;
  raceEndTime = Date.now();
  clearInterval(hudTimerInterval);

  racers[0].progress = 100;
  racers[0].rank = rankCounter++;
  racers[0].finishTime = raceEndTime;

  const r0Medal = document.getElementById('racer-0-medal');
  if (r0Medal) {
    r0Medal.classList.remove('hidden');
    r0Medal.textContent = racers[0].rank === 1 ? '🥇' : (racers[0].rank === 2 ? '🥈' : '🥉');
  }

  const elapsedMin = (raceEndTime - raceStartTime) / 60000;
  const finalWpm = Math.round((currentPassage.text.length / 5) / Math.max(0.05, elapsedMin));
  racers[0].currentWpm = finalWpm;

  soundEngine.playFinishChime(racers[0].rank === 1);
  updateCareerStats(finalWpm, racers[0].rank === 1);
  updateCareerUI();

  lockoutBackgroundControls(false);

  // Transition to Q&A Followup or Direct Podium
  const hasQA = currentRaceHasQA && currentPassage.qaFollowup && currentPassage.qaFollowup.question && currentPassage.qaFollowup.answer;
  if (hasQA) {
    startQAFollowup(finalWpm);
  } else {
    showRacePodium();
  }
}

// --- Story Comprehension Q&A Follow-up Engine ---
let qaStage: 'question' | 'answer' = 'question';
let qaTypedInput = '';

function startQAFollowup(userWpm: number): void {
  qaStartTime = Date.now();
  qaFinalWpm = null;

  if (typingRaceView) typingRaceView.classList.add('hidden');
  if (qaFollowupView) qaFollowupView.classList.remove('hidden');

  if (qaUserRankBadge) qaUserRankBadge.textContent = racers[0].rank === 1 ? '1st Place! 🏆' : racers[0].rank + 'th Place';
  if (qaFinishWpm) qaFinishWpm.textContent = userWpm.toString();

  qaStage = 'question';
  qaTypedInput = '';
  renderQADisplay();

  if (qaInput) {
    qaInput.value = '';
    qaInput.placeholder = 'Type the Question above, then press Enter ↵...';
    try {
      qaInput.focus({ preventScroll: true });
    } catch (e) {}
  }
}

function renderQADisplay(): void {
  const qText = currentPassage.qaFollowup?.question || '';
  const aText = currentPassage.qaFollowup?.answer || '';

  if (qaLine1) {
    if (qaStage === 'question') {
      qaLine1.innerHTML = '<span class="font-black text-amber-700 dark:text-brand-gold uppercase text-xs mr-2">Q:</span>' + formatTargetAndInput(qText, qaTypedInput);
    } else {
      qaLine1.innerHTML = '<span class="font-black text-emerald-700 dark:text-emerald-400 uppercase text-xs mr-2">✓ Q:</span><span class="text-slate-500 line-through">' + escapeHtml(qText) + '</span>';
    }
  }

  if (qaLine2) {
    if (qaStage === 'answer') {
      qaLine2.innerHTML = '<span class="font-black text-amber-700 dark:text-brand-gold uppercase text-xs mr-2">A:</span>' + formatTargetAndInput(aText, qaTypedInput);
    } else {
      qaLine2.innerHTML = '<span class="font-black text-slate-500 uppercase text-xs mr-2">A:</span><span class="text-slate-500">' + escapeHtml(aText) + '</span>';
    }
  }
}

function formatTargetAndInput(target: string, input: string): string {
  let html = '';
  let hasError = false;
  const alignedInput = alignTypedInput(target, input);

  for (let i = 0; i < target.length; i++) {
    const char = target[i];
    const typed = alignedInput[i];

    if (typed === undefined) {
      html += '<span class="text-slate-500 dark:text-slate-400">' + escapeHtml(char) + '</span>';
    } else if (charsMatch(typed, char) && !hasError) {
      html += '<span class="text-emerald-700 dark:text-emerald-400 font-bold">' + escapeHtml(char) + '</span>';
    } else {
      hasError = true;
      html += '<span class="bg-rose-500 text-white rounded px-0.5 font-bold">' + escapeHtml(char) + '</span>';
    }
  }

  if (qaErrorTag) qaErrorTag.classList.toggle('hidden', !hasError);
  return html;
}

function handleQAInput(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    e.preventDefault();
    const target = qaStage === 'question' ? (currentPassage.qaFollowup?.question || '') : (currentPassage.qaFollowup?.answer || '');
    const isMatch = normalizeString(qaTypedInput.trim().toLowerCase()) === normalizeString(target.trim().toLowerCase());
    if (isMatch) {
      soundEngine.playReturnClick();
      if (qaStage === 'question') {
        qaStage = 'answer';
        qaTypedInput = '';
        if (qaInput) {
          qaInput.value = '';
          qaInput.placeholder = 'Type the Answer above and press Enter ↵...';
        }
        if (qaInstructionLabel) {
          qaInstructionLabel.innerHTML = 'Now type the <strong>Answer</strong> and press <strong>Enter ↵</strong> to finish.';
        }
        renderQADisplay();
      } else {
        finishQADrill();
      }
    } else {
      soundEngine.playErrorThud();
    }
    return;
  }

  soundEngine.playKeyClick();
  setTimeout(() => {
    qaTypedInput = qaInput?.value || '';
    renderQADisplay();
  }, 10);
}

function finishQADrill(): void {
  soundEngine.playFinishChime(true);

  // Compute Q&A Typing Speed strictly as an independent statistic
  const qLen = (currentPassage.qaFollowup?.question || '').length;
  const aLen = (currentPassage.qaFollowup?.answer || '').length;
  const totalQaChars = qLen + aLen;
  const elapsedQaMin = Math.max(0.01, (Date.now() - qaStartTime) / 60000);
  qaFinalWpm = Math.round((totalQaChars / 5) / elapsedQaMin);

  if (qaContextReveal && qaContextNoteText) {
    qaContextNoteText.textContent = currentPassage.qaFollowup?.contextNote || 'Context drill complete.';
    qaContextReveal.classList.remove('hidden');
  }

  setTimeout(() => {
    showRacePodium();
  }, 1800);
}

// --- Podium Modal (Issue #40 & #41) ---
function showRacePodium(): void {
  if (qaFollowupView) qaFollowupView.classList.add('hidden');
  if (racePodiumModal) {
    racePodiumModal.classList.remove('hidden');
    racePodiumModal.classList.add('block');
  }

  const userRank = racers[0].rank || 1;
  if (podiumRankBadge) {
    podiumRankBadge.textContent = userRank === 1 ? '1st Place! 🏆' : (userRank === 2 ? '2nd Place! 🥈' : (userRank === 3 ? '3rd Place! 🥉' : '4th Place'));
  }
  const finalPodiumRank = document.getElementById('final-podium-rank');
  if (finalPodiumRank) {
    const suffix = userRank === 1 ? 'st' : (userRank === 2 ? 'nd' : (userRank === 3 ? 'rd' : 'th'));
    finalPodiumRank.textContent = userRank + suffix;
  }

  if (podiumWpmStat) podiumWpmStat.textContent = racers[0].currentWpm.toString();
  const acc = totalKeystrokes > 0 ? Math.max(0, Math.round(((totalKeystrokes - errorKeystrokes) / totalKeystrokes) * 100)) : 100;
  if (podiumAccStat) podiumAccStat.textContent = acc.toString();

  const elapsedSec = Math.max(1, Math.round((raceEndTime - raceStartTime) / 1000));
  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  if (podiumTimeStat) podiumTimeStat.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;

  // Separate Q&A Stat Display
  const finalQaWpmEl = document.getElementById('final-qa-wpm');
  const finalQaWpmUnitEl = document.getElementById('final-qa-wpm-unit');
  if (finalQaWpmEl) {
    if (qaFinalWpm !== null) {
      finalQaWpmEl.textContent = qaFinalWpm.toString();
      if (finalQaWpmUnitEl) finalQaWpmUnitEl.classList.remove('hidden');
    } else {
      finalQaWpmEl.textContent = 'N/A';
      if (finalQaWpmUnitEl) finalQaWpmUnitEl.classList.add('hidden');
    }
  }

  // Clean original book button (Issue #40)
  const fullBookBtn = document.getElementById('results-full-book-btn') || document.getElementById('results-gutenberg-btn');
  if (fullBookBtn) {
    fullBookBtn.setAttribute('href', currentPassage.gutenbergUrl);
  }

  // Pre-fill existing student email if stored
  const existingEmail = getStudentEmail();
  if (existingEmail && podiumEmailInput) {
    podiumEmailInput.value = existingEmail;
  }

  // Record race in local storage
  if (!hasRecordedCurrentRace && raceEndTime > 0) {
    const partSuffix = (currentPassage.partIndex && currentPassage.totalParts)
      ? ` • Part ${currentPassage.partIndex}/${currentPassage.totalParts}`
      : '';
    recordRaceHistory({
      bookTitle: currentPassage.title,
      chapter: currentPassage.chapter + partSuffix,
      passageWpm: racers[0].currentWpm,
      qaWpm: qaFinalWpm,
      accuracy: acc,
      rank: userRank,
      timeSeconds: elapsedSec,
      hasQA: Boolean(currentRaceHasQA && currentPassage.qaFollowup && qaFinalWpm !== null)
    });
    hasRecordedCurrentRace = true;
  }
}

// --- Touch Typing Academy Engine (Typing.com Inspiration, Issues #42, #43, #46, #47, #49, #50) ---
function loadLesson(index: number): void {
  currentLessonIndex = Math.max(0, Math.min(index, CURRICULUM.length - 1));
  const lesson = CURRICULUM[currentLessonIndex];
  lessonTargetText = lesson.drillText;
  lessonTypedIndex = 0;
  lessonKeyErrors = 0;
  lessonTotalKeys = 0;
  lessonStartTime = null;

  if (lessonModuleTag) lessonModuleTag.textContent = lesson.level + ' · Lesson ' + (currentLessonIndex + 1);
  if (lessonActiveTitle) lessonActiveTitle.textContent = lesson.title;
  if (lessonInstructionTip) lessonInstructionTip.textContent = lesson.tip;
  if (fingerGuidanceCue) fingerGuidanceCue.textContent = '👉 Strike highlighted key. Mistakes block advancement without backspacing!';
  if (lessonHudAcc) lessonHudAcc.textContent = '100%';
  if (lessonErrorTag) lessonErrorTag.style.display = 'none';

  if (lessonCompleteModal) lessonCompleteModal.classList.add('hidden');

  renderLessonDisplay();
  updateVirtualKeyboardHighlight();
  renderCurriculumGrid();

  if (lessonDrillInput) {
    lessonDrillInput.value = '';
    setTimeout(() => lessonDrillInput?.focus({ preventScroll: true }), 50);
  }
}

function renderLessonDisplay(): void {
  if (!lessonTextDisplay) return;

  const rawWords = lessonTargetText.split(' ');
  let charIdx = 0;
  let html = '';

  for (let w = 0; w < rawWords.length; w++) {
    const word = rawWords[w];
    let wordHtml = '<span class="inline-block whitespace-nowrap tracking-normal">';

    for (let c = 0; c < word.length; c++) {
      const char = word[c];
      const i = charIdx;

      if (i < lessonTypedIndex) {
        wordHtml += '<span class="text-emerald-700 dark:text-emerald-400 font-bold opacity-90">' + escapeHtml(char) + '</span>';
      } else if (i === lessonTypedIndex) {
        wordHtml += '<span id="lesson-active-cursor-char" class="relative inline-block z-10 px-2 py-0.5 mx-0.5 rounded-lg bg-brand-gold text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.7)] ring-2 ring-amber-300 animate-pulse">' + escapeHtml(char) + '</span>';
      } else {
        wordHtml += '<span class="text-slate-500 dark:text-slate-400 font-medium">' + escapeHtml(char) + '</span>';
      }
      charIdx++;
    }

    wordHtml += '</span>';
    html += wordHtml;

    // Distinct gap between word groups
    if (w < rawWords.length - 1) {
      const spaceIdx = charIdx;
      if (spaceIdx < lessonTypedIndex) {
        html += '<span class="inline-block mx-2 text-emerald-600/60 dark:text-emerald-400/60 font-mono text-sm select-none">␣</span>';
      } else if (spaceIdx === lessonTypedIndex) {
        html += '<span id="lesson-active-cursor-char" class="relative inline-flex items-center gap-1 z-10 px-2.5 py-0.5 mx-2 rounded-lg bg-brand-gold text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.7)] ring-2 ring-amber-300 animate-pulse text-xs tracking-wider uppercase font-sans">␣ Space</span>';
      } else {
        html += '<span class="inline-block mx-2 text-slate-400/50 dark:text-slate-500/50 font-mono text-sm select-none">␣</span>';
      }
      charIdx++; // Account for the space character
    }
  }

  lessonTextDisplay.innerHTML = html;
}

// Virtual Keyboard Helpers (Issues #43, #47 & #50)
function findVirtualKeyEl(key: string): HTMLElement | null {
  if (!key) return null;
  if (key === ' ') return document.querySelector('.vkey-3d[data-key=" "]');
  if (key === 'Enter') return document.querySelector('.vkey-3d[data-key="enter"]');
  if (key === 'Backspace') return document.querySelector('.vkey-3d[data-key="bksp"]');

  // Handle typographic dashes and symbols
  if (key === '—' || key === '–' || key === '―' || key === '−' || key === '‒') {
    return document.querySelector('.vkey-3d[data-key="-"]');
  }
  if (key === '’' || key === '‘') {
    return document.querySelector('.vkey-3d[data-key="\'"]');
  }
  if (key === '“' || key === '”') {
    return document.querySelector('.vkey-3d[data-key="\'"]');
  }

  const lower = key.toLowerCase();
  const el = document.querySelector('.vkey-3d[data-key="' + lower + '"]') as HTMLElement | null;
  if (el) return el;

  const shiftMap: Record<string, string> = {
    '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
    '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
  };
  if (shiftMap[key]) {
    return document.querySelector('.vkey-3d[data-key="' + shiftMap[key] + '"]') as HTMLElement | null;
  }

  if (key >= 'A' && key <= 'Z') {
    return document.querySelector('.vkey-3d[data-key="' + key.toLowerCase() + '"]') as HTMLElement | null;
  }

  return null;
}

function pressKeycapVisual(key: string): void {
  const el = findVirtualKeyEl(key);
  if (el) {
    el.classList.add('vkey-pressed');
    el.setAttribute('aria-pressed', 'true');
    setTimeout(() => {
      el.classList.remove('vkey-pressed');
      el.setAttribute('aria-pressed', 'false');
    }, 120);
  }
}

function triggerKeycapError(key: string): void {
  const el = findVirtualKeyEl(key);
  if (el) {
    el.classList.add('vkey-error');
    setTimeout(() => el.classList.remove('vkey-error'), 300);
  }
}

function updateVirtualKeyboardHighlight(): void {
  const allKeys = document.querySelectorAll('.vkey-3d');
  allKeys.forEach((k) => {
    k.classList.remove('vkey-active', 'vkey-shift-active');
    k.removeAttribute('aria-current');
  });

  if (lessonTypedIndex >= lessonTargetText.length) return;

  const nextChar = lessonTargetText[lessonTypedIndex];
  if (!nextChar) return;

  const targetEl = findVirtualKeyEl(nextChar);
  if (targetEl) {
    targetEl.classList.add('vkey-active');
    targetEl.setAttribute('aria-current', 'step');
  }

  const isShiftNeeded = (nextChar >= 'A' && nextChar <= 'Z') || '~!@#$%^&*()_+{}|:"<>?'.includes(nextChar) || nextChar === '“' || nextChar === '”';
  if (isShiftNeeded) {
    const finger = targetEl ? targetEl.getAttribute('data-finger') : '';
    const isLeftHand = finger && finger.startsWith('left');
    const shiftKeyId = isLeftHand ? 'vkey-shift-right' : 'vkey-shift-left';
    const shiftEl = document.getElementById(shiftKeyId);
    if (shiftEl) {
      shiftEl.classList.add('vkey-shift-active');
      shiftEl.setAttribute('aria-current', 'step');
    }
  }

  const fingerKey = targetEl ? (targetEl.getAttribute('data-finger') || getFingerForChar(nextChar)) : getFingerForChar(nextChar);
  const fingerDesc = getFingerDescription(fingerKey, nextChar);

  const hudTargetKeyPill = document.getElementById('hud-target-key-pill');
  const hudTargetFingerDesc = document.getElementById('hud-target-finger-desc');
  if (hudTargetKeyPill) {
    const displayLabel = nextChar === ' ' ? 'Space' : (nextChar === '—' || nextChar === '–' ? '- (Dash)' : nextChar);
    hudTargetKeyPill.textContent = displayLabel;
  }
  if (hudTargetFingerDesc) {
    hudTargetFingerDesc.textContent = fingerDesc;
  }

  // Update Anatomical SVG Hands (Issue #46)
  const allFingerSvgs = document.querySelectorAll('.finger-group');
  allFingerSvgs.forEach((fg) => {
    fg.classList.remove('active-finger');
    fg.setAttribute('data-active', 'false');
  });

  if (fingerKey === 'thumb') {
    const leftThumb = document.getElementById('finger-svg-left-thumb');
    const rightThumb = document.getElementById('finger-svg-right-thumb');
    if (leftThumb) { leftThumb.classList.add('active-finger'); leftThumb.setAttribute('data-active', 'true'); }
    if (rightThumb) { rightThumb.classList.add('active-finger'); rightThumb.setAttribute('data-active', 'true'); }
  } else if (fingerKey) {
    const targetFingerSvg = document.getElementById('finger-svg-' + fingerKey);
    if (targetFingerSvg) {
      targetFingerSvg.classList.add('active-finger');
      targetFingerSvg.setAttribute('data-active', 'true');
    }
  }
}

// Strict Academy Typing Mechanics (Issue #50: Wrong key does not advance; no backspace required)
function handleLessonKey(key: string): void {
  if (lessonTypedIndex >= lessonTargetText.length) return;

  const expectedChar = lessonTargetText[lessonTypedIndex];
  if (!expectedChar) return;

  if (!lessonStartTime) lessonStartTime = Date.now();

  // If user pressed Backspace in Academy mode
  if (key === 'Backspace') {
    soundEngine.playErrorThud();
    showLessonError('No backspace needed! Strike the correct key: "' + (expectedChar === ' ' ? 'Spacebar' : expectedChar) + '"');
    return;
  }

  if (charsMatch(key, expectedChar)) {
    // CORRECT KEY: Advance forward!
    lessonTotalKeys++;
    lessonTypedIndex++;
    if (key === ' ') {
      soundEngine.playSpaceClick();
    } else {
      soundEngine.playKeyClick();
    }
    pressKeycapVisual(key);

    if (lessonErrorTag) lessonErrorTag.style.display = 'none';

    if (lessonTypedIndex >= lessonTargetText.length) {
      finishCurrentLesson();
      return;
    }

    renderLessonDisplay();
    updateVirtualKeyboardHighlight();
  } else {
    // INCORRECT KEY: DO NOT ADVANCE!
    lessonTotalKeys++;
    lessonKeyErrors++;
    soundEngine.playErrorThud();
    triggerKeycapError(key);

    const cursorChar = document.getElementById('lesson-active-cursor-char');
    if (cursorChar) {
      cursorChar.classList.remove('animate-pulse');
      cursorChar.classList.add('bg-rose-500', 'text-white', 'ring-rose-400', 'animate-shake');
      setTimeout(() => {
        if (cursorChar) {
          cursorChar.classList.remove('bg-rose-500', 'text-white', 'ring-rose-400', 'animate-shake');
          cursorChar.classList.add('bg-brand-gold', 'text-slate-950', 'ring-amber-300', 'animate-pulse');
        }
      }, 350);
    }

    const expectedDisplay = expectedChar === ' ' ? 'Spacebar' : expectedChar;
    showLessonError('Incorrect key! Strike "' + expectedDisplay + '" to advance.');
    announceSrAlert('Incorrect key. Strike ' + expectedDisplay);
  }

  updateLessonAccuracy();
}

function showLessonError(msg: string): void {
  if (lessonErrorTag && lessonErrorMsg) {
    lessonErrorMsg.textContent = msg;
    lessonErrorTag.style.display = 'flex';
  }
}

function updateLessonAccuracy(): void {
  if (lessonTotalKeys > 0 && lessonHudAcc) {
    const acc = Math.max(0, Math.round(((lessonTotalKeys - lessonKeyErrors) / lessonTotalKeys) * 100));
    lessonHudAcc.textContent = acc + '%';
  }
}

function finishCurrentLesson(): void {
  soundEngine.playFinishChime(true);

  const elapsedSec = Math.max(1, Math.round((Date.now() - (lessonStartTime || Date.now())) / 1000));
  const wpm = Math.round((lessonTotalKeys / 5) / (elapsedSec / 60));
  const acc = Math.max(0, Math.round(((lessonTotalKeys - lessonKeyErrors) / Math.max(1, lessonTotalKeys)) * 100));

  const stars = getLessonStarRating(acc, wpm);
  const starsString = '⭐'.repeat(stars);

  saveLessonRecord(currentLessonIndex + 1, {
    stars,
    bestWpm: wpm,
    bestAccuracy: acc,
    completedAt: Date.now()
  });

  const lesson = CURRICULUM[currentLessonIndex];
  if (lesson) {
    recordAcademyHistory({
      lessonId: lesson.id,
      title: lesson.title,
      level: lesson.level,
      wpm,
      accuracy: acc,
      stars
    });
  }

  const modalTitle = document.getElementById('lesson-complete-title');
  const modalStars = document.getElementById('lesson-complete-stars');
  const modalWpm = document.getElementById('lesson-complete-wpm');
  const modalAcc = document.getElementById('lesson-complete-acc');

  if (modalTitle) modalTitle.textContent = 'Lesson ' + (currentLessonIndex + 1) + ' Complete!';
  if (modalStars) modalStars.textContent = starsString;
  if (modalWpm) modalWpm.textContent = wpm.toString();
  if (modalAcc) modalAcc.textContent = acc.toString();

  if (lessonCompleteModal) lessonCompleteModal.classList.remove('hidden');

  renderCurriculumGrid();
  updateCareerUI();
}

// --- Curriculum Grid Rendering (Issue #42 & #49) ---
function renderCurriculumGrid(): void {
  if (!lessonsCurriculumGrid) return;

  const records = getAllLessonRecords();
  let completedCount = 0;

  lessonsCurriculumGrid.innerHTML = CURRICULUM.map((lesson, idx) => {
    const record = records[lesson.id];
    const isCurrent = idx === currentLessonIndex;
    if (record) completedCount++;

    const starsDisplay = record ? '⭐'.repeat(record.stars) : '☆☆☆';

    return (
      '<div' +
        ' class="curriculum-lesson-card p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-500 ' +
        (isCurrent
          ? 'bg-amber-400/[0.12] border-brand-gold shadow-md ring-1 ring-amber-300'
          : 'bg-white/70 dark:bg-slate-900/60 border-black/[0.06] dark:border-white/[0.08] hover:bg-white dark:hover:bg-slate-800') +
        '"' +
        ' data-lesson-idx="' + idx + '"' +
        ' role="button"' +
        ' tabindex="0"' +
        ' aria-label="Lesson ' + lesson.id + ': ' + escapeHtml(lesson.title) + '. Stars earned: ' + starsDisplay + '"' +
      '>' +
        '<div class="flex items-center justify-between mb-2">' +
          '<span class="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-brand-gold">' +
            escapeHtml(lesson.level) + ' · #' + lesson.id +
          '</span>' +
          '<span class="text-xs font-mono font-bold text-amber-500" aria-hidden="true">' +
            starsDisplay +
          '</span>' +
        '</div>' +
        '<h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">' +
          escapeHtml(lesson.title) +
        '</h4>' +
        '<p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2.5">' +
          escapeHtml(lesson.tip) +
        '</p>' +
        '<div class="flex items-center justify-between pt-2 border-t border-black/[0.05] dark:border-white/[0.06] text-[11px]">' +
          '<span class="font-mono text-slate-500">Keys: ' + lesson.newKeys.join(' ') + '</span>' +
          '<span class="font-bold ' + (isCurrent ? 'text-amber-800 dark:text-brand-gold' : 'text-slate-700 dark:text-slate-300') + '">' +
            (isCurrent ? 'Practicing Now ●' : (record ? 'Completed ✓' : 'Start Drill ➔')) +
          '</span>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  const summaryBadge = document.getElementById('academy-summary-badge');
  if (summaryBadge) {
    summaryBadge.textContent = completedCount + ' / 12 Lessons Completed';
  }

  // Bind click & keyboard activation to cards (Issue #42)
  const cards = lessonsCurriculumGrid.querySelectorAll('.curriculum-lesson-card');
  cards.forEach((card) => {
    const idx = parseInt(card.getAttribute('data-lesson-idx') || '0', 10);
    card.addEventListener('click', () => loadLesson(idx));
    card.addEventListener('keydown', (e: any) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        loadLesson(idx);
      }
    });
  });
}

// --- Story Library Rendering (Issue #40 & #42) ---
function renderFullLibrary(): void {
  if (!libraryFullGrid) return;

  const query = libraryDirectSearch ? libraryDirectSearch.value.trim().toLowerCase() : '';
  const filtered = passages.filter((p) => {
    if (!query) return true;
    return p.title.toLowerCase().includes(query) || p.author.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    libraryFullGrid.innerHTML = '<div class="p-8 text-center text-slate-500">No classic stories match your search.</div>';
    return;
  }

  libraryFullGrid.innerHTML = filtered.map((p) => {
    const origIdx = passages.findIndex((x) => x.id === p.id);
    const isCurrent = origIdx === currentPassageIndex;

    return (
      '<div class="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-black/[0.06] dark:border-white/[0.08] hover:border-amber-400/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">' +
        '<div class="min-w-0 flex-1">' +
          '<div class="flex items-center gap-2 flex-wrap mb-1">' +
            '<h4 class="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 font-serif-literary">' + escapeHtml(p.title) + '</h4>' +
            '<span class="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300">' + escapeHtml(p.difficulty) + '</span>' +
            (isCurrent ? '<span class="px-2 py-0.2 rounded-full text-[10px] font-black bg-brand-gold text-slate-950">Current Book</span>' : '') +
          '</div>' +
          '<p class="text-xs text-slate-600 dark:text-gray-400 mb-2">by ' + escapeHtml(p.author) + ' (' + p.year + ') • ' + escapeHtml(p.chapter) + '</p>' +
          '<p class="text-xs text-slate-700 dark:text-gray-300 line-clamp-2 italic font-serif-literary">"' + escapeHtml(p.text) + '"</p>' +
        '</div>' +
        '<div class="flex items-center gap-2">' +
          '<button type="button" class="library-select-btn refraction-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-brand-gold text-white dark:text-slate-950 hover:opacity-90 active:scale-95 transition-all shadow-sm min-h-[44px]" data-orig-idx="' + origIdx + '">' +
            (isCurrent ? 'Racing Now' : 'Race This Book') +
          '</button>' +
          '<a href="' + p.gutenbergUrl + '" target="_blank" rel="noopener noreferrer" class="refraction-btn px-2.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-black/[0.08] dark:border-white/[0.1] hover:text-amber-700 transition-colors inline-flex items-center gap-1 min-h-[44px]" title="Read original text">' +
            'Full Text ↗' +
          '</a>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  // Bind buttons
  const btns = libraryFullGrid.querySelectorAll('.library-select-btn');
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-orig-idx') || '0', 10);
      loadPassage(idx);
      switchAppTab('arena');
    });
  });
}

// --- Career Footer UI (Issue #49) ---
function updateCareerUI(): void {
  const stats = getCareerStats();
  const avg = stats.races > 0 ? Math.round(stats.totalWpmSum / stats.races) : 0;
  const stars = getTotalStars();

  const elRaces = document.getElementById('career-races');
  const elWins = document.getElementById('career-victories');
  const elBest = document.getElementById('career-best-wpm');
  const elAvg = document.getElementById('career-avg-wpm');
  const elStars = document.getElementById('career-academy-stars');

  if (elRaces) elRaces.textContent = stats.races.toString();
  if (elWins) elWins.textContent = stats.victories.toString();
  if (elBest) elBest.textContent = stats.bestWpm + ' WPM';
  if (elAvg) elAvg.textContent = avg + ' WPM';
  if (elStars) elStars.textContent = stars + ' ⭐';
}

// --- Learner History Modal Controller ---
let currentHistoryTab: 'races' | 'academy' = 'races';

function openHistoryModal(initialTab: 'races' | 'academy' = 'races'): void {
  currentHistoryTab = initialTab;
  switchHistoryTab(initialTab);
  renderHistoryModal();
  if (historyModal) {
    historyModal.classList.remove('hidden');
    historyModal.classList.add('flex');
    btnCloseHistory?.focus();
  }
}

function closeHistoryModal(): void {
  if (historyModal) {
    historyModal.classList.add('hidden');
    historyModal.classList.remove('flex');
  }
}

function switchHistoryTab(tab: 'races' | 'academy'): void {
  currentHistoryTab = tab;
  const isRaces = tab === 'races';

  if (tabHistoryRaces) {
    tabHistoryRaces.setAttribute('aria-selected', isRaces ? 'true' : 'false');
    tabHistoryRaces.className = isRaces
      ? 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-brand-gold shadow-sm'
      : 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all';
  }

  if (tabHistoryAcademy) {
    tabHistoryAcademy.setAttribute('aria-selected', !isRaces ? 'true' : 'false');
    tabHistoryAcademy.className = !isRaces
      ? 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-brand-gold shadow-sm'
      : 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all';
  }

  if (historyViewRaces) historyViewRaces.classList.toggle('hidden', !isRaces);
  if (historyViewAcademy) historyViewAcademy.classList.toggle('hidden', isRaces);
}

function renderHistoryModal(): void {
  renderHistoryRacesList();
  renderHistoryAcademyList();
}

function renderHistoryRacesList(): void {
  const races = getRaceHistory();
  if (historyRaceCount) historyRaceCount.textContent = races.length.toString();

  const statBest = document.getElementById('hist-stat-best-passage');
  const statAvg = document.getElementById('hist-stat-avg-passage');
  const statAvgQa = document.getElementById('hist-stat-avg-qa');
  const statWins = document.getElementById('hist-stat-wins');

  if (races.length === 0) {
    if (historyRacesEmpty) historyRacesEmpty.classList.remove('hidden');
    if (historyRacesList) historyRacesList.innerHTML = '';
    if (statBest) statBest.textContent = '0 WPM';
    if (statAvg) statAvg.textContent = '0 WPM';
    if (statAvgQa) statAvgQa.textContent = '0 WPM';
    if (statWins) statWins.textContent = '0';
    return;
  }

  if (historyRacesEmpty) historyRacesEmpty.classList.add('hidden');

  const bestPassage = Math.max(...races.map((r) => r.passageWpm));
  const avgPassage = Math.round(races.reduce((acc, r) => acc + r.passageWpm, 0) / races.length);
  const qaRaces = races.filter((r) => r.qaWpm !== null && r.qaWpm !== undefined);
  const avgQa = qaRaces.length > 0 ? Math.round(qaRaces.reduce((acc, r) => acc + (r.qaWpm || 0), 0) / qaRaces.length) : null;
  const wins = races.filter((r) => r.rank === 1).length;

  if (statBest) statBest.textContent = `${bestPassage} WPM`;
  if (statAvg) statAvg.textContent = `${avgPassage} WPM`;
  if (statAvgQa) statAvgQa.textContent = avgQa !== null ? `${avgQa} WPM` : 'N/A';
  if (statWins) statWins.textContent = wins.toString();

  if (historyRacesList) {
    historyRacesList.innerHTML = races.map((r) => {
      const rankEmoji = r.rank === 1 ? '🥇' : (r.rank === 2 ? '🥈' : (r.rank === 3 ? '🥉' : '🏁'));
      const rankText = r.rank === 1 ? '1st' : (r.rank === 2 ? '2nd' : (r.rank === 3 ? '3rd' : `${r.rank}th`));
      const formattedDate = new Date(r.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const qaDisplay = r.qaWpm !== null && r.qaWpm !== undefined
        ? `<span class="text-sky-600 dark:text-sky-400 font-bold font-mono">${r.qaWpm} WPM</span>`
        : `<span class="text-slate-400 dark:text-slate-500 italic">None / Skipped</span>`;

      return (
        '<div class="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-sm hover:border-amber-400/40 transition-all">' +
          '<div class="min-w-0 flex-1">' +
            '<div class="flex items-center gap-2 mb-1 flex-wrap">' +
              '<span class="text-base" aria-hidden="true">' + rankEmoji + '</span>' +
              '<span class="font-black text-xs px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-800 dark:text-brand-gold">' + rankText + ' Place</span>' +
              '<h5 class="font-bold text-sm text-slate-900 dark:text-slate-100 font-serif-literary truncate">' + escapeHtml(r.bookTitle) + '</h5>' +
            '</div>' +
            '<p class="text-xs text-slate-600 dark:text-slate-400 leading-snug truncate">' + escapeHtml(r.chapter) + ' · <time class="text-slate-500">' + formattedDate + '</time></p>' +
          '</div>' +
          '<div class="flex items-center gap-4 text-xs shrink-0">' +
            '<div class="text-center">' +
              '<span class="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">Passage</span>' +
              '<strong class="text-sm font-mono text-emerald-700 dark:text-emerald-400">' + r.passageWpm + ' WPM</strong>' +
            '</div>' +
            '<div class="text-center">' +
              '<span class="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">Q&A Speed</span>' +
              qaDisplay +
            '</div>' +
            '<div class="text-center">' +
              '<span class="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">Accuracy</span>' +
              '<span class="font-mono font-bold text-slate-700 dark:text-slate-300">' + r.accuracy + '%</span>' +
            '</div>' +
            '<div class="text-center">' +
              '<span class="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">Time</span>' +
              '<span class="font-mono text-slate-500">' + r.timeSeconds + 's</span>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }
}

function renderHistoryAcademyList(): void {
  const history = getAcademyHistory();
  if (historyAcademyCount) historyAcademyCount.textContent = history.length.toString();

  const statStars = document.getElementById('hist-acad-stars');
  const statAttempts = document.getElementById('hist-acad-attempts');
  const statTopWpm = document.getElementById('hist-acad-top-wpm');

  if (history.length === 0) {
    if (historyAcademyEmpty) historyAcademyEmpty.classList.remove('hidden');
    if (historyAcademyList) historyAcademyList.innerHTML = '';
    if (statStars) statStars.textContent = '0 ⭐';
    if (statAttempts) statAttempts.textContent = '0';
    if (statTopWpm) statTopWpm.textContent = '0 WPM';
    return;
  }

  if (historyAcademyEmpty) historyAcademyEmpty.classList.add('hidden');

  const totalStars = getTotalStars();
  const topWpm = Math.max(...history.map((h) => h.wpm));

  if (statStars) statStars.textContent = `${totalStars} ⭐`;
  if (statAttempts) statAttempts.textContent = history.length.toString();
  if (statTopWpm) statTopWpm.textContent = `${topWpm} WPM`;

  if (historyAcademyList) {
    historyAcademyList.innerHTML = history.map((h) => {
      const formattedDate = new Date(h.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const starsDisplay = '⭐'.repeat(h.stars) + '☆'.repeat(3 - h.stars);

      return (
        '<div class="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-sm hover:border-amber-400/40 transition-all">' +
          '<div class="min-w-0 flex-1">' +
            '<div class="flex items-center gap-2 mb-1 flex-wrap">' +
              '<span class="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-brand-gold">Lesson #' + h.lessonId + '</span>' +
              '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">' + escapeHtml(h.level) + '</span>' +
              '<h5 class="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">' + escapeHtml(h.title) + '</h5>' +
            '</div>' +
            '<p class="text-xs text-slate-500 leading-snug"><time>' + formattedDate + '</time></p>' +
          '</div>' +
          '<div class="flex items-center gap-4 text-xs shrink-0">' +
            '<div class="text-center">' +
              '<span class="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">Speed</span>' +
              '<strong class="text-sm font-mono text-emerald-700 dark:text-emerald-400">' + h.wpm + ' WPM</strong>' +
            '</div>' +
            '<div class="text-center">' +
              '<span class="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">Accuracy</span>' +
              '<span class="font-mono font-bold text-slate-700 dark:text-slate-300">' + h.accuracy + '%</span>' +
            '</div>' +
            '<div class="text-center">' +
              '<span class="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">Stars</span>' +
              '<span class="font-mono text-amber-500 text-xs">' + starsDisplay + '</span>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }
}

// --- Global Event Bindings ---
function bindGlobalEvents(): void {
  // Tab Switchers (Issue #42)
  if (tabBtnArena) tabBtnArena.addEventListener('click', () => switchAppTab('arena'));
  if (tabBtnLessons) tabBtnLessons.addEventListener('click', () => switchAppTab('lessons'));
  if (tabBtnLibrary) tabBtnLibrary.addEventListener('click', () => switchAppTab('library'));

  // Keyboard navigation across tabs
  const tabButtons = [tabBtnArena, tabBtnLessons, tabBtnLibrary].filter(Boolean) as HTMLElement[];
  tabButtons.forEach((btn, idx) => {
    btn.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = tabButtons[(idx + 1) % tabButtons.length];
        next.focus();
        next.click();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = tabButtons[(idx - 1 + tabButtons.length) % tabButtons.length];
        prev.focus();
        prev.click();
      }
    });
  });

  // Vocab Drawer Toggle
  if (btnToggleVocab && vocabDrawer) {
    btnToggleVocab.addEventListener('click', () => {
      vocabDrawer?.classList.toggle('hidden');
    });
  }

  // Next Passage Button (Advances through parts of story)
  if (btnNextPassage) {
    btnNextPassage.addEventListener('click', () => {
      loadPassage(getNextStoryPassageIndex());
    });
  }

  // Start Race Now Button
  if (btnStartRaceNow) {
    btnStartRaceNow.addEventListener('click', () => {
      if (!isRaceActive && !isCountingDown) {
        startCountdownSequence();
      }
    });
  }

  // Invite Link Button
  if (btnInviteLink && inviteBtnLabel) {
    btnInviteLink.addEventListener('click', () => {
      try {
        navigator.clipboard.writeText(window.location.href);
        inviteBtnLabel.textContent = 'Link Copied! ✓';
        setTimeout(() => {
          if (inviteBtnLabel) inviteBtnLabel.textContent = 'Invite Friend';
        }, 2000);
      } catch (e) {
        inviteBtnLabel.textContent = 'Share URL above';
      }
    });
  }

  // Mode Select
  if (modeSelect) {
    modeSelect.addEventListener('change', (e: any) => {
      followupMode = e.target.value;
      loadPassage(currentPassageIndex);
    });
  }

  // Race Typing Input
  if (typingInput) {
    typingInput.addEventListener('input', handleTypingInput);
  }

  // Skip Q&A
  if (btnSkipQa) {
    btnSkipQa.addEventListener('click', () => {
      qaFinalWpm = null;
      showRacePodium();
    });
  }

  // Q&A Input
  if (qaInput) {
    qaInput.addEventListener('keydown', handleQAInput);
  }

  // Podium Modal Actions
  if (btnPodiumRestart) {
    btnPodiumRestart.addEventListener('click', () => {
      if (racePodiumModal) racePodiumModal.classList.add('hidden');
      resetRaceState();
    });
  }

  if (btnPodiumNextStory) {
    btnPodiumNextStory.addEventListener('click', () => {
      if (racePodiumModal) racePodiumModal.classList.add('hidden');
      loadPassage(getNextStoryPassageIndex());
    });
  }

  if (btnPodiumGotoLessons) {
    btnPodiumGotoLessons.addEventListener('click', () => {
      if (racePodiumModal) racePodiumModal.classList.add('hidden');
      switchAppTab('lessons');
    });
  }

  // History Modal Triggers & Controls
  if (btnOpenHistory) {
    btnOpenHistory.addEventListener('click', () => openHistoryModal('races'));
  }
  if (btnPodiumHistory) {
    btnPodiumHistory.addEventListener('click', () => openHistoryModal('races'));
  }
  if (btnCloseHistory) {
    btnCloseHistory.addEventListener('click', closeHistoryModal);
  }
  if (historyModalBackdrop) {
    historyModalBackdrop.addEventListener('click', closeHistoryModal);
  }
  if (tabHistoryRaces) {
    tabHistoryRaces.addEventListener('click', () => switchHistoryTab('races'));
  }
  if (tabHistoryAcademy) {
    tabHistoryAcademy.addEventListener('click', () => switchHistoryTab('academy'));
  }
  if (btnClearHistoryData) {
    btnClearHistoryData.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all typing race and academy history records?')) {
        clearAllHistory();
        renderHistoryModal();
      }
    });
  }

  // Escape key to close history modal
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && historyModal && !historyModal.classList.contains('hidden')) {
      closeHistoryModal();
    }
  });

  // Share Score button
  const btnShareScore = document.getElementById('btn-share-score');
  const shareBtnText = document.getElementById('share-btn-text');
  if (btnShareScore) {
    btnShareScore.addEventListener('click', () => {
      const text = `🏎️ I typed at ${racers[0].currentWpm} WPM on TinyKite TypeRacer! Try it: https://tinykite.co/typeracer/`;
      try {
        navigator.clipboard.writeText(text);
        if (shareBtnText) shareBtnText.textContent = 'Copied! ✓';
        setTimeout(() => {
          if (shareBtnText) shareBtnText.textContent = 'Share Score';
        }, 2000);
      } catch (e) {}
    });
  }

  // Podium Email Form (Issue #41)
  if (podiumEmailForm) {
    podiumEmailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = podiumEmailInput?.value.trim();
      if (email && email.includes('@')) {
        saveStudentEmail(email);
        if (podiumEmailSuccess) {
          podiumEmailSuccess.classList.remove('hidden');
        }
        if (podiumEmailInput) {
          podiumEmailInput.disabled = true;
        }
      }
    });
  }

  // Academy Prev/Next Lesson Buttons (Issue #50)
  if (btnPrevLesson) {
    btnPrevLesson.addEventListener('click', () => {
      if (currentLessonIndex > 0) loadLesson(currentLessonIndex - 1);
    });
  }

  if (btnNextLesson) {
    btnNextLesson.addEventListener('click', () => {
      if (currentLessonIndex < CURRICULUM.length - 1) loadLesson(currentLessonIndex + 1);
    });
  }

  // Academy Drill Input & Card Focus
  if (lessonDrillCard && lessonDrillInput) {
    lessonDrillCard.addEventListener('click', () => {
      lessonDrillInput?.focus({ preventScroll: true });
    });

    lessonDrillInput.addEventListener('keydown', (e: KeyboardEvent) => {
      // Prevent default scrolling on spacebar
      if (e.key === ' ') e.preventDefault();

      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
        handleLessonKey(e.key);
      }
    });
  }

  // Academy Lesson Complete Modal Buttons
  const btnCompleteNext = document.getElementById('btn-lesson-complete-next');
  if (btnCompleteNext) {
    btnCompleteNext.addEventListener('click', () => {
      if (lessonCompleteModal) lessonCompleteModal.classList.add('hidden');
      if (currentLessonIndex + 1 < CURRICULUM.length) {
        loadLesson(currentLessonIndex + 1);
      }
    });
  }

  const btnCompleteRetry = document.getElementById('btn-lesson-complete-retry');
  if (btnCompleteRetry) {
    btnCompleteRetry.addEventListener('click', () => {
      if (lessonCompleteModal) lessonCompleteModal.classList.add('hidden');
      loadLesson(currentLessonIndex);
    });
  }

  // Library Search Filter
  if (libraryDirectSearch) {
    libraryDirectSearch.addEventListener('input', renderFullLibrary);
  }

  // Career Reset
  const btnResetCareer = document.getElementById('btn-reset-career');
  if (btnResetCareer) {
    btnResetCareer.addEventListener('click', () => {
      if (confirm('Reset all career racing stats and star records?')) {
        localStorage.removeItem('tinykite_typeracer_career');
        localStorage.removeItem('tinykite_typeracer_lessons');
        updateCareerUI();
        renderCurriculumGrid();
      }
    });
  }
}

// Auto-run on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClientApp);
  } else {
    initClientApp();
  }
}
