"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireDbUser } from "@/lib/current-user";
import { currentWeekStart } from "@/lib/launch-week";
import {
  findMyLaunchThisWeek,
  getLaunchForVote,
  launchBuyOffers,
  launchComments,
  launches,
  launchUpvotes,
} from "@/lib/launchpad";

function text(value: FormDataEntryValue | null, max: number) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function href(value: string) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function pathsFor(launchId: string) {
  revalidatePath("/launchpad");
  revalidatePath(`/launchpad/${launchId}`);
}

export async function createLaunchAction(
  _prev: { ok: boolean; error?: string; id?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const user = await requireDbUser();
  if (!user) {
    return { ok: false, error: "You need to sign in first." };
  }

  const name = text(formData.get("name"), 80);
  const tagline = text(formData.get("tagline"), 140);
  const description = text(formData.get("description"), 4000) || null;
  const url = href(text(formData.get("url"), 500));

  if (!name || !tagline || !url) {
    return {
      ok: false,
      error: "Name, tagline, and a valid http(s) URL are required.",
    };
  }

  const existing = await findMyLaunchThisWeek(user.id);
  if (existing) {
    return { ok: false, error: "You already launched something this week." };
  }

  const [created] = await db
    .insert(launches)
    .values({
      userId: user.id,
      weekStart: currentWeekStart(),
      name,
      tagline,
      description,
      url,
    })
    .returning();

  revalidatePath("/launchpad");
  return { ok: true, id: created.id };
}

export async function toggleUpvoteAction(launchId: string) {
  const user = await requireDbUser();
  if (!user) {
    return { ok: false, error: "You need to sign in first." };
  }

  const launch = await getLaunchForVote(launchId);
  if (!launch) {
    return { ok: false, error: "That launch is gone." };
  }
  if (launch.userId === user.id) {
    return { ok: false, error: "You can't upvote your own launch." };
  }

  const existing = await db.query.launchUpvotes.findFirst({
    where: and(
      eq(launchUpvotes.launchId, launchId),
      eq(launchUpvotes.userId, user.id),
    ),
  });

  if (existing) {
    await db
      .delete(launchUpvotes)
      .where(
        and(
          eq(launchUpvotes.launchId, launchId),
          eq(launchUpvotes.userId, user.id),
        ),
      );
  } else {
    await db.insert(launchUpvotes).values({ launchId, userId: user.id });
  }

  pathsFor(launchId);
  return { ok: true };
}

export async function addCommentAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
) {
  const user = await requireDbUser();
  if (!user) {
    return { ok: false, error: "You need to sign in first." };
  }

  const launchId = text(formData.get("launchId"), 80);
  const body = text(formData.get("body"), 2000);
  if (!launchId || body.length < 2) {
    return { ok: false, error: "Write a short comment first." };
  }

  const launch = await getLaunchForVote(launchId);
  if (!launch) {
    return { ok: false, error: "That launch is gone." };
  }

  await db.insert(launchComments).values({
    launchId,
    userId: user.id,
    body,
  });

  pathsFor(launchId);
  return { ok: true };
}

export async function submitBuyOfferAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
) {
  const user = await requireDbUser();
  if (!user) {
    return { ok: false, error: "You need to sign in first." };
  }

  const launchId = text(formData.get("launchId"), 80);
  const note = text(formData.get("note"), 1000) || null;
  if (!launchId) {
    return { ok: false, error: "Missing launch." };
  }

  const launch = await getLaunchForVote(launchId);
  if (!launch) {
    return { ok: false, error: "That launch is gone." };
  }
  if (launch.userId === user.id) {
    return { ok: false, error: "You can't offer to buy your own launch." };
  }

  try {
    await db.insert(launchBuyOffers).values({
      launchId,
      userId: user.id,
      note,
    });
  } catch {
    return { ok: false, error: "You already offered to buy this." };
  }

  pathsFor(launchId);
  return { ok: true };
}
