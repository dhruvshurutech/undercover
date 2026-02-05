"use client";

import { useGameStore } from "@/lib/store";
import { Player } from "@/lib/game-logic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skull, Gavel, CheckCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full p-4 space-y-6 bg-destructive/5 rounded-3xl border-2 border-destructive/10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Gavel className="h-8 w-8" /> Voting Time
        </h2>
        <p className="text-muted-foreground">
          Who is the intruder? Tap to eliminate.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {alivePlayers.map((player) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="cursor-pointer hover:bg-destructive/10 transition-colors border-2 hover:border-destructive/50"
              onClick={() => handleSelect(player)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{player.avatar}</span>
                  <span className="font-semibold text-lg">{player.name}</span>
                </div>
                <Skull className="h-5 w-5 text-destructive" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminate {selectedPlayer?.name}?</DialogTitle>
            <DialogDescription>
              Are you sure? This cannot be undone.
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
        <DialogContent>
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
            <Label>Guess the word</Label>
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
        <DialogContent>
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
