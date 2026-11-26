import type { Metadata } from "next";
import { Suspense } from "react";
import { RoadmapEditor } from "@/components/roadmaps/roadmap-editor";
import { requireAdmin } from "@/lib/admin";
import { getPublishedArticles } from "@/lib/learn/queries";

export const metadata: Metadata = { title: "New roadmap", robots: { index: false } };

export default function NewRoadmapPage() {
  return (
    <Suspense fallback={<div className="h-[70vh] animate-pulse bg-muted/40" />}>
      <NewRoadmap />
    </Suspense>
  );
}

async function NewRoadmap() {
  await requireAdmin();
  const articles = await getPublishedArticles({ limit: 1000 });
  return <RoadmapEditor roadmap={null} articles={Object.fromEntries(articles.map((a) => [a.slug, a.title]))} />;
}
