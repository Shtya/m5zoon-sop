"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";

export type DropdownOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
};

type Props = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  searchable?: boolean;
  size?: "sm" | "md";
};

export function Dropdown({
  value,
  options,
  onChange,
  placeholder = "— اختر —",
  label,
  disabled,
  error,
  className,
  searchable,
  size = "md",
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const selected = options.find((o) => String(o.value) === String(value));
  const enableSearch = searchable ?? options.length > 8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q));
  }, [options, query]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuStyle(null);
      return;
    }
    function updatePosition() {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pad = 8;
      const maxHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom - pad;
      const spaceAbove = rect.top - pad;
      const openUp = spaceBelow < Math.min(maxHeight, 180) && spaceAbove > spaceBelow;
      const available = Math.max(120, openUp ? spaceAbove - 4 : spaceBelow - 4);
      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width: Math.max(rect.width, 200),
        top: openUp ? undefined : rect.bottom + 4,
        bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
        maxHeight: Math.min(maxHeight, available),
        zIndex: 1200,
      });
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, filtered.length]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    function onPointerDown(event: MouseEvent) {
      const t = event.target as Node;
      if (!rootRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu =
    open && menuStyle && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={menuStyle}
            className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface py-1 shadow-lg"
          >
            {enableSearch && (
              <div className="sticky top-0 z-10 border-b border-border bg-surface px-2 py-1.5">
                <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-surface-sunken px-2">
                  <Search className="h-3.5 w-3.5 text-text-muted" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="بحث..."
                    className="h-8 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-text-muted"
                  />
                </div>
              </div>
            )}
            <ul className="max-h-64 overflow-auto py-1">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-[13px] text-muted-foreground">لا توجد نتائج</li>
              )}
              {filtered.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <li key={String(option.value)}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-start text-[13px] transition-colors",
                        isSelected ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-surface-hover",
                        option.disabled && "cursor-not-allowed opacity-40",
                      )}
                      onClick={() => {
                        if (option.disabled) return;
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      {option.icon}
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={cn("space-y-1.5", className)} ref={rootRef}>
      {label && (
        <label className="block text-[12.5px] font-medium text-foreground" id={`${listId}-label`}>
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-labelledby={label ? `${listId}-label` : undefined}
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border-strong bg-surface-sunken px-3.5 text-start text-[13.5px] text-foreground transition-colors",
          size === "sm" ? "h-9" : "h-11",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-danger",
          open && "border-ring ring-2 ring-ring/20",
        )}
      >
        <span className={cn("flex min-w-0 items-center gap-2 truncate", !selected && "text-text-muted")}>
          {selected?.icon}
          <span className="truncate">{selected?.label || placeholder}</span>
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-text-muted transition", open && "rotate-180")} />
      </button>
      {menu}
      {error && (
        <p className="text-[12.5px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
