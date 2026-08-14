"use client";

import { COUNTRIES } from "@/lib/constants";

export function CountryBar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <div style={{ background: "#0f172a", borderBottom: "1px solid #1e3a5f", padding: "0 20px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 6, height: 44, overflowX: "auto" }}>
        <span style={{ color: "#475569", fontSize: 12, marginLeft: 8, flexShrink: 0 }}>🌍 الدولة:</span>
        <button
          onClick={() => onChange("all")}
          style={{
            background: active === "all" ? "#1e3a5f" : "transparent",
            color: active === "all" ? "#93c5fd" : "#64748b",
            border: "none",
            borderRadius: 8,
            padding: "5px 14px",
            cursor: "pointer",
            fontWeight: active === "all" ? 700 : 500,
            fontSize: 13,
            fontFamily: "inherit",
          }}
        >
          الكل
        </button>
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            style={{
              background: active === c.id ? c.color + "22" : "transparent",
              color: active === c.id ? c.color : "#64748b",
              border: active === c.id ? `1px solid ${c.color}44` : "1px solid transparent",
              borderRadius: 8,
              padding: "5px 14px",
              cursor: "pointer",
              fontWeight: active === c.id ? 700 : 500,
              fontSize: 13,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            <span>{c.flag}</span>
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
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {COUNTRIES.map((c) => {
          const sel = value.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(sel ? value.filter((x) => x !== c.id) : [...value, c.id])}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: sel ? c.color + "22" : "#0f172a",
                color: sel ? c.color : "#64748b",
                border: `1px solid ${sel ? c.color + "55" : "#334155"}`,
                borderRadius: 10,
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: sel ? 700 : 500,
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              {c.flag} {c.name}
              {sel && <span style={{ fontSize: 10 }}>✓</span>}
            </button>
          );
        })}
      </div>
      <div style={{ color: "#475569", fontSize: 11, marginTop: 6 }}>اتركها فاضية = تظهر في كل الدول</div>
    </div>
  );
}
