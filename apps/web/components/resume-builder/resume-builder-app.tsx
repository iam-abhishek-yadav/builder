"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Download,
  Eye,
  FileText,
  GraduationCap,
  LayoutList,
  Pencil,
  Plus,
  Save,
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
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");

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
    setSaveMessage("Saved");
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

  const styleSwitcher = (
    <div
      className="inline-flex gap-1 rounded-lg bg-background/70 p-1 ring-1 ring-border/70"
      role="group"
      aria-label="Resume style"
    >
      {TEMPLATES.map((item) => {
        const active = template === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTemplate(item.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <div className="print:hidden">
        <CreatorHubHeader
          active="resume"
          trailing={
            <>
              {saveMessage ? (
                <span className="animate-fade-in text-xs font-semibold text-primary">
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
                  {exporting ? "Exporting…" : "Export"}
                </span>
              </Button>
              <Button type="button" onClick={saveResume}>
                <Save />
                <span className="hidden lg:inline">Save</span>
              </Button>
            </>
          }
        />
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 sm:px-8">
        <div className="print:hidden flex items-center gap-2 border-b border-border/60 py-2 lg:hidden">
          <div className="inline-flex flex-1 gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMobilePane("edit")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                mobilePane === "edit"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              <Pencil className="size-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMobilePane("preview")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                mobilePane === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              <Eye className="size-4" />
              Preview
            </button>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => void exportPdf()}
            disabled={exporting}
            aria-label="Export PDF"
          >
            <Download />
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={saveResume}
            aria-label="Save"
          >
            <Save />
          </Button>
        </div>

        <main className="flex min-h-0 flex-1 overflow-hidden">
          <section
            className={cn(
              "print:hidden no-scrollbar w-full shrink-0 overflow-y-auto border-border/60 bg-background lg:w-[min(42%,26rem)] lg:border-r xl:w-[28rem]",
              mobilePane === "preview" ? "hidden lg:block" : "block",
            )}
          >
            <div className="mx-auto max-w-xl space-y-10 py-8 lg:pr-6">
            <div className="animate-fade-up space-y-5">
              <div>
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                  Basics
                </p>
                <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight">
                  Who you are
                </h2>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="input-name">Name</Label>
                  <Input
                    id="input-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="h-11"
                    disabled={!hydrated}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-title">Title</Label>
                  <Input
                    id="input-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Role or headline"
                    className="h-11"
                    disabled={!hydrated}
                  />
                </div>
              </div>
            </div>

            {sections.map((section, index) => {
              const Icon = sectionIcon(section.type);
              const placeholders = entryPlaceholders(section.type);
              const isSummary = section.type === "summary";
              const hideSecondary =
                section.type === "skills" || section.type === "summary";

              return (
                <div
                  key={section.id}
                  className="animate-fade-up space-y-4"
                  style={{ animationDelay: `${Math.min(index + 1, 5) * 60}ms` }}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <Icon className="size-4 shrink-0 text-primary" />
                      <Input
                        value={section.title}
                        onChange={(event) =>
                          updateSection(section.id, (current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        className="font-display h-8 border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                        aria-label="Section title"
                      />
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!isSummary ? (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => addEntry(section.id)}
                          aria-label={`Add item to ${section.title}`}
                        >
                          <Plus />
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => removeSection(section.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${section.title} section`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {section.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="group relative space-y-3 rounded-xl bg-muted/50 p-4 transition-colors focus-within:bg-muted/80"
                      >
                        {!isSummary ? (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => removeEntry(section.id, entry.id)}
                            disabled={section.entries.length <= 1}
                            className="absolute top-2 right-2 text-muted-foreground opacity-100 transition-opacity hover:text-destructive disabled:opacity-30 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
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
                            className="h-9 border-0 bg-transparent px-0 font-semibold shadow-none focus-visible:ring-0"
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
                            className="h-8 border-0 bg-transparent px-0 text-sm text-primary shadow-none focus-visible:ring-0"
                          />
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
                          className="min-h-20 resize-none border-0 bg-background/80 shadow-none focus-visible:ring-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="relative pb-10">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowAddMenu((open) => !open)}
                aria-expanded={showAddMenu}
              >
                <Plus />
                Add section
              </Button>
              {showAddMenu ? (
                <div className="animate-fade-in absolute right-0 bottom-full left-0 z-10 mb-2 overflow-hidden rounded-xl border border-border bg-background shadow-[0_12px_28px_rgb(19_27_46/0.12)]">
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
          </div>
        </section>

        <section
          className={cn(
            "resume-stage no-scrollbar relative min-w-0 flex-1 overflow-y-auto print:bg-white print:p-0",
            mobilePane === "edit" ? "hidden lg:flex" : "flex",
            "flex-col",
          )}
        >
          <div className="print:hidden sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/40 bg-background/40 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <User className="size-4 text-primary" />
              <span className="font-medium">
                {name.trim() || "Untitled resume"}
              </span>
            </div>
            {styleSwitcher}
          </div>

          <div className="flex flex-1 justify-center px-4 py-8 sm:px-6 sm:py-10 print:p-0">
            <ResumePreview
              key={template}
              name={name}
              title={title}
              sections={sections}
              template={template}
              className="animate-fade-in"
            />
          </div>
        </section>
        </main>
      </div>
    </div>
  );
}
