"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ClipboardCopy,
  FileText,
  Loader2,
  Mail,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { CreatorHubHeader } from "@/components/creator-hub/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  acknowledgePlan,
  createDraftId,
  hasAcknowledgedPlan,
  jdSnippet,
  loadDrafts,
  saveDrafts,
  type OutreachDraft,
} from "@/components/outreach/types";
import {
  loadSavedResume,
  type ResumeData,
} from "@/components/resume-builder/types";
import { cn } from "@/lib/utils";

type GenerateResponse = {
  subject?: string;
  body?: string;
  demo?: boolean;
  error?: string;
};

export function OutreachApp() {
  const [hydrated, setHydrated] = useState(false);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [planAcked, setPlanAcked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setResume(loadSavedResume());
      setDrafts(loadDrafts());
      setPlanAcked(hasAcknowledgedPlan());
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const mailtoHref = useMemo(() => {
    if (!subject && !body) return "";
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (body) params.set("body", body);
    return `mailto:?${params.toString()}`;
  }, [subject, body]);

  function persist(next: OutreachDraft[]) {
    setDrafts(next);
    saveDrafts(next);
  }

  function flash(message: string) {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 2500);
  }

  function loadDraft(draft: OutreachDraft) {
    setActiveDraftId(draft.id);
    setJobTitle(draft.jobTitle);
    setCompany(draft.company);
    setRecruiterName(draft.recruiterName);
    setJobDescription(draft.jobDescription);
    setSubject(draft.subject);
    setBody(draft.body);
    setIsDemo(false);
  }

  function saveCurrentDraft() {
    if (!subject.trim() && !body.trim()) {
      flash("Generate or write a draft first");
      return;
    }

    const now = new Date().toISOString();
    const nextDraft: OutreachDraft = {
      id: activeDraftId ?? createDraftId(),
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      recruiterName: recruiterName.trim(),
      jobDescription: jobDescription.trim(),
      subject: subject.trim(),
      body: body.trim(),
      createdAt: now,
    };

    const existing = drafts.findIndex((item) => item.id === nextDraft.id);
    const next =
      existing >= 0
        ? drafts.map((item, index) => (index === existing ? nextDraft : item))
        : [nextDraft, ...drafts];

    setActiveDraftId(nextDraft.id);
    persist(next);
    flash("Draft saved");
  }

  function deleteDraft(id: string) {
    const next = drafts.filter((item) => item.id !== id);
    persist(next);
    if (activeDraftId === id) setActiveDraftId(null);
  }

  async function copyDraft() {
    const text = [subject, body].filter(Boolean).join("\n\n");
    if (!text) {
      flash("Nothing to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      flash("Copied to clipboard");
    } catch {
      flash("Copy failed");
    }
  }

  function requestGenerate() {
    if (!resume) return;
    if (!jobDescription.trim()) {
      flash("Paste a job description first");
      return;
    }
    if (!planAcked) {
      setPlanOpen(true);
      return;
    }
    void generate();
  }

  function acceptPlan() {
    acknowledgePlan();
    setPlanAcked(true);
    setPlanOpen(false);
    void generate();
  }

  async function generate() {
    if (!resume) return;
    if (!jobDescription.trim()) {
      flash("Paste a job description first");
      return;
    }

    setGenerating(true);
    setStatus(null);
    try {
      const response = await fetch("/api/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          company: company.trim(),
          recruiterName: recruiterName.trim(),
          jobDescription: jobDescription.trim(),
          resume,
        }),
      });
      const payload = (await response.json()) as GenerateResponse;
      if (!response.ok || !payload.subject || !payload.body) {
        flash(payload.error ?? "Could not generate a draft");
        return;
      }

      setSubject(payload.subject);
      setBody(payload.body);
      setIsDemo(Boolean(payload.demo));
      setActiveDraftId(null);
      flash(payload.demo ? "Demo draft ready" : "Draft ready");
    } catch {
      flash("Could not generate a draft");
    } finally {
      setGenerating(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
        Loading outreach…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <CreatorHubHeader active="outreach" />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8 lg:flex-row">
        {!resume ? (
          <EmptyResumeState />
        ) : (
          <>
            <section className="flex min-w-0 flex-1 flex-col gap-5">
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                  Write outreach
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Using resume for {resume.name || "your profile"}. Paste a job
                  and generate a recruiter email.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Job title" htmlFor="job-title">
                  <Input
                    id="job-title"
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    placeholder="Staff Product Designer"
                    className="h-10"
                  />
                </Field>
                <Field label="Company" htmlFor="company">
                  <Input
                    id="company"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Northline"
                    className="h-10"
                  />
                </Field>
              </div>

              <Field label="Recruiter name (optional)" htmlFor="recruiter">
                <Input
                  id="recruiter"
                  value={recruiterName}
                  onChange={(event) => setRecruiterName(event.target.value)}
                  placeholder="Alex Chen"
                  className="h-10"
                />
              </Field>

              <Field label="Job description" htmlFor="jd">
                <Textarea
                  id="jd"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the full job description…"
                  className="min-h-40"
                />
              </Field>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={requestGenerate}
                  disabled={generating}
                  className="ambient-shadow h-10 px-4"
                >
                  {generating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Generate email
                </Button>
              </div>
            </section>

            <section className="flex w-full min-w-0 flex-col gap-5 lg:max-w-xl">
              <div className="rounded-xl bg-card p-5 ring-1 ring-border/70">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold">Draft</h2>
                  {isDemo ? (
                    <span className="rounded-md bg-accent px-2 py-1 text-xs font-semibold text-primary">
                      Demo (no API key)
                    </span>
                  ) : null}
                </div>

                <Field label="Subject" htmlFor="subject">
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Generated subject appears here"
                    className="h-10"
                  />
                </Field>
                <div className="mt-4">
                  <Field label="Body" htmlFor="body">
                    <Textarea
                      id="body"
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      placeholder="Generated email appears here"
                      className="min-h-56"
                    />
                  </Field>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="h-9"
                    onClick={() => void copyDraft()}
                  >
                    <ClipboardCopy className="size-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9"
                    disabled={!mailtoHref}
                    onClick={() => {
                      if (mailtoHref) window.location.href = mailtoHref;
                    }}
                  >
                    <Mail className="size-4" />
                    Open in mail
                  </Button>
                  <Button variant="secondary" className="h-9" onClick={saveCurrentDraft}>
                    <Save className="size-4" />
                    Save draft
                  </Button>
                </div>
                {status ? (
                  <p className="mt-3 text-sm text-muted-foreground">{status}</p>
                ) : null}
              </div>

              <div>
                <h2 className="font-display mb-3 text-lg font-semibold">
                  History
                </h2>
                {drafts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Saved drafts will show up here.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {drafts.map((draft) => (
                      <li key={draft.id}>
                        <div
                          className={cn(
                            "flex items-start gap-2 rounded-lg p-3 ring-1 ring-border/70",
                            activeDraftId === draft.id
                              ? "bg-primary/5 ring-primary/30"
                              : "bg-card",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => loadDraft(draft)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="truncate text-sm font-semibold">
                              {draft.subject || "Untitled draft"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {[draft.company, draft.jobTitle]
                                .filter(Boolean)
                                .join(" · ") || jdSnippet(draft.jobDescription)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(draft.createdAt).toLocaleString()}
                            </p>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete draft"
                            onClick={() => deleteDraft(draft.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Pro — $20 / month
            </DialogTitle>
            <DialogDescription>
              Unlimited AI emails from your resume and any job description.
              This is the only plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="h-10 w-full sm:w-auto" onClick={acceptPlan}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function EmptyResumeState() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/70">
      <span className="mb-4 inline-flex rounded-lg bg-secondary p-3 text-primary">
        <FileText className="size-6" />
      </span>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Add a resume first
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Outreach writes from your saved Builder resume. Build one, then come
        back to generate a recruiter email from any job description.
      </p>
      <Button
        nativeButton={false}
        render={<Link href="/resume-builder" />}
        className="ambient-shadow mt-6 h-11 px-6"
      >
        Open resume builder
      </Button>
    </div>
  );
}
