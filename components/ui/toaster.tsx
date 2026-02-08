"use client";

import { useToast } from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex w-[90vw] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`dossier-panel rounded-xl p-3 shadow-lg border ${
            toast.variant === "destructive"
              ? "border-destructive/60"
              : "border-border/70"
          }`}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              {toast.title && (
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {toast.title}
                </p>
              )}
              <p className="text-sm">{toast.description}</p>
            </div>
            <button
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              onClick={() => dismiss(toast.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
