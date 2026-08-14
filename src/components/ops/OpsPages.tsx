"use client";

import { useMemo, useState } from "react";
import { ORDER_STATUSES, SMART_SYNONYMS, getDept } from "@/lib/constants";
import type { PublicSop } from "@/lib/types";
import { DeptBadge, T } from "@/components/ui";

export function OrderSim({ sops, onQuick }: { sops: PublicSop[]; onQuick: (s: PublicSop) => void }) {
  const [status, setStatus] = useState("Confirmed");
  const suggested = useMemo(() => sops.filter((s) => s.relatedStatuses.includes(status)), [sops, status]);
  return (
    <div>
      <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 900, margin: "0 0 20px" }}>🛒 محاكاة صفحة الطلب</h2>
      <div style={{ ...T.card, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 }}>
          {[{ l: "رقم الطلب", v: "#ORD-4892" }, { l: "العميل", v: "أحمد محمد" }, { l: "المبلغ", v: "٣٤٥ ريال" }].map((f) => (
            <div key={f.l}>
              <div style={{ color: "#475569", fontSize: 11 }}>{f.l}</div>
              <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, marginTop: 2 }}>{f.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#64748b", fontSize: 13 }}>الحالة:</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...T.input, maxWidth: 220, cursor: "pointer" }}>
            {ORDER_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      {suggested.length > 0 ? (
        <div>
          <div style={{ background: "#0d1f0d", border: "1px solid #22c55e44", borderRadius: 12, padding: "12px 18px", marginBottom: 12, color: "#86efac", fontWeight: 600 }}>
            💡 وُجد {suggested.length} إجراء مناسب — اضغط مساعدة لعرض Quick SOP
          </div>
          {suggested.map((s) => {
            const dept = getDept(s.department);
            return (
              <div key={s.id} style={{ ...T.card, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
                  <DeptBadge deptId={s.department} />
                </div>
                <button onClick={() => onQuick(s)} style={T.btn(dept.color)}>⚡ مساعدة</button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ ...T.card, textAlign: "center", color: "#475569", padding: 40 }}>لا توجد إجراءات مرتبطة</div>
      )}
    </div>
  );
}

export function SmartSearch({
  onSearch,
  results,
  reason,
  loading,
  onOpen,
  onQuick,
}: {
  onSearch: (q: string) => void;
  results: PublicSop[];
  reason?: string;
  loading: boolean;
  onOpen: (s: PublicSop) => void;
  onQuick: (s: PublicSop) => void;
}) {
  const [q, setQ] = useState("");
  const hints = Object.keys(SMART_SYNONYMS);
  return (
    <div>
      <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 900, margin: "0 0 8px" }}>🤖 البحث الذكي</h2>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>البحث يتم على PostgreSQL (عنوان، كلمات مفتاحية، هدف، حالات، إجراءات)</p>
      <div style={{ ...T.card, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch(q)} placeholder='"العميل مش رد" أو "الطرد تالف"' style={{ ...T.input, flex: 1, padding: "12px 14px" }} />
          <button onClick={() => onSearch(q)} disabled={loading} style={{ ...T.btn(), padding: "0 24px", opacity: loading ? 0.6 : 1 }}>{loading ? "..." : "بحث 🔍"}</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {hints.map((s) => (
            <button key={s} onClick={() => { setQ(s); onSearch(s); }} style={{ background: "#1e3a5f", color: "#93c5fd", border: "none", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>{s}</button>
          ))}
        </div>
      </div>
      {loading && <div style={{ ...T.card, textAlign: "center", padding: 40, color: "#94a3b8" }}>جاري البحث في قاعدة البيانات...</div>}
      {!loading && reason && <div style={{ background: "#0d1f0d", border: "1px solid #22c55e33", borderRadius: 12, padding: "12px 18px", marginBottom: 14, color: "#86efac", fontSize: 14 }}>💡 {reason}</div>}
      {!loading && results.length === 0 && reason && <div style={{ ...T.card, textAlign: "center", color: "#475569", padding: 48 }}>لم أجد إجراء مناسب</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
        {results.map((s) => {
          const dept = getDept(s.department);
          return (
            <div key={s.id} style={{ ...T.card, borderLeft: `4px solid ${dept.color}` }}>
              <DeptBadge deptId={s.department} />
              <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, margin: "8px 0 4px" }}>{s.title}</div>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>{s.objective}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onOpen(s)} style={{ ...T.btn(dept.color), flex: 1, padding: "7px 0" }}>📋 عرض</button>
                <button onClick={() => onQuick(s)} style={{ ...T.ghost, flex: 1, color: "#93c5fd" }}>⚡</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
