import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { user } from "@/db/schema";

export type CurrentUser = {
  id: string;
  name: string;
  image: string | null;
  username: string | null;
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

const profileFields = {
  id: user.id,
  name: user.name,
  image: user.image,
  username: user.username,
};

/** Creates the local profile row from Clerk on first sight, so app tables can reference it. */
async function ensureLocalUser(userId: string): Promise<CurrentUser | null> {
  const [existing] = await db.select(profileFields).from(user).where(eq(user.id, userId)).limit(1);
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) return null;

  const github = clerkUser.externalAccounts.find((a) => a.provider === "oauth_github");
  const profile = {
    id: clerkUser.id,
    name:
      clerkUser.fullName ||
      clerkUser.username ||
      github?.username ||
      clerkUser.primaryEmailAddress?.emailAddress.split("@")[0] ||
      "Builder",
    image: clerkUser.imageUrl || null,
    username: clerkUser.username || github?.username || null,
  };
  await db
    .insert(user)
    .values(profile)
    .onConflictDoUpdate({
      target: user.id,
      set: { name: profile.name, image: profile.image, username: profile.username },
    });
  return profile;
}
