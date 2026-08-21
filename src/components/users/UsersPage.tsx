"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CircleAlert,
  CirclePause,
  CirclePlay,
  Globe,
  Mail,
  Pencil,
  Phone,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";
import { COUNTRIES, DEPARTMENTS, getCountry, getDept, getRole } from "@/lib/constants";
import {
  applyPermissionToggle,
  can,
  effectivePermissions,
  isSuperAdmin,
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  type Permission,
} from "@/lib/permissions";
import type { SessionUser } from "@/lib/auth";
import type { Role } from "@prisma/client";
import { Av, Badge, DeptBadge, EmptyState, PageHeader, RoleBadge, Tabs, Wrap } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { departmentOptions, IconText, roleOptions } from "@/components/icons";
import { cn } from "@/lib/cn";

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  phone: string;
  position: string;
  active: boolean;
  extraPermissions: string[];
  deniedPermissions: string[];
  allowedCountries: string[];
  allowedDepartments: string[];
};

const emptyForm = (): UserForm => ({
  name: "",
  email: "",
  password: "",
  role: "employee",
  department: "call-center",
  phone: "",
  position: "",
  active: true,
  extraPermissions: [],
  deniedPermissions: [],
  allowedCountries: [],
  allowedDepartments: [],
});

function fromUser(u: SessionUser): UserForm {
  return {
    name: u.name,
    email: u.email,
    password: "",
    role: u.role,
    department: u.department,
    phone: u.phone || "",
    position: u.position || "",
    active: u.active,
    extraPermissions: [...(u.extraPermissions || [])],
    deniedPermissions: [...(u.deniedPermissions || [])],
    allowedCountries: [...(u.allowedCountries || [])],
    allowedDepartments: [...(u.allowedDepartments || [])],
  };
}

function payloadFromForm(form: UserForm) {
  const { password, ...rest } = form;
  if (password.trim()) return { ...rest, password: password.trim() };
  return rest;
}

function toggleId(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function isCustomized(u: SessionUser) {
  return Boolean(
    (u.extraPermissions || []).length ||
      (u.deniedPermissions || []).length ||
      (u.allowedCountries || []).length ||
      (u.allowedDepartments || []).length,
  );
}

export function UsersPage({
  users,
  currentUser,
  onCreate,
  onUpdate,
  onDelete,
  onError,
  busy,
}: {
  users: SessionUser[];
  currentUser: SessionUser;
  onCreate: (form: Record<string, unknown>) => Promise<void>;
  onUpdate: (id: string, form: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => void;
  onError?: (message: string) => void;
  busy?: boolean;
}) {
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [tab, setTab] = useState("profile");
  const [et, setEt] = useState<SessionUser | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const aclAdmin = isSuperAdmin(currentUser);
  const modalBusy = busy || saving;

  const stats = useMemo(() => {
    const active = users.filter((u) => u.active).length;
    return {
      total: users.length,
      active,
      paused: users.length - active,
      custom: users.filter(isCustomized).length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (deptFilter !== "all" && u.department !== deptFilter) return false;
      if (statusFilter === "active" && !u.active) return false;
      if (statusFilter === "paused" && u.active) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.position || "").toLowerCase().includes(q) ||
        (u.phone || "").includes(q)
      );
    });
  }, [users, search, roleFilter, deptFilter, statusFilter]);

  const previewPerms = effectivePermissions({
    role: form.role,
    extraPermissions: form.extraPermissions,
    deniedPermissions: form.deniedPermissions,
  });

  function openCreate() {
    setEt(null);
    setForm(emptyForm());
    setFormError("");
    setTab("profile");
    setModal("create");
  }

  function openEdit(u: SessionUser) {
    setEt(u);
    setForm(fromUser(u));
    setFormError("");
    setTab("profile");
    setModal("edit");
  }

  async function save() {
    if (saving) return;
    if (!form.name.trim()) {
      setFormError("يرجى كتابة الاسم");
      setTab("profile");
      return;
    }
    if (!form.email.trim()) {
      setFormError("يرجى كتابة البريد الإلكتروني");
      setTab("profile");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError("البريد الإلكتروني غير صالح");
      setTab("profile");
      return;
    }
    if (modal === "create" && !form.password.trim()) {
      setFormError("يرجى إدخال كلمة المرور");
      setTab("profile");
      return;
    }
    if (form.password.trim() && form.password.trim().length < 4) {
      setFormError("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
      setTab("profile");
      return;
    }
    if (!form.department) {
      setFormError("يرجى اختيار القسم");
      setTab("profile");
      return;
    }

    setFormError("");
    setSaving(true);
    try {
      if (modal === "create") await onCreate(payloadFromForm(form));
      else if (et) await onUpdate(et.id, payloadFromForm(form));
      setModal(null);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "فشل حفظ المستخدم. يرجى المحاولة مرة أخرى.");
      setTab("profile");
    } finally {
      setSaving(false);
    }
  }

  function setGroup(keys: Permission[], enabled: boolean) {
    let extra = form.extraPermissions;
    let denied = form.deniedPermissions;
    for (const perm of keys) {
      const next = applyPermissionToggle(form.role, extra, denied, perm, enabled);
      extra = next.extraPermissions;
      denied = next.deniedPermissions;
    }
    setForm((f) => ({ ...f, extraPermissions: extra, deniedPermissions: denied }));
  }

  const hasFilters = search || roleFilter !== "all" || deptFilter !== "all" || statusFilter !== "all";

  return (
    <div>
      <PageHeader
        title="إدارة المستخدمين"
        description="حسابات الفريق، الأدوار، والصلاحيات المخصصة لكل شخص"
        actions={
          can(currentUser, "users.create") ? (
            <button type="button" className="btn-primary" onClick={openCreate}>
              <IconText icon={Plus}>إضافة مستخدم</IconText>
            </button>
          ) : undefined
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { label: "الإجمالي", value: stats.total, color: "var(--ink-700)" },
          { label: "نشط", value: stats.active, color: "var(--success)" },
          { label: "موقوف", value: stats.paused, color: "var(--danger)" },
          { label: "صلاحيات مخصصة", value: stats.custom, color: "var(--primary)" },
        ].map((item) => (
          <div key={item.label} className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 shadow-xs">
            <div className="text-[11px] font-medium text-muted-foreground">{item.label}</div>
            <div className="mt-0.5 text-[22px] font-extrabold leading-none" style={{ color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5 shadow-xs">
        <div className="grid gap-2 sm:grid-cols-[1fr_160px_180px_140px]">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد أو المسمى أو الهاتف..."
              className="field-input ps-10"
            />
          </div>
          <Dropdown
            value={roleFilter}
            onChange={setRoleFilter}
            size="sm"
            options={[{ value: "all", label: "كل الأدوار" }, ...roleOptions()]}
          />
          <Dropdown
            value={deptFilter}
            onChange={setDeptFilter}
            size="sm"
            options={[{ value: "all", label: "كل الأقسام" }, ...departmentOptions()]}
          />
          <Dropdown
            value={statusFilter}
            onChange={setStatusFilter}
            size="sm"
            options={[
              { value: "all", label: "كل الحالات" },
              { value: "active", label: "نشط" },
              { value: "paused", label: "موقوف" },
            ]}
          />
        </div>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted-foreground">
          <span>
            {filtered.length} من {users.length} مستخدم
          </span>
          {hasFilters && (
            <button
              type="button"
              className="font-semibold text-primary"
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
                setDeptFilter("all");
                setStatusFilter("all");
              }}
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={hasFilters ? "لا توجد نتائج" : "لا يوجد مستخدمون"}
          description={hasFilters ? "جرّب تغيير البحث أو الفلاتر." : "أضف أول مستخدم للفريق."}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((u) => {
            const role = getRole(u.role);
            const customized = isCustomized(u);
            const mine = u.id === currentUser.id;
            const canEdit = can(currentUser, "users.edit") && !mine;
            return (
              <div
                key={u.id}
                className={cn(
                  "rounded-[var(--radius-lg)] border bg-surface px-5 py-4 shadow-xs transition duration-[180ms]",
                  u.active ? "border-border hover:-translate-y-0.5 hover:shadow-md" : "border-dashed border-danger/30 bg-danger-soft/40",
                  mine && "ring-1 ring-primary/20",
                )}
                style={{ borderInlineStartWidth: 4, borderInlineStartColor: role.color }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <Av initials={u.avatar || u.name.slice(0, 2)} color={role.color} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] font-bold text-foreground">{u.name}</h3>
                        {mine && (
                          <Badge color="var(--primary)">أنت</Badge>
                        )}
                      </div>
                      {u.position && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{u.position}</p>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" /> {u.email}
                        </span>
                        {u.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" /> {u.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-[1.1] flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <RoleBadge role={u.role} />
                      <DeptBadge deptId={u.department} />
                      <span
                        className="rounded-md border px-2.5 py-0.5 text-[11px] font-semibold"
                        style={{
                          background: u.active ? "var(--success-soft)" : "var(--danger-soft)",
                          color: u.active ? "var(--success)" : "var(--danger)",
                          borderColor: u.active
                            ? "color-mix(in srgb, var(--success) 25%, transparent)"
                            : "color-mix(in srgb, var(--danger) 25%, transparent)",
                        }}
                      >
                        {u.active ? "نشط" : "موقوف"}
                      </span>
                      {customized && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                          <Shield className="h-3 w-3" /> صلاحيات مخصصة
                        </span>
                      )}
                    </div>
                    {(u.allowedCountries?.length || u.allowedDepartments?.length) ? (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        {u.allowedCountries?.length ? (
                          <span className="inline-flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {u.allowedCountries.map((id) => getCountry(id)?.code || id).join(" · ")}
                          </span>
                        ) : null}
                        {u.allowedDepartments?.length ? (
                          <span>{u.allowedDepartments.map((id) => getDept(id).label).join(" · ")}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {canEdit ? (
                    <div className="flex shrink-0 flex-wrap gap-1.5 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="btn-outline h-9 px-3 text-xs"
                        title="تعديل"
                      >
                        <IconText icon={Pencil}>تعديل</IconText>
                      </button>
                      <button
                        type="button"
                        title={u.active ? "إيقاف" : "تفعيل"}
                        onClick={() => {
                          void onUpdate(u.id, payloadFromForm({ ...fromUser(u), active: !u.active })).catch((e) => {
                            onError?.(e instanceof Error ? e.message : "فشل تحديث المستخدم");
                          });
                        }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border px-3 text-xs font-semibold"
                        style={{
                          color: u.active ? "var(--warning)" : "var(--success)",
                          borderColor: u.active
                            ? "color-mix(in srgb, var(--warning) 30%, transparent)"
                            : "color-mix(in srgb, var(--success) 30%, transparent)",
                          background: u.active ? "var(--warning-soft)" : "var(--success-soft)",
                        }}
                      >
                        {u.active ? <CirclePause className="h-3.5 w-3.5" /> : <CirclePlay className="h-3.5 w-3.5" />}
                        {u.active ? "إيقاف" : "تفعيل"}
                      </button>
                      {can(currentUser, "users.delete") && (
                        <button
                          type="button"
                          title="حذف"
                          onClick={() => {
                            if (window.confirm(`حذف حساب ${u.name}؟ لا يمكن التراجع.`)) onDelete(u.id);
                          }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-danger/25 bg-danger-soft px-3 text-xs font-semibold text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          حذف
                        </button>
                      )}
                    </div>
                  ) : mine ? (
                    <div className="text-[12px] text-text-muted lg:text-end">حسابك الحالي</div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Wrap onClose={() => setModal(null)} maxW={aclAdmin && form.role !== "super_admin" ? 820 : 560}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-foreground">
                <IconText icon={modal === "create" ? Plus : Pencil}>
                  {modal === "create" ? "مستخدم جديد" : et ? `تعديل ${et.name}` : "تعديل"}
                </IconText>
              </h3>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                {modal === "create" ? "أدخل بيانات الحساب ثم حدد الصلاحيات إن لزم." : "حدّث البيانات أو صلاحيات هذا الشخص."}
              </p>
            </div>
            {form.role !== "super_admin" && (
              <RoleBadge role={form.role} />
            )}
          </div>

          {aclAdmin && form.role !== "super_admin" && (
            <div className="mb-4">
              <Tabs
                active={tab}
                onChange={setTab}
                tabs={[
                  { id: "profile", label: "بيانات الحساب", icon: UserRound },
                  { id: "access", label: "الصلاحيات والنطاق", icon: Shield },
                ]}
              />
            </div>
          )}

          {(tab === "profile" || !aclAdmin || form.role === "super_admin") && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">الاسم *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field-input" placeholder="الاسم الكامل" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">المسمى الوظيفي</label>
                <input value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} className="field-input" placeholder="مثال: Team Leader" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">البريد *</label>
                <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="field-input" placeholder="name@makhzon.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">الهاتف</label>
                <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="field-input" placeholder="05xxxxxxxx" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  كلمة المرور {modal === "edit" ? <span className="font-normal text-text-muted">(اختياري — اتركها فارغة للإبقاء)</span> : "*"}
                </label>
                <input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} type="password" className="field-input" placeholder={modal === "edit" ? "••••••••" : "4 أحرف على الأقل"} />
              </div>
              <Dropdown
                label="الدور"
                value={form.role}
                onChange={(v) => {
                  setForm((f) => ({ ...f, role: v as Role, extraPermissions: [], deniedPermissions: [] }));
                }}
                options={roleOptions()}
              />
              <Dropdown
                label="القسم"
                value={form.department}
                onChange={(v) => setForm((f) => ({ ...f, department: v }))}
                options={departmentOptions()}
              />
              <label className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-surface-sunken px-3 py-2.5 text-sm text-foreground sm:mt-[22px]">
                <span>الحساب نشط</span>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              </label>
            </div>
          )}

          {tab === "access" && aclAdmin && form.role !== "super_admin" && (
            <div className="space-y-4">
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface-sunken p-3.5">
                <div className="mb-1 text-sm font-bold text-foreground">صلاحيات هذا المستخدم</div>
                <p className="mb-3 text-[12px] text-muted-foreground">الدور يعطي صلاحيات افتراضية. فعّل أو أوقف أي صلاحية لهذا الشخص فقط.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PERMISSION_GROUPS.map((group) => {
                    const onCount = group.keys.filter((p) => previewPerms.includes(p)).length;
                    return (
                      <div key={group.title} className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="text-xs font-bold text-foreground">{group.title}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-text-muted">
                              {onCount}/{group.keys.length}
                            </span>
                            <button type="button" className="text-[10px] font-semibold text-primary" onClick={() => setGroup(group.keys, onCount < group.keys.length)}>
                              {onCount === group.keys.length ? "إلغاء الكل" : "تفعيل الكل"}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {group.keys.map((perm) => {
                            const on = previewPerms.includes(perm);
                            return (
                              <label
                                key={perm}
                                className={cn(
                                  "flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors",
                                  on ? "bg-primary-soft/70 text-foreground" : "text-muted-foreground hover:bg-surface-sunken",
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="mt-0.5"
                                  checked={on}
                                  onChange={(e) => {
                                    const next = applyPermissionToggle(form.role, form.extraPermissions, form.deniedPermissions, perm, e.target.checked);
                                    setForm((f) => ({ ...f, ...next }));
                                  }}
                                />
                                <span>
                                  <span className="block font-medium text-foreground">{PERMISSION_LABELS[perm]}</span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface-sunken p-3.5">
                <div className="mb-1 flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Globe className="h-3.5 w-3.5" /> الدول المسموح بها
                </div>
                <p className="mb-2 text-[12px] text-muted-foreground">اتركها فارغة = كل الدول.</p>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map((c) => {
                    const sel = form.allowedCountries.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, allowedCountries: toggleId(f.allowedCountries, c.id) }))}
                        className="rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors"
                        style={
                          sel
                            ? { background: `color-mix(in srgb, ${c.color} 14%, white)`, color: c.color, borderColor: `color-mix(in srgb, ${c.color} 40%, transparent)` }
                            : { background: "var(--surface)", color: "var(--text-secondary)", borderColor: "var(--border)" }
                        }
                      >
                        {c.code} {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface-sunken p-3.5">
                <div className="mb-1 text-sm font-bold text-foreground">الأقسام المسموح بها</div>
                <p className="mb-2 text-[12px] text-muted-foreground">اتركها فارغة = كل الأقسام للعرض.</p>
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS.map((d) => {
                    const sel = form.allowedDepartments.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, allowedDepartments: toggleId(f.allowedDepartments, d.id) }))}
                        className="rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors"
                        style={
                          sel
                            ? { background: d.color + "18", color: d.color, borderColor: d.color + "44" }
                            : { background: "var(--surface)", color: "var(--text-secondary)", borderColor: "var(--border)" }
                        }
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {(!aclAdmin || form.role === "super_admin") && (
            <div className="my-3.5 rounded-[var(--radius-lg)] border border-border bg-surface-sunken p-3">
              <div className="mb-2 text-xs text-muted-foreground">
                {form.role === "super_admin" ? "Super Admin يمتلك كل الصلاحيات:" : "صلاحيات الدور:"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {previewPerms.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2.5 py-0.5 text-[11px] text-primary">
                    <Check className="h-3 w-3" /> {PERMISSION_LABELS[p]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formError && (
            <div className="mt-4 rounded-[var(--radius-md)] border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-[13px] text-danger">
              <span className="inline-flex items-start gap-1.5">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{formError}</span>
              </span>
            </div>
          )}

          <div className="mt-5 flex justify-end gap-2.5 border-t border-border pt-4">
            <button type="button" disabled={modalBusy} onClick={() => setModal(null)} className="btn-outline">
              إلغاء
            </button>
            <button type="button" disabled={modalBusy} onClick={() => void save()} className="btn-primary">
              <IconText icon={Save}>{modalBusy ? "جاري الحفظ..." : "حفظ"}</IconText>
            </button>
          </div>
        </Wrap>
      )}
    </div>
  );
}
