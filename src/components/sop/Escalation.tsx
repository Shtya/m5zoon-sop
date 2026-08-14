"use client";

import { useState } from "react";
import { COUNTRIES, PROBLEM_TYPES, getDept, whatsappLink } from "@/lib/constants";
import type { Attachment, EscalationContact } from "@/lib/types";
import { Badge, T } from "@/components/ui";

export function EscCard({ contact, countryId }: { contact: EscalationContact; countryId?: string }) {
  const wa = whatsappLink(contact.phone, contact.whatsapp, countryId);
  return (
    <div style={{ background: "#0f172a", border: "1px solid #f59e0b33", borderRadius: 14, padding: 18 }}>
      <div style={{ marginBottom: 10 }}>
        <Badge color="#f59e0b">🔧 {contact.problemType}</Badge>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>{contact.name}</div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{contact.position}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {contact.phone && (
            <a href={`tel:${contact.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "6px 12px", color: "#94a3b8", fontSize: 12, textDecoration: "none" }}>
              📞 {contact.phone}
            </a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, background: "#0d1f0d", border: "1px solid #22c55e44", borderRadius: 8, padding: "6px 14px", color: "#22c55e", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              واتساب
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function EscFinder({ contacts, countryId }: { contacts: EscalationContact[]; countryId?: string }) {
  const [sel, setSel] = useState("");
  const match = contacts.find((c) => c.problemType === sel);
  return (
    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 14, padding: 16, marginBottom: 14 }}>
      <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🔍 عندك مشكلة؟ اختر نوعها</div>
      <select value={sel} onChange={(e) => setSel(e.target.value)} style={{ ...T.input, cursor: "pointer", marginBottom: sel ? 12 : 0 }}>
        <option value="">— اختر نوع المشكلة —</option>
        {contacts.map((c, i) => (
          <option key={c.problemType + i} value={c.problemType}>
            {c.problemType}
          </option>
        ))}
      </select>
      {match && <EscCard contact={match} countryId={countryId} />}
    </div>
  );
}

export function AttCard({ att }: { att: Attachment }) {
  const isGDoc = att.type === "google_doc" || att.url?.includes("docs.google");
  const isWord = att.type === "word";
  const icon = isGDoc ? "📄" : isWord ? "📝" : "📎";
  const label = isGDoc ? "Google Doc" : isWord ? "Word Doc" : "ملف";
  const color = isGDoc ? "#4285f4" : isWord ? "#2b579a" : "#64748b";
  return (
    <a href={att.url} target="_blank" rel="noreferrer" style={{ display: "flex", gap: 12, alignItems: "center", background: "#0f172a", border: `1px solid ${color}33`, borderRadius: 12, padding: "12px 16px", textDecoration: "none" }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: color + "18", border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14 }}>{att.label || "ملف مرفق"}</div>
        <div style={{ color, fontSize: 11, marginTop: 2 }}>{label} · فتح ↗</div>
      </div>
    </a>
  );
}

export { PROBLEM_TYPES, COUNTRIES, getDept };
