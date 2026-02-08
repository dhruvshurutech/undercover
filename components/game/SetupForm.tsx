"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { makePairKey } from "@/lib/words";

export function SetupForm() {
  const startGame = useGameStore((state) => state.startGame);
  const recentPairs = useGameStore((state) => state.recentPairs);
  const addRecentPair = useGameStore((state) => state.addRecentPair);
  const aiPreferences = useGameStore((state) => state.aiPreferences);
  const setAiPreferences = useGameStore((state) => state.setAiPreferences);
  const categoryPreferences = useGameStore(
    (state) => state.categoryPreferences,
  );
  const setCategoryPreferences = useGameStore(
    (state) => state.setCategoryPreferences,
  );

  const storedPlayers = useGameStore((state) => state.players);
  const [players, setPlayers] = useState<string[]>(
    storedPlayers.length > 0 ? storedPlayers.map((p) => p.name) : ["", "", ""],
  );
  const [undercoverCount, setUndercoverCount] = useState(1);
  const [mrWhiteCount, setMrWhiteCount] = useState(0);
  const [blindMode, setBlindMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(categoryPreferences);
  const [categoryInput, setCategoryInput] = useState("");
  const [wordSource, setWordSource] = useState<"ai" | "files">("ai");
  const [aiPrompt, setAiPrompt] = useState(aiPreferences.prompt);
  const [showPrompt, setShowPrompt] = useState(false);

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

  useEffect(() => {
    const maxMrWhite = Math.max(0, playerCount - undercoverCount - 1);
    const maxUndercover = Math.max(1, playerCount - mrWhiteCount - 1);
    if (mrWhiteCount > maxMrWhite) {
      setMrWhiteCount(maxMrWhite);
    }
    if (undercoverCount > maxUndercover) {
      setUndercoverCount(maxUndercover);
    }
  }, [playerCount, undercoverCount, mrWhiteCount]);

  useEffect(() => {
    setAiPreferences({ prompt: aiPrompt });
  }, [aiPrompt, setAiPreferences]);

  useEffect(() => {
    setCategoryPreferences(categories);
  }, [categories, setCategoryPreferences]);

  const { refetch, isFetching } = useQuery({
    queryKey: ["wordSet", categories, wordSource, recentPairs, aiPrompt],
    queryFn: async () => {
      const res = await fetch("/api/word-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories,
          source: wordSource,
          excludePairs: recentPairs.slice(0, 12),
          prompt: wordSource === "ai" ? aiPrompt.trim() : undefined,
        }),
      });
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
      wordSet.undercover.forEach((undercover) => {
        addRecentPair(makePairKey(wordSet.civilian.word, undercover.word));
      });
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
                max={Math.max(1, playerCount - mrWhiteCount - 1)}
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
                max={Math.max(0, playerCount - undercoverCount - 1)}
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

          {/* Word Source */}
          <div className="space-y-3 pt-4 border-t border-dashed">
            <Label className="text-base font-semibold uppercase tracking-wider">
              Word Source
            </Label>
            <p className="text-xs text-muted-foreground">
              Choose between AI-generated words or curated file-based pairs.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={wordSource === "ai" ? "default" : "outline"}
                className="uppercase tracking-wider"
                onClick={() => setWordSource("ai")}
              >
                AI
              </Button>
              <Button
                type="button"
                variant={wordSource === "files" ? "default" : "outline"}
                className="uppercase tracking-wider"
                onClick={() => setWordSource("files")}
              >
                Files
              </Button>
            </div>
            {wordSource === "ai" && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-between w-full uppercase tracking-wider text-xs"
                  onClick={() => setShowPrompt((prev) => !prev)}
                >
                  Custom Prompt (optional)
                  <span className="text-muted-foreground">
                    {showPrompt ? "Hide" : "Show"}
                  </span>
                </Button>
                {showPrompt && (
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Add extra instructions for the AI..."
                    className="min-h-[90px]"
                  />
                )}
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
