"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DEPARTMENTS, ISSUE_CATS, ISSUE_STATUS, ORDER_STATUSES, RELATED_ACTIONS, SMART_SYNONYMS, getCountry, getRole, isExpired, isExpiring } from "@/lib/constants";
import { can } from "@/lib/permissions";
import type { SessionUser } from "@/lib/auth";
import type { PublicIssue, PublicSop } from "@/lib/types";
import { Av, Banner, RoleBadge, T } from "@/components/ui";
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

type Section = "sops" | "issues" | "analytics" | "order" | "ai" | "users";

export function AppShell() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [sops, setSops] = useState<PublicSop[]>([]);
  const [issues, setIssues] = useState<PublicIssue[]>([]);
  const [analytics, setAnalytics] = useState<Parameters<typeof AnalyticsPage>[0]["data"]>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

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

  function fail(e: unknown) {
    setError(e instanceof Error ? e.message : "حدث خطأ. لم يتم حفظ التغييرات.");
    setOk("");
  }

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
    if (country !== "all") params.set("country", country);
    const data = await api<{ issues: PublicIssue[] }>(`/api/issues?${params.toString()}`);
    setIssues(data.issues);
  }, [issueSearch, issueDept, issueCat, issueSev, issueStat, country]);

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
  }, [user, issueSearch, issueDept, issueCat, issueSev, issueStat, country]);

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
      setOk("تم تسجيل القراءة");
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
    setError("");
    try {
      if (activeSop && sopView === "edit") {
        const fresh = await api<PublicSop>(`/api/sops/${activeSop.id}`, { method: "PUT", body: JSON.stringify(form) });
        setActiveSop(fresh);
        setSopView("full");
        await loadSops();
        setOk("تم حفظ SOP بنجاح");
      } else {
        await api<PublicSop>("/api/sops", { method: "POST", body: JSON.stringify(form) });
        setSopView("list");
        setActiveSop(null);
        await loadSops();
        setOk("تم إنشاء SOP بنجاح");
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
      setOk("تم حذف SOP");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function saveIssue(form: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      if (activeIssue && issueView === "edit") {
        const fresh = await api<PublicIssue>(`/api/issues/${activeIssue.id}`, { method: "PUT", body: JSON.stringify(form) });
        setActiveIssue(fresh);
        setIssueView("detail");
        await loadIssues();
        setOk("تم حفظ المشكلة");
      } else {
        await api("/api/issues", { method: "POST", body: JSON.stringify(form) });
        setIssueView("list");
        setActiveIssue(null);
        await loadIssues();
        setOk("تم تسجيل المشكلة");
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

  async function backup() {
    try {
      const data = await api<unknown>("/api/backup");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `makhzon-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setOk("تم تنزيل النسخة الاحتياطية");
    } catch (e) {
      fail(e);
    }
  }

  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "#020617", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cairo, sans-serif" }}>
        جاري التحقق من الجلسة...
      </div>
    );
  }
  if (!user) return <LoginPage onLogin={setUser} />;

  const expAlerts = sops.filter((s) => isExpiring(s.reviewDate) || isExpired(s.reviewDate));
  const openIssues = issues.filter((i) => i.status === "open").length;
  const recurIssues = issues.filter((i) => i.isRecurring).length;
  const liveSop = activeSop ? sops.find((s) => s.id === activeSop.id) || activeSop : null;
  const liveIssue = activeIssue ? issues.find((i) => i.id === activeIssue.id) || activeIssue : null;

  const SECTIONS = [
    { id: "sops" as const, label: "📋 SOPs", show: true },
    { id: "issues" as const, label: "🔥 المشاكل اليومية", show: true },
    { id: "order" as const, label: "🛒 محاكاة الطلب", show: true },
    { id: "ai" as const, label: "🤖 بحث ذكي", show: true },
    { id: "analytics" as const, label: "📊 التحليلات", show: can(user.role, "analytics.view") },
    { id: "users" as const, label: "👥 المستخدمين", show: can(user.role, "users.view") },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#020617", fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl" }}>
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderBottom: "1px solid #1e3a5f", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>
            <span style={{ color: "#f1f5f9", fontWeight: 900, fontSize: 16 }}>Makhzon</span>
            {expAlerts.length > 0 && <span style={{ background: "#1a1100", border: "1px solid #f59e0b44", color: "#fbbf24", borderRadius: 20, padding: "2px 10px", fontSize: 10 }}>⚠️{expAlerts.length}</span>}
            {openIssues > 0 && <span style={{ background: "#1a0a0a", border: "1px solid #ef444444", color: "#ef4444", borderRadius: 20, padding: "2px 10px", fontSize: 10 }}>🔴{openIssues}</span>}
            {recurIssues > 0 && <span style={{ background: "#1a0a2a", border: "1px solid #a855f744", color: "#c084fc", borderRadius: 20, padding: "2px 10px", fontSize: 10 }}>🔄{recurIssues}</span>}
          </div>
          <nav style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
            {SECTIONS.filter((s) => s.show).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSection(s.id);
                  setSopView("list");
                  setIssueView("list");
                  setActiveSop(null);
                  setActiveIssue(null);
                }}
                style={{ background: section === s.id ? "#1e3a5f" : "transparent", color: section === s.id ? "#93c5fd" : "#64748b", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: section === s.id ? 700 : 500, fontSize: 12, fontFamily: "inherit" }}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {can(user.role, "backup.manage") && (
              <button onClick={backup} style={{ ...T.ghost, padding: "5px 10px", fontSize: 11 }}>Backup</button>
            )}
            <Av initials={user.avatar || user.name.slice(0, 2)} color={getRole(user.role).color} size={28} />
            <RoleBadge role={user.role} />
            <button
              onClick={async () => {
                await api("/api/auth/logout", { method: "POST" });
                setUser(null);
              }}
              style={{ background: "#1a0a0a", color: "#ef4444", border: "1px solid #ef444433", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}
            >
              خروج
            </button>
          </div>
        </div>
      </div>

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

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px" }}>
        {error && <Banner type="error" text={error} onClose={() => setError("")} />}
        {ok && <Banner type="ok" text={ok} onClose={() => setOk("")} />}

        {section === "sops" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                {sopView === "list" && (
                  <h1 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 900, margin: 0 }}>
                    مكتبة الإجراءات (SOPs){" "}
                    <span style={{ color: "#475569", fontSize: 14, fontWeight: 400 }}>
                      — {sops.length} إجراء
                      {country !== "all" ? ` · ${getCountry(country)?.flag} ${getCountry(country)?.name}` : ""}
                    </span>
                  </h1>
                )}
              </div>
              {sopView === "list" && can(user.role, "sop.create") && (
                <button onClick={() => { setActiveSop(null); setSopView("create"); }} style={{ ...T.btn(), background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>+ إنشاء SOP</button>
              )}
            </div>
            {sopView === "list" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                  <input value={sopSearch} onChange={(e) => setSopSearch(e.target.value)} placeholder="ابحث بالعنوان أو الكلمة المفتاحية..." style={{ ...T.input, flex: "1 1 240px" }} />
                  <select value={sopStatus} onChange={(e) => setSopStatus(e.target.value)} style={{ ...T.input, width: "auto", cursor: "pointer" }}>
                    <option value="all">كل الحالات</option>
                    {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select value={sopAction} onChange={(e) => setSopAction(e.target.value)} style={{ ...T.input, width: "auto", cursor: "pointer" }}>
                    <option value="all">كل الإجراءات</option>
                    {RELATED_ACTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setSopDept("all")} style={{ background: sopDept === "all" ? "#3b82f6" : "#1e293b", color: sopDept === "all" ? "#fff" : "#64748b", border: "1px solid #334155", borderRadius: 9, padding: "7px 12px", cursor: "pointer", fontSize: 12 }}>الكل</button>
                  {DEPARTMENTS.map((d) => (
                    <button key={d.id} onClick={() => setSopDept(d.id)} style={{ background: sopDept === d.id ? d.color + "22" : "#1e293b", color: sopDept === d.id ? d.color : "#64748b", border: `1px solid ${sopDept === d.id ? d.color + "44" : "#334155"}`, borderRadius: 9, padding: "7px 10px", cursor: "pointer", fontSize: 11 }}>{d.icon} {d.label}</button>
                  ))}
                </div>
                {sops.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>لا توجد نتائج</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 }}>
                    {sops.map((s) => <SopCard key={s.id} sop={s} onOpen={openSop} onQuick={setQuickSop} currentUser={user} />)}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h1 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 900, margin: 0 }}>
                {issueView === "list" ? `المشاكل اليومية — ${issues.length}` : issueView === "dashboard" ? "تحليلات المشاكل" : "المشكلة"}
              </h1>
              <div style={{ display: "flex", gap: 8 }}>
                {issueView === "list" && can(user.role, "analytics.view") && <button onClick={() => setIssueView("dashboard")} style={T.ghost}>📊 التحليلات</button>}
                {issueView === "dashboard" && <button onClick={() => setIssueView("list")} style={T.ghost}>📋 القائمة</button>}
                {issueView === "list" && can(user.role, "issues.create") && (
                  <button onClick={() => { setActiveIssue(null); setIssueView("create"); }} style={T.btn("#ef4444")}>+ تسجيل مشكلة</button>
                )}
              </div>
            </div>
            {issueView === "list" && (
              <div>
                <div style={{ ...T.card, marginBottom: 16, padding: 14 }}>
                  <div className="makhzon-filters">
                    <input value={issueSearch} onChange={(e) => setIssueSearch(e.target.value)} placeholder="ابحث في المشاكل..." style={T.input} />
                    <select value={issueDept} onChange={(e) => setIssueDept(e.target.value)} style={{ ...T.input, cursor: "pointer" }}><option value="all">كل الأقسام</option>{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}</select>
                    <select value={issueCat} onChange={(e) => setIssueCat(e.target.value)} style={{ ...T.input, cursor: "pointer" }}><option value="all">كل الفئات</option>{ISSUE_CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
                    <select value={issueSev} onChange={(e) => setIssueSev(e.target.value)} style={{ ...T.input, cursor: "pointer" }}><option value="all">كل الخطورة</option><option value="low">منخفضة</option><option value="medium">متوسطة</option><option value="high">عالية</option><option value="critical">حرجة</option></select>
                    <select value={issueStat} onChange={(e) => setIssueStat(e.target.value)} style={{ ...T.input, cursor: "pointer" }}><option value="all">كل الحالات</option>{ISSUE_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {issues.map((iss) => (
                    <IssueCard key={iss.id} issue={iss} users={users} onOpen={(i) => { setActiveIssue(i); setIssueView("detail"); }} />
                  ))}
                  {issues.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>لا توجد نتائج</div>}
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
                setOk("تم إنشاء المستخدم");
              } catch (e) { fail(e); }
            }}
            onUpdate={async (id, form) => {
              try {
                await api(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(form) });
                await loadUsers();
                setOk("تم تحديث المستخدم");
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
      </div>

      <QuickModal sop={quickSop} onClose={() => setQuickSop(null)} onFull={() => { if (quickSop) { openSop(quickSop); setQuickSop(null); setSection("sops"); } }} onVote={vote} onAck={ack} currentUser={user} busy={busy} />
      {checkSop && <ChecklistModal sop={checkSop} onClose={() => setCheckSop(null)} />}
    </div>
  );
}
