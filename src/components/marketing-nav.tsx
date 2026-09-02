import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "./ui";

export function MarketingNav() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-800 text-sand-50 shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-display text-2xl tracking-tight text-ink">
          ApplyPilot
        </span>
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-ink/70 md:flex">
        <Link href="/features" className="hover:text-ink">
          Features
        </Link>
        <Link href="/#how" className="hover:text-ink">
          How it works
        </Link>
        <Link href="/#faq" className="hover:text-ink">
          FAQ
        </Link>
        <Link href="/pricing" className="hover:text-ink">
          Pricing
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost">Log in</Button>
        </Link>
        <Link href="/signup">
          <Button>Get started</Button>
        </Link>
      </div>
    </header>
  );
}
