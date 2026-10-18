export interface QAFollowup {
  question: string;
  answer: string;
  contextNote: string;
}

export interface Question {
  id: string;
  type: 'vocabulary' | 'retrieval' | 'inference' | 'grammar';
  question: string;
  hint: string;
  answer: string;
  acceptableAnswers: string[];
  explanation: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
}

export interface Passage {
  id: string;
  bookId: string;
  partIndex: number;
  totalParts: number;
  title: string;
  author: string;
  year: number;
  gutenbergId: number;
  gutenbergUrl: string;
  sourceUrl?: string;
  chapter: string;
  difficulty: 'Foundation' | 'Standard' | 'Advanced';
  tags: string[];
  text: string;
  vocabulary: VocabularyItem[];
  questions: Question[];
  qaFollowup: QAFollowup;
}

export const PASSAGES: Passage[] = [
  {
    "id": "secret-garden-1",
    "bookId": "secret-garden",
    "partIndex": 1,
    "totalParts": 4,
    "title": "The Secret Garden",
    "author": "Frances Hodgson Burnett",
    "year": 1911,
    "gutenbergId": 113,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/113",
    "chapter": "Chapter 5: The Cry in the Corridor",
    "difficulty": "Foundation",
    "tags": [
      "Mystery",
      "Nature",
      "Discovery"
    ],
    "text": "She walked round and looked closely at that side of the orchard wall, but she only found what she had found before, that there was no door in it. Then the robin hopped from his swinging spray of ivy on to the top of the wall and opened his beak and sang a loud, lovely trill.",
    "vocabulary": [
      {
        "word": "spray",
        "definition": "A small slender shoot or twig of a plant bearing flowers or leaves"
      },
      {
        "word": "trill",
        "definition": "A vibrating, quavering musical sound made by a bird or voice"
      },
      {
        "word": "orchard",
        "definition": "A piece of enclosed land planted with fruit trees"
      }
    ],
    "questions": [
      {
        "id": "sg-q1",
        "type": "vocabulary",
        "question": "Find and type the word from the text that means a small slender branch or twig of ivy:",
        "hint": "Starts with 's' (5 letters)",
        "answer": "spray",
        "acceptableAnswers": [
          "spray",
          "a spray"
        ],
        "explanation": "'Spray' is used here to describe a small, flexible shoot of ivy on which the robin was perched."
      },
      {
        "id": "sg-q2",
        "type": "retrieval",
        "question": "Which friendly creature hopped on to the top of the orchard wall?",
        "hint": "A red-breasted garden bird",
        "answer": "robin",
        "acceptableAnswers": [
          "robin",
          "the robin",
          "a robin"
        ],
        "explanation": "The passage states: 'Then the robin hopped from his swinging spray of ivy on to the top of the wall'."
      },
      {
        "id": "sg-q3",
        "type": "grammar",
        "question": "Type the noun used to describe the robin's loud, musical bird song:",
        "hint": "Starts with 't' (5 letters)",
        "answer": "trill",
        "acceptableAnswers": [
          "trill",
          "a trill"
        ],
        "explanation": "A 'trill' is a rapid alternation between notes, frequently used in literary prose to describe birdsong."
      }
    ],
    "qaFollowup": {
      "question": "Where did the robin perch before opening his beak to sing?",
      "answer": "On the swinging spray of ivy on top of the orchard wall.",
      "contextNote": "Frances Hodgson Burnett uses the friendly robin to guide Mary toward discovering the locked garden."
    }
  },
  {
    "id": "secret-garden-2",
    "bookId": "secret-garden",
    "partIndex": 2,
    "totalParts": 4,
    "title": "The Secret Garden",
    "author": "Frances Hodgson Burnett",
    "year": 1911,
    "gutenbergId": 113,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/113",
    "chapter": "Chapter 7: The Key to the Garden",
    "difficulty": "Foundation",
    "tags": [
      "Mystery",
      "Nature",
      "Discovery"
    ],
    "text": "The robin flew from his swinging spray of ivy on to the newly turned earth. Mary stepped near to watch him peck for worms, when her shoe struck against something hard in the soil. She knelt down and dug with her bare fingers, finding an old brass key buried deep in the earth.",
    "vocabulary": [
      {
        "word": "struck",
        "definition": "Hit or came into forceful contact with an object"
      },
      {
        "word": "buried",
        "definition": "Placed or hidden deep beneath the surface of the ground"
      },
      {
        "word": "brass",
        "definition": "A yellow alloy of copper and zinc known for antique locks"
      }
    ],
    "questions": [
      {
        "id": "sg-q4",
        "type": "retrieval",
        "question": "What metal was the buried key made of?",
        "hint": "A yellow copper-zinc alloy (5 letters)",
        "answer": "brass",
        "acceptableAnswers": [
          "brass",
          "old brass"
        ],
        "explanation": "The text notes that Mary uncovered an old brass key."
      },
      {
        "id": "sg-q5",
        "type": "vocabulary",
        "question": "Find the verb that means struck lightly or probed with a beak:",
        "hint": "Starts with p (4 letters)",
        "answer": "peck",
        "acceptableAnswers": [
          "peck",
          "pecked"
        ],
        "explanation": "The robin was looking for food by pecking the soil."
      },
      {
        "id": "sg-q6",
        "type": "inference",
        "question": "Why was the robin near the earth?",
        "hint": "Looking for a garden snack",
        "answer": "worms",
        "acceptableAnswers": [
          "worms",
          "for worms",
          "to peck for worms"
        ],
        "explanation": "Mary stepped near to watch the robin peck for worms in the fresh earth."
      }
    ],
    "qaFollowup": {
      "question": "What did Mary unearth from the soil where the robin landed?",
      "answer": "An old brass key buried deep in the earth.",
      "contextNote": "The brass key had lain hidden for ten years since the garden was locked away."
    }
  },
  {
    "id": "secret-garden-3",
    "bookId": "secret-garden",
    "partIndex": 3,
    "totalParts": 4,
    "title": "The Secret Garden",
    "author": "Frances Hodgson Burnett",
    "year": 1911,
    "gutenbergId": 113,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/113",
    "chapter": "Chapter 8: The Robin Who Showed the Way",
    "difficulty": "Foundation",
    "tags": [
      "Mystery",
      "Nature",
      "Discovery"
    ],
    "text": "A strong gust of wind blew aside the heavy curtain of ivy that covered the ancient stone wall. Behind the fluttering leaves, Mary saw a round knob and a keyhole in the wooden door. Her hands trembled with excitement as she put the brass key into the lock and turned it.",
    "vocabulary": [
      {
        "word": "gust",
        "definition": "A brief, sudden rush of strong wind"
      },
      {
        "word": "trembled",
        "definition": "Shook involuntarily with excitement, nervousness, or wonder"
      },
      {
        "word": "fluttering",
        "definition": "Flapping or vibrating rapidly in the breeze"
      }
    ],
    "questions": [
      {
        "id": "sg-q7",
        "type": "retrieval",
        "question": "What caused the curtain of ivy to blow aside?",
        "hint": "A rush of air (4 letters)",
        "answer": "wind",
        "acceptableAnswers": [
          "wind",
          "a gust of wind",
          "gust of wind"
        ],
        "explanation": "A strong gust of wind moved the climbing ivy aside."
      },
      {
        "id": "sg-q8",
        "type": "vocabulary",
        "question": "Type the verb meaning shook with excitement or anticipation:",
        "hint": "Starts with t (8 letters)",
        "answer": "trembled",
        "acceptableAnswers": [
          "trembled",
          "tremble"
        ],
        "explanation": "Mary was so excited her hands trembled as she turned the key."
      },
      {
        "id": "sg-q9",
        "type": "inference",
        "question": "What material was the secret garden door made from?",
        "hint": "Derived from trees (6 letters)",
        "answer": "wooden",
        "acceptableAnswers": [
          "wooden",
          "wood"
        ],
        "explanation": "The passage explicitly mentions a wooden door."
      }
    ],
    "qaFollowup": {
      "question": "What did the gust of wind reveal behind the curtain of ivy?",
      "answer": "A round knob and a keyhole in the wooden door.",
      "contextNote": "The wind exposed the entrance that had been veiled by climbing ivy for a decade."
    }
  },
  {
    "id": "secret-garden-4",
    "bookId": "secret-garden",
    "partIndex": 4,
    "totalParts": 4,
    "title": "The Secret Garden",
    "author": "Frances Hodgson Burnett",
    "year": 1911,
    "gutenbergId": 113,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/113",
    "chapter": "Chapter 9: The Door in the Wall",
    "difficulty": "Foundation",
    "tags": [
      "Mystery",
      "Nature",
      "Discovery"
    ],
    "text": "The heavy wooden door swung slowly open on its rusted hinges. Mary slipped through and stood breathless inside the walled garden. Pale green shoots of crocuses and snowdrops were pushing through the dark soil, waking beneath the warm spring sun after ten years of silent sleep.",
    "vocabulary": [
      {
        "word": "hinges",
        "definition": "Movable joints on which a door or gate swings open"
      },
      {
        "word": "shoots",
        "definition": "The first young green growth or sprouts rising from seeds"
      },
      {
        "word": "crocuses",
        "definition": "Small spring-flowering plants with cup-shaped purple, yellow, or white flowers"
      }
    ],
    "questions": [
      {
        "id": "sg-q10",
        "type": "vocabulary",
        "question": "Type the word meaning movable metal joints on which the door swings:",
        "hint": "Plural noun starting with h (6 letters)",
        "answer": "hinges",
        "acceptableAnswers": [
          "hinges"
        ],
        "explanation": "Hinges connect a door to its frame and allow it to pivot."
      },
      {
        "id": "sg-q11",
        "type": "retrieval",
        "question": "How many years had the garden been asleep?",
        "hint": "A decade in words or digits",
        "answer": "ten",
        "acceptableAnswers": [
          "ten",
          "10",
          "ten years"
        ],
        "explanation": "The text notes the garden had rested for ten years of silent sleep."
      },
      {
        "id": "sg-q12",
        "type": "inference",
        "question": "What season is arriving as the crocuses begin to awake?",
        "hint": "The time of budding flowers (6 letters)",
        "answer": "spring",
        "acceptableAnswers": [
          "spring",
          "springtime"
        ],
        "explanation": "The text references the warm spring sun awakening the bulbs."
      }
    ],
    "qaFollowup": {
      "question": "What plants were pushing through the soil inside the secret garden?",
      "answer": "Pale green shoots of crocuses and snowdrops.",
      "contextNote": "Despite years of neglect, nature kept living quietly within the enclosed sanctuary."
    }
  },
  {
    "id": "alice-wonderland-1",
    "bookId": "alice-wonderland",
    "partIndex": 1,
    "totalParts": 4,
    "title": "Alice's Adventures in Wonderland",
    "author": "Lewis Carroll",
    "year": 1865,
    "gutenbergId": 11,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/11",
    "chapter": "Chapter 1: Down the Rabbit-Hole",
    "difficulty": "Foundation",
    "tags": [
      "Fantasy",
      "Victorian",
      "Classic"
    ],
    "text": "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do. Once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice, 'without pictures or conversations?'",
    "vocabulary": [
      {
        "word": "peeped",
        "definition": "Looked quickly and furtively, often through a narrow opening"
      },
      {
        "word": "conversations",
        "definition": "Spoken dialogue or verbal exchanges between characters"
      },
      {
        "word": "bank",
        "definition": "The sloping land beside a body of water or grassy slope"
      }
    ],
    "questions": [
      {
        "id": "aw-q1",
        "type": "vocabulary",
        "question": "Find and type the verb that means glanced quickly or furtively into the book:",
        "hint": "Past tense, begins with 'p' (6 letters)",
        "answer": "peeped",
        "acceptableAnswers": [
          "peeped",
          "peep"
        ],
        "explanation": "'Peeped' means to take a quick, secret look, indicating Alice's restless curiosity."
      },
      {
        "id": "aw-q2",
        "type": "retrieval",
        "question": "Where was Alice sitting alongside her sister?",
        "hint": "Starts with 'b' (4 letters)",
        "answer": "bank",
        "acceptableAnswers": [
          "bank",
          "the bank",
          "on the bank"
        ],
        "explanation": "The text opens: 'Alice was beginning to get very tired of sitting by her sister on the bank'."
      },
      {
        "id": "aw-q3",
        "type": "inference",
        "question": "What two things does Alice believe every worthwhile storybook must include?",
        "hint": "Visuals and dialogue",
        "answer": "pictures or conversations",
        "acceptableAnswers": [
          "pictures and conversations",
          "pictures or conversations",
          "conversations and pictures"
        ],
        "explanation": "Alice wondered what the use of a book was without pictures or conversations."
      }
    ],
    "qaFollowup": {
      "question": "What did Alice believe was useless about her sister's book?",
      "answer": "It had no pictures or conversations in it.",
      "contextNote": "Lewis Carroll sets Alice's playful Victorian curiosity and impatience from the opening sentence."
    }
  },
  {
    "id": "alice-wonderland-2",
    "bookId": "alice-wonderland",
    "partIndex": 2,
    "totalParts": 4,
    "title": "Alice's Adventures in Wonderland",
    "author": "Lewis Carroll",
    "year": 1865,
    "gutenbergId": 11,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/11",
    "chapter": "Chapter 1: The Deep Rabbit Well",
    "difficulty": "Foundation",
    "tags": [
      "Fantasy",
      "Victorian",
      "Classic"
    ],
    "text": "The rabbit hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well. Either the well was very deep, or she fell very slowly, for she had plenty of time to look about her.",
    "vocabulary": [
      {
        "word": "tunnel",
        "definition": "An underground passage or roadway dug through earth"
      },
      {
        "word": "plenty",
        "definition": "A large or sufficient quantity or amount"
      },
      {
        "word": "dipped",
        "definition": "Sloped or sank downward suddenly"
      }
    ],
    "questions": [
      {
        "id": "aw-q4",
        "type": "retrieval",
        "question": "What did the rabbit hole resemble before it dipped down?",
        "hint": "An underground passage (6 letters)",
        "answer": "tunnel",
        "acceptableAnswers": [
          "tunnel",
          "a tunnel"
        ],
        "explanation": "The passage explains that the hole went straight on like a tunnel."
      },
      {
        "id": "aw-q5",
        "type": "vocabulary",
        "question": "Type the verb that describes the sudden downward slope of the rabbit hole:",
        "hint": "Starts with d (6 letters)",
        "answer": "dipped",
        "acceptableAnswers": [
          "dipped"
        ],
        "explanation": "The ground dipped suddenly down into the deep shaft."
      },
      {
        "id": "aw-q6",
        "type": "inference",
        "question": "How did Alice feel during the fall?",
        "hint": "Calm enough to look at surrounding objects",
        "answer": "calm",
        "acceptableAnswers": [
          "calm",
          "curious",
          "relaxed"
        ],
        "explanation": "Alice was falling so slowly she had plenty of time to look around her without panic."
      }
    ],
    "qaFollowup": {
      "question": "What gave Alice enough time to look about her as she descended?",
      "answer": "Either the well was very deep, or she fell very slowly.",
      "contextNote": "Carroll subverts physical gravity into a dreamlike drift where Alice can inspect cupboards on the walls."
    }
  },
  {
    "id": "alice-wonderland-3",
    "bookId": "alice-wonderland",
    "partIndex": 3,
    "totalParts": 4,
    "title": "Alice's Adventures in Wonderland",
    "author": "Lewis Carroll",
    "year": 1865,
    "gutenbergId": 11,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/11",
    "chapter": "Chapter 2: The Pool of Tears",
    "difficulty": "Foundation",
    "tags": [
      "Fantasy",
      "Victorian",
      "Classic"
    ],
    "text": "Suddenly she came upon a little three-legged table, all made of solid glass. There was nothing on it except a tiny golden key, and Alice thought it might belong to one of the doors of the hall. But, alas, either the locks were too large, or the key was too small, for it would not open any of them.",
    "vocabulary": [
      {
        "word": "solid",
        "definition": "Firm and stable in shape, not hollow or liquid"
      },
      {
        "word": "alas",
        "definition": "An expression of sorrow, disappointment, or regret"
      },
      {
        "word": "belong",
        "definition": "Be the proper property or fit for a specific place"
      }
    ],
    "questions": [
      {
        "id": "aw-q7",
        "type": "retrieval",
        "question": "What metal was the tiny key made of?",
        "hint": "A precious yellow metal (4 letters)",
        "answer": "golden",
        "acceptableAnswers": [
          "gold",
          "golden"
        ],
        "explanation": "The text specifies a tiny golden key."
      },
      {
        "id": "aw-q8",
        "type": "vocabulary",
        "question": "Find the archaic word of regret or disappointment used by the narrator:",
        "hint": "Starts with a (4 letters)",
        "answer": "alas",
        "acceptableAnswers": [
          "alas"
        ],
        "explanation": "Alas is an exclamation used to express sadness or disappointment."
      },
      {
        "id": "aw-q9",
        "type": "inference",
        "question": "How many legs did the little glass table possess?",
        "hint": "Number between two and four",
        "answer": "three",
        "acceptableAnswers": [
          "three",
          "3"
        ],
        "explanation": "The text notes a little three-legged table."
      }
    ],
    "qaFollowup": {
      "question": "What was resting on top of the three-legged glass table?",
      "answer": "A tiny golden key.",
      "contextNote": "The tiny key unlocked a low curtained door leading into a sunlit flower garden."
    }
  },
  {
    "id": "alice-wonderland-4",
    "bookId": "alice-wonderland",
    "partIndex": 4,
    "totalParts": 4,
    "title": "Alice's Adventures in Wonderland",
    "author": "Lewis Carroll",
    "year": 1865,
    "gutenbergId": 11,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/11",
    "chapter": "Chapter 7: A Mad Tea-Party",
    "difficulty": "Foundation",
    "tags": [
      "Fantasy",
      "Victorian",
      "Classic"
    ],
    "text": "There was a table set out under a tree in front of the house, and the March Hare and the Hatter were having tea at it. A Dormouse was sitting between them, fast asleep, and the other two were using it as a cushion, resting their elbows on it, and talking over its head. 'Very uncomfortable for the Dormouse,' thought Alice.",
    "vocabulary": [
      {
        "word": "cushion",
        "definition": "A soft bag of cloth stuffed with gentle material, used for sitting or resting"
      },
      {
        "word": "uncomfortable",
        "definition": "Causing physical discomfort or unease"
      },
      {
        "word": "dormouse",
        "definition": "A small rodent resembling a squirrel, famed for hibernating sleep"
      }
    ],
    "questions": [
      {
        "id": "aw-q10",
        "type": "retrieval",
        "question": "Which sleeping animal sat between the March Hare and Hatter?",
        "hint": "Starts with d (8 letters)",
        "answer": "dormouse",
        "acceptableAnswers": [
          "dormouse",
          "a dormouse",
          "the dormouse"
        ],
        "explanation": "The Dormouse sat between them, fast asleep."
      },
      {
        "id": "aw-q11",
        "type": "vocabulary",
        "question": "Type the noun meaning a soft pad used to rest elbows or sit upon:",
        "hint": "Starts with c (7 letters)",
        "answer": "cushion",
        "acceptableAnswers": [
          "cushion",
          "a cushion"
        ],
        "explanation": "They were using the sleeping dormouse as a cushion."
      },
      {
        "id": "aw-q12",
        "type": "inference",
        "question": "Where was the tea table situated?",
        "hint": "Under the shelter of branches",
        "answer": "under a tree",
        "acceptableAnswers": [
          "under a tree",
          "tree"
        ],
        "explanation": "The table was set out under a tree in front of the house."
      }
    ],
    "qaFollowup": {
      "question": "What was the Dormouse doing between the March Hare and the Hatter?",
      "answer": "Sitting between them, fast asleep.",
      "contextNote": "The tea party was trapped in eternal teatime because Time had quarreled with the Hatter."
    }
  },
  {
    "id": "treasure-island-1",
    "bookId": "treasure-island",
    "partIndex": 1,
    "totalParts": 4,
    "title": "Treasure Island",
    "author": "Robert Louis Stevenson",
    "year": 1883,
    "gutenbergId": 120,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/120",
    "chapter": "Chapter 1: The Old Sea-dog at the Admiral Benbow",
    "difficulty": "Standard",
    "tags": [
      "Adventure",
      "Pirates",
      "Sea"
    ],
    "text": "I remember him as if it were yesterday, as he came plodding to the inn door, his sea-chest following behind him in a hand-barrow. He was a tall, strong, heavy, nut-brown man, his tarry pigtail falling over the shoulder of his soiled blue coat, and his hands ragged and scarred, with black, broken nails.",
    "vocabulary": [
      {
        "word": "plodding",
        "definition": "Walking slowly with heavy, labored steps"
      },
      {
        "word": "tarry",
        "definition": "Covered with or smelling of dark tar used to waterproof ropes"
      },
      {
        "word": "barrow",
        "definition": "A small handcart with two wheels or legs for moving loads"
      }
    ],
    "questions": [
      {
        "id": "ti-q1",
        "type": "vocabulary",
        "question": "Type the verb that describes the heavy, slow walking pace of the seaman:",
        "hint": "Starts with p (8 letters)",
        "answer": "plodding",
        "acceptableAnswers": [
          "plodding"
        ],
        "explanation": "Plodding describes a trudging, heavy manner of walking."
      },
      {
        "id": "ti-q2",
        "type": "retrieval",
        "question": "What color was the old sailor coat?",
        "hint": "The shade of the ocean (4 letters)",
        "answer": "blue",
        "acceptableAnswers": [
          "blue",
          "soiled blue"
        ],
        "explanation": "The sailor wore a soiled blue coat."
      },
      {
        "id": "ti-q3",
        "type": "grammar",
        "question": "Type the adjective describing his braided hair treated with sailor waterproofing:",
        "hint": "Starts with t (5 letters)",
        "answer": "tarry",
        "acceptableAnswers": [
          "tarry"
        ],
        "explanation": "Tarry means treated or coated with tar."
      }
    ],
    "qaFollowup": {
      "question": "What distinguished the physical appearance of the old seaman who arrived at the inn?",
      "answer": "A tall, nut-brown man with a tarry pigtail and scarred hands.",
      "contextNote": "Stevenson introduces Billy Bones, whose arrival brings the secret map of Captain Flint's treasure."
    }
  },
  {
    "id": "treasure-island-2",
    "bookId": "treasure-island",
    "partIndex": 2,
    "totalParts": 4,
    "title": "Treasure Island",
    "author": "Robert Louis Stevenson",
    "year": 1883,
    "gutenbergId": 120,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/120",
    "chapter": "Chapter 3: The Black Spot",
    "difficulty": "Standard",
    "tags": [
      "Adventure",
      "Pirates",
      "Sea"
    ],
    "text": "About noon I was standing at the door for a moment, full of sad thoughts about my father, when I saw someone drawing slowly near along the road. He was plainly blind, for he tapped before him with a stick, and wore a great green visor over his eyes and squeaked as he walked along.",
    "vocabulary": [
      {
        "word": "plainly",
        "definition": "Clearly or visibly apparent to the eye"
      },
      {
        "word": "visor",
        "definition": "A stiff brim or screen worn to shade the eyes"
      },
      {
        "word": "tapped",
        "definition": "Struck gently against the ground to guide footing"
      }
    ],
    "questions": [
      {
        "id": "ti-q4",
        "type": "retrieval",
        "question": "What color was the visor worn by the blind stranger?",
        "hint": "The color of grass (5 letters)",
        "answer": "green",
        "acceptableAnswers": [
          "green",
          "great green"
        ],
        "explanation": "The text mentions a great green visor."
      },
      {
        "id": "ti-q5",
        "type": "vocabulary",
        "question": "Find the adverb that means clearly and obviously apparent:",
        "hint": "Starts with p (7 letters)",
        "answer": "plainly",
        "acceptableAnswers": [
          "plainly"
        ],
        "explanation": "Plainly means clearly or unmistakably."
      },
      {
        "id": "ti-q6",
        "type": "inference",
        "question": "What object did the stranger use to feel his path along the road?",
        "hint": "A wooden rod (5 letters)",
        "answer": "stick",
        "acceptableAnswers": [
          "stick",
          "a stick"
        ],
        "explanation": "He tapped before him with a stick to navigate."
      }
    ],
    "qaFollowup": {
      "question": "How did Jim Hawkins recognize that the approaching stranger was blind?",
      "answer": "He tapped before him with a stick and wore a great green visor over his eyes.",
      "contextNote": "This was Blind Pew, delivering the dread summons known to buccaneers as the Black Spot."
    }
  },
  {
    "id": "treasure-island-3",
    "bookId": "treasure-island",
    "partIndex": 3,
    "totalParts": 4,
    "title": "Treasure Island",
    "author": "Robert Louis Stevenson",
    "year": 1883,
    "gutenbergId": 120,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/120",
    "chapter": "Chapter 10: The Voyage",
    "difficulty": "Standard",
    "tags": [
      "Adventure",
      "Pirates",
      "Sea"
    ],
    "text": "The Hispaniola lay out in the harbour, her topmasts towering against the starry night sky. The ship was alive with sailors hauling at halyards and stowing barrels of salt beef and fresh water. Long John Silver stepped aboard with his crutch, whistling cheerful tunes as the anchor was weighed.",
    "vocabulary": [
      {
        "word": "halyards",
        "definition": "Ropes or tackles used to hoist and lower sails on a sailing vessel"
      },
      {
        "word": "stowing",
        "definition": "Packing or storing cargo securely in a ship hold"
      },
      {
        "word": "crutch",
        "definition": "A wooden support used as an aid in walking"
      }
    ],
    "questions": [
      {
        "id": "ti-q7",
        "type": "retrieval",
        "question": "What was the name of the schooner bound for the treasure island?",
        "hint": "Starts with H (10 letters)",
        "answer": "Hispaniola",
        "acceptableAnswers": [
          "Hispaniola",
          "The Hispaniola"
        ],
        "explanation": "The ship was named the Hispaniola."
      },
      {
        "id": "ti-q8",
        "type": "vocabulary",
        "question": "Type the nautical term for the ropes used to raise and lower the sails:",
        "hint": "Plural noun starting with h (8 letters)",
        "answer": "halyards",
        "acceptableAnswers": [
          "halyards"
        ],
        "explanation": "Halyards are lines used on sailing ships to hoist sails."
      },
      {
        "id": "ti-q9",
        "type": "inference",
        "question": "What mobility device did Long John Silver carry under his arm?",
        "hint": "Walking support for one leg (6 letters)",
        "answer": "crutch",
        "acceptableAnswers": [
          "crutch",
          "his crutch",
          "a crutch"
        ],
        "explanation": "Long John Silver had one leg and walked with a crutch."
      }
    ],
    "qaFollowup": {
      "question": "What ship was prepared in the harbour to sail toward Treasure Island?",
      "answer": "The Hispaniola.",
      "contextNote": "Long John Silver secured his position as ship cook while secretly recruiting mutinous pirates."
    }
  },
  {
    "id": "treasure-island-4",
    "bookId": "treasure-island",
    "partIndex": 4,
    "totalParts": 4,
    "title": "Treasure Island",
    "author": "Robert Louis Stevenson",
    "year": 1883,
    "gutenbergId": 120,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/120",
    "chapter": "Chapter 13: How My Shore Adventure Began",
    "difficulty": "Standard",
    "tags": [
      "Adventure",
      "Pirates",
      "Sea"
    ],
    "text": "The appearance of the island when I came on deck was entirely changed. The anchorage where we lay was landlocked on all sides, surrounded by thick woods of dark pines and live oaks. High wild peaks of grey rock rose above the treetops into the golden morning sunlight.",
    "vocabulary": [
      {
        "word": "anchorage",
        "definition": "An area that is suitable for a ship to anchor safely"
      },
      {
        "word": "landlocked",
        "definition": "Enclosed or nearly surrounded by land"
      },
      {
        "word": "peaks",
        "definition": "The pointed tops of mountains or high hills"
      }
    ],
    "questions": [
      {
        "id": "ti-q10",
        "type": "vocabulary",
        "question": "Type the word meaning completely enclosed or shielded by land:",
        "hint": "Compound adjective starting with l (10 letters)",
        "answer": "landlocked",
        "acceptableAnswers": [
          "landlocked"
        ],
        "explanation": "Landlocked indicates the harbour was sheltered by surrounding land."
      },
      {
        "id": "ti-q11",
        "type": "retrieval",
        "question": "What kind of trees formed the thick woods around the shore?",
        "hint": "Pines and...",
        "answer": "pines and live oaks",
        "acceptableAnswers": [
          "pines and live oaks",
          "pines",
          "oaks"
        ],
        "explanation": "The passage notes thick woods of dark pines and live oaks."
      },
      {
        "id": "ti-q12",
        "type": "inference",
        "question": "What color was the morning sunlight striking the mountaintops?",
        "hint": "The hue of ripe wheat or gold (6 letters)",
        "answer": "golden",
        "acceptableAnswers": [
          "golden",
          "gold"
        ],
        "explanation": "The text mentions the golden morning sunlight."
      }
    ],
    "qaFollowup": {
      "question": "What surrounded the landlocked anchorage where the ship came to rest?",
      "answer": "Thick woods of dark pines and live oaks beneath grey rock peaks.",
      "contextNote": "The island appeared brooding and untamed as the crew prepared to venture ashore."
    }
  },
  {
    "id": "wind-in-the-willows-1",
    "bookId": "wind-in-the-willows",
    "partIndex": 1,
    "totalParts": 4,
    "title": "The Wind in the Willows",
    "author": "Kenneth Grahame",
    "year": 1908,
    "gutenbergId": 289,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/289",
    "chapter": "Chapter 1: The River Bank",
    "difficulty": "Foundation",
    "tags": [
      "Nature",
      "Friendship",
      "Classic"
    ],
    "text": "The Mole had been working very hard all the morning, spring-cleaning his little home. First with brooms, then with dusters, then on ladders with a brush and a pail of whitewash, till he had dust in his throat and eyes, and splashes of whitewash all over his black fur, and an aching back.",
    "vocabulary": [
      {
        "word": "whitewash",
        "definition": "A cheap paint made from lime and water used for coating walls"
      },
      {
        "word": "dusters",
        "definition": "Cloths or brushes used to wipe dust from domestic surfaces"
      },
      {
        "word": "aching",
        "definition": "Suffering a steady, dull, persistent soreness or pain"
      }
    ],
    "questions": [
      {
        "id": "ww-q1",
        "type": "vocabulary",
        "question": "Find and type the liquid mixture of lime and water used to paint the walls:",
        "hint": "Compound noun starting with w (9 letters)",
        "answer": "whitewash",
        "acceptableAnswers": [
          "whitewash"
        ],
        "explanation": "Whitewash is a simple white lime coating used on country walls."
      },
      {
        "id": "ww-q2",
        "type": "retrieval",
        "question": "What color was the natural fur of the Mole beneath the whitewash?",
        "hint": "The shade of midnight (5 letters)",
        "answer": "black",
        "acceptableAnswers": [
          "black",
          "black fur"
        ],
        "explanation": "The passage mentions splashes of whitewash all over his black fur."
      },
      {
        "id": "ww-q3",
        "type": "inference",
        "question": "Why did the Mole decide to throw his brushes down and bolt outside?",
        "hint": "Tiredness and the call of spring air",
        "answer": "spring",
        "acceptableAnswers": [
          "spring",
          "springtime",
          "exhaustion"
        ],
        "explanation": "Mole was exhausted by the dust and lured away by the spring air outside."
      }
    ],
    "qaFollowup": {
      "question": "What domestic chore had Mole been laboring over all morning?",
      "answer": "Spring-cleaning his little home with brooms and whitewash.",
      "contextNote": "Kenneth Grahame paints Mole's exhausted domestic cleaning before his joyous breakout to the river."
    }
  },
  {
    "id": "wind-in-the-willows-2",
    "bookId": "wind-in-the-willows",
    "partIndex": 2,
    "totalParts": 4,
    "title": "The Wind in the Willows",
    "author": "Kenneth Grahame",
    "year": 1908,
    "gutenbergId": 289,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/289",
    "chapter": "Chapter 1: Meeting Ratty and the Boat",
    "difficulty": "Foundation",
    "tags": [
      "Nature",
      "Friendship",
      "Classic"
    ],
    "text": "'Believe me, my young friend, there is nothing, absolutely nothing, half so much worth doing as simply messing about in boats,' said the Water Rat dreamily. 'Simply messing, messing about in boats, or with boats. In or out of them it doesn't matter. Nothing seems really to matter, that's the charm of it.'",
    "vocabulary": [
      {
        "word": "dreamily",
        "definition": "In a pleasantly soothing, absorbed, or reflective manner"
      },
      {
        "word": "charm",
        "definition": "A delightful quality that attracts and fascinates someone"
      },
      {
        "word": "messing",
        "definition": "Engaging casually and happily in light leisure activities"
      }
    ],
    "questions": [
      {
        "id": "ww-q4",
        "type": "retrieval",
        "question": "Which river animal praised the simple joy of messing about in boats?",
        "hint": "The Water...",
        "answer": "Water Rat",
        "acceptableAnswers": [
          "Water Rat",
          "Ratty",
          "Rat"
        ],
        "explanation": "The Water Rat welcomed Mole aboard his little rowing boat."
      },
      {
        "id": "ww-q5",
        "type": "vocabulary",
        "question": "Find the adverb that describes how the Water Rat spoke his philosophical thoughts:",
        "hint": "Starts with d (8 letters)",
        "answer": "dreamily",
        "acceptableAnswers": [
          "dreamily"
        ],
        "explanation": "He spoke in a thoughtful, dreamy manner."
      },
      {
        "id": "ww-q6",
        "type": "inference",
        "question": "What did the Water Rat believe made boating so uniquely charming?",
        "hint": "Nothing else seems to matter",
        "answer": "nothing seems to matter",
        "acceptableAnswers": [
          "nothing matters",
          "nothing seems really to matter",
          "freedom"
        ],
        "explanation": "Ratty explains that nothing seems really to matter when you are on the water."
      }
    ],
    "qaFollowup": {
      "question": "According to the Water Rat, what was the most worthwhile thing in the whole world?",
      "answer": "Simply messing about in boats.",
      "contextNote": "This famous line embodies the leisurely, poetic spirit of Kenneth Grahame river world."
    }
  },
  {
    "id": "wind-in-the-willows-3",
    "bookId": "wind-in-the-willows",
    "partIndex": 3,
    "totalParts": 4,
    "title": "The Wind in the Willows",
    "author": "Kenneth Grahame",
    "year": 1908,
    "gutenbergId": 289,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/289",
    "chapter": "Chapter 2: The Open Road",
    "difficulty": "Foundation",
    "tags": [
      "Nature",
      "Friendship",
      "Classic"
    ],
    "text": "Mr. Toad of Toad Hall stood proudly beside a brand-new gypsy caravan, painted canary-yellow picked out with green. Inside were little bunks, a little stove, bookshelves, and baskets of delicious provisions. Toad waved his paws and cried that the open road was the only life for gentlemen of spirit.",
    "vocabulary": [
      {
        "word": "caravan",
        "definition": "A vehicle equipped for living in, typically towed by a horse or car"
      },
      {
        "word": "provisions",
        "definition": "Supplies of food, drink, and other necessities for a journey"
      },
      {
        "word": "bunks",
        "definition": "Narrow beds built like shelves against the wall of a cabin or caravan"
      }
    ],
    "questions": [
      {
        "id": "ww-q7",
        "type": "retrieval",
        "question": "What vibrant shade of yellow was Toad caravan painted?",
        "hint": "Named after a songbird (6 letters)",
        "answer": "canary",
        "acceptableAnswers": [
          "canary",
          "canary-yellow",
          "yellow"
        ],
        "explanation": "The caravan was painted canary-yellow."
      },
      {
        "id": "ww-q8",
        "type": "vocabulary",
        "question": "Type the word meaning supplies of food and drink for an excursion:",
        "hint": "Plural noun starting with p (10 letters)",
        "answer": "provisions",
        "acceptableAnswers": [
          "provisions"
        ],
        "explanation": "Provisions refers to foodstuffs and travel rations."
      },
      {
        "id": "ww-q9",
        "type": "inference",
        "question": "Where did Toad live when he was not on the road?",
        "hint": "An ancestral manor house named after him",
        "answer": "Toad Hall",
        "acceptableAnswers": [
          "Toad Hall"
        ],
        "explanation": "Mr. Toad was the wealthy owner of magnificent Toad Hall."
      }
    ],
    "qaFollowup": {
      "question": "What color was Mr. Toad newly purchased travelling caravan?",
      "answer": "Canary-yellow picked out with green.",
      "contextNote": "Toad's passionate fads constantly dragged his loyal friends into hilarious misadventures."
    }
  },
  {
    "id": "wind-in-the-willows-4",
    "bookId": "wind-in-the-willows",
    "partIndex": 4,
    "totalParts": 4,
    "title": "The Wind in the Willows",
    "author": "Kenneth Grahame",
    "year": 1908,
    "gutenbergId": 289,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/289",
    "chapter": "Chapter 3: Badger Hearth in the Wild Wood",
    "difficulty": "Foundation",
    "tags": [
      "Nature",
      "Friendship",
      "Classic"
    ],
    "text": "The kindly Badger ushered the shivering Mole and Rat inside his cavernous kitchen. A great log fire crackled on the hearth, casting long red shadows across the stone floor. Bowls of steaming porridge and toasted cheese were set before them, banishing the chill of the snowy winter forest outside.",
    "vocabulary": [
      {
        "word": "cavernous",
        "definition": "Vast, deep, and spacious like a large cavern or cave"
      },
      {
        "word": "ushered",
        "definition": "Guided or conducted someone courteously into a room"
      },
      {
        "word": "banishing",
        "definition": "Driving away or completely getting rid of an unpleasant feeling"
      }
    ],
    "questions": [
      {
        "id": "ww-q10",
        "type": "vocabulary",
        "question": "Find the adjective meaning vast and spacious like an expansive cavern:",
        "hint": "Starts with c (9 letters)",
        "answer": "cavernous",
        "acceptableAnswers": [
          "cavernous"
        ],
        "explanation": "Cavernous describes an immense, echoing room."
      },
      {
        "id": "ww-q11",
        "type": "retrieval",
        "question": "What crackled on the hearth to warm the shivering animals?",
        "hint": "Starts with l (8 letters)",
        "answer": "log fire",
        "acceptableAnswers": [
          "log fire",
          "fire",
          "a log fire"
        ],
        "explanation": "A great log fire was roaring on the hearth."
      },
      {
        "id": "ww-q12",
        "type": "inference",
        "question": "What weather were Mole and Rat fleeing from in the Wild Wood?",
        "hint": "Frozen winter precipitation",
        "answer": "snow",
        "acceptableAnswers": [
          "snow",
          "snowstorm",
          "winter snowy"
        ],
        "explanation": "They sought shelter from the snowy winter forest outside."
      }
    ],
    "qaFollowup": {
      "question": "What warm meal did Badger prepare for his guests beside the log fire?",
      "answer": "Bowls of steaming porridge and toasted cheese.",
      "contextNote": "Badger underground home represents security and warm hospitality amidst the perilous Wild Wood."
    }
  },
  {
    "id": "sherlock-holmes-1",
    "bookId": "sherlock-holmes",
    "partIndex": 1,
    "totalParts": 4,
    "title": "The Adventures of Sherlock Holmes",
    "author": "Arthur Conan Doyle",
    "year": 1892,
    "gutenbergId": 1661,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/1661",
    "chapter": "A Scandal in Bohemia: Part 1",
    "difficulty": "Advanced",
    "tags": [
      "Detective",
      "Mystery",
      "Victorian"
    ],
    "text": "To Sherlock Holmes she is always The Woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler, but his cold, precise, and admirably balanced mind revered her sharp intellect.",
    "vocabulary": [
      {
        "word": "eclipses",
        "definition": "Surpasses or outshines all others in prominence"
      },
      {
        "word": "predominates",
        "definition": "Be the strongest or main element in authority or influence"
      },
      {
        "word": "akin",
        "definition": "Of similar character or related in quality"
      }
    ],
    "questions": [
      {
        "id": "sh-q1",
        "type": "retrieval",
        "question": "What celebrated title did Holmes bestow upon Irene Adler?",
        "hint": "Two words starting with T and W",
        "answer": "The Woman",
        "acceptableAnswers": [
          "The Woman",
          "the woman"
        ],
        "explanation": "Watson notes: To Sherlock Holmes she is always The Woman."
      },
      {
        "id": "sh-q2",
        "type": "vocabulary",
        "question": "Find the verb that means outshines or casts into shade by superior brilliance:",
        "hint": "Starts with e (8 letters)",
        "answer": "eclipses",
        "acceptableAnswers": [
          "eclipses"
        ],
        "explanation": "To eclipse means to surpass in influence or talent."
      },
      {
        "id": "sh-q3",
        "type": "inference",
        "question": "Did Holmes hold romantic love for Irene Adler?",
        "hint": "No, he held respect for her mind",
        "answer": "no",
        "acceptableAnswers": [
          "no",
          "false"
        ],
        "explanation": "The passage explicitly clarifies it was not love, but admiration of her intellect."
      }
    ],
    "qaFollowup": {
      "question": "How did Sherlock Holmes refer to the remarkable Irene Adler?",
      "answer": "He always referred to her as The Woman.",
      "contextNote": "Arthur Conan Doyle establishes Irene Adler as the sole adversary who completely outwitted Holmes."
    }
  },
  {
    "id": "sherlock-holmes-2",
    "bookId": "sherlock-holmes",
    "partIndex": 2,
    "totalParts": 4,
    "title": "The Adventures of Sherlock Holmes",
    "author": "Arthur Conan Doyle",
    "year": 1892,
    "gutenbergId": 1661,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/1661",
    "chapter": "A Scandal in Bohemia: Part 2",
    "difficulty": "Advanced",
    "tags": [
      "Detective",
      "Mystery",
      "Victorian"
    ],
    "text": "Holmes entered the Baker Street sitting-room disguised as an elderly, amiable clergyman. His broad black hat, baggy trousers, and sympathetic smile were so convincing that even I failed to recognize him until he chuckled and pulled a hidden cabinet plan from his clerical vest.",
    "vocabulary": [
      {
        "word": "amiable",
        "definition": "Having or displaying a friendly, pleasant, and good-natured manner"
      },
      {
        "word": "clergyman",
        "definition": "An ordained male Christian priest or minister"
      },
      {
        "word": "clerical",
        "definition": "Relating to church ministers or clergy members"
      }
    ],
    "questions": [
      {
        "id": "sh-q4",
        "type": "retrieval",
        "question": "What disguise did Holmes wear into the room?",
        "hint": "A church minister (10 letters)",
        "answer": "clergyman",
        "acceptableAnswers": [
          "clergyman",
          "an elderly clergyman",
          "minister"
        ],
        "explanation": "Holmes disguised himself as an amiable clergyman."
      },
      {
        "id": "sh-q5",
        "type": "vocabulary",
        "question": "Find the adjective meaning warm, friendly, and good-humoured:",
        "hint": "Starts with a (7 letters)",
        "answer": "amiable",
        "acceptableAnswers": [
          "amiable"
        ],
        "explanation": "Amiable describes a pleasant and friendly disposition."
      },
      {
        "id": "sh-q6",
        "type": "inference",
        "question": "Who was narrator observing Holmes transformation in Baker Street?",
        "hint": "His trusted companion and biographer",
        "answer": "Watson",
        "acceptableAnswers": [
          "Watson",
          "Dr. Watson",
          "Doctor Watson"
        ],
        "explanation": "Doctor John Watson is the narrator recounting Holmes disguise."
      }
    ],
    "qaFollowup": {
      "question": "What disguise did Holmes adopt to gain entrance to Irene Adler house?",
      "answer": "An elderly, amiable clergyman in a broad black hat.",
      "contextNote": "Holmes was a master of theatrical disguises to inspect crime scenes unobserved."
    }
  },
  {
    "id": "sherlock-holmes-3",
    "bookId": "sherlock-holmes",
    "partIndex": 3,
    "totalParts": 4,
    "title": "The Adventures of Sherlock Holmes",
    "author": "Arthur Conan Doyle",
    "year": 1892,
    "gutenbergId": 1661,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/1661",
    "chapter": "The Red-Headed League: Part 1",
    "difficulty": "Advanced",
    "tags": [
      "Detective",
      "Mystery",
      "Victorian"
    ],
    "text": "Mr. Jabez Wilson was a stout, florid-faced, elderly gentleman with fiery red hair. He laid before us a copy of the Morning Chronicle offering a curious post in the Red-Headed League. All red-headed men who were sound in body and mind were invited to apply for four pounds a week for nominal office duties.",
    "vocabulary": [
      {
        "word": "florid",
        "definition": "Having a red or flushed complexion"
      },
      {
        "word": "nominal",
        "definition": "Existing in name only, involving very little real work"
      },
      {
        "word": "stout",
        "definition": "Somewhat fat, heavily built, or sturdy"
      }
    ],
    "questions": [
      {
        "id": "sh-q7",
        "type": "vocabulary",
        "question": "Type the adjective describing a flushed, healthy reddish complexion:",
        "hint": "Starts with f (6 letters)",
        "answer": "florid",
        "acceptableAnswers": [
          "florid"
        ],
        "explanation": "Florid means having a ruddy or flushed red appearance."
      },
      {
        "id": "sh-q8",
        "type": "retrieval",
        "question": "How much money per week was promised for the nominal duties?",
        "hint": "Four...",
        "answer": "four pounds",
        "acceptableAnswers": [
          "four pounds",
          "4 pounds",
          "four pounds a week"
        ],
        "explanation": "The advertisement promised four pounds a week."
      },
      {
        "id": "sh-q9",
        "type": "inference",
        "question": "What color was Mr. Wilson hair?",
        "hint": "The flame hue (3 letters)",
        "answer": "red",
        "acceptableAnswers": [
          "red",
          "fiery red"
        ],
        "explanation": "He had fiery red hair which qualified him for the bizarre league."
      }
    ],
    "qaFollowup": {
      "question": "What unique physical trait qualified applicants for the Red-Headed League?",
      "answer": "Real, fiery red hair and sound mind.",
      "contextNote": "The league was a brilliant ruse concocted by criminal John Clay to dig a bank tunnel."
    }
  },
  {
    "id": "sherlock-holmes-4",
    "bookId": "sherlock-holmes",
    "partIndex": 4,
    "totalParts": 4,
    "title": "The Adventures of Sherlock Holmes",
    "author": "Arthur Conan Doyle",
    "year": 1892,
    "gutenbergId": 1661,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/1661",
    "chapter": "The Blue Carbuncle: Part 1",
    "difficulty": "Advanced",
    "tags": [
      "Detective",
      "Mystery",
      "Victorian"
    ],
    "text": "Holmes plucked a tattered black bowler hat from the sofa and placed it upon his magnifying table. A commissionaire had found it on Christmas morning alongside a fine fat goose. Within the crop of that Christmas bird lay the Countess of Morcar blue carbuncle, a jewel of incalculable value and sinister fame.",
    "vocabulary": [
      {
        "word": "carbuncle",
        "definition": "A bright, fiery red or deep blue precious gemstone"
      },
      {
        "word": "incalculable",
        "definition": "Too great or enormous to be calculated or estimated"
      },
      {
        "word": "commissionaire",
        "definition": "An uniformed attendant or door-keeper at an establishment"
      }
    ],
    "questions": [
      {
        "id": "sh-q10",
        "type": "retrieval",
        "question": "What Christmas poultry contained the lost gemstone?",
        "hint": "A large waterfowl bird (5 letters)",
        "answer": "goose",
        "acceptableAnswers": [
          "goose",
          "a goose",
          "fat goose"
        ],
        "explanation": "The jewel was discovered inside a Christmas goose."
      },
      {
        "id": "sh-q11",
        "type": "vocabulary",
        "question": "Type the rare noun meaning a brilliant cut gemstone or jewel:",
        "hint": "Starts with c (9 letters)",
        "answer": "carbuncle",
        "acceptableAnswers": [
          "carbuncle"
        ],
        "explanation": "A carbuncle is a precious jewel or gemstone."
      },
      {
        "id": "sh-q12",
        "type": "inference",
        "question": "On what festive holiday morning was the hat and goose recovered?",
        "hint": "December 25th celebration",
        "answer": "Christmas",
        "acceptableAnswers": [
          "Christmas",
          "Christmas morning"
        ],
        "explanation": "The commissionaire discovered both items on Christmas morning."
      }
    ],
    "qaFollowup": {
      "question": "Where was the stolen blue carbuncle discovered on Christmas morning?",
      "answer": "Inside the crop of a fine fat goose.",
      "contextNote": "Holmes solved the holiday theft using razor-sharp inductive deduction from a worn felt hat."
    }
  },
  {
    "id": "peter-and-wendy-1",
    "bookId": "peter-and-wendy",
    "partIndex": 1,
    "totalParts": 3,
    "title": "Peter and Wendy",
    "author": "J.M. Barrie",
    "year": 1911,
    "gutenbergId": 16,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/16",
    "chapter": "Chapter 1: Peter Breaks Through",
    "difficulty": "Foundation",
    "tags": [
      "Fantasy",
      "Childhood",
      "Adventure"
    ],
    "text": "All children, except one, grow up. They soon know that they will grow up, and the way Wendy knew was this. One day when she was two years old she was playing in a garden, and she plucked another flower and ran with it to her mother. I suppose she must have looked rather delightful, for Mrs. Darling put her hand to her heart.",
    "vocabulary": [
      {
        "word": "plucked",
        "definition": "Quickly or gently pulled something from its place with the fingers"
      },
      {
        "word": "delightful",
        "definition": "Causing great pleasure, charm, or happiness"
      },
      {
        "word": "suppose",
        "definition": "Assume that something is the case on the basis of probability"
      }
    ],
    "questions": [
      {
        "id": "pw-q1",
        "type": "retrieval",
        "question": "How old was Wendy when she brought the plucked flower to her mother?",
        "hint": "A toddler age in words or digit",
        "answer": "two",
        "acceptableAnswers": [
          "two",
          "2",
          "two years old"
        ],
        "explanation": "Wendy was two years old."
      },
      {
        "id": "pw-q2",
        "type": "vocabulary",
        "question": "Find the verb meaning picked or removed a blossom from its stem:",
        "hint": "Starts with p (7 letters)",
        "answer": "plucked",
        "acceptableAnswers": [
          "plucked"
        ],
        "explanation": "To pluck means to pull or pick a flower."
      },
      {
        "id": "pw-q3",
        "type": "inference",
        "question": "Where was Mrs. Darling when she placed her hand over her heart?",
        "hint": "At home observing her daughter",
        "answer": "garden",
        "acceptableAnswers": [
          "garden",
          "in a garden"
        ],
        "explanation": "She saw Wendy playing in the garden."
      }
    ],
    "qaFollowup": {
      "question": "According to the famous opening, who is the only child that never grows up?",
      "answer": "Peter Pan.",
      "contextNote": "J.M. Barrie opens with the melancholic certainty that all mortal children grow older."
    }
  },
  {
    "id": "peter-and-wendy-2",
    "bookId": "peter-and-wendy",
    "partIndex": 2,
    "totalParts": 3,
    "title": "Peter and Wendy",
    "author": "J.M. Barrie",
    "year": 1911,
    "gutenbergId": 16,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/16",
    "chapter": "Chapter 3: Come Away, Come Away!",
    "difficulty": "Foundation",
    "tags": [
      "Fantasy",
      "Childhood",
      "Adventure"
    ],
    "text": "Peter blew fairy dust on Wendy, John, and Michael, and told them to think lovely thoughts. Up they rose into the air, hovering above their little beds. With a joyous laugh, Peter flew out through the open nursery window into the starry London night, heading second to the right and straight on till morning.",
    "vocabulary": [
      {
        "word": "hovering",
        "definition": "Remaining suspended in the air in one place"
      },
      {
        "word": "nursery",
        "definition": "A room in a house designated for the special use of young children"
      },
      {
        "word": "joyous",
        "definition": "Full of or characterized by supreme happiness and delight"
      }
    ],
    "questions": [
      {
        "id": "pw-q4",
        "type": "retrieval",
        "question": "What magical substance did Peter blow on the children to help them fly?",
        "hint": "Starts with f (10 letters)",
        "answer": "fairy dust",
        "acceptableAnswers": [
          "fairy dust",
          "dust"
        ],
        "explanation": "Fairy dust enabled the children to ascend into the air."
      },
      {
        "id": "pw-q5",
        "type": "vocabulary",
        "question": "Type the verb that describes floating quietly suspended in the air:",
        "hint": "Starts with h (8 letters)",
        "answer": "hovering",
        "acceptableAnswers": [
          "hovering"
        ],
        "explanation": "Hovering means floating mid-air without falling."
      },
      {
        "id": "pw-q6",
        "type": "inference",
        "question": "Through what opening did the children fly out of their house?",
        "hint": "Glass casement opening",
        "answer": "window",
        "acceptableAnswers": [
          "window",
          "nursery window",
          "the window"
        ],
        "explanation": "They flew out through the open nursery window."
      }
    ],
    "qaFollowup": {
      "question": "What navigation coordinates did Peter give to reach Neverland?",
      "answer": "Second to the right and straight on till morning.",
      "contextNote": "Fairy dust and happy thoughts enabled the children to take flight across the rooftops."
    }
  },
  {
    "id": "peter-and-wendy-3",
    "bookId": "peter-and-wendy",
    "partIndex": 3,
    "totalParts": 3,
    "title": "Peter and Wendy",
    "author": "J.M. Barrie",
    "year": 1911,
    "gutenbergId": 16,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/16",
    "chapter": "Chapter 5: The Island Come True",
    "difficulty": "Foundation",
    "tags": [
      "Fantasy",
      "Childhood",
      "Adventure"
    ],
    "text": "The pirate ship Jolly Roger lay anchored in the bay, flying the skull and crossbones. On the quarterdeck stood Captain Hook, his black curls falling about his pale face. In place of his right hand, a cruel iron hook glinted in the sunlight, waiting for the tick of the great crocodile.",
    "vocabulary": [
      {
        "word": "quarterdeck",
        "definition": "The part of a ship upper deck near the stern, reserved for officers"
      },
      {
        "word": "glinted",
        "definition": "Gave out or reflected small flashes of bright light"
      },
      {
        "word": "anchored",
        "definition": "Secured firmly to the sea floor with a heavy mooring weight"
      }
    ],
    "questions": [
      {
        "id": "pw-q7",
        "type": "retrieval",
        "question": "What was the name of Captain Hook pirate galleon?",
        "hint": "Starts with J and R",
        "answer": "Jolly Roger",
        "acceptableAnswers": [
          "Jolly Roger",
          "The Jolly Roger"
        ],
        "explanation": "The pirate ship was named the Jolly Roger."
      },
      {
        "id": "pw-q8",
        "type": "vocabulary",
        "question": "Find the verb that means reflected small bright flashes of light:",
        "hint": "Starts with g (7 letters)",
        "answer": "glinted",
        "acceptableAnswers": [
          "glinted"
        ],
        "explanation": "The iron hook glinted brightly in the sun."
      },
      {
        "id": "pw-q9",
        "type": "inference",
        "question": "What beast ticking made Captain Hook tremble in terror?",
        "hint": "A river reptile with sharp teeth",
        "answer": "crocodile",
        "acceptableAnswers": [
          "crocodile",
          "the crocodile"
        ],
        "explanation": "The great crocodile had swallowed a clock and pursued Hook."
      }
    ],
    "qaFollowup": {
      "question": "What weapon replaced Captain Hook right hand on the quarterdeck?",
      "answer": "A cruel iron hook.",
      "contextNote": "Hook mortal fear was the clock ticking inside the crocodile that had tasted his arm."
    }
  },
  {
    "id": "christmas-carol-1",
    "bookId": "christmas-carol",
    "partIndex": 1,
    "totalParts": 3,
    "title": "A Christmas Carol",
    "author": "Charles Dickens",
    "year": 1843,
    "gutenbergId": 46,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/46",
    "chapter": "Stave 1: Marley Ghost",
    "difficulty": "Standard",
    "tags": [
      "Victorian",
      "Classic",
      "Redemption"
    ],
    "text": "Marley was dead, to begin with. There is no doubt whatever about that. The register of his burial was signed by the clergyman, the clerk, the undertaker, and the chief mourner. Scrooge signed it, and Scrooge name was good upon Change, for anything he chose to put his hand to. Old Marley was as dead as a door-nail.",
    "vocabulary": [
      {
        "word": "undertaker",
        "definition": "A person whose profession is the preparation and management of funerals"
      },
      {
        "word": "register",
        "definition": "An official list or record of vital events kept by authority"
      },
      {
        "word": "mourner",
        "definition": "A person who attends a funeral to express sorrow for the deceased"
      }
    ],
    "questions": [
      {
        "id": "cc-q1",
        "type": "retrieval",
        "question": "What everyday household hardware is Marley compared to in death?",
        "hint": "Fastener on an entrance",
        "answer": "door-nail",
        "acceptableAnswers": [
          "door-nail",
          "doornail",
          "a door-nail"
        ],
        "explanation": "Dickens uses the famous idiom: as dead as a door-nail."
      },
      {
        "id": "cc-q2",
        "type": "vocabulary",
        "question": "Type the title of the official who prepares funerals and burials:",
        "hint": "Starts with u (10 letters)",
        "answer": "undertaker",
        "acceptableAnswers": [
          "undertaker",
          "the undertaker"
        ],
        "explanation": "An undertaker manages burial arrangements."
      },
      {
        "id": "cc-q3",
        "type": "inference",
        "question": "Was Scrooge signature respected in financial and business circles?",
        "hint": "Yes, good upon Change",
        "answer": "yes",
        "acceptableAnswers": [
          "yes",
          "true"
        ],
        "explanation": "Scrooge name was respected upon the Royal Exchange for any credit or contract."
      }
    ],
    "qaFollowup": {
      "question": "What proverbial saying does Dickens use to confirm Marley demise?",
      "answer": "Old Marley was as dead as a door-nail.",
      "contextNote": "Dickens insists on Marley death so his spectral visitation carries supernatural weight."
    }
  },
  {
    "id": "christmas-carol-2",
    "bookId": "christmas-carol",
    "partIndex": 2,
    "totalParts": 3,
    "title": "A Christmas Carol",
    "author": "Charles Dickens",
    "year": 1843,
    "gutenbergId": 46,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/46",
    "chapter": "Stave 2: The First of the Three Spirits",
    "difficulty": "Standard",
    "tags": [
      "Victorian",
      "Classic",
      "Redemption"
    ],
    "text": "The curtains of his bed were drawn aside by a strange figure like a child, yet not so like a child as like an old man. Its hair, which hung about its neck and down its back, was white as if with age, and yet the face had not a wrinkle in it. From the crown of its head there sprung a bright clear jet of light.",
    "vocabulary": [
      {
        "word": "figure",
        "definition": "The shape, form, or outline of a person or supernatural presence"
      },
      {
        "word": "crown",
        "definition": "The highest point or top part of the human head"
      },
      {
        "word": "wrinkle",
        "definition": "A small crease or ridge in the skin caused by age"
      }
    ],
    "questions": [
      {
        "id": "cc-q4",
        "type": "retrieval",
        "question": "What color was the long hair of the first Christmas spirit?",
        "hint": "The shade of fresh snow (5 letters)",
        "answer": "white",
        "acceptableAnswers": [
          "white",
          "white as age"
        ],
        "explanation": "Its hair was white as if with age."
      },
      {
        "id": "cc-q5",
        "type": "vocabulary",
        "question": "Find the anatomical term meaning the very top crest of the head:",
        "hint": "Starts with c (5 letters)",
        "answer": "crown",
        "acceptableAnswers": [
          "crown",
          "the crown"
        ],
        "explanation": "Crown refers to the uppermost part of the skull."
      },
      {
        "id": "cc-q6",
        "type": "inference",
        "question": "Did the glowing spirit face appear elderly or uncreased?",
        "hint": "Smooth without wrinkles",
        "answer": "uncreased",
        "acceptableAnswers": [
          "uncreased",
          "smooth",
          "no wrinkles",
          "not a wrinkle"
        ],
        "explanation": "The face had not a single wrinkle in it despite white hair."
      }
    ],
    "qaFollowup": {
      "question": "What shone from the crown of the head of the first spirit?",
      "answer": "A bright clear jet of light.",
      "contextNote": "The Ghost of Christmas Past carried an extinguisher cap to shade its illuminating truth."
    }
  },
  {
    "id": "christmas-carol-3",
    "bookId": "christmas-carol",
    "partIndex": 3,
    "totalParts": 3,
    "title": "A Christmas Carol",
    "author": "Charles Dickens",
    "year": 1843,
    "gutenbergId": 46,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/46",
    "chapter": "Stave 5: The End of It",
    "difficulty": "Standard",
    "tags": [
      "Victorian",
      "Classic",
      "Redemption"
    ],
    "text": "'I will live in the Past, the Present, and the Future!' Scrooge repeated, as he scrambled out of bed. 'The Spirits of all Three shall strive within me. Oh Jacob Marley, heaven and the Christmas Time be praised for this! I say it on my knees, old Jacob, on my knees!' He was laughing and crying in the same breath.",
    "vocabulary": [
      {
        "word": "scrambled",
        "definition": "Moved or climbed hurriedly and clumsily on hands and feet"
      },
      {
        "word": "strive",
        "definition": "Make great efforts or struggle vigorously to achieve something"
      },
      {
        "word": "praised",
        "definition": "Expressed warm approval, gratitude, or admiration for blessings"
      }
    ],
    "questions": [
      {
        "id": "cc-q7",
        "type": "retrieval",
        "question": "Whom did Scrooge thank on his knees as he scrambled out of bed?",
        "hint": "His deceased partner Jacob...",
        "answer": "Jacob Marley",
        "acceptableAnswers": [
          "Jacob Marley",
          "Marley",
          "Jacob"
        ],
        "explanation": "He cried: Oh Jacob Marley, heaven and the Christmas Time be praised!"
      },
      {
        "id": "cc-q8",
        "type": "vocabulary",
        "question": "Type the verb that describes moving quickly and awkwardly from bed:",
        "hint": "Past tense starting with s (9 letters)",
        "answer": "scrambled",
        "acceptableAnswers": [
          "scrambled"
        ],
        "explanation": "Scrambled indicates a hurried, energetic movement."
      },
      {
        "id": "cc-q9",
        "type": "inference",
        "question": "What emotion replaced Scrooge former bitter miserliness?",
        "hint": "Joy and gratitude",
        "answer": "joy",
        "acceptableAnswers": [
          "joy",
          "happiness",
          "gratitude"
        ],
        "explanation": "He was laughing and crying with overflowing joyous celebration."
      }
    ],
    "qaFollowup": {
      "question": "What vow did Scrooge joyfully declare upon waking on Christmas morning?",
      "answer": "I will live in the Past, the Present, and the Future!",
      "contextNote": "Scrooge transformation into a generous, joyful benefactor is complete."
    }
  },
  {
    "id": "time-machine-1",
    "bookId": "time-machine",
    "partIndex": 1,
    "totalParts": 3,
    "title": "The Time Machine",
    "author": "H.G. Wells",
    "year": 1895,
    "gutenbergId": 35,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/35",
    "chapter": "Chapter 1: The Fourth Dimension",
    "difficulty": "Advanced",
    "tags": [
      "Sci-Fi",
      "Future",
      "Classic"
    ],
    "text": "'You must follow me carefully,' said the Time Traveller, holding up a slender forefinger. 'There is no difference between Time and any of the three dimensions of Space, except that our consciousness moves along it. But some foolish people have got into the habit of thinking it is fundamentally different.'",
    "vocabulary": [
      {
        "word": "dimension",
        "definition": "A measurable extent of some kind, such as length, breadth, depth, or time"
      },
      {
        "word": "consciousness",
        "definition": "The state of being aware of and responsive to one surroundings"
      },
      {
        "word": "fundamentally",
        "definition": "In central ways that affect the basic nature of something"
      }
    ],
    "questions": [
      {
        "id": "tm-q1",
        "type": "retrieval",
        "question": "What digit did the Time Traveller raise to demand the attention of his guests?",
        "hint": "The index finger (10 letters)",
        "answer": "forefinger",
        "acceptableAnswers": [
          "forefinger",
          "finger",
          "slender forefinger"
        ],
        "explanation": "He held up a slender forefinger."
      },
      {
        "id": "tm-q2",
        "type": "vocabulary",
        "question": "Find the adverb that means basically, at the core foundation of nature:",
        "hint": "Starts with f (13 letters)",
        "answer": "fundamentally",
        "acceptableAnswers": [
          "fundamentally"
        ],
        "explanation": "Fundamentally means in an essential or primary way."
      },
      {
        "id": "tm-q3",
        "type": "inference",
        "question": "How many spatial dimensions does classical physics recognize?",
        "hint": "Length, width, depth (5 letters)",
        "answer": "three",
        "acceptableAnswers": [
          "three",
          "3"
        ],
        "explanation": "The three dimensions of space plus the fourth dimension of time."
      }
    ],
    "qaFollowup": {
      "question": "According to the Time Traveller, what separates Time from the dimensions of Space?",
      "answer": "Only that our consciousness moves along it.",
      "contextNote": "H.G. Wells pioneered modern science fiction by proposing Time as a physical coordinate."
    }
  },
  {
    "id": "time-machine-2",
    "bookId": "time-machine",
    "partIndex": 2,
    "totalParts": 3,
    "title": "The Time Machine",
    "author": "H.G. Wells",
    "year": 1895,
    "gutenbergId": 35,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/35",
    "chapter": "Chapter 3: Leaping Across Centuries",
    "difficulty": "Advanced",
    "tags": [
      "Sci-Fi",
      "Future",
      "Classic"
    ],
    "text": "I pressed the lever and night came like the turning out of a lamp. In another moment came tomorrow, and the sun hopped across the sky every minute like a streak of fire. A minute later years were passing like seconds, the seasons flickering like lightning across the changing green hills.",
    "vocabulary": [
      {
        "word": "lever",
        "definition": "A rigid bar resting on a pivot, used to operate machinery"
      },
      {
        "word": "flickering",
        "definition": "Shining or changing with an unsteady, rapid, flashing movement"
      },
      {
        "word": "streak",
        "definition": "A long, thin line or mark of light moving swiftly"
      }
    ],
    "questions": [
      {
        "id": "tm-q4",
        "type": "retrieval",
        "question": "What mechanical control did the inventor press to accelerate time?",
        "hint": "Starts with l (5 letters)",
        "answer": "lever",
        "acceptableAnswers": [
          "lever",
          "the lever"
        ],
        "explanation": "He pressed the forward starting lever."
      },
      {
        "id": "tm-q5",
        "type": "vocabulary",
        "question": "Type the verb that describes the rapid, flashing passage of winter and summer seasons:",
        "hint": "Starts with f (10 letters)",
        "answer": "flickering",
        "acceptableAnswers": [
          "flickering"
        ],
        "explanation": "Flickering indicates rapid, flashing changes."
      },
      {
        "id": "tm-q6",
        "type": "inference",
        "question": "What celestial body appeared like a streak of fire?",
        "hint": "The daytime star (3 letters)",
        "answer": "sun",
        "acceptableAnswers": [
          "sun",
          "the sun"
        ],
        "explanation": "The sun moved so quickly it traced a band of fire across the sky."
      }
    ],
    "qaFollowup": {
      "question": "What did the sun resemble as the machine sped through the centuries?",
      "answer": "A streak of fire hopping across the sky.",
      "contextNote": "Wells describes visual time dilation where days and seasons blur into continuous motion."
    }
  },
  {
    "id": "time-machine-3",
    "bookId": "time-machine",
    "partIndex": 3,
    "totalParts": 3,
    "title": "The Time Machine",
    "author": "H.G. Wells",
    "year": 1895,
    "gutenbergId": 35,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/35",
    "chapter": "Chapter 4: The Golden Age of the Eloi",
    "difficulty": "Advanced",
    "tags": [
      "Sci-Fi",
      "Future",
      "Classic"
    ],
    "text": "The machine came to a shuddering stop in a torrential hailstorm beside a colossal statue of white marble. As the storm cleared, I saw a group of gentle, delicate figures dressed in soft tunics. They were graceful as children, wearing sandals and garlands of exotic blossoms, living peacefully in the year eight hundred thousand.",
    "vocabulary": [
      {
        "word": "colossal",
        "definition": "Extremely large, monumental, or immense in scale"
      },
      {
        "word": "garlands",
        "definition": "Wreaths of flowers and leaves worn on the head or hung as decoration"
      },
      {
        "word": "torrential",
        "definition": "Falling rapidly and in copious, violent quantities"
      }
    ],
    "questions": [
      {
        "id": "tm-q7",
        "type": "retrieval",
        "question": "What stone material formed the gigantic monument where he arrived?",
        "hint": "A white metamorphic rock (6 letters)",
        "answer": "marble",
        "acceptableAnswers": [
          "marble",
          "white marble"
        ],
        "explanation": "The statue was carved from white marble."
      },
      {
        "id": "tm-q8",
        "type": "vocabulary",
        "question": "Find the adjective meaning immensely huge and monumental:",
        "hint": "Starts with c (8 letters)",
        "answer": "colossal",
        "acceptableAnswers": [
          "colossal"
        ],
        "explanation": "Colossal means extraordinarily gigantic."
      },
      {
        "id": "tm-q9",
        "type": "inference",
        "question": "What floral decorations did the graceful futuristic beings wear?",
        "hint": "Wreaths of blossoms (8 letters)",
        "answer": "garlands",
        "acceptableAnswers": [
          "garlands",
          "garlands of blossoms"
        ],
        "explanation": "They wore wreaths and garlands of fragrant flowers."
      }
    ],
    "qaFollowup": {
      "question": "Beside what monument did the Time Machine come to rest in the future?",
      "answer": "A colossal statue of white marble.",
      "contextNote": "The white sphinx held the mystery of the underground Morlocks who stole the machine."
    }
  },
  {
    "id": "jungle-book-1",
    "bookId": "jungle-book",
    "partIndex": 1,
    "totalParts": 3,
    "title": "The Jungle Book",
    "author": "Rudyard Kipling",
    "year": 1894,
    "gutenbergId": 236,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/236",
    "chapter": "Chapter 1: Mowgli Brothers",
    "difficulty": "Foundation",
    "tags": [
      "Nature",
      "Animals",
      "Classic"
    ],
    "text": "It was seven o clock of a very warm evening in the Seeonee hills when Father Wolf woke up from his day rest, scratched himself, yawned, and spread out his paws one after another to get rid of the sleepy feeling in their tips. Mother Wolf lay with her big grey nose dropped across her four tumbling, squealing cubs.",
    "vocabulary": [
      {
        "word": "tumbling",
        "definition": "Falling, rolling, or playing clumsily end over end"
      },
      {
        "word": "squealing",
        "definition": "Making a high-pitched, shrill cry or sound of youthful excitement"
      },
      {
        "word": "scratched",
        "definition": "Rubbed claws gently against the skin to relieve an itch"
      }
    ],
    "questions": [
      {
        "id": "jb-q1",
        "type": "retrieval",
        "question": "In which geographic hills did Father Wolf wake from his afternoon rest?",
        "hint": "Starts with S (7 letters)",
        "answer": "Seeonee",
        "acceptableAnswers": [
          "Seeonee",
          "Seeonee hills"
        ],
        "explanation": "The setting is the Seeonee hills in central India."
      },
      {
        "id": "jb-q2",
        "type": "vocabulary",
        "question": "Find the verb that means making a high-pitched playful cry:",
        "hint": "Starts with s (9 letters)",
        "answer": "squealing",
        "acceptableAnswers": [
          "squealing"
        ],
        "explanation": "Squealing describes the sharp, playful cries of young cubs."
      },
      {
        "id": "jb-q3",
        "type": "inference",
        "question": "How many biological wolf cubs were playing beside Mother Wolf?",
        "hint": "A number between three and five",
        "answer": "four",
        "acceptableAnswers": [
          "four",
          "4"
        ],
        "explanation": "The text mentions her four tumbling, squealing cubs."
      }
    ],
    "qaFollowup": {
      "question": "In which Indian hills did Father Wolf and Mother Wolf make their family cave?",
      "answer": "The Seeonee hills.",
      "contextNote": "Rudyard Kipling opens the jungle law with the tranquil family life of the Seeonee wolf pack."
    }
  },
  {
    "id": "jungle-book-2",
    "bookId": "jungle-book",
    "partIndex": 2,
    "totalParts": 3,
    "title": "The Jungle Book",
    "author": "Rudyard Kipling",
    "year": 1894,
    "gutenbergId": 236,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/236",
    "chapter": "Chapter 1: The Council Rock",
    "difficulty": "Foundation",
    "tags": [
      "Nature",
      "Animals",
      "Classic"
    ],
    "text": "Bagheera the Black Panther leaped softly on to the Council Rock. He was as black as ink, but with the jaguar markings showing in certain lights like the pattern of watered silk. 'To kill a naked cub is great shame,' Bagheera purred. 'I speak for the man-cub, and I offer a fat bull freshly killed in exchange for his life.'",
    "vocabulary": [
      {
        "word": "jaguar",
        "definition": "A large, heavily built, spotted predatory wild cat"
      },
      {
        "word": "watered",
        "definition": "Having a wavy, lustrous finish like moire fabric"
      },
      {
        "word": "council",
        "definition": "An assembly or formal meeting of leaders to deliberate policy"
      }
    ],
    "questions": [
      {
        "id": "jb-q4",
        "type": "retrieval",
        "question": "What great black predator spoke in defense of the young man-cub?",
        "hint": "Starts with B (8 letters)",
        "answer": "Bagheera",
        "acceptableAnswers": [
          "Bagheera",
          "the panther"
        ],
        "explanation": "Bagheera the Black Panther offered the ransom."
      },
      {
        "id": "jb-q5",
        "type": "vocabulary",
        "question": "Type the word meaning a formal assembly of elders gathered to decide laws:",
        "hint": "Starts with c (7 letters)",
        "answer": "council",
        "acceptableAnswers": [
          "council"
        ],
        "explanation": "The pack gathered at the Council Rock."
      },
      {
        "id": "jb-q6",
        "type": "inference",
        "question": "What domestic cattle animal did Bagheera offer as ransom?",
        "hint": "A male bovine beast (4 letters)",
        "answer": "bull",
        "acceptableAnswers": [
          "bull",
          "a fat bull",
          "a bull"
        ],
        "explanation": "He offered a freshly killed fat bull."
      }
    ],
    "qaFollowup": {
      "question": "What ransom did Bagheera the Panther pay to purchase Mowgli life into the wolf pack?",
      "answer": "A fat bull freshly killed.",
      "contextNote": "By jungle law, the life of a cub could be bought if two non-parents spoke for him."
    }
  },
  {
    "id": "jungle-book-3",
    "bookId": "jungle-book",
    "partIndex": 3,
    "totalParts": 3,
    "title": "The Jungle Book",
    "author": "Rudyard Kipling",
    "year": 1894,
    "gutenbergId": 236,
    "gutenbergUrl": "https://www.gutenberg.org/ebooks/236",
    "chapter": "Chapter 3: Kaa Hunting in the Cold Lairs",
    "difficulty": "Foundation",
    "tags": [
      "Nature",
      "Animals",
      "Classic"
    ],
    "text": "The Bandar-log had carried Mowgli away to the ruined city of Cold Lairs. The marble palaces and broken temples were overgrown with creeping figs and tangled creepers. Then the mighty rock python Kaa struck through the crumbling walls, his emerald eyes glittering in the moonlight as the monkeys scattered in terror.",
    "vocabulary": [
      {
        "word": "python",
        "definition": "A large heavy-bodied non-venomous constrictor snake"
      },
      {
        "word": "scattered",
        "definition": "Separated and moved rapidly off in different directions"
      },
      {
        "word": "creepers",
        "definition": "Trailing or climbing plants that grow along the ground or up walls"
      }
    ],
    "questions": [
      {
        "id": "jb-q7",
        "type": "retrieval",
        "question": "What was the name of the ancient ruined city where the monkeys lived?",
        "hint": "Two words: Cold...",
        "answer": "Cold Lairs",
        "acceptableAnswers": [
          "Cold Lairs",
          "the Cold Lairs"
        ],
        "explanation": "The lost Hindu city was called Cold Lairs."
      },
      {
        "id": "jb-q8",
        "type": "vocabulary",
        "question": "Find the verb that means dispersed and fled rapidly in all directions:",
        "hint": "Starts with s (9 letters)",
        "answer": "scattered",
        "acceptableAnswers": [
          "scattered"
        ],
        "explanation": "The monkeys scattered in sheer panic."
      },
      {
        "id": "jb-q9",
        "type": "inference",
        "question": "What gem color describes the glittering eyes of Kaa the python?",
        "hint": "A vibrant green gemstone (7 letters)",
        "answer": "emerald",
        "acceptableAnswers": [
          "emerald",
          "green"
        ],
        "explanation": "The text mentions his emerald eyes."
      }
    ],
    "qaFollowup": {
      "question": "What great serpent struck the crumbling ruins to rescue Mowgli from the monkeys?",
      "answer": "Kaa the mighty rock python.",
      "contextNote": "The Bandar-log monkeys feared only Kaa, whose hypnotic dance could mesmerize any creature."
    }
  }
];
