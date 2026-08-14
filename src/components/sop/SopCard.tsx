"use client";

import { Check, Clock, Eye, FileText, ListChecks, MessageSquare, Paperclip, Phone, ThumbsUp, TriangleAlert, Zap } from "lucide-react";
import { getDept, isExpired, isExpiring } from "@/lib/constants";
import type { PublicSop } from "@/lib/types";
import type { SessionUser } from "@/lib/auth";
import { Badge, CountryPills, DeptBadge, T } from "@/components/ui";
import { IconText } from "@/components/icons";

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
      className="flex flex-col gap-3.5 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-xs transition duration-[180ms] hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderInlineStartWidth: 4, borderInlineStartColor: dept.color }}
    >
      <div className="flex justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <DeptBadge deptId={sop.department} />
            {ackd && (
              <Badge color="#0a6e55">
                <IconText icon={Check}>قرأته</IconText>
              </Badge>
            )}
            {expired && (
              <Badge color="#c7402d">
                <IconText icon={TriangleAlert}>منتهي</IconText>
              </Badge>
            )}
            {expiring && !expired && (
              <Badge color="#d97706">
                <IconText icon={Clock}>قريب الانتهاء</IconText>
              </Badge>
            )}
            <CountryPills countries={sop.countries || []} />
          </div>
          <div className="text-base font-bold text-foreground">{sop.title}</div>
          <div className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{sop.objective}</div>
        </div>
        <span className="h-fit shrink-0 rounded-md border border-border bg-surface-sunken px-2 py-0.5 text-[11px] text-muted-foreground">
          v{sop.version}
        </span>
      </div>
      {sop.escalationContacts?.length > 0 && (
        <div className="rounded-[var(--radius-md)] border border-warning/20 bg-warning-soft px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
            <Phone className="h-3.5 w-3.5" />
            {[...new Set(sop.escalationContacts.map((c) => c.name))].join(" · ")}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {sop.keywords.slice(0, 4).map((k) => (
          <span key={k} className="rounded-md bg-primary-soft px-2.5 py-0.5 text-[11px] text-primary">
            {k}
          </span>
        ))}
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <IconText icon={Eye}>{sop.views}</IconText>
        <IconText icon={ListChecks}>{sop.steps.length}</IconText>
        <IconText icon={MessageSquare}>{sop.comments.length}</IconText>
        <IconText icon={ThumbsUp}>{sop.helpfulCount}</IconText>
        {sop.attachments?.length > 0 && (
          <IconText icon={Paperclip}>{sop.attachments.length}</IconText>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onOpen(sop)} style={{ ...T.btn(dept.color), flex: 1, padding: "9px 0" }}>
          <IconText icon={FileText}>عرض كامل</IconText>
        </button>
        <button type="button" onClick={() => onQuick(sop)} className="btn-outline flex-1">
          <IconText icon={Zap}>سريع</IconText>
        </button>
      </div>
    </div>
  );
}
