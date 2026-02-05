export type WordDef = {
  word: string;
  description: string;
};

export type WordSet = {
  civilian: WordDef;
  undercover: WordDef[];
};
