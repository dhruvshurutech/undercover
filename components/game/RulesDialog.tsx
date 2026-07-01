"use client";

import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function RulesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs uppercase tracking-wider"
        >
          <BookOpen className="mr-2 h-4 w-4" /> Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md dossier-panel">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-wider">
            Field Manual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <ul className="space-y-1.5">
            <li>
              😇 <span className="font-semibold text-emerald-500">Civilian</span>
              {" "}— same word as everyone else.
            </li>
            <li>
              🕵️ <span className="font-semibold text-red-500">Undercover</span>
              {" "}— close, but not the same word.
            </li>
            <li>
              🃏 <span className="font-semibold text-amber-500">Mr. White</span>
              {" "}— no word. Total bluff.
            </li>
          </ul>

          <p className="border-t border-dashed pt-3">
            Describe your word in one line, then vote out who sounds off.
          </p>

          <ul className="space-y-1.5 border-t border-dashed pt-3">
            <li>😇 Civilians win by voting out every Infiltrator.</li>
            <li>🕵️ Infiltrators win by outnumbering the Civilians left.</li>
            <li>🃏 Mr. White wins instantly by guessing the word right if caught.</li>
            <li className="text-muted-foreground">
              Undercover wins by staying hidden and helping vote out Civilians — not by guessing.
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
