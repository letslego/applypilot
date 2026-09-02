"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_FAQS = [
  {
    q: "Does Auto-Apply submit to LinkedIn or Indeed for me?",
    a: "No. ApplyPilot runs a high-fidelity Auto-Apply simulator: it matches roles, burns credits, creates tailored docs, and advances application statuses — without unauthorized submissions to third-party boards.",
  },
  {
    q: "Do credits expire?",
    a: "Credits never expire. One credit equals one simulated application. Buy packs anytime or start with the free tier’s 5 credits.",
  },
  {
    q: "Can I tailor resumes per job?",
    a: "Yes. Build a master resume, then generate ATS-friendly variants per role — including keyword gap fixes, translations, and a library of tailored versions.",
  },
  {
    q: "What’s Interview Buddy?",
    a: "An in-browser live-coach simulator that suggests STAR-structured answers while you practice. Pair it with Mock Interview for role-specific Q&A and feedback.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Free includes the job board with match scores, ATS scanner, cover letter generator, and 5 Auto-Apply credits. Pro unlocks Interview Buddy, unlimited resume variants, and more.",
  },
];

export function MarketingFaq({
  items = DEFAULT_FAQS,
  id = "faq",
}: {
  items?: { q: string; a: string }[];
  id?: string;
}) {
  const [open, setOpen] = useState(0);

  return (
    <section id={id} className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-4xl text-ink md:text-5xl">FAQ</h2>
        <p className="mt-3 text-ink/65">
          Straight answers about Auto-Apply, credits, and how ApplyPilot helps you get hired.
        </p>
        <div className="mt-10 divide-y divide-teal-900/10 border-y border-teal-900/10">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="py-1">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span className="font-display text-xl text-ink md:text-2xl">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-teal-800 transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-ink/65">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
