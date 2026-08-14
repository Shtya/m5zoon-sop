# Makhzon — new-version

Next.js 16 application for the Makhzon SOP + Daily Issues knowledge base. PostgreSQL is the source of truth.

Deployment (Nginx, PM2, SSL, domain) is out of scope.

## Setup

1. Create a PostgreSQL database (example name: `makhzon`).
2. Copy environment file:

```bash
copy .env.example .env
```

3. Set `DATABASE_URL` and a long `AUTH_SECRET` (32+ characters).
4. Apply schema and seed:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

If migrate is not interactive, `npx prisma db push` then `npx prisma db seed` also works.

5. Run:

```bash
npm run dev
```

Open http://localhost:3000

## Demo accounts

| Email | Password | Role |
| --- | --- | --- |
| omar@makhzon.com | admin123 | Super Admin |
| sara@makhzon.com | sara123 | Admin |
| khaled@makhzon.com | khaled123 | Team Leader |
| nada@makhzon.com | nada123 | Employee |

Youssef (`youssef@makhzon.com`) is inactive and cannot log in.

## Application backup

Super Admin: header **Backup** downloads a JSON export of users (no password hashes), countries, SOPs, and issues.

## Docs

- `docs/AUDIT_REPORT.md`
- `docs/MIGRATION_CHECKLIST.md`
- `docs/FUTURE_REQUIREMENTS.md`
- `docs/FINAL_AUDIT.md`
