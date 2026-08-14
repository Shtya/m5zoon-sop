"use client";

import { getDept, isExpired, isExpiring } from "@/lib/constants";
import type { PublicSop } from "@/lib/types";
import type { SessionUser } from "@/lib/auth";
import { Badge, CountryPills, DeptBadge, T } from "@/components/ui";

export function SopCard({
  sop,
  onOpen,
  onQuick,
  currentUser,
}: {
  sop: PublicSop;
  onOpen: (sop: PublicSop) => void;
  onQuick: (sop: PublicSop) => void;
  currentUser: SessionUser;
}) {
  const dept = getDept(sop.department);
  const ackd = sop.acknowledgments.includes(currentUser.id);
  const expired = isExpired(sop.reviewDate);
  const expiring = isExpiring(sop.reviewDate);
  return (
    <div
      style={{ ...T.card, borderLeft: `4px solid ${dept.color}`, display: "flex", flexDirection: "column", gap: 14 }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${dept.color}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <DeptBadge deptId={sop.department} />
            {ackd && <Badge color="#22c55e">✓ قرأته</Badge>}
            {expired && <Badge color="#ef4444">⚠️ منتهي</Badge>}
            {expiring && !expired && <Badge color="#f59e0b">⏰</Badge>}
            <CountryPills countries={sop.countries || []} />
          </div>
          <div style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700 }}>{sop.title}</div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{sop.objective}</div>
        </div>
        <span style={{ background: "#0f172a", border: "1px solid #334155", color: "#64748b", borderRadius: 6, padding: "2px 8px", fontSize: 11, height: "fit-content", flexShrink: 0 }}>
          v{sop.version}
        </span>
      </div>
      {sop.escalationContacts?.length > 0 && (
        <div style={{ background: "#1a110033", border: "1px solid #f59e0b22", borderRadius: 10, padding: "8px 12px" }}>
          <span style={{ color: "#d97706", fontSize: 12, fontWeight: 600 }}>
            📞 {[...new Set(sop.escalationContacts.map((c) => c.name))].join(" · ")}
          </span>
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {sop.keywords.slice(0, 4).map((k) => (
          <span key={k} style={{ background: "#1e3a5f", color: "#93c5fd", borderRadius: 6, padding: "2px 10px", fontSize: 11 }}>
            {k}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, color: "#64748b", fontSize: 12 }}>
        <span>👁{sop.views}</span>
        <span>✅{sop.steps.length}</span>
        <span>💬{sop.comments.length}</span>
        <span>👍{sop.helpfulCount}</span>
        {sop.attachments?.length > 0 && <span>📎{sop.attachments.length}</span>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onOpen(sop)} style={{ ...T.btn(dept.color), flex: 1, padding: "9px 0" }}>
          📋 عرض كامل
        </button>
        <button onClick={() => onQuick(sop)} style={{ ...T.ghost, flex: 1, color: "#93c5fd" }}>
          ⚡ سريع
        </button>
      </div>
    </div>
  );
}
