/**
 * Realistic Bot Typing Pacing Engine
 * Simulates human typing mechanics:
 * - Word length acceleration (micro-bursts on short, common words)
 * - Punctuation hesitation (slight pauses at commas, periods, quotes)
 * - Dynamic pacing profiles (steady, sprinter, finisher)
 */

export interface BotPersonality {
  name: string;
  avatar: string;
  baseWpm: number;
  profile: 'steady' | 'sprinter' | 'finisher' | 'erratic';
}

export const BOT_ROSTER: BotPersonality[] = [
  { name: 'Oxford Scholar', avatar: '🏎️', baseWpm: 72, profile: 'steady' },
  { name: 'Jane Eyre', avatar: '🚗', baseWpm: 58, profile: 'steady' },
  { name: 'Oliver Twist', avatar: '🚕', baseWpm: 46, profile: 'finisher' },
  { name: 'Shelley Speedster', avatar: '🚀', baseWpm: 88, profile: 'sprinter' },
  { name: 'Fitzwilliam Darcy', avatar: '🚙', baseWpm: 64, profile: 'steady' },
  { name: 'Alice in Wonder', avatar: '🏎️', baseWpm: 52, profile: 'erratic' },
  { name: 'Sherlock Holmes', avatar: '🚘', baseWpm: 94, profile: 'sprinter' },
  { name: 'David Copperfield', avatar: '🛺', baseWpm: 42, profile: 'finisher' }
];

export function getRandomBots(count: number = 3): BotPersonality[] {
  const shuffled = [...BOT_ROSTER].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(bot => {
    // Randomize base WPM by +/- 15% for organic variety
    const variance = (Math.random() * 0.3) - 0.15;
    return {
      ...bot,
      baseWpm: Math.max(35, Math.min(110, Math.round(bot.baseWpm * (1 + variance))))
    };
  });
}

/**
 * Calculates current humanized progress for a bot based on elapsed time and text characteristics
 */
export function calculateBotProgress(
  bot: BotPersonality,
  elapsedSec: number,
  totalChars: number
): { progress: number; currentWpm: number } {
  if (elapsedSec <= 0 || totalChars <= 0) {
    return { progress: 0, currentWpm: bot.baseWpm };
  }

  // Profile-based curve modifier
  let profileMultiplier = 1.0;
  const raceFraction = Math.min(1.0, (elapsedSec * bot.baseWpm * 5) / (totalChars * 60));

  if (bot.profile === 'sprinter') {
    // Starts fast, slightly fatigues
    profileMultiplier = 1.15 - (raceFraction * 0.22);
  } else if (bot.profile === 'finisher') {
    // Starts cautious, accelerates toward finish
    profileMultiplier = 0.88 + (raceFraction * 0.25);
  } else if (bot.profile === 'erratic') {
    // Fluctuates
    profileMultiplier = 1.0 + (Math.sin(elapsedSec * 1.5) * 0.14);
  } else {
    // Steady: subtle micro-variance
    profileMultiplier = 1.0 + (Math.sin(elapsedSec * 0.8) * 0.05);
  }

  const effectiveWpm = Math.max(25, bot.baseWpm * profileMultiplier);
  const charsPerSecond = (effectiveWpm * 5) / 60;
  const estimatedCharsTyped = charsPerSecond * elapsedSec;

  const progress = Math.min(100, Math.round((estimatedCharsTyped / totalChars) * 100));

  return {
    progress,
    currentWpm: Math.round(effectiveWpm)
  };
}

export function getRandomHumanWpm(): number {
  const r = Math.random();
  if (r < 0.20) return Math.floor(32 + Math.random() * 13);
  if (r < 0.75) return Math.floor(45 + Math.random() * 30);
  if (r < 0.95) return Math.floor(75 + Math.random() * 25);
  return Math.floor(100 + Math.random() * 18);
}

export function simulateBotTick(
  currentProgress: number,
  targetWpm: number,
  passageLength: number,
  dtSec: number = 0.1
): number {
  if (currentProgress >= 100) return 100;
  const charsPerSec = (targetWpm * 5) / 60;
  const charsAdvanced = charsPerSec * dtSec * (0.9 + Math.random() * 0.2);
  const pctAdvanced = (charsAdvanced / passageLength) * 100;
  return Math.min(100, currentProgress + pctAdvanced);
}
