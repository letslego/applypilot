import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resumeToDocx, resumeToPlainText, resumeToPrintHtml } from "@/lib/documents";
import type { ResumeContent } from "@/data/demo-resume";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "docx";
  const resumeId = url.searchParams.get("id");

  const resume = resumeId
    ? await prisma.resume.findFirst({ where: { id: resumeId, userId: user.id } })
    : await prisma.resume.findFirst({
        where: { userId: user.id, isMaster: true },
      });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const content = JSON.parse(resume.content) as ResumeContent;
  const base = (resume.title || "resume").replace(/[^\w\-]+/g, "_");

  if (format === "txt") {
    return new NextResponse(resumeToPlainText(content), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.txt"`,
      },
    });
  }

  if (format === "html" || format === "pdf") {
    // Browser print-to-PDF path — open HTML and print.
    return new NextResponse(resumeToPrintHtml(content), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...(format === "html"
          ? { "Content-Disposition": `inline; filename="${base}.html"` }
          : {}),
      },
    });
  }

  const buf = await resumeToDocx(content);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${base}.docx"`,
    },
  });
}
