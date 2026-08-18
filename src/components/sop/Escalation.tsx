"use client";

import { useState } from "react";
import { FileText, FileType, Paperclip, Phone, Search, Wrench } from "lucide-react";
import { COUNTRIES, PROBLEM_TYPES, getDept, whatsappLink } from "@/lib/constants";
import type { Attachment, EscalationContact } from "@/lib/types";
import type { SessionUser } from "@/lib/auth";
import { Badge } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { IconText } from "@/components/icons";

export function resolveEscalation(contact: EscalationContact, users?: SessionUser[]): EscalationContact {
  if (!contact.userId || !users?.length) return contact;
  const u = users.find((x) => x.id === contact.userId);
  if (!u) return contact;
  return {
    ...contact,
    name: u.name || contact.name,
    position: u.position || contact.position,
    phone: u.phone || contact.phone,
    whatsapp: contact.whatsapp || u.phone || "",
  };
}

export function EscCard({
  contact,
  countryId,
  users,
}: {
  contact: EscalationContact;
  countryId?: string;
  users?: SessionUser[];
}) {
  const live = resolveEscalation(contact, users);
  const wa = whatsappLink(live.phone, live.whatsapp, countryId);
  return (
    <div className="rounded-[var(--radius-lg)] border border-warning/25 bg-warning-soft p-[18px]">
      <div className="mb-2.5">
        <Badge color="#d97706">
          <IconText icon={Wrench}>{live.problemType}</IconText>
        </Badge>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold text-foreground">{live.name}</div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">{live.position}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {live.phone && (
            <a
              href={`tel:${live.phone}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 py-1.5 text-xs text-muted-foreground no-underline"
            >
              <Phone className="h-3.5 w-3.5" /> {live.phone}
            </a>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-success/30 bg-success-soft px-3.5 py-1.5 text-xs font-bold text-success no-underline"
            >
              واتساب
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function EscFinder({
  contacts,
  countryId,
  users,
}: {
  contacts: EscalationContact[];
  countryId?: string;
  users?: SessionUser[];
}) {
  const [sel, setSel] = useState("");
  const match = contacts.find((c) => c.problemType === sel);
  return (
    <div className="mb-3.5 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <div className="mb-2.5">
        <IconText icon={Search} className="text-[13px] font-bold text-warning">
          عندك مشكلة؟ اختر نوعها
        </IconText>
      </div>
      <Dropdown
        value={sel}
        onChange={setSel}
        placeholder="— اختر نوع المشكلة —"
        options={[
          { value: "", label: "— اختر نوع المشكلة —" },
          ...[...new Set(contacts.map((c) => c.problemType))].map((p) => ({ value: p, label: p })),
        ]}
        className={sel ? "mb-3" : undefined}
      />
      {match && <EscCard contact={match} countryId={countryId} users={users} />}
    </div>
  );
}

export function AttCard({ att }: { att: Attachment }) {
  const isGDoc = att.type === "google_doc" || att.url?.includes("docs.google");
  const isWord = att.type === "word";
  const Icon = isGDoc ? FileText : isWord ? FileType : Paperclip;
  const label = isGDoc ? "Google Doc" : isWord ? "Word Doc" : "ملف";
  const color = isGDoc ? "#4285f4" : isWord ? "#2b579a" : "var(--text-secondary)";
  return (
    <a
      href={att.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-[var(--radius-lg)] border bg-surface-sunken px-4 py-3 no-underline"
      style={{ borderColor: `color-mix(in srgb, ${color} 28%, transparent)` }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${color} 14%, white)`, border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`, color }}
      >
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{att.label || "ملف مرفق"}</div>
        <div className="mt-0.5 text-[11px]" style={{ color }}>
          {label} · فتح
        </div>
      </div>
    </a>
  );
}

export { PROBLEM_TYPES, COUNTRIES, getDept };
