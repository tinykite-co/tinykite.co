/**
 * TypeRacer & Typing Academy Persistence Layer
 * Provides localStorage management for career stats, lesson mastery stars,
 * and user profile preferences.
 */

export interface CareerStats {
  races: number;
  victories: number;
  bestWpm: number;
  totalWpmSum: number;
}

export interface LessonProgress {
  lessonId: number;
  stars: number; // 1, 2, or 3
  bestAccuracy: number;
  bestWpm: number;
  completedAt: number;
}

const CAREER_STORAGE_KEY = 'tinykite_typeracer_career';
const ACADEMY_PROGRESS_KEY = 'tinykite_typeracer_academy_progress';
const EMAIL_STORAGE_KEY = 'tinykite_typeracer_student_email';

export function getCareerStats(): CareerStats {
  if (typeof window === 'undefined') {
    return { races: 0, victories: 0, bestWpm: 0, totalWpmSum: 0 };
  }
  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { races: 0, victories: 0, bestWpm: 0, totalWpmSum: 0 };
}

export function recordRace(wpm: number, isVictory: boolean): CareerStats {
  const stats = getCareerStats();
  stats.races++;
  if (isVictory) stats.victories++;
  if (wpm > stats.bestWpm) stats.bestWpm = wpm;
  stats.totalWpmSum += wpm;

  if (typeof window !== 'undefined') {
    localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(stats));
  }
  return stats;
}

export function resetCareerStats(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CAREER_STORAGE_KEY);
  }
}

export function getAllLessonProgress(): Record<number, LessonProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ACADEMY_PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
}

export function getLessonProgress(lessonId: number): LessonProgress | null {
  const all = getAllLessonProgress();
  return all[lessonId] || null;
}

export function recordLessonCompletion(lessonId: number, accuracy: number, wpm: number): LessonProgress {
  let stars = 3;
  if (accuracy < 85) stars = 1;
  else if (accuracy < 95) stars = 2;

  const all = getAllLessonProgress();
  const existing = all[lessonId];

  const updated: LessonProgress = {
    lessonId,
    stars: existing ? Math.max(existing.stars, stars) : stars,
    bestAccuracy: existing ? Math.max(existing.bestAccuracy, accuracy) : accuracy,
    bestWpm: existing ? Math.max(existing.bestWpm, wpm) : wpm,
    completedAt: Date.now()
  };

  all[lessonId] = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(all));
  }
  return updated;
}

export function getStudentEmail(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(EMAIL_STORAGE_KEY) || '';
}

export function setStudentEmail(email: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMAIL_STORAGE_KEY, email.trim());
  }
}

export function getLessonStarRating(accuracy: number, wpm: number): number {
  if (accuracy >= 95 && wpm >= 20) return 3;
  if (accuracy >= 85) return 2;
  return 1;
}

export function getTotalStars(): number {
  const records = getAllLessonProgress();
  return Object.values(records).reduce((sum, r) => sum + (r.stars || 0), 0);
}

export const updateCareerStats = recordRace;
export const saveLessonRecord = (lessonId: number, data: { stars: number; bestWpm: number; bestAccuracy: number; completedAt: number }) => {
  return recordLessonCompletion(lessonId, data.bestAccuracy, data.bestWpm);
};
export const getAllLessonRecords = getAllLessonProgress;
export const saveStudentEmail = setStudentEmail;
