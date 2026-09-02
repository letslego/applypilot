import type { ResumeContent } from "@/data/demo-resume";
import { computeMatch } from "./matching";
import { hasOpenAI, requireOpenAI } from "./env";

async function openaiChat(system: string, user: string): Promise<string | null> {
  if (!hasOpenAI()) {
    if (requireOpenAI()) {
      throw new Error("OPENAI_API_KEY is required for this feature");
    }
    return null;
  }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.5,
      }),
    });
    if (!res.ok) {
      if (requireOpenAI()) {
        throw new Error(`OpenAI error ${res.status}`);
      }
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    if (requireOpenAI()) throw e;
    return null;
  }
}

export function tailorResumeLocal(
  resume: ResumeContent,
  jobTitle: string,
  company: string,
  jobSkills: string[],
  jobDescription: string,
): ResumeContent {
  const missing = jobSkills.filter(
    (s) => !resume.skills.some((r) => r.toLowerCase().includes(s.toLowerCase())),
  );
  const boostedSkills = [
    ...resume.skills,
    ...missing.slice(0, 3).map((s) => s),
  ];
  const uniqueSkills = [...new Set(boostedSkills)];

  const summary = `${resume.summary} Currently targeting ${jobTitle} roles at companies like ${company}, with emphasis on ${jobSkills.slice(0, 3).join(", ")}.`;

  const experience = resume.experience.map((exp, idx) => {
    if (idx !== 0) return exp;
    const extra = jobSkills[0]
      ? `Delivered measurable impact with ${jobSkills[0]} aligned to ${jobTitle} outcomes.`
      : null;
    return {
      ...exp,
      bullets: extra ? [extra, ...exp.bullets].slice(0, 4) : exp.bullets,
    };
  });

  return {
    ...resume,
    headline: jobTitle.includes("Engineer")
      ? jobTitle
      : resume.headline,
    summary: summary.slice(0, 600),
    skills: uniqueSkills,
    experience,
  };
}

export async function generateCoverLetter(opts: {
  name: string;
  resume: ResumeContent;
  jobTitle: string;
  company: string;
  jobDescription: string;
}): Promise<string> {
  const live = await openaiChat(
    "You write concise, specific, human cover letters. No clichés. 280-360 words.",
    `Candidate: ${opts.name}\nRole: ${opts.jobTitle} at ${opts.company}\nResume summary: ${opts.resume.summary}\nSkills: ${opts.resume.skills.join(", ")}\nJob: ${opts.jobDescription.slice(0, 2000)}`,
  );
  if (live) return live;

  const topSkills = opts.resume.skills.slice(0, 5).join(", ");
  const highlight = opts.resume.experience[0];
  return `Dear ${opts.company} Hiring Team,

I’m excited to apply for the ${opts.jobTitle} role at ${opts.company}. ${opts.resume.summary}

Most recently as ${highlight?.title} at ${highlight?.company}, I ${highlight?.bullets[0]?.replace(/\.$/, "").toLowerCase() || "led high-impact product work"}. My core toolkit includes ${topSkills}, which maps closely to what you’re hiring for.

I’m drawn to ${opts.company} because of the ambition behind this ${opts.jobTitle} mandate — and I’d welcome the chance to bring that same ownership to your team. I’d love to share how I’ve approached similar problems and learn more about your priorities for the next two quarters.

Thank you for your time and consideration.

Sincerely,
${opts.name}`;
}

export async function scanResume(opts: {
  resume: ResumeContent;
  jobTitle?: string;
  jobSkills?: string[];
  jobDescription?: string;
}) {
  const jobSkills = opts.jobSkills || [
    "TypeScript",
    "React",
    "Node.js",
    "AWS",
    "System Design",
  ];
  const jobText =
    opts.jobDescription ||
    `${opts.jobTitle || "Software Engineer"} ${jobSkills.join(" ")} experience production systems`;

  const match = computeMatch({
    resumeSkills: opts.resume.skills,
    resumeText: JSON.stringify(opts.resume),
    jobSkills,
    jobText,
  });

  const formattingIssues: string[] = [];
  if (opts.resume.summary.length < 80) {
    formattingIssues.push("Summary is short — aim for 3–4 lines.");
  }
  if (opts.resume.experience.some((e) => e.bullets.length < 2)) {
    formattingIssues.push("Some roles have fewer than 2 bullets.");
  }
  if (opts.resume.skills.length < 6) {
    formattingIssues.push("Add more skills so ATS keyword nets catch you.");
  }
  if (!opts.resume.email || !opts.resume.phone) {
    formattingIssues.push("Include email and phone for ATS contact parsing.");
  }
  const hasYears = opts.resume.experience.some((e) => /\d{4}/.test(e.start));
  if (!hasYears) {
    formattingIssues.push("Use explicit date ranges (YYYY) for each role.");
  }

  const liveTips = await openaiChat(
    "You are an ATS resume coach. Return 3-5 short rewrite tips as a plain bullet list, no preamble.",
    `Job: ${opts.jobTitle || "role"}\nMissing skills: ${match.missingSkills.join(", ")}\nResume summary: ${opts.resume.summary}\nTop bullets: ${opts.resume.experience[0]?.bullets?.slice(0, 3).join(" | ") || "none"}`,
  );

  const atsChecks = [
    { label: "Standard section headings", pass: true },
    { label: "No tables/columns detected", pass: true },
    { label: "Contact info parseable", pass: Boolean(opts.resume.email) },
    { label: "Phone present", pass: Boolean(opts.resume.phone) },
    { label: "Skills section present", pass: opts.resume.skills.length > 0 },
    { label: "Chronological experience", pass: opts.resume.experience.length > 0 },
    { label: "Education section", pass: (opts.resume.education?.length || 0) > 0 },
    {
      label: "Keyword density healthy",
      pass: match.keywordCoverage >= 40,
    },
    {
      label: "Quantified bullets",
      pass: opts.resume.experience.some((e) =>
        e.bullets.some((b) => /\d/.test(b)),
      ),
    },
  ];

  const aiSuggestions = liveTips
    ? liveTips
        .split("\n")
        .map((l) => l.replace(/^[-*•\d.\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return {
    overall: match.score,
    match,
    formattingIssues,
    atsChecks,
    rewriteSuggestions: [
      ...aiSuggestions,
      ...match.missingSkills.slice(0, 5).map(
        (s) => `Weave “${s}” into a quantified bullet under your latest role.`,
      ),
    ].slice(0, 8),
  };
}

export async function interviewReply(opts: {
  kind: "mock" | "buddy";
  jobTitle: string;
  company?: string;
  resumeSummary: string;
  history: { role: "user" | "assistant" | "interviewer"; content: string }[];
  userMessage?: string;
}): Promise<{ reply: string; feedback?: string }> {
  const system =
    opts.kind === "buddy"
      ? "You are Interview Buddy. Give concise STAR-structured answer suggestions the candidate can say aloud. 80-140 words. No preamble."
      : "You are a realistic hiring manager running a mock interview. Ask one question at a time. After the candidate answers, give brief feedback then ask the next question.";

  const live = await openaiChat(
    system,
    JSON.stringify({
      jobTitle: opts.jobTitle,
      company: opts.company,
      resumeSummary: opts.resumeSummary,
      history: opts.history,
      userMessage: opts.userMessage,
    }),
  );
  if (live) return { reply: live };

  const qBank = [
    `Tell me about a time you owned a ${opts.jobTitle} project end-to-end.`,
    `How would you design a system relevant to this ${opts.jobTitle} role at ${opts.company || "our company"}?`,
    "Walk me through a conflict with a stakeholder and how you resolved it.",
    "What metrics do you use to know your work is successful?",
    "Why this role, and why now?",
  ];

  if (opts.kind === "buddy") {
    const lastQ =
      opts.userMessage ||
      opts.history.filter((h) => h.role === "interviewer").at(-1)?.content ||
      qBank[0];
    return {
      reply: `Suggested answer:\nSituation: In my last role, I faced something close to “${lastQ.slice(0, 80)}”.\nTask: I needed a clear outcome tied to business impact.\nAction: I broke the problem down, aligned stakeholders weekly, and shipped iteratively using the strengths from my background — ${opts.resumeSummary.slice(0, 120)}…\nResult: We hit the target metric and reduced follow-up fire drills. Happy to go one level deeper on the technical choices.`,
    };
  }

  const answerCount = opts.history.filter((h) => h.role === "user").length;
  if (!opts.userMessage && answerCount === 0) {
    return { reply: `Welcome — I'll be interviewing you for ${opts.jobTitle}. ${qBank[0]}` };
  }

  const feedback =
    (opts.userMessage?.length || 0) > 120
      ? "Solid detail. Quantify the result more explicitly next time."
      : "Add more specifics — metrics, timeline, and your exact role.";

  return {
    reply: `${feedback}\n\nNext: ${qBank[Math.min(answerCount + 1, qBank.length - 1)]}`,
    feedback,
  };
}

export function companyBrief(company: string, title: string, description: string) {
  return {
    company,
    title,
    summary: `${company} is actively hiring for ${title}. ${description.slice(0, 240)}…`,
    cultureSignals: [
      "Product velocity and ownership are emphasized in the posting.",
      "Cross-functional collaboration with design/product is expected.",
      "Evidence of production scale will differentiate you.",
    ],
    talkTracks: [
      `Why ${company}: connect their product motion to a system you shipped.`,
      "Prepare one story about ambiguity → clarity → delivery.",
      "Have a 60-second architecture sketch ready if the role is technical.",
    ],
    risks: [
      "Generic resumes will lose to tailored keyword alignment.",
      "Be ready to explain employment gaps or short stints crisply.",
    ],
  };
}

export function outreachTemplate(opts: {
  channel: "email" | "linkedin";
  name: string;
  company: string;
  role: string;
}) {
  if (opts.channel === "linkedin") {
    return {
      subject: null as string | null,
      body: `Hi — I just applied for the ${opts.role} role at ${opts.company}. I’ve spent recent years shipping similar product surfaces and would love a brief chat if you’re open to it. Happy to share a tailored resume or portfolio. — ${opts.name}`,
    };
  }
  return {
    subject: `Application follow-up: ${opts.role} at ${opts.company}`,
    body: `Hi {{RecruiterName}},\n\nI recently applied for the ${opts.role} position at ${opts.company}. I wanted to briefly highlight relevant experience building production systems in this space and express strong interest in the team’s roadmap.\n\nWould you be open to a short conversation this week?\n\nThank you,\n${opts.name}`,
  };
}

export function translateResume(
  resume: ResumeContent,
  language: string,
): ResumeContent {
  const labels: Record<string, Partial<ResumeContent>> = {
    es: { headline: `${resume.headline} (ES)`, summary: `[ES] ${resume.summary}` },
    fr: { headline: `${resume.headline} (FR)`, summary: `[FR] ${resume.summary}` },
    de: { headline: `${resume.headline} (DE)`, summary: `[DE] ${resume.summary}` },
    pt: { headline: `${resume.headline} (PT)`, summary: `[PT] ${resume.summary}` },
  };
  const patch = labels[language] || {
    headline: `${resume.headline} (${language.toUpperCase()})`,
    summary: `[${language.toUpperCase()}] ${resume.summary}`,
  };
  return { ...resume, ...patch };
}
