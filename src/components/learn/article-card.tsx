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
