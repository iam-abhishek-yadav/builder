import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PenLine } from "lucide-react";
import { Container, Eyebrow } from "@/components/container";
import { LearnTabs } from "@/components/learn-tabs";
import { ArticleRow } from "@/components/learn/article-card";
import { buttonVariants } from "@/components/ui/button";
import { isAdmin } from "@/lib/admin";
import { getPublicTopics, getPublishedArticles } from "@/lib/learn/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Learn",
  description: "In-depth articles and case studies for engineers.",
};

export default function LearnPage({ searchParams }: PageProps<"/learn">) {
  return (
    <Container className="py-12">
      <LearnTabs active="/learn" />
      <header className="mt-8 flex flex-wrap items-end justify-between gap-6 border-b pb-8">
        <div className="max-w-2xl space-y-2">
          <Eyebrow>Learn</Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Learn from real engineering</h1>
          <p className="text-muted-foreground">
            In-depth write-ups on how software is designed, built and scaled, from fundamentals to production case
            studies.
          </p>
        </div>
        <Suspense>
          <StudioButton />
        </Suspense>
      </header>
      <Suspense fallback={<ListSkeleton />}>
        <ArticleList searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function StudioButton() {
  if (!(await isAdmin())) return null;
  return (
    <Link href="/studio" className={buttonVariants({ variant: "outline" })}>
      <PenLine /> Studio
    </Link>
  );
}

async function ArticleList({ searchParams }: { searchParams: PageProps<"/learn">["searchParams"] }) {
  const { topic } = await searchParams;
  const topics = await getPublicTopics();
  const active = topics.find((t) => t.slug === topic);
  const articles = await getPublishedArticles({ topicSlug: active?.slug });

  return (
    <div className="space-y-8 pt-6">
      {topics.length > 1 ? (
        <nav className="flex flex-wrap gap-2" aria-label="Topics">
          <TopicTab href="/learn" active={!active} label="All" />
          {topics.map((t) => (
            <TopicTab key={t.slug} href={`/learn?topic=${t.slug}`} active={active?.slug === t.slug} label={t.name} count={t.articles} />
          ))}
        </nav>
      ) : null}
      {active?.description ? <p className="text-sm text-muted-foreground">{active.description}</p> : null}
      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Nothing published here yet. Check back soon.
        </div>
      ) : (
        <div className="divide-y border-b">
          {articles.map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function TopicTab({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active ? "border-foreground bg-foreground text-background" : "hover:border-foreground/40",
      )}
    >
      {label}
      {count !== undefined ? (
        <span className={cn("font-mono text-xs", active ? "text-background/70" : "text-muted-foreground")}>{count}</span>
      ) : null}
    </Link>
  );
}

function ListSkeleton() {
  return (
    <div className="mt-8 divide-y border-y">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="grid gap-3 py-7 sm:grid-cols-[180px_1fr] sm:gap-8">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
