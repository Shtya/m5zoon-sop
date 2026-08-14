"use client";

import { useState } from "react";
import { getDept } from "@/lib/constants";
import type { PublicSop } from "@/lib/types";
import type { SessionUser } from "@/lib/auth";
import { DeptBadge, T, Wrap } from "@/components/ui";
import { EscCard } from "@/components/sop/Escalation";

export function QuickModal({
  sop,
  onClose,
  onFull,
  onVote,
  onAck,
  currentUser,
  busy,
}: {
  sop: PublicSop | null;
  onClose: () => void;
  onFull: () => void;
  onVote: (id: string, type: "helpful" | "notHelpful") => void;
  onAck: (id: string) => void;
  currentUser: SessionUser;
  busy?: boolean;
}) {
  const [prob, setProb] = useState("");
  if (!sop) return null;
  const dept = getDept(sop.department);
  const ackd = sop.acknowledgments.includes(currentUser.id);
  const escMatch = sop.escalationContacts?.find((c) => c.problemType === prob);
  return (
    <Wrap onClose={onClose} maxW={520}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <DeptBadge deptId={sop.department} />
          <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 18, marginTop: 8 }}>{sop.title}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>
          ✕
        </button>
      </div>
      <div style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 14, padding: 20, marginBottom: 14 }}>
        <div style={{ color: dept.color, fontWeight: 700, fontSize: 12, marginBottom: 12 }}>⚡ الخطوات السريعة</div>
        {sop.steps.slice(0, 5).map((st, i) => (
          <div key={st.id} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg,${dept.color},${dept.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 10, flexShrink: 0 }}>
              {i + 1}
            </div>
            <div style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6 }}>{st.text}</div>
          </div>
        ))}
      </div>
      {sop.escalationContacts?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 12, marginBottom: 8 }}>📞 اختر نوع المشكلة للتصعيد:</div>
          <select value={prob} onChange={(e) => setProb(e.target.value)} style={{ ...T.input, cursor: "pointer", marginBottom: prob ? 10 : 0 }}>
            <option value="">— نوع المشكلة —</option>
            {sop.escalationContacts.map((c, i) => (
              <option key={c.problemType + i} value={c.problemType}>
                {c.problemType}
              </option>
            ))}
          </select>
          {escMatch && <EscCard contact={escMatch} countryId={sop.countries[0]} />}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={busy} onClick={() => onVote(sop.id, "helpful")} style={{ background: "#16a34a18", color: "#22c55e", border: "1px solid #22c55e33", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
            👍{sop.helpfulCount}
          </button>
          <button disabled={busy} onClick={() => onVote(sop.id, "notHelpful")} style={{ background: "#dc262618", color: "#ef4444", border: "1px solid #ef444433", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
            👎{sop.notHelpfulCount}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!ackd && (
            <button disabled={busy} onClick={() => onAck(sop.id)} style={{ ...T.btn("#22c55e"), padding: "6px 14px", fontSize: 12 }}>
              ✓ قرأته
            </button>
          )}
          <button onClick={onFull} style={T.btn(dept.color)}>
            عرض كامل
          </button>
        </div>
      </div>
    </Wrap>
  );
}

export function ChecklistModal({ sop, onClose }: { sop: PublicSop; onClose: () => void }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const dept = getDept(sop.department);
  const total = sop.steps.length;
  const completed = Object.values(done).filter(Boolean).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  return (
    <Wrap onClose={onClose} maxW={540}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <DeptBadge deptId={sop.department} />
          <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 18, marginTop: 8 }}>{sop.title}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>
          ✕
        </button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>
          <span>
            {completed}/{total}
          </span>
          <span style={{ color: pct === 100 ? "#22c55e" : "#3b82f6", fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ background: "#0f172a", borderRadius: 100, height: 8, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#22c55e" : "linear-gradient(90deg,#3b82f6,#6366f1)", borderRadius: 100 }} />
        </div>
      </div>
      {sop.steps.map((st, i) => (
        <div
          key={st.id}
          onClick={() => setDone((d) => ({ ...d, [st.id]: !d[st.id] }))}
          style={{ display: "flex", gap: 12, alignItems: "flex-start", background: done[st.id] ? "#0d1f0d" : "#1e293b", border: `1px solid ${done[st.id] ? "#22c55e33" : "#334155"}`, borderRadius: 12, padding: "13px 18px", cursor: "pointer", marginBottom: 8 }}
        >
          <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${done[st.id] ? "#22c55e" : "#475569"}`, background: done[st.id] ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {done[st.id] && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>✓</span>}
          </div>
          <div style={{ color: done[st.id] ? "#64748b" : "#cbd5e1", fontSize: 14, lineHeight: 1.6, textDecoration: done[st.id] ? "line-through" : "none" }}>
            <span style={{ color: done[st.id] ? "#475569" : dept.color, fontWeight: 700, fontSize: 12, marginLeft: 5 }}>#{i + 1}</span>
            {st.text}
          </div>
        </div>
      ))}
      {pct === 100 && (
        <div style={{ background: "#0d1f0d", border: "1px solid #22c55e44", borderRadius: 12, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
          <div style={{ color: "#22c55e", fontWeight: 800 }}>أحسنت!</div>
        </div>
      )}
    </Wrap>
  );
}
