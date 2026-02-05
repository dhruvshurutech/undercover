"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 space-y-8">
      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="relative bg-background p-4 rounded-full border-2 border-primary/50 shadow-lg shadow-primary/20"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </motion.div>
      </div>

      <div className="space-y-2 text-center">
        <motion.h2
          className="text-2xl font-bold tracking-tight"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Contacting HQ...
        </motion.h2>
        <p className="text-muted-foreground flex flex-col gap-1 items-center">
          <span>Encrypting communications...</span>
          <span className="text-xs opacity-70">
            Scanning for infiltrators...
          </span>
        </p>
      </div>
    </div>
  );
}
