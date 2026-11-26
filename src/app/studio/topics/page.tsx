import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Container, Eyebrow } from "@/components/container";
import { TopicForm } from "@/components/learn/topic-form";
import { requireAdmin } from "@/lib/admin";
import { listAllTopics } from "@/lib/learn/queries";

export const metadata: Metadata = { title: "Topics", robots: { index: false } };

export default function TopicsPage() {
  return (
    <Container narrow className="py-12">
      <Link href="/studio" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Studio
      </Link>
      <header className="mt-6 space-y-2 border-b pb-8">
        <Eyebrow>Studio</Eyebrow>
        <h1 className="text-3xl font-semibold tracking-tight">Topics</h1>
        <p className="text-muted-foreground">
          Group Learn articles by topic. A topic appears on the public Learn page once it has a published article.
          Lower order numbers come first.
        </p>
      </header>
      <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-muted/50" />}>
        <TopicList />
      </Suspense>
    </Container>
  );
}

async function TopicList() {
  await requireAdmin();
  const topics = await listAllTopics();
  const nextPosition = (topics.at(-1)?.position ?? 0) + 10;
  return (
    <div className="mt-8 space-y-8">
      <section className="space-y-3">
        <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Add a topic</h2>
        <TopicForm topic={null} nextPosition={nextPosition} />
      </section>
      <section className="space-y-3">
        <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {topics.length} {topics.length === 1 ? "topic" : "topics"}
        </h2>
        {topics.map((t) => (
          <TopicForm
            // Remount after a save so defaults reflect the stored values.
            key={`${t.id}:${t.slug}:${t.name}:${t.position}:${t.description}`}
            topic={{ id: t.id, name: t.name, slug: t.slug, description: t.description, position: String(t.position), articles: t.articles }}
          />
        ))}
      </section>
    </div>
  );
}
