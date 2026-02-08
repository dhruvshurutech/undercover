"use client";

import { useGameStore } from "@/lib/store";
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
import { Eye, CheckCircle } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

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
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const verificationMessages = useMemo(
    () => [
      "Scanning retinal signature...",
      "Verifying clearance level...",
      "Checking field credentials...",
      "Decrypting secure channel...",
      "Cross-referencing dossier...",
    ],
    [],
  );

  // Filter alive players
  const alivePlayers = players.filter((p) => p.isAlive);
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  // Handle scanning reveal
  useEffect(() => {
    if (!isScanning) return;
    const timer = setTimeout(() => {
      setIsScanning(false);
      setIsRevealed(true);
    }, 1600);
    return () => clearTimeout(timer);
  }, [isScanning]);

  useEffect(() => {
    if (!showWordDialog) return;
    const timer = setInterval(() => {
      setMessageIndex((index) => (index + 1) % verificationMessages.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [showWordDialog, verificationMessages.length]);

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setShowWordDialog(true);
    setIsRevealed(false);
    setIsScanning(false);
  };

  const startRevealProcess = () => {
    setIsScanning(true);
  };

  const closeDialog = () => {
    setShowWordDialog(false);
    setSelectedPlayerId(null);
    setIsRevealed(false);
    setIsScanning(false);
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
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full p-2 sm:p-4 space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Field Briefing
        </p>
        <h2 className="text-3xl sm:text-4xl font-[var(--font-display)] tracking-[0.2em] uppercase">
          Round {currentRound}
        </h2>
        <p className="text-muted-foreground">
          Discuss, exchange clues, and identify the infiltrators.
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
              className="cursor-pointer dossier-panel transition-colors border-2 border-transparent hover:border-primary/50"
              onClick={() => handlePlayerClick(player.id)}
            >
              <CardContent className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{player.avatar}</span>
                  <span className="font-semibold text-sm">{player.name}</span>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="w-full max-w-3xl pt-4">
        <Button
          size="lg"
          variant="destructive"
          className="w-full text-lg h-12 uppercase tracking-widest"
          onClick={handleStartVoting}
        >
          Start Voting
        </Button>
      </div>

      <Dialog open={showWordDialog} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md dossier-panel">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wider">
              Agent Verification
            </DialogTitle>
            <DialogDescription>
              Confirm identity to access the classified term.
            </DialogDescription>
          </DialogHeader>

          {!isScanning && !isRevealed && (
            <div className="space-y-4 py-4 text-center">
              <p className="text-lg">
                Are you <strong>{selectedPlayer?.name}</strong>?
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button onClick={startRevealProcess}>
                  Yes, Open Dossier
                </Button>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative flex items-center justify-center h-20 w-20">
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/30"
                  animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute h-12 w-12 rounded-full border-2 border-primary/60"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <Eye className="h-10 w-10 text-primary" />
                </motion.div>
              </div>
              <motion.p
                key={messageIndex}
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {verificationMessages[messageIndex]}
              </motion.p>
            </div>
          )}

          {isRevealed && selectedPlayer && (
            <div className="py-6 space-y-6 text-center animate-in zoom-in-50 duration-300">
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-[0.4em]">
                  Classified Term
                </h3>
                {selectedPlayer.word ? (
                  <div className="bg-secondary/40 p-4 rounded-xl">
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
