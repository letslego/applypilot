# Production launch

ApplyPilot is a Next.js app on **PostgreSQL**.

## 1. Database

### Local (Docker)

```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### Local (Postgres already installed)

```bash
# DATABASE_URL=postgresql://applypilot:applypilot@localhost:5432/applypilot?schema=public
npx prisma migrate deploy && npm run db:seed
```

### Production (Neon / Supabase / RDS)

1. Create a Postgres database.
2. Set `DATABASE_URL` (use pooled URL + `?sslmode=require` as required by your host).
3. Deploy — `npm run build` runs `prisma migrate deploy` automatically.

## 2. Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | HMAC session signing (32+ chars) |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL (`https://…`) |
| `OPENAI_API_KEY` | Live AI |
| `REQUIRE_OPENAI` | `true` in production |
| `STRIPE_SECRET_KEY` | Billing |
| `STRIPE_WEBHOOK_SECRET` | Checkout fulfillment |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js (optional UI) |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro price id |
| `STRIPE_PRICE_CREDITS_25/50/100/250` | Credit pack price ids |
| `RESEND_API_KEY` | Transactional email |
| `EMAIL_FROM` | From address |
| `CRON_SECRET` | Protect `/api/cron` |

Demo login is **disabled** when `NODE_ENV=production`.

## 3. Stripe

1. Create products: Pro monthly + one-time credit packs (25/50/100/250).
2. Put price IDs in env.
3. Webhook: `POST /api/billing/webhook`  
   Events: `checkout.session.completed`, `customer.subscription.deleted`.

## 4. Cron

`vercel.json` schedules job sync, apply-package queue, alerts, and follow-ups.

Authorize with `Authorization: Bearer $CRON_SECRET`.

```bash
curl -X POST "$APP_URL/api/cron?job=all" -H "Authorization: Bearer $CRON_SECRET"
curl "$APP_URL/api/health"
```

## 5. Deploy (Vercel)

1. Import `letslego/applypilot` in Vercel.
2. Add all env vars (including `DATABASE_URL` to a Neon/Supabase DB).
3. Set build command to default `npm run build`.
4. Add GitHub secrets for CI auto-deploy (optional):
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
5. After first deploy, seed if needed:

```bash
DATABASE_URL=... npm run db:seed
```

## Ethical boundary

Auto-Apply creates **packages** (tailored resume, cover letter, answer bank, employer `applyUrl`). Users confirm submission on the employer site. LinkedIn/Indeed scraping and stealth auto-submit are out of scope. LinkedIn **paste import** only parses text the user pastes.
