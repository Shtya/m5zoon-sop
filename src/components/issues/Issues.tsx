"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, Check, FileText, Flame, MessageSquare, Pencil, Play, Plus, RefreshCw, Save, Search, Shield, Trash2, Users, X } from "lucide-react";
import {
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
import { Dropdown } from "@/components/ui/dropdown";
import { CatIcon, DeptIcon, categoryOptions, departmentOptions, IconText } from "@/components/icons";

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
            <Badge color={dept.color}>
              <span className="inline-flex items-center gap-1">
                <DeptIcon id={dept.id} /> {dept.label}
              </span>
            </Badge>
            <Badge color={cat.color}>
              <span className="inline-flex items-center gap-1">
                <CatIcon id={cat.id} /> {cat.label}
              </span>
            </Badge>
            <Badge color={sev.color}>
              <IconText icon={Flame}>{sev.label}</IconText>
            </Badge>
            <Badge color={stat.color}>{stat.label}</Badge>
            {issue.isRecurring && (
              <Badge color="#a855f7">
                <IconText icon={RefreshCw}>×{issue.recurrenceCount}</IconText>
              </Badge>
            )}
            <CountryPills countries={issue.countries || []} />
          </div>
          <div className="text-[15px] font-bold leading-snug text-foreground">{issue.title}</div>
          <div className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{issue.description}</div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div className="mb-1 text-[11px] text-text-muted">{issue.date}</div>
          {rep && (
            <div className="flex items-center gap-1.5">
              <Av initials={rep.avatar || rep.name.slice(0, 2)} color={getRole(rep.role).color} size={22} />
              <span className="text-[11px] text-muted-foreground">{rep.name}</span>
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
        <button onClick={onBack} style={T.ghost}>
          <IconText icon={ArrowLeft}>رجوع</IconText>
        </button>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {can(currentUser.role, "issues.edit") && (
            <Dropdown
              value={issue.status}
              onChange={(v) => onUpdateStatus(issue.id, v)}
              size="sm"
              className="w-[140px]"
              options={ISSUE_STATUS.map((s) => ({ value: s.id, label: s.label }))}
            />
          )}
          {can(currentUser.role, "issues.edit") && (
            <button onClick={() => onEdit(issue)} style={T.btn("#8b5cf6")}>
              <IconText icon={Pencil}>تعديل</IconText>
            </button>
          )}
          {can(currentUser.role, "issues.delete") && (
            <button onClick={() => onDelete(issue.id)} style={T.btn("#ef4444")}>
              <IconText icon={Trash2}>حذف</IconText>
            </button>
          )}
        </div>
      </div>
      <div style={{ ...T.card, borderTop: `4px solid ${sev.color}`, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Badge color={dept.color}>
            <span className="inline-flex items-center gap-1">
              <DeptIcon id={dept.id} /> {dept.label}
            </span>
          </Badge>
          <Badge color={cat.color}>
            <span className="inline-flex items-center gap-1">
              <CatIcon id={cat.id} /> {cat.label}
            </span>
          </Badge>
          <Badge color={sev.color}>
            <IconText icon={Flame}>{sev.label}</IconText>
          </Badge>
          <Badge color={stat.color}>{stat.label}</Badge>
          {issue.isRecurring && (
            <Badge color="#a855f7">
              <IconText icon={RefreshCw}>متكررة ×{issue.recurrenceCount}</IconText>
            </Badge>
          )}
          <CountryPills countries={issue.countries} />
        </div>
        <h1 className="mb-2.5 mt-0 text-[22px] font-extrabold text-foreground">{issue.title}</h1>
        <div className="flex flex-wrap gap-5 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {issue.date}
          </span>
          {rep && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Av initials={rep.avatar || rep.name.slice(0, 2)} color={getRole(rep.role).color} size={20} />{rep.name}</span>}
        </div>
      </div>
      <div className="makhzon-split">
        <div>
          <div style={{ ...T.card, marginBottom: 16 }}>
            <div className="mb-3 text-xs font-bold text-info">
              <IconText icon={FileText}>وصف المشكلة</IconText>
            </div>
            <p className="m-0 text-sm leading-relaxed text-foreground">{issue.description}</p>
          </div>
          <div style={{ ...T.card, marginBottom: 16 }}>
            <div className="mb-3 text-xs font-bold text-danger">
              <IconText icon={Search}>أسباب المشكلة</IconText>
            </div>
            {issue.rootCauses.map((c, i) => (
              <div key={i} className="mb-2 flex gap-2.5 rounded-[var(--radius-md)] border border-danger/25 bg-danger-soft px-3.5 py-2.5">
                <span className="font-extrabold text-danger">#{i + 1}</span>
                <span className="text-sm text-danger">{c}</span>
              </div>
            ))}
          </div>
          <div style={{ ...T.card, marginBottom: 16 }}>
            <div className="mb-3 text-xs font-bold text-success">
              <IconText icon={Check}>الحل المتخذ</IconText>
            </div>
            <p className="m-0 text-sm leading-relaxed text-success">{issue.solution || "لم يتم توثيق الحل بعد"}</p>
          </div>
          <div style={{ ...T.card, marginBottom: 16 }}>
            <div className="mb-3 text-xs font-bold text-info">
              <IconText icon={Shield}>خطوات التجنب</IconText>
            </div>
            {issue.preventionSteps.map((s, i) => (
              <div key={i} className="mb-2 flex gap-3 rounded-[var(--radius-md)] border border-info/20 bg-info-soft px-3.5 py-2.5">
                <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#6366f1,#6366f188)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 10 }}>{i + 1}</div>
                <span className="text-sm text-info">{s}</span>
              </div>
            ))}
          </div>
          <div style={T.card}>
            <div className="mb-3 text-xs font-bold text-muted-foreground">
              <IconText icon={MessageSquare}>التعليقات ({issue.comments.length})</IconText>
            </div>
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
                      <span className="text-[13px] font-semibold text-foreground">{u?.name}</span>
                      <span className="text-[11px] text-text-muted">{c.date}</span>
                    </div>
                    <div className="text-[13px] text-muted-foreground">{c.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {issue.videoLink && (
            <div style={T.card}>
              <a href={issue.videoLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-info no-underline">
                <Play className="h-3.5 w-3.5" /> فيديو
              </a>
            </div>
          )}
          {issue.affectedUsers.length > 0 && (
            <div style={T.card}>
              <div className="mb-3 text-xs font-bold text-muted-foreground">
                <IconText icon={Users}>المتأثرون</IconText>
              </div>
              {issue.affectedUsers.map((uid) => {
                const u = users.find((x) => x.id === uid);
                if (!u) return null;
                return (
                  <div key={uid} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <Av initials={u.avatar || u.name.slice(0, 2)} color={getRole(u.role).color} size={28} />
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground">{u.position}</div>
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
        <h2 className="m-0 text-[22px] font-extrabold text-foreground">
          <IconText icon={initial ? Pencil : Plus}>{initial ? "تعديل المشكلة" : "تسجيل مشكلة جديدة"}</IconText>
        </h2>
        <button onClick={onCancel} style={T.ghost}>إلغاء</button>
      </div>
      <div className="makhzon-form-grid">
        <div>
          <FL label="عنوان المشكلة"><input value={form.title} onChange={(e) => upd("title", e.target.value)} style={I} /></FL>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FL label="القسم">
              <Dropdown value={form.department} onChange={(v) => upd("department", v)} options={departmentOptions()} />
            </FL>
            <FL label="الفئة">
              <Dropdown value={form.category} onChange={(v) => upd("category", v)} options={categoryOptions()} />
            </FL>
            <FL label="درجة الخطورة">
              <Dropdown value={form.severity} onChange={(v) => upd("severity", v)} options={SEVERITY.map((s) => ({ value: s.id, label: s.label }))} />
            </FL>
            <FL label="تاريخ الحدوث"><input type="date" value={form.date} onChange={(e) => upd("date", e.target.value)} style={I} /></FL>
          </div>
          <FL label="وصف تفصيلي"><textarea value={form.description} onChange={(e) => upd("description", e.target.value)} rows={4} style={{ ...I, resize: "vertical" }} /></FL>
          <FL label="أسباب المشكلة">
            {form.rootCauses.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={c} onChange={(e) => { const a = [...form.rootCauses]; a[i] = e.target.value; upd("rootCauses", a); }} style={I} />
                <button onClick={() => upd("rootCauses", form.rootCauses.filter((_, j) => j !== i))} className="cursor-pointer rounded-md border border-danger/25 bg-danger-soft p-2 text-danger">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={() => upd("rootCauses", [...form.rootCauses, ""])} style={{ ...T.ghost, width: "100%", color: "#fca5a5" }}>+ إضافة سبب</button>
          </FL>
          <FL label="الحل المتخذ"><textarea value={form.solution} onChange={(e) => upd("solution", e.target.value)} rows={3} style={{ ...I, resize: "vertical" }} /></FL>
        </div>
        <div>
          <FL label="خطوات التجنب">
            {form.preventionSteps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={s} onChange={(e) => { const a = [...form.preventionSteps]; a[i] = e.target.value; upd("preventionSteps", a); }} style={I} />
                <button onClick={() => upd("preventionSteps", form.preventionSteps.filter((_, j) => j !== i))} className="cursor-pointer rounded-md border border-info/25 bg-info-soft p-2 text-info">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={() => upd("preventionSteps", [...form.preventionSteps, ""])} style={{ ...T.ghost, width: "100%", color: "#a5b4fc" }}>+ خطوة تجنب</button>
          </FL>
          <FL label="الموظفون المتأثرون">
            <div className="flex max-h-[180px] flex-col gap-1.5 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-surface-sunken p-3">
              {users.filter((u) => u.active).map((u) => (
                <label key={u.id} className="flex cursor-pointer items-center gap-2.5">
                  <input type="checkbox" checked={form.affectedUsers.includes(u.id)} onChange={(e) => upd("affectedUsers", e.target.checked ? [...form.affectedUsers, u.id] : form.affectedUsers.filter((x) => x !== u.id))} />
                  <Av initials={u.avatar || u.name.slice(0, 2)} color={getRole(u.role).color} size={22} />
                  <span className="text-[13px] text-muted-foreground">{u.name}</span>
                </label>
              ))}
            </div>
          </FL>
          <FL label="رابط فيديو"><input value={form.videoLink} onChange={(e) => upd("videoLink", e.target.value)} style={I} /></FL>
          <FL label="حالة المشكلة">
            <Dropdown value={form.status} onChange={(v) => upd("status", v)} options={ISSUE_STATUS.map((s) => ({ value: s.id, label: s.label }))} />
          </FL>
          <div className="mb-4 rounded-[var(--radius-lg)] border border-border bg-surface-sunken p-4">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => upd("isRecurring", e.target.checked)} />
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-700">
                <RefreshCw className="h-3.5 w-3.5" /> هذه مشكلة متكررة
              </span>
            </label>
            {form.isRecurring && <input type="number" min={2} value={form.recurrenceCount} onChange={(e) => upd("recurrenceCount", parseInt(e.target.value, 10) || 2)} style={{ ...I, width: 120, marginTop: 8 }} />}
          </div>
          <FL label="الدول المعنية"><CountryPicker value={form.countries} onChange={(v) => upd("countries", v)} /></FL>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <button onClick={onCancel} style={T.ghost}>إلغاء</button>
        <button disabled={busy} onClick={() => { if (!form.title.trim()) return; onSave(form); }} style={{ ...T.btn("#ef4444"), padding: "12px 32px", opacity: busy ? 0.6 : 1 }}>{busy ? "جاري الحفظ..." : <IconText icon={Save}>حفظ المشكلة</IconText>}</button>
      </div>
    </div>
  );
}
