import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge, Card, PageHeader, Button } from "@/components/ui";
import { formatDate, statusColor } from "@/lib/utils";
import {
  Briefcase,
  MessagesSquare,
  Rocket,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    include: { job: true },
    orderBy: { updatedAt: "desc" },
  });

  const applied = apps.filter((a) =>
    ["applied", "interview", "offer", "rejected"].includes(a.status),
  );
  const interviews = apps.filter((a) =>
    ["interview", "offer"].includes(a.status),
  );
  const avgMatch = apps.length
    ? Math.round(apps.reduce((s, a) => s + a.matchScore, 0) / apps.length)
    : 0;
  const interviewRate = applied.length
    ? Math.round((interviews.length / applied.length) * 100)
    : 0;

  const stats = [
    { label: "Applications", value: applied.length, icon: Briefcase },
    { label: "Interviews", value: interviews.length, icon: MessagesSquare },
    { label: "Avg match", value: `${avgMatch}%`, icon: Sparkles },
    { label: "Credits left", value: user.credits, icon: Rocket },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Your job search command center — tailor, apply, track, and practice."
        actions={
          <Link href="/app/auto-apply">
            <Button>Run Auto-Apply</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-start justify-between">
              <div>
                <div className="text-sm text-ink/55">{s.label}</div>
                <div className="mt-2 font-display text-3xl text-ink">{s.value}</div>
              </div>
              <div className="rounded-xl bg-teal-800/10 p-2 text-teal-800">
                <Icon className="h-5 w-5" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">Recent activity</h2>
            <Link href="/app/tracker" className="text-sm text-teal-800 hover:underline">
              Open tracker
            </Link>
          </div>
          <div className="space-y-3">
            {apps.slice(0, 8).map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sand-50/80 px-3 py-3"
              >
                <div>
                  <div className="font-medium text-ink">{a.job.title}</div>
                  <div className="text-sm text-ink/55">
                    {a.job.company} · {formatDate(a.appliedAt || a.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-teal-800/10 text-teal-900">
                    {a.matchScore}% match
                  </Badge>
                  <Badge className={statusColor(a.status)}>{a.status}</Badge>
                </div>
              </div>
            ))}
            {apps.length === 0 ? (
              <p className="text-sm text-ink/55">
                No applications yet. Browse the{" "}
                <Link href="/app/jobs" className="text-teal-800 underline">
                  job board
                </Link>
                .
              </p>
            ) : null}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-2xl text-ink">Pipeline health</h2>
            <p className="mt-2 text-sm text-ink/60">
              Interview rate from submitted apps:{" "}
              <span className="font-semibold text-teal-800">{interviewRate}%</span>
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-sand-200">
              <div
                className="h-full rounded-full bg-teal-800 transition-all"
                style={{ width: `${Math.min(100, interviewRate)}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-ink/45">
              Tip: keep Auto-Apply min match ≥ 70 for cleaner pipelines.
            </p>
          </Card>
          <Card>
            <h2 className="font-display text-xl text-ink">Quick actions</h2>
            <div className="mt-4 flex flex-col gap-2">
              {[
                ["/app/resume", "Edit resume"],
                ["/app/jobs", "Browse jobs"],
                ["/app/interview", "Practice interview"],
                ["/app/buddy", "Open Interview Buddy"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl bg-sand-50 px-3 py-2 text-sm text-ink hover:bg-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
