export interface LessonDef {
  id: number;
  level: string;
  title: string;
  newKeys: string[];
  tip: string;
  drillText: string;
}

export const CURRICULUM: LessonDef[] = [
  {
    id: 1,
    level: 'Beginner',
    title: 'Home Row Anchors: F & J',
    newKeys: ['F', 'J', 'Space'],
    tip: 'Feel the tactile homing bumps under your index fingers. Strike in word-sized groups of 4-5 letters, using thumbs for the spacebar gap.',
    drillText: 'ffff jjjj ffff jjjj ffjj jjff fffff jjjjj fjfj jfjf ffff jjjj'
  },
  {
    id: 2,
    level: 'Beginner',
    title: 'Anchor Rhythm: Extended F & J Flow',
    newKeys: ['Space'],
    tip: 'Build steady tempo across longer alternating patterns. Keep your wrists hovering softly without resting on the desk.',
    drillText: 'ffjj jjff fjfj jfjf ffff jjjj jfff fjjj ffjj jjff'
  },
  {
    id: 3,
    level: 'Beginner',
    title: 'Middle Fingers: D & K',
    newKeys: ['D', 'K'],
    tip: 'Left middle finger strikes D; right middle finger strikes K. Keep index fingers resting lightly on F and J.',
    drillText: 'dddd kkkk fddd jkkk dkdk kdkd fdfd jkjk dddk kkkd'
  },
  {
    id: 4,
    level: 'Beginner',
    title: 'Ring Fingers: S & L',
    newKeys: ['S', 'L'],
    tip: 'Left ring finger strikes S; right ring finger strikes L. Maintain curved fingers arched over the home row.',
    drillText: 'ssss llll fsll jfsl slsl lsls dsss klll sssl llls'
  },
  {
    id: 5,
    level: 'Beginner',
    title: 'Pinky Outposts: A & Semicolon',
    newKeys: ['A', ';'],
    tip: 'Reach slightly outward with your pinkies without shifting your wrists or resting your palms on the desk.',
    drillText: 'aaaa ;;;; a;a; ;a;a asdf jkl; faaa j;;; aaaa ;;;;'
  },
  {
    id: 6,
    level: 'Foundation',
    title: 'Home Row Word Flow',
    newKeys: ['Home Row'],
    tip: 'Combine all eight home row keys into fluid English words without glancing at the keyboard.',
    drillText: 'flask salads shall fall flash salads flask shall'
  },
  {
    id: 7,
    level: 'Foundation',
    title: 'Top Row Vowels: E & I',
    newKeys: ['E', 'I'],
    tip: 'Reach upward smoothly with your middle fingers. Left middle finger finds E; right middle finger finds I.',
    drillText: 'feed side like file slide life wide kids'
  },
  {
    id: 8,
    level: 'Foundation',
    title: 'Top Row Index Reaches: R, T, U, Y',
    newKeys: ['R', 'T', 'U', 'Y'],
    tip: 'Your index fingers control two columns each. Snap back to F and J immediately after every stroke.',
    drillText: 'true rust fruit stay year turn just duty true'
  },
  {
    id: 9,
    level: 'Intermediate',
    title: 'Bottom Row: C, V, M, N',
    newKeys: ['C', 'V', 'M', 'N'],
    tip: 'Curl fingers down into the bottom row. Left index drops to V, right index drops to M and N.',
    drillText: 'view come cave vain move main calm mean name'
  },
  {
    id: 10,
    level: 'Intermediate',
    title: 'Capital Letters & Shift Coordination',
    newKeys: ['Shift'],
    tip: 'Use opposite Shift: hold Right Shift for left-hand capitals, and Left Shift for right-hand capitals.',
    drillText: 'London Paris Jane Emma River Secret Garden'
  },
  {
    id: 11,
    level: 'Advanced',
    title: 'Punctuation & Numbers: , . ! ?',
    newKeys: [',', '.', '!', '?'],
    tip: 'Strike commas with right middle finger and periods with right ring finger. Precision over pure speed.',
    drillText: 'Quick, quiet. Stop! Look, listen. Yes, sir!'
  },
  {
    id: 12,
    level: 'Mastery',
    title: 'Flow & Literary Transitions',
    newKeys: ['Enter', 'Quotes'],
    tip: 'Master natural pauses, dialogue quotes, and smooth line breaks with maximum rhythm and focus.',
    drillText: '"Listen closely," whispered Oliver. "The gate is open."'
  }
];
