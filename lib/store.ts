import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Player,
  GameSettings,
  assignRoles,
  getNextPlayerIndex,
} from "./game-logic";
import { WordSet, WordDef } from "./words";

export type GamePhase =
  | "SETUP"
  | "ROLE_REVEAL"
  | "ROUND"
  | "VOTING"
  | "GAME_OVER";

interface GameState {
  players: Player[];
  settings: GameSettings;
  phase: GamePhase;
  currentTurnIndex: number;
  currentRound: number;
  civilianWord: WordDef | null;
  undercoverWord: WordDef | null;
  winner: "Civilians" | "Infiltrators" | "MrWhite" | null;

  // Actions
  setPhase: (phase: GamePhase) => void;
  startGame: (
    playerNames: string[],
    settings: GameSettings,
    wordSet: WordSet,
  ) => void;
  eliminatePlayer: (playerId: string) => void;
  nextTurn: () => void;
  startNextRound: () => void;
  resetGame: () => void;
  setWinner: (winner: "Civilians" | "Infiltrators" | "MrWhite") => void;
}

import LZString from "lz-string";

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // ... (rest of the store implementation) ...
      players: [],
      settings: {
        civilianCount: 0,
        undercoverCount: 0,
        mrWhiteCount: 0,
        blindMode: true,
      },
      phase: "SETUP",
      currentTurnIndex: 0,
      currentRound: 1,
      civilianWord: null,
      undercoverWord: null,
      winner: null,

      setPhase: (phase) => set({ phase }),

      startGame: (playerNames, settings, wordSet) => {
        const players = assignRoles(playerNames, settings, wordSet);

        // Shuffle players for random turn order
        for (let i = players.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [players[i], players[j]] = [players[j], players[i]];
        }

        set({
          players,
          settings,
          phase: "ROLE_REVEAL",
          currentTurnIndex: 0,
          currentRound: 1,
          civilianWord: wordSet.civilian,
          undercoverWord: wordSet.undercover[0],
          winner: null,
        });
      },

      eliminatePlayer: (playerId) => {
        const { players, currentTurnIndex } = get();
        const newPlayers = players.map((p) =>
          p.id === playerId ? { ...p, isAlive: false } : p,
        );
        set({ players: newPlayers });
      },

      nextTurn: () => {
        const { players, currentTurnIndex } = get();
        const nextIndex = getNextPlayerIndex(players, currentTurnIndex);
        set({ currentTurnIndex: nextIndex });
      },

      startNextRound: () => {
        const { players, currentRound } = get();

        // Use a new array copy for shuffling
        const newPlayers = [...players];

        // Shuffle players for random turn order in the next round
        for (let i = newPlayers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newPlayers[i], newPlayers[j]] = [newPlayers[j], newPlayers[i]];
        }

        set({
          phase: "ROUND",
          currentRound: currentRound + 1,
          players: newPlayers,
          currentTurnIndex: 0,
        });
      },

      resetGame: () => {
        set({
          phase: "SETUP",
          // players: [], // Keep players for "Play Again" functionality
          currentRound: 1,
          winner: null,
          civilianWord: null,
          undercoverWord: null,
        });
      },

      setWinner: (winner) => set({ winner, phase: "GAME_OVER" }),
    }),
    {
      name: "undercover-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const decoded = LZString.decompressFromUTF16(str);
          return decoded ? JSON.parse(decoded) : null;
        },
        setItem: (name, value) => {
          const compressed = LZString.compressToUTF16(JSON.stringify(value));
          localStorage.setItem(name, compressed);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);
