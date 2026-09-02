import {
  extractSkills,
  fetchJson,
  guessRemoteType,
  guessSeniority,
  NormalizedJob,
  parseSalary,
  stripHtml,
} from "./normalize";

/** Popular public Greenhouse board tokens (company career pages). */
export const GREENHOUSE_BOARDS: { token: string; company: string }[] = [
  { token: "stripe", company: "Stripe" },
  { token: "airbnb", company: "Airbnb" },
  { token: "figma", company: "Figma" },
  { token: "vercel", company: "Vercel" },
  { token: "datadog", company: "Datadog" },
  { token: "brex", company: "Brex" },
  { token: "cloudflare", company: "Cloudflare" },
  { token: "gitlab", company: "GitLab" },
  { token: "mongodb", company: "MongoDB" },
  { token: "twilio", company: "Twilio" },
  { token: "asana", company: "Asana" },
  { token: "dropbox", company: "Dropbox" },
  { token: "coinbase", company: "Coinbase" },
  { token: "anthropic", company: "Anthropic" },
];

export const ASHBY_BOARDS: { org: string; company: string }[] = [
  { org: "openai", company: "OpenAI" },
  { org: "linear", company: "Linear" },
  { org: "notion", company: "Notion" },
  { org: "ramp", company: "Ramp" },
];

type GhList = {
  jobs: {
    id: number;
    title: string;
    absolute_url: string;
    updated_at: string;
    location: { name: string };
  }[];
};

type GhJob = {
  id: number;
  title: string;
  absolute_url: string;
  updated_at: string;
  location: { name: string };
  content?: string;
  departments?: { name: string }[];
};

export async function fetchGreenhouseBoard(
  token: string,
  company: string,
  limit = 25,
): Promise<NormalizedJob[]> {
  const list = await fetchJson<GhList>(
    `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`,
  );
  const slice = list.jobs.slice(0, limit);
  const out: NormalizedJob[] = [];

  for (const job of slice) {
    let content = "";
    try {
      const detail = await fetchJson<GhJob>(
        `https://boards-api.greenhouse.io/v1/boards/${token}/jobs/${job.id}`,
      );
      content = stripHtml(detail.content || "");
    } catch {
      content = `${job.title} at ${company}`;
    }
    const salary = parseSalary(content);
    out.push({
      externalId: `gh:${token}:${job.id}`,
      title: job.title,
      company,
      location: job.location?.name || "Unknown",
      remoteType: guessRemoteType(job.location?.name || "", content),
      salaryMin: salary.min,
      salaryMax: salary.max,
      currency: salary.currency,
      description: content.slice(0, 5000) || `${job.title} at ${company}`,
      requirements: [],
      skills: extractSkills(`${job.title} ${content}`),
      department: null,
      seniority: guessSeniority(job.title),
      source: "Greenhouse",
      postedAt: new Date(job.updated_at || Date.now()),
      url: job.absolute_url,
    });
  }
  return out;
}

type AshbyBoard = {
  jobs: {
    id: string;
    title: string;
    department?: string;
    team?: string;
    location?: string;
    locationName?: string;
    workplaceType?: string;
    employmentType?: string;
    descriptionHtml?: string;
    descriptionPlain?: string;
    jobUrl?: string;
    applyUrl?: string;
    publishedAt?: string;
    compensation?: {
      compensationTier?: {
        components?: { minValue?: number; maxValue?: number; currencyCode?: string }[];
      }[];
    };
  }[];
};

export async function fetchAshbyBoard(
  org: string,
  company: string,
  limit = 25,
): Promise<NormalizedJob[]> {
  const data = await fetchJson<AshbyBoard>(
    `https://api.ashbyhq.com/posting-api/job-board/${org}`,
  );
  return (data.jobs || []).slice(0, limit).map((job) => {
    const location = job.locationName || job.location || "Unknown";
    const description =
      job.descriptionPlain ||
      stripHtml(job.descriptionHtml || "") ||
      `${job.title} at ${company}`;
    let salaryMin: number | null = null;
    let salaryMax: number | null = null;
    let currency = "USD";
    const tier = job.compensation?.compensationTier?.[0]?.components?.[0];
    if (tier) {
      salaryMin = tier.minValue ?? null;
      salaryMax = tier.maxValue ?? null;
      currency = tier.currencyCode || "USD";
    } else {
      const parsed = parseSalary(description);
      salaryMin = parsed.min;
      salaryMax = parsed.max;
      currency = parsed.currency;
    }
    const remoteType =
      job.workplaceType?.toLowerCase().includes("remote")
        ? "remote"
        : guessRemoteType(location, description);
    return {
      externalId: `ashby:${org}:${job.id}`,
      title: job.title,
      company,
      location,
      remoteType,
      salaryMin,
      salaryMax,
      currency,
      description: description.slice(0, 5000),
      requirements: [],
      skills: extractSkills(`${job.title} ${description}`),
      department: job.department || job.team || null,
      seniority: guessSeniority(job.title),
      source: "Ashby",
      postedAt: new Date(job.publishedAt || Date.now()),
      url: job.jobUrl || job.applyUrl || `https://jobs.ashbyhq.com/${org}`,
    };
  });
}

type RemotiveResponse = {
  jobs: {
    id: number;
    url: string;
    title: string;
    company_name: string;
    category: string;
    job_type: string;
    candidate_required_location: string;
    salary: string;
    description: string;
    publication_date: string;
  }[];
};

export async function fetchRemotive(limit = 40): Promise<NormalizedJob[]> {
  const data = await fetchJson<RemotiveResponse>(
    "https://remotive.com/api/remote-jobs?category=software-dev",
  );
  return (data.jobs || []).slice(0, limit).map((job) => {
    const description = stripHtml(job.description || "");
    const salary = parseSalary(job.salary, description);
    return {
      externalId: `remotive:${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      remoteType: "remote",
      salaryMin: salary.min,
      salaryMax: salary.max,
      currency: salary.currency,
      description: description.slice(0, 5000),
      requirements: [],
      skills: extractSkills(`${job.title} ${job.category} ${description}`),
      department: job.category || null,
      seniority: guessSeniority(job.title),
      source: "Remotive",
      postedAt: new Date(job.publication_date || Date.now()),
      url: job.url,
    };
  });
}

type RemoteOkJob = {
  id?: string | number;
  slug?: string;
  company?: string;
  position?: string;
  location?: string;
  description?: string;
  url?: string;
  date?: string;
  tags?: string[];
  salary_min?: number;
  salary_max?: number;
};

export async function fetchRemoteOK(limit = 40): Promise<NormalizedJob[]> {
  const data = await fetchJson<RemoteOkJob[]>("https://remoteok.com/api");
  // First element is legal/meta notice
  return data
    .filter((j) => j && j.id && j.position)
    .slice(0, limit)
    .map((job) => {
      const description = stripHtml(job.description || "");
      const tags = (job.tags || []).map(String);
      return {
        externalId: `remoteok:${job.id}`,
        title: job.position || "Role",
        company: job.company || "Unknown",
        location: job.location || "Remote",
        remoteType: "remote",
        salaryMin: job.salary_min || null,
        salaryMax: job.salary_max || null,
        currency: "USD",
        description: description.slice(0, 5000) || tags.join(", "),
        requirements: [],
        skills: [...new Set([...tags, ...extractSkills(description)])].slice(0, 12),
        department: null,
        seniority: guessSeniority(job.position || ""),
        source: "RemoteOK",
        postedAt: job.date ? new Date(job.date) : new Date(),
        url: job.url || `https://remoteok.com/remote-jobs/${job.slug || job.id}`,
      };
    });
}

type ArbeitnowResponse = {
  data: {
    slug: string;
    company_name: string;
    title: string;
    description: string;
    remote: boolean;
    location: string;
    created_at: number;
    url: string;
    tags: string[];
    job_types: string[];
  }[];
};

export async function fetchArbeitnow(limit = 40): Promise<NormalizedJob[]> {
  const data = await fetchJson<ArbeitnowResponse>(
    "https://www.arbeitnow.com/api/job-board-api",
  );
  return (data.data || []).slice(0, limit).map((job) => {
    const description = stripHtml(job.description || "");
    return {
      externalId: `arbeitnow:${job.slug}`,
      title: job.title,
      company: job.company_name,
      location: job.location || (job.remote ? "Remote" : "Unknown"),
      remoteType: job.remote ? "remote" : guessRemoteType(job.location || ""),
      salaryMin: null,
      salaryMax: null,
      currency: "USD",
      description: description.slice(0, 5000),
      requirements: [],
      skills: [...new Set([...(job.tags || []), ...extractSkills(description)])].slice(
        0,
        12,
      ),
      department: job.job_types?.[0] || null,
      seniority: guessSeniority(job.title),
      source: "Arbeitnow",
      postedAt: new Date((job.created_at || Date.now() / 1000) * 1000),
      url: job.url,
    };
  });
}
