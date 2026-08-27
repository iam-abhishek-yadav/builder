import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LaunchForm } from "@/components/launchpad/launch-form";
import { AppShell } from "@/components/shell/app-shell";
import { requireDbUser } from "@/lib/current-user";
import { findMyLaunchThisWeek } from "@/lib/launchpad";

export const metadata: Metadata = {
  title: "Launch this week | Builder",
  description: "Put a project on this week’s Launchpad.",
};

export default async function NewLaunchPage() {
  const user = await requireDbUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/launchpad/new");
  }

  const existing = await findMyLaunchThisWeek(user.id);
  if (existing) {
    redirect(`/launchpad/${existing.id}`);
  }

  return (
    <AppShell>
      <Button
        variant="outline"
        className="mb-6"
        nativeButton={false}
        render={<Link href="/launchpad" />}
      >
        Back to Launchpad
      </Button>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Launch this week
      </h1>
      <p className="mt-2 text-muted-foreground">
        One project per week. The board resets every Monday, 00:00 UTC.
      </p>
      <div className="mt-8 max-w-xl">
        <LaunchForm />
      </div>
    </AppShell>
  );
}
