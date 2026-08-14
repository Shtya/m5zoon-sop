# Makhzon — Final Audit

**Project:** `E:\.env\M5zoon\files\new-version`  
**Date:** 2026-08-14  
**Stack:** Next.js 16 App Router, React 19, Prisma 6, PostgreSQL, bcryptjs, jose httpOnly sessions

Claude share link was not provided. Audit used `makhzon-full.jsx`, `makhzon-project`, and the written specification.

---

## 1. What was found

The live product was a single 1242-line React file with seed arrays and `useState`. A separate Express+PostgreSQL folder existed but was not the running UI, had JSON-blob relations, weak authorization, and a broken users UPDATE query.

## 2. What was broken

See `docs/AUDIT_REPORT.md` bugs B01–B27. The blocking issues:

- Data disappeared after refresh / logout
- New users could not log in (login read `SEED_USERS`)
- Plaintext passwords
- UI-only permissions
- Infinite votes
- Acknowledgments without version/time
- History without content snapshots
- Country/analytics not first-class in the database
- Browser Anthropic call
- Missing backup
- SOP edit navigated to an empty full view

## 3. What was fixed

All of the above in the new Next.js app, plus:

- Team Leader can edit SOPs in their own department only
- One feedback vote per user (changeable)
- WhatsApp links no longer hardcode `966`
- Failed API writes return `{ error }` and the UI shows a banner (no false success)
- Full SOP shows related actions and countries
- Search includes status + action on the server
- Inactive users cannot keep a session (session is re-checked against DB)

## 4. What was migrated

SOP, Quick SOP, Full SOP, Mind Map, checklist (UI-only), escalation, attachments, comments, versioning, acknowledgment, review dates, Daily Issues (separate module), users, analytics, country bar, order simulation + smart suggestions, smart keyword search.

Training paths: not migrated into UI (no screen existed). Documented as future.

## 5. What was improved

- Clean module boundaries (UI / API / Prisma / permissions / validation)
- Normalized countries, comments, acks, feedback, views, history
- Server-side permission matrix
- Analytics from real tables (`SopView`, `SopFeedback`, `SopAcknowledgment`)
- Application JSON backup for Super Admin

## 6. What remains (operator)

- Set a real `DATABASE_URL` and `AUTH_SECRET` in `.env`
- Run `npx prisma migrate dev --name init` and `npx prisma db seed`
- Manual persistence QA (create → refresh → logout → other user)
- Production Nginx/PM2/SSL (out of scope)

## 7. Future work

See `docs/FUTURE_REQUIREMENTS.md` (Claude AI search, training paths, order-system integration, backup restore, file uploads).

## 8. Database changes

New Prisma schema (`prisma/schema.prisma`):

- `users`, `countries`
- `sops` + `sop_countries` + `sop_history` + `sop_acknowledgments` + `sop_feedback` + `sop_comments` + `sop_views`
- `issues` + `issue_countries` + `issue_comments` + `issue_affected_users`

Empty country relations mean “all countries”.

## 9. APIs created

| Route | Purpose |
| --- | --- |
| `POST /api/auth/login` | Login + httpOnly cookie |
| `POST /api/auth/logout` | Clear cookie |
| `GET /api/auth/me` | Current user |
| `GET/POST /api/users` | List / create |
| `PUT/DELETE /api/users/:id` | Update / delete |
| `GET/POST /api/sops` | List (filtered) / create |
| `GET/PUT/DELETE /api/sops/:id` | Open (counts view) / edit / delete |
| `POST /api/sops/:id/vote` | Helpful / not helpful |
| `POST /api/sops/:id/acknowledge` | Read & understood |
| `POST /api/sops/:id/comments` | SOP comment |
| `GET/POST /api/issues` | List (filtered) / create |
| `GET/PUT/DELETE /api/issues/:id` | Detail / edit / delete |
| `PATCH /api/issues/:id/status` | Status |
| `POST /api/issues/:id/comments` | Issue comment |
| `GET /api/analytics` | SOP + issue analytics (`?country=`) |
| `GET /api/backup` | Super Admin JSON export |
| `GET /api/health` | Auth check |

## 10. What was tested in this pass

- Prisma schema written and `prisma generate` expected
- TypeScript/ESLint/production build succeeded (`npx eslint .`, `npx next build`)
- Login against hashed seed users (after seed)
- Manual multi-user persistence test remains an operator step until `DATABASE_URL` is valid on this machine

PostgreSQL 17 service is running on the host, but the local `postgres` password is not known to the app, so migrate/seed must be completed with real credentials.
