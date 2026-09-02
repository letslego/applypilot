/**
 * Job board ingestion — mirrors AIApply's inventory sources where legally allowed.
 *
 * AIApply markets aggregation from LinkedIn, Indeed, Glassdoor, and company career
 * pages / ATS (Greenhouse, Lever, Workday, Ashby, …).
 *
 * We intentionally do NOT scrape LinkedIn / Indeed / Glassdoor (ToS + anti-bot).
 * Instead we pull the same underlying company postings via public ATS board APIs
 * and open job feeds that permit programmatic access:
 *   - Greenhouse boards-api (public company career boards)
 *   - Ashby posting-api job boards
 *   - Remotive remote jobs API
 *   - RemoteOK API (attribution required)
 *   - Arbeitnow job board API
 */

export type NormalizedJob = {
  externalId: string;
  title: string;
  company: string;
  location: string;
  remoteType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  description: string;
  requirements: string[];
  skills: string[];
  department: string | null;
  seniority: string | null;
  source: string;
  postedAt: Date;
  url: string;
};

export type IngestResult = {
  source: string;
  fetched: number;
  upserted: number;
  errors: string[];
};

const UA =
  "ApplyPilotJobBot/1.0 (+https://github.com/letslego/applypilot; research-demo)";

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`${url} → HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function guessRemoteType(location: string, text = ""): string {
  const hay = `${location} ${text}`.toLowerCase();
  if (/\bremote\b|work from home|wfh|distributed/.test(hay)) return "remote";
  if (/\bhybrid\b/.test(hay)) return "hybrid";
  return "onsite";
}

export function guessSeniority(title: string): string | null {
  const t = title.toLowerCase();
  if (/\bintern\b/.test(t)) return "Intern";
  if (/\b(staff|principal)\b/.test(t)) return "Staff";
  if (/\b(director|vp|head of|chief)\b/.test(t)) return "Manager";
  if (/\b(manager|lead)\b/.test(t) && !/\btech lead\b/.test(t)) return "Manager";
  if (/\b(senior|sr\.?)\b/.test(t)) return "Senior";
  if (/\b(junior|jr\.?|entry)\b/.test(t)) return "Junior";
  return "Mid";
}

export function extractSkills(text: string): string[] {
  const vocab = [
    "TypeScript",
    "JavaScript",
    "Python",
    "React",
    "Next.js",
    "Node.js",
    "Go",
    "Rust",
    "Java",
    "Kotlin",
    "Swift",
    "AWS",
    "GCP",
    "Azure",
    "Kubernetes",
    "Docker",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "GraphQL",
    "Redis",
    "Terraform",
    "Spark",
    "PyTorch",
    "TensorFlow",
    "SQL",
    "System Design",
    "Machine Learning",
    "CI/CD",
  ];
  const lower = text.toLowerCase();
  return vocab.filter((s) => lower.includes(s.toLowerCase())).slice(0, 12);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function parseSalary(...chunks: (string | null | undefined)[]): {
  min: number | null;
  max: number | null;
  currency: string;
} {
  const text = chunks.filter(Boolean).join(" ");
  const currency = /£/.test(text) ? "GBP" : /€/.test(text) ? "EUR" : "USD";
  const nums = [...text.matchAll(/(\$|£|€)?\s?(\d{2,3}(?:,\d{3})+|\d{2,3})(?:k)?/gi)]
    .map((m) => {
      let n = Number(m[2].replace(/,/g, ""));
      if (/k/i.test(m[0]) || n < 1000) n *= 1000;
      return n;
    })
    .filter((n) => n >= 20000 && n <= 800000)
    .sort((a, b) => a - b);
  if (!nums.length) return { min: null, max: null, currency };
  if (nums.length === 1) return { min: nums[0], max: nums[0], currency };
  return { min: nums[0], max: nums[nums.length - 1], currency };
}
