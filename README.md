# ApplyPilot

AI job-application co-pilot inspired by [AIApply](https://aiapply.co/) — with feature parity plus extras from Teal, Jobscan, LoopCV, and Simplify.

**Repo:** https://github.com/letslego/applypilot

## Quick start

```bash
npm install
npm run db:reset
npm run dev
```

Open http://localhost:3000

**Demo login:** `demo@applypilot.com` / `demo1234`

## Features

| Area | Capability |
|------|------------|
| Marketing | Brand-first landing, pricing, features, FAQ |
| Documents | AI resume builder, tailor, translate, print/PDF |
| Cover letters | Per-job generation |
| ATS scanner | Score, keyword heatmap, rewrite tips |
| Job board | 90 seeded roles + match scores |
| Auto-Apply | Prefs, hybrid/auto modes, credit wallet (simulated) |
| Tracker | Kanban pipeline (Teal-style) |
| Interviews | Mock interview + Interview Buddy |
| Extras | Outreach templates, answer bank, analytics, company briefs |

Auto-Apply **simulates** submissions ethically (no LinkedIn/Indeed scraping). Optional live LLM via `OPENAI_API_KEY`.

## Architecture

See `PLAN.md`. Stack: Next.js App Router, Prisma + SQLite, Tailwind, TypeScript.
