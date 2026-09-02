export type ResumeContent = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: { label: string; url: string }[];
  summary: string;
  experience: {
    company: string;
    title: string;
    start: string;
    end: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree: string;
    year: string;
  }[];
  skills: string[];
};

export const DEMO_RESUME: ResumeContent = {
  fullName: "Alex Rivera",
  headline: "Senior Full-Stack Engineer",
  email: "demo@applypilot.com",
  phone: "+1 (415) 555-0142",
  location: "San Francisco, CA",
  links: [
    { label: "LinkedIn", url: "https://linkedin.com/in/alexrivera" },
    { label: "GitHub", url: "https://github.com/alexrivera" },
  ],
  summary:
    "Product-minded full-stack engineer with 8 years shipping high-growth SaaS. Expert in TypeScript, React, and Node.js. Known for turning ambiguous hiring and growth problems into reliable systems that scale.",
  experience: [
    {
      company: "Northstar Labs",
      title: "Senior Software Engineer",
      start: "2021",
      end: "Present",
      bullets: [
        "Led rebuild of candidate matching service; cut p95 latency 42% and lifted interview rate 18%.",
        "Owned Next.js + GraphQL hiring portal used by 120k monthly active job seekers.",
        "Mentored 4 engineers; established design-doc and on-call practices for the growth org.",
      ],
    },
    {
      company: "Brightly",
      title: "Full-Stack Engineer",
      start: "2018",
      end: "2021",
      bullets: [
        "Shipped ATS integrations (Greenhouse, Lever) processing 2M applications/year.",
        "Built resume parsing pipeline with 94% field accuracy using hybrid NLP heuristics.",
        "Reduced onboarding time-to-first-apply from 22 minutes to 6 with guided UX.",
      ],
    },
    {
      company: "Cascade Systems",
      title: "Software Engineer",
      start: "2016",
      end: "2018",
      bullets: [
        "Developed React dashboards and Node APIs for logistics customers across 8 regions.",
        "Introduced CI/CD with Docker; deployment frequency went from weekly to daily.",
      ],
    },
  ],
  education: [
    {
      school: "UC Berkeley",
      degree: "B.S. Computer Science",
      year: "2016",
    },
  ],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "AWS",
    "System Design",
    "Python",
    "GraphQL",
    "Docker",
    "Kubernetes",
    "A/B Testing",
  ],
};
