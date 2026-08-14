"use client";

import { GitBranch } from "lucide-react";
import { getDept } from "@/lib/constants";
import { T } from "@/components/ui";
import { IconText } from "@/components/icons";
import type { PublicSop } from "@/lib/types";

export function MindMap({ sop }: { sop: PublicSop }) {
  const dept = getDept(sop.department);
  const steps = sop.steps || [];
  const N = steps.length;
  if (!N) {
    return (
      <div style={{ ...T.card, textAlign: "center", color: "var(--text-muted)", padding: 48 }}>
        لا توجد خطوات لعرضها في الخريطة الذهنية
      </div>
    );
  }
  const SVG_W = 900;
  const SVG_H = 480;
  const RX = 210;
  const RY = SVG_H / 2;
  const R = 270;
  const startA = -75 * (Math.PI / 180);
  const endA = 75 * (Math.PI / 180);
  const stepNodes = steps.map((st, i) => {
    const angle = N === 1 ? 0 : startA + (endA - startA) * (i / (N - 1));
    return { id: st.id, text: st.text, index: i + 1, x: RX + Math.cos(angle) * R, y: RY + Math.sin(angle) * R };
  });
  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };
  const uid = sop.id.replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <div style={{ ...T.card, padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
        <span className="text-sm font-bold text-foreground">
          <IconText icon={GitBranch}>الخريطة الذهنية — خطوات التنفيذ ({N} خطوة)</IconText>
        </span>
      </div>
      <div className="blueprint-bg overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: "block", minWidth: SVG_W }}>
          <defs>
            <linearGradient id={`rg-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={dept.color} />
              <stop offset="100%" stopColor={dept.color + "88"} />
            </linearGradient>
            <marker id={`arr-${uid}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={dept.color + "99"} />
            </marker>
          </defs>
          {stepNodes.map((sn) => (
            <path key={sn.id + "-e"} d={curve(RX, RY, sn.x, sn.y)} stroke={dept.color + "55"} strokeWidth="1.8" fill="none" markerEnd={`url(#arr-${uid})`} />
          ))}
          {stepNodes.slice(0, -1).map((sn, i) => (
            <path key={`ch-${i}`} d={curve(sn.x, sn.y, stepNodes[i + 1].x, stepNodes[i + 1].y)} stroke={dept.color + "33"} strokeWidth="1.2" fill="none" strokeDasharray="5,4" />
          ))}
          <rect x={RX - 100} y={RY - 28} width={200} height={56} rx="14" fill={`url(#rg-${uid})`} />
          <rect x={RX - 100} y={RY - 28} width={200} height={56} rx="14" fill="none" stroke={dept.color} strokeWidth="2" />
          <text x={RX} y={RY - 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Cairo,sans-serif">
            {sop.title.slice(0, 24)}
            {sop.title.length > 24 ? "…" : ""}
          </text>
          <text x={RX} y={RY + 14} textAnchor="middle" fill="#ffffffaa" fontSize="9.5" fontFamily="Cairo,sans-serif">
            الإجراء الرئيسي
          </text>
          {stepNodes.map((sn) => {
            const l1 = sn.text.slice(0, 32);
            const l2 = sn.text.length > 32 ? sn.text.slice(32, 60) + (sn.text.length > 60 ? "…" : "") : "";
            const h = l2 ? 62 : 46;
            return (
              <g key={sn.id}>
                <rect x={sn.x - 96} y={sn.y - h / 2} width={192} height={h} rx="10" fill="#1f3350" stroke={dept.color + "77"} strokeWidth="1.5" />
                <rect x={sn.x - 88} y={sn.y - 12} width={22} height={22} rx="5" fill={dept.color} />
                <text x={sn.x - 77} y={sn.y + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="Cairo,sans-serif">
                  {sn.index}
                </text>
                <text x={sn.x + 6} y={l2 ? sn.y - 4 : sn.y + 4} textAnchor="middle" fill="#eaf0f7" fontSize="9.5" fontFamily="Cairo,sans-serif">
                  {l1}
                </text>
                {l2 && (
                  <text x={sn.x + 6} y={sn.y + 13} textAnchor="middle" fill="#8ca0b8" fontSize="9" fontFamily="Cairo,sans-serif">
                    {l2}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 8 }}>
        {steps.map((st, i) => (
          <div key={st.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "var(--surface-sunken)", border: `1px solid ${dept.color}33`, borderRadius: 10, padding: "7px 12px", flex: "1 1 280px" }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: dept.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
              {i + 1}
            </div>
            <span style={{ color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.5 }}>{st.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
