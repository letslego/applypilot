# ApplyPilot — AIApply Clone: Architecture & Build Plan

## Product positioning

**ApplyPilot** is a full-stack AI job-search co-pilot modeled on [AIApply](https://aiapply.co/): find roles, tailor resumes & cover letters, auto-apply, track applications, and prep for interviews — plus extras from Teal, Jobscan, LoopCV, and Simplify.

Brand: **ApplyPilot** (not AIApply). Visual direction: deep teal + warm sand accents on layered gradient atmosphere; display font **Fraunces**, body **Satoshi** (or DM Sans). Avoid purple-indigo AI clichés and cream/terracotta tropes.

---

## Research summary: AIApply feature surface

| Area | AIApply capability | Our parity target |
|------|--------------------|-------------------|
| Landing | Hero, live job ticker, Prepare/Apply/Succeed, social proof, FAQ | Full marketing clone structure |
| Resume | GPT resume builder, LinkedIn import, PDF/DOCX export, multi-language | Builder + import paste + PDF print + translation |
| Cover letter | Per-job personalized letters | Generator tied to job + resume |
| ATS scanner | Score vs 50+ ATS, keyword gaps, one-click rewrite | Match score, keyword gaps, rewrite |
| Job board | 1M+ listings, match scores | Seeded board (80+ jobs) + match scoring |
| Auto-Apply | Criteria, continuous apply, credits (1=1 app), never expire | Preferences, queue simulator, credit wallet |
| Tracker | Per-app resume version + status | Kanban + table (Teal-style) |
| Mock interview | Role-specific Qs + feedback | Interactive chat practice |
| Interview Buddy | Live Zoom/Meet coaching (desktop) | In-browser simulated live coach |
| Pricing | Free + Pro ~$29/mo + credit packs | Pricing page + mock checkout |
| Modes | Manual / hybrid / full auto | Mode selector in Auto-Apply |

### Differentiating extras (from competitors)

1. **Kanban pipeline** (Teal) — Saved → Applied → Interview → Offer → Rejected  
2. **Keyword gap heatmap** (Jobscan) — visual missing/present keywords  
3. **Company research brief** — AI summary before apply  
4. **Outreach templates** — recruiter cold email / LinkedIn DM  
5. **Salary insights** — band estimate per role  
6. **Analytics dashboard** — apps sent, match avg, interview rate, credit burn  
7. **Multi-profile resumes** — base + tailored variants library  
8. **Follow-up reminders** — schedule nudge after N days  
9. **Autofill answer bank** — common EE/work-auth/questions store  
10. **Job alerts** — saved search notifications (in-app)

---

## Technical architecture

```
applypilot/
├── package.json          # Next.js 15 monolith
├── prisma/               # SQLite schema + seed
├── src/
│   ├── app/              # App Router pages + API
│   ├── components/       # UI
│   ├── lib/              # db, ai, matching, auth
│   └── data/             # seed jobs, templates
└── public/
```

**Stack**
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Prisma + SQLite (zero external DB deps)
- NextAuth-style **demo auth** (email magic / passwordless demo accounts — local session cookie)
- AI layer: deterministic template + heuristic engine; optional `OPENAI_API_KEY` for live LLM
- PDF: browser print CSS + `html2canvas`/`jspdf` optional; primary path = print stylesheet
- No real auto-submit to LinkedIn/Indeed (ethical + ToS); **simulate** submissions with realistic latency and status transitions

**Key data models**
- User, Profile, Resume, CoverLetter, Job, Application, CreditLedger, InterviewSession, AnswerBank, SavedSearch, OutreachDraft

**Matching algorithm (local)**
- Tokenize job skills/title vs resume skills/experience
- Weighted Jaccard + title similarity + location/salary preference boosts
- Output 0–100 match score + missing keywords

---

## App routes (feature parity map)

### Public
- `/` — Landing
- `/pricing` — Free / Pro / credit packs
- `/login`, `/signup`
- `/features/*` marketing deep-dives (optional thin pages)

### Authenticated (`/app`)
- `/app` — Dashboard + analytics
- `/app/resume` — Resume library + AI builder
- `/app/cover-letter` — Cover letter generator
- `/app/scanner` — ATS scanner
- `/app/jobs` — Job board + filters + match
- `/app/jobs/[id]` — Detail, research brief, apply
- `/app/auto-apply` — Preferences, mode, queue, credits
- `/app/tracker` — Kanban + list
- `/app/interview` — Mock interview
- `/app/buddy` — Interview Buddy simulator
- `/app/outreach` — Templates
- `/app/answers` — Autofill answer bank
- `/app/settings` — Profile, preferences, billing mock

### API (`/api/*`)
- auth, resumes, cover-letters, scan, jobs, applications, auto-apply/run, credits, interview, ai/generate

---

## Parallel workstreams

| Stream | Owner agent | Deliverables |
|--------|-------------|--------------|
| A Foundation | Parent | Scaffold, Prisma, seed, design tokens, auth, shell layout |
| B Marketing | Cloud/local | Landing, pricing, FAQ, motion |
| C Documents | Cloud/local | Resume, cover letter, ATS scanner, PDF |
| D Jobs & Apply | Cloud/local | Board, match, auto-apply, credits, tracker |
| E Interview & Extras | Cloud/local | Mock interview, buddy, outreach, analytics widgets |

Conflict rules: agents own disjoint `src/app/**` paths; shared `components/ui` and `lib` only extended via additive files; parent merges.

---

## Demo accounts

- `demo@applypilot.com` / `demo1234` — Pro + 50 credits, sample resume, 12 applications
- Guest signup creates Free tier + 5 credits

## Success criteria

1. `npm run build` passes  
2. Full click-path: signup → resume → scan → browse job → tailor → auto-apply → tracker → mock interview  
3. Landing feels brand-first and compositionally coherent  
4. Feature checklist above marked done  
5. Bugs found in smoke test fixed  

## Ethical boundary

Real unauthorized auto-apply to third-party job boards is **not** implemented. Auto-Apply is a high-fidelity simulator that creates application records, burns credits, and advances statuses — suitable for product demo and local use.
