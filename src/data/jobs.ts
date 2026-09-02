type JobSeed = {
  externalId: string;
  title: string;
  company: string;
  location: string;
  remoteType: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string;
  skills: string;
  department: string;
  seniority: string;
  source: string;
  postedAt: Date;
  url: string;
};

const companies = [
  "Stripe",
  "Notion",
  "Figma",
  "Airbnb",
  "Shopify",
  "Linear",
  "Vercel",
  "Datadog",
  "Snowflake",
  "OpenAI",
  "Anthropic",
  "Ramp",
  "Brex",
  "Coinbase",
  "Uber",
  "Lyft",
  "Netflix",
  "Spotify",
  "Dropbox",
  "Asana",
  "Canva",
  "Adobe",
  "Salesforce",
  "Twilio",
  "Cloudflare",
  "MongoDB",
  "HashiCorp",
  "GitLab",
  "Atlassian",
  "Plaid",
];

const roles = [
  {
    title: "Senior Software Engineer",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
    dept: "Engineering",
    seniority: "Senior",
    base: [160, 210],
  },
  {
    title: "Staff Frontend Engineer",
    skills: ["TypeScript", "React", "Next.js", "GraphQL", "Design Systems"],
    dept: "Engineering",
    seniority: "Staff",
    base: [190, 250],
  },
  {
    title: "Backend Engineer",
    skills: ["Go", "PostgreSQL", "Kubernetes", "gRPC", "AWS"],
    dept: "Engineering",
    seniority: "Mid",
    base: [140, 185],
  },
  {
    title: "Full-Stack Engineer",
    skills: ["TypeScript", "React", "Node.js", "SQL", "Docker"],
    dept: "Engineering",
    seniority: "Mid",
    base: [145, 190],
  },
  {
    title: "ML Platform Engineer",
    skills: ["Python", "PyTorch", "Kubernetes", "AWS", "Spark"],
    dept: "ML",
    seniority: "Senior",
    base: [175, 240],
  },
  {
    title: "Product Manager, Growth",
    skills: ["Product Strategy", "A/B Testing", "SQL", "Analytics", "Roadmapping"],
    dept: "Product",
    seniority: "Senior",
    base: [150, 200],
  },
  {
    title: "Data Scientist",
    skills: ["Python", "SQL", "Machine Learning", "Experimentation", "Statistics"],
    dept: "Data",
    seniority: "Mid",
    base: [140, 185],
  },
  {
    title: "DevOps Engineer",
    skills: ["Terraform", "Kubernetes", "AWS", "CI/CD", "Observability"],
    dept: "Infrastructure",
    seniority: "Senior",
    base: [155, 205],
  },
  {
    title: "Engineering Manager",
    skills: ["Leadership", "System Design", "Hiring", "TypeScript", "Roadmapping"],
    dept: "Engineering",
    seniority: "Manager",
    base: [190, 250],
  },
  {
    title: "Security Engineer",
    skills: ["Application Security", "AWS", "Python", "Threat Modeling", "IAM"],
    dept: "Security",
    seniority: "Senior",
    base: [165, 220],
  },
];

const locations = [
  { city: "San Francisco, CA", remote: "hybrid" },
  { city: "New York, NY", remote: "hybrid" },
  { city: "Remote (US)", remote: "remote" },
  { city: "Austin, TX", remote: "onsite" },
  { city: "Seattle, WA", remote: "hybrid" },
  { city: "Remote (Worldwide)", remote: "remote" },
  { city: "London, UK", remote: "hybrid" },
  { city: "Chicago, IL", remote: "onsite" },
];

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600000);
}

export const JOBS_SEED: JobSeed[] = [];

let n = 0;
for (const company of companies) {
  for (let r = 0; r < 3; r++) {
    const role = roles[(n + r) % roles.length];
    const loc = locations[(n + r * 3) % locations.length];
    const id = `job-${n}-${r}`;
    const salaryMin = role.base[0] * 1000 + (n % 5) * 2000;
    const salaryMax = role.base[1] * 1000 + (n % 4) * 3000;
    JOBS_SEED.push({
      externalId: id,
      title: role.title,
      company,
      location: loc.city,
      remoteType: loc.remote,
      salaryMin,
      salaryMax,
      description: `${company} is hiring a ${role.title} to join our ${role.dept} team. You will design, build, and ship product that millions of customers rely on. We value clarity, ownership, and craft.\n\nYou will partner with design and product to deliver end-to-end features, improve reliability, and mentor peers. Ideal candidates bring strong fundamentals, taste for simple systems, and a bias for measurable impact.`,
      requirements: JSON.stringify([
        `${3 + (n % 6)}+ years of professional experience`,
        `Strong proficiency in ${role.skills.slice(0, 3).join(", ")}`,
        "Excellent written and verbal communication",
        "Experience shipping production systems at scale",
        "Bachelor's degree or equivalent practical experience",
      ]),
      skills: JSON.stringify(role.skills),
      department: role.dept,
      seniority: role.seniority,
      source: ["LinkedIn", "Greenhouse", "Lever", "Company Career Page", "Indeed"][
        n % 5
      ],
      postedAt: hoursAgo((n * 3 + r * 7) % 120),
      url: `https://careers.example.com/${company.toLowerCase()}/${id}`,
    });
    n++;
  }
}
