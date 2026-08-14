import type { Prisma } from "@prisma/client";
import type { PublicIssue, PublicSop, SopContentSnapshot } from "./types";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function ymd(d: Date | string | null | undefined) {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function snapshotFromSop(sop: {
  department: string;
  title: string;
  objective: string;
  steps: unknown;
  decisionRules: unknown;
  escalationContacts: unknown;
  commonMistakes: unknown;
  videoLink: string;
  attachments: unknown;
  keywords: string[];
  relatedStatuses: string[];
  relatedActions: string[];
  reviewDate: Date | null;
  countries?: { countryId: string }[];
}): SopContentSnapshot {
  return {
    department: sop.department,
    title: sop.title,
    objective: sop.objective,
    steps: asArray(sop.steps),
    decisionRules: asArray(sop.decisionRules),
    escalationContacts: asArray(sop.escalationContacts),
    commonMistakes: asArray(sop.commonMistakes),
    videoLink: sop.videoLink,
    attachments: asArray(sop.attachments),
    keywords: sop.keywords,
    relatedStatuses: sop.relatedStatuses,
    relatedActions: sop.relatedActions,
    countries: sop.countries?.map((c) => c.countryId) ?? [],
    reviewDate: ymd(sop.reviewDate),
  };
}

export const sopInclude = {
  countries: true,
  comments: { orderBy: { createdAt: "asc" as const } },
  history: { orderBy: { createdAt: "asc" as const } },
  acknowledgments: true,
  feedback: true,
} satisfies Prisma.SopInclude;

export function serializeSop(
  sop: Prisma.SopGetPayload<{ include: typeof sopInclude }>,
  currentUserId?: string,
): PublicSop {
  const currentAcks = sop.acknowledgments
    .filter((a) => a.version === sop.version)
    .map((a) => a.userId);
  const mine = sop.feedback.find((f) => f.userId === currentUserId);
  return {
    id: sop.id,
    department: sop.department,
    title: sop.title,
    objective: sop.objective,
    steps: asArray(sop.steps),
    decisionRules: asArray(sop.decisionRules),
    escalationContacts: asArray(sop.escalationContacts),
    commonMistakes: asArray(sop.commonMistakes),
    videoLink: sop.videoLink,
    keywords: sop.keywords,
    relatedStatuses: sop.relatedStatuses,
    relatedActions: sop.relatedActions,
    attachments: asArray(sop.attachments),
    countries: sop.countries.map((c) => c.countryId),
    views: sop.views,
    helpfulCount: sop.helpfulCount,
    notHelpfulCount: sop.notHelpfulCount,
    reviewDate: ymd(sop.reviewDate),
    version: sop.version,
    createdBy: sop.createdById,
    updatedBy: sop.updatedById,
    createdAt: ymd(sop.createdAt) ?? "",
    updatedAt: ymd(sop.updatedAt) ?? "",
    history: sop.history.map((h) => ({
      version: h.version,
      date: ymd(h.createdAt) ?? "",
      by: h.userId,
      note: h.changeReason,
      previousContent: h.previousContent,
      currentContent: h.currentContent,
    })),
    comments: sop.comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      text: c.text,
      date: ymd(c.createdAt) ?? "",
    })),
    acknowledgments: currentAcks,
    myFeedback: mine ? (mine.helpful ? "helpful" : "notHelpful") : null,
  };
}

export const issueInclude = {
  countries: true,
  comments: { orderBy: { createdAt: "asc" as const } },
  affectedUsers: true,
} satisfies Prisma.IssueInclude;

export function serializeIssue(
  issue: Prisma.IssueGetPayload<{ include: typeof issueInclude }>,
): PublicIssue {
  return {
    id: issue.id,
    title: issue.title,
    department: issue.department,
    category: issue.category,
    severity: issue.severity,
    status: issue.status,
    date: ymd(issue.issueDate) ?? "",
    reportedBy: issue.reportedById,
    affectedUsers: issue.affectedUsers.map((a) => a.userId),
    description: issue.description,
    rootCauses: asArray(issue.rootCauses),
    solution: issue.solution,
    preventionSteps: asArray(issue.preventionSteps),
    videoLink: issue.videoLink,
    isRecurring: issue.isRecurring,
    recurrenceCount: issue.recurrenceCount,
    countries: issue.countries.map((c) => c.countryId),
    comments: issue.comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      text: c.text,
      date: ymd(c.createdAt) ?? "",
    })),
    createdBy: issue.createdById,
    updatedBy: issue.updatedById,
    createdAt: ymd(issue.createdAt) ?? "",
    updatedAt: ymd(issue.updatedAt) ?? "",
  };
}

/** Empty country list means the record applies to all countries. */
export function countryWhere(country?: string | null): Prisma.SopWhereInput {
  if (!country || country === "all") return {};
  return {
    OR: [{ countries: { none: {} } }, { countries: { some: { countryId: country } } }],
  };
}

export function issueCountryWhere(country?: string | null): Prisma.IssueWhereInput {
  if (!country || country === "all") return {};
  return {
    OR: [{ countries: { none: {} } }, { countries: { some: { countryId: country } } }],
  };
}

export function bumpVersion(current: string) {
  const n = Number.parseFloat(current);
  if (Number.isNaN(n)) return "1.1";
  return (n + 0.1).toFixed(1);
}

export const trainingPathInclude = {
  steps: { orderBy: { sortOrder: "asc" as const } },
  enrollments: {
    include: { progress: true },
  },
} satisfies Prisma.TrainingPathInclude;

type PathPayload = Prisma.TrainingPathGetPayload<{ include: typeof trainingPathInclude }>;

export function serializeTrainingPath(
  path: PathPayload,
  opts?: { currentUserId?: string; sopTitles?: Record<string, string> },
): import("./types").PublicTrainingPath {
  const mine = opts?.currentUserId
    ? path.enrollments.find((e) => e.userId === opts.currentUserId) ?? null
    : null;
  const doneIds = new Set(mine?.progress.map((p) => p.stepId) ?? []);
  let lockedGate = false;
  const steps = path.steps.map((step) => {
    const completed = doneIds.has(step.id);
    const locked = lockedGate;
    if (step.required && !completed) lockedGate = true;
    return {
      id: step.id,
      sortOrder: step.sortOrder,
      type: step.type,
      title: step.title,
      description: step.description,
      content: step.content,
      videoUrl: step.videoUrl,
      sopId: step.sopId,
      sopTitle: step.sopId ? opts?.sopTitles?.[step.sopId] ?? null : null,
      required: step.required,
      completed,
      completedAt: mine?.progress.find((p) => p.stepId === step.id)
        ? ymd(mine.progress.find((p) => p.stepId === step.id)!.completedAt)
        : null,
      locked: locked && !completed,
    };
  });
  const total = steps.length;
  const done = steps.filter((s) => s.completed).length;
  return {
    id: path.id,
    title: path.title,
    department: path.department,
    description: path.description,
    active: path.active,
    createdBy: path.createdById,
    createdAt: ymd(path.createdAt) ?? "",
    updatedAt: ymd(path.updatedAt) ?? "",
    steps,
    enrollment: mine
      ? {
          id: mine.id,
          status: mine.status,
          startedAt: ymd(mine.startedAt),
          completedAt: ymd(mine.completedAt),
        }
      : null,
    progress: {
      done,
      total,
      percent: total ? Math.round((done / total) * 100) : 0,
    },
    enrolledCount: path.enrollments.length,
  };
}
