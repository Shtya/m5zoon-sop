export const DEPARTMENTS = [
  { id: "call-center", label: "Call Center", icon: "📞", color: "#3B82F6" },
  { id: "account-manager", label: "Account Manager", icon: "👤", color: "#8B5CF6" },
  { id: "warehouse", label: "Warehouse", icon: "🏭", color: "#F59E0B" },
  { id: "shipping", label: "Shipping", icon: "🚚", color: "#10B981" },
  { id: "data-entry", label: "Data Entry", icon: "📝", color: "#EC4899" },
  { id: "operations", label: "Operations", icon: "⚙️", color: "#6366F1" },
  { id: "finance", label: "Finance", icon: "💰", color: "#14B8A6" },
] as const;

export const ORDER_STATUSES = [
  "Waiting for Address",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Return Requested",
  "Refunded",
  "On Hold",
  "Pending Payment",
] as const;

export const RELATED_ACTIONS = [
  "Confirm Order",
  "Cancel Order",
  "Update Address",
  "Reschedule Delivery",
  "Issue Refund",
  "Create Return",
  "Contact Customer",
  "Escalate to Manager",
] as const;

export const ROLES = [
  { id: "super_admin", label: "Super Admin", icon: "👑", color: "#f59e0b" },
  { id: "admin", label: "Admin", icon: "🛡", color: "#3b82f6" },
  { id: "team_leader", label: "Team Leader", icon: "⭐", color: "#8b5cf6" },
  { id: "employee", label: "Employee", icon: "👤", color: "#64748b" },
] as const;

export const COUNTRIES = [
  { id: "ae", name: "الإمارات", flag: "🇦🇪", color: "#10B981" },
  { id: "sa", name: "السعودية", flag: "🇸🇦", color: "#22c55e" },
  { id: "jo", name: "الأردن", flag: "🇯🇴", color: "#ef4444" },
  { id: "om", name: "عُمان", flag: "🇴🇲", color: "#f59e0b" },
] as const;

export const COUNTRY_PHONE_PREFIX: Record<string, string> = {
  ae: "971",
  sa: "966",
  jo: "962",
  om: "968",
};

export const PROBLEM_TYPES = [
  "عنوان غلط أو ناقص",
  "طلب إلغاء",
  "تأخر التوصيل",
  "منتج تالف أو خاطئ",
  "مشكلة دفع",
  "شكوى عميل",
  "مشكلة تقنية",
  "استرداد مبلغ",
  "أخرى",
] as const;

export const ISSUE_CATS = [
  { id: "shipping_co", label: "شركة شحن", icon: "🚚", color: "#10B981" },
  { id: "customer", label: "مشكلة عميل", icon: "👤", color: "#3B82F6" },
  { id: "system", label: "سيستم", icon: "💻", color: "#6366F1" },
  { id: "call_center", label: "Call Center", icon: "📞", color: "#EC4899" },
  { id: "packaging", label: "تغليف", icon: "📦", color: "#F59E0B" },
  { id: "warehouse_i", label: "مخزن", icon: "🏭", color: "#F97316" },
  { id: "finance_i", label: "مالية", icon: "💰", color: "#14B8A6" },
  { id: "other", label: "أخرى", icon: "🔧", color: "#64748b" },
] as const;

export const SEVERITY = [
  { id: "low", label: "منخفضة", color: "#22c55e" },
  { id: "medium", label: "متوسطة", color: "#f59e0b" },
  { id: "high", label: "عالية", color: "#ef4444" },
  { id: "critical", label: "حرجة", color: "#a855f7" },
] as const;

export const ISSUE_STATUS = [
  { id: "open", label: "مفتوحة", color: "#ef4444" },
  { id: "progress", label: "قيد الحل", color: "#f59e0b" },
  { id: "resolved", label: "محلولة", color: "#22c55e" },
  { id: "recurring", label: "متكررة", color: "#a855f7" },
] as const;

export const SMART_SYNONYMS: Record<string, string[]> = {
  "العميل مش رد": ["عنوان", "عميل", "ناقص", "واتساب"],
  "الطرد تالف": ["تغليف", "تالف", "تعبئة", "شحن"],
  "عايز يكنسل": ["إلغاء", "Cancel"],
  "عنوان غلط": ["عنوان", "ناقص", "توصيل"],
};

export function getDept(id: string) {
  return DEPARTMENTS.find((d) => d.id === id) ?? DEPARTMENTS[0];
}

export function getRole(id: string) {
  return ROLES.find((r) => r.id === id) ?? ROLES[3];
}

export function getCountry(id: string) {
  return COUNTRIES.find((c) => c.id === id) ?? null;
}

export function getIssCat(id: string) {
  return ISSUE_CATS.find((c) => c.id === id) ?? ISSUE_CATS[7];
}

export function getSev(id: string) {
  return SEVERITY.find((s) => s.id === id) ?? SEVERITY[1];
}

export function getIssueSt(id: string) {
  return ISSUE_STATUS.find((s) => s.id === id) ?? ISSUE_STATUS[0];
}

export function isExpiring(d?: string | Date | null) {
  if (!d) return false;
  const diff = (new Date(d).getTime() - Date.now()) / 864e5;
  return diff <= 30 && diff >= 0;
}

export function isExpired(d?: string | Date | null) {
  if (!d) return false;
  return new Date(d).getTime() < Date.now();
}

export function toDateInput(d?: string | Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function whatsappLink(phone?: string, whatsapp?: string, countryId?: string) {
  const source = (whatsapp || phone || "").trim();
  if (!source) return "";
  let digits = source.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && countryId && COUNTRY_PHONE_PREFIX[countryId]) {
    digits = COUNTRY_PHONE_PREFIX[countryId] + digits.slice(1);
  }
  return `https://wa.me/${digits}`;
}
