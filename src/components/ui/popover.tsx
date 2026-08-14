"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Popover({
  open,
  onOpenChange,
  align = "end",
  width = 256,
  trigger,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  align?: "start" | "end";
  width?: number;
  trigger: ReactNode;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setStyle(null);
      return;
    }
    function update() {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = Math.max(width, rect.width);
      const pad = 8;
      let left = align === "end" ? rect.right - w : rect.left;
      left = Math.min(Math.max(pad, left), window.innerWidth - w - pad);
      setStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left,
        width: w,
        zIndex: 1300,
      });
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, align, width]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      onOpenChange(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const menu =
    open && style && typeof document !== "undefined"
      ? createPortal(
          <div ref={menuRef} role="menu" style={style} className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface py-1 shadow-lg">
            {children}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative" ref={rootRef}>
      <div ref={triggerRef}>{trigger}</div>
      {menu}
    </div>
  );
}
