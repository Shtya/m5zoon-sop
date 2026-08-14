"use client";

import { useState } from "react";
import { Check, PartyPopper, Phone, ThumbsDown, ThumbsUp, X, Zap } from "lucide-react";
import { getDept } from "@/lib/constants";
import type { PublicSop } from "@/lib/types";
import type { SessionUser } from "@/lib/auth";
import { DeptBadge, T, Wrap } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { IconText } from "@/components/icons";
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
      <div className="mb-5 flex items-start justify-between">
        <div>
          <DeptBadge deptId={sop.department} />
          <div className="mt-2 text-lg font-extrabold text-foreground">{sop.title}</div>
        </div>
        <button type="button" onClick={onClose} className="cursor-pointer border-0 bg-transparent text-muted-foreground" aria-label="إغلاق">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mb-3.5 rounded-[var(--radius-lg)] border border-border bg-surface-sunken p-5">
        <div className="mb-3 text-xs font-bold" style={{ color: dept.color }}>
          <IconText icon={Zap} className="text-xs font-bold" iconClassName="h-3.5 w-3.5">
            الخطوات السريعة
          </IconText>
        </div>
        {sop.steps.slice(0, 5).map((st, i) => (
          <div key={st.id} className="mb-2.5 flex gap-2.5">
            <div
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
              style={{ background: `linear-gradient(135deg,${dept.color},${dept.color}88)` }}
            >
              {i + 1}
            </div>
            <div className="text-[13px] leading-relaxed text-foreground">{st.text}</div>
          </div>
        ))}
      </div>
      {sop.escalationContacts?.length > 0 && (
        <div className="mb-3.5">
          <IconText icon={Phone} className="mb-2 text-xs font-bold text-warning">
            اختر نوع المشكلة للتصعيد:
          </IconText>
          <Dropdown
            value={prob}
            onChange={setProb}
            placeholder="— نوع المشكلة —"
            options={[
              { value: "", label: "— نوع المشكلة —" },
              ...[...new Set(sop.escalationContacts.map((c) => c.problemType))].map((p) => ({ value: p, label: p })),
            ]}
            className={prob ? "mb-2.5" : undefined}
          />
          {escMatch && <EscCard contact={escMatch} countryId={sop.countries[0]} />}
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-2.5">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onVote(sop.id, "helpful")}
            className="cursor-pointer rounded-md border border-success/25 bg-success-soft px-3 py-1 text-xs text-success"
          >
            <IconText icon={ThumbsUp}>{sop.helpfulCount}</IconText>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onVote(sop.id, "notHelpful")}
            className="cursor-pointer rounded-md border border-danger/25 bg-danger-soft px-3 py-1 text-xs text-danger"
          >
            <IconText icon={ThumbsDown}>{sop.notHelpfulCount}</IconText>
          </button>
        </div>
        <div className="flex gap-2">
          {!ackd && (
            <button type="button" disabled={busy} onClick={() => onAck(sop.id)} style={{ ...T.btn("#0a6e55"), padding: "6px 14px", fontSize: 12 }}>
              <IconText icon={Check}>قرأته</IconText>
            </button>
          )}
          <button type="button" onClick={onFull} style={T.btn(dept.color)}>
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
      <div className="mb-5 flex items-start justify-between">
        <div>
          <DeptBadge deptId={sop.department} />
          <div className="mt-2 text-lg font-extrabold text-foreground">{sop.title}</div>
        </div>
        <button type="button" onClick={onClose} className="cursor-pointer border-0 bg-transparent text-muted-foreground" aria-label="إغلاق">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mb-5">
        <div className="mb-2 flex justify-between text-[13px] text-muted-foreground">
          <span>
            {completed}/{total}
          </span>
          <span className="font-bold" style={{ color: pct === 100 ? "var(--success)" : "var(--primary)" }}>
            {pct}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: pct === 100 ? "var(--success)" : "var(--primary)" }}
          />
        </div>
      </div>
      {sop.steps.map((st, i) => (
        <div
          key={st.id}
          onClick={() => setDone((d) => ({ ...d, [st.id]: !d[st.id] }))}
          className="mb-2 flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border px-[18px] py-[13px]"
          style={{
            background: done[st.id] ? "var(--success-soft)" : "var(--surface-sunken)",
            borderColor: done[st.id] ? "color-mix(in srgb, var(--success) 25%, transparent)" : "var(--border-strong)",
          }}
        >
          <div
            className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md"
            style={{
              border: `2px solid ${done[st.id] ? "var(--success)" : "var(--text-muted)"}`,
              background: done[st.id] ? "var(--success)" : "transparent",
            }}
          >
            {done[st.id] && <Check className="h-3.5 w-3.5 text-white" />}
          </div>
          <div
            className="text-sm leading-relaxed"
            style={{
              color: done[st.id] ? "var(--text-muted)" : "var(--text-primary)",
              textDecoration: done[st.id] ? "line-through" : "none",
            }}
          >
            <span className="ms-1 text-xs font-bold" style={{ color: done[st.id] ? "var(--text-muted)" : dept.color }}>
              #{i + 1}
            </span>
            {st.text}
          </div>
        </div>
      ))}
      {pct === 100 && (
        <div className="rounded-[var(--radius-lg)] border border-success/25 bg-success-soft p-4 text-center">
          <PartyPopper className="mx-auto mb-1.5 h-8 w-8 text-success" />
          <div className="font-extrabold text-success">أحسنت!</div>
        </div>
      )}
    </Wrap>
  );
}
