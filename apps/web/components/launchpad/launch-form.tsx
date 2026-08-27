"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLaunchAction } from "@/app/launchpad/actions";

export function LaunchForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createLaunchAction, null);

  useEffect(() => {
    if (state && "id" in state && state.ok && state.id) {
      router.push(`/launchpad/${state.id}`);
    }
  }, [router, state]);

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required maxLength={80} placeholder="Builder" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          name="tagline"
          required
          maxLength={140}
          placeholder="A home base for people who ship"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          name="url"
          required
          type="url"
          placeholder="https://"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">What you shipped</Label>
        <Textarea
          id="description"
          name="description"
          className="min-h-32"
          placeholder="Who it is for, what is new this week, and how to try it."
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-10 w-fit px-6">
        {pending ? "Launching…" : "Launch this week"}
      </Button>
    </form>
  );
}
