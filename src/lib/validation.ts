import { z } from "zod";

const step = z.object({
  id: z.string().optional(),
  text: z.string(),
  imageUrl: z.string().optional(),
});

const rule = z.object({
  condition: z.string(),
  action: z.string(),
});

const contact = z.object({
  problemType: z.string(),
  name: z.string(),
  position: z.string(),
  phone: z.string(),
  whatsapp: z.string().optional(),
});

const attachment = z.object({
  type: z.enum(["google_doc", "word", "other"]).default("google_doc"),
  label: z.string(),
  url: z.string(),
});

export const sopBodySchema = z.object({
  department: z.string().min(1),
  title: z.string().trim().min(1, "يرجى كتابة عنوان الـ SOP"),
  objective: z.string().optional().default(""),
  steps: z.array(step).default([]),
  decisionRules: z.array(rule).default([]),
  escalationContacts: z.array(contact).default([]),
  commonMistakes: z.array(z.string()).default([]),
  videoLink: z.string().optional().default(""),
  attachments: z.array(attachment).default([]),
  keywords: z.array(z.string()).default([]),
  relatedStatuses: z.array(z.string()).default([]),
  relatedActions: z.array(z.string()).default([]),
  countries: z.array(z.string()).default([]),
  reviewDate: z.string().nullable().optional(),
  changeReason: z.string().optional(),
});

export const issueBodySchema = z.object({
  title: z.string().trim().min(1, "يرجى كتابة عنوان للمشكلة"),
  department: z.string().min(1),
  category: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: z.enum(["open", "progress", "resolved", "recurring"]).default("open"),
  date: z.string().min(1),
  reportedBy: z.string().optional(),
  affectedUsers: z.array(z.string()).default([]),
  description: z.string().optional().default(""),
  rootCauses: z.array(z.string()).default([]),
  solution: z.string().optional().default(""),
  preventionSteps: z.array(z.string()).default([]),
  videoLink: z.string().optional().default(""),
  isRecurring: z.boolean().default(false),
  recurrenceCount: z.number().int().min(1).default(1),
  countries: z.array(z.string()).default([]),
});

export const userBodySchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(4).optional(),
  role: z.enum(["super_admin", "admin", "team_leader", "employee"]).default("employee"),
  department: z.string().min(1),
  position: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  active: z.boolean().optional().default(true),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const trainingStepSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["read_sop", "watch_video", "read_content", "task"]),
  title: z.string().trim().min(1, "يرجى كتابة عنوان الخطوة"),
  description: z.string().optional().default(""),
  content: z.string().optional().default(""),
  videoUrl: z.string().optional().default(""),
  sopId: z.string().nullable().optional(),
  required: z.boolean().default(true),
});

export const trainingPathBodySchema = z.object({
  title: z.string().trim().min(1, "يرجى كتابة عنوان المسار"),
  department: z.string().min(1),
  description: z.string().optional().default(""),
  active: z.boolean().optional().default(true),
  steps: z.array(trainingStepSchema).min(1, "أضف خطوة واحدة على الأقل"),
});

export const trainingEnrollSchema = z.object({
  userId: z.string().min(1).optional(),
});

export function cleanStrings(list: string[]) {
  return list.map((s) => s.trim()).filter(Boolean);
}

export function cleanSteps(steps: { id?: string; text: string; imageUrl?: string }[]) {
  return steps
    .map((s, i) => ({
      id: s.id || `s-${i + 1}`,
      text: s.text.trim(),
      imageUrl: s.imageUrl?.trim() || undefined,
    }))
    .filter((s) => s.text);
}

export function cleanRules(rules: { condition: string; action: string }[]) {
  return rules.filter((r) => r.condition.trim() || r.action.trim());
}

export function cleanContacts(
  contacts: { problemType: string; name: string; position: string; phone: string; whatsapp?: string }[],
) {
  return contacts.filter((c) => c.name.trim() || c.phone.trim());
}

export function cleanAttachments(
  atts: { type: "google_doc" | "word" | "other"; label: string; url: string }[],
) {
  return atts.filter((a) => a.url.trim());
}
