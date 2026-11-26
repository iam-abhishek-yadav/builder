import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { ArticleEditor } from "@/components/learn/article-editor";
import { requireAdmin } from "@/lib/admin";
import { getArticleForEdit, listAllTopics } from "@/lib/learn/queries";

export const metadata: Metadata = { title: "Edit article", robots: { index: false } };

export default function EditArticlePage({ params, searchParams }: PageProps<"/studio/[id]">) {
  return (
    <Suspense fallback={<div className="h-[70vh] animate-pulse bg-muted/40" />}>
      <EditArticle params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditArticle({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: PageProps<"/studio/[id]">["searchParams"];
}) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const [article, topics] = await Promise.all([getArticleForEdit(id), listAllTopics()]);
  if (!article) notFound();
  return (
    <ArticleEditor
      // Remount when switching articles so form defaults reset.
      key={article.id}
      topics={topics.map((t) => ({ id: t.id, name: t.name }))}
      article={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        topicId: article.topicId,
        featured: article.featured ? "on" : "",
        tags: article.tags.join(", "),
        body: article.body,
        sourceUrl: article.sourceUrl ?? "",
        sourceName: article.sourceName ?? "",
        status: article.status,
      }}
      justCreated={created === "1"}
    />
  );
}
