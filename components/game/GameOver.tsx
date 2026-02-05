"use client";

import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

export function GameOver() {
  const { winner, players, civilianWord, undercoverWord, resetGame } =
    useGameStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-2 sm:p-4 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-3">
        <p className="stamp inline-block">Case Closed</p>
        <h1 className="text-4xl sm:text-6xl font-[var(--font-display)] tracking-[0.2em] uppercase">
          {winner === "Civilians" && (
            <span className="text-emerald-500">Civilians Win</span>
          )}
          {winner === "Infiltrators" && (
            <span className="text-red-500">Infiltrators Win</span>
          )}
          {winner === "MrWhite" && (
            <span className="text-amber-500">Mr. White Wins</span>
          )}
        </h1>
        <p className="text-muted-foreground">
          The operation has concluded. File the final report.
        </p>
      </div>

      <Card className="w-full max-w-2xl dossier-panel">
        <CardHeader>
          <CardTitle className="uppercase tracking-wider">
            Classified Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border-b border-dashed pb-3">
            <span className="font-semibold text-emerald-500 uppercase tracking-wider text-sm">
              Civilians
            </span>
            <span className="font-mono text-lg">{civilianWord?.word}</span>
          </div>
          <div className="flex justify-between items-center pb-2">
            <span className="font-semibold text-red-500 uppercase tracking-wider text-sm">
              Undercover
            </span>
            <span className="font-mono text-lg">{undercoverWord?.word}</span>
          </div>
        </CardContent>
      </Card>

      <div className="w-full max-w-2xl grid gap-3">
        <h3 className="font-semibold text-sm uppercase tracking-[0.4em] px-2 text-muted-foreground">
          Roster Report
        </h3>
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between dossier-panel p-3 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.avatar}</span>
              <span
                className={`font-medium ${!p.isAlive ? "line-through opacity-50" : ""}`}
              >
                {p.name}
              </span>
            </div>
            <span
              className={`text-sm font-bold uppercase tracking-wider ${
                p.role === "Civilian"
                  ? "text-emerald-500"
                  : p.role === "Undercover"
                    ? "text-red-500"
                    : "text-amber-500"
              }`}
            >
              {p.role}
            </span>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        className="w-full max-w-2xl text-lg uppercase tracking-widest"
        onClick={resetGame}
      >
        <RotateCcw className="mr-2 h-5 w-5" /> Run It Back
      </Button>
    </div>
  );
}
