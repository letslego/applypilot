"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { ResumePreview } from "@/components/resume-preview";
import { DocumentsSelect } from "@/components/documents-shared";
import type { ResumeContent } from "@/data/demo-resume";
import { DEMO_RESUME } from "@/data/demo-resume";
import { formatDate } from "@/lib/utils";
import { Languages, Loader2, Printer, Save, Sparkles, Wand2, X, Import } from "lucide-react";

type ResumeRow = {
  id: string;
  title: string;
  isMaster: boolean;
  language: string;
  tailoredFor: string | null;
  updatedAt: string;
  content: ResumeContent;
};

type JobRow = {
  id: string;
  title: string;
  company: string;
  match?: { score: number } | null;
};

const LANGS = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
] as const;

function emptyResume(): ResumeContent {
  return structuredClone(DEMO_RESUME);
}

export default function ResumeBuilderPage() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [title, setTitle] = useState("Untitled Resume");
  const [content, setContent] = useState<ResumeContent>(emptyResume);
  const [skillsText, setSkillsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tailorJobId, setTailorJobId] = useState("");
  const [translateLang, setTranslateLang] = useState("es");
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rRes, jRes] = await Promise.all([
        fetch("/api/resumes"),
        fetch("/api/jobs"),
      ]);
      if (!rRes.ok) throw new Error("Could not load resumes");
      const rData = await rRes.json();
      const list = (rData.resumes || []) as ResumeRow[];
      setResumes(list);

      if (jRes.ok) {
        const jData = await jRes.json();
        setJobs((jData.jobs || []).slice(0, 40));
      }

      if (list.length) {
        const pick =
          list.find((r) => r.id === selectedId) ||
          list.find((r) => r.isMaster) ||
          list[0];
        setSelectedId(pick.id);
        setTitle(pick.title);
        setContent(pick.content);
        setSkillsText(pick.content.skills.join(", "));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    void load();
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectResume(id: string) {
    const row = resumes.find((r) => r.id === id);
    if (!row) return;
    setSelectedId(id);
    setTitle(row.title);
    setContent(row.content);
    setSkillsText(row.content.skills.join(", "));
    setMessage(null);
    setError(null);
  }

  function patchContent(patch: Partial<ResumeContent>) {
    setContent((prev) => ({ ...prev, ...patch }));
  }

  function updateExperience(
    index: number,
    patch: Partial<ResumeContent["experience"][number]>,
  ) {
    setContent((prev) => {
      const experience = prev.experience.map((exp, i) =>
        i === index ? { ...exp, ...patch } : exp,
      );
      return { ...prev, experience };
    });
  }

  function updateBullet(expIndex: number, bulletIndex: number, value: string) {
    setContent((prev) => {
      const experience = prev.experience.map((exp, i) => {
        if (i !== expIndex) return exp;
        const bullets = exp.bullets.map((b, bi) => (bi === bulletIndex ? value : b));
        return { ...exp, bullets };
      });
      return { ...prev, experience };
    });
  }

  function addBullet(expIndex: number) {
    setContent((prev) => {
      const experience = prev.experience.map((exp, i) =>
        i === expIndex ? { ...exp, bullets: [...exp.bullets, ""] } : exp,
      );
      return { ...prev, experience };
    });
  }

  function removeBullet(expIndex: number, bulletIndex: number) {
    setContent((prev) => {
      const experience = prev.experience.map((exp, i) => {
        if (i !== expIndex) return exp;
        return {
          ...exp,
          bullets: exp.bullets.filter((_, bi) => bi !== bulletIndex),
        };
      });
      return { ...prev, experience };
    });
  }

  function applySkillsText(text: string) {
    setSkillsText(text);
    const skills = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    patchContent({ skills });
  }

  async function saveResume() {
    setBusy("save");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          id: selectedId || undefined,
          title,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("Resume saved");
      const refreshed = await fetch("/api/resumes");
      const rData = await refreshed.json();
      const list = (rData.resumes || []) as ResumeRow[];
      setResumes(list);
      const savedId = data.resume?.id as string;
      if (savedId) {
        setSelectedId(savedId);
        const row = list.find((r) => r.id === savedId);
        if (row) {
          setTitle(row.title);
          setContent(row.content);
          setSkillsText(row.content.skills.join(", "));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  }

  async function importLinkedIn() {
    setBusy("import");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import-linkedin", text: importText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setShowImport(false);
      setImportText("");
      setMessage("Imported LinkedIn paste into a new resume variant.");
      await load();
      if (data.resume?.id) {
        setSelectedId(data.resume.id);
        setTitle(data.resume.title);
        setContent(data.resume.content);
        setSkillsText(data.resume.content.skills.join(", "));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(null);
    }
  }

  async function tailorResume() {
    if (!selectedId || !tailorJobId) {
      setError("Pick a resume and a job to tailor against");
      return;
    }
    setBusy("tailor");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tailor",
          resumeId: selectedId,
          jobId: tailorJobId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tailor failed");
      const tailored = data.resume as ResumeRow;
      setMessage(`Created tailored version: ${tailored.title}`);
      const refreshed = await fetch("/api/resumes");
      const rData = await refreshed.json();
      const list = (rData.resumes || []) as ResumeRow[];
      setResumes(list);
      setSelectedId(tailored.id);
      setTitle(tailored.title);
      setContent(tailored.content);
      setSkillsText(tailored.content.skills.join(", "));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tailor failed");
    } finally {
      setBusy(null);
    }
  }

  async function translateResume() {
    if (!selectedId) {
      setError("Select a resume first");
      return;
    }
    setBusy("translate");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          resumeId: selectedId,
          language: translateLang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translate failed");
      const translated = data.resume as ResumeRow;
      setMessage(`Created ${translateLang.toUpperCase()} translation`);
      const refreshed = await fetch("/api/resumes");
      const rData = await refreshed.json();
      const list = (rData.resumes || []) as ResumeRow[];
      setResumes(list);
      setSelectedId(translated.id);
      setTitle(translated.title);
      setContent(translated.content);
      setSkillsText(translated.content.skills.join(", "));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Translate failed");
    } finally {
      setBusy(null);
    }
  }

  const selectedMeta = useMemo(
    () => resumes.find((r) => r.id === selectedId),
    [resumes, selectedId],
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink/55">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-teal-700" />
        Loading resumes…
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Resume Builder"
        subtitle="Edit your master profile, tailor for a role, or translate — then print a clean ATS-friendly PDF."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowImport(true)}
            >
              <Import className="h-4 w-4" />
              Import paste
            </Button>
            <a href="/api/resumes/export?format=docx">
              <Button type="button" variant="secondary">
                DOCX
              </Button>
            </a>
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.print()}
              disabled={!content}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button type="button" onClick={saveResume} disabled={busy === "save"}>
              {busy === "save" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        }
      />

      {showImport ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <Card className="max-h-[90vh] w-full max-w-xl overflow-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Import LinkedIn paste</h2>
              <button type="button" onClick={() => setShowImport(false)}>
                <X className="h-5 w-5 text-ink/50" />
              </button>
            </div>
            <p className="mt-2 text-sm text-ink/60">
              Paste your public profile text (About, Experience, Education, Skills). We do not
              scrape LinkedIn — only content you paste.
            </p>
            <Textarea
              className="mt-3"
              rows={12}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste LinkedIn profile text here…"
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowImport(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => void importLinkedIn()}
                disabled={!importText.trim() || busy === "import"}
              >
                {busy === "import" ? "Importing…" : "Import"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {(message || error) && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            error
              ? "bg-rose-50 text-rose-900 ring-1 ring-rose-200"
              : "bg-teal-800/10 text-teal-900 ring-1 ring-teal-800/15"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="!p-4">
          <Label>Your resumes</Label>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {resumes.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => selectResume(r.id)}
                className={`min-w-[160px] shrink-0 rounded-xl border px-3 py-3 text-left transition ${
                  selectedId === r.id
                    ? "border-teal-800 bg-teal-800 text-sand-50"
                    : "border-teal-900/10 bg-white/80 text-ink hover:border-teal-700/40"
                }`}
              >
                <div className="truncate text-sm font-medium">{r.title}</div>
                <div
                  className={`mt-1 flex items-center gap-1.5 text-[11px] ${
                    selectedId === r.id ? "text-sand-50/75" : "text-ink/45"
                  }`}
                >
                  {r.isMaster ? "Master" : r.language.toUpperCase()}
                  <span>·</span>
                  {formatDate(r.updatedAt)}
                </div>
              </button>
            ))}
          </div>
        </Card>
        <Card className="flex flex-col justify-center gap-2 !p-4">
          <div className="text-sm font-medium text-ink">Active version</div>
          <div className="flex flex-wrap gap-1.5">
            {selectedMeta?.isMaster ? (
              <Badge className="bg-teal-800 text-sand-50">Master</Badge>
            ) : null}
            {selectedMeta?.tailoredFor ? (
              <Badge className="bg-sand-100 text-teal-900">Tailored</Badge>
            ) : null}
            <Badge className="bg-white text-ink/70 ring-1 ring-teal-900/10">
              {(selectedMeta?.language || "en").toUpperCase()}
            </Badge>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Resume title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={content.fullName}
                  onChange={(e) => patchContent({ fullName: e.target.value })}
                />
              </div>
              <div>
                <Label>Headline</Label>
                <Input
                  value={content.headline}
                  onChange={(e) => patchContent({ headline: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Summary</Label>
                <Textarea
                  rows={4}
                  value={content.summary}
                  onChange={(e) => patchContent({ summary: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Skills (comma-separated)</Label>
                <Textarea
                  rows={2}
                  value={skillsText}
                  onChange={(e) => applySkillsText(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {content.experience.map((exp, expIndex) => (
            <Card key={`${exp.company}-${expIndex}`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-display text-lg text-ink">Experience</h3>
                <span className="text-xs text-ink/45">Role {expIndex + 1}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) =>
                      updateExperience(expIndex, { title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(expIndex, { company: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Start</Label>
                  <Input
                    value={exp.start}
                    onChange={(e) =>
                      updateExperience(expIndex, { start: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>End</Label>
                  <Input
                    value={exp.end}
                    onChange={(e) =>
                      updateExperience(expIndex, { end: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label>Bullets</Label>
                {exp.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex gap-2">
                    <Textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) =>
                        updateBullet(expIndex, bIdx, e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 self-start"
                      onClick={() => removeBullet(expIndex, bIdx)}
                      aria-label="Remove bullet"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBullet(expIndex)}
                >
                  Add bullet
                </Button>
              </div>
            </Card>
          ))}

          <Card>
            <h3 className="mb-4 font-display text-lg text-ink">AI actions</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3 rounded-xl bg-sand-50/80 p-3 ring-1 ring-teal-900/5">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Wand2 className="h-4 w-4 text-teal-700" />
                  Tailor for a job
                </div>
                <DocumentsSelect
                  label="Target role"
                  value={tailorJobId}
                  onChange={setTailorJobId}
                >
                  <option value="">Select a job…</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} @ {j.company}
                      {j.match?.score != null ? ` · ${j.match.score}%` : ""}
                    </option>
                  ))}
                </DocumentsSelect>
                <Button
                  type="button"
                  className="w-full"
                  onClick={tailorResume}
                  disabled={busy === "tailor" || !tailorJobId}
                >
                  {busy === "tailor" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Tailor resume
                </Button>
              </div>

              <div className="space-y-3 rounded-xl bg-sand-50/80 p-3 ring-1 ring-teal-900/5">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Languages className="h-4 w-4 text-teal-700" />
                  Translate
                </div>
                <DocumentsSelect
                  label="Language"
                  value={translateLang}
                  onChange={setTranslateLang}
                >
                  {LANGS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </DocumentsSelect>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={translateResume}
                  disabled={busy === "translate"}
                >
                  {busy === "translate" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Languages className="h-4 w-4" />
                  )}
                  Translate
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg text-ink">Live preview</h3>
            <span className="text-xs text-ink/45">Print targets #resume-print</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-teal-900/10 bg-sand-100/60 p-3 sm:p-4">
            <ResumePreview content={content} className="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
