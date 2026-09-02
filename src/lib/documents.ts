import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import type { ResumeContent } from "@/data/demo-resume";

export function resumeToPlainText(resume: ResumeContent): string {
  const lines: string[] = [
    resume.fullName,
    resume.headline,
    [resume.email, resume.phone, resume.location].filter(Boolean).join(" · "),
    "",
    "SUMMARY",
    resume.summary,
    "",
    "SKILLS",
    resume.skills.join(", "),
    "",
    "EXPERIENCE",
  ];
  for (const exp of resume.experience) {
    lines.push(
      `${exp.title} — ${exp.company} (${exp.start} – ${exp.end})`,
      ...exp.bullets.map((b) => `• ${b}`),
      "",
    );
  }
  if (resume.education?.length) {
    lines.push("EDUCATION");
    for (const ed of resume.education) {
      lines.push(`${ed.degree} — ${ed.school} (${ed.year})`);
    }
  }
  return lines.join("\n");
}

export async function resumeToDocx(resume: ResumeContent): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: resume.fullName, bold: true, size: 32 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: resume.headline, italics: true, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: [resume.email, resume.phone, resume.location]
            .filter(Boolean)
            .join(" · "),
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: "Summary", bold: true })],
    }),
    new Paragraph({ children: [new TextRun(resume.summary)] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: "Skills", bold: true })],
    }),
    new Paragraph({ children: [new TextRun(resume.skills.join(", "))] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: "Experience", bold: true })],
    }),
  ];

  for (const exp of resume.experience) {
    children.push(
      new Paragraph({
        spacing: { before: 160 },
        children: [
          new TextRun({
            text: `${exp.title} — ${exp.company}`,
            bold: true,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${exp.start} – ${exp.end}`,
            italics: true,
            size: 18,
          }),
        ],
      }),
      ...exp.bullets.map(
        (b) =>
          new Paragraph({
            children: [new TextRun(`• ${b}`)],
          }),
      ),
    );
  }

  if (resume.education?.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: "Education", bold: true })],
      }),
    );
    for (const ed of resume.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${ed.degree} — ${ed.school} (${ed.year})`,
            }),
          ],
        }),
      );
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}

/** Printable HTML suitable for browser PDF (window.print / headless chrome). */
export function resumeToPrintHtml(resume: ResumeContent): string {
  const exp = resume.experience
    .map(
      (e) => `
      <section>
        <h3>${escapeHtml(e.title)} — ${escapeHtml(e.company)}</h3>
        <p class="meta">${escapeHtml(e.start)} – ${escapeHtml(e.end)}</p>
        <ul>${e.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
      </section>`,
    )
    .join("");
  const edu = (resume.education || [])
    .map(
      (e) =>
        `<p>${escapeHtml(e.degree)} — ${escapeHtml(e.school)} (${escapeHtml(e.year)})</p>`,
    )
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8"/><title>${escapeHtml(resume.fullName)} Resume</title>
<style>
  body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#111;line-height:1.45}
  h1{margin:0;font-size:28px} h2{border-bottom:1px solid #ccc;font-size:14px;text-transform:uppercase;letter-spacing:.06em}
  h3{margin:12px 0 0;font-size:15px} .meta{margin:0;color:#555;font-size:13px}
  ul{margin:6px 0 0;padding-left:18px} @media print{body{margin:0}}
</style></head><body>
  <h1>${escapeHtml(resume.fullName)}</h1>
  <p class="meta">${escapeHtml(resume.headline)}<br/>${escapeHtml(
    [resume.email, resume.phone, resume.location].filter(Boolean).join(" · "),
  )}</p>
  <h2>Summary</h2><p>${escapeHtml(resume.summary)}</p>
  <h2>Skills</h2><p>${escapeHtml(resume.skills.join(", "))}</p>
  <h2>Experience</h2>${exp}
  ${edu ? `<h2>Education</h2>${edu}` : ""}
</body></html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
