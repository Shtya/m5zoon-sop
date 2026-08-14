"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Bell, BookOpen, ChevronDown, Download, FileCode, FileSpreadsheet, Flame, List, LogOut, Menu, RefreshCw, Search, ShoppingCart, TriangleAlert, Users, X } from "lucide-react";
import { api } from "@/lib/api";
import { DEPARTMENTS, ISSUE_STATUS, ORDER_STATUSES, RELATED_ACTIONS, SMART_SYNONYMS, getCountry, getRole, isExpired, isExpiring } from "@/lib/constants";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/cn";
import { backupToXlsx, downloadBlob, type BackupPayload } from "@/lib/excel";
import type { SessionUser } from "@/lib/auth";
import type { PublicIssue, PublicSop } from "@/lib/types";
import { Av, EmptyState, PageHeader, RoleBadge } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { Popover } from "@/components/ui/popover";
import { Toast, type ToastMessage } from "@/components/ui/toast";
import { CountryBar } from "@/components/CountryBar";
import { LoginPage } from "@/components/LoginPage";
import { SopCard } from "@/components/sop/SopCard";
import { ChecklistModal, QuickModal } from "@/components/sop/QuickModal";
import { FullSopView } from "@/components/sop/FullSopView";
import { SopForm } from "@/components/sop/SopForm";
import { IssueCard, IssueDetail, IssueForm } from "@/components/issues/Issues";
import { UsersPage } from "@/components/users/UsersPage";
import { AnalyticsPage } from "@/components/analytics/AnalyticsPage";
import { OrderSim, SmartSearch } from "@/components/ops/OpsPages";
import { categoryOptions, departmentOptions, DeptIcon } from "@/components/icons";

type Section = "sops" | "issues" | "analytics" | "order" | "ai" | "users";

export function AppShell() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [sops, setSops] = useState<PublicSop[]>([]);
  const [issues, setIssues] = useState<PublicIssue[]>([]);
  const [analytics, setAnalytics] = useState<Parameters<typeof AnalyticsPage>[0]["data"]>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [busy, setBusy] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sopReview, setSopReview] = useState<"all" | "due">("all");
  const [issueRecurring, setIssueRecurring] = useState(false);

  const [section, setSection] = useState<Section>("sops");
  const [country, setCountry] = useState("all");
  const [sopView, setSopView] = useState<"list" | "full" | "create" | "edit">("list");
  const [activeSop, setActiveSop] = useState<PublicSop | null>(null);
  const [quickSop, setQuickSop] = useState<PublicSop | null>(null);
  const [checkSop, setCheckSop] = useState<PublicSop | null>(null);
  const [sopSearch, setSopSearch] = useState("");
  const [sopDept, setSopDept] = useState("all");
  const [sopStatus, setSopStatus] = useState("all");
  const [sopAction, setSopAction] = useState("all");

  const [issueView, setIssueView] = useState<"list" | "detail" | "create" | "edit" | "dashboard">("list");
  const [activeIssue, setActiveIssue] = useState<PublicIssue | null>(null);
  const [issueSearch, setIssueSearch] = useState("");
  const [issueDept, setIssueDept] = useState("all");
  const [issueCat, setIssueCat] = useState("all");
  const [issueSev, setIssueSev] = useState("all");
  const [issueStat, setIssueStat] = useState("all");

  const [smartResults, setSmartResults] = useState<PublicSop[]>([]);
  const [smartReason, setSmartReason] = useState<string | undefined>();
  const [smartLoading, setSmartLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  function notify(type: "ok" | "error", text: string) {
    setToast({ type, text });
  }

  function fail(e: unknown) {
    notify("error", e instanceof Error ? e.message : "حدث خطأ. لم يتم حفظ التغييرات.");
  }

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const loadUsers = useCallback(async () => {
    const data = await api<SessionUser[]>("/api/users");
    setUsers(data);
  }, []);

  const loadSops = useCallback(async () => {
    const params = new URLSearchParams();
    if (sopSearch) params.set("q", sopSearch);
    if (sopDept !== "all") params.set("department", sopDept);
    if (country !== "all") params.set("country", country);
    if (sopStatus !== "all") params.set("status", sopStatus);
    if (sopAction !== "all") params.set("action", sopAction);
    const data = await api<{ sops: PublicSop[] }>(`/api/sops?${params.toString()}`);
    setSops(data.sops);
  }, [sopSearch, sopDept, country, sopStatus, sopAction]);

  const loadIssues = useCallback(async () => {
    const params = new URLSearchParams();
    if (issueSearch) params.set("q", issueSearch);
    if (issueDept !== "all") params.set("department", issueDept);
    if (issueCat !== "all") params.set("category", issueCat);
    if (issueSev !== "all") params.set("severity", issueSev);
    if (issueStat !== "all") params.set("status", issueStat);
    if (issueRecurring) params.set("recurring", "1");
    if (country !== "all") params.set("country", country);
    const data = await api<{ issues: PublicIssue[] }>(`/api/issues?${params.toString()}`);
    setIssues(data.issues);
  }, [issueSearch, issueDept, issueCat, issueSev, issueStat, issueRecurring, country]);

  useEffect(() => {
    api<{ user: SessionUser }>("/api/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api<SessionUser[]>("/api/users")
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((e) => {
        if (!cancelled) fail(e);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const params = new URLSearchParams();
    if (sopSearch) params.set("q", sopSearch);
    if (sopDept !== "all") params.set("department", sopDept);
    if (country !== "all") params.set("country", country);
    if (sopStatus !== "all") params.set("status", sopStatus);
    if (sopAction !== "all") params.set("action", sopAction);
    api<{ sops: PublicSop[] }>(`/api/sops?${params.toString()}`)
      .then((data) => {
        if (!cancelled) setSops(data.sops);
      })
      .catch((e) => {
        if (!cancelled) fail(e);
      });
    return () => {
      cancelled = true;
    };
  }, [user, sopSearch, sopDept, country, sopStatus, sopAction]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const params = new URLSearchParams();
    if (issueSearch) params.set("q", issueSearch);
    if (issueDept !== "all") params.set("department", issueDept);
    if (issueCat !== "all") params.set("category", issueCat);
    if (issueSev !== "all") params.set("severity", issueSev);
    if (issueStat !== "all") params.set("status", issueStat);
    if (issueRecurring) params.set("recurring", "1");
    if (country !== "all") params.set("country", country);
    api<{ issues: PublicIssue[] }>(`/api/issues?${params.toString()}`)
      .then((data) => {
        if (!cancelled) setIssues(data.issues);
      })
      .catch((e) => {
        if (!cancelled) fail(e);
      });
    return () => {
      cancelled = true;
    };
  }, [user, issueSearch, issueDept, issueCat, issueSev, issueStat, issueRecurring, country]);

  useEffect(() => {
    if (!user || (section !== "analytics" && issueView !== "dashboard")) return;
    if (!can(user.role, "analytics.view") && section === "analytics") return;
    let cancelled = false;
    const params = country !== "all" ? `?country=${country}` : "";
    api<NonNullable<Parameters<typeof AnalyticsPage>[0]["data"]>>(`/api/analytics${params}`)
      .then((data) => {
        if (!cancelled) setAnalytics(data);
      })
      .catch((e) => {
        if (!cancelled) fail(e);
      });
    return () => {
      cancelled = true;
    };
  }, [user, section, issueView, country]);

  async function openSop(sop: PublicSop) {
    try {
      const fresh = await api<PublicSop>(`/api/sops/${sop.id}`);
      setActiveSop(fresh);
      setSopView("full");
      setSops((p) => p.map((s) => (s.id === fresh.id ? fresh : s)));
    } catch (e) {
      fail(e);
    }
  }

  async function vote(id: string, type: "helpful" | "notHelpful") {
    setBusy(true);
    try {
      const fresh = await api<PublicSop>(`/api/sops/${id}/vote`, { method: "POST", body: JSON.stringify({ type }) });
      setSops((p) => p.map((s) => (s.id === id ? fresh : s)));
      setActiveSop((s) => (s?.id === id ? fresh : s));
      setQuickSop((s) => (s?.id === id ? fresh : s));
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function ack(id: string) {
    setBusy(true);
    try {
      const fresh = await api<PublicSop>(`/api/sops/${id}/acknowledge`, { method: "POST" });
      setSops((p) => p.map((s) => (s.id === id ? fresh : s)));
      setActiveSop((s) => (s?.id === id ? fresh : s));
      setQuickSop((s) => (s?.id === id ? fresh : s));
      notify("ok", "تم تسجيل القراءة");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function commentSop(id: string, text: string) {
    setBusy(true);
    try {
      const fresh = await api<PublicSop>(`/api/sops/${id}/comments`, { method: "POST", body: JSON.stringify({ text }) });
      setActiveSop(fresh);
      setSops((p) => p.map((s) => (s.id === id ? fresh : s)));
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function saveSop(form: Record<string, unknown>) {
    setBusy(true);
    try {
      if (activeSop && sopView === "edit") {
        const fresh = await api<PublicSop>(`/api/sops/${activeSop.id}`, { method: "PUT", body: JSON.stringify(form) });
        setActiveSop(fresh);
        setSopView("full");
        await loadSops();
        notify("ok", "تم حفظ SOP بنجاح");
      } else {
        await api<PublicSop>("/api/sops", { method: "POST", body: JSON.stringify(form) });
        setSopView("list");
        setActiveSop(null);
        await loadSops();
        notify("ok", "تم إنشاء SOP بنجاح");
      }
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function deleteSop(id: string) {
    if (!window.confirm("حذف هذا الـ SOP نهائياً؟")) return;
    setBusy(true);
    try {
      await api(`/api/sops/${id}`, { method: "DELETE" });
      setSopView("list");
      setActiveSop(null);
      await loadSops();
      notify("ok", "تم حذف SOP");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function saveIssue(form: Record<string, unknown>) {
    setBusy(true);
    try {
      if (activeIssue && issueView === "edit") {
        const fresh = await api<PublicIssue>(`/api/issues/${activeIssue.id}`, { method: "PUT", body: JSON.stringify(form) });
        setActiveIssue(fresh);
        setIssueView("detail");
        await loadIssues();
        notify("ok", "تم حفظ المشكلة");
      } else {
        await api("/api/issues", { method: "POST", body: JSON.stringify(form) });
        setIssueView("list");
        setActiveIssue(null);
        await loadIssues();
        notify("ok", "تم تسجيل المشكلة");
      }
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function deleteIssue(id: string) {
    if (!window.confirm("حذف هذه المشكلة نهائياً؟")) return;
    try {
      await api(`/api/issues/${id}`, { method: "DELETE" });
      setIssueView("list");
      setActiveIssue(null);
      await loadIssues();
    } catch (e) {
      fail(e);
    }
  }

  async function commentIssue(id: string, text: string) {
    try {
      const fresh = await api<PublicIssue>(`/api/issues/${id}/comments`, { method: "POST", body: JSON.stringify({ text }) });
      setActiveIssue(fresh);
      await loadIssues();
    } catch (e) {
      fail(e);
    }
  }

  async function statusIssue(id: string, status: string) {
    try {
      const fresh = await api<PublicIssue>(`/api/issues/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setActiveIssue(fresh);
      await loadIssues();
    } catch (e) {
      fail(e);
    }
  }

  async function smartSearch(q: string) {
    if (!q.trim()) return;
    setSmartLoading(true);
    try {
      const extra = SMART_SYNONYMS[q]?.join(" ") || "";
      const query = extra ? `${q} ${extra}` : q;
      const data = await api<{ sops: PublicSop[]; reason?: string }>(`/api/sops?smart=1&q=${encodeURIComponent(query)}&country=${country}`);
      setSmartResults(data.sops);
      setSmartReason(data.reason || `نتائج البحث عن «${q}»`);
    } catch (e) {
      fail(e);
    } finally {
      setSmartLoading(false);
    }
  }

  async function backup(format: "json" | "excel") {
    setBackupOpen(false);
    try {
      const data = await api<BackupPayload>("/api/backup");
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "excel") {
        downloadBlob(backupToXlsx(data), `makhzon-backup-${stamp}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        notify("ok", "تم تنزيل النسخة الاحتياطية Excel");
      } else {
        downloadBlob(JSON.stringify(data, null, 2), `makhzon-backup-${stamp}.json`, "application/json");
        notify("ok", "تم تنزيل النسخة الاحتياطية JSON");
      }
    } catch (e) {
      fail(e);
    }
  }

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-muted-foreground">
        جاري التحقق من الجلسة...
      </div>
    );
  }
  if (!user) return <LoginPage onLogin={setUser} />;

  const expAlerts = sops.filter((s) => isExpiring(s.reviewDate) || isExpired(s.reviewDate));
  const visibleSops = sopReview === "due" ? expAlerts : sops;
  const openIssues = issues.filter((i) => i.status === "open").length;
  const recurIssues = issues.filter((i) => i.isRecurring || i.status === "recurring").length;
  const liveSop = activeSop ? sops.find((s) => s.id === activeSop.id) || activeSop : null;
  const liveIssue = activeIssue ? issues.find((i) => i.id === activeIssue.id) || activeIssue : null;
  const attentionCount = expAlerts.length + openIssues;
  const alertCount = expAlerts.length + openIssues + recurIssues;

  const SECTIONS = [
    { id: "sops" as const, label: "SOPs", icon: BookOpen, show: true, count: sops.length },
    { id: "issues" as const, label: "المشاكل اليومية", icon: Flame, show: true, count: openIssues },
    { id: "order" as const, label: "محاكاة الطلب", icon: ShoppingCart, show: true, count: 0 },
    { id: "ai" as const, label: "بحث ذكي", icon: Search, show: true, count: 0 },
    { id: "analytics" as const, label: "التحليلات", icon: BarChart3, show: can(user.role, "analytics.view"), count: 0 },
    { id: "users" as const, label: "المستخدمين", icon: Users, show: can(user.role, "users.view"), count: 0 },
  ];

  function go(id: Section) {
    setSection(id);
    setSopView("list");
    setIssueView("list");
    setActiveSop(null);
    setActiveIssue(null);
    setNavOpen(false);
    setSopReview("all");
    setIssueRecurring(false);
  }

  function openAlert(kind: "sops" | "open" | "recurring") {
    setNotifOpen(false);
    setSopView("list");
    setIssueView("list");
    setActiveSop(null);
    setActiveIssue(null);
    if (kind === "sops") {
      setSopSearch("");
      setSopDept("all");
      setSopStatus("all");
      setSopAction("all");
      setSopReview("due");
      setIssueRecurring(false);
      setSection("sops");
      requestAnimationFrame(() => {
        document.getElementById("makhzon-main")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    setIssueSearch("");
    setIssueDept("all");
    setIssueCat("all");
    setIssueSev("all");
    setSopReview("all");
    if (kind === "open") {
      setIssueStat("open");
      setIssueRecurring(false);
    } else {
      setIssueStat("all");
      setIssueRecurring(true);
    }
    setSection("issues");
    requestAnimationFrame(() => {
      document.getElementById("makhzon-main")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const nav = (
    <>
      <div className="mb-5 flex items-center gap-2.5 border-b border-white/[0.08] pb-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary text-sm font-bold text-white">م</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold leading-tight text-white">Makhzon</p>
          <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-sidebar-muted">Knowledge ops</p>
        </div>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto" aria-label="Main">
        {SECTIONS.filter((s) => s.show).map((s) => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => go(s.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-start text-[13.5px] transition-colors",
                active
                  ? "border-s-[3px] border-primary bg-sidebar-active ps-[7px] text-white"
                  : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-85" strokeWidth={1.8} />
              <span className="truncate">{s.label}</span>
              {s.count > 0 && (
                <span className={cn("ms-auto rounded-full px-1.5 py-px font-mono text-[10px]", active ? "bg-primary text-white" : "bg-white/[0.07] text-sidebar-muted")}>
                  {s.count}
                </span>
              )}
            </button>
          );
        })}
        {attentionCount > 0 && (
          <div className="mt-5 flex items-start gap-2 rounded-[var(--radius-md)] border border-[rgba(199,64,45,0.3)] bg-[rgba(199,64,45,0.16)] p-3 text-xs text-[#F5D3CC]">
            <Flame className="mt-0.5 h-[15px] w-[15px] shrink-0 text-[#EB8A78]" strokeWidth={2} />
            <div>
              {expAlerts.length > 0 && <span>{expAlerts.length} SOP تحتاج مراجعة. </span>}
              {openIssues > 0 && <span>{openIssues} مشكلة مفتوحة.</span>}
            </div>
          </div>
        )}
      </nav>
      <div className="mt-auto flex items-center gap-2.5 border-t border-white/[0.08] pt-5">
        <Av initials={user.avatar || user.name.slice(0, 2)} color={getRole(user.role).color} size={32} />
        <div className="min-w-0 flex-1 leading-snug">
          <p className="truncate text-[13px] font-medium text-white">{user.name}</p>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-sidebar-muted">{getRole(user.role).label}</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-paper">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="sticky top-0 hidden h-svh p-3 lg:block">
        <aside className="flex h-full w-[264px] shrink-0 flex-col overflow-hidden rounded-2xl bg-sidebar px-5 py-6 text-sidebar-foreground shadow-lg">{nav}</aside>
      </div>

      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink-900/50" aria-label="إغلاق القائمة" onClick={() => setNavOpen(false)} />
          <aside className="absolute inset-y-3 start-3 flex w-[264px] flex-col overflow-hidden rounded-2xl bg-sidebar px-5 py-6 text-sidebar-foreground shadow-lg">{nav}</aside>
          <button type="button" className="absolute end-4 top-4 rounded-[var(--radius-md)] bg-white/10 p-2 text-white" onClick={() => setNavOpen(false)} aria-label="إغلاق">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 bg-paper p-3 lg:ps-0">
        <header className="flex h-16 shrink-0 items-center gap-3 overflow-visible rounded-2xl bg-surface/95 px-4 shadow-lg sm:px-6">
          <button
            type="button"
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[var(--radius-md)] border border-border-strong bg-surface text-muted-foreground shadow-xs lg:hidden"
            onClick={() => setNavOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-foreground">
              {section === "sops" && "مكتبة الإجراءات"}
              {section === "issues" && "المشاكل اليومية"}
              {section === "order" && "محاكاة الطلب"}
              {section === "ai" && "البحث الذكي"}
              {section === "analytics" && "التحليلات"}
              {section === "users" && "المستخدمين"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Popover
              open={notifOpen}
              onOpenChange={(v) => {
                setNotifOpen(v);
                if (v) setBackupOpen(false);
              }}
              width={288}
              trigger={
                <button
                  type="button"
                  onClick={() => {
                    setBackupOpen(false);
                    setNotifOpen((v) => !v);
                  }}
                  className="relative inline-flex h-[34px] w-[34px] items-center justify-center rounded-[var(--radius-md)] border border-border-strong bg-surface text-muted-foreground shadow-xs"
                  aria-label="التنبيهات"
                  aria-expanded={notifOpen}
                >
                  <Bell className="h-4 w-4" />
                  {alertCount > 0 && (
                    <span className="absolute -end-1 -top-1 min-w-[16px] rounded-full bg-danger px-1 text-center font-mono text-[9px] font-bold leading-[16px] text-white">
                      {alertCount}
                    </span>
                  )}
                </button>
              }
            >
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">تنبيهات تحتاج متابعة</p>
              {expAlerts.length > 0 && (
                <button type="button" className="flex w-full items-start gap-2.5 px-3 py-2.5 text-start text-[13px] hover:bg-paper" onClick={() => openAlert("sops")}>
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span>
                    <span className="block font-medium text-foreground">{expAlerts.length} SOP تحتاج مراجعة</span>
                    <span className="text-[12px] text-muted-foreground">إجراءات قاربت أو تجاوزت تاريخ المراجعة</span>
                  </span>
                </button>
              )}
              {openIssues > 0 && (
                <button type="button" className="flex w-full items-start gap-2.5 px-3 py-2.5 text-start text-[13px] hover:bg-paper" onClick={() => openAlert("open")}>
                  <Flame className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  <span>
                    <span className="block font-medium text-foreground">{openIssues} مشكلة مفتوحة</span>
                    <span className="text-[12px] text-muted-foreground">مشاكل يومية لم تُغلق بعد</span>
                  </span>
                </button>
              )}
              {recurIssues > 0 && (
                <button type="button" className="flex w-full items-start gap-2.5 px-3 py-2.5 text-start text-[13px] hover:bg-paper" onClick={() => openAlert("recurring")}>
                  <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                  <span>
                    <span className="block font-medium text-foreground">{recurIssues} مشكلة متكررة</span>
                    <span className="text-[12px] text-muted-foreground">نفس المشكلة ظهرت أكثر من مرة</span>
                  </span>
                </button>
              )}
              {alertCount === 0 && <p className="px-3 py-4 text-[13px] text-muted-foreground">لا توجد تنبيهات حالياً</p>}
            </Popover>
            {can(user.role, "backup.manage") && (
              <Popover
                open={backupOpen}
                onOpenChange={(v) => {
                  setBackupOpen(v);
                  if (v) setNotifOpen(false);
                }}
                width={224}
                trigger={
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      setBackupOpen((v) => !v);
                    }}
                    className="btn-outline h-[34px] px-3 text-[12px]"
                    aria-expanded={backupOpen}
                  >
                    <Download className="h-3.5 w-3.5" /> Backup <ChevronDown className="h-3 w-3 opacity-70" />
                  </button>
                }
              >
                <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-[13px] hover:bg-paper" onClick={() => backup("json")}>
                  <FileCode className="h-4 w-4 text-primary" />
                  <span>
                    <span className="block font-medium">ملف JSON</span>
                    <span className="text-[12px] text-muted-foreground">نسخة كاملة للنظام</span>
                  </span>
                </button>
                <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-[13px] hover:bg-paper" onClick={() => backup("excel")}>
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  <span>
                    <span className="block font-medium">ورقة Excel</span>
                    <span className="text-[12px] text-muted-foreground">مستخدمين، SOPs، مشاكل</span>
                  </span>
                </button>
              </Popover>
            )}
            <div className="hidden items-center gap-2 ps-1 md:flex">
              <Av initials={user.avatar || user.name.slice(0, 2)} color={getRole(user.role).color} size={32} />
              <div className="text-[12.5px] leading-tight">
                <p className="font-medium text-foreground">{user.name}</p>
                <RoleBadge role={user.role} />
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await api("/api/auth/logout", { method: "POST" });
                setUser(null);
              }}
              className="inline-flex h-[34px] items-center gap-1 rounded-[var(--radius-md)] border border-danger/25 bg-danger-soft px-2.5 text-[12px] font-semibold text-danger"
            >
              <LogOut className="h-3.5 w-3.5" /> خروج
            </button>
          </div>
        </header>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 pb-3 lg:ps-0">
        <CountryBar
          active={country}
          onChange={(c) => {
            setCountry(c);
            setSopView("list");
            setIssueView("list");
            setActiveSop(null);
            setActiveIssue(null);
          }}
        />

        <main id="makhzon-main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">

          {section === "sops" && (
            <div>
              {sopView === "list" && (
                <PageHeader
                  title="مكتبة الإجراءات (SOPs)"
                  description={`${visibleSops.length} إجراء${sopReview === "due" ? " تحتاج مراجعة" : ""}${country !== "all" ? ` · ${getCountry(country)?.code} ${getCountry(country)?.name}` : ""}`}
                  actions={
                    can(user.role, "sop.create") ? (
                      <button type="button" className="btn-primary" onClick={() => { setActiveSop(null); setSopView("create"); }}>
                        + إنشاء SOP
                      </button>
                    ) : undefined
                  }
                />
              )}
              {sopView === "list" && (
                <div>
                  <div className="mb-5 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5 shadow-xs">
                    <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_180px_180px]">
                      <input value={sopSearch} onChange={(e) => setSopSearch(e.target.value)} placeholder="ابحث بالعنوان أو الكلمة المفتاحية..." className="field-input" />
                      <Dropdown
                        value={sopStatus}
                        onChange={setSopStatus}
                        size="sm"
                        options={[{ value: "all", label: "كل الحالات" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: s }))]}
                      />
                      <Dropdown
                        value={sopAction}
                        onChange={setSopAction}
                        size="sm"
                        options={[{ value: "all", label: "كل الإجراءات" }, ...RELATED_ACTIONS.map((s) => ({ value: s, label: s }))]}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSopDept("all")}
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-xs",
                          sopDept === "all" ? "border-primary bg-primary text-white" : "border-border-strong bg-surface-sunken text-muted-foreground",
                        )}
                      >
                        الكل
                      </button>
                      {DEPARTMENTS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setSopDept(d.id)}
                          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px]"
                          style={
                            sopDept === d.id
                              ? { background: d.color + "18", color: d.color, borderColor: d.color + "44" }
                              : { background: "var(--surface-sunken)", color: "var(--text-secondary)", borderColor: "var(--border-strong)" }
                          }
                        >
                          <DeptIcon id={d.id} className="h-3 w-3" /> {d.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSopReview((v) => (v === "due" ? "all" : "due"))}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px]",
                          sopReview === "due" ? "border-warning/40 bg-warning-soft font-semibold text-warning" : "border-border-strong bg-surface-sunken text-muted-foreground",
                        )}
                      >
                        <TriangleAlert className="h-3 w-3" /> تحتاج مراجعة
                      </button>
                    </div>
                  </div>
                  {visibleSops.length === 0 ? (
                    <EmptyState title="لا توجد نتائج" description={sopReview === "due" ? "لا توجد إجراءات تحتاج مراجعة حالياً." : "جرّب تغيير الفلاتر أو كلمة البحث."} />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {visibleSops.map((s) => (
                        <SopCard key={s.id} sop={s} onOpen={openSop} onQuick={setQuickSop} currentUser={user} />
                      ))}
                    </div>
                  )}
                </div>
              )}
              {sopView === "full" && liveSop && (
                <FullSopView
                  sop={liveSop}
                  onBack={() => { setSopView("list"); setActiveSop(null); }}
                  onVote={vote}
                  onAck={ack}
                  onComment={commentSop}
                  onEdit={(s) => { setActiveSop(s); setSopView("edit"); }}
                  onDelete={deleteSop}
                  currentUser={user}
                  users={users}
                  onChecklist={() => setCheckSop(liveSop)}
                  busy={busy}
                />
              )}
              {(sopView === "create" || sopView === "edit") && (
                <SopForm initial={sopView === "edit" ? activeSop : null} onSave={saveSop} onCancel={() => setSopView(activeSop ? "full" : "list")} busy={busy} />
              )}
            </div>
          )}

          {section === "issues" && (
            <div>
              {(issueView === "list" || issueView === "dashboard") && (
                <PageHeader
                  title={issueView === "list" ? "المشاكل اليومية" : "تحليلات المشاكل"}
                  description={issueView === "list" ? `${issues.length} مشكلة مسجّلة` : undefined}
                  actions={
                    <div className="flex gap-2">
                      {issueView === "list" && can(user.role, "analytics.view") && (
                        <button type="button" className="btn-outline" onClick={() => setIssueView("dashboard")}>
                          <BarChart3 className="h-3.5 w-3.5" /> التحليلات
                        </button>
                      )}
                      {issueView === "dashboard" && (
                        <button type="button" className="btn-outline" onClick={() => setIssueView("list")}>
                          <List className="h-3.5 w-3.5" /> القائمة
                        </button>
                      )}
                      {issueView === "list" && can(user.role, "issues.create") && (
                        <button type="button" className="btn-primary" style={{ background: "var(--danger)" }} onClick={() => { setActiveIssue(null); setIssueView("create"); }}>
                          + تسجيل مشكلة
                        </button>
                      )}
                    </div>
                  }
                />
              )}
              {issueView === "list" && (
                <div>
                  <div className="mb-4 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5 shadow-xs">
                    <div className="makhzon-filters">
                      <input value={issueSearch} onChange={(e) => setIssueSearch(e.target.value)} placeholder="ابحث في المشاكل..." className="field-input" />
                      <Dropdown value={issueDept} onChange={setIssueDept} size="sm" options={[{ value: "all", label: "كل الأقسام" }, ...departmentOptions()]} />
                      <Dropdown value={issueCat} onChange={setIssueCat} size="sm" options={[{ value: "all", label: "كل الفئات" }, ...categoryOptions()]} />
                      <Dropdown value={issueSev} onChange={setIssueSev} size="sm" options={[{ value: "all", label: "كل الخطورة" }, { value: "low", label: "منخفضة" }, { value: "medium", label: "متوسطة" }, { value: "high", label: "عالية" }, { value: "critical", label: "حرجة" }]} />
                      <Dropdown value={issueStat} onChange={setIssueStat} size="sm" options={[{ value: "all", label: "كل الحالات" }, ...ISSUE_STATUS.map((s) => ({ value: s.id, label: s.label }))]} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIssueRecurring((v) => !v)}
                      className={cn(
                        "mt-2 inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px]",
                        issueRecurring ? "border-purple-200 bg-[#f6f1fb] font-semibold text-purple-600" : "border-border-strong bg-surface-sunken text-muted-foreground",
                      )}
                    >
                      <RefreshCw className="h-3 w-3" /> متكررة فقط
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {issues.map((iss) => (
                      <IssueCard key={iss.id} issue={iss} users={users} onOpen={(i) => { setActiveIssue(i); setIssueView("detail"); }} />
                    ))}
                    {issues.length === 0 && <EmptyState title="لا توجد نتائج" description="لا توجد مشاكل مطابقة للفلاتر الحالية." />}
                  </div>
                </div>
              )}
              {issueView === "dashboard" && <AnalyticsPage data={analytics} />}
              {issueView === "detail" && liveIssue && (
                <IssueDetail issue={liveIssue} users={users} onBack={() => { setIssueView("list"); setActiveIssue(null); }} onEdit={(i) => { setActiveIssue(i); setIssueView("edit"); }} onDelete={deleteIssue} currentUser={user} onAddComment={commentIssue} onUpdateStatus={statusIssue} busy={busy} />
              )}
              {(issueView === "create" || issueView === "edit") && (
                <IssueForm initial={issueView === "edit" ? activeIssue : null} onSave={saveIssue} onCancel={() => setIssueView(activeIssue ? "detail" : "list")} users={users} currentUser={user} busy={busy} />
              )}
            </div>
          )}

          {section === "order" && <OrderSim sops={sops} onQuick={setQuickSop} />}
          {section === "ai" && (
            <SmartSearch onSearch={smartSearch} results={smartResults} reason={smartReason} loading={smartLoading} onOpen={(s) => { setSection("sops"); openSop(s); }} onQuick={setQuickSop} />
          )}
          {section === "analytics" && <AnalyticsPage data={analytics} />}
          {section === "users" && (
            <UsersPage
              users={users}
              currentUser={user}
              busy={busy}
              onCreate={async (form) => {
                try {
                  await api("/api/users", { method: "POST", body: JSON.stringify(form) });
                  await loadUsers();
                  notify("ok", "تم إنشاء المستخدم");
                } catch (e) { fail(e); }
              }}
              onUpdate={async (id, form) => {
                try {
                  await api(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(form) });
                  await loadUsers();
                  notify("ok", "تم تحديث المستخدم");
                } catch (e) { fail(e); }
              }}
              onDelete={async (id) => {
                try {
                  await api(`/api/users/${id}`, { method: "DELETE" });
                  await loadUsers();
                } catch (e) { fail(e); }
              }}
            />
          )}
        </main>
        </div>
      </div>

      <QuickModal sop={quickSop} onClose={() => setQuickSop(null)} onFull={() => { if (quickSop) { openSop(quickSop); setQuickSop(null); setSection("sops"); } }} onVote={vote} onAck={ack} currentUser={user} busy={busy} />
      {checkSop && <ChecklistModal sop={checkSop} onClose={() => setCheckSop(null)} />}
    </div>
  );
}
