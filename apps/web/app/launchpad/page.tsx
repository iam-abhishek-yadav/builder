import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchCard } from "@/components/launchpad/launch-card";
import { LaunchSlotCard } from "@/components/launchpad/launch-slot-card";
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

  const launchHref = viewer
    ? mine
      ? `/launchpad/${mine.id}`
      : "/launchpad/new"
    : `/sign-in?redirect_url=${encodeURIComponent("/launchpad/new")}`;
  const launchLabel = mine ? "Your launch" : "Launch";
  const showSlot = week.isCurrent && !mine;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-208 px-4 py-8 sm:px-8">
        <h1 className="text-lg font-semibold tracking-tight">Launchpad</h1>
        <div className="mt-5">
          <WeekNav week={week} />
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-tight italic sm:text-5xl">
              {week.label}
            </h2>
            <p className="mt-1 text-muted-foreground">{week.range}</p>
          </div>
          <Button
            variant="outline"
            className="h-9 rounded-lg border-[#0f6b45] bg-transparent px-4 text-[#0f6b45] hover:bg-[#d9f0e3] hover:text-[#0f6b45]"
            nativeButton={false}
            render={<Link href={launchHref} />}
          >
            {launchLabel}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="mt-10">
            {showSlot ? (
              <LaunchSlotCard href={launchHref} label={launchLabel} />
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
                <p className="font-medium">No launches this week yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This week was quiet.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mt-8 flex items-center justify-end border-b border-border/80 pb-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ArrowUpDown className="size-3.5" />
                Trending
              </span>
            </div>
            <div className="divide-y divide-border/80">
              {items.map((launch, index) => (
                <div key={launch.id}>
                  <LaunchCard
                    launch={launch}
                    rank={index + 1}
                    signedIn={Boolean(viewer)}
                  />
                  {showSlot && index === 2 ? (
                    <LaunchSlotCard href={launchHref} label={launchLabel} />
                  ) : null}
                </div>
              ))}
            </div>
            {showSlot && items.length < 3 ? (
              <LaunchSlotCard href={launchHref} label={launchLabel} />
            ) : null}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
