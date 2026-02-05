"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGameStore } from "@/lib/store";
import { LoadingScreen } from "./LoadingScreen";

export function SetupForm() {
  const startGame = useGameStore((state) => state.startGame);

  const storedPlayers = useGameStore((state) => state.players);
  const [players, setPlayers] = useState<string[]>(
    storedPlayers.length > 0 ? storedPlayers.map((p) => p.name) : ["", "", ""],
  );
  const [undercoverCount, setUndercoverCount] = useState(1);
  const [mrWhiteCount, setMrWhiteCount] = useState(1);
  const [blindMode, setBlindMode] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addPlayer = () => setPlayers([...players, ""]);
  const removePlayer = (index: number) =>
    setPlayers(players.filter((_, i) => i !== index));
  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const playerCount = players.length;
  // Calculate civilians automatically
  const civilianCount = playerCount - undercoverCount - mrWhiteCount;
  const isValid =
    players.every((p) => p.trim().length > 0) &&
    civilianCount > 0 &&
    playerCount >= 3;

  const { refetch, isFetching } = useQuery({
    queryKey: ["wordSet"],
    queryFn: async () => {
      const res = await fetch("/api/word-set");
      if (!res.ok) throw new Error("Failed to fetch words");
      return res.json();
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const handleStart = async () => {
    if (!isValid) {
      setError(
        "Please ensure all fields are valid and you have enough civilians.",
      );
      return;
    }

    try {
      const { data: wordSet } = await refetch();
      if (!wordSet) {
        setError("Failed to fetch words. Please check your connection.");
        return;
      }

      startGame(
        players,
        {
          civilianCount,
          undercoverCount,
          mrWhiteCount,
          blindMode,
        },
        wordSet,
      );
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred.");
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4">
        <Card className="min-h-[400px] flex items-center justify-center">
          <LoadingScreen />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            New Game
          </CardTitle>
          <CardDescription className="text-center">
            Enter player names and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Players Inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Players ({playerCount})</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => setPlayers(["", "", ""])}
              >
                Clear All
              </Button>
            </div>
            {players.map((player, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Player ${index + 1}`}
                  value={player}
                  onChange={(e) => updatePlayer(index, e.target.value)}
                />
                {players.length > 3 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={addPlayer}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Player
            </Button>
          </div>

          {/* Role Settings */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold">
              Roles Distribution
            </Label>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Undercovers</Label>
                <span className="font-mono bg-secondary px-2 py-1 rounded">
                  {undercoverCount}
                </span>
              </div>
              <Slider
                value={[undercoverCount]}
                min={1}
                max={Math.floor(playerCount / 2)}
                step={1}
                onValueChange={(vals) => setUndercoverCount(vals[0])}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Mr. White</Label>
                <span className="font-mono bg-secondary px-2 py-1 rounded">
                  {mrWhiteCount}
                </span>
              </div>
              <Slider
                value={[mrWhiteCount]}
                min={0}
                max={Math.max(0, playerCount - undercoverCount - 2)}
                step={1}
                onValueChange={(vals) => setMrWhiteCount(vals[0])}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Civilians</span>
              </div>
              <span className="font-bold">{civilianCount}</span>
            </div>

            {civilianCount <= 0 && (
              <p className="text-xs text-destructive font-medium">
                Not enough Civilians! Add more players or reduce special roles.
              </p>
            )}

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Checkbox
                id="blind-mode"
                checked={blindMode}
                onCheckedChange={(c) => setBlindMode(!!c)}
              />
              <label
                htmlFor="blind-mode"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Undercover Blind Mode&nbsp;
                <span className="text-xs text-red-300">
                  (Hide Role Identity)
                </span>
              </label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full text-lg h-12"
            onClick={handleStart}
            disabled={!isValid || isFetching}
          >
            Start Game
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
