# Makhzon — Future Requirements

Claude share link was not provided. This list is inferred from the written specification, unused seed data, and incomplete UI in the old project.

---

## Current Product Requirements

These MUST work now (implemented in `new-version`):

- Shared login across SOP, Daily Issues, Users, Analytics
- PostgreSQL persistence
- Roles + server-side permissions
- Full SOP knowledge base (quick + full)
- Search/filter including country/status/action
- Mind map of execution steps
- Version history with snapshots
- Acknowledgment per version
- Helpful / not helpful per user
- Review dates
- Daily Issues as a separate module
- Countries as real relations + global filter
- Analytics from the database
- Comments
- Application JSON backup export
- Order-status smart suggestions (simulation only)

---

## Future Requirements

Mentioned as planned / later / not implemented in the old UI:

1. **Real AI search (Claude/Anthropic)**  
   Old UI called Anthropic from the browser. That must not return. A future server-side assistant can rank SOPs from a query in dialect Arabic.

2. **Training / onboarding paths** ✅ Implemented  
   Module `مسار التدريب`: ordered steps (`read_sop` / `watch_video` / `read_content` / `task`), enrollment, gated progress, admin create/delete. See `/api/training` and `TrainingPage`.

3. **External order-system integration**  
   Confirm → Get → Process → Call Customer is business context, not an existing API. Do not invent a connector until a real order system exists.

4. **Backup restore**  
   Export exists. Import/restore is dangerous in production and is deferred (operator-controlled).

5. **File upload storage**  
   Attachments are URLs (Google Docs / Word links) as in the original. Binary upload (S3/local disk) is future.

6. **Pagination**  
   Current lists are fine for operational KB size. Add cursor pagination when SOP/issue volume grows.

7. **Per-step media library**  
   Step `imageUrl` is supported as a URL. A media manager is future.

---

## Possible Enhancements

Discussed conceptually, not clearly required:

- More countries/departments/statuses/actions without code changes (constants are already data, not architecture)
- Recurring-issue automatic detection from similar titles
- SOP usage heatmaps
- WhatsApp deep links per country phone plan
- Employee self-service password change UI (API pattern exists in old Express; not a current nav item)
- Checklist persistence / audit of completed steps
- Notifications when a SOP is updated after acknowledgment
- i18n (UI is Arabic-first; code is English)

---

## Architecture notes so future work stays cheap

- Countries, departments, statuses, and actions are lookup data / constants, not hardcoded schema columns beyond string ids
- SOP nested content (steps, rules, contacts) is JSON on the SOP row for document-oriented editing, while cross-cutting concerns (countries, comments, ack, feedback, views, history) are tables
- Permissions live in one server module (`src/lib/permissions.ts`)
- Analytics read from event tables (`SopView`, `SopFeedback`, `SopAcknowledgment`) rather than only denormalized counters
