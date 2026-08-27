import Link from "next/link";
import { MessageSquare, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuyOfferButton } from "@/components/launchpad/buy-offer-button";
import { UpvoteButton } from "@/components/launchpad/upvote-button";
import type { LaunchListItem } from "@/lib/launchpad";
import { profileHref } from "@/lib/profile-path";

export function LaunchCard({
  launch,
  rank,
  signedIn,
}: {
  launch: LaunchListItem;
  rank: number;
  signedIn: boolean;
}) {
  return (
    <article className="flex gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground tabular-nums">
          #{rank}
        </span>
        <UpvoteButton
          launchId={launch.id}
          count={launch.upvoteCount}
          voted={launch.viewerHasUpvoted}
          signedIn={signedIn}
          disabled={launch.isOwner}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/launchpad/${launch.id}`}
              className="font-display text-xl font-semibold tracking-tight hover:underline"
            >
              {launch.name}
            </Link>
            <p className="mt-1 text-sm leading-6 text-foreground/80">
              {launch.tagline}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
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
              <span className="mx-2">·</span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="size-3.5" />
                {launch.commentCount}
              </span>
              <span className="mx-2">·</span>
              <span className="inline-flex items-center gap-1">
                <ShoppingBag className="size-3.5" />
                {launch.offerCount}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <a href={launch.url} target="_blank" rel="noreferrer" />
              }
            >
              Visit
            </Button>
            <BuyOfferButton
              launchId={launch.id}
              signedIn={signedIn}
              offered={launch.viewerHasOffered}
              disabled={launch.isOwner}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
