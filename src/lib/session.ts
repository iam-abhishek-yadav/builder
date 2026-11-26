import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { user } from "@/db/schema";
import { randomPublicId } from "@/lib/profiles/handle";

export type CurrentUser = {
  id: string;
  name: string;
  image: string | null;
  username: string | null;
  handle: string | null;
  publicId: string;
};

/**
 * The signed-in user's local profile, or null. Reads request data (Clerk auth),
 * so callers must render inside <Suspense> (Cache Components). Deduplicated per request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const { userId } = await auth();
  if (!userId) return null;
  return ensureLocalUser(userId);
});

/** Like getCurrentUser, but sends signed-out visitors to Clerk sign-in. */
export async function requireUser(returnBackUrl = "/"): Promise<CurrentUser> {
  const session = await auth();
  if (!session.userId) return session.redirectToSignIn({ returnBackUrl });
  const current = await ensureLocalUser(session.userId);
  if (!current) return session.redirectToSignIn({ returnBackUrl });
  return current;
}

const currentUserFields = {
  id: user.id,
  name: user.name,
  image: user.image,
  username: user.username,
  handle: user.handle,
  publicId: user.publicId,
};

/** Display fields derived from a Clerk user (shared with the Clerk webhook). */
export function profileFromClerk(clerkUser: {
  id: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
  primaryEmail?: string | null;
  githubUsername?: string | null;
}) {
  const fullName = clerkUser.fullName ?? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");
  return {
    name:
      fullName ||
      clerkUser.username ||
      clerkUser.githubUsername ||
      clerkUser.primaryEmail?.split("@")[0] ||
      "Builder",
    image: clerkUser.imageUrl || null,
    username: clerkUser.username || clerkUser.githubUsername || null,
  };
}

/** A public id that is free both as an id and as someone's handle. */
export async function uniquePublicId() {
  for (let i = 0; i < 5; i++) {
    const id = randomPublicId();
    const [clash] = await db
      .select({ id: user.id })
      .from(user)
      .where(or(eq(user.publicId, id), eq(user.handle, id)))
      .limit(1);
    if (!clash) return id;
  }
  throw new Error("Could not allocate a public id");
}

/** Creates the local profile row from Clerk on first sight, so app tables can reference it. */
async function ensureLocalUser(userId: string): Promise<CurrentUser | null> {
  const [existing] = await db.select(currentUserFields).from(user).where(eq(user.id, userId)).limit(1);
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) return null;

  const github = clerkUser.externalAccounts.find((a) => a.provider === "oauth_github");
  const display = profileFromClerk({
    id: clerkUser.id,
    fullName: clerkUser.fullName,
    username: clerkUser.username,
    imageUrl: clerkUser.imageUrl,
    primaryEmail: clerkUser.primaryEmailAddress?.emailAddress,
    githubUsername: github?.username,
  });
  const [row] = await db
    .insert(user)
    .values({ id: clerkUser.id, ...display, publicId: await uniquePublicId() })
    .onConflictDoUpdate({ target: user.id, set: display })
    .returning(currentUserFields);
  return row;
}
