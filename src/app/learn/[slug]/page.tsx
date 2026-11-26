import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Container, Eyebrow } from "@/components/container";
import { Markdown } from "@/components/learn/markdown";
import { TableOfContents } from "@/components/learn/table-of-contents";
import { Badge } from "@/components/ui/badge";
import { extractToc } from "@/lib/learn/markdown";
import { getPublishedArticle } from "@/lib/learn/queries";

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.summary,
    openGraph: { type: "article", title: article.title, description: article.summary },
  };
}

export default function ArticlePage({ params }: PageProps<"/learn/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleView params={params} />
    </Suspense>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

async function ArticleView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();
  const toc = extractToc(article.body);

  return (
    <Container className="py-12">
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All articles
      </Link>

      <header className="mt-8 max-w-3xl space-y-5">
        <Eyebrow>
          <Link href={`/learn?topic=${article.topic.slug}`}>{article.topic.name}</Link>
        </Eyebrow>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">{article.title}</h1>
        <p className="text-lg text-pretty text-muted-foreground">{article.summary}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {article.publishedAt ? <span>{dateFormat.format(article.publishedAt)}</span> : null}
          <span>{article.readingMinutes} min read</span>
        </div>
        {article.tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <Badge key={t} variant="secondary" className="font-mono text-xs font-normal">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}
      </header>

      <div className="mt-12 grid gap-12 border-t pt-10 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="max-w-3xl min-w-0">
          {article.sourceUrl ? (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mb-8 flex items-center justify-between gap-4 rounded-xl border bg-muted/40 p-4 text-sm hover:border-foreground/30"
            >
              <span>
                <span className="text-muted-foreground">Based on </span>
                <span className="font-medium">{article.sourceName ?? new URL(article.sourceUrl).hostname}</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
            </a>
          ) : null}
          <Markdown>{article.body}</Markdown>
        </div>
        {toc.length > 1 ? (
          <aside className="hidden lg:block">
            {/* Long tables of contents scroll on their own instead of running off-screen. */}
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
              <TableOfContents items={toc} />
            </div>
          </aside>
        ) : null}
      </div>
    </Container>
  );
}

function ArticleSkeleton() {
  return (
    <Container className="space-y-6 py-12">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-96 animate-pulse rounded-xl bg-muted/60" />
    </Container>
  );
}
