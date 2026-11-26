import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Eyebrow } from "@/components/container";
import { ProfileForm } from "@/components/profiles/profile-form";
import { suggestHandle } from "@/lib/profiles/handle";
import { getEditableProfile } from "@/lib/profiles/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Profile settings", robots: { index: false } };

export default function ProfileSettingsPage() {
  return (
    <Container narrow className="py-12">
      <header className="space-y-2 border-b pb-8">
        <Eyebrow>Settings</Eyebrow>
        <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="text-muted-foreground">
          Your public builder page. Launches and skills fill in automatically from what you ship.
        </p>
      </header>
      <Suspense fallback={<div className="mt-8 h-[70vh] animate-pulse rounded-xl bg-muted/40" />}>
        <Form />
      </Suspense>
    </Container>
  );
}

async function Form() {
  const me = await requireUser("/settings/profile");
  const profile = await getEditableProfile(me.id);
  if (!profile) return null;
  return (
    <ProfileForm
      initial={{
        handle: profile.handle ?? "",
        publicId: profile.publicId,
        suggestedHandle: profile.handle ? "" : suggestHandle(me.username ?? profile.name),
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        links: profile.links.map((l) => l.url),
        openToWork: profile.openToWork,
        workTypes: profile.workTypes,
        workRoles: profile.workRoles ?? "",
        workLocations: profile.workLocations,
        workCity: profile.workCity ?? "",
        showRoadmapProgress: profile.showRoadmapProgress,
      }}
    />
  );
}
