# ApplyPilot

AI job-application co-pilot inspired by [AIApply](https://aiapply.co/) — with feature parity plus extras from Teal, Jobscan, LoopCV, and Simplify.

**Repo:** https://github.com/letslego/applypilot

## Quick start (local)

```bash
cp .env.example .env
npm install
npm run db:reset
npm run dev
```

Open http://localhost:3000

**Demo login (non-production only):** `demo@applypilot.com` / `demo1234`

## Production launch

See **[DEPLOY.md](./DEPLOY.md)** for Postgres, Stripe, Resend, OpenAI, cron, and env setup.

```bash
npm run build && npm start
```

## Features

| Area | Capability |
|------|------------|
| Marketing | Brand-first landing, pricing, features, FAQ |
| Auth | HMAC-signed sessions, email verify, password reset |
| Billing | Stripe Checkout (Pro + credit packs) + webhooks |
| Documents | AI resume builder, tailor, translate, DOCX/PDF export |
| Cover letters | Per-job generation |
| ATS scanner | Score, keyword heatmap, rewrite tips |
| Job board | Seeded roles + live ATS/public feed sync |
| Auto-Apply | Prefs, hybrid/auto modes, credit wallet, **employer apply packages** |
| Tracker | Kanban pipeline + follow-up reminders |
| Interviews | Mock interview + Interview Buddy (practice coach) |
| Alerts | Job match emails + in-app notifications |
| Legal | Privacy, Terms, AI disclosure |

Auto-Apply builds tailored packages and employer apply links — you confirm submission. Optional live LLM via `OPENAI_API_KEY`. Set `REQUIRE_OPENAI=true` in production.

## Job data sources

Legal ingest (no LinkedIn/Indeed/Glassdoor scraping):

| Source | Endpoint style |
|--------|----------------|
| Greenhouse | `boards-api.greenhouse.io/v1/boards/{token}/jobs` |
| Ashby | `api.ashbyhq.com/posting-api/job-board/{org}` |
| Remotive | `remotive.com/api/remote-jobs` |
| RemoteOK | `remoteok.com/api` |
| Arbeitnow | `arbeitnow.com/api/job-board-api` |

```bash
npm run jobs:sync:quick   # fast subset
npm run jobs:sync         # fuller pull
npm run cron:all          # sync + queue + alerts + follow-ups
```

Or click **Sync live jobs** on `/app/jobs` while logged in.
