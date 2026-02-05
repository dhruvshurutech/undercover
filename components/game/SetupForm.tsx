"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");

  const addPlayer = () => setPlayers([...players, ""]);
  const removePlayer = (index: number) =>
    setPlayers(players.filter((_, i) => i !== index));
  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };
  const addCategories = (values: string[]) => {
    if (values.length === 0) return;
    const normalized = values
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    if (normalized.length === 0) return;
    const next = new Set([...categories, ...normalized]);
    setCategories(Array.from(next));
  };
  const addCategory = () => {
    addCategories([categoryInput]);
    setCategoryInput("");
  };
  const removeCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const playerCount = players.length;
  // Calculate civilians automatically
  const civilianCount = playerCount - undercoverCount - mrWhiteCount;
  const isValid =
    players.every((p) => p.trim().length > 0) &&
    civilianCount > 0 &&
    playerCount >= 3;

  const { refetch, isFetching } = useQuery({
    queryKey: ["wordSet", categories],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categories.length > 0) {
        params.set("categories", categories.join(","));
      }
      const url =
        params.toString().length > 0
          ? `/api/word-set?${params.toString()}`
          : "/api/word-set";
      const res = await fetch(url);
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
      <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-2 sm:p-4">
        <Card className="min-h-[400px] flex items-center justify-center dossier-panel">
          <LoadingScreen />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-2 sm:p-4">
      <Card className="dossier-panel">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-[var(--font-display)] tracking-[0.2em] uppercase text-center">
            Mission Brief
          </CardTitle>
          <CardDescription className="text-center">
            Assemble your team and configure the operation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Players Inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold uppercase tracking-wider">
                Agents ({playerCount})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-destructive"
                onClick={() => setPlayers(["", "", ""])}
              >
                Clear All
              </Button>
            </div>
            {players.map((player, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Agent ${index + 1}`}
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
              className="w-full border-dashed uppercase tracking-wider"
              onClick={addPlayer}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Agent
            </Button>
          </div>

          {/* Role Settings */}
          <div className="space-y-4 pt-4 border-t border-dashed">
            <Label className="text-base font-semibold uppercase tracking-wider">
              Role Distribution
            </Label>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="uppercase tracking-wider text-xs">
                  Undercover
                </Label>
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
                <Label className="uppercase tracking-wider text-xs">
                  Mr. White
                </Label>
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

            <div className="flex items-center justify-between p-3 bg-muted/70 rounded-lg text-sm">
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

            <div className="flex items-center space-x-2 pt-4 border-t border-dashed">
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

          {/* Categories */}
          <div className="space-y-3 pt-4 border-t border-dashed">
            <Label className="text-base font-semibold uppercase tracking-wider">
              Categories (optional)
            </Label>
            <p className="text-xs text-muted-foreground">
              Add one or more categories to guide the word set (e.g. food,
              movies, travel).
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Add a category"
                value={categoryInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes(",")) {
                    const parts = value.split(",");
                    const pending = parts.pop() ?? "";
                    addCategories(parts);
                    setCategoryInput(pending.trimStart());
                  } else {
                    setCategoryInput(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCategory();
                  }
                  if (e.key === ",") {
                    e.preventDefault();
                    addCategory();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="uppercase tracking-wider"
                onClick={addCategory}
              >
                Add
              </Button>
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="flex items-center gap-2 uppercase tracking-wider text-[10px]"
                  >
                    <span>{category}</span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => removeCategory(category)}
                      aria-label={`Remove ${category}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full text-lg h-12 uppercase tracking-widest"
            onClick={handleStart}
            disabled={!isValid || isFetching}
          >
            Start Mission
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent className="dossier-panel">
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
