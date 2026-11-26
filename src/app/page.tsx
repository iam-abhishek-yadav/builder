import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, ChevronUp, Rocket, Route } from "lucide-react";
import { Container, Eyebrow } from "@/components/container";
import { ArticleCard } from "@/components/learn/article-card";
import { RoadmapCard } from "@/components/roadmaps/roadmap-card";
import { buttonVariants } from "@/components/ui/button";
import { getLeaderboard } from "@/lib/launchpad/queries";
import { getHighlightedArticles, getPublicTopics, type ArticleSummary } from "@/lib/learn/queries";
import { getPublishedRoadmaps } from "@/lib/roadmaps/queries";
import { cn } from "@/lib/utils";

// Public landing page: no sign-in required. Static parts prerender into the shell;
// live sections stream in from cached queries. Only shows what is live today.

export default function LandingPage() {
  return (
    <>
      <Hero />

      <section className="border-y bg-muted/30">
        <Container className="py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <Eyebrow>Learn</Eyebrow>
              <h2 className="text-3xl font-semibold tracking-tight">Start reading</h2>
              <p className="text-muted-foreground">
                In-depth write-ups on how real software is designed, built and scaled.
              </p>
            </div>
            <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              All articles <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <Suspense fallback={<LearnSkeleton />}>
            <LearnHighlights />
          </Suspense>
        </Container>
      </section>

      <Suspense>
        <RoadmapHighlights />
      </Suspense>

      <Container className="grid gap-16 py-20 lg:grid-cols-[2fr_3fr]">
        <section className="space-y-5">
          <Eyebrow>What&apos;s here</Eyebrow>
          <div className="grid gap-3">
            <Pillar
              icon={Rocket}
              title="Launchpad"
              body="Ship a project and get upvotes and real feedback from other engineers. Every day has its own leaderboard."
              href="/launchpad"
              cta="See this week's launches"
            />
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
          </div>
        </section>
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1.5">
              <Eyebrow>Launchpad</Eyebrow>
              <h2 className="text-2xl font-semibold tracking-tight">Trending this week</h2>
            </div>
            <Link href="/launchpad" className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              All launches <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <Suspense fallback={<div className="h-72 animate-pulse rounded-xl border bg-muted/50" />}>
            <TrendingLaunches />
          </Suspense>
        </section>
      </Container>

      <Container>
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
      <Container className="relative py-24 sm:py-32">
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
            <Link href="/launchpad" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Explore Launchpad
            </Link>
          </div>
        </div>
        <Suspense fallback={<div className="mt-16 h-5" />}>
          <LiveStats />
        </Suspense>
      </Container>
    </section>
  );
}

function Pillar({
  icon: Icon,
  title,
  body,
  href,
  cta,
}: {
  icon: typeof Rocket;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Link href={href} className="group rounded-xl border bg-background p-5 transition-colors hover:border-foreground/25">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-lg border">
          <Icon className="size-4" />
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium group-hover:text-brand">
        {cta} <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}

async function LiveStats() {
  await connection(); // live numbers at request time (queries themselves are cached)
  const [days, topics] = await Promise.all([getLeaderboard(), getPublicTopics()]);
  const launches = days.reduce((n, d) => n + d.projects.length, 0);
  const articles = topics.reduce((n, t) => n + t.articles, 0);
  return (
    <dl className="mt-16 flex flex-wrap gap-x-10 gap-y-3 font-mono text-sm">
      <Stat label="launches this week" value={launches} />
      <Stat label={articles === 1 ? "article" : "articles"} value={articles} />
      {topics.length > 0 ? <Stat label={topics.length === 1 ? "topic" : "topics"} value={topics.length} /> : null}
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="sr-only">{label}</dt>
      <dd className="text-foreground tabular-nums">{value}</dd>
      <span aria-hidden className="text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

async function LearnHighlights() {
  await connection();
  const [articles, topics] = await Promise.all([getHighlightedArticles(7), getPublicTopics()]);

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
      <SpotlightCard article={spotlight} />
      {rest.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SpotlightCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border bg-background p-6 transition-colors hover:border-foreground/25 sm:p-10">
      <div className="bg-dot-grid absolute inset-y-0 right-0 hidden w-1/3 opacity-60 [mask-image:linear-gradient(to_left,black,transparent)] md:block" aria-hidden />
      <div className="relative max-w-2xl">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          <span className="text-brand">{article.topic.name}</span>
          <span aria-hidden>·</span>
          <span>{article.readingMinutes} min read</span>
        </div>
        <h3 className="mt-4 text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
          <Link href={`/learn/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 text-pretty text-muted-foreground">{article.summary}</p>
        <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium group-hover:text-brand">
          Read the article <ArrowUpRight className="size-4" />
        </span>
      </div>
    </article>
  );
}

/** Hidden entirely until at least one roadmap is published. */
async function RoadmapHighlights() {
  await connection();
  const roadmaps = (await getPublishedRoadmaps(3)).slice(0, 3);
  if (roadmaps.length === 0) return null;
  return (
    <Container className="pt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <Eyebrow>Roadmaps</Eyebrow>
          <h2 className="text-3xl font-semibold tracking-tight">Know what to learn next</h2>
          <p className="text-muted-foreground">Step-by-step paths from fundamentals to production.</p>
        </div>
        <Link href="/roadmaps" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          All roadmaps <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roadmaps.map((r) => (
          <RoadmapCard key={r.id} roadmap={r} />
        ))}
      </div>
    </Container>
  );
}

function LearnSkeleton() {
  return (
    <div className="mt-10 space-y-6">
      <div className="h-56 animate-pulse rounded-2xl border bg-muted/50" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-xl border bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

async function TrendingLaunches() {
  await connection();
  const top = (await getLeaderboard())
    .flatMap((d) => d.projects)
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 5);

  if (top.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm">
        <p className="text-muted-foreground">No launches yet this week.</p>
        <Link href="/launch" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}>
          Be the first to launch
        </Link>
      </div>
    );
  }
  return (
    <ol className="divide-y rounded-xl border">
      {top.map((p, i) => (
        <li key={p.id} className="relative flex items-center gap-4 p-4 hover:bg-muted/50">
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
