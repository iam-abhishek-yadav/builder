"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Download,
  FileText,
  GraduationCap,
  LayoutList,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CreatorHubHeader } from "@/components/creator-hub/header";
import { loadProfile } from "@/components/profile-creation/types";
import { ResumePreview } from "./resume-preview";
import { exportResumePdf } from "./export-resume-pdf";
import {
  createEntry,
  createSection,
  entryPlaceholders,
  isResumeTemplate,
  normalizeResumeData,
  RESUME_STORAGE_KEY,
  SECTION_CATALOG,
  type ResumeSection,
  type ResumeTemplate,
  type SectionEntry,
  type SectionType,
} from "./types";

const TEMPLATES: { id: ResumeTemplate; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
];

function sectionIcon(type: SectionType) {
  switch (type) {
    case "education":
      return GraduationCap;
    case "skills":
      return Wrench;
    case "summary":
      return LayoutList;
    default:
      return FileText;
  }
}

export function ResumeBuilderApp() {
  const searchParams = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<ResumeSection[]>(() => [
    createSection("summary"),
    createSection("experience"),
    createSection("education"),
    createSection("skills"),
  ]);
  const [template, setTemplate] = useState<ResumeTemplate>("executive");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      const raw = localStorage.getItem(RESUME_STORAGE_KEY);
      let saved = {};
      if (raw) {
        try {
          saved = JSON.parse(raw) as object;
        } catch {
          saved = {};
        }
      }

      const data = normalizeResumeData(saved);
      const profile = loadProfile();

      setName(data.name || profile.name || "");
      setTitle(data.title || profile.title || "");
      setSections(
        data.sections.map((section) => {
          if (
            section.type === "summary" &&
            profile.bio &&
            !section.entries[0]?.description?.trim()
          ) {
            return {
              ...section,
              entries: [
                {
                  ...section.entries[0],
                  id: section.entries[0]?.id ?? `${Date.now()}`,
                  primary: section.entries[0]?.primary ?? "",
                  secondary: section.entries[0]?.secondary ?? "",
                  description: profile.bio,
                },
              ],
            };
          }
          return section;
        }),
      );

      const fromUrl = searchParams.get("template");
      if (isResumeTemplate(fromUrl)) {
        setTemplate(fromUrl);
      } else {
        setTemplate(data.template);
      }

      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const updateSection = useCallback(
    (sectionId: string, updater: (section: ResumeSection) => ResumeSection) => {
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId ? updater(section) : section,
        ),
      );
    },
    [],
  );

  const addSection = useCallback((type: SectionType) => {
    setSections((prev) => [...prev, createSection(type)]);
    setShowAddMenu(false);
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  }, []);

  const addEntry = useCallback(
    (sectionId: string) => {
      updateSection(sectionId, (section) => ({
        ...section,
        entries: [...section.entries, createEntry()],
      }));
    },
    [updateSection],
  );

  const removeEntry = useCallback(
    (sectionId: string, entryId: string) => {
      updateSection(sectionId, (section) => ({
        ...section,
        entries:
          section.entries.length <= 1
            ? section.entries
            : section.entries.filter((entry) => entry.id !== entryId),
      }));
    },
    [updateSection],
  );

  const updateEntry = useCallback(
    (
      sectionId: string,
      entryId: string,
      field: keyof Omit<SectionEntry, "id">,
      value: string,
    ) => {
      updateSection(sectionId, (section) => ({
        ...section,
        entries: section.entries.map((entry) =>
          entry.id === entryId ? { ...entry, [field]: value } : entry,
        ),
      }));
    },
    [updateSection],
  );

  function saveResume() {
    const payload = { name, title, sections, template };
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(payload));
    setSaveMessage("Saved locally");
    window.setTimeout(() => setSaveMessage(null), 2000);
  }

  async function exportPdf() {
    if (exporting) return;
    setExporting(true);
    try {
      await exportResumePdf(name);
    } catch (error) {
      console.error(error);
      setSaveMessage("Export failed");
      window.setTimeout(() => setSaveMessage(null), 2500);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <div className="print:hidden">
        <CreatorHubHeader
          active="resume"
          trailing={
            <>
              {saveMessage ? (
                <span className="text-xs font-semibold text-primary">
                  {saveMessage}
                </span>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                onClick={() => void exportPdf()}
                disabled={exporting}
                className="text-muted-foreground"
              >
                <Download />
                <span className="hidden lg:inline">
                  {exporting ? "Exporting…" : "Export PDF"}
                </span>
              </Button>
              <Button type="button" variant="ghost" onClick={saveResume}>
                <Save />
                <span className="hidden lg:inline">Save</span>
              </Button>
            </>
          }
        />
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="print:hidden">
          <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-2 sm:px-8">
            <div className="flex gap-1 rounded-full bg-accent p-1">
              {TEMPLATES.map((item) => {
                const active = template === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTemplate(item.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
                      active
                        ? "bg-white text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="ml-auto flex items-center gap-1 sm:hidden">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void exportPdf()}
                disabled={exporting}
                aria-label="Export PDF"
              >
                <Download />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={saveResume}
                aria-label="Save"
              >
                <Save />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <section className="print:hidden no-scrollbar w-full shrink-0 space-y-8 overflow-y-auto border-r border-border bg-background p-4 sm:p-8 lg:w-[480px]">
            <div>
              <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-semibold">
                <User className="size-5 text-primary" />
                Basics
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input-name">Name</Label>
                  <Input
                    id="input-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Name"
                    className="h-11 bg-white"
                    disabled={!hydrated}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-title">Title</Label>
                  <Input
                    id="input-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Title"
                    className="h-11 bg-white"
                    disabled={!hydrated}
                  />
                </div>
              </div>
            </div>

            {sections.map((section) => {
              const Icon = sectionIcon(section.type);
              const placeholders = entryPlaceholders(section.type);
              const isSummary = section.type === "summary";
              const hideSecondary =
                section.type === "skills" || section.type === "summary";

              return (
                <div key={section.id} className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="size-5 shrink-0 text-primary" />
                        <Input
                          value={section.title}
                          onChange={(event) =>
                            updateSection(section.id, (current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          className="font-display h-9 border-0 bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
                          aria-label="Section title"
                        />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!isSummary ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          onClick={() => addEntry(section.id)}
                          aria-label={`Add item to ${section.title}`}
                        >
                          <Plus />
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeSection(section.id)}
                        className="text-destructive"
                        aria-label={`Remove ${section.title} section`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {section.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="group relative space-y-3 rounded-xl border border-border bg-white p-4"
                      >
                        {!isSummary ? (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => removeEntry(section.id, entry.id)}
                            disabled={section.entries.length <= 1}
                            className="absolute top-2 right-2 text-destructive opacity-100 transition-opacity disabled:opacity-30 sm:opacity-0 sm:group-hover:opacity-100"
                            aria-label="Remove entry"
                          >
                            <Trash2 />
                          </Button>
                        ) : null}

                        {!isSummary ? (
                          <Input
                            value={entry.primary}
                            onChange={(event) =>
                              updateEntry(
                                section.id,
                                entry.id,
                                "primary",
                                event.target.value,
                              )
                            }
                            placeholder={placeholders.primary}
                            className="border-0 bg-transparent px-0 font-bold shadow-none focus-visible:ring-0"
                          />
                        ) : null}

                        {!hideSecondary ? (
                          <Input
                            value={entry.secondary}
                            onChange={(event) =>
                              updateEntry(
                                section.id,
                                entry.id,
                                "secondary",
                                event.target.value,
                              )
                            }
                            placeholder={placeholders.secondary}
                            className="border-0 bg-transparent px-0 text-primary shadow-none focus-visible:ring-0"
                          />
                        ) : null}

                        {section.type === "experience" ? (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                              Description
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                              <Sparkles className="size-3.5" />
                              AI Refine · Coming soon
                            </span>
                          </div>
                        ) : null}

                        <Textarea
                          value={entry.description}
                          onChange={(event) =>
                            updateEntry(
                              section.id,
                              entry.id,
                              "description",
                              event.target.value,
                            )
                          }
                          rows={isSummary ? 4 : 3}
                          placeholder={placeholders.description}
                          className="min-h-20 resize-none bg-muted/40"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="relative pb-8">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowAddMenu((open) => !open)}
              >
                <Plus />
                Add section
              </Button>
              {showAddMenu ? (
                <div className="absolute right-0 bottom-full left-0 z-10 mb-2 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                  {SECTION_CATALOG.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      className="flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted"
                      onClick={() => addSection(item.type)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className="no-scrollbar flex flex-1 flex-col items-center overflow-y-auto bg-muted p-4 sm:p-8 print:bg-white print:p-0">
            <ResumePreview
              name={name}
              title={title}
              sections={sections}
              template={template}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
