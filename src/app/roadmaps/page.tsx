import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Eyebrow } from "@/components/container";
import { RoadmapRow } from "@/components/roadmaps/roadmap-card";
import { getAllRoadmapProgress, getPublishedRoadmaps } from "@/lib/roadmaps/queries";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Roadmaps",
  description: "Step-by-step learning paths for engineers, with progress tracking.",
};

export default function RoadmapsPage() {
  return (
    <Container className="py-12">
      <header className="border-b pb-8">
        <div className="max-w-2xl space-y-2">
          <Eyebrow>Roadmaps</Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Know what to learn next</h1>
          <p className="text-muted-foreground">
            Step-by-step paths from fundamentals to production. Sign in to tick off steps as you go.
          </p>
        </div>
      </header>
      <Suspense
        fallback={
          <div className="pt-8">
            <div className="h-64 animate-pulse rounded-2xl border bg-muted/50" />
          </div>
        }
      >
        <RoadmapList />
      </Suspense>
    </Container>
  );
}

async function RoadmapList() {
  const user = await getCurrentUser();
  const roadmaps = await getPublishedRoadmaps();
  if (roadmaps.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        The first roadmaps are on their way.
      </div>
    );
  }
  const progress = user ? await getAllRoadmapProgress(user.id) : {};
  return (
    <div className="space-y-4 pt-8">
      {roadmaps.map((r) => (
        <RoadmapRow key={r.id} roadmap={r} progress={user ? percent(r, progress[r.id] ?? []) : null} />
      ))}
    </div>
  );
}

// Share of all steps done, counting only keys that still exist in the outline.
function percent(r: { stepKeys: string[] }, doneKeys: string[]) {
  if (r.stepKeys.length === 0) return 0;
  const done = new Set(doneKeys);
  return Math.round((r.stepKeys.filter((k) => done.has(k)).length / r.stepKeys.length) * 100);
}

