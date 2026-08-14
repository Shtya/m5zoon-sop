"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";
import { RoleBadge, T } from "@/components/ui";

const DEMO = [
  { email: "omar@makhzon.com", password: "admin123", role: "super_admin" },
  { email: "sara@makhzon.com", password: "sara123", role: "admin" },
  { email: "khaled@makhzon.com", password: "khaled123", role: "team_leader" },
  { email: "nada@makhzon.com", password: "nada123", role: "employee" },
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
    <div style={{ minHeight: "100vh", background: "#020617", display: "flex", fontFamily: "'Cairo','Segoe UI',sans-serif", direction: "rtl" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 48, background: "linear-gradient(135deg,#0f172a,#1e293b)" }}>
        <div style={{ width: 68, height: 68, borderRadius: 18, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 20px", boxShadow: "0 0 40px #3b82f644" }}>
          📚
        </div>
        <h1 style={{ color: "#f1f5f9", fontSize: 28, fontWeight: 900, margin: "0 0 8px", textAlign: "center" }}>Makhzon</h1>
        <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 32px", textAlign: "center" }}>نظام إدارة الإجراءات والمشاكل</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 320 }}>
          {["📋 مكتبة SOPs بخريطة ذهنية", "🔥 توثيق المشاكل اليومية", "📞 تصعيد حسب نوع المشكلة", "🌍 فلترة حسب الدولة"].map((f) => (
            <div key={f} style={{ background: "#1e293b88", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#94a3b8", fontSize: 13 }}>
              {f}
            </div>
          ))}
        </div>
      </div>
      <div style={{ width: 440, maxWidth: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 48, background: "#0f172a", borderRight: "1px solid #1e3a5f" }}>
        <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 900, margin: "0 0 24px" }}>تسجيل الدخول</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 700, marginBottom: 7 }}>البريد الإلكتروني</label>
          <input value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && go()} type="email" placeholder="example@makhzon.com" style={{ ...T.input, padding: "11px 14px" }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 700, marginBottom: 7 }}>كلمة المرور</label>
          <input value={pass} onChange={(e) => { setPass(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && go()} type="password" placeholder="••••••••" style={{ ...T.input, padding: "11px 14px" }} />
        </div>
        {err && (
          <div style={{ background: "#1a0a0a", border: "1px solid #ef444433", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13, marginBottom: 10 }}>
            ⚠️ {err}
          </div>
        )}
        <button onClick={go} disabled={loading} style={{ ...T.btn(), padding: 13, fontSize: 15, marginTop: 6, opacity: loading ? 0.6 : 1 }}>
          {loading ? "جاري..." : "دخول ←"}
        </button>
        <div style={{ marginTop: 22, background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 14 }}>
          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>حسابات تجريبية:</div>
          {DEMO.map((u) => (
            <button
              key={u.email}
              onClick={() => { setEmail(u.email); setPass(u.password); }}
              style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 8, padding: "6px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 5, fontFamily: "inherit" }}
            >
              <span style={{ color: "#94a3b8", fontSize: 11 }}>{u.email}</span>
              <RoleBadge role={u.role} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
