"use client";

import { useState } from "react";
import { FileText, FileType, ImageUp, Paperclip, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { ORDER_STATUSES, PROBLEM_TYPES, RELATED_ACTIONS, getDept } from "@/lib/constants";
import { viewCountryIds, writeDepartmentIds } from "@/lib/permissions";
import type { PublicSop } from "@/lib/types";
import type { SessionUser } from "@/lib/auth";
import { FL, T } from "@/components/ui";
import { CountryPicker } from "@/components/CountryBar";
import { Dropdown } from "@/components/ui/dropdown";
import { departmentOptions, IconText } from "@/components/icons";

function suid() {
  return `s-${Math.random().toString(36).slice(2, 6)}`;
}

const emptyContact = () => ({ problemType: "", userId: "", name: "", position: "", phone: "", whatsapp: "" });

const empty = (department = "call-center") => ({
  department,
  title: "",
  objective: "",
  steps: [{ id: suid(), text: "", imageUrl: "" }],
  decisionRules: [{ condition: "", action: "" }],
  escalationContacts: [emptyContact()],
  commonMistakes: [""],
  videoLink: "",
  keywords: [] as string[],
  relatedStatuses: [] as string[],
  relatedActions: [] as string[],
  attachments: [] as { type: "google_doc" | "word" | "other"; label: string; url: string }[],
  reviewDate: new Date(Date.now() + 180 * 864e5).toISOString().slice(0, 10),
  countries: [] as string[],
  changeReason: "",
});

export function SopForm({
  initial,
  onSave,
  onCancel,
  busy,
  users,
  currentUser,
}: {
  initial: PublicSop | null;
  onSave: (form: ReturnType<typeof empty>) => void;
  onCancel: () => void;
  busy?: boolean;
  users: SessionUser[];
  currentUser: SessionUser;
}) {
  const writeDepts = writeDepartmentIds(currentUser);
  const countryScope = viewCountryIds(currentUser);
  const [form, setForm] = useState(() =>
    initial
      ? {
          department: initial.department,
          title: initial.title,
          objective: initial.objective,
          steps: initial.steps.map((s) => ({ id: s.id, text: s.text, imageUrl: s.imageUrl || "" })),
          decisionRules: [...initial.decisionRules],
          escalationContacts: initial.escalationContacts.map((c) => ({
            problemType: c.problemType,
            userId: c.userId || "",
            name: c.name,
            position: c.position,
            phone: c.phone,
            whatsapp: c.whatsapp || "",
          })),
          commonMistakes: [...initial.commonMistakes],
          videoLink: initial.videoLink || "",
          keywords: [...initial.keywords],
          relatedStatuses: [...initial.relatedStatuses],
          relatedActions: [...initial.relatedActions],
          attachments: [...initial.attachments],
          reviewDate: initial.reviewDate || new Date(Date.now() + 180 * 864e5).toISOString().slice(0, 10),
          countries: [...(initial.countries || [])],
          changeReason: "",
        }
      : empty(writeDepts?.[0] || currentUser.department || "call-center"),
  );
  const [kw, setKw] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const I = T.input;
  const activeUsers = users.filter((u) => u.active);
  const deptOptions = departmentOptions().filter((o) => !writeDepts || writeDepts.includes(o.value));

  function pickEscalationUser(index: number, userId: string) {
    const u = users.find((x) => x.id === userId);
    upd(
      "escalationContacts",
      form.escalationContacts.map((x, j) =>
        j === index
          ? {
              ...x,
              userId,
              name: u?.name || "",
              position: u?.position || "",
              phone: u?.phone || "",
              whatsapp: u?.phone || x.whatsapp || "",
            }
          : x,
      ),
    );
  }

  async function uploadStepImage(index: number, file: File | undefined) {
    if (!file) return;
    setUploadError("");
    setUploading(form.steps[index].id);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", credentials: "include", body });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "فشل رفع الصورة");
      upd(
        "steps",
        form.steps.map((x, j) => (j === index ? { ...x, imageUrl: json.url as string } : x)),
      );
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "فشل رفع الصورة");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h2 className="m-0 text-[22px] font-extrabold text-foreground">
          <IconText icon={initial ? Pencil : Plus}>{initial ? "تعديل SOP" : "إنشاء SOP جديد"}</IconText>
        </h2>
        <button onClick={onCancel} style={T.ghost}>
          إلغاء
        </button>
      </div>
      <div className="makhzon-form-grid">
        <div>
          <FL label="القسم">
            <Dropdown
              value={form.department}
              onChange={(v) => upd("department", v)}
              options={deptOptions.length ? deptOptions : departmentOptions()}
            />
          </FL>
          <FL label="عنوان الـ SOP">
            <input value={form.title} onChange={(e) => upd("title", e.target.value)} placeholder="مثال: التعامل مع عنوان ناقص" style={I} />
          </FL>
          <FL label="الهدف">
            <textarea value={form.objective} onChange={(e) => upd("objective", e.target.value)} rows={3} style={{ ...I, resize: "vertical" }} />
          </FL>
          <FL label="تاريخ المراجعة">
            <input type="date" value={form.reviewDate} onChange={(e) => upd("reviewDate", e.target.value)} style={I} />
          </FL>
          {initial && (
            <FL label="سبب التعديل">
              <input value={form.changeReason} onChange={(e) => upd("changeReason", e.target.value)} placeholder="مثال: تحديث وقت التصعيد" style={I} />
            </FL>
          )}
          <FL label="خطوات التنفيذ">
            {form.steps.map((st, i) => (
              <div key={st.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  <input value={st.text} onChange={(e) => upd("steps", form.steps.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} style={I} />
                  <button onClick={() => upd("steps", form.steps.filter((_, j) => j !== i))} className="shrink-0 cursor-pointer rounded-md border border-danger/25 bg-danger-soft p-2 text-danger">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-[12px] text-muted-foreground">
                    <ImageUp className="h-3.5 w-3.5" />
                    {uploading === st.id ? "جاري الرفع..." : "رفع صورة"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={uploading === st.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        void uploadStepImage(i, file);
                      }}
                    />
                  </label>
                  {st.imageUrl && (
                    <button
                      type="button"
                      onClick={() => upd("steps", form.steps.map((x, j) => (j === i ? { ...x, imageUrl: "" } : x)))}
                      className="text-[11px] text-danger"
                    >
                      إزالة الصورة
                    </button>
                  )}
                </div>
                <input value={st.imageUrl} onChange={(e) => upd("steps", form.steps.map((x, j) => (j === i ? { ...x, imageUrl: e.target.value } : x)))} placeholder="أو الصق رابط الصورة (اختياري)" style={{ ...I, fontSize: 12 }} />
                {st.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={st.imageUrl} alt="" className="mt-2 max-h-40 rounded-md border border-border object-contain" />
                )}
              </div>
            ))}
            {uploadError && <div className="mb-2 text-xs text-danger">{uploadError}</div>}
            <button onClick={() => upd("steps", [...form.steps, { id: suid(), text: "", imageUrl: "" }])} style={{ ...T.ghost, width: "100%", color: "var(--primary)" }}>
              + خطوة
            </button>
          </FL>
          <FL label="قواعد القرار">
            {form.decisionRules.map((r, i) => (
              <div key={i} className="makhzon-rule" style={{ marginBottom: 8 }}>
                <input value={r.condition} onChange={(e) => upd("decisionRules", form.decisionRules.map((x, j) => (j === i ? { ...x, condition: e.target.value } : x)))} placeholder="لو..." style={I} />
                <input value={r.action} onChange={(e) => upd("decisionRules", form.decisionRules.map((x, j) => (j === i ? { ...x, action: e.target.value } : x)))} placeholder="نعمل..." style={I} />
                <button onClick={() => upd("decisionRules", form.decisionRules.filter((_, j) => j !== i))} className="cursor-pointer rounded-md border border-danger/25 bg-danger-soft p-2 text-danger">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={() => upd("decisionRules", [...form.decisionRules, { condition: "", action: "" }])} style={{ ...T.ghost, width: "100%", color: "#a78bfa" }}>
              + قاعدة
            </button>
          </FL>
        </div>
        <div>
          <FL label="جهات التصعيد">
            {form.escalationContacts.map((c, i) => (
              <div key={i} className="mb-2.5 rounded-[var(--radius-lg)] border border-border bg-surface-sunken p-3.5">
                <div className="mb-2.5 flex justify-between gap-2">
                  <Dropdown
                    value={c.problemType}
                    onChange={(v) => upd("escalationContacts", form.escalationContacts.map((x, j) => (j === i ? { ...x, problemType: v } : x)))}
                    placeholder="— نوع المشكلة —"
                    size="sm"
                    className="min-w-[200px]"
                    options={[{ value: "", label: "— نوع المشكلة —" }, ...PROBLEM_TYPES.map((p) => ({ value: p, label: p }))]}
                  />
                  <button onClick={() => upd("escalationContacts", form.escalationContacts.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mb-2">
                  <Dropdown
                    value={c.userId}
                    onChange={(v) => pickEscalationUser(i, v)}
                    placeholder="— اختيار موظف من النظام —"
                    size="sm"
                    searchable
                    options={[
                      { value: "", label: "— إدخال يدوي —" },
                      ...activeUsers.map((u) => ({
                        value: u.id,
                        label: `${u.name}${u.position ? ` · ${u.position}` : ""} · ${getDept(u.department).label}`,
                      })),
                    ]}
                  />
                </div>
                {c.userId && (
                  <p className="mb-2 text-[11px] text-text-muted">البيانات مربوطة بحساب المستخدم وتتحدث تلقائياً إذا تغيّر الاسم أو الرقم.</p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input value={c.name} onChange={(e) => upd("escalationContacts", form.escalationContacts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="اسم الشخص" style={I} />
                  <input value={c.phone} onChange={(e) => upd("escalationContacts", form.escalationContacts.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} placeholder="05xxxxxxxx" style={I} />
                </div>
                <input value={c.position} onChange={(e) => upd("escalationContacts", form.escalationContacts.map((x, j) => (j === i ? { ...x, position: e.target.value } : x)))} placeholder="المسمى الوظيفي" style={{ ...I, marginBottom: 8 }} />
                <input value={c.whatsapp || ""} onChange={(e) => upd("escalationContacts", form.escalationContacts.map((x, j) => (j === i ? { ...x, whatsapp: e.target.value } : x)))} placeholder="واتساب (اختياري، مع كود الدولة)" style={I} />
              </div>
            ))}
            <button onClick={() => upd("escalationContacts", [...form.escalationContacts, emptyContact()])} style={{ ...T.ghost, width: "100%", color: "#fbbf24" }}>
              + جهة تصعيد
            </button>
          </FL>
          <FL label="الملفات المرفقة">
            {form.attachments.map((a, i) => (
              <div key={i} className="mb-2 rounded-[var(--radius-lg)] border border-border bg-surface-sunken p-3">
                <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-2">
                  <Dropdown
                    value={a.type}
                    onChange={(v) => upd("attachments", form.attachments.map((x, j) => (j === i ? { ...x, type: v as typeof a.type } : x)))}
                    size="sm"
                    options={[
                      { value: "google_doc", label: "Google Doc", icon: <FileText className="h-3.5 w-3.5" /> },
                      { value: "word", label: "Word Doc", icon: <FileType className="h-3.5 w-3.5" /> },
                      { value: "other", label: "ملف آخر", icon: <Paperclip className="h-3.5 w-3.5" /> },
                    ]}
                  />
                  <button onClick={() => upd("attachments", form.attachments.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input value={a.label} onChange={(e) => upd("attachments", form.attachments.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="اسم الملف" style={{ ...I, marginBottom: 8 }} />
                <input value={a.url} onChange={(e) => upd("attachments", form.attachments.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} placeholder="https://docs.google.com/..." style={I} />
              </div>
            ))}
            <button onClick={() => upd("attachments", [...form.attachments, { type: "google_doc", label: "", url: "" }])} style={{ ...T.ghost, width: "100%", color: "#4285f4" }}>
              + إضافة ملف
            </button>
          </FL>
          <FL label="الأخطاء الشائعة">
            {form.commonMistakes.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={m} onChange={(e) => upd("commonMistakes", form.commonMistakes.map((x, j) => (j === i ? e.target.value : x)))} style={I} />
                <button onClick={() => upd("commonMistakes", form.commonMistakes.filter((_, j) => j !== i))} className="cursor-pointer rounded-md border border-danger/25 bg-danger-soft p-2 text-danger">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={() => upd("commonMistakes", [...form.commonMistakes, ""])} style={{ ...T.ghost, width: "100%", color: "#fca5a5" }}>
              + خطأ
            </button>
          </FL>
          <FL label="رابط فيديو">
            <input value={form.videoLink} onChange={(e) => upd("videoLink", e.target.value)} placeholder="https://youtube.com/..." style={I} />
          </FL>
          <FL label="كلمات مفتاحية">
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && kw.trim()) {
                    e.preventDefault();
                    upd("keywords", [...form.keywords, kw.trim()]);
                    setKw("");
                  }
                }}
                placeholder="اكتب ثم Enter"
                style={I}
              />
              <button onClick={() => { if (kw.trim()) { upd("keywords", [...form.keywords, kw.trim()]); setKw(""); } }} style={{ ...T.btn(), padding: "0 14px" }}>
                +
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {form.keywords.map((k, i) => (
                <span key={i} onClick={() => upd("keywords", form.keywords.filter((_, j) => j !== i))} className="cursor-pointer rounded-md bg-primary-soft px-2.5 py-0.5 text-xs text-primary">
                  {k} <X className="inline h-3 w-3" />
                </span>
              ))}
            </div>
          </FL>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FL label="الحالات">
              <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 160, overflowY: "auto" }}>
                {ORDER_STATUSES.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={form.relatedStatuses.includes(s)} onChange={(e) => upd("relatedStatuses", e.target.checked ? [...form.relatedStatuses, s] : form.relatedStatuses.filter((x) => x !== s))} />
                    {s}
                  </label>
                ))}
              </div>
            </FL>
            <FL label="الإجراءات">
              <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 160, overflowY: "auto" }}>
                {RELATED_ACTIONS.map((a) => (
                  <label key={a} className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={form.relatedActions.includes(a)} onChange={(e) => upd("relatedActions", e.target.checked ? [...form.relatedActions, a] : form.relatedActions.filter((x) => x !== a))} />
                    {a}
                  </label>
                ))}
              </div>
            </FL>
          </div>
          <FL label="الدول المعنية">
            <CountryPicker value={form.countries} onChange={(v) => upd("countries", v)} allowedIds={countryScope} />
          </FL>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <button onClick={onCancel} style={T.ghost}>
          إلغاء
        </button>
        <button
          disabled={busy}
          onClick={() => {
            if (!form.title.trim()) return;
            onSave(form);
          }}
          style={{ ...T.btn(), padding: "12px 32px", fontSize: 15, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "جاري الحفظ..." : (
            <IconText icon={Save}>حفظ الـ SOP</IconText>
          )}
        </button>
      </div>
    </div>
  );
}
