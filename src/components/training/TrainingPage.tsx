"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  CirclePlay,
  ClipboardList,
  FileText,
  GraduationCap,
  Lock,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { getDept } from "@/lib/constants";
import { can } from "@/lib/permissions";
import type { SessionUser } from "@/lib/auth";
import type { PublicSop, PublicTrainingPath, TrainingStepType } from "@/lib/types";
import { DeptBadge, EmptyState, FL, PageHeader } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { departmentOptions, IconText } from "@/components/icons";

const STEP_TYPES: { id: TrainingStepType; label: string; icon: typeof BookOpen }[] = [
  { id: "read_sop", label: "قراءة SOP", icon: BookOpen },
  { id: "watch_video", label: "مشاهدة فيديو", icon: Video },
  { id: "read_content", label: "قراءة محتوى", icon: FileText },
  { id: "task", label: "تنفيذ مهمة", icon: ClipboardList },
];

type StepDraft = {
  key: string;
  type: TrainingStepType;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  sopId: string;
  required: boolean;
};

function emptyStep(): StepDraft {
  return {
    key: `k-${Math.random().toString(36).slice(2, 8)}`,
    type: "read_content",
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    sopId: "",
    required: true,
  };
}

function stepIcon(type: TrainingStepType) {
  return STEP_TYPES.find((t) => t.id === type)?.icon ?? FileText;
}

export function TrainingPage({
  paths,
  sops,
  currentUser,
  busy,
  onRefresh,
  onEnroll,
  onCompleteStep,
  onCreate,
  onDelete,
  onOpenSop,
}: {
  paths: PublicTrainingPath[];
  sops: PublicSop[];
  currentUser: SessionUser;
  busy?: boolean;
  onRefresh: () => void;
  onEnroll: (pathId: string) => Promise<void>;
  onCompleteStep: (pathId: string, stepId: string) => Promise<void>;
  onCreate: (form: {
    title: string;
    department: string;
    description: string;
    steps: {
      type: TrainingStepType;
      title: string;
      description: string;
      content: string;
      videoUrl: string;
      sopId: string | null;
      required: boolean;
    }[];
  }) => Promise<void>;
  onDelete: (pathId: string) => Promise<void>;
  onOpenSop: (sopId: string) => void;
}) {
  const manage = can(currentUser.role, "training.manage");
  const [view, setView] = useState<"list" | "detail" | "create">("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState("all");
  const active = paths.find((p) => p.id === activeId) || null;

  const filtered = useMemo(
    () => paths.filter((p) => (deptFilter === "all" ? true : p.department === deptFilter)),
    [paths, deptFilter],
  );

  const [form, setForm] = useState({
    title: "",
    department: currentUser.department || "call-center",
    description: "",
    steps: [emptyStep()],
  });

  function openDetail(id: string) {
    setActiveId(id);
    setView("detail");
  }

  if (view === "create" && manage) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="m-0 text-[22px] font-extrabold text-foreground">
            <IconText icon={Plus}>إنشاء مسار تدريب</IconText>
          </h2>
          <button type="button" className="btn-outline" onClick={() => setView("list")}>
            إلغاء
          </button>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-xs">
          <FL label="عنوان المسار">
            <input
              className="field-input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="مثال: مسار Call Center — الموظف الجديد"
            />
          </FL>
          <FL label="القسم">
            <Dropdown
              value={form.department}
              onChange={(v) => setForm((f) => ({ ...f, department: v }))}
              options={departmentOptions()}
            />
          </FL>
          <FL label="الوصف">
            <textarea
              className="field-input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="ماذا سيتعلم الموظف في هذا المسار؟"
            />
          </FL>

          <div className="mb-3 mt-6 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-foreground">خطوات المسار (بالترتيب)</p>
            <button
              type="button"
              className="btn-outline h-9 px-3 text-[12px]"
              onClick={() => setForm((f) => ({ ...f, steps: [...f.steps, emptyStep()] }))}
            >
              + خطوة
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {form.steps.map((st, i) => {
              const Icon = stepIcon(st.type);
              return (
                <div key={st.key} className="rounded-[var(--radius-md)] border border-border bg-surface-sunken p-3.5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-[12px] text-muted-foreground">الخطوة {i + 1}</span>
                    <button
                      type="button"
                      className="ms-auto rounded-md border border-danger/25 bg-danger-soft p-1.5 text-danger"
                      onClick={() => setForm((f) => ({ ...f, steps: f.steps.filter((_, j) => j !== i) }))}
                      disabled={form.steps.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Dropdown
                      value={st.type}
                      size="sm"
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          steps: f.steps.map((x, j) => (j === i ? { ...x, type: v as TrainingStepType } : x)),
                        }))
                      }
                      options={STEP_TYPES.map((t) => ({ value: t.id, label: t.label }))}
                    />
                    <input
                      className="field-input h-9"
                      value={st.title}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          steps: f.steps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                        }))
                      }
                      placeholder="عنوان الخطوة"
                    />
                  </div>
                  <input
                    className="field-input mt-2 h-9"
                    value={st.description}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        steps: f.steps.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)),
                      }))
                    }
                    placeholder="وصف مختصر (اختياري)"
                  />
                  {st.type === "read_sop" && (
                    <div className="mt-2">
                      <Dropdown
                        value={st.sopId || ""}
                        size="sm"
                        placeholder="اختر SOP"
                        onChange={(v) =>
                          setForm((f) => ({
                            ...f,
                            steps: f.steps.map((x, j) => (j === i ? { ...x, sopId: v } : x)),
                          }))
                        }
                        options={[
                          { value: "", label: "— اختر SOP —" },
                          ...sops.map((s) => ({ value: s.id, label: s.title })),
                        ]}
                      />
                    </div>
                  )}
                  {st.type === "watch_video" && (
                    <input
                      className="field-input mt-2 h-9"
                      value={st.videoUrl}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          steps: f.steps.map((x, j) => (j === i ? { ...x, videoUrl: e.target.value } : x)),
                        }))
                      }
                      placeholder="رابط الفيديو"
                    />
                  )}
                  {(st.type === "read_content" || st.type === "task") && (
                    <textarea
                      className="field-input mt-2"
                      rows={3}
                      value={st.content}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          steps: f.steps.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)),
                        }))
                      }
                      placeholder={st.type === "task" ? "وصف المهمة المطلوب تنفيذها" : "المحتوى المطلوب قراءته"}
                    />
                  )}
                  <label className="mt-2 inline-flex items-center gap-2 text-[12.5px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={st.required}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          steps: f.steps.map((x, j) => (j === i ? { ...x, required: e.target.checked } : x)),
                        }))
                      }
                    />
                    خطوة إلزامية قبل الانتقال للتالية
                  </label>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="btn-primary mt-5"
            disabled={busy}
            onClick={async () => {
              await onCreate({
                title: form.title,
                department: form.department,
                description: form.description,
                steps: form.steps.map((s) => ({
                  type: s.type,
                  title: s.title,
                  description: s.description,
                  content: s.content,
                  videoUrl: s.videoUrl,
                  sopId: s.sopId || null,
                  required: s.required,
                })),
              });
              setForm({
                title: "",
                department: currentUser.department || "call-center",
                description: "",
                steps: [emptyStep()],
              });
              setView("list");
              onRefresh();
            }}
          >
            حفظ المسار
          </button>
        </div>
      </div>
    );
  }

  if (view === "detail" && active) {
    return (
      <div>
        <button type="button" className="btn-outline mb-4 h-9 px-3 text-[12px]" onClick={() => setView("list")}>
          <ChevronLeft className="h-3.5 w-3.5" /> رجوع للمسارات
        </button>
        <PageHeader
          title={active.title}
          description={`${getDept(active.department).label} · ${active.progress.done}/${active.progress.total} خطوات`}
          actions={
            !active.enrollment ? (
              <button type="button" className="btn-primary" disabled={busy} onClick={() => onEnroll(active.id)}>
                ابدأ المسار
              </button>
            ) : active.enrollment.status === "completed" ? (
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-success/25 bg-success-soft px-3 py-2 text-[13px] font-semibold text-success">
                <Check className="h-4 w-4" /> مكتمل
              </span>
            ) : undefined
          }
        />
        {active.description && <p className="mb-5 text-[14px] leading-relaxed text-muted-foreground">{active.description}</p>}

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-surface-sunken">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${active.progress.percent}%` }} />
        </div>

        <div className="flex flex-col gap-3">
          {active.steps.map((step, i) => {
            const Icon = stepIcon(step.type);
            return (
              <div
                key={step.id}
                className={cn(
                  "rounded-[var(--radius-lg)] border bg-surface p-4 shadow-xs",
                  step.completed ? "border-success/30" : step.locked ? "border-border opacity-70" : "border-border",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                      step.completed
                        ? "bg-success text-white"
                        : step.locked
                          ? "bg-surface-sunken text-muted-foreground"
                          : "bg-primary text-white",
                    )}
                  >
                    {step.completed ? <Check className="h-4 w-4" /> : step.locked ? <Lock className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{step.title}</span>
                      <span className="rounded-md bg-surface-sunken px-2 py-0.5 text-[11px] text-muted-foreground">
                        {STEP_TYPES.find((t) => t.id === step.type)?.label}
                      </span>
                      {step.required && <span className="text-[11px] text-warning">إلزامي</span>}
                    </div>
                    {step.description && <p className="mb-2 text-[13px] text-muted-foreground">{step.description}</p>}
                    {step.type === "read_sop" && step.sopId && (
                      <button
                        type="button"
                        className="mb-2 text-[13px] font-medium text-primary"
                        onClick={() => onOpenSop(step.sopId!)}
                        disabled={step.locked}
                      >
                        فتح الإجراء: {step.sopTitle || step.sopId}
                      </button>
                    )}
                    {step.type === "watch_video" && step.videoUrl && !step.locked && (
                      <a
                        href={step.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mb-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary"
                      >
                        <CirclePlay className="h-4 w-4" /> مشاهدة الفيديو
                      </a>
                    )}
                    {(step.type === "read_content" || step.type === "task") && step.content && (
                      <div className="mb-2 whitespace-pre-wrap rounded-[var(--radius-md)] border border-border bg-surface-sunken px-3 py-2 text-[13px] leading-relaxed text-foreground">
                        {step.content}
                      </div>
                    )}
                    {!step.completed && !step.locked && (
                      <button
                        type="button"
                        className="btn-primary mt-1 h-9 px-3 text-[12px]"
                        disabled={busy}
                        onClick={() => onCompleteStep(active.id, step.id)}
                      >
                        <Check className="h-3.5 w-3.5" /> تم — أكملت هذه الخطوة
                      </button>
                    )}
                    {step.completed && (
                      <p className="mt-1 text-[12px] font-medium text-success">
                        <IconText icon={Check}>مكتملة {step.completedAt ? `· ${step.completedAt}` : ""}</IconText>
                      </p>
                    )}
                    {step.locked && !step.completed && (
                      <p className="mt-1 text-[12px] text-muted-foreground">أكمل الخطوات السابقة أولًا</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {manage && (
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-danger"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm("حذف هذا المسار نهائيًا؟")) return;
              await onDelete(active.id);
              setView("list");
              setActiveId(null);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> حذف المسار
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="مسار التدريب"
        description="خطوات واضحة للموظف الجديد: اقرأ، شاهد، نفّذ، ثم انتقل للمرحلة التالية"
        actions={
          manage ? (
            <button type="button" className="btn-primary" onClick={() => setView("create")}>
              + مسار جديد
            </button>
          ) : undefined
        }
      />
      <div className="mb-4 max-w-xs">
        <Dropdown
          value={deptFilter}
          onChange={setDeptFilter}
          size="sm"
          options={[{ value: "all", label: "كل الأقسام" }, ...departmentOptions()]}
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="لا توجد مسارات" description="لم يُنشأ مسار تدريب بعد لهذا القسم." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => openDetail(p.id)}
              className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 text-start shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderInlineStartWidth: 4, borderInlineStartColor: getDept(p.department).color }}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <DeptBadge deptId={p.department} />
                <GraduationCap className="h-4 w-4 text-primary" />
                {p.enrollment?.status === "completed" && (
                  <span className="rounded-md bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">مكتمل</span>
                )}
                {p.enrollment?.status === "in_progress" && (
                  <span className="rounded-md bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">جارٍ</span>
                )}
              </div>
              <div className="text-[16px] font-bold text-foreground">{p.title}</div>
              <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{p.description || "بدون وصف"}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>
                    {p.progress.done}/{p.progress.total} خطوات
                  </span>
                  <span>{p.progress.percent}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress.percent}%` }} />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">{p.steps.length} خطوة · {p.enrolledCount} مسجّل</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
