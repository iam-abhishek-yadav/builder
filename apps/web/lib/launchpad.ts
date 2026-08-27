import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  launchBuyOffers,
  launchComments,
  launches,
  launchUpvotes,
} from "@/db/schema";
import { currentWeekStart, getLaunchWeek } from "@/lib/launch-week";

const makerWith = {
  user: {
    with: {
      profile: true,
    },
  },
} as const;

function makerName(
  user: {
    email: string | null;
    profile: { name: string | null } | null;
  } | null,
) {
  return user?.profile?.name?.trim() || user?.email || "Builder";
}

export type LaunchListItem = {
  id: string;
  name: string;
  tagline: string;
  url: string;
  makerName: string;
  makerEmail: string | null;
  isOwner: boolean;
  upvoteCount: number;
  commentCount: number;
  offerCount: number;
  viewerHasUpvoted: boolean;
  viewerHasOffered: boolean;
};

export async function loadWeekLaunches(
  weekStart: string,
  viewerId?: string | null,
): Promise<LaunchListItem[]> {
  const rows = await db.query.launches.findMany({
    where: eq(launches.weekStart, weekStart),
    with: {
      ...makerWith,
      upvotes: true,
      comments: true,
      buyOffers: true,
    },
  });

  return rows
    .map((row) => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      url: row.url,
      makerName: makerName(row.user),
      makerEmail: row.user.email,
      isOwner: viewerId === row.userId,
      upvoteCount: row.upvotes.length,
      commentCount: row.comments.length,
      offerCount: row.buyOffers.length,
      viewerHasUpvoted: viewerId
        ? row.upvotes.some((vote) => vote.userId === viewerId)
        : false,
      viewerHasOffered: viewerId
        ? row.buyOffers.some((offer) => offer.userId === viewerId)
        : false,
    }))
    .sort((a, b) => {
      if (b.upvoteCount !== a.upvoteCount) {
        return b.upvoteCount - a.upvoteCount;
      }
      return b.commentCount - a.commentCount;
    });
}

export async function findMyLaunchThisWeek(userId: string) {
  const weekStart = currentWeekStart();
  return db.query.launches.findFirst({
    where: and(eq(launches.userId, userId), eq(launches.weekStart, weekStart)),
  });
}

export async function loadLaunch(id: string, viewerId?: string | null) {
  const row = await db.query.launches.findFirst({
    where: eq(launches.id, id),
    with: {
      ...makerWith,
      upvotes: true,
      comments: {
        with: makerWith,
      },
      buyOffers: {
        with: makerWith,
      },
    },
  });

  if (!row) {
    return null;
  }

  const week = getLaunchWeek(row.weekStart);
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    url: row.url,
    weekStart: row.weekStart,
    week,
    createdAt: row.createdAt,
    makerName: makerName(row.user),
    makerEmail: row.user.email,
    isOwner: viewerId === row.userId,
    upvoteCount: row.upvotes.length,
    commentCount: row.comments.length,
    offerCount: row.buyOffers.length,
    viewerHasUpvoted: viewerId
      ? row.upvotes.some((vote) => vote.userId === viewerId)
      : false,
    viewerHasOffered: viewerId
      ? row.buyOffers.some((offer) => offer.userId === viewerId)
      : false,
    comments: row.comments
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      makerName: makerName(comment.user),
    })),
    buyOffers:
      viewerId === row.userId
        ? row.buyOffers
            .slice()
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((offer) => ({
            id: offer.id,
            note: offer.note,
            createdAt: offer.createdAt,
            makerName: makerName(offer.user),
            makerEmail: offer.user.email,
          }))
        : [],
  };
}

export async function getLaunchForVote(launchId: string) {
  return db.query.launches.findFirst({
    where: eq(launches.id, launchId),
    columns: { id: true, userId: true, weekStart: true },
  });
}

export { launchBuyOffers, launchComments, launches, launchUpvotes };
