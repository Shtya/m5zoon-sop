"use client";

import { useMemo, useState } from "react";
import { DEPARTMENTS, ROLES, getRole } from "@/lib/constants";
import { can, permissionsFor } from "@/lib/permissions";
import type { SessionUser } from "@/lib/auth";
import type { Role } from "@prisma/client";
import { Av, DeptBadge, RoleBadge, T, Wrap } from "@/components/ui";

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 900, margin: 0 }}>👥 إدارة المستخدمين</h2>
        {can(currentUser.role, "users.create") && (
          <button onClick={() => { setForm({ name: "", email: "", password: "", role: "employee", department: "call-center", phone: "", position: "", active: true }); setModal("create"); }} style={T.btn()}>+ إضافة</button>
        )}
      </div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث..." style={{ ...T.input, maxWidth: 340, marginBottom: 20 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((u) => {
          const role = getRole(u.role);
          return (
            <div key={u.id} style={{ ...T.card, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "14px 22px", opacity: u.active ? 1 : 0.55 }}>
              <Av initials={u.avatar || u.name.slice(0, 2)} color={role.color} />
              <div style={{ flex: 1, minWidth: 130 }}>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{u.email}</div>
                {u.position && <div style={{ color: "#475569", fontSize: 11 }}>{u.position}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <RoleBadge role={u.role} />
                <DeptBadge deptId={u.department} />
                <span style={{ background: u.active ? "#16a34a18" : "#1a0a0a", color: u.active ? "#22c55e" : "#ef4444", border: `1px solid ${u.active ? "#22c55e33" : "#ef444433"}`, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{u.active ? "● نشط" : "○ موقوف"}</span>
              </div>
              {can(currentUser.role, "users.edit") && u.id !== currentUser.id && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setEt(u); setForm({ name: u.name, email: u.email, password: "", role: u.role, department: u.department, phone: u.phone || "", position: u.position || "", active: u.active }); setModal("edit"); }} style={{ ...T.ghost, padding: "6px 12px", fontSize: 12 }}>✏️</button>
                  <button onClick={() => onUpdate(u.id, { name: u.name, email: u.email, role: u.role, department: u.department, phone: u.phone, position: u.position, active: !u.active })} style={{ background: "#1e293b", color: u.active ? "#f59e0b" : "#22c55e", border: `1px solid ${u.active ? "#f59e0b33" : "#22c55e33"}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>{u.active ? "⏸" : "▶"}</button>
                  {can(currentUser.role, "users.delete") && (
                    <button onClick={() => { if (window.confirm("حذف؟")) onDelete(u.id); }} style={{ background: "#1a0a0a", color: "#ef4444", border: "1px solid #ef444433", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>🗑</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {modal && (
        <Wrap onClose={() => setModal(null)} maxW={500}>
          <h3 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: "0 0 20px" }}>{modal === "create" ? "➕ مستخدم جديد" : "✏️ تعديل"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ color: "#94a3b8", fontSize: 12 }}>الاسم</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={T.input} /></div>
            <div><label style={{ color: "#94a3b8", fontSize: 12 }}>المسمى</label><input value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} style={T.input} /></div>
            <div><label style={{ color: "#94a3b8", fontSize: 12 }}>البريد</label><input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={T.input} /></div>
            <div><label style={{ color: "#94a3b8", fontSize: 12 }}>الهاتف</label><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={T.input} /></div>
            <div><label style={{ color: "#94a3b8", fontSize: 12 }}>كلمة المرور {modal === "edit" ? "(اختياري)" : ""}</label><input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} type="password" style={T.input} /></div>
            <div><label style={{ color: "#94a3b8", fontSize: 12 }}>الدور</label><select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))} style={{ ...T.input, cursor: "pointer" }}>{ROLES.map((r) => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}</select></div>
            <div><label style={{ color: "#94a3b8", fontSize: 12 }}>القسم</label><select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} style={{ ...T.input, cursor: "pointer" }}>{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}</select></div>
            <div><label style={{ display: "flex", gap: 8, alignItems: "center", color: "#94a3b8", marginTop: 18 }}><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />نشط</label></div>
          </div>
          <div style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 12, padding: 12, margin: "14px 0" }}>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>الصلاحيات:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {permissionsFor(form.role).map((p) => (
                <span key={p} style={{ background: "#1e3a5f", color: "#93c5fd", borderRadius: 6, padding: "2px 10px", fontSize: 11 }}>✓ {p}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setModal(null)} style={T.ghost}>إلغاء</button>
            <button disabled={busy} onClick={save} style={T.btn()}>💾 حفظ</button>
          </div>
        </Wrap>
      )}
    </div>
  );
}
