export type WordDef = {
  word: string;
  description: string;
};

export type WordSet = {
  civilian: WordDef;
  undercover: WordDef[]; // Array for multiple undercover variations
  categories?: string[];
};

const WORD_SETS: WordSet[] = [
  {
    civilian: {
      word: "Tea",
      description:
        "A hot drink made by infusing dried crushed leaves in boiling water.",
    },
    categories: ["drinks", "beverages"],
    undercover: [
      {
        word: "Coffee",
        description:
          "A hot drink made from the roasted and ground seeds (beans) of a tropical shrub.",
      },
      {
        word: "Matcha",
        description:
          "Finely ground powder of specially grown and processed green tea leaves.",
      },
      {
        word: "Chai",
        description:
          "A tea beverage made by boiling black tea in milk and water with a mixture of aromatic herbs and spices.",
      },
    ],
  },
  {
    civilian: {
      word: "Facebook",
      description:
        "A social networking site that makes it easy to connect and share with family and friends.",
    },
    categories: ["social media", "technology"],
    undercover: [
      {
        word: "Twitter",
        description:
          "A social networking service on which users post and interact with messages known as 'tweets'.",
      },
      {
        word: "Instagram",
        description: "A photo and video sharing social networking service.",
      },
      {
        word: "LinkedIn",
        description: "A business and employment-oriented online service.",
      },
    ],
  },
  {
    civilian: {
      word: "Apple",
      description: "A round fruit with red or green skin and a whitish inside.",
    },
    categories: ["fruit", "food"],
    undercover: [
      {
        word: "Orange",
        description:
          "A round juicy citrus fruit with a tough bright reddish-yellow rind.",
      },
      {
        word: "Pear",
        description:
          "A yellowish- or brownish-green edible fruit that is typically narrow at the stalk and wider towards the base.",
      },
      {
        word: "Mango",
        description:
          "A fleshy, oval, yellowish-red tropical fruit that is eaten ripe or used green for pickles or chutneys.",
      },
    ],
  },
  {
    civilian: {
      word: "Sun",
      description: "The star around which the earth orbits.",
    },
    categories: ["space", "astronomy"],
    undercover: [
      {
        word: "Moon",
        description:
          "The natural satellite of the earth, visible (chiefly at night) by reflected light from the sun.",
      },
      {
        word: "Star",
        description:
          "A fixed luminous point in the night sky which is a large, remote incandescent body like the sun.",
      },
      {
        word: "Planet",
        description:
          "A celestial body moving in an elliptical orbit around a star.",
      },
    ],
  },
  {
    civilian: {
      word: "Train",
      description:
        "A series of railway carriages or wagons moved as a unit by a locomotive.",
    },
    categories: ["transportation", "travel"],
    undercover: [
      {
        word: "Subway",
        description: "An underground electric railroad.",
      },
      {
        word: "Bus",
        description: "A large motor vehicle carrying passengers by road.",
      },
      {
        word: "Tram",
        description:
          "A passenger vehicle powered by electricity conveyed by overhead cables, and running on rails laid in a public road.",
      },
    ],
  },
  {
    civilian: {
      word: "Guitar",
      description:
        "A stringed musical instrument, with a fretted fingerboard, typically incurved sides, and six or twelve strings, played by plucking or strumming.",
    },
    categories: ["music", "instruments"],
    undercover: [
      {
        word: "Violin",
        description:
          "A stringed musical instrument of treble pitch, played with a horsehair bow.",
      },
      {
        word: "Ukulele",
        description: "A small four-stringed guitar of Hawaiian origin.",
      },
      {
        word: "Cello",
        description:
          "A bass instrument of the violin family, held upright on the floor between the legs of the seated player.",
      },
    ],
  },
];

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

export function getStaticWordSet(categories?: string[]): WordSet {
  if (!categories || categories.length === 0) {
    const index = Math.floor(Math.random() * WORD_SETS.length);
    return WORD_SETS[index];
  }

  const wanted = categories.map(normalizeCategory).filter(Boolean);
  const filtered = WORD_SETS.filter((set) => {
    if (!set.categories || set.categories.length === 0) return false;
    const setCategories = set.categories.map(normalizeCategory);
    return wanted.some((cat) => setCategories.includes(cat));
  });

  const pool = filtered.length > 0 ? filtered : WORD_SETS;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
