import type { ResumeContent } from "@/data/demo-resume";

/**
 * Heuristic parser for pasted LinkedIn profile text / PDF copy-paste.
 * Not a LinkedIn API scrape — user pastes content they already have access to.
 */
export function parseLinkedInPaste(
  raw: string,
  fallback: Partial<ResumeContent> = {},
): ResumeContent {
  const text = raw.replace(/\r/g, "").trim();
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  const fullName = lines[0] || fallback.fullName || "Your Name";
  const headline =
    lines.find((l, i) => i > 0 && l.length < 120 && !/@/.test(l)) ||
    fallback.headline ||
    "Professional";

  const aboutIdx = lines.findIndex((l) => /^about$/i.test(l));
  const expIdx = lines.findIndex((l) => /^experience$/i.test(l));
  const eduIdx = lines.findIndex((l) => /^education$/i.test(l));
  const skillsIdx = lines.findIndex((l) => /^skills$/i.test(l));

  let summary = fallback.summary || "";
  if (aboutIdx >= 0) {
    const end = [expIdx, eduIdx, skillsIdx].filter((i) => i > aboutIdx).sort((a, b) => a - b)[0];
    summary = lines.slice(aboutIdx + 1, end ?? aboutIdx + 6).join(" ").slice(0, 800);
  } else if (lines[2]) {
    summary = lines.slice(2, 5).join(" ").slice(0, 800);
  }

  const experience: ResumeContent["experience"] = [];
  if (expIdx >= 0) {
    const end = [eduIdx, skillsIdx].filter((i) => i > expIdx).sort((a, b) => a - b)[0] ?? lines.length;
    const block = lines.slice(expIdx + 1, end);
    let current: ResumeContent["experience"][number] | null = null;
    for (const line of block) {
      if (/^[•\-–]/.test(line) && current) {
        current.bullets.push(line.replace(/^[•\-–]\s*/, ""));
        continue;
      }
      if (
        /\b(present|20\d{2})\b/i.test(line) &&
        current &&
        !current.start
      ) {
        const parts = line.split(/[–—-]/).map((s) => s.trim());
        current.start = parts[0] || "";
        current.end = parts[1] || "Present";
        continue;
      }
      if (line.length < 90 && !/^about$/i.test(line)) {
        if (current && current.title) experience.push(current);
        current = {
          title: line,
          company: "",
          start: "",
          end: "",
          bullets: [],
        };
        continue;
      }
      if (current && !current.company && line.length < 80) {
        current.company = line;
      }
    }
    if (current && current.title) experience.push(current);
  }

  const education: ResumeContent["education"] = [];
  if (eduIdx >= 0) {
    const end = skillsIdx > eduIdx ? skillsIdx : Math.min(eduIdx + 6, lines.length);
    const chunk = lines.slice(eduIdx + 1, end);
    if (chunk[0]) {
      education.push({
        school: chunk[0],
        degree: chunk[1] || "Degree",
        year: (chunk.find((c) => /20\d{2}/.test(c)) || "").match(/20\d{2}/)?.[0] || "",
      });
    }
  }

  let skills: string[] = fallback.skills || [];
  if (skillsIdx >= 0) {
    skills = lines
      .slice(skillsIdx + 1, skillsIdx + 30)
      .join(",")
      .split(/[,·|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40)
      .slice(0, 24);
  }

  return {
    fullName,
    headline,
    email: emailMatch?.[0] || fallback.email || "",
    phone: phoneMatch?.[0] || fallback.phone || "",
    location: fallback.location || "",
    links: fallback.links || [],
    summary,
    experience: experience.length ? experience : fallback.experience || [],
    education: education.length ? education : fallback.education || [],
    skills: skills.length ? skills : fallback.skills || [],
  };
}
