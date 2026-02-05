"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export function RoleReveal() {
  const { players, currentTurnIndex, nextTurn, setPhase, settings } =
    useGameStore();
  const [isRevealed, setIsRevealed] = useState(false);

  // Start with "Wait" state (Pass device)
  // When confirmed, show "Reveal" state

  const currentPlayer = players[currentTurnIndex];

  // Check if everyone has seen their role
  useEffect(() => {
    if (currentTurnIndex >= players.length) {
      // Reset index for the first round of descriptions
      useGameStore.getState().setPhase("ROUND");
      // Ideally we should have a 'setTurnIndex(0)' or similar, relying on logic to handle reset
      // Actually, nextTurn modulo checks might mess us up if we just let it go out of bounds.
      // Let's assume the store handles index wrapping or we manually reset it.
      // In store.ts: nextSlide does modulo. So index goes 0 -> 1 -> ... -> 0.
      // We need to track *how many* have seen it.
      // This logic is flawed if we reuse `currentTurnIndex` which wraps.
      // Let's use a local counter or check 'Round' number?
      // For MVP, let's keep it simple: RoleReveal component manages the sequence locally?
      // No, store is better.
    }
  }, [currentTurnIndex, players.length, setPhase]);

  // If we just loop back to 0, that's fine for "Turn 1 of Description".
  // But we need to know we finished Role Reveal.
  // Let's assume when index loops back to 0, we change phase.
  // But `nextTurn` in store wraps around.

  const handleNext = () => {
    setIsRevealed(false);
    if (currentTurnIndex === players.length - 1) {
      // Last player just finished
      useGameStore.setState({ currentTurnIndex: 0, phase: "ROUND" });
    } else {
      nextTurn();
    }
  };

  if (!currentPlayer) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-8">
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="pass-device"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-6xl animate-bounce">📱</div>
            <h2 className="text-3xl font-bold tracking-tight">
              Pass to {currentPlayer.name}
            </h2>
            <p className="text-muted-foreground">
              Keep your screen hidden from others!
            </p>
            <Button
              size="lg"
              className="mt-8 text-xl px-8 py-6 w-full max-w-xs"
              onClick={() => setIsRevealed(true)}
            >
              View your Word
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="reveal-role"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardContent className="pt-10 pb-10 flex flex-col items-center gap-6">
                <div className="space-y-2 text-center">
                  <span className="text-sm font-uppercase text-muted-foreground tracking-widest">
                    YOUR SECRET WORD
                  </span>

                  <div className="text-4xl font-black text-primary p-6 bg-secondary/30 rounded-xl min-w-[200px]">
                    {currentPlayer.word === null ? (
                      <span className="text-destructive">NO WORD</span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span>{currentPlayer.word.word}</span>
                        <span className="text-sm font-normal text-muted-foreground italic px-2">
                          {currentPlayer.word.description}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {currentPlayer.word === null && (
                  <p className="text-sm px-4 text-muted-foreground">
                    You are <strong>Mr. White</strong>. Try to guess the
                    Civilians' word!
                  </p>
                )}

                {currentPlayer.role === "Undercover" && !settings.blindMode && (
                  <p className="text-sm px-4 text-muted-foreground">
                    You are the <strong>Undercover</strong>. Don't get caught!
                  </p>
                )}

                {currentPlayer.role === "Civilian" && !settings.blindMode && (
                  <p className="text-sm px-4 text-muted-foreground">
                    You are a <strong>Civilian</strong>. Find the intruders!
                  </p>
                )}

                <Button
                  onClick={handleNext}
                  className="w-full mt-4"
                  variant="default"
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Got it
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
