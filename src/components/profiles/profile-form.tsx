"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { ExternalLink, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveProfile, type ProfileFormState } from "@/lib/profiles/actions";
import { cn } from "@/lib/utils";

type Initial = {
  handle: string;
  publicId: string;
  suggestedHandle: string;
  headline: string;
  bio: string;
  links: string[];
  openToWork: boolean;
  workTypes: string[];
  workRoles: string;
  workLocations: string[];
  workCity: string;
  showRoadmapProgress: boolean;
};

const MAX_LINKS = 5;
const WORK_TYPES = [
  ["full-time", "Full-time"],
  ["contract", "Contract / freelance"],
  ["internship", "Internship"],
] as const;
const WORK_LOCATIONS = [
  ["remote", "Remote"],
  ["hybrid", "Hybrid"],
  ["onsite", "On-site"],
] as const;

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(saveProfile, {});
  const errors = state.fieldErrors ?? {};
  const savedHandle = state.saved ? state.saved.handle : initial.handle || null;
  const profileUrl = `/u/${savedHandle ?? initial.publicId}`;

  // Controlled where the UI depends on the value; everything else is a plain form field.
  const [handle, setHandle] = useState(initial.handle || initial.suggestedHandle);
  const [links, setLinks] = useState(initial.links.length ? initial.links : [""]);
  const [openToWork, setOpenToWork] = useState(initial.openToWork);
  const [bio, setBio] = useState(initial.bio);

  return (
    <form
      // Submitted manually (not via the action prop) so React doesn't reset the form:
      // on a validation error the builder keeps everything they typed.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="mt-8 space-y-10"
    >
      {/* Username */}
      <Section title="Profile URL" description="Pick a username for a clean, shareable link. You can change it later.">
        <div className="space-y-1.5">
          <Label htmlFor="handle">Username</Label>
          <div className="flex items-center rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <span className="pl-2.5 font-mono text-sm text-muted-foreground select-none">builderonline.site/u/</span>
            <input
              id="handle"
              name="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              maxLength={30}
              autoComplete="off"
              spellCheck={false}
              placeholder="your-name"
              aria-invalid={errors.handle ? true : undefined}
              aria-describedby="handle-help"
              className="h-8 min-w-0 flex-1 bg-transparent pr-2.5 font-mono text-sm outline-none"
            />
          </div>
          {errors.handle ? (
            <p className="text-xs text-destructive">{errors.handle[0]}</p>
          ) : (
            <p id="handle-help" className="text-xs text-muted-foreground">
              3–30 characters: lowercase letters, numbers and dashes.
              {!savedHandle && initial.suggestedHandle && handle === initial.suggestedHandle ? " Suggested from your account." : null}
              {!savedHandle ? ` Until you save one, your profile lives at /u/${initial.publicId}.` : null}
            </p>
          )}
        </div>
        <Link href={profileUrl} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          View your profile <ExternalLink className="size-3.5" />
        </Link>
      </Section>

      {/* About */}
      <Section title="About" description="A line or two about what you build.">
        <Field label="Headline" htmlFor="headline" error={errors.headline?.[0]}>
          <Input id="headline" name="headline" defaultValue={initial.headline} maxLength={100} placeholder="Backend engineer building developer tools" />
        </Field>
        <Field label="Bio" htmlFor="bio" error={errors.bio?.[0]} hint={`${bio.length}/600`}>
          <Textarea id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={600} rows={4} placeholder="What you're working on, what you're good at, what you're looking for." />
        </Field>
        <div className="space-y-1.5">
          <Label>Links</Label>
          {links.map((url, i) => (
            <div key={i} className="flex gap-2">
              <Input
                name="links"
                type="url"
                value={url}
                onChange={(e) => setLinks(links.map((l, j) => (j === i ? e.target.value : l)))}
                placeholder="https://github.com/you"
                aria-label={`Link ${i + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove link ${i + 1}`}
                onClick={() => setLinks(links.length === 1 ? [""] : links.filter((_, j) => j !== i))}
              >
                <X />
              </Button>
            </div>
          ))}
          {errors.links ? <p className="text-xs text-destructive">{errors.links[0]}</p> : null}
          {links.length < MAX_LINKS ? (
            <Button type="button" variant="ghost" size="xs" onClick={() => setLinks([...links, ""])}>
              <Plus /> Add link
            </Button>
          ) : null}
        </div>
      </Section>

      {/* Open to work */}
      <Section title="Open to work" description="Let people know you're available. Off by default.">
        <Toggle name="openToWork" checked={openToWork} onChange={setOpenToWork} label="Show an “Open to work” badge on my profile" />
        <div className={cn("space-y-5", !openToWork && "hidden")}>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Type of work</legend>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map(([value, label]) => (
                <Chip key={value} name="workTypes" value={value} label={label} defaultChecked={initial.workTypes.includes(value)} />
              ))}
            </div>
          </fieldset>
          <Field label="Roles you want" htmlFor="workRoles" error={errors.workRoles?.[0]}>
            <Input id="workRoles" name="workRoles" defaultValue={initial.workRoles} maxLength={100} placeholder="Backend / Forward Deployed Engineer" />
          </Field>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Location preference</legend>
            <div className="flex flex-wrap gap-2">
              {WORK_LOCATIONS.map(([value, label]) => (
                <Chip key={value} name="workLocations" value={value} label={label} defaultChecked={initial.workLocations.includes(value)} />
              ))}
            </div>
          </fieldset>
          <Field label="City / country (optional)" htmlFor="workCity" error={errors.workCity?.[0]}>
            <Input id="workCity" name="workCity" defaultValue={initial.workCity} maxLength={60} placeholder="Bengaluru, India" />
          </Field>
        </div>
      </Section>

      {/* Visibility */}
      <Section id="visibility" title="Visibility" description="Your profile, launches and skills are always public.">
        <Toggle
          name="showRoadmapProgress"
          defaultChecked={initial.showRoadmapProgress}
          label="Show my roadmap progress and finished-roadmap badges"
        />
      </Section>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-4 border-t bg-background/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
        <p className="text-sm" role="status" aria-live="polite">
          {state.error ? (
            <span className="text-destructive">{state.error}</span>
          ) : state.ok ? (
            <span className="text-muted-foreground">
              {state.message}{" "}
              <Link href={profileUrl} className="text-foreground underline underline-offset-4">
                View profile
              </Link>
            </span>
          ) : null}
        </p>
      </div>
    </form>
  );
}

function Section({ id, title, description, children }: { id?: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 grid gap-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-8">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? <span className="font-mono text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function Toggle({
  name,
  label,
  checked,
  defaultChecked,
  onChange,
}: {
  name: string;
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        name={name}
        role="switch"
        {...(checked !== undefined ? { checked, onChange: (e) => onChange?.(e.target.checked) } : { defaultChecked })}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-5 w-9 shrink-0 rounded-full bg-muted-foreground/30 transition-colors peer-checked:bg-brand peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-background after:shadow after:transition-transform peer-checked:after:translate-x-4"
      />
      {label}
    </label>
  );
}

function Chip({ name, value, label, defaultChecked }: { name: string; value: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="inline-flex rounded-full border px-3 py-1.5 text-sm transition-colors peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 hover:border-foreground/40">
        {label}
      </span>
    </label>
  );
}
