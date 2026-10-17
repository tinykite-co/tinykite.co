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
    newKeys: ['F', 'J'],
    tip: 'Feel the tactile homing bumps under your index fingers. Strike with quick, relaxed taps without using the spacebar.',
    drillText: 'ffffjjjjffjjfjfjfjfjjffjfjfjjffffjjjjfjfj'
  },
  {
    id: 2,
    level: 'Beginner',
    title: 'Adding Space: F, J & Spacebar',
    newKeys: ['Space'],
    tip: 'Use your thumb to press the spacebar smoothly after each pattern without lifting your hands.',
    drillText: 'f j f j fj jf f j ff jj ffff jjjj fj jf'
  },
  {
    id: 3,
    level: 'Beginner',
    title: 'Middle Fingers: D & K',
    newKeys: ['D', 'K'],
    tip: 'Left middle finger strikes D; right middle finger strikes K. Keep index fingers resting lightly on F and J.',
    drillText: 'dd kk dk kd d k f d j k df jk kf jd'
  },
  {
    id: 4,
    level: 'Beginner',
    title: 'Ring Fingers: S & L',
    newKeys: ['S', 'L'],
    tip: 'Left ring finger strikes S; right ring finger strikes L. Maintain curved fingers arched over the home row.',
    drillText: 'ss ll sl ls s l a s d f j k l s l'
  },
  {
    id: 5,
    level: 'Beginner',
    title: 'Pinky Outposts: A & Semicolon',
    newKeys: ['A', ';'],
    tip: 'Reach slightly outward with your pinkies without shifting your wrists or resting your palms on the desk.',
    drillText: 'aa ;; a; ;a a s d f j k l ; asdf jkl;'
  },
  {
    id: 6,
    level: 'Foundation',
    title: 'Home Row Word Flow',
    newKeys: ['Home Row'],
    tip: 'Combine all eight home row keys into fluid English words without glancing at the keyboard.',
    drillText: 'ask fall flask salads shall adds lads fall'
  },
  {
    id: 7,
    level: 'Foundation',
    title: 'Top Row Vowels: E & I',
    newKeys: ['E', 'I'],
    tip: 'Reach upward smoothly with your middle fingers. Left middle finger finds E; right middle finger finds I.',
    drillText: 'de ki ed ik feed side like file slide life'
  },
  {
    id: 8,
    level: 'Foundation',
    title: 'Top Row Index Reaches: R, T, U, Y',
    newKeys: ['R', 'T', 'U', 'Y'],
    tip: 'Your index fingers control two columns each. Snap back to F and J immediately after every stroke.',
    drillText: 'fr ft ju jy true rust fruit try stay year'
  },
  {
    id: 9,
    level: 'Intermediate',
    title: 'Bottom Row: C, V, M, N',
    newKeys: ['C', 'V', 'M', 'N'],
    tip: 'Curl fingers down into the bottom row. Left index drops to V, right index drops to M and N.',
    drillText: 'fv jm jn view come man cave vain move main'
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
