import Link from "next/link";
import { MessageSquare, Package } from "lucide-react";
import { LaunchLogo } from "@/components/launchpad/launch-logo";
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
    <article className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-5 hover:bg-black/[0.03] sm:gap-4">
      <span className="w-6 shrink-0 text-sm text-muted-foreground/80 tabular-nums">
        #{rank}
      </span>
      <Link href={`/launchpad/${launch.id}`} className="shrink-0">
        <LaunchLogo name={launch.name} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/launchpad/${launch.id}`} className="block">
          <p className="text-[0.95rem] leading-6 sm:text-base">
            <span className="font-semibold tracking-tight">{launch.name}</span>
            <span className="text-foreground/75"> - {launch.tagline}</span>
          </p>
          {launch.description ? (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {launch.description}
            </p>
          ) : null}
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {launch.commentCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Package className="size-3.5" />
            {launch.offerCount}
          </span>
          {launch.makerEmail ? (
            <Link
              href={profileHref(launch.makerEmail)}
              className="hover:text-foreground hover:underline"
            >
              {launch.makerName}
            </Link>
          ) : (
            <span>{launch.makerName}</span>
          )}
        </div>
      </div>
      <div className="shrink-0">
        <UpvoteButton
          launchId={launch.id}
          count={launch.upvoteCount}
          voted={launch.viewerHasUpvoted}
          signedIn={signedIn}
          disabled={launch.isOwner}
        />
      </div>
    </article>
  );
}
