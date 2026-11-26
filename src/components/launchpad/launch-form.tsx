"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/launchpad/actions";

function Field({
  name,
  label,
  hint,
  error,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function LaunchForm() {
  const [state, action, pending] = useActionState(createProject, {});
  const v = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  // Echo submitted values back as defaults: React resets the form after the action.
  const field = (name: keyof typeof errors) => ({
    id: name,
    name,
    defaultValue: v[name],
    "aria-invalid": errors[name] ? true : undefined,
  });

  return (
    <form action={action} className="space-y-5">
      <Field name="name" label="Project name" error={errors.name?.[0]}>
        <Input {...field("name")} required maxLength={60} />
      </Field>
      <Field name="tagline" label="Tagline" hint="One line, up to 80 characters." error={errors.tagline?.[0]}>
        <Input {...field("tagline")} required maxLength={80} placeholder="Postgres branching for every pull request" />
      </Field>
      <Field
        name="description"
        label="Description"
        hint="What it does, why you built it, what's next."
        error={errors.description?.[0]}
      >
        <Textarea {...field("description")} required rows={6} maxLength={2000} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="websiteUrl" label="Website / demo URL" error={errors.websiteUrl?.[0]}>
          <Input {...field("websiteUrl")} type="url" required placeholder="https://" />
        </Field>
        <Field name="repoUrl" label="Repository URL (optional)" error={errors.repoUrl?.[0]}>
          <Input {...field("repoUrl")} type="url" placeholder="https://github.com/…" />
        </Field>
      </div>
      <Field
        name="techStack"
        label="Tech stack"
        hint="Comma-separated, up to 8. e.g. nextjs, postgres, rust"
        error={errors.techStack?.[0]}
      >
        <Input {...field("techStack")} />
      </Field>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Launching…" : "Launch project"}
      </Button>
    </form>
  );
}
