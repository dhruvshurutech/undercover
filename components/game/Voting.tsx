"use client";

import { useGameStore } from "@/lib/store";
import { Player } from "@/lib/game-logic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skull, Gavel } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export function Voting() {
  const {
    players,
    eliminatePlayer,
    setPhase,
    setWinner,
    civilianWord,
    startNextRound,
  } = useGameStore();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMrWhiteGuess, setShowMrWhiteGuess] = useState(false);
  const [mrWhiteGuess, setMrWhiteGuess] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const alivePlayers = players.filter((p) => p.isAlive);

  const handleSelect = (p: Player) => {
    setSelectedPlayer(p);
    setShowConfirm(true);
  };

  const checkWinConditions = () => {
    // Re-query state because we just eliminated someone
    // Since state update might be async or batched, we need to be careful.
    // We can calculate based on 'new' state.

    // We can't rely on 'players' from hook immediately if we just called 'eliminatePlayer'.
    // We should compute the 'future' state locally.

    const updatedPlayers = players.map((p) =>
      p.id === selectedPlayer?.id ? { ...p, isAlive: false } : p,
    );

    const activeStats = updatedPlayers
      .filter((p) => p.isAlive)
      .reduce(
        (acc, p) => {
          if (p.role === "Civilian") acc.civilians++;
          else acc.infiltrators++; // Undercover + MrWhite
          return acc;
        },
        { civilians: 0, infiltrators: 0 },
      );

    if (activeStats.infiltrators === 0) {
      setWinner("Civilians");
      return true;
    }

    if (activeStats.infiltrators >= activeStats.civilians) {
      setWinner("Infiltrators");
      return true;
    }

    return false;
  };

  const confirmElimination = () => {
    if (!selectedPlayer) return;

    if (selectedPlayer.role === "MrWhite") {
      setShowConfirm(false);
      setShowMrWhiteGuess(true);
      return;
    }

    // Normal elimination
    eliminatePlayer(selectedPlayer.id);
    const gameOver = checkWinConditions();

    if (!gameOver) {
      // Provide role feedback? Usually yes.
      setAlertMessage(`${selectedPlayer.name} was ${selectedPlayer.role}!`);
      startNextRound();
    }
    setShowConfirm(false);
    setSelectedPlayer(null);
  };

  const handleMrWhiteGuess = () => {
    // Check guess (loose match)
    const isCorrect =
      civilianWord?.word &&
      mrWhiteGuess.trim().toLowerCase() === civilianWord.word.toLowerCase();

    eliminatePlayer(selectedPlayer!.id);

    if (isCorrect) {
      setWinner("MrWhite");
    } else {
      setAlertMessage(`Wrong! The word was ${civilianWord?.word}.`);
      const gameOver = checkWinConditions();
      if (!gameOver) {
        startNextRound();
      }
    }
    setShowMrWhiteGuess(false);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full p-2 sm:p-4 space-y-6 bg-secondary/40 border border-border/70 rounded-3xl shadow-[0_18px_60px_rgba(10,10,10,0.18)]">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Tribunal
        </p>
        <h2 className="text-3xl sm:text-4xl font-[var(--font-display)] tracking-[0.2em] uppercase flex items-center justify-center gap-2">
          <Gavel className="h-8 w-8 text-amber-600" /> Verdict
        </h2>
        <p className="text-muted-foreground">
          Identify the infiltrator and mark them for removal.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-2 w-full max-w-3xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: prefersReducedMotion
              ? { duration: 0.01 }
              : { staggerChildren: 0.05, delayChildren: 0.05 },
          },
        }}
      >
        {alivePlayers.map((player) => (
          <motion.div
            key={player.id}
            variants={{
              hidden: { opacity: 0, y: 8, scale: 0.98 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <Card
              className="cursor-pointer dossier-panel transition-colors border-2 border-transparent hover:border-amber-600/70 bg-card"
              onClick={() => handleSelect(player)}
            >
              <CardContent className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{player.avatar}</span>
                  <span className="font-semibold text-sm">{player.name}</span>
                </div>
                <Skull className="h-4 w-4 text-amber-600" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="dossier-panel">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wider">
              Eliminate {selectedPlayer?.name}?
            </DialogTitle>
            <DialogDescription>
              Are you sure? This decision is final.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmElimination}>
              <Skull className="mr-2 h-4 w-4" /> Eliminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showMrWhiteGuess}
        onOpenChange={(open) => !open && setShowMrWhiteGuess(false)}
      >
        <DialogContent className="dossier-panel">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Mr. White Detected!
            </DialogTitle>
            <DialogDescription>
              {selectedPlayer?.name} is Mr. White. They have one chance to guess
              the Civilians' word to steal the win!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2">Guess the word</Label>
            <Input
              value={mrWhiteGuess}
              onChange={(e) => setMrWhiteGuess(e.target.value)}
              placeholder="Type the word..."
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleMrWhiteGuess}
              disabled={!mrWhiteGuess.trim()}
            >
              Submit Guess
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!alertMessage} onOpenChange={() => setAlertMessage(null)}>
        <DialogContent className="dossier-panel">
          <DialogHeader>
            <DialogTitle>Game Update</DialogTitle>
            <DialogDescription>{alertMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setAlertMessage(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
