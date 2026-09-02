import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { CREDIT_PACKS, getStripe, stripePriceId } from "@/lib/stripe";
import { appUrl, hasStripe } from "@/lib/env";
import { prisma } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "billing"), { limit: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const action = body.action as string;
  const stripe = getStripe();

  if (!stripe || !hasStripe()) {
    // Dev fallback when Stripe is not configured
    if (action === "checkout-pro") {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { plan: "pro", credits: { increment: 25 } },
      });
      await prisma.creditLedger.create({
        data: {
          userId: user.id,
          delta: 25,
          reason: "Pro upgrade (dev mock — set STRIPE_SECRET_KEY for live billing)",
        },
      });
      return NextResponse.json({
        mock: true,
        plan: updated.plan,
        credits: updated.credits,
      });
    }
    if (action === "checkout-credits") {
      const pack = Number(body.pack || 50);
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: { increment: pack },
          plan: user.plan === "free" ? "pro" : user.plan,
        },
      });
      await prisma.creditLedger.create({
        data: {
          userId: user.id,
          delta: pack,
          reason: `Credit pack ${pack} (dev mock)`,
        },
      });
      return NextResponse.json({
        mock: true,
        credits: updated.credits,
        plan: updated.plan,
      });
    }
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  if (action === "checkout-pro") {
    const price = stripePriceId("STRIPE_PRICE_PRO_MONTHLY");
    if (!price) {
      return NextResponse.json(
        { error: "STRIPE_PRICE_PRO_MONTHLY not set" },
        { status: 500 },
      );
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: `${appUrl()}/app/settings?billing=success`,
      cancel_url: `${appUrl()}/pricing?billing=cancel`,
      metadata: { userId: user.id, kind: "pro" },
      subscription_data: {
        metadata: { userId: user.id },
      },
    });
    return NextResponse.json({ url: session.url });
  }

  if (action === "checkout-credits") {
    const pack = Number(body.pack || 50);
    const cfg = CREDIT_PACKS[pack];
    if (!cfg) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }
    const price = stripePriceId(cfg.envPrice);
    if (!price) {
      return NextResponse.json(
        { error: `${cfg.envPrice} not set` },
        { status: 500 },
      );
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: `${appUrl()}/app/auto-apply?billing=success`,
      cancel_url: `${appUrl()}/app/auto-apply?billing=cancel`,
      metadata: {
        userId: user.id,
        kind: "credits",
        credits: String(cfg.credits),
      },
    });
    return NextResponse.json({ url: session.url });
  }

  if (action === "portal") {
    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account" }, { status: 400 });
    }
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl()}/app/settings`,
    });
    return NextResponse.json({ url: portal.url });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
