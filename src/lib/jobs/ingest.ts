import { prisma } from "@/lib/db";
import type { IngestResult, NormalizedJob } from "./normalize";
import {
  ASHBY_BOARDS,
  GREENHOUSE_BOARDS,
  fetchArbeitnow,
  fetchAshbyBoard,
  fetchGreenhouseBoard,
  fetchRemotive,
  fetchRemoteOK,
} from "./sources";

async function upsertJobs(jobs: NormalizedJob[]): Promise<number> {
  let n = 0;
  for (const job of jobs) {
    await prisma.job.upsert({
      where: { externalId: job.externalId },
      create: {
        externalId: job.externalId,
        title: job.title,
        company: job.company,
        location: job.location,
        remoteType: job.remoteType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        description: job.description,
        requirements: JSON.stringify(job.requirements),
        skills: JSON.stringify(job.skills),
        department: job.department,
        seniority: job.seniority,
        source: job.source,
        postedAt: job.postedAt,
        url: job.url,
      },
      update: {
        title: job.title,
        company: job.company,
        location: job.location,
        remoteType: job.remoteType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        description: job.description,
        requirements: JSON.stringify(job.requirements),
        skills: JSON.stringify(job.skills),
        department: job.department,
        seniority: job.seniority,
        source: job.source,
        postedAt: job.postedAt,
        url: job.url,
      },
    });
    n += 1;
  }
  return n;
}

async function runSource(
  name: string,
  fn: () => Promise<NormalizedJob[]>,
): Promise<IngestResult> {
  const errors: string[] = [];
  try {
    const jobs = await fn();
    const upserted = await upsertJobs(jobs);
    return { source: name, fetched: jobs.length, upserted, errors };
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
    return { source: name, fetched: 0, upserted: 0, errors };
  }
}

export type SyncOptions = {
  /** Pull Greenhouse company boards (ATS career pages). Default true. */
  greenhouse?: boolean;
  ashby?: boolean;
  remotive?: boolean;
  remoteok?: boolean;
  arbeitnow?: boolean;
  /** Max jobs per Greenhouse/Ashby board. */
  perBoard?: number;
  /** Optional subset of greenhouse tokens. */
  greenhouseTokens?: string[];
};

export async function syncLiveJobs(opts: SyncOptions = {}) {
  const {
    greenhouse = true,
    ashby = true,
    remotive = true,
    remoteok = true,
    arbeitnow = true,
    perBoard = 20,
  } = opts;

  const results: IngestResult[] = [];

  if (greenhouse) {
    const boards = opts.greenhouseTokens?.length
      ? GREENHOUSE_BOARDS.filter((b) => opts.greenhouseTokens!.includes(b.token))
      : GREENHOUSE_BOARDS;
    for (const board of boards) {
      results.push(
        await runSource(`greenhouse:${board.token}`, () =>
          fetchGreenhouseBoard(board.token, board.company, perBoard),
        ),
      );
    }
  }

  if (ashby) {
    for (const board of ASHBY_BOARDS) {
      results.push(
        await runSource(`ashby:${board.org}`, () =>
          fetchAshbyBoard(board.org, board.company, perBoard),
        ),
      );
    }
  }

  if (remotive) {
    results.push(await runSource("remotive", () => fetchRemotive(50)));
  }
  if (remoteok) {
    results.push(await runSource("remoteok", () => fetchRemoteOK(50)));
  }
  if (arbeitnow) {
    results.push(await runSource("arbeitnow", () => fetchArbeitnow(50)));
  }

  const summary = {
    sources: results.length,
    fetched: results.reduce((s, r) => s + r.fetched, 0),
    upserted: results.reduce((s, r) => s + r.upserted, 0),
    failed: results.filter((r) => r.errors.length).length,
    results,
  };
  return summary;
}
