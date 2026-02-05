"use client";

import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, RotateCcw } from "lucide-react";

export function GameOver() {
  const { winner, players, civilianWord, undercoverWord, resetGame } =
    useGameStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-4">
        <Crown className="h-20 w-20 mx-auto text-yellow-500 animate-bounce" />
        <h1 className="text-5xl font-black tracking-tighter">
          {winner === "Civilians" && (
            <span className="text-green-500">Civilians Win!</span>
          )}
          {winner === "Infiltrators" && (
            <span className="text-red-500">Infiltrators Win!</span>
          )}
          {winner === "MrWhite" && (
            <span className="text-purple-500">Mr. White Wins!</span>
          )}
        </h1>
        <p className="text-xl text-muted-foreground">The game is over.</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Secret Words</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-semibold text-green-600">Civilians</span>
            <span className="font-mono text-lg">{civilianWord?.word}</span>
          </div>
          <div className="flex justify-between items-center pb-2">
            <span className="font-semibold text-red-600">Undercover</span>
            <span className="font-mono text-lg">{undercoverWord?.word}</span>
          </div>
        </CardContent>
      </Card>

      <div className="w-full max-w-md grid gap-3">
        <h3 className="font-bold text-lg px-2">Player Roles</h3>
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-secondary/20 p-3 rounded-lg"
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
              className={`text-sm font-bold ${
                p.role === "Civilian"
                  ? "text-green-600"
                  : p.role === "Undercover"
                    ? "text-red-600"
                    : "text-purple-600"
              }`}
            >
              {p.role}
            </span>
          </div>
        ))}
      </div>

      <Button size="lg" className="w-full max-w-md text-lg" onClick={resetGame}>
        <RotateCcw className="mr-2 h-5 w-5" /> Play Again
      </Button>
    </div>
  );
}
