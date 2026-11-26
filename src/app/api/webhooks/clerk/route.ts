import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { tags as launchpadTags } from "@/lib/launchpad/tags";
import { profileTags } from "@/lib/profiles/tags";
import { profileFromClerk } from "@/lib/session";

/**
 * Clerk → local profile sync. Configure in the Clerk Dashboard (Webhooks) with the
 * events user.updated and user.deleted, and set CLERK_WEBHOOK_SIGNING_SECRET.
 * Verified with Svix signatures; anything unverifiable is rejected.
 */
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.updated") {
    const d = evt.data;
    const primary = d.email_addresses?.find((e) => e.id === d.primary_email_address_id)?.email_address;
    const github = d.external_accounts?.find((a) => a.provider === "oauth_github");
    const display = profileFromClerk({
      id: d.id,
      firstName: d.first_name,
      lastName: d.last_name,
      username: d.username,
      imageUrl: d.image_url,
      primaryEmail: primary,
      githubUsername: github?.username,
    });
    // Only updates builders we already know; new ones are created on first visit.
    const updated = await db.update(user).set(display).where(eq(user.id, d.id)).returning({ id: user.id });
    if (updated.length) {
      revalidateTag(profileTags.profiles, "max");
      revalidateTag(profileTags.profile(d.id), "max");
    }
  }

  if (evt.type === "user.deleted" && evt.data.id) {
    const id = evt.data.id;
    try {
      // Cascades to their launches, votes, comments, bookmarks and roadmap progress.
      await db.delete(user).where(eq(user.id, id));
    } catch {
      // Authors of Learn content can't be hard-deleted (articles reference them): anonymize instead.
      await db
        .update(user)
        .set({
          name: "Deleted builder",
          image: null,
          username: null,
          handle: null,
          headline: null,
          bio: null,
          links: [],
          openToWork: false,
          workTypes: [],
          workRoles: null,
          workLocations: [],
          workCity: null,
          showRoadmapProgress: false,
        })
        .where(eq(user.id, id));
    }
    revalidateTag(profileTags.profiles, "max");
    revalidateTag(profileTags.profile(id), "max");
    revalidateTag(launchpadTags.projects, "max"); // their launches/votes may be gone
  }

  return new Response("ok");
}
