import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Container, Eyebrow } from "@/components/container";
import { RoadmapView } from "@/components/roadmaps/roadmap-view";
import { getPublishedRoadmap, getRoadmapProgress } from "@/lib/roadmaps/queries";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/roadmaps/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getPublishedRoadmap(slug);
  if (!roadmap) return { title: "Roadmap not found" };
  return { title: `${roadmap.title} roadmap`, description: roadmap.summary };
}

export default function RoadmapPage({ params }: PageProps<"/roadmaps/[slug]">) {
  return (
    <Suspense
      fallback={
        <Container className="space-y-6 py-12">
          <div className="h-12 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-96 animate-pulse rounded-xl bg-muted/60" />
        </Container>
      }
    >
      <RoadmapDetail params={params} />
    </Suspense>
  );
}

async function RoadmapDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [roadmap, user] = await Promise.all([getPublishedRoadmap(slug), getCurrentUser()]);
  if (!roadmap) notFound();
  const doneKeys = user ? await getRoadmapProgress(user.id, roadmap.id) : [];
  const { stages, stepCount } = roadmap.parsed;

  return (
    <Container className="py-12">
      <Link href="/roadmaps" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All roadmaps
      </Link>
      <header className="mt-8 max-w-3xl space-y-4">
        <Eyebrow>Roadmap</Eyebrow>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">{roadmap.title}</h1>
        <p className="text-lg text-pretty text-muted-foreground">{roadmap.summary}</p>
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          {stages.length} stages · {stepCount} steps
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_200px]">
        <RoadmapView
          stages={stages}
          articles={roadmap.articles}
          roadmapId={roadmap.id}
          doneKeys={doneKeys}
          serverSignedIn={Boolean(user)}
        />
        <aside className="hidden lg:block">
          <nav aria-label="Stages" className="sticky top-24 space-y-3 text-sm">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Stages</p>
            <ol className="space-y-2">
              {stages.map((s, i) => (
                <li key={s.key}>
                  <a href={`#${s.key}`} className="flex gap-2 text-muted-foreground hover:text-foreground">
                    <span className="font-mono text-xs leading-5">{i + 1}.</span> {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>
    </Container>
  );
}
