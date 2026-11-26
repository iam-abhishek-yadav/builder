import type { Metadata } from "next";
import { SignInButton } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExternalLink, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignedInGate } from "@/components/auth/signed-in-gate";
import { BookmarkButton } from "@/components/launchpad/bookmark-button";
import { CommentForm } from "@/components/launchpad/comment-form";
import { UpvoteButton } from "@/components/launchpad/upvote-button";
import { UserAvatar } from "@/components/user-avatar";
import { getComments, getProjectBySlug, getViewerState } from "@/lib/launchpad/queries";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return { title: project.name, description: project.tagline };
}

export default function ProjectPage({ params }: PageProps<"/p/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6"><div className="h-80 animate-pulse rounded-xl bg-muted" /></div>}>
      <ProjectDetail params={params} />
    </Suspense>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, user] = await Promise.all([getProjectBySlug(slug), getCurrentUser()]);
  if (!project) notFound();

  const viewer = user
    ? await getViewerState(user.id, [project.id])
    : { voted: [], bookmarked: [] };

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 space-y-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          <p className="text-lg text-muted-foreground">{project.tagline}</p>
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        </div>
        <UpvoteButton
          size="lg"
          projectId={project.id}
          count={project.voteCount}
          voted={viewer.voted.includes(project.id)}
          signedIn={Boolean(user)}
        />
      </header>

      <div className="flex flex-wrap gap-2">
        <a
          href={project.websiteUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={buttonVariants()}
        >
          <ExternalLink /> Visit
        </a>
        {project.repoUrl ? (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={buttonVariants({ variant: "outline" })}
          >
            <GitBranch /> Source
          </a>
        ) : null}
        <BookmarkButton
          projectId={project.id}
          bookmarked={viewer.bookmarked.includes(project.id)}
          signedIn={Boolean(user)}
        />
      </div>

      <p className="whitespace-pre-line leading-7">{project.description}</p>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <UserAvatar name={project.maker.name} image={project.maker.image} className="size-6" />
        <span>
          Launched by <span className="font-medium text-foreground">{project.maker.name}</span>
          {" · "}
          {dateFormat.format(project.launchedAt)}
        </span>
      </div>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Comments ({project.commentCount})</h2>
        <SignedInGate
          serverSignedIn={Boolean(user)}
          fallback={
            <p className="text-sm text-muted-foreground">
              <SignInButton mode="modal">
                <button type="button" className="underline">
                  Sign in
                </button>
              </SignInButton>{" "}
              to join the discussion.
            </p>
          }
        >
          <CommentForm projectId={project.id} />
        </SignedInGate>
        <Comments projectId={project.id} />
      </section>
    </article>
  );
}

async function Comments({ projectId }: { projectId: string }) {
  const comments = await getComments(projectId);
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>;
  }
  return (
    <ul className="space-y-5">
      {comments.map((c) => (
        <li key={c.id} className="flex gap-3">
          <UserAvatar name={c.author.name} image={c.author.image} />
          <div className="min-w-0 flex-1">
            <div className="text-sm">
              <span className="font-medium">{c.author.name}</span>{" "}
              <span className="text-muted-foreground">{dateFormat.format(c.createdAt)}</span>
            </div>
            <p className="mt-0.5 whitespace-pre-line text-sm leading-6">{c.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
