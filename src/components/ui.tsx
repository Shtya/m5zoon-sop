import type { CSSProperties, ReactNode } from "react";
import { getCountry, getDept, getRole } from "@/lib/constants";

export const T = {
  card: {
    background: "linear-gradient(135deg,#1e293b,#0f172a)",
    border: "1px solid #1e3a5f",
    borderRadius: 16,
    padding: 24,
  } as CSSProperties,
  input: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#f1f5f9",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  } as CSSProperties,
  btn: (c = "#3b82f6"): CSSProperties => ({
    background: `linear-gradient(135deg,${c},${c}cc)`,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "9px 20px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "inherit",
  }),
  ghost: {
    background: "#1e293b",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "8px 18px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "inherit",
  } as CSSProperties,
};

export function Badge({ children, color = "#3b82f6" }: { children: ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: color + "18",
        color,
        border: `1px solid ${color}33`,
        borderRadius: 6,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export function DeptBadge({ deptId }: { deptId: string }) {
  const d = getDept(deptId);
  return (
    <Badge color={d.color}>
      {d.icon} {d.label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const r = getRole(role);
  return (
    <Badge color={r.color}>
      {r.icon} {r.label}
    </Badge>
  );
}

export function Av({ initials, color = "#3b82f6", size = 36 }: { initials: string; color?: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg,${color},${color}88)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: size * 0.34,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function Wrap({
  children,
  onClose,
  maxW = 580,
}: {
  children: ReactNode;
  onClose: () => void;
  maxW?: number;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.82)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg,#0f172a,#1e293b)",
          border: "1px solid #334155",
          borderRadius: 20,
          padding: 32,
          maxWidth: maxW,
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 12, padding: 4, flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            minWidth: 70,
            background: active === t.id ? "linear-gradient(135deg,#1e3a5f,#1e293b)" : "transparent",
            color: active === t.id ? "#93c5fd" : "#475569",
            border: "none",
            borderRadius: 8,
            padding: "8px 4px",
            cursor: "pointer",
            fontWeight: active === t.id ? 700 : 500,
            fontSize: 12,
            fontFamily: "inherit",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function FL({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 700, marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

export function Sec({
  icon = "",
  title,
  color = "#3b82f6",
  children,
}: {
  icon?: string;
  title: string;
  color?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color, fontWeight: 700, fontSize: 12, letterSpacing: 1, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 14, background: color, borderRadius: 2 }} />
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

export function CountryPills({ countries }: { countries: string[] }) {
  return (
    <>
      {countries.map((cid) => {
        const c = getCountry(cid);
        return c ? (
          <Badge key={cid} color={c.color}>
            {c.flag} {c.name}
          </Badge>
        ) : null;
      })}
    </>
  );
}

export function Banner({ type, text, onClose }: { type: "error" | "ok"; text: string; onClose: () => void }) {
  const error = type === "error";
  return (
    <div
      style={{
        background: error ? "#1a0a0a" : "#0d1f0d",
        border: `1px solid ${error ? "#ef444433" : "#22c55e44"}`,
        color: error ? "#fca5a5" : "#86efac",
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
      }}
    >
      <span>
        {error ? "⚠️ " : "✅ "}
        {text}
      </span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
        ✕
      </button>
    </div>
  );
}
