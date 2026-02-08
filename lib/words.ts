export type WordDef = {
  word: string;
  description: string;
};

export type WordSet = {
  civilian: WordDef;
  undercover: WordDef[];
  categories?: string[];
};

export function normalizeWord(value: string): string {
  return value.trim().toLowerCase();
}

export function makePairKey(a: string, b: string): string {
  const [first, second] = [normalizeWord(a), normalizeWord(b)].sort();
  return `${first}|${second}`;
}
