"use client";

import { Check, CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastMessage = { type: "ok" | "error"; text: string };

export function Toast({ toast, onClose }: { toast: ToastMessage | null; onClose: () => void }) {
  if (!toast) return null;
  const error = toast.type === "error";
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[1400] flex justify-center px-4">
      <div
        role="status"
        className={cn(
          "pointer-events-auto toast-enter flex max-w-md items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3 shadow-lg",
          error ? "border-danger/25 bg-danger-soft text-danger" : "border-success/25 bg-success-soft text-success",
        )}
      >
        {error ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <Check className="mt-0.5 h-4 w-4 shrink-0" />}
        <p className="text-[13.5px] leading-relaxed text-foreground">{toast.text}</p>
        <button type="button" onClick={onClose} className="ms-2 shrink-0 text-muted-foreground" aria-label="إغلاق">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
