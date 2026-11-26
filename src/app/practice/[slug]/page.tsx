import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Container, Eyebrow } from "@/components/container";
import { SheetView } from "@/components/practice/sheet-view";
import { getProblemStates, getPublishedSheet } from "@/lib/practice/queries";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/practice/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getPublishedSheet(slug);
  if (!s) return { title: "Sheet not found" };
  return { title: `${s.title} sheet`, description: s.summary };
}

export default function SheetPage({ params }: PageProps<"/practice/[slug]">) {
  return (
    <Suspense
      fallback={
        <Container className="space-y-6 py-12">
          <div className="h-12 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-96 animate-pulse rounded-2xl bg-muted/50" />
        </Container>
      }
    >
      <Sheet params={params} />
    </Suspense>
  );
}

async function Sheet({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [s, user] = await Promise.all([getPublishedSheet(slug), getCurrentUser()]);
  if (!s) notFound();
  const states = user ? await getProblemStates(user.id) : {};

  return (
    <Container className="py-12">
      <Link href="/practice" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All sheets
      </Link>
      <header className="mt-8 max-w-3xl space-y-4">
        <Eyebrow>DSA sheet</Eyebrow>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">{s.title}</h1>
        <p className="text-lg text-pretty text-muted-foreground">{s.summary}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-wider text-muted-foreground uppercase">
          <span>
            {s.stats.total} problems · {s.topics.length} topics
          </span>
          {s.stats.premium ? <span>· {s.stats.premium} need LeetCode Premium</span> : null}
          {s.sourceUrl ? (
            <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 normal-case hover:text-foreground">
              · List by {s.sourceName ?? new URL(s.sourceUrl).hostname} <ExternalLink className="size-3" />
            </a>
          ) : null}
        </p>
      </header>
      <div className="mt-10">
        <SheetView topics={s.topics} states={states} serverSignedIn={Boolean(user)} />
      </div>
    </Container>
  );
}
