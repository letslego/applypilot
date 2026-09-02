# ApplyPilot

AI job-application co-pilot inspired by [AIApply](https://aiapply.co/).

**Repo:** https://github.com/letslego/applypilot

## Quick start

```bash
docker compose up -d          # Postgres
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000 — demo login (dev only): `demo@applypilot.com` / `demo1234`

## Production

See **[DEPLOY.md](./DEPLOY.md)** for Postgres, Stripe, Resend, OpenAI, cron, and Vercel.

Health check: `GET /api/health`

## Features

| Area | Capability |
|------|------------|
| Auth | Signed sessions, email verify, password reset |
| Billing | Stripe Checkout + webhooks |
| Documents | Resume builder, LinkedIn paste import, DOCX/PDF export |
| ATS | Score, keyword heatmap, rewrite tips |
| Jobs | Live Greenhouse/Ashby/Remotive/RemoteOK/Arbeitnow sync |
| Auto-Apply | Credit packages + employer apply packages |
| Alerts | Job match + follow-up emails |
| Legal | Privacy, Terms, AI disclosure |

## Scripts

```bash
npm run jobs:sync:quick
npm run cron:all
npm run build
```
