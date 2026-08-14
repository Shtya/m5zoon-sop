"use client";

import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Crown,
  Keyboard,
  Monitor,
  Package,
  Phone,
  Settings,
  Shield,
  Star,
  Truck,
  User,
  UserRound,
  Wallet,
  Warehouse,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { DEPARTMENTS, ISSUE_CATS, ROLES } from "@/lib/constants";

const DEPT_ICONS: Record<string, LucideIcon> = {
  "call-center": Phone,
  "account-manager": UserRound,
  warehouse: Warehouse,
  shipping: Truck,
  "data-entry": Keyboard,
  operations: Settings,
  finance: Wallet,
};

const ROLE_ICONS: Record<string, LucideIcon> = {
  super_admin: Crown,
  admin: Shield,
  team_leader: Star,
  employee: User,
};

const CAT_ICONS: Record<string, LucideIcon> = {
  shipping_co: Truck,
  customer: User,
  system: Monitor,
  call_center: Phone,
  packaging: Package,
  warehouse_i: Warehouse,
  finance_i: Wallet,
  other: Wrench,
};

type IconProps = { id: string; className?: string };

export function DeptIcon({ id, className = "h-3.5 w-3.5" }: IconProps) {
  const Icon = DEPT_ICONS[id] ?? Building2;
  return <Icon className={cn("shrink-0", className)} strokeWidth={1.8} />;
}

export function RoleIcon({ id, className = "h-3.5 w-3.5" }: IconProps) {
  const Icon = ROLE_ICONS[id] ?? User;
  return <Icon className={cn("shrink-0", className)} strokeWidth={1.8} />;
}

export function CatIcon({ id, className = "h-3.5 w-3.5" }: IconProps) {
  const Icon = CAT_ICONS[id] ?? Wrench;
  return <Icon className={cn("shrink-0", className)} strokeWidth={1.8} />;
}

export function IconText({
  icon: Icon,
  children,
  className,
  iconClassName = "h-3.5 w-3.5",
}: {
  icon: LucideIcon;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon className={cn("shrink-0", iconClassName)} strokeWidth={1.8} />
      {children}
    </span>
  );
}

export function departmentOptions() {
  return DEPARTMENTS.map((d) => ({
    value: d.id,
    label: d.label,
    icon: <DeptIcon id={d.id} />,
  }));
}

export function roleOptions() {
  return ROLES.map((r) => ({
    value: r.id,
    label: r.label,
    icon: <RoleIcon id={r.id} />,
  }));
}

export function categoryOptions() {
  return ISSUE_CATS.map((c) => ({
    value: c.id,
    label: c.label,
    icon: <CatIcon id={c.id} />,
  }));
}
