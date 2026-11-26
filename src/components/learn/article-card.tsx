import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ArticleSummary } from "@/lib/learn/queries";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-colors hover:border-foreground/25">
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        <span className="text-brand">{article.topic.name}</span>
        <span aria-hidden>·</span>
        <span>{article.readingMinutes} min read</span>
      </div>
      <h3 className="mt-3 text-lg leading-snug font-semibold tracking-tight">
        <Link href={`/learn/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.summary}</p>
      <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
        <span>{article.publishedAt ? dateFormat.format(article.publishedAt) : null}</span>
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
      </div>
    </article>
  );
}

export function ArticleGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-xl border bg-muted/50" />
      ))}
    </div>
  );
}

/** Editorial list row: reads well with two articles or two hundred. */
export function ArticleRow({ article }: { article: ArticleSummary }) {
  return (
    <article className="group relative grid gap-2 py-7 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:gap-8">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase sm:flex-col sm:items-start sm:pt-1.5">
        <span className="text-brand">{article.topic.name}</span>
        <span className="sm:hidden" aria-hidden>
          ·
        </span>
        <span>{article.publishedAt ? dateFormat.format(article.publishedAt) : null}</span>
        <span className="sm:hidden" aria-hidden>
          ·
        </span>
        <span>{article.readingMinutes} min read</span>
      </div>
      <div className="min-w-0">
        <h2 className="text-xl leading-snug font-semibold tracking-tight text-balance group-hover:text-brand sm:text-2xl">
          <Link href={`/learn/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 max-w-3xl text-muted-foreground">{article.summary}</p>
        {article.tags.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tags.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <ArrowUpRight className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground sm:block" />
    </article>
  );
}
