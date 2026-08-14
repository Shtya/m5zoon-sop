"use client";

import { Building2, Eye, Flame, FolderOpen, Globe, RefreshCw, TriangleAlert, User } from "lucide-react";
import { Badge, DeptBadge, T } from "@/components/ui";
import { CatIcon, DeptIcon, IconText } from "@/components/icons";

type AnalyticsPayload = {
  sop: {
    total: number;
    views: number;
    helpful: number;
    notHelpful: number;
    acknowledgments: number;
    reviewNeeded: { id: string; title: string; reviewDate?: string; expired: boolean }[];
    mostViewed: { id: string; title: string; department: string; views: number }[];
    byDepartment: { id: string; label: string; color: string; sops: number; views: number; issues: number }[];
    byCountry: { id: string; name: string; code: string; color: string; sops: number; issues: number; views: number }[];
    byUser: { userId: string; name: string; views: number; acks: number }[];
  };
  issues: {
    total: number;
    open: number;
    resolved: number;
    recurring: number;
    byCategory: { id: string; label: string; color: string; count: number }[];
    bySeverity: { id: string; label: string; color: string; count: number }[];
    mostCommon: { id: string; title: string; department: string; recurrenceCount: number }[];
    recent: { id: string; title: string; status: string; severity: string; date: string }[];
    byDepartment: { id: string; label: string; color: string; issues: number }[];
    byCountry: { id: string; name: string; code: string; sops: number; issues: number }[];
  };
};

function SC({ label, value, color = "var(--text-primary)" }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={T.card}>
      <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{label}</div>
    </div>
  );
}

export function AnalyticsPage({ data }: { data: AnalyticsPayload | null }) {
  if (!data) return <div style={{ ...T.card, color: "var(--text-secondary)" }}>جاري تحميل التحليلات من قاعدة البيانات...</div>;
  const { sop, issues } = data;
  return (
    <div>
      <h2 className="mb-5 text-xl font-extrabold text-foreground">تحليلات الـ SOP</h2>
      <div className="makhzon-stats">
        <SC label="إجمالي SOPs" value={sop.total} />
        <SC label="إجمالي المشاهدات" value={sop.views.toLocaleString()} color="#3b82f6" />
        <SC label="تقييمات مفيدة" value={sop.helpful} color="#22c55e" />
        <SC label="غير مفيدة" value={sop.notHelpful} color="#ef4444" />
        <SC label="إقرارات القراءة" value={sop.acknowledgments} color="#a78bfa" />
        <SC label="تحتاج مراجعة" value={sop.reviewNeeded.length} color={sop.reviewNeeded.length ? "#f59e0b" : "var(--text-secondary)"} />
      </div>
      {sop.reviewNeeded.length > 0 && (
        <div style={{ background: "var(--warning-soft)", border: "1px solid #f59e0b44", borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <div className="mb-2.5 text-[13px] font-bold text-warning">
            <IconText icon={TriangleAlert}>تحتاج مراجعة ({sop.reviewNeeded.length})</IconText>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {sop.reviewNeeded.map((s) => (
              <div key={s.id} style={{ background: "var(--surface-sunken)", border: "1px solid #f59e0b33", borderRadius: 10, padding: "8px 14px" }}>
                <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                <div style={{ color: s.expired ? "#ef4444" : "#f59e0b", fontSize: 11 }}>{s.reviewDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="makhzon-form-grid" style={{ marginBottom: 28 }}>
        <div style={T.card}>
          <div className="mb-3.5 text-[13px] font-bold text-muted-foreground">
            <IconText icon={Eye}>الأكثر مشاهدة</IconText>
          </div>
          {sop.mostViewed.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: i === 0 ? "#f59e0b" : "var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                <DeptBadge deptId={s.department} />
              </div>
              <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{s.views}</span>
            </div>
          ))}
        </div>
        <div style={T.card}>
          <div className="mb-3.5 text-[13px] font-bold text-muted-foreground">
            <IconText icon={User}>الاستخدام حسب الموظف</IconText>
          </div>
          {sop.byUser.slice(0, 8).map((u) => (
            <div key={u.userId} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "var(--text-secondary)", fontSize: 13 }}>
              <span>{u.name}</span>
              <span className="inline-flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" /> {u.views} · {u.acks}
              </span>
            </div>
          ))}
        </div>
        <div style={T.card}>
          <div className="mb-3.5 text-[13px] font-bold text-muted-foreground">
            <IconText icon={Globe}>حسب الدولة</IconText>
          </div>
          {sop.byCountry.map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "var(--text-secondary)", fontSize: 13 }}>
              <span>
                <span className="me-1 font-mono text-[10px] font-semibold">{c.code}</span>
                {c.name}
              </span>
              <span>SOP {c.sops} · {c.views}</span>
            </div>
          ))}
        </div>
        <div style={T.card}>
          <div className="mb-3.5 text-[13px] font-bold text-muted-foreground">
            <IconText icon={Building2}>حسب القسم</IconText>
          </div>
          {sop.byDepartment.map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <DeptIcon id={d.id} />
              <span style={{ color: "var(--text-secondary)", fontSize: 12, flex: 1 }}>{d.label}</span>
              <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{d.sops}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="mb-5 text-xl font-extrabold text-foreground">تحليلات المشاكل اليومية</h2>
      <div className="makhzon-stats">
        <SC label="إجمالي المشاكل" value={issues.total} />
        <SC label="مفتوحة" value={issues.open} color="#ef4444" />
        <SC label="محلولة" value={issues.resolved} color="#22c55e" />
        <SC label="متكررة" value={issues.recurring} color="#a855f7" />
      </div>
      {issues.mostCommon.length > 0 && (
        <div style={{ background: "#f6f1fb", border: "1px solid #a855f744", borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <div className="mb-3 font-bold text-purple-600">
            <IconText icon={RefreshCw}>مشاكل متكررة</IconText>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {issues.mostCommon.map((i) => (
              <div key={i.id} style={{ background: "var(--surface-sunken)", border: "1px solid #a855f733", borderRadius: 12, padding: "10px 14px", flex: "1 1 180px" }}>
                <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{i.title}</div>
                <Badge color="#a855f7">×{i.recurrenceCount}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="makhzon-form-grid">
        <div style={T.card}>
          <div className="mb-3.5 text-[13px] font-bold text-muted-foreground">
            <IconText icon={FolderOpen}>حسب الفئة</IconText>
          </div>
          {issues.byCategory.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 8, color: "var(--text-secondary)", fontSize: 13 }}>
              <CatIcon id={c.id} /><span style={{ flex: 1 }}>{c.label}</span><span>{c.count}</span>
            </div>
          ))}
        </div>
        <div style={T.card}>
          <div className="mb-3.5 text-[13px] font-bold text-muted-foreground">
            <IconText icon={Flame}>حسب الخطورة</IconText>
          </div>
          {issues.bySeverity.map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: s.color, fontSize: 13 }}>
              <span>{s.label}</span><span>{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
