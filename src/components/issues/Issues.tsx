"use client";

import { useState } from "react";
import {
  DEPARTMENTS,
  ISSUE_CATS,
  ISSUE_STATUS,
  SEVERITY,
  getDept,
  getIssCat,
  getIssueSt,
  getRole,
  getSev,
} from "@/lib/constants";
import { can } from "@/lib/permissions";
import type { SessionUser } from "@/lib/auth";
import type { PublicIssue } from "@/lib/types";
import { Av, Badge, CountryPills, FL, T } from "@/components/ui";
import { CountryPicker } from "@/components/CountryBar";

export function IssueCard({ issue, users, onOpen }: { issue: PublicIssue; users: SessionUser[]; onOpen: (i: PublicIssue) => void }) {
  const dept = getDept(issue.department);
  const cat = getIssCat(issue.category);
  const sev = getSev(issue.severity);
  const stat = getIssueSt(issue.status);
  const rep = users.find((u) => u.id === issue.reportedBy);
  return (
    <div
      style={{ ...T.card, borderLeft: `4px solid ${sev.color}`, display: "flex", flexDirection: "column", gap: 12, cursor: "pointer" }}
      onClick={() => onOpen(issue)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <Badge color={dept.color}>{dept.icon} {dept.label}</Badge>
            <Badge color={cat.color}>{cat.icon} {cat.label}</Badge>
            <Badge color={sev.color}>🔥 {sev.label}</Badge>
            <Badge color={stat.color}>● {stat.label}</Badge>
            {issue.isRecurring && <Badge color="#a855f7">🔄 ×{issue.recurrenceCount}</Badge>}
            <CountryPills countries={issue.countries || []} />
          </div>
          <div style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{issue.title}</div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 5, lineHeight: 1.5 }}>{issue.description}</div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ color: "#475569", fontSize: 11, marginBottom: 4 }}>{issue.date}</div>
          {rep && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Av initials={rep.avatar || rep.name.slice(0, 2)} color={getRole(rep.role).color} size={22} />
              <span style={{ color: "#64748b", fontSize: 11 }}>{rep.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function IssueDetail({
  issue,
  users,
  onBack,
  onEdit,
  onDelete,
  currentUser,
  onAddComment,
  onUpdateStatus,
  busy,
}: {
  issue: PublicIssue;
  users: SessionUser[];
  onBack: () => void;
  onEdit: (i: PublicIssue) => void;
  onDelete: (id: string) => void;
  currentUser: SessionUser;
  onAddComment: (id: string, text: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  busy?: boolean;
}) {
  const dept = getDept(issue.department);
  const cat = getIssCat(issue.category);
  const sev = getSev(issue.severity);
  const stat = getIssueSt(issue.status);
  const rep = users.find((u) => u.id === issue.reportedBy);
  const [cmnt, setCmnt] = useState("");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <button onClick={onBack} style={T.ghost}>← رجوع</button>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {can(currentUser.role, "issues.edit") && (
            <select value={issue.status} onChange={(e) => onUpdateStatus(issue.id, e.target.value)} style={{ ...T.input, width: "auto", padding: "7px 12px", cursor: "pointer", fontSize: 12, border: `1px solid ${stat.color}44`, color: stat.color }}>
              {ISSUE_STATUS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          )}
          {can(currentUser.role, "issues.edit") && <button onClick={() => onEdit(issue)} style={T.btn("#8b5cf6")}>✏️ تعديل</button>}
          {can(currentUser.role, "issues.delete") && <button onClick={() => onDelete(issue.id)} style={T.btn("#ef4444")}>🗑 حذف</button>}
        </div>
      </div>
      <div style={{ ...T.card, borderTop: `4px solid ${sev.color}`, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Badge color={dept.color}>{dept.icon} {dept.label}</Badge>
          <Badge color={cat.color}>{cat.icon} {cat.label}</Badge>
          <Badge color={sev.color}>🔥 {sev.label}</Badge>
          <Badge color={stat.color}>● {stat.label}</Badge>
          {issue.isRecurring && <Badge color="#a855f7">🔄 متكررة ×{issue.recurrenceCount}</Badge>}
          <CountryPills countries={issue.countries} />
        </div>
        <h1 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 900, margin: "0 0 10px" }}>{issue.title}</h1>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", color: "#64748b", fontSize: 13 }}>
          <span>📅 {issue.date}</span>
          {rep && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Av initials={rep.avatar || rep.name.slice(0, 2)} color={getRole(rep.role).color} size={20} />{rep.name}</span>}
        </div>
      </div>
      <div className="makhzon-split">
        <div>
          <div style={{ ...T.card, marginBottom: 16 }}>
            <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 12, marginBottom: 12 }}>📋 وصف المشكلة</div>
            <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{issue.description}</p>
          </div>
          <div style={{ ...T.card, marginBottom: 16 }}>
            <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 12, marginBottom: 12 }}>🔍 أسباب المشكلة</div>
            {issue.rootCauses.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 10, background: "#1a0a0a", border: "1px solid #ef444433", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                <span style={{ color: "#ef4444", fontWeight: 800 }}>#{i + 1}</span>
                <span style={{ color: "#fca5a5", fontSize: 14 }}>{c}</span>
              </div>
            ))}
          </div>
          <div style={{ ...T.card, marginBottom: 16 }}>
            <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 12, marginBottom: 12 }}>✅ الحل المتخذ</div>
            <p style={{ color: "#86efac", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{issue.solution || "لم يتم توثيق الحل بعد"}</p>
          </div>
          <div style={{ ...T.card, marginBottom: 16 }}>
            <div style={{ color: "#6366f1", fontWeight: 700, fontSize: 12, marginBottom: 12 }}>🛡 خطوات التجنب</div>
            {issue.preventionSteps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12, background: "#0f1025", border: "1px solid #6366f133", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#6366f1,#6366f188)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 10 }}>{i + 1}</div>
                <span style={{ color: "#a5b4fc", fontSize: 14 }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={T.card}>
            <div style={{ color: "#94a3b8", fontWeight: 700, fontSize: 12, marginBottom: 12 }}>💬 التعليقات ({issue.comments.length})</div>
            <textarea value={cmnt} onChange={(e) => setCmnt(e.target.value)} rows={3} placeholder="أضف تعليقاً..." style={{ ...T.input, resize: "vertical", marginBottom: 10 }} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button disabled={busy} onClick={() => { if (cmnt.trim()) { onAddComment(issue.id, cmnt); setCmnt(""); } }} style={T.btn()}>إرسال</button>
            </div>
            {issue.comments.map((c) => {
              const u = users.find((x) => x.id === c.userId);
              return (
                <div key={c.id} style={{ ...T.card, marginBottom: 10, display: "flex", gap: 10 }}>
                  {u && <Av initials={u.avatar || u.name.slice(0, 2)} color={getRole(u.role).color} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13 }}>{u?.name}</span>
                      <span style={{ color: "#475569", fontSize: 11 }}>{c.date}</span>
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 13 }}>{c.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {issue.videoLink && (
            <div style={T.card}>
              <a href={issue.videoLink} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>▶ فيديو</a>
            </div>
          )}
          {issue.affectedUsers.length > 0 && (
            <div style={T.card}>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>👥 المتأثرون</div>
              {issue.affectedUsers.map((uid) => {
                const u = users.find((x) => x.id === uid);
                if (!u) return null;
                return (
                  <div key={uid} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <Av initials={u.avatar || u.name.slice(0, 2)} color={getRole(u.role).color} size={28} />
                    <div>
                      <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: "#64748b", fontSize: 11 }}>{u.position}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function IssueForm({
  initial,
  onSave,
  onCancel,
  users,
  currentUser,
  busy,
}: {
  initial: PublicIssue | null;
  onSave: (form: Record<string, unknown>) => void;
  onCancel: () => void;
  users: SessionUser[];
  currentUser: SessionUser;
  busy?: boolean;
}) {
  const mk = () => ({
    title: "",
    department: "call-center",
    category: "customer",
    severity: "medium",
    status: "open",
    date: new Date().toISOString().slice(0, 10),
    reportedBy: currentUser.id,
    affectedUsers: [currentUser.id],
    description: "",
    rootCauses: [""],
    solution: "",
    preventionSteps: [""],
    videoLink: "",
    isRecurring: false,
    recurrenceCount: 1,
    countries: [] as string[],
  });
  const [form, setForm] = useState(() =>
    initial
      ? {
          title: initial.title,
          department: initial.department,
          category: initial.category,
          severity: initial.severity,
          status: initial.status,
          date: initial.date,
          reportedBy: initial.reportedBy,
          affectedUsers: [...initial.affectedUsers],
          description: initial.description,
          rootCauses: [...initial.rootCauses],
          solution: initial.solution,
          preventionSteps: [...initial.preventionSteps],
          videoLink: initial.videoLink,
          isRecurring: initial.isRecurring,
          recurrenceCount: initial.recurrenceCount,
          countries: [...(initial.countries || [])],
        }
      : mk(),
  );
  const upd = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const I = T.input;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
        <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 900, margin: 0 }}>{initial ? "✏️ تعديل المشكلة" : "🆕 تسجيل مشكلة جديدة"}</h2>
        <button onClick={onCancel} style={T.ghost}>إلغاء</button>
      </div>
      <div className="makhzon-form-grid">
        <div>
          <FL label="عنوان المشكلة"><input value={form.title} onChange={(e) => upd("title", e.target.value)} style={I} /></FL>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FL label="القسم"><select value={form.department} onChange={(e) => upd("department", e.target.value)} style={{ ...I, cursor: "pointer" }}>{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}</select></FL>
            <FL label="الفئة"><select value={form.category} onChange={(e) => upd("category", e.target.value)} style={{ ...I, cursor: "pointer" }}>{ISSUE_CATS.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></FL>
            <FL label="درجة الخطورة"><select value={form.severity} onChange={(e) => upd("severity", e.target.value)} style={{ ...I, cursor: "pointer" }}>{SEVERITY.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></FL>
            <FL label="تاريخ الحدوث"><input type="date" value={form.date} onChange={(e) => upd("date", e.target.value)} style={I} /></FL>
          </div>
          <FL label="وصف تفصيلي"><textarea value={form.description} onChange={(e) => upd("description", e.target.value)} rows={4} style={{ ...I, resize: "vertical" }} /></FL>
          <FL label="⚠️ أسباب المشكلة">
            {form.rootCauses.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={c} onChange={(e) => { const a = [...form.rootCauses]; a[i] = e.target.value; upd("rootCauses", a); }} style={I} />
                <button onClick={() => upd("rootCauses", form.rootCauses.filter((_, j) => j !== i))} style={{ background: "#1a0a0a", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 8, padding: 8, cursor: "pointer" }}>✕</button>
              </div>
            ))}
            <button onClick={() => upd("rootCauses", [...form.rootCauses, ""])} style={{ ...T.ghost, width: "100%", color: "#fca5a5" }}>+ إضافة سبب</button>
          </FL>
          <FL label="✅ الحل المتخذ"><textarea value={form.solution} onChange={(e) => upd("solution", e.target.value)} rows={3} style={{ ...I, resize: "vertical" }} /></FL>
        </div>
        <div>
          <FL label="🛡 خطوات التجنب">
            {form.preventionSteps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={s} onChange={(e) => { const a = [...form.preventionSteps]; a[i] = e.target.value; upd("preventionSteps", a); }} style={I} />
                <button onClick={() => upd("preventionSteps", form.preventionSteps.filter((_, j) => j !== i))} style={{ background: "#0f1025", border: "1px solid #6366f133", color: "#6366f1", borderRadius: 8, padding: 8, cursor: "pointer" }}>✕</button>
              </div>
            ))}
            <button onClick={() => upd("preventionSteps", [...form.preventionSteps, ""])} style={{ ...T.ghost, width: "100%", color: "#a5b4fc" }}>+ خطوة تجنب</button>
          </FL>
          <FL label="الموظفون المتأثرون">
            <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: 12, maxHeight: 180, overflowY: "auto" }}>
              {users.filter((u) => u.active).map((u) => (
                <label key={u.id} style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.affectedUsers.includes(u.id)} onChange={(e) => upd("affectedUsers", e.target.checked ? [...form.affectedUsers, u.id] : form.affectedUsers.filter((x) => x !== u.id))} />
                  <Av initials={u.avatar || u.name.slice(0, 2)} color={getRole(u.role).color} size={22} />
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>{u.name}</span>
                </label>
              ))}
            </div>
          </FL>
          <FL label="رابط فيديو"><input value={form.videoLink} onChange={(e) => upd("videoLink", e.target.value)} style={I} /></FL>
          <FL label="حالة المشكلة"><select value={form.status} onChange={(e) => upd("status", e.target.value)} style={{ ...I, cursor: "pointer" }}>{ISSUE_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></FL>
          <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => upd("isRecurring", e.target.checked)} />
              <span style={{ color: "#c4b5fd", fontSize: 14, fontWeight: 600 }}>🔄 هذه مشكلة متكررة</span>
            </label>
            {form.isRecurring && <input type="number" min={2} value={form.recurrenceCount} onChange={(e) => upd("recurrenceCount", parseInt(e.target.value, 10) || 2)} style={{ ...I, width: 120, marginTop: 8 }} />}
          </div>
          <FL label="🌍 الدول المعنية"><CountryPicker value={form.countries} onChange={(v) => upd("countries", v)} /></FL>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <button onClick={onCancel} style={T.ghost}>إلغاء</button>
        <button disabled={busy} onClick={() => { if (!form.title.trim()) return; onSave(form); }} style={{ ...T.btn("#ef4444"), padding: "12px 32px", opacity: busy ? 0.6 : 1 }}>{busy ? "جاري الحفظ..." : "💾 حفظ المشكلة"}</button>
      </div>
    </div>
  );
}
