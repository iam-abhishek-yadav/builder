import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, ChevronUp, Code2, Rocket, Route } from "lucide-react";
import { Container, Eyebrow } from "@/components/container";
import { RoadmapRow } from "@/components/roadmaps/roadmap-card";
import { buttonVariants } from "@/components/ui/button";
import { getLeaderboard } from "@/lib/launchpad/queries";
import { getHighlightedArticles, getPublicTopics, type ArticleSummary } from "@/lib/learn/queries";
import { getPublishedRoadmaps } from "@/lib/roadmaps/queries";
import { cn } from "@/lib/utils";

// Public landing page: no sign-in required. Static parts prerender into the shell;
// live sections stream in from cached queries. Only shows what is live today, and
// each section adapts its layout to how much content exists (no half-empty grids).

export default function LandingPage() {
  return (
    <>
      <Hero />

      <section className="border-y bg-muted/30">
        <Container className="py-20">
          <SectionHeading
            eyebrow="Learn"
            title="Start reading"
            description="In-depth write-ups on how real software is designed, built and scaled."
            href="/learn"
            linkLabel="All articles"
          />
          <Suspense fallback={<LearnSkeleton />}>
            <LearnHighlights />
          </Suspense>
        </Container>
      </section>

      <Suspense>
        <RoadmapHighlights />
      </Suspense>

      <Container className="pt-20">
        <Eyebrow>What&apos;s here</Eyebrow>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Pillar
            icon={BookOpen}
            title="Learn"
            body="Fundamentals and production case studies, written for engineers who want the details."
            href="/learn"
            cta="Browse articles"
          />
          <Pillar
            icon={Route}
            title="Roadmaps"
            body="Step-by-step paths that tell you what to learn next, with progress you can tick off as you go."
            href="/roadmaps"
            cta="Pick a roadmap"
          />
          <Pillar
            icon={Code2}
            title="Practice"
            body="Curated DSA sheets like Blind 75. Tick off what you've solved and star problems to revisit."
            href="/practice"
            cta="Start practising"
          />
          <Pillar
            icon={Rocket}
            title="Launchpad"
            body="Ship a project and get upvotes and real feedback from other engineers. Every day has its own leaderboard."
            href="/launchpad"
            cta="See this week's launches"
          />
        </div>
      </Container>

      <Container className="pt-20">
        <SectionHeading eyebrow="Launchpad" title="Trending this week" href="/launchpad" linkLabel="All launches" />
        <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-xl border bg-muted/50" />}>
          <TrendingLaunches />
        </Suspense>
      </Container>

      <Container className="pt-20">
        <div className="relative overflow-hidden rounded-2xl border bg-foreground px-6 py-14 text-background sm:px-12">
          <div className="bg-dot-grid absolute inset-0 opacity-20" aria-hidden />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Shipped something?</h2>
              <p className="text-background/70">Launch it today. It takes two minutes and builders are waiting to try it.</p>
            </div>
            <Link href="/launch" className={cn(buttonVariants({ size: "lg" }), "bg-background text-foreground hover:bg-background/90")}>
              Launch a project <ArrowRight />
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-dot-grid mask-fade-b absolute inset-0" aria-hidden />
      <Container className="relative py-20 sm:py-32">
        <div className="max-w-3xl space-y-6">
          <Eyebrow>For engineers who ship</Eyebrow>
          <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            Build in public. <span className="text-brand">Learn from real engineering.</span>
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            Launch your projects to other engineers, and read in-depth write-ups on how software is designed, built and
            scaled.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/learn" className={buttonVariants({ size: "lg" })}>
              Start reading <ArrowRight />
            </Link>
            <Link href="/roadmaps" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Browse roadmaps
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-2xl space-y-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        {linkLabel} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function Pillar({ icon: Icon, title, body, href, cta }: { icon: typeof Rocket; title: string; body: string; href: string; cta: string }) {
  return (
    <Link href={href} className="group flex flex-col rounded-xl border bg-background p-5 transition-colors hover:border-foreground/25">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-lg border">
          <Icon className="size-4" />
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium group-hover:text-brand">
        {cta} <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}

async function LearnHighlights() {
  await connection();
  const [articles, topics] = await Promise.all([getHighlightedArticles(6), getPublicTopics()]);

  if (articles.length === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        The first articles are on their way.
      </div>
    );
  }

  const [spotlight, ...rest] = articles;
  return (
    <div className="mt-10 space-y-6">
      {topics.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <Link
              key={t.slug}
              href={`/learn?topic=${t.slug}`}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm hover:border-foreground/40"
            >
              {t.name}
              <span className="font-mono text-xs text-muted-foreground">{t.articles}</span>
            </Link>
          ))}
        </div>
      ) : null}
      {/* Spotlight plus a side list: fills the width whether there are 2 articles or 6. */}
      <div className={cn("grid gap-6", rest.length > 0 && "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]")}>
        <SpotlightCard article={spotlight} />
        {rest.length > 0 ? (
          <div className="flex flex-col rounded-2xl border bg-background">
            <p className="border-b px-5 py-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              {rest.length === 1 ? "Also read" : "More to read"}
            </p>
            <ul className="divide-y">
              {rest.map((a) => (
                <CompactArticle key={a.id} article={a} expanded={rest.length === 1} />
              ))}
            </ul>
            <Link
              href="/learn"
              className="mt-auto inline-flex items-center gap-1 border-t px-5 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              All articles <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SpotlightCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-background p-6 transition-colors hover:border-foreground/25 sm:p-10">
      <div className="bg-dot-grid absolute inset-x-0 top-0 h-24 opacity-50 mask-[linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          <span className="text-brand">{article.topic.name}</span>
          <span aria-hidden>·</span>
          <span>{article.readingMinutes} min read</span>
        </div>
        <h3 className="mt-4 text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
          <Link href={`/learn/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">{article.summary}</p>
        {article.tags.length ? (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {article.tags.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1 pt-8 text-sm font-medium group-hover:text-brand">
          Read the article <ArrowUpRight className="size-4" />
        </span>
      </div>
    </article>
  );
}

function CompactArticle({ article, expanded = false }: { article: ArticleSummary; expanded?: boolean }) {
  return (
    <li className={cn("group relative px-5 py-4 hover:bg-muted/40", expanded && "py-6")}>
      <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        <span className="text-brand">{article.topic.name}</span> · {article.readingMinutes} min read
      </p>
      <h4 className={cn("mt-1.5 leading-snug font-medium text-balance group-hover:text-brand", expanded && "text-xl font-semibold tracking-tight")}>
        <Link href={`/learn/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h4>
      <p className={cn("mt-1 text-sm text-muted-foreground", expanded ? "mt-3 line-clamp-6 text-base" : "line-clamp-2")}>{article.summary}</p>
      {expanded && article.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {article.tags.slice(0, 4).map((t) => (
            <span key={t} className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </li>
  );
}

function LearnSkeleton() {
  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[3fr_2fr]">
      <div className="h-80 animate-pulse rounded-2xl border bg-muted/50" />
      <div className="h-80 animate-pulse rounded-2xl border bg-muted/50" />
    </div>
  );
}

/** Hidden entirely until at least one roadmap is published. */
async function RoadmapHighlights() {
  await connection();
  const roadmaps = await getPublishedRoadmaps(2);
  if (roadmaps.length === 0) return null;
  return (
    <Container className="pt-20">
      <SectionHeading
        eyebrow="Roadmaps"
        title="Know what to learn next"
        description="Step-by-step paths from fundamentals to production."
        href="/roadmaps"
        linkLabel="All roadmaps"
      />
      <div className="mt-10 space-y-4">
        {roadmaps.map((r) => (
          <RoadmapRow key={r.id} roadmap={r} />
        ))}
      </div>
    </Container>
  );
}

async function TrendingLaunches() {
  await connection();
  const top = (await getLeaderboard())
    .flatMap((d) => d.projects)
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 6);

  if (top.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm">
        <p className="text-muted-foreground">No launches yet this week.</p>
        <Link href="/launch" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}>
          Be the first to launch
        </Link>
      </div>
    );
  }
  return (
    <ol className={cn("mt-8 grid gap-3", top.length > 1 && "md:grid-cols-2")}>
      {top.map((p, i) => (
        <li key={p.id} className="relative flex items-center gap-4 rounded-xl border bg-background p-4 transition-colors hover:border-foreground/25">
          <span className="w-4 font-mono text-xs text-muted-foreground">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <Link href={`/p/${p.slug}`} className="font-medium after:absolute after:inset-0">
              {p.name}
            </Link>
            <p className="truncate text-sm text-muted-foreground">{p.tagline}</p>
          </div>
          <span className="flex items-center gap-0.5 rounded-md border px-2 py-1 font-mono text-xs tabular-nums">
            <ChevronUp className="size-3.5" /> {p.voteCount}
          </span>
        </li>
      ))}
    </ol>
  );
}
