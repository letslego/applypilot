import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { MatchBadge } from "@/components/jobs-match-badge";
import { formatSalary } from "@/lib/utils";

export type JobListItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  remoteType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  seniority?: string | null;
  postedAt?: string;
  match?: { score: number } | null;
};

export function JobCard({ job }: { job: JobListItem }) {
  return (
    <Link href={`/app/jobs/${job.id}`} className="group block">
      <Card className="h-full transition hover:border-teal-700/25 hover:bg-white/90 hover:shadow-glow">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-ink/50">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.company}</span>
            </div>
            <h2 className="mt-1.5 font-display text-xl leading-snug text-ink group-hover:text-teal-800">
              {job.title}
            </h2>
          </div>
          <MatchBadge score={job.match?.score} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink/65">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
          <Badge className="bg-sand-100 capitalize text-ink/70">
            {job.remoteType}
          </Badge>
          {job.seniority ? (
            <Badge className="bg-teal-900/5 capitalize text-ink/70">
              {job.seniority}
            </Badge>
          ) : null}
        </div>

        <div className="mt-4 text-sm font-medium text-teal-800">
          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
        </div>
      </Card>
    </Link>
  );
}
