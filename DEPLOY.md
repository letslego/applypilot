# Production launch

ApplyPilot ships as a Next.js app. Local default uses **SQLite**. Production should use **Postgres**.

## 1. Database

Local:

```bash
cp .env.example .env
# DATABASE_URL="file:./dev.db"
npm run db:reset
```

Production (Neon / Supabase / RDS):

1. In `prisma/schema.prisma`, change:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set `DATABASE_URL` to your Postgres connection string.
3. Run:

```bash
npx prisma db push
# or: npx prisma migrate deploy
npm run db:seed   # optional — skip demo user in prod if desired
```

## 2. Environment

Required for production:

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | HMAC session signing (32+ chars) |
| `DATABASE_URL` | Postgres URL |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL |
| `OPENAI_API_KEY` | Live AI |
| `REQUIRE_OPENAI=true` | Refuse heuristic AI fallbacks |
| `STRIPE_SECRET_KEY` | Billing |
| `STRIPE_WEBHOOK_SECRET` | Checkout fulfillment |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro price id |
| `STRIPE_PRICE_CREDITS_*` | Credit pack price ids |
| `RESEND_API_KEY` | Transactional email |
| `EMAIL_FROM` | From address |
| `CRON_SECRET` | Protect `/api/cron` |

Demo login is **disabled** when `NODE_ENV=production`.

## 3. Stripe

1. Create products: Pro monthly subscription + one-time credit packs (25/50/100/250).
2. Put price IDs in env.
3. Webhook endpoint: `POST /api/billing/webhook`  
   Events: `checkout.session.completed`, `customer.subscription.deleted`.

## 4. Cron

`vercel.json` schedules:

- Job sync every 6h
- Apply-package queue every 15m
- Job alerts daily
- Follow-up reminders daily

Authorize with `Authorization: Bearer $CRON_SECRET` (Vercel Cron sends this when configured) or `?secret=`.

Manual:

```bash
curl -X POST "$APP_URL/api/cron?job=all" -H "Authorization: Bearer $CRON_SECRET"
```

## 5. Deploy

```bash
npm run build
npm start
# or: vercel --prod
```

Health checks: `/` · `/api/jobs/sync` (GET) · Stripe webhook · signup → verify email → checkout.

## Ethical boundary

Auto-Apply creates **packages** (tailored resume, cover letter, answer bank snapshot, employer `applyUrl`). Users confirm submission on the employer site. LinkedIn/Indeed/Glassdoor scraping and stealth auto-submit are intentionally out of scope.
