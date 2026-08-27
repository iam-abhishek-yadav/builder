import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LaunchCard } from "@/components/launchpad/launch-card";
import { WeekNav } from "@/components/launchpad/week-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { requireDbUser } from "@/lib/current-user";
import { getLaunchWeek, parseWeekParam } from "@/lib/launch-week";
import { findMyLaunchThisWeek, loadWeekLaunches } from "@/lib/launchpad";

export const metadata: Metadata = {
  title: "Launchpad | Builder",
  description: "This week’s launches from people who ship.",
};

export const dynamic = "force-dynamic";

export default async function LaunchpadPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week: weekParam } = await searchParams;
  const week = getLaunchWeek(parseWeekParam(weekParam));
  const viewer = await requireDbUser();
  const items = await loadWeekLaunches(week.start, viewer?.id);
  const mine =
    viewer && week.isCurrent ? await findMyLaunchThisWeek(viewer.id) : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8">
        <WeekNav week={week} />
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          A weekly board for projects. Upvote, comment, or offer to buy —
          makers see who is serious.
        </p>
        <div className="mt-6">
          {viewer ? (
            mine ? (
              <Button
                nativeButton={false}
                render={<Link href={`/launchpad/${mine.id}`} />}
              >
                Your launch
              </Button>
            ) : week.isCurrent ? (
              <Button
                nativeButton={false}
                render={<Link href="/launchpad/new" />}
              >
                Launch this week
              </Button>
            ) : null
          ) : week.isCurrent ? (
            <Button
              nativeButton={false}
              render={
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent("/launchpad/new")}`}
                />
              }
            >
              Sign in to launch
            </Button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="font-medium">No launches this week yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {week.isCurrent
                  ? "Ship something and put it here."
                  : "This week was quiet."}
              </p>
            </div>
          ) : (
            items.map((launch, index) => (
              <LaunchCard
                key={launch.id}
                launch={launch}
                rank={index + 1}
                signedIn={Boolean(viewer)}
              />
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
