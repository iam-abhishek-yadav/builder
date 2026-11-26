import type { Metadata } from "next";
import { Suspense } from "react";
import { LaunchForm } from "@/components/launchpad/launch-form";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Launch a project" };

export default function LaunchPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Launch a project</h1>
        <p className="text-muted-foreground">
          Share something you built. It goes live on today&apos;s leaderboard right away.
        </p>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
        <AuthedLaunchForm />
      </Suspense>
    </div>
  );
}

async function AuthedLaunchForm() {
  await requireUser("/launch");
  return <LaunchForm />;
}
