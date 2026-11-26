import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { SheetEditor } from "@/components/practice/sheet-editor";
import { requireAdmin } from "@/lib/admin";
import { getSheetForEdit } from "@/lib/practice/queries";

export const metadata: Metadata = { title: "Edit sheet", robots: { index: false } };

export default function EditSheetPage({ params, searchParams }: PageProps<"/studio/sheets/[id]">) {
  return (
    <Suspense fallback={<div className="h-[70vh] animate-pulse bg-muted/40" />}>
      <EditSheet params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditSheet({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: PageProps<"/studio/sheets/[id]">["searchParams"];
}) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const s = await getSheetForEdit(id);
  if (!s) notFound();
  return (
    <SheetEditor
      key={s.id}
      justCreated={created === "1"}
      sheet={{
        id: s.id,
        title: s.title,
        slug: s.slug,
        summary: s.summary,
        sourceName: s.sourceName ?? "",
        sourceUrl: s.sourceUrl ?? "",
        featured: s.featured,
        status: s.status,
        topics: s.topics.map((t) => ({ name: t.name, problems: t.problems.map(({ title, url, difficulty, premium }) => ({ title, url, difficulty, premium })) })),
      }}
    />
  );
}
