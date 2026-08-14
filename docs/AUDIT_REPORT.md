# Makhzon — Audit Report

**Date:** 2026-08-14  
**Sources inspected:**
- `E:\.env\M5zoon\files\makhzon-full.jsx` (primary UI + business logic, 1242 lines, single React component)
- `E:\.env\M5zoon\files\makhzon-project\makhzon` (Express + Vite + PostgreSQL attempt)
- User migration specification (this conversation)

**Claude public share link:** not provided (`<PASTE_CLAUDE_PUBLIC_SHARE_LINK_HERE>`). Requirements below are taken from the source code, the previous Express schema, and the written specification. Any requirement that existed only in the missing Claude thread could not be verified independently.

---

## A. Existing Features

Found in `makhzon-full.jsx` (client-only, in-memory):

1. Login / logout with seeded demo accounts
2. Role badges: Super Admin, Admin, Team Leader, Employee
3. Client-side permission map (`PERMS` / `can`)
4. Country bar (All / AE / SA / JO / OM) affecting SOP + Issues lists
5. SOP library: list, search, department filter
6. SOP card: department, countries, version, keywords, views, steps count, comments, helpful, attachments, acknowledgment/review badges
7. Quick SOP modal (first 5 steps + escalation by problem type + vote + ack)
8. Full SOP view: steps, decision rules, escalation finder/cards, common mistakes, video, attachments, related statuses, vote, mind map, history, comments, acknowledgment roster
9. SOP checklist modal (local checkboxes only)
10. SOP create/edit form: basic info, steps, decision rules, escalation contacts, attachments, mistakes, video, keywords, related statuses/actions, countries, review date
11. SOP version bump on edit + history note "تحديث"
12. SOP acknowledgment ("قرأته")
13. SOP comments
14. Helpful / Not helpful counters
15. View counter on open
16. SVG Mind Map of execution steps
17. Daily Issues: list, search, department/category/severity/status filters, country filter
18. Issue create/edit, detail, comments, status change, delete
19. Recurring issues + recurrence count
20. Issues mini-dashboard (totals, by category, by department, top recurring)
21. Combined Analytics page (SOP analytics + issues dashboard)
22. Users CRUD (super_admin only in UI)
23. Order simulation + Smart Suggestions by related status
24. "AI Search" UI (calls Anthropic from the browser; falls back to local filter)
25. Header alerts: review-needed SOPs, open issues, recurring issues
26. RTL dark UI (Cairo, inline styles)

Found in `makhzon-project` but incomplete / not wired to the full UI:

- Express API: auth (JWT + bcrypt), users, sops, issues
- PostgreSQL tables via raw SQL
- Deployment docs (Nginx/PM2) — **out of scope**
- Training paths table (`paths`) with no product UI in `makhzon-full.jsx`

---

## B. Required Features

From the written specification + implemented product intent:

| Area | Requirement |
| --- | --- |
| Persistence | PostgreSQL is the source of truth |
| Auth | Login, logout, hashed passwords, session, protected routes/APIs |
| Roles | Super Admin, Admin, Team Leader, Employee — server-side enforcement |
| SOP | Structured KB: basic info, steps, decision rules, escalation + contacts, mistakes, media, attachments, keywords, statuses, actions, countries, review date, version |
| Quick + Full SOP | Both views required |
| Search | Keyword, title, department, country, status, action — database queries |
| Operational use | Help / Quick SOP when a status/action has a related SOP (Order Sim / suggestions) |
| Mind Map | Real SOP steps, must not be blank |
| Versioning | Who, when, reason, previous + current content |
| Acknowledgment | User + SOP + version + timestamp |
| Feedback | Helpful / Not helpful, per user |
| Review | Review date, upcoming, expired |
| Daily Issues | Separate module with full workflow |
| Countries | Many-to-many; filter SOPs, issues, analytics |
| Analytics | From PostgreSQL (SOP + issues) |
| Comments | SOP and Issue |
| API | Next.js Route Handlers, authz, validation, errors |
| Errors | Failed DB writes must not show success |
| Backup | Application-side export if required |
| Multi-user | Shared data survives refresh / logout / other users |
| Navigation | SOP, Daily Issues, Users, Analytics (same login) |

---

## C. Bugs / Incorrect Logic

| ID | Problem | Why it is wrong | Expected | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| B01 | All data lives in React `useState` | Refresh/logout wipes SOPs, issues, users, votes, comments | PostgreSQL persistence | Prisma + APIs | Fixed in new-version |
| B02 | Login uses `SEED_USERS`, not live `users` state | Newly created users cannot log in | Authenticate against the user store | DB login | Fixed |
| B03 | Passwords stored in plaintext | Insecure | bcrypt hashes, never returned to client | Hashing | Fixed |
| B04 | Permissions only hide buttons | APIs/state can be abused | Server-side `can()` | API guards | Fixed |
| B05 | After SOP edit, `setActiveSop(null)` then `setSopView("full")` | Full view opens with no SOP | Stay on the edited SOP | Keep id, refetch | Fixed |
| B06 | Votes increment infinitely | No per-user feedback record | One vote per user; changeable | `SopFeedback` unique | Fixed |
| B07 | Acknowledgments are a JSON id list without version/time | Cannot prove who read which version | User+SOP+version+timestamp | `SopAcknowledgment` | Fixed |
| B08 | History does not store previous/current content | Audit trail is a one-line note | Snapshot both states + reason | `SopHistory` JSON | Fixed |
| B09 | SOP search ignores related status/action | Spec requires those filters | DB filters | Query params | Fixed |
| B10 | Country stored as JSON array, not a relation | Hard to query/extend | `SopCountry` / `IssueCountry` | M2M tables | Fixed |
| B11 | Analytics ignore the country bar | Spec: country affects analytics | Server analytics `?country=` | API | Fixed |
| B12 | Issues dashboard uses unfiltered `issues` | Country/list filters ignored | Use same filtered set / API | API + country | Fixed |
| B13 | WhatsApp hardcodes `966` | Wrong for AE/JO/OM | Digit-normalize; optional country prefix | Helper | Fixed |
| B14 | AI Search calls Anthropic from the browser with no key | Broken, leaks model traffic, not a real integration | DB/smart keyword search; AI is future | Smart search | Fixed (local/DB) |
| B15 | Session not persisted | Login lost on refresh | httpOnly JWT cookie | Auth cookie | Fixed |
| B16 | Full SOP omits related actions and countries | Data exists on the card/form but not the full view | Show them | UI | Fixed |
| B17 | Team Leader cannot edit SOP | Spec: limited editing | Edit SOPs in own department; no delete/create | Permissions | Fixed |
| B18 | Issue status change has no role check | Employees can change any status in UI | `issues.edit` on server | API | Fixed |
| B19 | Express users PUT has broken parameter indexing without password | Would corrupt/fail updates | Correct parameterized update | Not reused; new API | Fixed |
| B20 | SOP open increments views but `activeSop` stays stale | UI shows old view count | Return updated SOP from API | GET by id | Fixed |
| B21 | Empty country = all countries is only a frontend convention | Must be a documented DB rule | No M2M rows = all countries | Schema + queries | Fixed |
| B22 | Backup button does not exist despite being discussed | Fake/missing product feature | Super Admin JSON export | `/api/backup` | Fixed |
| B23 | Training `paths` seeded but no UI | Dead feature | Document as future; do not fake | Future docs | Documented |
| B24 | Client-only filters will not scale | Spec forbids pretending frontend filter is DB | Prisma `where` | API | Fixed |
| B25 | No error UI for failed saves | `alert` / silent state updates | API error + banner + retry | Error banner | Fixed |
| B26 | Admin in Express could manage users; UI only allowed super_admin | Inconsistent | Super Admin only for users/backup | Permissions | Fixed |
| B27 | Checklist progress is not persisted | OK as UI-only operational aid | Keep as session UI state | Intentional | Kept (UI state) |

---

## D. Missing Features

Relative to the specification (not present or not real in the old app):

- PostgreSQL persistence
- Secure sessions / hashed passwords
- Server-side authorization
- Normalized countries, history snapshots, per-user feedback, versioned acknowledgments
- SOP search by status + action on the server
- Analytics by user / department / country from real events
- Application backup export
- `updatedBy` on SOP and Issue
- Change reason on SOP edit
- Optional WhatsApp field / step image URL
- Usage logs (`SopView`)
- Consistent error handling

---

## E. Future / Planned Features

See `docs/FUTURE_REQUIREMENTS.md`.

Highlights: Claude/AI search, order-system integration, training paths, file upload (not just URLs), restore-from-backup, more countries/departments without code changes (architecture already extensible).

---

## F. Database Problems (old system)

- No production database in `makhzon-full.jsx`
- Express schema stored countries, history, acknowledgments, affected users as JSON blobs
- No SOP feedback table (counters only)
- No SOP view log (integer counter only)
- No `updated_by` / `updated_at` consistency on all writes
- No uniqueness for votes or acknowledgments
- Comments were a separate table (good) but SOP list loaded everything with `json_agg` (acceptable for small data, needs pagination later)
- Seed/demo data mixed with runtime state

---

## G. Permission Problems (old system)

- UI-only checks
- JWT in Express had no per-route permission matrix beyond a few role arrays
- Issue create/update/status had almost no authorization
- Anyone authenticated could vote/ack/comment
- Admin vs Super Admin mismatch between UI and Express
- Inactive users: login blocked, but existing JWT would still work
- Passwords sent back into the user edit form
