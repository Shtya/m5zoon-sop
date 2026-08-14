import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { getCountry, getDept, getRole } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { DeptIcon, RoleIcon } from "@/components/icons";

export const T = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 20,
    boxShadow: "var(--shadow-xs)",
  } as CSSProperties,
  input: {
    width: "100%",
    height: 44,
    background: "var(--surface-sunken)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "var(--text-primary)",
    fontSize: 13.5,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  } as CSSProperties,
  btn: (c = "var(--primary)"): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: c,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "inherit",
    boxShadow: "var(--shadow-xs)",
  }),
  ghost: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: "var(--surface)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "inherit",
  } as CSSProperties,
};

export function Badge({ children, color = "var(--primary)" }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[12px] font-semibold"
      style={{
        background: `color-mix(in srgb, ${color} 14%, white)`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

export function DeptBadge({ deptId }: { deptId: string }) {
  const d = getDept(deptId);
  return (
    <Badge color={d.color}>
      <DeptIcon id={d.id} /> {d.label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const r = getRole(role);
  return (
    <Badge color={r.color}>
      <RoleIcon id={r.id} /> {r.label}
    </Badge>
  );
}

export function Av({ initials, color = "var(--primary)", size = 36 }: { initials: string; color?: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg,${color},${color}99)`,
        fontSize: size * 0.34,
      }}
    >
      {initials}
    </div>
  );
}

export function Wrap({
  children,
  onClose,
  maxW = 580,
}: {
  children: ReactNode;
  onClose: () => void;
  maxW?: number;
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink-900/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-[var(--radius-xl)] border border-border bg-surface p-8 shadow-lg"
        style={{ maxWidth: maxW }}
      >
        {children}
      </div>
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: LucideIcon }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-[var(--radius-lg)] border border-border bg-surface-sunken p-1">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "inline-flex min-w-[70px] flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
              active === t.id
                ? "bg-surface font-semibold text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={1.8} /> : null}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function FL({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

export function Sec({
  icon: Icon,
  title,
  color = "var(--primary)",
  children,
}: {
  icon?: LucideIcon;
  title: string;
  color?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3.5 flex items-center gap-2 text-xs font-bold tracking-wide" style={{ color }}>
        <div className="h-3.5 w-0.5 rounded-sm" style={{ background: color }} />
        {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={1.8} /> : null}
        {title}
      </div>
      {children}
    </div>
  );
}

export function CountryPills({ countries }: { countries: string[] }) {
  return (
    <>
      {countries.map((cid) => {
        const c = getCountry(cid);
        return c ? (
          <Badge key={cid} color={c.color}>
            <span className="font-mono text-[10px]">{c.code}</span> {c.name}
          </Badge>
        ) : null;
      })}
    </>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1.5 text-[13.5px] text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface px-6 py-14 text-center">
      <p className="text-[15px] font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-1.5 text-[13px] text-muted-foreground">{description}</p> : null}
    </div>
  );
}
