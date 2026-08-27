import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { BuyOfferButton } from "@/components/launchpad/buy-offer-button";
import { CommentForm } from "@/components/launchpad/comment-form";
import { UpvoteButton } from "@/components/launchpad/upvote-button";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { requireDbUser } from "@/lib/current-user";
import { loadLaunch } from "@/lib/launchpad";
import { profileHref } from "@/lib/profile-path";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const launch = await loadLaunch(id);
  return {
    title: launch ? `${launch.name} | Launchpad` : "Launch | Builder",
    description: launch?.tagline ?? "A project on Builder Launchpad.",
  };
}

export default async function LaunchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const viewer = await requireDbUser();
  const launch = await loadLaunch(id, viewer?.id);
  if (!launch) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8">
        <Button
          variant="outline"
          className="mb-6"
          nativeButton={false}
          render={<Link href={launch.week.href} />}
        >
          {launch.week.isCurrent ? "This week" : launch.week.label}
        </Button>

        <div className="flex gap-4">
          <UpvoteButton
            launchId={launch.id}
            count={launch.upvoteCount}
            voted={launch.viewerHasUpvoted}
            signedIn={Boolean(viewer)}
            disabled={launch.isOwner}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">
              {launch.week.label} · {launch.week.range}
            </p>
            <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
              {launch.name}
            </h1>
            <p className="mt-2 text-lg text-foreground/80">{launch.tagline}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {launch.makerEmail ? (
                <Link
                  href={profileHref(launch.makerEmail)}
                  className="hover:underline"
                >
                  {launch.makerName}
                </Link>
              ) : (
                launch.makerName
              )}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                nativeButton={false}
                render={
                  <a href={launch.url} target="_blank" rel="noreferrer" />
                }
              >
                Visit
              </Button>
              <BuyOfferButton
                launchId={launch.id}
                signedIn={Boolean(viewer)}
                offered={launch.viewerHasOffered}
                disabled={launch.isOwner}
              />
            </div>
            {launch.description ? (
              <p className="mt-8 whitespace-pre-wrap text-sm leading-7">
                {launch.description}
              </p>
            ) : null}
          </div>
        </div>

        {launch.isOwner && launch.buyOffers.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Offers to buy
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Only you can see these.
            </p>
            <div className="mt-4 grid gap-3">
              {launch.buyOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-xl border border-border p-4"
                >
                  <p className="font-medium">{offer.makerName}</p>
                  {offer.makerEmail ? (
                    <p className="text-sm text-muted-foreground">
                      {offer.makerEmail}
                    </p>
                  ) : null}
                  {offer.note ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {offer.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Comments
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {launch.commentCount === 0
              ? "Be the first to leave feedback."
              : `${launch.commentCount} ${launch.commentCount === 1 ? "comment" : "comments"}`}
          </p>
          <div className="mt-5">
            {viewer ? (
              <CommentForm launchId={launch.id} />
            ) : (
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <Link
                    href={`/sign-in?redirect_url=${encodeURIComponent(`/launchpad/${launch.id}`)}`}
                  />
                }
              >
                Sign in to comment
              </Button>
            )}
          </div>
          <div className="mt-6 grid gap-4">
            {launch.comments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium">{comment.makerName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                  {comment.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
