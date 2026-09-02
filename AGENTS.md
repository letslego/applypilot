# Parallel agent briefs

Repo: ApplyPilot (AIApply-inspired AI job application platform).
Stack: Next.js App Router, Tailwind, Prisma SQLite, TypeScript.
Design: teal + sand atmosphere, Fraunces display, DM Sans body. No purple. Brand-first heroes. See `PLAN.md` and `src/app/globals.css`.

Shared APIs already exist:
- `/api/auth` login/signup, `/api/auth/logout`
- `/api/jobs`, `/api/jobs/[id]`
- `/api/resumes` (save, tailor, translate, scan, cover-letter)
- `/api/applications` (apply, save, update-status)
- `/api/auto-apply` (save-prefs, run, buy-credits)
- `/api/tools` (interview-turn, outreach, answers, profile, upgrade)

UI kit: `@/components/ui` (Button, Input, Textarea, Card, PageHeader, Badge)
Auth shell: `/app/*` uses `src/app/app/layout.tsx` + sidebar.

Rules:
- Only edit files in your owned paths.
- Do not change Prisma schema unless necessary; prefer additive.
- Keep pages fully functional against existing APIs.
- Demo login: demo@applypilot.com / demo1234
- After changes, ensure TypeScript compiles.

## Stream B — Marketing (`src/app/page.tsx`, `src/app/pricing/page.tsx`, `src/app/login/page.tsx`, `src/app/signup/page.tsx`)
Build polished landing (hero with ApplyPilot brand dominant, one headline, one supporting line, CTA, full-bleed atmosphere + job marquee motion). Features section, how-it-works, social proof, FAQ. Pricing with Free/Pro/credit packs. Login & signup forms posting to `/api/auth`.

## Stream C — Documents (`src/app/app/resume/page.tsx`, `cover-letter/page.tsx`, `scanner/page.tsx`)
Resume builder with edit form + live preview + print, tailor/translate actions. Cover letter generator picking resume+job. ATS scanner with score, keyword gaps heatmap, ATS checks, rewrite tips.

## Stream D — Jobs & Apply (`src/app/app/jobs/page.tsx`, `jobs/[id]/page.tsx`, `auto-apply/page.tsx`, `tracker/page.tsx`)
Job board with filters + match scores. Job detail with company brief + apply/save. Auto-apply prefs + run queue + credits. Tracker Kanban (saved/queued/applied/interview/offer/rejected) with drag or click-to-move status.

## Stream E — Interview & extras (`src/app/app/page.tsx` dashboard, `interview/page.tsx`, `buddy/page.tsx`, `outreach/page.tsx`, `answers/page.tsx`, `settings/page.tsx`)
Dashboard analytics. Mock interview chat. Interview Buddy suggestion panel. Outreach templates. Answer bank CRUD. Settings/profile/billing upgrade.
