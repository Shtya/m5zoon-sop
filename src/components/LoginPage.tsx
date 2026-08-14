"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";
import { CircleAlert } from "lucide-react";
import { RoleBadge } from "@/components/ui";

const DEMO = [
  { email: "omar@makhzon.com", password: "admin123", role: "super_admin" },
  { email: "sara@makhzon.com", password: "sara123", role: "admin" },
  { email: "khaled@makhzon.com", password: "khaled123", role: "team_leader" },
  { email: "nada@makhzon.com", password: "nada123", role: "employee" },
];

const FEATURES = [
  { value: "SOP", label: "مكتبة إجراءات" },
  { value: "ISSUE", label: "مشاكل يومية" },
  { value: "ESC", label: "تصعيد ذكي" },
];

export function LoginPage({ onLogin }: { onLogin: (user: SessionUser) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    setErr("");
    try {
      const data = await api<{ user: SessionUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: pass }),
      });
      onLogin(data.user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-ink-900 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(120,150,165,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(120,150,165,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="pointer-events-none absolute -start-24 top-1/4 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #0E8F6E 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -end-16 bottom-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #2C6FB0 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-primary text-lg font-bold text-white">
            م
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">Makhzon</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">Knowledge ops</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">من السؤال إلى الإجراء</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.15] tracking-[-0.03em] text-white xl:text-5xl">
            نظام واحد لإجراءات التشغيل والمشاكل اليومية.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-sidebar-muted">
            مكتبة SOP، توثيق المشاكل، تصعيد حسب النوع، وفلترة حسب الدولة — كل ذلك داخل مساحة عمل واحدة.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {FEATURES.map((item) => (
              <div key={item.label}>
                <p className="text-xl font-semibold text-white">{item.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-sidebar-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 font-mono text-[10px] uppercase tracking-[0.12em] text-sidebar-muted">
          Built for operations teams
        </p>
      </aside>

      <div className="relative flex flex-col bg-paper">
        <div className="flex items-center gap-2 px-6 py-5 lg:invisible sm:px-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary text-sm font-bold text-white">
            م
          </div>
          <span className="text-sm font-semibold">Makhzon</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-[400px]">
            <div className="mb-8">
              <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground">تسجيل الدخول</h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">ادخل إلى مساحة عمل المخزون والإجراءات.</p>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-sm sm:p-7">
              <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">البريد الإلكتروني</label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && go()}
                type="email"
                placeholder="example@makhzon.com"
                className="field-input mb-4"
              />
              <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">كلمة المرور</label>
              <input
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  setErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && go()}
                type="password"
                placeholder="••••••••"
                className="field-input mb-3"
              />
              {err && (
                <div className="mb-3 rounded-[var(--radius-md)] border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-[13px] text-danger">
                  <span className="inline-flex items-center gap-1.5">
                    <CircleAlert className="h-3.5 w-3.5" /> {err}
                  </span>
                </div>
              )}
              <button type="button" onClick={go} disabled={loading} className="btn-primary mt-1 h-11 w-full text-[15px]">
                {loading ? "جاري..." : "دخول"}
              </button>
            </div>

            <div className="mt-5 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
              <div className="mb-2 text-[11px] font-semibold text-muted-foreground">حسابات تجريبية:</div>
              {DEMO.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    setPass(u.password);
                  }}
                  className="mb-1.5 flex w-full items-center justify-between rounded-md border border-border bg-surface-sunken px-3 py-1.5 last:mb-0 hover:bg-surface-hover"
                >
                  <span className="text-[11px] text-muted-foreground">{u.email}</span>
                  <RoleBadge role={u.role} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="px-6 pb-6 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted sm:px-10">
          Secure workspace · Makhzon
        </p>
      </div>
    </div>
  );
}
