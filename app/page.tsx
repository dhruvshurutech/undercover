"use client";

import { useGameStore } from "@/lib/store";
import { SetupForm } from "@/components/game/SetupForm";
import { RoleReveal } from "@/components/game/RoleReveal";
import { GameRound } from "@/components/game/GameRound";
import { Voting } from "@/components/game/Voting";
import { GameOver } from "@/components/game/GameOver";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const [clock, setClock] = useState("");
  const showClock = phase !== "SETUP";
  const prefersReducedMotion = useReducedMotion();

  // Handling hydration mismatch for persisted store
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!showClock) return;
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setClock(`${hours}:${minutes}:${seconds}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [showClock]);

  if (!mounted)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl font-bold text-muted-foreground">
          Loading Undercover...
        </div>
      </div>
    );

  return (
    <main className="min-h-screen text-foreground relative overflow-hidden">
      <div className="absolute inset-0 dossier-bg" />
      <div className="absolute inset-0 opacity-40 dossier-grid" />
      <div className="relative z-10 flex flex-col min-h-screen py-6 sm:py-10">
        <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border border-border/60 bg-secondary/70 flex items-center justify-center font-black">
                U
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  Operation
                </p>
                <h1 className="text-3xl sm:text-4xl font-[var(--font-display)] tracking-[0.12em] uppercase">
                  Undercover
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {showClock && (
                <div className="flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.2em] shadow-sm">
                  <span className="text-primary/80">Time</span>
                  <span className="font-mono text-primary font-semibold">
                    {clock}
                  </span>
                </div>
              )}
              {phase !== "SETUP" && phase !== "GAME_OVER" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs uppercase tracking-wider"
                  onClick={() => setShowQuitConfirm(true)}
                >
                  Quit Mission
                </Button>
              )}
              <div className="ml-auto sm:ml-0 flex items-center">
                <ModeToggle />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground -mt-1">
            <span className="stamp">Classified</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={phase}
                className="px-3 py-1 rounded-full border border-border/60 bg-secondary/60"
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 6 }
                }
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -6 }
                }
                transition={{ duration: 0.2 }}
              >
                {phase.replace("_", " ")}
              </motion.span>
            </AnimatePresence>
          </div>
        </header>

        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex-1 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`wipe-${phase}`}
              className="absolute inset-0 pointer-events-none rounded-3xl bg-primary/10 border border-primary/20"
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { scaleX: 0, originX: 0, opacity: 0.6 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { scaleX: 1, opacity: 0.2 }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { scaleX: 0, originX: 1, opacity: 0 }
              }
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
          </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12 }
            }
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -12 }
            }
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
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
      </div>

      <AlertDialog open={showQuitConfirm} onOpenChange={setShowQuitConfirm}>
        <AlertDialogContent className="dossier-panel">
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
