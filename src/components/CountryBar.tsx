"use client";

import { Check, Globe } from "lucide-react";
import { COUNTRIES } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function CountryBar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/95 px-4 shadow-lg sm:px-6">
      <div className="flex h-11 items-center gap-1.5 overflow-x-auto">
        <span className="ms-2 inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
          الدولة:
        </span>
        <button
          type="button"
          onClick={() => onChange("all")}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-[13px] transition-colors",
            active === "all"
              ? "bg-primary-soft font-semibold text-primary"
              : "font-medium text-muted-foreground hover:bg-surface-sunken hover:text-foreground",
          )}
        >
          الكل
        </button>
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px] transition-colors",
              active === c.id ? "font-semibold" : "font-medium text-muted-foreground hover:bg-surface-sunken",
            )}
            style={
              active === c.id
                ? {
                    background: `color-mix(in srgb, ${c.color} 14%, white)`,
                    color: c.color,
                    border: `1px solid color-mix(in srgb, ${c.color} 28%, transparent)`,
                  }
                : undefined
            }
          >
            <span className="font-mono text-[10px] font-semibold">{c.code}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CountryPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {COUNTRIES.map((c) => {
          const sel = value.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(sel ? value.filter((x) => x !== c.id) : [...value, c.id])}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border px-4 py-2 text-[13px] transition-colors",
                sel ? "font-semibold" : "border-border-strong bg-surface-sunken font-medium text-muted-foreground",
              )}
              style={
                sel
                  ? {
                      background: `color-mix(in srgb, ${c.color} 14%, white)`,
                      color: c.color,
                      borderColor: `color-mix(in srgb, ${c.color} 40%, transparent)`,
                    }
                  : undefined
              }
            >
              <span className="font-mono text-[10px] font-semibold">{c.code}</span>
              {c.name}
              {sel && <Check className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 text-[11px] text-text-muted">اتركها فاضية = تظهر في كل الدول</div>
    </div>
  );
}
