import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleEditor } from "@/components/learn/article-editor";
import { requireAdmin } from "@/lib/admin";
import { listAllTopics } from "@/lib/learn/queries";

export const metadata: Metadata = { title: "New article", robots: { index: false } };

export default function NewArticlePage() {
  return (
    <Suspense fallback={<div className="h-[70vh] animate-pulse bg-muted/40" />}>
      <NewArticle />
    </Suspense>
  );
}

async function NewArticle() {
  await requireAdmin();
  const topics = await listAllTopics();
  return <ArticleEditor article={null} topics={topics.map((t) => ({ id: t.id, name: t.name }))} />;
}
