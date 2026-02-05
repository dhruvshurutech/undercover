"use client";

import { useGameStore } from "@/lib/store";
import { SetupForm } from "@/components/game/SetupForm";
import { RoleReveal } from "@/components/game/RoleReveal";
import { GameRound } from "@/components/game/GameRound";
import { Voting } from "@/components/game/Voting";
import { GameOver } from "@/components/game/GameOver";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ModeToggle } from "@/components/theme-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const phase = useGameStore((state) => state.phase);
  const resetGame = useGameStore((state) => state.resetGame);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Handling hydration mismatch for persisted store
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl font-bold text-muted-foreground">
          Loading Undercover...
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20 text-foreground flex flex-col items-center py-6 sm:py-12 transition-colors duration-500 overflow-hidden">
      <div className="absolute top-4 left-4 z-50">
        <ModeToggle />
      </div>
      <header className="w-full max-w-xl px-6 flex justify-center items-center mb-6 relative z-10">
        <h1 className="text-xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Undercover
        </h1>
        {phase !== "SETUP" && phase !== "GAME_OVER" && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => setShowQuitConfirm(true)}
          >
            Quit
          </Button>
        )}
      </header>

      <div className="w-full max-w-xl px-4 flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {phase === "SETUP" && <SetupForm />}
            {phase === "ROLE_REVEAL" && <RoleReveal />}
            {phase === "ROUND" && <GameRound />}
            {phase === "VOTING" && <Voting />}
            {phase === "GAME_OVER" && <GameOver />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AlertDialog open={showQuitConfirm} onOpenChange={setShowQuitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quit Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to quit current game? All progress will be
              lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => resetGame()}>
              Quit Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
