import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";

export async function requireDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUser.id),
  });

  const email = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase() ?? null;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser.fullName?.trim() ||
    null;

  if (existing) {
    if (email && email !== existing.email) {
      const [updated] = await db
        .update(users)
        .set({ email })
        .where(eq(users.id, existing.id))
        .returning();
      return updated ?? existing;
    }
    return existing;
  }

  const [created] = await db
    .insert(users)
    .values({
      clerkUserId: clerkUser.id,
      email,
    })
    .returning();

  await db
    .insert(profiles)
    .values({ userId: created.id, name })
    .onConflictDoNothing();

  return created;
}
