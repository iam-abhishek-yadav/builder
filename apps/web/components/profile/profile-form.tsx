"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveProfileAction } from "@/app/profile/actions";
import { DateField } from "@/components/profile/date-field";
import { DownloadResumeButton } from "@/components/profile/download-resume-button";
import { MultiListCombobox, SelectedChips, SingleListCombobox } from "@/components/profile/list-combobox";
import type { JobProfileData } from "@/lib/job-profile";
import { formatDateRange } from "@/lib/format-date";
import { LANGUAGE_OPTIONS, SKILL_OPTIONS } from "@/lib/profile-options";

const OPEN_TO = [
  { value: "internship", label: "Internship" },
  { value: "full_time", label: "Full-time" },
  { value: "contract", label: "Contract" },
  { value: "not_looking", label: "Not looking" },
] as const;

const PROFICIENCIES = [
  { value: "basic", label: "Basic" },
  { value: "conversational", label: "Conversational" },
  { value: "fluent", label: "Fluent" },
  { value: "native", label: "Native" },
] as const;

const YEAR_OPTIONS = Array.from({ length: 61 }, (_, year) => year);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, month) => month);

const emptyExperience: JobProfileData["experiences"][number] = {
  title: "",
  organization: "",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
};

const emptyEducation: JobProfileData["educations"][number] = {
  school: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  description: "",
};

const emptyProject: JobProfileData["projects"][number] = {
  name: "",
  description: "",
  liveUrl: "",
  githubUrl: "",
  tags: "",
  startDate: "",
  endDate: "",
};

const emptyCertification: JobProfileData["certifications"][number] = {
  name: "",
  issuer: "",
  issuedAt: "",
  expiresAt: "",
  credentialUrl: "",
};

const emptyLanguage: JobProfileData["languages"][number] = {
  name: "",
  proficiency: "fluent",
};

const emptyAward: JobProfileData["awards"][number] = {
  title: "",
  issuer: "",
  awardedAt: "",
  description: "",
  url: "",
};

const emptyPublication: JobProfileData["publications"][number] = {
  title: "",
  venue: "",
  publishedAt: "",
  description: "",
  url: "",
};

const emptyVolunteer: JobProfileData["volunteerRoles"][number] = {
  title: "",
  organization: "",
  startDate: "",
  endDate: "",
  description: "",
  url: "",
};

type Editor =
  | { kind: "experience"; index: number | null; draft: JobProfileData["experiences"][number] }
  | { kind: "education"; index: number | null; draft: JobProfileData["educations"][number] }
  | { kind: "project"; index: number | null; draft: JobProfileData["projects"][number] }
  | {
      kind: "certification";
      index: number | null;
      draft: JobProfileData["certifications"][number];
    }
  | { kind: "language"; index: number | null; draft: JobProfileData["languages"][number] }
  | { kind: "award"; index: number | null; draft: JobProfileData["awards"][number] }
  | { kind: "publication"; index: number | null; draft: JobProfileData["publications"][number] }
  | {
      kind: "volunteer";
      index: number | null;
      draft: JobProfileData["volunteerRoles"][number];
    };

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
    </div>
  );
}

function Section({
  title,
  description,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  description: string;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function ItemCard({
  title,
  subtitle,
  body,
  onEdit,
  onRemove,
}: {
  title: string;
  subtitle?: string;
  body?: string;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title || "Untitled"}</p>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
        {body ? (
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
            {body}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}

function editorCopy(editor: Editor) {
  switch (editor.kind) {
    case "experience":
      return editor.index === null ? "Add role" : "Edit role";
    case "education":
      return editor.index === null ? "Add education" : "Edit education";
    case "project":
      return editor.index === null ? "Add project" : "Edit project";
    case "certification":
      return editor.index === null ? "Add certification" : "Edit certification";
    case "language":
      return editor.index === null ? "Add language" : "Edit language";
    case "award":
      return editor.index === null ? "Add award" : "Edit award";
    case "publication":
      return editor.index === null ? "Add publication" : "Edit publication";
    case "volunteer":
      return editor.index === null ? "Add volunteer role" : "Edit volunteer role";
  }
}

function canSaveEditor(editor: Editor) {
  switch (editor.kind) {
    case "experience":
    case "volunteer":
      return Boolean(editor.draft.title.trim() && editor.draft.organization.trim());
    case "education":
      return Boolean(editor.draft.school.trim());
    case "project":
    case "certification":
      return Boolean(editor.draft.name.trim());
    case "language":
      return Boolean(editor.draft.name.trim());
    case "award":
    case "publication":
      return Boolean(editor.draft.title.trim());
  }
}

export function ProfileForm({
  initial,
  email,
}: {
  initial: JobProfileData;
  email: string;
}) {
  const [data, setData] = useState(initial);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof JobProfileData>(key: K, value: JobProfileData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function removeAt<K extends keyof JobProfileData>(key: K, index: number) {
    setData((current) => ({
      ...current,
      [key]: (current[key] as unknown[]).filter((_, i) => i !== index),
    }));
  }

  function saveEditor() {
    if (!editor || !canSaveEditor(editor)) {
      return;
    }

    setData((current) => {
      switch (editor.kind) {
        case "experience": {
          const next = {
            ...editor.draft,
            endDate: editor.draft.isCurrent ? "" : editor.draft.endDate,
          };
          const list = [...current.experiences];
          if (editor.index === null) list.push(next);
          else list[editor.index] = next;
          if (!next.isCurrent) {
            return { ...current, experiences: list };
          }
          const currentIndex = editor.index === null ? list.length - 1 : editor.index;
          return {
            ...current,
            experiences: list.map((item, index) => ({
              ...item,
              isCurrent: index === currentIndex,
              endDate: index === currentIndex ? "" : item.endDate,
            })),
          };
        }
        case "education": {
          const list = [...current.educations];
          if (editor.index === null) list.push(editor.draft);
          else list[editor.index] = editor.draft;
          return { ...current, educations: list };
        }
        case "project": {
          const list = [...current.projects];
          if (editor.index === null) list.push(editor.draft);
          else list[editor.index] = editor.draft;
          return { ...current, projects: list };
        }
        case "certification": {
          const list = [...current.certifications];
          if (editor.index === null) list.push(editor.draft);
          else list[editor.index] = editor.draft;
          return { ...current, certifications: list };
        }
        case "language": {
          const list = [...current.languages];
          if (editor.index === null) list.push(editor.draft);
          else list[editor.index] = editor.draft;
          return { ...current, languages: list };
        }
        case "award": {
          const list = [...current.awards];
          if (editor.index === null) list.push(editor.draft);
          else list[editor.index] = editor.draft;
          return { ...current, awards: list };
        }
        case "publication": {
          const list = [...current.publications];
          if (editor.index === null) list.push(editor.draft);
          else list[editor.index] = editor.draft;
          return { ...current, publications: list };
        }
        case "volunteer": {
          const list = [...current.volunteerRoles];
          if (editor.index === null) list.push(editor.draft);
          else list[editor.index] = editor.draft;
          return { ...current, volunteerRoles: list };
        }
      }
    });
    setEditor(null);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await saveProfileAction(data);
      if (result.ok) {
        setMessage("Profile saved.");
      } else {
        setError(result.error ?? "Could not save.");
      }
    });
  }

  return (
    <>
      <form onSubmit={onSubmit} className="grid gap-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Identity
          </h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            How you show up. Email comes from your account.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input
                value={data.name ?? ""}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Your name"
              />
            </Field>
            <Field label="Email">
              <Input value={email} disabled readOnly />
            </Field>
            <Field label="Headline">
              <Input
                value={data.headline}
                onChange={(event) => update("headline", event.target.value)}
                placeholder="Frontend engineer"
              />
            </Field>
            <Field label="Location">
              <Input
                value={data.location}
                onChange={(event) => update("location", event.target.value)}
                placeholder="Bengaluru, India"
              />
            </Field>
            <div className="grid gap-1.5">
              <Label>
                Experience
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={String(data.experienceYears)}
                  onValueChange={(value) =>
                    update("experienceYears", Number(value ?? 0))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year} {year === 1 ? "year" : "years"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(data.experienceMonths)}
                  onValueChange={(value) =>
                    update("experienceMonths", Number(value ?? 0))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((month) => (
                      <SelectItem key={month} value={String(month)}>
                        {month} {month === 1 ? "month" : "months"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="md:col-span-2">
              <Field label="Bio">
                <Textarea
                  value={data.bio}
                  onChange={(event) => update("bio", event.target.value)}
                  placeholder="A few sentences about your work."
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Skills">
                <MultiListCombobox
                  items={SKILL_OPTIONS}
                  value={data.skills}
                  onChange={(skills) => update("skills", skills)}
                  placeholder="Search skills"
                />
              </Field>
            </div>
            <div className="grid gap-1.5 md:col-span-2">
              <Label>Open to</Label>
              <div className="flex flex-nowrap items-center gap-4 overflow-x-auto pt-1">
                {OPEN_TO.map((item) => (
                  <label
                    key={item.value}
                    className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap"
                  >
                    <Checkbox
                      checked={data.openTo.includes(item.value)}
                      onCheckedChange={(checked) => {
                        update(
                          "openTo",
                          checked
                            ? [...data.openTo, item.value]
                            : data.openTo.filter((value) => value !== item.value),
                        );
                      }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
            <Field label="LinkedIn">
              <Input
                value={data.linkedinUrl}
                onChange={(event) => update("linkedinUrl", event.target.value)}
              />
            </Field>
            <Field label="GitHub">
              <Input
                value={data.githubUrl}
                onChange={(event) => update("githubUrl", event.target.value)}
              />
            </Field>
            <Field label="Portfolio">
              <Input
                value={data.portfolioUrl}
                onChange={(event) => update("portfolioUrl", event.target.value)}
              />
            </Field>
            <Field label="X">
              <Input
                value={data.xUrl}
                onChange={(event) => update("xUrl", event.target.value)}
              />
            </Field>
          </div>
        </section>

        <Section
          title="Experience"
          description="Roles, internships, and work history."
          addLabel="Add role"
          onAdd={() =>
            setEditor({
              kind: "experience",
              index: null,
              draft: { ...emptyExperience },
            })
          }
        >
          {data.experiences.length === 0 ? (
            <p className="text-sm text-muted-foreground">No roles yet.</p>
          ) : (
            data.experiences.map((item, index) => (
              <ItemCard
                key={`exp-${index}`}
                title={item.title}
                subtitle={[
                  item.organization,
                  item.location,
                  formatDateRange(item.startDate, item.endDate, item.isCurrent),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                body={item.description}
                onEdit={() =>
                  setEditor({
                    kind: "experience",
                    index,
                    draft: { ...item },
                  })
                }
                onRemove={() => removeAt("experiences", index)}
              />
            ))
          )}
        </Section>

        <Section
          title="Projects"
          description="Work you can link to — live site and GitHub."
          addLabel="Add project"
          onAdd={() =>
            setEditor({
              kind: "project",
              index: null,
              draft: { ...emptyProject },
            })
          }
        >
          {data.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            data.projects.map((item, index) => (
              <ItemCard
                key={`proj-${index}`}
                title={item.name}
                subtitle={item.tags || item.liveUrl || item.githubUrl}
                body={item.description}
                onEdit={() =>
                  setEditor({ kind: "project", index, draft: { ...item } })
                }
                onRemove={() => removeAt("projects", index)}
              />
            ))
          )}
        </Section>

        <Section
          title="Certifications"
          description="Credentials with a verification URL."
          addLabel="Add certification"
          onAdd={() =>
            setEditor({
              kind: "certification",
              index: null,
              draft: { ...emptyCertification },
            })
          }
        >
          {data.certifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No certifications yet.</p>
          ) : (
            data.certifications.map((item, index) => (
              <ItemCard
                key={`cert-${index}`}
                title={item.name}
                subtitle={item.issuer}
                onEdit={() =>
                  setEditor({
                    kind: "certification",
                    index,
                    draft: { ...item },
                  })
                }
                onRemove={() => removeAt("certifications", index)}
              />
            ))
          )}
        </Section>

        <Section
          title="Education"
          description="School, degree, and field."
          addLabel="Add education"
          onAdd={() =>
            setEditor({
              kind: "education",
              index: null,
              draft: { ...emptyEducation },
            })
          }
        >
          {data.educations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No education yet.</p>
          ) : (
            data.educations.map((item, index) => (
              <ItemCard
                key={`edu-${index}`}
                title={item.school}
                subtitle={[
                  item.degree,
                  item.field,
                  formatDateRange(item.startDate, item.endDate),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                body={item.description}
                onEdit={() =>
                  setEditor({ kind: "education", index, draft: { ...item } })
                }
                onRemove={() => removeAt("educations", index)}
              />
            ))
          )}
        </Section>

        <Section
          title="Languages"
          description="Spoken and signed languages. Pick from the list."
          addLabel="Add language"
          onAdd={() =>
            setEditor({
              kind: "language",
              index: null,
              draft: { ...emptyLanguage },
            })
          }
        >
          {data.languages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No languages yet.</p>
          ) : (
            <SelectedChips
              items={data.languages.map((item, index) => ({
                key: String(index),
                label: `${item.name} · ${
                  PROFICIENCIES.find((level) => level.value === item.proficiency)
                    ?.label ?? item.proficiency
                }`,
              }))}
              onSelect={(key) => {
                const index = Number(key);
                setEditor({
                  kind: "language",
                  index,
                  draft: { ...data.languages[index] },
                });
              }}
              onRemove={(key) => removeAt("languages", Number(key))}
            />
          )}
        </Section>

        <Section
          title="Awards"
          description="Honors, with an optional URL."
          addLabel="Add award"
          onAdd={() =>
            setEditor({
              kind: "award",
              index: null,
              draft: { ...emptyAward },
            })
          }
        >
          {data.awards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No awards yet.</p>
          ) : (
            data.awards.map((item, index) => (
              <ItemCard
                key={`award-${index}`}
                title={item.title}
                subtitle={item.issuer}
                body={item.description}
                onEdit={() =>
                  setEditor({ kind: "award", index, draft: { ...item } })
                }
                onRemove={() => removeAt("awards", index)}
              />
            ))
          )}
        </Section>

        <Section
          title="Publications"
          description="Writing and talks, with a URL."
          addLabel="Add publication"
          onAdd={() =>
            setEditor({
              kind: "publication",
              index: null,
              draft: { ...emptyPublication },
            })
          }
        >
          {data.publications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No publications yet.</p>
          ) : (
            data.publications.map((item, index) => (
              <ItemCard
                key={`pub-${index}`}
                title={item.title}
                subtitle={item.venue}
                body={item.description}
                onEdit={() =>
                  setEditor({ kind: "publication", index, draft: { ...item } })
                }
                onRemove={() => removeAt("publications", index)}
              />
            ))
          )}
        </Section>

        <Section
          title="Volunteer"
          description="Community work, with an optional URL."
          addLabel="Add volunteer role"
          onAdd={() =>
            setEditor({
              kind: "volunteer",
              index: null,
              draft: { ...emptyVolunteer },
            })
          }
        >
          {data.volunteerRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No volunteer roles yet.</p>
          ) : (
            data.volunteerRoles.map((item, index) => (
              <ItemCard
                key={`vol-${index}`}
                title={item.title}
                subtitle={[
                  item.organization,
                  formatDateRange(item.startDate, item.endDate),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                body={item.description}
                onEdit={() =>
                  setEditor({ kind: "volunteer", index, draft: { ...item } })
                }
                onRemove={() => removeAt("volunteerRoles", index)}
              />
            ))
          )}
        </Section>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending} className="h-10 px-6">
            {pending ? "Saving…" : "Save profile"}
          </Button>
          <DownloadResumeButton />
          {message ? <p className="text-sm text-primary">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </form>

      <Dialog open={editor !== null} onOpenChange={(open) => !open && setEditor(null)}>
        <DialogContent className="sm:max-w-xl">
          {editor ? (
            <>
              <DialogHeader>
                <DialogTitle>{editorCopy(editor)}</DialogTitle>
                <DialogDescription>
                  Required fields are marked with an asterisk.
                </DialogDescription>
              </DialogHeader>
              <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-1">
                {editor.kind === "experience" ? (
                  <>
                    <Field label="Title" required>
                      <Input
                        value={editor.draft.title}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, title: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Organization" required>
                      <Input
                        value={editor.draft.organization}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              organization: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                    <Field label="Location">
                      <Input
                        value={editor.draft.location}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, location: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Start">
                        <DateField
                          value={editor.draft.startDate}
                          onChange={(startDate) =>
                            setEditor({
                              ...editor,
                              draft: { ...editor.draft, startDate },
                            })
                          }
                        />
                      </Field>
                      <Field label="End">
                        <DateField
                          value={editor.draft.endDate}
                          onChange={(endDate) =>
                            setEditor({
                              ...editor,
                              draft: { ...editor.draft, endDate },
                            })
                          }
                          disabled={editor.draft.isCurrent}
                          placeholder={
                            editor.draft.isCurrent ? "Present" : "Pick a date"
                          }
                        />
                      </Field>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={editor.draft.isCurrent}
                        onCheckedChange={(checked) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              isCurrent: Boolean(checked),
                              endDate: checked ? "" : editor.draft.endDate,
                            },
                          })
                        }
                      />
                      I currently work here
                    </label>
                    {editor.draft.isCurrent &&
                    data.experiences.some(
                      (item, index) => item.isCurrent && index !== editor.index,
                    ) ? (
                      <p className="text-xs text-muted-foreground">
                        This will replace your other current role.
                      </p>
                    ) : null}
                    <Field label="Description">
                      <Textarea
                        value={editor.draft.description}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              description: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                  </>
                ) : null}

                {editor.kind === "project" ? (
                  <>
                    <Field label="Name" required>
                      <Input
                        value={editor.draft.name}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, name: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Tags">
                      <Input
                        value={editor.draft.tags}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, tags: event.target.value },
                          })
                        }
                        placeholder="Next.js, Postgres"
                      />
                    </Field>
                    <Field label="Live URL">
                      <Input
                        value={editor.draft.liveUrl}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, liveUrl: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="GitHub URL">
                      <Input
                        value={editor.draft.githubUrl}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, githubUrl: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Start">
                        <DateField
                          value={editor.draft.startDate}
                          onChange={(startDate) =>
                            setEditor({
                              ...editor,
                              draft: { ...editor.draft, startDate },
                            })
                          }
                        />
                      </Field>
                      <Field label="End">
                        <DateField
                          value={editor.draft.endDate}
                          onChange={(endDate) =>
                            setEditor({
                              ...editor,
                              draft: { ...editor.draft, endDate },
                            })
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Description">
                      <Textarea
                        value={editor.draft.description}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              description: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                  </>
                ) : null}

                {editor.kind === "certification" ? (
                  <>
                    <Field label="Name" required>
                      <Input
                        value={editor.draft.name}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, name: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Issuer">
                      <Input
                        value={editor.draft.issuer}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, issuer: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Issued">
                        <DateField
                          value={editor.draft.issuedAt}
                          onChange={(issuedAt) =>
                            setEditor({
                              ...editor,
                              draft: { ...editor.draft, issuedAt },
                            })
                          }
                        />
                      </Field>
                      <Field label="Expires">
                        <DateField
                          value={editor.draft.expiresAt}
                          onChange={(expiresAt) =>
                            setEditor({
                              ...editor,
                              draft: { ...editor.draft, expiresAt },
                            })
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Credential URL">
                      <Input
                        value={editor.draft.credentialUrl}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              credentialUrl: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                  </>
                ) : null}

                {editor.kind === "education" ? (
                  <>
                    <Field label="School" required>
                      <Input
                        value={editor.draft.school}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, school: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Degree">
                      <Input
                        value={editor.draft.degree}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, degree: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Field">
                      <Input
                        value={editor.draft.field}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, field: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Start">
                        <DateField
                          value={editor.draft.startDate}
                          onChange={(startDate) =>
                            setEditor({
                              ...editor,
                              draft: { ...editor.draft, startDate },
                            })
                          }
                        />
                      </Field>
                      <Field label="End">
                        <DateField
                          value={editor.draft.endDate}
                          onChange={(endDate) =>
                            setEditor({
                              ...editor,
                              draft: { ...editor.draft, endDate },
                            })
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Description">
                      <Textarea
                        value={editor.draft.description}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              description: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                  </>
                ) : null}

                {editor.kind === "language" ? (
                  <div className="grid grid-cols-2 items-start gap-3">
                    <Field label="Language" required>
                      <SingleListCombobox
                        items={LANGUAGE_OPTIONS.filter(
                          (language) =>
                            language === editor.draft.name ||
                            !data.languages.some((item) => item.name === language),
                        )}
                        value={editor.draft.name}
                        onChange={(name) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, name },
                          })
                        }
                        placeholder="Search languages"
                      />
                    </Field>
                    <Field label="Proficiency">
                      <Select
                        value={editor.draft.proficiency}
                        onValueChange={(value) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              proficiency: String(value ?? "fluent"),
                            },
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFICIENCIES.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                ) : null}

                {editor.kind === "award" ? (
                  <>
                    <Field label="Title" required>
                      <Input
                        value={editor.draft.title}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, title: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Issuer">
                      <Input
                        value={editor.draft.issuer}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, issuer: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Date">
                      <DateField
                        value={editor.draft.awardedAt}
                        onChange={(awardedAt) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, awardedAt },
                          })
                        }
                      />
                    </Field>
                    <Field label="URL">
                      <Input
                        value={editor.draft.url}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, url: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Description">
                      <Textarea
                        value={editor.draft.description}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              description: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                  </>
                ) : null}

                {editor.kind === "publication" ? (
                  <>
                    <Field label="Title" required>
                      <Input
                        value={editor.draft.title}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, title: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Venue">
                      <Input
                        value={editor.draft.venue}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, venue: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Date">
                      <DateField
                        value={editor.draft.publishedAt}
                        onChange={(publishedAt) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, publishedAt },
                          })
                        }
                      />
                    </Field>
                    <Field label="URL">
                      <Input
                        value={editor.draft.url}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, url: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Description">
                      <Textarea
                        value={editor.draft.description}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              description: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                  </>
                ) : null}

                {editor.kind === "volunteer" ? (
                  <>
                    <Field label="Title" required>
                      <Input
                        value={editor.draft.title}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, title: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Organization" required>
                      <Input
                        value={editor.draft.organization}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              organization: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                    <Field label="URL">
                      <Input
                        value={editor.draft.url}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: { ...editor.draft, url: event.target.value },
                          })
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Start">
                        <DateField
                          value={editor.draft.startDate}
                          onChange={(startDate) =>
                            setEditor({
                              ...editor,
                              draft: { ...editor.draft, startDate },
                            })
                          }
                        />
                      </Field>
                      <Field label="End">
                        <DateField
                          value={editor.draft.endDate}
                          onChange={(endDate) =>
                            setEditor({
                              ...editor,
                              draft: { ...editor.draft, endDate },
                            })
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Description">
                      <Textarea
                        value={editor.draft.description}
                        onChange={(event) =>
                          setEditor({
                            ...editor,
                            draft: {
                              ...editor.draft,
                              description: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                  </>
                ) : null}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditor(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!canSaveEditor(editor)}
                  onClick={saveEditor}
                >
                  {editor.index === null ? "Add" : "Save"}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
