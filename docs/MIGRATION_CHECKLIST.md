# Makhzon — Migration Checklist

Legend: `[ ]` not started · `[~]` in progress · `[x]` completed

## Wave 1 — Organize existing code

- [x] Create Next.js app at `new-version`
- [x] Split UI / components / business logic / database / API / auth / validation
- [x] Preserve intended business logic (not bugs)

## Wave 2 — PostgreSQL

- [x] Prisma + PostgreSQL as source of truth
- [x] Remove production localStorage / in-memory records
- [x] React state used only for UI

## Wave 3 — Database model

- [x] Users
- [x] Countries
- [x] SOP + M2M countries
- [x] SOP history (version, user, date, reason, previous/current)
- [x] SOP acknowledgment (user, SOP, version, timestamp)
- [x] SOP feedback (helpful / not helpful, unique per user)
- [x] SOP comments
- [x] SOP view log
- [x] Daily Issues + M2M countries
- [x] Issue comments
- [x] Issue affected users
- [x] Seed demo data

## Wave 4 — Authentication

- [x] Login
- [x] Logout
- [x] bcrypt password hashing
- [x] httpOnly session cookie
- [x] Protected API routes
- [x] Session restore on refresh
- [x] Inactive accounts blocked

## Wave 5 — Roles & permissions

- [x] Super Admin / Admin / Team Leader / Employee
- [x] Server-side permission checks
- [x] users.* super_admin only
- [x] sop.create/delete admin+
- [x] sop.edit team_leader (own department) + admin+
- [x] issues.create all authenticated
- [x] issues.edit team_leader+
- [x] issues.delete admin+
- [x] analytics.view team_leader+
- [x] backup.manage super_admin

## Wave 6 — SOP module

- [x] Departments
- [x] Basic information
- [x] Ordered steps (optional step image URL)
- [x] Decision rules
- [x] Escalation contacts (name, position, phone, WhatsApp)
- [x] Common mistakes
- [x] Video link
- [x] Attachments (Google Doc / Word / other URLs)
- [x] Keywords, statuses, actions, countries, review date

## Wave 7 — Quick + Full view

- [x] Quick SOP (3–5 steps + escalate + vote + ack)
- [x] Full SOP (all sections + history + comments + feedback + ack)

## Wave 8 — SOP search

- [x] Keyword / title
- [x] Department
- [x] Country
- [x] Related status
- [x] Related action
- [x] Database queries

## Wave 9 — Operational usage

- [x] Order simulation
- [x] Smart suggestions by related status
- [x] Help / Quick SOP action
- [x] No fake external order-system integration

## Wave 10 — Mind Map

- [x] SVG mind map from real SOP steps
- [x] Empty SOP steps show an explicit empty state

## Wave 11 — SOP versioning

- [x] Version bump on edit
- [x] Who / when / reason
- [x] Previous + current snapshots

## Wave 12 — SOP acknowledgment

- [x] Read & understood
- [x] User + SOP + version + timestamp

## Wave 13 — SOP review

- [x] Review date on form
- [x] Expired / upcoming badges
- [x] Analytics review list

## Wave 14–15 — Daily Issues

- [x] Separate module (not inside SOP card)
- [x] List / search / filters including recurring
- [x] Create / details / comments / severity / status
- [x] Statuses: Open, In Progress, Resolved, Recurring

## Wave 16 — Countries

- [x] M2M relations
- [x] Empty selection = all countries
- [x] Country filter on SOP, Issues, Analytics

## Wave 17 — Analytics

- [x] Calculated from PostgreSQL
- [x] SOP views, most viewed, helpful, not helpful
- [x] Usage by user / department / country
- [x] Acknowledgment + review status
- [x] Issues totals by country/dept/category/severity/open vs resolved/recurring/recent

## Wave 18 — Comments

- [x] SOP comments
- [x] Issue comments

## Wave 19 — API

- [x] `/api/auth/*`
- [x] `/api/users/*`
- [x] `/api/sops/*`
- [x] `/api/issues/*`
- [x] `/api/analytics`
- [x] `/api/backup`

## Wave 20 — Error handling

- [x] API returns `{ error }`
- [x] UI banner, no false success
- [x] Retry by resubmitting the form

## Wave 21 — Backup

- [x] Super Admin JSON export of application data
- [x] Documented (no server-level backup)

## Wave 22–23 — Persistence / multi-user

- [x] CRUD via PostgreSQL
- [x] Data shared across users
- [ ] Manual QA: create → refresh → logout → login → other user (operator)

## Wave 24 — Security

- [x] Password hashing
- [x] API authorization
- [x] Zod validation
- [x] Prisma parameterized queries
- [x] Secrets via env
- [x] Passwords never sent to the browser

## Wave 25 — Final bug hunt

- [x] Independent pass against old bugs B01–B27
- [x] Operator run of lint/build after DATABASE_URL is set

Note: `npx eslint .` and `npx next build` succeeded on 2026-08-14. `prisma db push` still needs a valid `DATABASE_URL` (local postgres password is not in this repo).

## Wave 26 — Future audit

- [x] `docs/FUTURE_REQUIREMENTS.md`

## Final documentation

- [x] `docs/AUDIT_REPORT.md`
- [x] `docs/MIGRATION_CHECKLIST.md`
- [x] `docs/FUTURE_REQUIREMENTS.md`
- [x] `docs/FINAL_AUDIT.md`
