"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckSquare,
  CircleAlert,
  Clock,
  Eye,
  FileText,
  GitBranch,
  History,
  ListChecks,
  MessageSquare,
  Paperclip,
  Pencil,
  Phone,
  Play,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TriangleAlert,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { getDept, getRole, isExpired, isExpiring } from "@/lib/constants";
import { can, canEditSop } from "@/lib/permissions";
import type { PublicSop } from "@/lib/types";
import type { SessionUser } from "@/lib/auth";
import { Av, Badge, CountryPills, DeptBadge, Sec, T, Tabs } from "@/components/ui";
import { IconText } from "@/components/icons";
import { MindMap } from "@/components/MindMap";
import { AttCard, EscCard, EscFinder } from "@/components/sop/Escalation";

export function FullSopView({
  sop,
  onBack,
  onVote,
  onAck,
  onComment,
  onEdit,
  onDelete,
  currentUser,
  users,
  onChecklist,
  busy,
}: {
  sop: PublicSop;
  onBack: () => void;
  onVote: (id: string, type: "helpful" | "notHelpful") => void;
  onAck: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onEdit: (sop: PublicSop) => void;
  onDelete: (id: string) => void;
  currentUser: SessionUser;
  users: SessionUser[];
  onChecklist: () => void;
  busy?: boolean;
}) {
  const dept = getDept(sop.department);
  const ackd = sop.acknowledgments.includes(currentUser.id);
  const [tab, setTab] = useState("content");
  const [cmnt, setCmnt] = useState("");
  const creator = users.find((u) => u.id === sop.createdBy);
  const countryId = sop.countries[0];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <button onClick={onBack} style={T.ghost}>
          <IconText icon={ArrowLeft}>رجوع</IconText>
        </button>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!ackd && (
            <button disabled={busy} onClick={() => onAck(sop.id)} style={T.btn("#22c55e")}>
              <IconText icon={Check}>قرأته</IconText>
            </button>
          )}
          <button onClick={onChecklist} style={T.btn("#6366f1")}>
            <IconText icon={CheckSquare}>Checklist</IconText>
          </button>
          {canEditSop(currentUser.role, currentUser.department, sop.department) && (
            <button onClick={() => onEdit(sop)} style={T.btn("#8b5cf6")}>
              <IconText icon={Pencil}>تعديل</IconText>
            </button>
          )}
          {can(currentUser.role, "sop.delete") && (
            <button onClick={() => onDelete(sop.id)} style={T.btn("#ef4444")}>
              <IconText icon={Trash2}>حذف</IconText>
            </button>
          )}
        </div>
      </div>
      <div style={{ ...T.card, borderTop: `4px solid ${dept.color}`, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <DeptBadge deptId={sop.department} />
              {ackd && (
                <Badge color="#22c55e">
                  <IconText icon={Check}>قرأته</IconText>
                </Badge>
              )}
              {isExpired(sop.reviewDate) && (
                <Badge color="#ef4444">
                  <IconText icon={TriangleAlert}>انتهت المراجعة</IconText>
                </Badge>
              )}
              {isExpiring(sop.reviewDate) && !isExpired(sop.reviewDate) && (
                <Badge color="#f59e0b">
                  <IconText icon={Clock}>مراجعة قريبة</IconText>
                </Badge>
              )}
              <CountryPills countries={sop.countries} />
            </div>
            <h1 style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 900, margin: "0 0 6px" }}>{sop.title}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{sop.objective}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <Badge color="var(--text-muted)">v{sop.version}</Badge>
            {creator && <span style={{ color: "var(--text-muted)", fontSize: 11 }}>أنشأه: {creator.name}</span>}
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <Eye className="h-3.5 w-3.5" />
              {sop.views}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sop.keywords.map((k) => (
            <span key={k} className="rounded-md bg-primary-soft px-3 py-0.5 text-xs text-primary">
              {k}
            </span>
          ))}
        </div>
      </div>
      <Tabs
        tabs={[
          { id: "content", label: "المحتوى", icon: FileText },
          { id: "mindmap", label: "الخريطة", icon: GitBranch },
          { id: "history", label: "السجل", icon: History },
          { id: "comments", label: String(sop.comments.length), icon: MessageSquare },
          { id: "ack", label: String(sop.acknowledgments.length), icon: Users },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div style={{ marginTop: 24 }}>
        {tab === "content" && (
          <div className="makhzon-split">
            <div>
              <Sec title="خطوات التنفيذ" color={dept.color} icon={ListChecks}>
                {sop.steps.map((st, i) => (
                  <div key={st.id} style={{ ...T.card, borderLeft: `3px solid ${dept.color}`, borderRadius: 12, padding: "14px 20px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${dept.color},${dept.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ color: "var(--text-primary)", fontSize: 14, lineHeight: 1.7, paddingTop: 3 }}>{st.text}</div>
                      {st.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={st.imageUrl} alt="" style={{ marginTop: 8, maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border)" }} />
                      )}
                    </div>
                  </div>
                ))}
              </Sec>
              {sop.decisionRules.length > 0 && (
                <Sec title="قواعد القرار" color="#a78bfa" icon={GitBranch}>
                  {sop.decisionRules.map((r, i) => (
                    <div key={i} className="makhzon-rule">
                      <div style={{ background: "#f6f1fb", border: "1px solid #7c3aed44", borderRadius: 8, padding: "8px 12px", color: "#7c3aed", fontSize: 13 }}>لو: {r.condition}</div>
                      <div style={{ color: "#7c3aed", fontSize: 18 }}>→</div>
                      <div style={{ background: "var(--success-soft)", border: "1px solid #16a34a44", borderRadius: 8, padding: "8px 12px", color: "var(--success)", fontSize: 13 }}>{r.action}</div>
                    </div>
                  ))}
                </Sec>
              )}
              {sop.escalationContacts?.length > 0 && (
                <Sec title="جهات التصعيد — حسب نوع المشكلة" color="#f59e0b" icon={Phone}>
                  <EscFinder contacts={sop.escalationContacts} countryId={countryId} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sop.escalationContacts.map((c, i) => (
                      <EscCard key={i} contact={c} countryId={countryId} />
                    ))}
                  </div>
                </Sec>
              )}
              {sop.commonMistakes.length > 0 && (
                <Sec title="الأخطاء الشائعة" color="#ef4444" icon={CircleAlert}>
                  {sop.commonMistakes.map((m, i) => (
                    <div key={i} style={{ background: "var(--danger-soft)", border: "1px solid #ef444433", borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", gap: 10 }}>
                      <TriangleAlert className="h-4 w-4 shrink-0 text-danger" />
                      <span style={{ color: "var(--danger)", fontSize: 14 }}>{m}</span>
                    </div>
                  ))}
                </Sec>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sop.videoLink && (
                <div style={T.card}>
                  <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <Video className="h-3.5 w-3.5" /> فيديو
                  </div>
                  <a href={sop.videoLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-info/20 bg-surface-sunken px-3.5 py-2.5 text-[13px] text-info no-underline">
                    <Play className="h-3.5 w-3.5" /> مشاهدة
                  </a>
                </div>
              )}
              {sop.attachments?.length > 0 && (
                <div style={T.card}>
                  <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <Paperclip className="h-3.5 w-3.5" /> الملفات
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sop.attachments.map((a, i) => (
                      <AttCard key={i} att={a} />
                    ))}
                  </div>
                </div>
              )}
              <div style={T.card}>
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Target className="h-3.5 w-3.5" /> الحالات
                </div>
                {sop.relatedStatuses.map((s) => (
                  <div key={s} style={{ background: "var(--surface-sunken)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", color: "var(--primary)", fontSize: 12, marginBottom: 6 }}>
                    {s}
                  </div>
                ))}
              </div>
              <div style={T.card}>
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" /> الإجراءات
                </div>
                {sop.relatedActions.map((s) => (
                  <div key={s} style={{ background: "var(--surface-sunken)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", color: "var(--primary)", fontSize: 12, marginBottom: 6 }}>
                    {s}
                  </div>
                ))}
              </div>
              <div style={T.card}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button disabled={busy} onClick={() => onVote(sop.id, "helpful")} style={{ flex: 1, background: "#16a34a18", color: "#22c55e", border: "1px solid #22c55e33", borderRadius: 8, padding: 8, cursor: "pointer", fontFamily: "inherit" }}>
                    <IconText icon={ThumbsUp}>{sop.helpfulCount}</IconText>
                  </button>
                  <button disabled={busy} onClick={() => onVote(sop.id, "notHelpful")} style={{ flex: 1, background: "#dc262618", color: "#ef4444", border: "1px solid #ef444433", borderRadius: 8, padding: 8, cursor: "pointer", fontFamily: "inherit" }}>
                    <IconText icon={ThumbsDown}>{sop.notHelpfulCount}</IconText>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === "mindmap" && <MindMap sop={sop} />}
        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...sop.history].reverse().map((h, i) => {
              const u = users.find((x) => x.id === h.by);
              return (
                <div key={i} style={{ ...T.card, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-soft text-xs font-bold text-primary">
                    v{h.version}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 14 }}>{h.note}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{h.date}</span>
                    </div>
                    {u && (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <Av initials={u.avatar || u.name.slice(0, 2)} color={getRole(u.role).color} size={22} />
                        <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{u.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab === "comments" && (
          <div>
            {can(currentUser.role, "sop.comment") && (
              <div style={{ ...T.card, marginBottom: 16 }}>
                <textarea value={cmnt} onChange={(e) => setCmnt(e.target.value)} rows={3} placeholder="ملاحظة أو سؤال..." style={{ ...T.input, resize: "vertical", marginBottom: 12 }} />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (cmnt.trim()) {
                        onComment(sop.id, cmnt);
                        setCmnt("");
                      }
                    }}
                    style={T.btn()}
                  >
                    إرسال
                  </button>
                </div>
              </div>
            )}
            {sop.comments.length === 0 ? (
              <div style={{ ...T.card, textAlign: "center", color: "var(--text-muted)", padding: 40 }}>لا توجد تعليقات</div>
            ) : (
              sop.comments.map((c) => {
                const u = users.find((x) => x.id === c.userId);
                return (
                  <div key={c.id} style={{ ...T.card, marginBottom: 12, display: "flex", gap: 12 }}>
                    {u && <Av initials={u.avatar || u.name.slice(0, 2)} color={getRole(u.role).color} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 14 }}>{u?.name}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{c.date}</span>
                      </div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{c.text}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
        {tab === "ack" && (
          <div>
            <div style={{ ...T.card, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "var(--text-primary)", fontWeight: 700 }}>نسبة القراءة (هذه النسخة)</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{sop.acknowledgments.length} قرأوه</div>
              </div>
              <div style={{ color: "#3b82f6", fontWeight: 900, fontSize: 28 }}>
                {users.filter((u) => u.active).length ? Math.round((sop.acknowledgments.length / users.filter((u) => u.active).length) * 100) : 0}%
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
              {users
                .filter((u) => u.active)
                .map((u) => {
                  const read = sop.acknowledgments.includes(u.id);
                  return (
                    <div key={u.id} style={{ ...T.card, display: "flex", gap: 10, alignItems: "center", padding: "12px 16px", borderLeft: `3px solid ${read ? "#22c55e" : "var(--border-strong)"}` }}>
                      <Av initials={u.avatar || u.name.slice(0, 2)} color={getRole(u.role).color} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
                        <div style={{ color: read ? "#22c55e" : "var(--text-secondary)", fontSize: 11 }}>{read ? "قرأه" : "لم يقرأه بعد"}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
