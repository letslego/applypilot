"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Mail,
  ScanSearch,
  Briefcase,
  Rocket,
  Kanban,
  MessagesSquare,
  Headphones,
  Send,
  BookMarked,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/resume", label: "Resume Builder", icon: FileText },
  { href: "/app/cover-letter", label: "Cover Letters", icon: Mail },
  { href: "/app/scanner", label: "ATS Scanner", icon: ScanSearch },
  { href: "/app/jobs", label: "Job Board", icon: Briefcase },
  { href: "/app/auto-apply", label: "Auto-Apply", icon: Rocket },
  { href: "/app/tracker", label: "Tracker", icon: Kanban },
  { href: "/app/interview", label: "Mock Interview", icon: MessagesSquare },
  { href: "/app/buddy", label: "Interview Buddy", icon: Headphones },
  { href: "/app/outreach", label: "Outreach", icon: Send },
  { href: "/app/answers", label: "Answer Bank", icon: BookMarked },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({
  user,
}: {
  user: { name: string; plan: string; credits: number };
}) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-teal-900/10 bg-[#f3efe6]/90">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-800 text-sand-50">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="font-display text-lg leading-none text-ink">ApplyPilot</div>
          <div className="text-[11px] uppercase tracking-wider text-ink/45">
            Job search co-pilot
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-teal-800 text-sand-50"
                  : "text-ink/70 hover:bg-teal-900/5 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-teal-900/10 p-4">
        <div className="mb-3 rounded-xl bg-white/70 p-3 text-sm">
          <div className="font-medium text-ink">{user.name}</div>
          <div className="mt-1 flex items-center justify-between text-xs text-ink/55">
            <span className="capitalize">{user.plan} plan</span>
            <span>{user.credits} credits</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink/60 hover:bg-teal-900/5"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
