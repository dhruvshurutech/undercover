import { WordSet, WordDef } from "./words";
import { v4 as uuidv4 } from "uuid";

export type Role = "Civilian" | "Undercover" | "MrWhite";

export interface Player {
  id: string;
  name: string;
  role: Role;
  word: WordDef | null;
  isAlive: boolean;
  avatar: string; // Just an emoji for now
}

export interface GameSettings {
  civilianCount: number;
  undercoverCount: number;
  mrWhiteCount: number;
  blindMode: boolean;
}

export function assignRoles(
  playerNames: string[],
  settings: GameSettings,
  wordSet: WordSet,
): Player[] {
  const totalPlayers = playerNames.length;
  const { civilianCount, undercoverCount, mrWhiteCount } = settings;

  if (civilianCount + undercoverCount + mrWhiteCount !== totalPlayers) {
    throw new Error("Player count does not match role distribution");
  }

  // Create an array of roles to shuffle
  const roles: Role[] = [
    ...Array(civilianCount).fill("Civilian"),
    ...Array(undercoverCount).fill("Undercover"),
    ...Array(mrWhiteCount).fill("MrWhite"),
  ];

  // Knuth shuffle
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  // Shuffle undercover words to distribute them randomly among undercover players
  const undercoverWords = [...wordSet.undercover];
  // Fisher-Yates shuffle for undercover words
  for (let i = undercoverWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [undercoverWords[i], undercoverWords[j]] = [
      undercoverWords[j],
      undercoverWords[i],
    ];
  }

  let undercoverIndex = 0;

  // Map names to players with assigned roles
  return playerNames.map((name, index) => {
    const role = roles[index];
    let word: WordDef | null = null;

    if (role === "Civilian") {
      word = wordSet.civilian;
    } else if (role === "Undercover") {
      // Assign distinct words if available, otherwise cycle through
      word = undercoverWords[undercoverIndex % undercoverWords.length];
      undercoverIndex++;
    } else if (role === "MrWhite") {
      word = null;
    }

    return {
      id: uuidv4(),
      name,
      role,
      word,
      isAlive: true,
      avatar: "👤", // Placeholder
    };
  });
}

// Helper to get next active player index
export function getNextPlayerIndex(
  players: Player[],
  currentIndex: number,
): number {
  let nextIndex = (currentIndex + 1) % players.length;
  while (!players[nextIndex].isAlive) {
    nextIndex = (nextIndex + 1) % players.length;
    // Safety check if everyone is dead (shouldn't happen in logic)
    if (nextIndex === currentIndex) break;
  }
  return nextIndex;
}
