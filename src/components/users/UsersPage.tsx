"use client";

import { useMemo, useState } from "react";
import { Check, CirclePause, CirclePlay, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { getRole } from "@/lib/constants";
import { can, permissionsFor } from "@/lib/permissions";
import type { SessionUser } from "@/lib/auth";
import type { Role } from "@prisma/client";
import { Av, DeptBadge, PageHeader, RoleBadge, T, Wrap } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { departmentOptions, IconText, roleOptions } from "@/components/icons";

export function UsersPage({
  users,
  currentUser,
  onCreate,
  onUpdate,
  onDelete,
  busy,
}: {
  users: SessionUser[];
  currentUser: SessionUser;
  onCreate: (form: Record<string, unknown>) => void;
  onUpdate: (id: string, form: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  busy?: boolean;
}) {
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [et, setEt] = useState<SessionUser | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" as Role, department: "call-center", phone: "", position: "", active: true });
  const filtered = useMemo(
    () => users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  );

  function save() {
    if (!form.name || !form.email || (modal === "create" && !form.password)) return;
    if (modal === "create") onCreate(form);
    else if (et) onUpdate(et.id, form);
    setModal(null);
  }

  return (
    <div>
      <PageHeader
        title="إدارة المستخدمين"
        description={`${users.length} مستخدم`}
        actions={
          can(currentUser.role, "users.create") ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setForm({ name: "", email: "", password: "", role: "employee", department: "call-center", phone: "", position: "", active: true });
                setModal("create");
              }}
            >
              + إضافة
            </button>
          ) : undefined
        }
      />
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث..." className="field-input mb-5 max-w-xs" />
      <div className="flex flex-col gap-2.5">
        {filtered.map((u) => {
          const role = getRole(u.role);
          return (
            <div key={u.id} className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface px-[22px] py-3.5 shadow-xs" style={{ opacity: u.active ? 1 : 0.55 }}>
              <Av initials={u.avatar || u.name.slice(0, 2)} color={role.color} />
              <div className="min-w-[130px] flex-1">
                <div className="text-[15px] font-bold text-foreground">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
                {u.position && <div className="text-[11px] text-text-muted">{u.position}</div>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <RoleBadge role={u.role} />
                <DeptBadge deptId={u.department} />
                <span className="rounded-md border px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{
                    background: u.active ? "var(--success-soft)" : "var(--danger-soft)",
                    color: u.active ? "var(--success)" : "var(--danger)",
                    borderColor: u.active ? "color-mix(in srgb, var(--success) 25%, transparent)" : "color-mix(in srgb, var(--danger) 25%, transparent)",
                  }}
                >
                  {u.active ? "نشط" : "موقوف"}
                </span>
              </div>
              {can(currentUser.role, "users.edit") && u.id !== currentUser.id && (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEt(u);
                      setForm({ name: u.name, email: u.email, password: "", role: u.role, department: u.department, phone: u.phone || "", position: u.position || "", active: u.active });
                      setModal("edit");
                    }}
                    className="btn-outline h-9 px-3 text-xs"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate(u.id, { name: u.name, email: u.email, role: u.role, department: u.department, phone: u.phone, position: u.position, active: !u.active })}
                    className="h-9 rounded-[var(--radius-md)] border px-3 text-xs"
                    style={{
                      color: u.active ? "var(--warning)" : "var(--success)",
                      borderColor: u.active ? "color-mix(in srgb, var(--warning) 30%, transparent)" : "color-mix(in srgb, var(--success) 30%, transparent)",
                      background: u.active ? "var(--warning-soft)" : "var(--success-soft)",
                    }}
                  >
                    {u.active ? <CirclePause className="h-3.5 w-3.5" /> : <CirclePlay className="h-3.5 w-3.5" />}
                  </button>
                  {can(currentUser.role, "users.delete") && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("حذف؟")) onDelete(u.id);
                      }}
                      className="h-9 rounded-[var(--radius-md)] border border-danger/25 bg-danger-soft px-3 text-xs text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {modal && (
        <Wrap onClose={() => setModal(null)} maxW={500}>
          <h3 className="mb-5 text-lg font-extrabold text-foreground">
            <IconText icon={modal === "create" ? Plus : Pencil}>{modal === "create" ? "مستخدم جديد" : "تعديل"}</IconText>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">الاسم</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">المسمى</label>
              <input value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} className="field-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">البريد</label>
              <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="field-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">الهاتف</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="field-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">كلمة المرور {modal === "edit" ? "(اختياري)" : ""}</label>
              <input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} type="password" className="field-input" />
            </div>
            <Dropdown
              label="الدور"
              value={form.role}
              onChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}
              options={roleOptions()}
            />
            <Dropdown
              label="القسم"
              value={form.department}
              onChange={(v) => setForm((f) => ({ ...f, department: v }))}
              options={departmentOptions()}
            />
            <label className="mt-[18px] flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              نشط
            </label>
          </div>
          <div className="my-3.5 rounded-[var(--radius-lg)] border border-border bg-surface-sunken p-3">
            <div className="mb-2 text-xs text-muted-foreground">الصلاحيات:</div>
            <div className="flex flex-wrap gap-1.5">
              {permissionsFor(form.role).map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2.5 py-0.5 text-[11px] text-primary">
                    <Check className="h-3 w-3" /> {p}
                  </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={() => setModal(null)} style={T.ghost}>
              إلغاء
            </button>
            <button type="button" disabled={busy} onClick={save} className="btn-primary">
              <IconText icon={Save}>حفظ</IconText>
            </button>
          </div>
        </Wrap>
      )}
    </div>
  );
}
