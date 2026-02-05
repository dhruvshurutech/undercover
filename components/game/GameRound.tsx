"use client";

import { useGameStore } from "@/lib/store";
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
import { Eye, CheckCircle, Skull } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function GameRound() {
  const {
    players,
    currentRound,
    eliminatePlayer,
    setPhase,
    setWinner,
    settings,
  } = useGameStore();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showWordDialog, setShowWordDialog] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Filter alive players
  const alivePlayers = players.filter((p) => p.isAlive);
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  // Handle countdown
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsRevealed(true);
    }
  }, [countdown]);

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setShowWordDialog(true);
    setCountdown(null);
    setIsRevealed(false);
  };

  const startRevealProcess = () => {
    setCountdown(3);
  };

  const closeDialog = () => {
    setShowWordDialog(false);
    setSelectedPlayerId(null);
    setCountdown(null);
    setIsRevealed(false);
  };

  const checkWinCondition = () => {
    // Re-fetch state after elimination
    const currentPlayers = useGameStore.getState().players;
    const alive = currentPlayers.filter((p) => p.isAlive);
    const undercovers = alive.filter((p) => p.role === "Undercover");
    const mrWhites = alive.filter((p) => p.role === "MrWhite");
    const civilians = alive.filter((p) => p.role === "Civilian");

    const totalImpostors = undercovers.length + mrWhites.length;

    if (totalImpostors === 0) {
      setWinner("Civilians");
    } else if (totalImpostors >= civilians.length) {
      setWinner("Infiltrators");
    }
  };

  const handleStartVoting = () => {
    setPhase("VOTING");
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Round {currentRound}
        </h2>
        <p className="text-muted-foreground">Discuss and find the impostors!</p>
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
              className="cursor-pointer hover:bg-accent/50 transition-colors border-2 hover:border-primary/50"
              onClick={() => handlePlayerClick(player.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{player.avatar}</span>
                  <span className="font-semibold text-lg">{player.name}</span>
                </div>
                <Eye className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-2xl pt-4">
        <Button
          size="lg"
          variant="destructive"
          className="w-full text-lg h-12"
          onClick={handleStartVoting}
        >
          Start Voting
        </Button>
      </div>

      <Dialog open={showWordDialog} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check Secret Word</DialogTitle>
            <DialogDescription>
              Verify your identity to see your secret word.
            </DialogDescription>
          </DialogHeader>

          {!countdown && !isRevealed && (
            <div className="space-y-4 py-4 text-center">
              <p className="text-lg">
                Are you <strong>{selectedPlayer?.name}</strong>?
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button onClick={startRevealProcess}>Yes, Show Word</Button>
              </div>
            </div>
          )}

          {countdown !== null && countdown > 0 && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <span className="text-6xl font-black text-primary animate-pulse">
                {countdown}
              </span>
              <p className="text-muted-foreground">Revealing...</p>
            </div>
          )}

          {isRevealed && selectedPlayer && (
            <div className="py-6 space-y-6 text-center animate-in zoom-in-50 duration-300">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Your Word
                </h3>
                {selectedPlayer.word ? (
                  <div className="bg-secondary/30 p-4 rounded-xl">
                    <p className="text-3xl font-black text-primary mb-2">
                      {selectedPlayer.word.word}
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      {selectedPlayer.word.description}
                    </p>
                  </div>
                ) : (
                  <div className="bg-destructive/10 p-4 rounded-xl">
                    <span className="text-2xl font-bold text-destructive">
                      NO WORD
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">
                      You are <strong>Mr. White</strong>
                    </p>
                  </div>
                )}
              </div>

              {selectedPlayer.role === "Undercover" && !settings.blindMode && (
                <p className="text-sm text-destructive font-medium">
                  You are an Undercover!
                </p>
              )}

              <Button onClick={closeDialog} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" /> Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
