import Stripe from "stripe";
import { hasStripe } from "./env";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!hasStripe()) return null;
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-08-26.dahlia",
    });
  }
  return stripe;
}

export const CREDIT_PACKS: Record<number, { credits: number; envPrice: string; label: string }> = {
  25: { credits: 25, envPrice: "STRIPE_PRICE_CREDITS_25", label: "25 credits" },
  50: { credits: 50, envPrice: "STRIPE_PRICE_CREDITS_50", label: "50 credits" },
  100: { credits: 100, envPrice: "STRIPE_PRICE_CREDITS_100", label: "100 credits" },
  250: { credits: 250, envPrice: "STRIPE_PRICE_CREDITS_250", label: "250 credits" },
};

export function stripePriceId(envKey: string): string | null {
  return process.env[envKey] || null;
}
