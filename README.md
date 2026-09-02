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

## Job data sources

AIApply markets aggregation from **LinkedIn, Indeed, Glassdoor**, and **company career / ATS pages** (Greenhouse, Lever, Workday, Ashby, …).

ApplyPilot does **not** scrape LinkedIn/Indeed/Glassdoor (ToS). Live ingest pulls the same company postings via public APIs:

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
```

Or click **Sync live jobs** on `/app/jobs` while logged in.

