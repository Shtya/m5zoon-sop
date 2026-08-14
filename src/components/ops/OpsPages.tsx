"use client";

import { useMemo, useState } from "react";
import { FileText, Lightbulb, Search, Zap } from "lucide-react";
import { ORDER_STATUSES, SMART_SYNONYMS, getDept } from "@/lib/constants";
import type { PublicSop } from "@/lib/types";
import { DeptBadge, EmptyState, PageHeader, T } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { IconText } from "@/components/icons";

export function OrderSim({ sops, onQuick }: { sops: PublicSop[]; onQuick: (s: PublicSop) => void }) {
  const [status, setStatus] = useState("Confirmed");
  const suggested = useMemo(() => sops.filter((s) => s.relatedStatuses.includes(status)), [sops, status]);
  return (
    <div>
      <PageHeader title="محاكاة صفحة الطلب" description="اختر حالة الطلب لعرض الإجراءات المرتبطة." />
      <div className="surface-card mb-[18px]">
        <div className="mb-4 grid grid-cols-3 gap-4">
          {[{ l: "رقم الطلب", v: "#ORD-4892" }, { l: "العميل", v: "أحمد محمد" }, { l: "المبلغ", v: "٣٤٥ ريال" }].map((f) => (
            <div key={f.l}>
              <div className="text-[11px] text-text-muted">{f.l}</div>
              <div className="mt-0.5 text-[15px] font-bold text-foreground">{f.v}</div>
            </div>
          ))}
        </div>
        <div className="flex max-w-xs items-center gap-3">
          <span className="shrink-0 text-[13px] text-muted-foreground">الحالة:</span>
          <Dropdown value={status} onChange={setStatus} options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))} className="flex-1" />
        </div>
      </div>
      {suggested.length > 0 ? (
        <div>
          <div className="mb-3 rounded-[var(--radius-lg)] border border-success/25 bg-success-soft px-[18px] py-3 font-semibold text-success">
            <IconText icon={Lightbulb}>وُجد {suggested.length} إجراء مناسب — اضغط مساعدة لعرض Quick SOP</IconText>
          </div>
          {suggested.map((s) => {
            const dept = getDept(s.department);
            return (
              <div key={s.id} className="mb-2.5 flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-xs">
                <div>
                  <div className="mb-1.5 text-sm font-bold text-foreground">{s.title}</div>
                  <DeptBadge deptId={s.department} />
                </div>
                <button type="button" onClick={() => onQuick(s)} style={T.btn(dept.color)}>
                  <IconText icon={Zap}>مساعدة</IconText>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="لا توجد إجراءات مرتبطة" description="جرّب حالة طلب أخرى." />
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
      <PageHeader title="البحث الذكي" description="البحث يتم على PostgreSQL (عنوان، كلمات مفتاحية، هدف، حالات، إجراءات)" />
      <div className="surface-card mb-5">
        <div className="mb-2.5 flex gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(q)}
            placeholder='"العميل مش رد" أو "الطرد تالف"'
            className="field-input flex-1"
          />
          <button type="button" onClick={() => onSearch(q)} disabled={loading} className="btn-primary px-6">
            {loading ? "..." : <IconText icon={Search}>بحث</IconText>}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {hints.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQ(s);
                onSearch(s);
              }}
              className="rounded-md bg-primary-soft px-3 py-1.5 text-xs text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {loading && <div className="surface-card py-10 text-center text-muted-foreground">جاري البحث في قاعدة البيانات...</div>}
      {!loading && reason && (
        <div className="mb-3.5 rounded-[var(--radius-lg)] border border-success/20 bg-success-soft px-[18px] py-3 text-sm text-success">
          <IconText icon={Lightbulb}>{reason}</IconText>
        </div>
      )}
      {!loading && results.length === 0 && reason && <EmptyState title="لم أجد إجراء مناسب" />}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {results.map((s) => {
          const dept = getDept(s.department);
          return (
            <div key={s.id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-xs" style={{ borderInlineStartWidth: 4, borderInlineStartColor: dept.color }}>
              <DeptBadge deptId={s.department} />
              <div className="my-2 text-[15px] font-bold text-foreground">{s.title}</div>
              <div className="mb-3 text-[13px] text-muted-foreground">{s.objective}</div>
              <div className="flex gap-2">
                <button type="button" onClick={() => onOpen(s)} style={{ ...T.btn(dept.color), flex: 1, padding: "7px 0" }}>
                  <IconText icon={FileText}>عرض</IconText>
                </button>
                <button type="button" onClick={() => onQuick(s)} className="btn-outline flex-1">
                  <Zap className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
