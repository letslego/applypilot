export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function unique(arr: string[]) {
  return [...new Set(arr)];
}

export type MatchResult = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordCoverage: number;
  tips: string[];
};

export function computeMatch(opts: {
  resumeSkills: string[];
  resumeText: string;
  jobSkills: string[];
  jobText: string;
  preferredLocations?: string[];
  jobLocation?: string;
  salaryMin?: number | null;
  jobSalaryMax?: number | null;
}): MatchResult {
  const resumeSkillSet = unique(opts.resumeSkills.map((s) => s.toLowerCase()));
  const jobSkillSet = unique(opts.jobSkills.map((s) => s.toLowerCase()));

  const matchedSkills = jobSkillSet.filter((s) =>
    resumeSkillSet.some((r) => r.includes(s) || s.includes(r)),
  );
  const missingSkills = jobSkillSet.filter(
    (s) => !matchedSkills.includes(s),
  );

  const skillScore =
    jobSkillSet.length === 0
      ? 50
      : Math.round((matchedSkills.length / jobSkillSet.length) * 100);

  const jobTokens = unique(tokenize(opts.jobText)).slice(0, 80);
  const resumeTokens = new Set(tokenize(opts.resumeText));
  const hit = jobTokens.filter((t) => resumeTokens.has(t));
  const keywordCoverage =
    jobTokens.length === 0 ? 0 : Math.round((hit.length / jobTokens.length) * 100);

  let score = Math.round(skillScore * 0.65 + keywordCoverage * 0.35);

  if (opts.preferredLocations?.length && opts.jobLocation) {
    const loc = opts.jobLocation.toLowerCase();
    if (
      opts.preferredLocations.some((p) => loc.includes(p.toLowerCase())) ||
      loc.includes("remote")
    ) {
      score = Math.min(100, score + 5);
    }
  }

  if (
    opts.salaryMin &&
    opts.jobSalaryMax &&
    opts.jobSalaryMax < opts.salaryMin * 0.85
  ) {
    score = Math.max(0, score - 12);
  }

  const tips: string[] = [];
  if (missingSkills.length) {
    tips.push(
      `Add evidence for: ${missingSkills.slice(0, 4).join(", ")}.`,
    );
  }
  if (keywordCoverage < 45) {
    tips.push("Mirror more language from the job description in your summary.");
  }
  if (score >= 85) tips.push("Strong match — tailor the top 3 bullets and apply.");
  if (score < 55) tips.push("Consider skipping unless you have transferable depth.");

  return {
    score: Math.max(0, Math.min(100, score)),
    matchedSkills,
    missingSkills,
    keywordCoverage,
    tips,
  };
}
