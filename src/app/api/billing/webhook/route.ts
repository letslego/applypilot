import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function grantCredits(
  userId: string,
  credits: number,
  reason: string,
  stripeSessionId?: string,
) {
  if (stripeSessionId) {
    const existing = await prisma.creditLedger.findFirst({
      where: { stripeSessionId },
    });
    if (existing) return;
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: credits } },
    }),
    prisma.creditLedger.create({
      data: {
        userId,
        delta: credits,
        reason,
        stripeSessionId,
      },
    }),
  ]);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[stripe:webhook]", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) return NextResponse.json({ received: true });

      if (session.metadata?.kind === "credits") {
        const credits = Number(session.metadata.credits || 0);
        if (credits > 0) {
          await grantCredits(
            userId,
            credits,
            `Purchased ${credits} credits`,
            session.id,
          );
        }
      }

      if (session.metadata?.kind === "pro" || session.mode === "subscription") {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "pro",
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id || undefined,
            stripeCustomerId:
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id || undefined,
          },
        });
        await grantCredits(userId, 25, "Pro subscription starter credits", session.id);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "free", stripeSubscriptionId: null },
        });
      } else if (sub.customer) {
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: "free", stripeSubscriptionId: null },
        });
      }
    }
  } catch (e) {
    console.error("[stripe:handler]", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
