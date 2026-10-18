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
    id: 'secret-garden-1',
    title: 'The Secret Garden',
    author: 'Frances Hodgson Burnett',
    year: 1911,
    gutenbergId: 113,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/113',
    chapter: 'Chapter 5: The Cry in the Corridor',
    difficulty: 'Foundation',
    tags: ['Mystery', 'Nature', 'Atmosphere'],
    text: 'She walked round and looked closely at that side of the orchard wall, but she only found what she had found before—that there was no door in it. Then the robin hopped from his swinging spray of ivy on to the top of the wall and opened his beak and sang a loud, lovely trill.',
    vocabulary: [
      { word: 'spray', definition: 'A small slender shoot or twig of a plant bearing flowers or leaves' },
      { word: 'trill', definition: 'A vibrating, quavering musical sound made by a bird or voice' },
      { word: 'orchard', definition: 'A piece of enclosed land planted with fruit trees' }
    ],
        qaFollowup: {
      question: "Where did the robin perch before opening his beak to sing?",
      answer: "On the swinging spray of ivy on top of the orchard wall.",
      contextNote: "Frances Hodgson Burnett uses the robin to guide Mary toward discovering the locked secret garden."
    },
questions: [
      {
        id: 'sg-q1',
        type: 'vocabulary',
        question: "Find and type the word from the text that means a small slender branch or twig of ivy:",
        hint: "Starts with 's' (5 letters)",
        answer: 'spray',
        acceptableAnswers: ['spray', 'a spray'],
        explanation: "'Spray' is used here to describe a small, flexible shoot of ivy on which the robin was perched."
      },
      {
        id: 'sg-q2',
        type: 'retrieval',
        question: "Which friendly creature hopped on to the top of the orchard wall?",
        hint: "A red-breasted garden bird",
        answer: 'robin',
        acceptableAnswers: ['robin', 'the robin', 'a robin'],
        explanation: "The passage states: 'Then the robin hopped from his swinging spray of ivy on to the top of the wall'."
      },
      {
        id: 'sg-q3',
        type: 'grammar',
        question: "Type the noun used to describe the robin's loud, musical bird song:",
        hint: "Starts with 't' (5 letters)",
        answer: 'trill',
        acceptableAnswers: ['trill', 'a trill'],
        explanation: "A 'trill' is a rapid alternation between notes, frequently used in literary prose to describe birdsong."
      }
    ]
  },
  {
    id: 'alice-wonderland-1',
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    year: 1865,
    gutenbergId: 11,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/11',
    chapter: 'Chapter 1: Down the Rabbit-Hole',
    difficulty: 'Foundation',
    tags: ['Fantasy', 'Victorian', 'Classic'],
    text: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do. Once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice, 'without pictures or conversations?'",
    vocabulary: [
      { word: 'peeped', definition: 'Looked quickly and furtively, often through a narrow opening' },
      { word: 'conversations', definition: 'Spoken dialogue or verbal exchanges between characters' },
      { word: 'bank', definition: 'The sloping land beside a body of water or grassy slope' }
    ],
        qaFollowup: {
      question: "What did Alice believe was useless about her sister's book?",
      answer: "It had no pictures or conversations in it.",
      contextNote: "Lewis Carroll sets Alice's playful Victorian curiosity and impatience from the opening sentence."
    },
questions: [
      {
        id: 'aw-q1',
        type: 'vocabulary',
        question: "Find and type the verb that means glanced quickly or furtively into the book:",
        hint: "Past tense, begins with 'p' (6 letters)",
        answer: 'peeped',
        acceptableAnswers: ['peeped', 'peep'],
        explanation: "'Peeped' means to take a quick, secret look, indicating Alice's restless curiosity."
      },
      {
        id: 'aw-q2',
        type: 'retrieval',
        question: "Where was Alice sitting alongside her sister?",
        hint: "Starts with 'b' (4 letters)",
        answer: 'bank',
        acceptableAnswers: ['bank', 'the bank', 'on the bank'],
        explanation: "The text opens: 'Alice was beginning to get very tired of sitting by her sister on the bank'."
      },
      {
        id: 'aw-q3',
        type: 'inference',
        question: "What did Alice believe a book must contain to be useful? Type either of the two missing elements:",
        hint: "Think of visual illustrations or spoken dialogue",
        answer: 'pictures',
        acceptableAnswers: ['pictures', 'conversations', 'pictures or conversations', 'conversations or pictures'],
        explanation: "Alice famously questions the point of a book without 'pictures or conversations'."
      }
    ]
  },
  {
    id: 'treasure-island-1',
    title: 'Treasure Island',
    author: 'Robert Louis Stevenson',
    year: 1883,
    gutenbergId: 120,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/120',
    chapter: 'Chapter 1: The Old Sea-dog at the Admiral Benbow',
    difficulty: 'Standard',
    tags: ['Adventure', 'Pirates', 'Character Description'],
    text: "I remember him as if it were yesterday, as he came plodding to the inn door, his sea-chest following behind him in a hand-barrow; a tall, strong, heavy, nut-brown man; his tarry pigtail falling over the shoulders of his soiled blue coat; his hands ragged and scarred, with black, broken nails.",
    vocabulary: [
      { word: 'plodding', definition: 'Walking slowly and with heavy, weary steps' },
      { word: 'tarry', definition: 'Covered with or smelling of dark resinous marine pitch' },
      { word: 'soiled', definition: 'Dirty, stained, or weathered from hard seafaring life' },
      { word: 'hand-barrow', definition: 'A two-wheeled hand-drawn cart used for transporting luggage' }
    ],
        qaFollowup: {
      question: "What heavy luggage was the scarred old sea-dog hauling?",
      answer: "His sea-chest following behind him in a hand-barrow.",
      contextNote: "Robert Louis Stevenson establishes Billy Bones' mysterious pirate background at the Admiral Benbow."
    },
questions: [
      {
        id: 'ti-q1',
        type: 'vocabulary',
        question: "Find and type the verb participle meaning walking heavily and laboriously:",
        hint: "Starts with 'pl' (8 letters)",
        answer: 'plodding',
        acceptableAnswers: ['plodding'],
        explanation: "'Plodding' emphasizes the sailor's weighty, tired, deliberate pace."
      },
      {
        id: 'ti-q2',
        type: 'retrieval',
        question: "What vehicle transported the old buccaneer's sea-chest?",
        hint: "A two-wheeled cart (hyphenated word)",
        answer: 'hand-barrow',
        acceptableAnswers: ['hand-barrow', 'hand barrow', 'barrow'],
        explanation: "The passage notes: 'his sea-chest following behind him in a hand-barrow'."
      },
      {
        id: 'ti-q3',
        type: 'grammar',
        question: "Type the adjective that describes his dirty, grease-stained blue coat:",
        hint: "Synonym for stained or dirty (6 letters)",
        answer: 'soiled',
        acceptableAnswers: ['soiled'],
        explanation: "'Soiled' highlights the neglected, weathered condition of the seaman's garments."
      }
    ]
  },
  {
    id: 'wind-in-the-willows-1',
    title: 'The Wind in the Willows',
    author: 'Kenneth Grahame',
    year: 1908,
    gutenbergId: 289,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/289',
    chapter: 'Chapter 1: The River Bank',
    difficulty: 'Standard',
    tags: ['Animals', 'Pastoral', 'Humour'],
    text: "The Mole had been working very hard all the morning, spring-cleaning his little home. First with brooms, then with dusters; then on ladders and steps and chairs, with a brush and a pail of whitewash; till he had dust in his throat and eyes, and splashes of whitewash all over his black fur.",
    vocabulary: [
      { word: 'pail', definition: 'A cylindrical bucket, typically of wood or metal' },
      { word: 'whitewash', definition: 'A lime-and-water solution used for painting walls white' },
      { word: 'spring-cleaning', definition: 'A thorough, exhaustive cleaning of a house undertaken in the spring' }
    ],
        qaFollowup: {
      question: "What liquid left splashes all over the Mole's black fur?",
      answer: "Whitewash from his brush and pail as he cleaned.",
      contextNote: "Kenneth Grahame paints Mole's exhausted domestic spring-cleaning before his joyous breakout to the river."
    },
questions: [
      {
        id: 'ww-q1',
        type: 'vocabulary',
        question: "Find and type the old-fashioned synonym for bucket used in the passage:",
        hint: "Starts with 'p' (4 letters)",
        answer: 'pail',
        acceptableAnswers: ['pail', 'a pail'],
        explanation: "A 'pail' is a bucket commonly referenced in classic Edwardian literature."
      },
      {
        id: 'ww-q2',
        type: 'retrieval',
        question: "What liquid mixture left splashes all over the Mole's black fur?",
        hint: "Lime paint mixture (starts with 'w')",
        answer: 'whitewash',
        acceptableAnswers: ['whitewash', 'white wash'],
        explanation: "The text specifies 'splashes of whitewash all over his black fur'."
      },
      {
        id: 'ww-q3',
        type: 'inference',
        question: "What colour was the Mole's natural fur before the painting accident?",
        hint: "Opposite of white",
        answer: 'black',
        acceptableAnswers: ['black'],
        explanation: "Grahame deliberately contrasts the white splashes with the Mole's 'black fur'."
      }
    ]
  },
  {
    id: 'oliver-twist-1',
    title: 'Oliver Twist',
    author: 'Charles Dickens',
    year: 1838,
    gutenbergId: 730,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/730',
    chapter: 'Chapter 2: Treats of Oliver Twist’s Growth and Education',
    difficulty: 'Standard',
    tags: ['Victorian', 'Social Critique', 'Dramatic'],
    text: "The room in which the boys were fed was a large stone hall, with a copper at one end; out of which the master, dressed in an apron for the purpose, and assisted by one or two women, ladled the gruel at meal-times. Of this festive composition each boy had one porringer, and no more.",
    vocabulary: [
      { word: 'gruel', definition: 'A thin, watery porridge boiled in water with meager oatmeal' },
      { word: 'porringer', definition: 'A small shallow bowl or basin, often with a handle, for broth or porridge' },
      { word: 'festive', definition: 'Cheerful and celebratory (used here with bitter irony)' },
      { word: 'copper', definition: 'A large copper boiler or cauldron used for communal heating' }
    ],
        qaFollowup: {
      question: "Why was the small child Oliver sentenced to be starved?",
      answer: "He dared to ask the master for more gruel.",
      contextNote: "Charles Dickens exposes the cruel neglect and starvation inside Victorian parish workhouses."
    },
questions: [
      {
        id: 'ot-q1',
        type: 'vocabulary',
        question: "Find and type the word for the shallow basin or bowl from which each boy ate:",
        hint: "Starts with 'p' (9 letters)",
        answer: 'porringer',
        acceptableAnswers: ['porringer', 'a porringer'],
        explanation: "A 'porringer' was a traditional bowl used for serving gruel in Victorian institutions."
      },
      {
        id: 'ot-q2',
        type: 'retrieval',
        question: "What thin, watery substance was ladled out to the workhouse boys?",
        hint: "Starts with 'g' (5 letters)",
        answer: 'gruel',
        acceptableAnswers: ['gruel', 'the gruel'],
        explanation: "The master 'ladled the gruel at meal-times'."
      },
      {
        id: 'ot-q3',
        type: 'grammar',
        question: "Which ironic adjective does Dickens use to mock the bleakness of the food?",
        hint: "Usually means joyous or celebratory (7 letters)",
        answer: 'festive',
        acceptableAnswers: ['festive'],
        explanation: "Dickens uses the word 'festive' with cutting satire, contrasting a cheerful celebration with starvation rations."
      }
    ]
  },
  {
    id: 'peter-pan-1',
    title: 'Peter and Wendy',
    author: 'J.M. Barrie',
    year: 1911,
    gutenbergId: 16,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/16',
    chapter: 'Chapter 1: Peter Breaks Through',
    difficulty: 'Foundation',
    tags: ['Childhood', 'Imagination', 'Fantasy'],
    text: "All children, except one, grow up. They soon know that they will grow up, and the way Wendy knew was this. One day when she was two years old she was playing in a garden, and she plucked another flower and ran with it to her mother.",
    vocabulary: [
      { word: 'plucked', definition: 'Quickly picked or detached from a stem with fingers' },
      { word: 'except', definition: 'Not including; other than' }
    ],
        qaFollowup: {
      question: "What does every single child know except for Peter Pan?",
      answer: "They soon know that they will grow up.",
      contextNote: "J.M. Barrie contrasts the sorrowful inevitability of growing up with Peter's eternal childhood."
    },
questions: [
      {
        id: 'pp-q1',
        type: 'vocabulary',
        question: "Find and type the past tense verb meaning picked or pulled off gently:",
        hint: "Starts with 'p' (7 letters)",
        answer: 'plucked',
        acceptableAnswers: ['plucked'],
        explanation: "'Plucked' specifically conveys snapping the stem of a flower."
      },
      {
        id: 'pp-q2',
        type: 'retrieval',
        question: "How old was Wendy when she came to understand that she would grow up?",
        hint: "A number under ten",
        answer: 'two',
        acceptableAnswers: ['two', '2', 'two years old'],
        explanation: "The passage notes: 'One day when she was two years old'."
      },
      {
        id: 'pp-q3',
        type: 'inference',
        question: "According to the famous opening sentence, how many children never grow up?",
        hint: "Type the word for the solitary exception",
        answer: 'one',
        acceptableAnswers: ['one', '1', 'one child'],
        explanation: "'All children, except one, grow up' refers to the immortal Peter Pan."
      }
    ]
  },
  {
    id: 'railway-children-1',
    title: 'The Railway Children',
    author: 'E. Nesbit',
    year: 1906,
    gutenbergId: 1874,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/1874',
    chapter: 'Chapter 1: The Beginning of Things',
    difficulty: 'Foundation',
    tags: ['Family', 'Adventure', 'Edwardian'],
    text: "They were not railway children to begin with. I don't suppose they had ever thought about railways except as a means of getting to Maskelyne and Cook's, the Pantomime, Zoological Gardens, and Madame Tussaud's. They were just ordinary suburban children, and they lived with their Father and Mother in an ordinary red-brick villa.",
    vocabulary: [
      { word: 'suburban', definition: 'Belonging to an outlying residential district of a city' },
      { word: 'pantomime', definition: 'A traditional British musical comedy stage theatrical for families' },
      { word: 'villa', definition: 'A detached or semi-detached residential house with garden' }
    ],
        qaFollowup: {
      question: "Where did the children live before their life suddenly changed?",
      answer: "In an ordinary red-brick villa in London.",
      contextNote: "E. Nesbit grounds the family's dramatic downfall in comfortable Edwardian suburban reality."
    },
questions: [
      {
        id: 'rc-q1',
        type: 'vocabulary',
        question: "Find and type the adjective meaning situated in the residential outskirts of town:",
        hint: "Starts with 's' (8 letters)",
        answer: 'suburban',
        acceptableAnswers: ['suburban'],
        explanation: "'Suburban' defines families living away from the city centre in comfortable residential neighbourhoods."
      },
      {
        id: 'rc-q2',
        type: 'retrieval',
        question: "What material and colour was the children's family villa constructed with?",
        hint: "Hyphenated colour and building material",
        answer: 'red-brick',
        acceptableAnswers: ['red-brick', 'red brick'],
        explanation: "The text states: 'they lived with their Father and Mother in an ordinary red-brick villa'."
      },
      {
        id: 'rc-q3',
        type: 'retrieval',
        question: "Type the name of the famous waxwork museum visited by the children via train:",
        hint: "Madame ...",
        answer: "Madame Tussaud's",
        acceptableAnswers: ["Madame Tussaud's", "Madame Tussauds", "Tussaud's", "Tussauds"],
        explanation: "The narrator lists 'Zoological Gardens, and Madame Tussaud's'."
      }
    ]
  },
  {
    id: 'christmas-carol-1',
    title: 'A Christmas Carol',
    author: 'Charles Dickens',
    year: 1843,
    gutenbergId: 46,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/46',
    chapter: 'Stave 1: Marley’s Ghost',
    difficulty: 'Standard',
    tags: ['Ghost Story', 'Moral', 'Victorian London'],
    text: "Marley was dead, to begin with. There is no doubt whatever about that. The register of his burial was signed by the clergyman, the clerk, the undertaker, and the chief mourner. Scrooge signed it. And Scrooge's name was good upon 'Change for anything he chose to put his hand to.",
    vocabulary: [
      { word: 'register', definition: 'An official written record or formal document of vital events' },
      { word: 'undertaker', definition: 'A professional whose business is preparing the dead for burial' },
      { word: "'Change", definition: 'The Royal Exchange in the City of London where merchants traded' }
    ],
        qaFollowup: {
      question: "What was cold about Ebenezer Scrooge even on the hottest days?",
      answer: "The bitter cold within him that froze his old features.",
      contextNote: "Charles Dickens uses harsh winter weather as an extended metaphor for Scrooge's unfeeling heart."
    },
questions: [
      {
        id: 'cc-q1',
        type: 'vocabulary',
        question: "Find and type the word meaning an official record book or legal log of burials:",
        hint: "Starts with 'r' (8 letters)",
        answer: 'register',
        acceptableAnswers: ['register', 'the register'],
        explanation: "A 'register' is an official archive recording births, marriages, or deaths."
      },
      {
        id: 'cc-q2',
        type: 'retrieval',
        question: "Which character is declared absolutely dead without any doubt whatever?",
        hint: "Scrooge's deceased business partner",
        answer: 'Marley',
        acceptableAnswers: ['Marley', 'Jacob Marley'],
        explanation: "Dickens opens: 'Marley was dead, to begin with. There is no doubt whatever about that.'"
      },
      {
        id: 'cc-q3',
        type: 'vocabulary',
        question: "Type the title of the funeral professional who signed the burial record:",
        hint: "Starts with 'u' (10 letters)",
        answer: 'undertaker',
        acceptableAnswers: ['undertaker', 'the undertaker'],
        explanation: "The undertaker, alongside the clergyman, clerk, and chief mourner, formalized the burial."
      }
    ]
  },
  {
    id: 'black-beauty-1',
    title: 'Black Beauty',
    author: 'Anna Sewell',
    year: 1877,
    gutenbergId: 271,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/271',
    chapter: 'Chapter 1: My Early Home',
    difficulty: 'Foundation',
    tags: ['Horses', 'Autobiography', 'Countryside'],
    text: "The first place that I can well remember was a large pleasant meadow with a pond of clear water in it. Some shady trees leaned over it, and rushes and water-lilies grew at the deep end. Over the hedge on one side we looked into a ploughed field, and on the other we looked over a gate at our master's house.",
    vocabulary: [
      { word: 'rushes', definition: 'Marsh plants with slender hollow stems growing in or near fresh water' },
      { word: 'ploughed', definition: 'Soil turned over by a farm implement ready for sowing crops' },
      { word: 'meadow', definition: 'A piece of grassland, especially one used for hay or grazing' }
    ],
        qaFollowup: {
      question: "What was the first pleasant place the young horse could remember?",
      answer: "A large meadow with a pond of clear water and shady trees.",
      contextNote: "Anna Sewell adopts the horse's gentle voice to inspire empathy for Victorian working animals."
    },
questions: [
      {
        id: 'bb-q1',
        type: 'vocabulary',
        question: "Find and type the name of the floating water plants growing at the deep end of the pond:",
        hint: "Starts with 'w' (hyphenated plant)",
        answer: 'water-lilies',
        acceptableAnswers: ['water-lilies', 'water lilies'],
        explanation: "'Water-lilies' are aquatic flowering plants common in calm British ponds."
      },
      {
        id: 'bb-q2',
        type: 'retrieval',
        question: "What agricultural ground lay beyond the hedge on one side of the meadow?",
        hint: "Soil prepared for planting (starts with 'p')",
        answer: 'ploughed field',
        acceptableAnswers: ['ploughed field', 'ploughed', 'a ploughed field'],
        explanation: "The narrator looks into 'a ploughed field' on one side."
      },
      {
        id: 'bb-q3',
        type: 'grammar',
        question: "Type the adjective describing the trees that cast cooling shade over the pond:",
        hint: "Starts with 's' (5 letters)",
        answer: 'shady',
        acceptableAnswers: ['shady'],
        explanation: "'Some shady trees leaned over it', providing shelter from the sun."
      }
    ]
  },
  {
    id: 'jungle-book-1',
    title: 'The Jungle Book',
    author: 'Rudyard Kipling',
    year: 1894,
    gutenbergId: 236,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/236',
    chapter: 'Mowgli’s Brothers',
    difficulty: 'Standard',
    tags: ['Wild Animals', 'India', 'Adventure'],
    text: "It was seven o'clock of a very warm evening in the Seeonee hills when Father Wolf woke up from his day's rest, scratched himself, yawned, and spread out his paws one after the other to get rid of the sleepy feeling in their tips. Mother Wolf lay with her big gray nose dropped across her four tumbling, squealing cubs.",
    vocabulary: [
      { word: 'cubs', definition: 'The young of certain carnivorous animals such as wolves, lions, or bears' },
      { word: 'squealing', definition: 'Making a high-pitched, shrill cry or sound of play' },
      { word: 'tumbling', definition: 'Rolling over and falling playfully across one another' }
    ],
        qaFollowup: {
      question: "Who sprang forward when the bushes rustled at the cave?",
      answer: "Father Wolf leaped into the air to defend his cubs.",
      contextNote: "Rudyard Kipling depicts the sacred protective honour code of the Seeonee wolf pack."
    },
questions: [
      {
        id: 'jb-q1',
        type: 'vocabulary',
        question: "Find and type the noun for the four baby wolves nestled beside their mother:",
        hint: "Starts with 'c' (4 letters)",
        answer: 'cubs',
        acceptableAnswers: ['cubs', 'wolf cubs'],
        explanation: "'Cubs' is the proper collective term for juvenile wolves."
      },
      {
        id: 'jb-q2',
        type: 'retrieval',
        question: "In which hills of India is the wolf pack's lair located?",
        hint: "Starts with 'S' (7 letters)",
        answer: 'Seeonee',
        acceptableAnswers: ['Seeonee', 'Seeonee hills'],
        explanation: "Kipling establishes the iconic Indian setting as the 'Seeonee hills'."
      },
      {
        id: 'jb-q3',
        type: 'retrieval',
        question: "How many energetic cubs lay tumbling beside Mother Wolf?",
        hint: "Type the number word",
        answer: 'four',
        acceptableAnswers: ['four', '4'],
        explanation: "The text specifies Mother Wolf's 'four tumbling, squealing cubs'."
      }
    ]
  },
  {
    id: 'tom-sawyer-1',
    title: 'The Adventures of Tom Sawyer',
    author: 'Mark Twain',
    year: 1876,
    gutenbergId: 74,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/74',
    chapter: 'Chapter 2: The Glorious Whitewasher',
    difficulty: 'Standard',
    tags: ['Americana', 'Humour', 'Youth'],
    text: "Saturday morning was come, and all the summer world was bright and fresh, and brimming with life. There was a song in every heart; and if the heart was young the music issued at the lips. There was cheer in every face and a spring in every step.",
    vocabulary: [
      { word: 'brimming', definition: 'Completely filled or overflowing with vitality or liquid' },
      { word: 'issued', definition: 'Flowed out, emerged, or proceeded from a source' },
      { word: 'cheer', definition: 'Good spirits, optimism, and hearty happiness' }
    ],
        qaFollowup: {
      question: "What dreaded Saturday chore faced young Tom Sawyer?",
      answer: "Whitewashing thirty yards of board fence nine feet high.",
      contextNote: "Mark Twain humorously illustrates how Tom tricks his neighbourhood friends into doing his work."
    },
questions: [
      {
        id: 'ts-q1',
        type: 'vocabulary',
        question: "Find and type the participle meaning completely overflowing or full to the brim:",
        hint: "Starts with 'b' (8 letters)",
        answer: 'brimming',
        acceptableAnswers: ['brimming'],
        explanation: "'Brimming with life' describes exuberant energy ready to spill over."
      },
      {
        id: 'ts-q2',
        type: 'retrieval',
        question: "Which day of the weekend brought this bright, joyous summer morning?",
        hint: "Starts with 'S'",
        answer: 'Saturday',
        acceptableAnswers: ['Saturday', 'Saturday morning'],
        explanation: "The passage opens: 'Saturday morning was come'."
      },
      {
        id: 'ts-q3',
        type: 'inference',
        question: "What physical quality was present in every person's walking gait?",
        hint: "A bouncy elasticity (6 letters)",
        answer: 'spring',
        acceptableAnswers: ['spring', 'a spring'],
        explanation: "Twain notes: 'and a spring in every step', showing youthful vigour."
      }
    ]
  },
  {
    id: 'little-women-1',
    title: 'Little Women',
    author: 'Louisa May Alcott',
    year: 1868,
    gutenbergId: 514,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/514',
    chapter: 'Chapter 1: Playing Pilgrims',
    difficulty: 'Foundation',
    tags: ['Sisters', 'Civil War Era', 'Family'],
    text: "'Christmas won't be Christmas without any presents,' grumbled Jo, lying on the rug. 'It's so dreadful to be poor!' sighed Meg, looking down at her old dress. 'I don't think it's fair for some girls to have plenty of pretty things, and other girls nothing at all,' added little Amy, with an injured sniff.",
    vocabulary: [
      { word: 'dreadful', definition: 'Extremely distressing, disagreeable, or unfortunate' },
      { word: 'grumbled', definition: 'Complained in a bad-tempered, muttering tone' },
      { word: 'injured', definition: 'Offended, aggrieved, or hurt in dignity' }
    ],
        qaFollowup: {
      question: "Why did Jo grumble that Christmas would not feel like Christmas?",
      answer: "Because they were too poor to afford any presents.",
      contextNote: "Louisa May Alcott celebrates sisterly devotion and cheerful resilience amidst wartime poverty."
    },
questions: [
      {
        id: 'lw-q1',
        type: 'vocabulary',
        question: "Find and type the adjective used by Meg meaning terrible, wretched, or distressing:",
        hint: "Starts with 'd' (8 letters)",
        answer: 'dreadful',
        acceptableAnswers: ['dreadful'],
        explanation: "'Dreadful' is a classic literary vocabulary word expressing strong dismay."
      },
      {
        id: 'lw-q2',
        type: 'retrieval',
        question: "Which outspoken sister complained first while lying on the rug?",
        hint: "Two letters (starts with 'J')",
        answer: 'Jo',
        acceptableAnswers: ['Jo', 'Josephine'],
        explanation: "The iconic opening line is grumbled by Jo March."
      },
      {
        id: 'lw-q3',
        type: 'retrieval',
        question: "What garment did Meg look down at remorsefully as she sighed?",
        hint: "Her old clothing",
        answer: 'dress',
        acceptableAnswers: ['dress', 'her old dress', 'old dress'],
        explanation: "Meg sighed 'looking down at her old dress'."
      }
    ]
  },
  {
    id: 'swiss-family-robinson-1',
    title: 'The Swiss Family Robinson',
    author: 'Johann David Wyss',
    year: 1812,
    gutenbergId: 419,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/419',
    chapter: 'Chapter 1: The Tempest',
    difficulty: 'Standard',
    tags: ['Survival', 'Shipwreck', 'Nautical'],
    text: "For many days we had been tempest-tossed. Six times had the darkness closed over a wild and terrific scene, and each morning we approached only nearer to shipwreck and disaster. The raging sea tore away our sails, and the ship groaned with every shock of the furious waves.",
    vocabulary: [
      { word: 'tempest-tossed', definition: 'Pounded and violently driven by fierce oceanic storms' },
      { word: 'terrific', definition: 'Inspiring great terror or alarming dread (archaic literary sense)' },
      { word: 'groaned', definition: 'Made a deep creaking sound under intense structural stress' }
    ],
        qaFollowup: {
      question: "What sad sight did the family discover upon the wrecked vessel?",
      answer: "The deserted ship had been abandoned by the frightened crew.",
      contextNote: "Johann David Wyss emphasizes faith, resourcefulness, and family unity after calamity."
    },
questions: [
      {
        id: 'sfr-q1',
        type: 'vocabulary',
        question: "Find and type the compound adjective describing being buffeted violently by raging storms:",
        hint: "Hyphenated word starting with 't' (13 characters)",
        answer: 'tempest-tossed',
        acceptableAnswers: ['tempest-tossed', 'tempest tossed'],
        explanation: "'Tempest-tossed' portrays helplessness against maritime gale forces."
      },
      {
        id: 'sfr-q2',
        type: 'retrieval',
        question: "How many nights had darkness fallen over the terrifying gale?",
        hint: "A number under ten",
        answer: 'six',
        acceptableAnswers: ['six', '6'],
        explanation: "The narrator records: 'Six times had the darkness closed over a wild and terrific scene'."
      },
      {
        id: 'sfr-q3',
        type: 'retrieval',
        question: "What nautical gear was ripped away from the ship by the raging sea?",
        hint: "Canvas sheets that catch the wind",
        answer: 'sails',
        acceptableAnswers: ['sails', 'our sails'],
        explanation: "The text states: 'The raging sea tore away our sails'."
      }
    ]
  },
  {
    id: 'sherlock-holmes-1',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    year: 1892,
    gutenbergId: 1661,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/1661',
    chapter: 'A Scandal in Bohemia',
    difficulty: 'Advanced',
    tags: ['Detective', 'Intellect', 'Mystery'],
    text: "To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.",
    vocabulary: [
      { word: 'abhorrent', definition: 'Inspiring intense repugnance, distaste, or moral hostility' },
      { word: 'eclipses', definition: 'Surpasses, outshines, or obscures others through superior prominence' },
      { word: 'predominates', definition: 'Has supreme exerting influence or controlling preeminence' },
      { word: 'akin', definition: 'Of similar character or related in essence' }
    ],
        qaFollowup: {
      question: "To Sherlock Holmes, what was Irene Adler always remembered as?",
      answer: "She is always remembered as THE woman of intellect.",
      contextNote: "Sir Arthur Conan Doyle notes that Holmes rarely admitted defeat except to the sharp-witted Irene Adler."
    },
questions: [
      {
        id: 'sh-q1',
        type: 'vocabulary',
        question: "Find and type the sophisticated adjective meaning deeply repugnant or loathsome to his intellect:",
        hint: "Starts with 'a' (9 letters)",
        answer: 'abhorrent',
        acceptableAnswers: ['abhorrent'],
        explanation: "'Abhorrent' is a premier vocabulary word denoting profound aversion."
      },
      {
        id: 'sh-q2',
        type: 'retrieval',
        question: "What is the full name of the extraordinary woman admired by Holmes?",
        hint: "Initials: I. A.",
        answer: 'Irene Adler',
        acceptableAnswers: ['Irene Adler'],
        explanation: "Dr. Watson names Irene Adler as the only woman who outwitted the great detective."
      },
      {
        id: 'sh-q3',
        type: 'vocabulary',
        question: "Type the verb meaning to overshadow or outshine entirely:",
        hint: "Related to an astronomical event (8 letters)",
        answer: 'eclipses',
        acceptableAnswers: ['eclipses', 'eclipse'],
        explanation: "Watson observes that 'she eclipses and predominates the whole of her sex'."
      }
    ]
  },
  {
    id: 'white-fang-1',
    title: 'White Fang',
    author: 'Jack London',
    year: 1906,
    gutenbergId: 910,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/910',
    chapter: 'Part 1, Chapter 1: The Trail of the Meat',
    difficulty: 'Advanced',
    tags: ['Wilderness', 'Yukon', 'Atmosphere'],
    text: "Dark spruce forest frowned on either side the frozen waterway. The trees had been stripped by a recent wind of their white covering of frost, and they seemed to lean towards each other, black and ominous, in the fading light. A vast silence reigned over the land.",
    vocabulary: [
      { word: 'ominous', definition: 'Giving the alarming impression that something bad is impending; menacing' },
      { word: 'reigned', definition: 'Prevailed predominantly; held undisputed sway' },
      { word: 'spruce', definition: 'An evergreen coniferous tree typical of northern subarctic forests' }
    ],
        qaFollowup: {
      question: "What grim sound broke the frozen silence of the northern forest?",
      answer: "A faint, mournful cry from a hungry wolf pack.",
      contextNote: "Jack London portrays the perilous, untamed savagery of the frozen subarctic wilderness."
    },
questions: [
      {
        id: 'wf-q1',
        type: 'vocabulary',
        question: "Find and type the literary adjective meaning menacing or foreboding evil:",
        hint: "Starts with 'o' (7 letters)",
        answer: 'ominous',
        acceptableAnswers: ['ominous'],
        explanation: "'Ominous' is a classic literary word used to create a threatening mood."
      },
      {
        id: 'wf-q2',
        type: 'retrieval',
        question: "What species of evergreen forest grew along both banks of the frozen waterway?",
        hint: "A northern conifer (starts with 's')",
        answer: 'spruce',
        acceptableAnswers: ['spruce', 'spruce forest', 'dark spruce'],
        explanation: "The passage opens: 'Dark spruce forest frowned on either side'."
      },
      {
        id: 'wf-q3',
        type: 'inference',
        question: "What quality reigned supreme over the desolate landscape?",
        hint: "Absence of sound (7 letters)",
        answer: 'silence',
        acceptableAnswers: ['silence', 'a vast silence', 'vast silence'],
        explanation: "London writes: 'A vast silence reigned over the land'."
      }
    ]
  },
  {
    id: 'around-the-world-1',
    title: 'Around the World in Eighty Days',
    author: 'Jules Verne',
    year: 1873,
    gutenbergId: 103,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/103',
    chapter: 'Chapter 1: In Which Phileas Fogg and Passepartout Accept Each Other',
    difficulty: 'Advanced',
    tags: ['Precision', 'Travel', 'Gentleman'],
    text: "Mr. Phileas Fogg was one of those mathematically exact people, who, never hurried and always prepared, are economical with their steps and their motions. He never took one step too many, and always went to his destination by the shortest route. He made no superfluous gestures, and was never seen to be moved or agitated.",
    vocabulary: [
      { word: 'superfluous', definition: 'Unnecessary, excessive, or exceeding what is sufficient' },
      { word: 'economical', definition: 'Careful and prudent in the management of resources or effort' },
      { word: 'agitated', definition: 'Troubled, nervously excited, or visibly perturbed' }
    ],
        qaFollowup: {
      question: "Why did Mr Phileas Fogg never take an unnecessary step?",
      answer: "He always went to his destination by the shortest route.",
      contextNote: "Jules Verne depicts Fogg as a living clock: calm, disciplined, and mathematically precise."
    },
questions: [
      {
        id: 'aw80-q1',
        type: 'vocabulary',
        question: "Find and type the high-level adjective meaning redundant, unnecessary, or extra:",
        hint: "Starts with 's' (11 letters)",
        answer: 'superfluous',
        acceptableAnswers: ['superfluous'],
        explanation: "'Superfluous' is one of the most common vocabulary words tested in independent school scholarship exams."
      },
      {
        id: 'aw80-q2',
        type: 'vocabulary',
        question: "Type the adjective meaning flustered, perturbed, or visibly stirred with emotion:",
        hint: "Starts with 'a' (8 letters)",
        answer: 'agitated',
        acceptableAnswers: ['agitated'],
        explanation: "Phileas Fogg's composure was so unshakeable that he was 'never seen to be moved or agitated'."
      },
      {
        id: 'aw80-q3',
        type: 'inference',
        question: "Which branch of science or study described Phileas Fogg's exact nature?",
        hint: "Related to numbers and precision",
        answer: 'mathematically',
        acceptableAnswers: ['mathematically', 'mathematics', 'mathematical'],
        explanation: "Verne portrays him as 'mathematically exact' in all his habits."
      }
    ]
  },
  {
    id: 'jane-eyre-1',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    year: 1847,
    gutenbergId: 1260,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/1260',
    chapter: 'Chapter 1: Gateshead Hall',
    difficulty: 'Advanced',
    tags: ['Gothic', 'Winter', 'Atmosphere'],
    text: "There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning; but since dinner the cold winter wind had brought with it clouds so sombre, and a rain so penetrating, that further outdoor exercise was now out of the question.",
    vocabulary: [
      { word: 'sombre', definition: 'Oppressively solemn, gloomy, or dark in shade or mood' },
      { word: 'penetrating', definition: 'Piercing, sharp, and soaking completely through' },
      { word: 'shrubbery', definition: 'An area planted with shrubs and ornamental bushes' }
    ],
        qaFollowup: {
      question: "Why could young Jane Eyre not take an outdoor walk that day?",
      answer: "The cold winter wind had brought dark clouds and penetrating rain.",
      contextNote: "Charlotte Brontë uses bleak winter storms to reflect Jane's emotional isolation at Gateshead Hall."
    },
questions: [
      {
        id: 'je-q1',
        type: 'vocabulary',
        question: "Find and type the atmospheric adjective meaning dark, melancholic, and gloomy:",
        hint: "British spelling starts with 's' (6 letters)",
        answer: 'sombre',
        acceptableAnswers: ['sombre', 'somber'],
        explanation: "'Sombre' sets the dreary, oppressive tone at the start of Jane Eyre."
      },
      {
        id: 'je-q2',
        type: 'retrieval',
        question: "For how long had the children walked in the leafless shrubbery during the morning?",
        hint: "Sixty minutes",
        answer: 'an hour',
        acceptableAnswers: ['an hour', 'hour', 'one hour', '1 hour'],
        explanation: "Brontë writes: 'in the leafless shrubbery an hour in the morning'."
      },
      {
        id: 'je-q3',
        type: 'grammar',
        question: "Type the adjective describing the piercing winter rain that soaked through clothing:",
        hint: "Starts with 'p' (11 letters)",
        answer: 'penetrating',
        acceptableAnswers: ['penetrating'],
        explanation: "The rain was so 'penetrating' that outdoor exercise became impossible."
      }
    ]
  },
  {
    id: 'time-machine-1',
    title: 'The Time Machine',
    author: 'H.G. Wells',
    year: 1895,
    gutenbergId: 35,
    gutenbergUrl: 'https://www.gutenberg.org/ebooks/35',
    chapter: 'Chapter 1: The Fourth Dimension',
    difficulty: 'Advanced',
    tags: ['Science Fiction', 'Victorian Science', 'Philosophy'],
    text: "The Time Traveller was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burned brightly, and the soft radiance of the incandescent lamps in the lilies of silver caught the bubbles that flashed and passed in our glasses.",
    vocabulary: [
      { word: 'recondite', definition: 'Dealing with obscure, profound, or little-known knowledge' },
      { word: 'expounding', definition: 'Presenting and explaining a theory or idea systematically and in detail' },
      { word: 'incandescent', definition: 'Emitting brilliant light as a consequence of being heated' },
      { word: 'radiance', definition: 'Light or heat as emitted or reflected by something luminous' }
    ],
        qaFollowup: {
      question: "What fourth dimension was the Time Traveller describing to his guests?",
      answer: "Time, along which our consciousness moves through Space.",
      contextNote: "H.G. Wells grounded Victorian speculative romance in modern physical and temporal theory."
    },
questions: [
      {
        id: 'tm-q1',
        type: 'vocabulary',
        question: "Find and type the sophisticated adjective meaning obscure, abstruse, or difficult to grasp:",
        hint: "Starts with 'r' (9 letters)",
        answer: 'recondite',
        acceptableAnswers: ['recondite'],
        explanation: "'Recondite' is a hallmark literary vocabulary word denoting deep, esoteric concepts."
      },
      {
        id: 'tm-q2',
        type: 'vocabulary',
        question: "Type the verb participle meaning systematically explaining or presenting a complex subject:",
        hint: "Starts with 'e' (10 letters)",
        answer: 'expounding',
        acceptableAnswers: ['expounding', 'expound'],
        explanation: "'Expounding' implies an authoritative and thorough lecture on a subject."
      },
      {
        id: 'tm-q3',
        type: 'retrieval',
        question: "What color were the Time Traveller's shining and twinkling eyes?",
        hint: "British or American spelling of the colour",
        answer: 'grey',
        acceptableAnswers: ['grey', 'gray'],
        explanation: "Wells notes: 'His grey eyes shone and twinkled'."
      }
    ]
  }
];
