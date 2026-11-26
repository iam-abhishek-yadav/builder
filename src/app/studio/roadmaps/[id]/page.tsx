import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { RoadmapEditor } from "@/components/roadmaps/roadmap-editor";
import { requireAdmin } from "@/lib/admin";
import { getPublishedArticles } from "@/lib/learn/queries";
import { getRoadmapForEdit } from "@/lib/roadmaps/queries";

export const metadata: Metadata = { title: "Edit roadmap", robots: { index: false } };

export default function EditRoadmapPage({ params, searchParams }: PageProps<"/studio/roadmaps/[id]">) {
  return (
    <Suspense fallback={<div className="h-[70vh] animate-pulse bg-muted/40" />}>
      <EditRoadmap params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditRoadmap({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: PageProps<"/studio/roadmaps/[id]">["searchParams"];
}) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const [roadmap, articles] = await Promise.all([getRoadmapForEdit(id), getPublishedArticles({ limit: 1000 })]);
  if (!roadmap) notFound();
  return (
    <RoadmapEditor
      key={roadmap.id}
      articles={Object.fromEntries(articles.map((a) => [a.slug, a.title]))}
      roadmap={{
        id: roadmap.id,
        title: roadmap.title,
        slug: roadmap.slug,
        summary: roadmap.summary,
        outline: roadmap.outline,
        featured: roadmap.featured ? "on" : "",
        status: roadmap.status,
      }}
      justCreated={created === "1"}
    />
  );
}
