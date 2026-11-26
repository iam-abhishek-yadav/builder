"use server";

import { and, eq, ne, or } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { user, type WorkLocation, type WorkType } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { handleSchema } from "./handle";
import { profileTags } from "./tags";

const WORK_TYPES = ["full-time", "contract", "internship"] as const satisfies readonly WorkType[];
const WORK_LOCATIONS = ["remote", "hybrid", "onsite"] as const satisfies readonly WorkLocation[];
const MAX_LINKS = 5;

const httpUrl = z.url({ protocol: /^https?$/, error: "Enter a full http(s) URL" });

const profileSchema = z.object({
  handle: z.union([z.literal(""), handleSchema]),
  headline: z.string().trim().max(100, "At most 100 characters"),
  bio: z.string().trim().max(600, "At most 600 characters"),
  links: z.array(z.string().trim()).transform((l) => l.filter(Boolean)).pipe(z.array(httpUrl).max(MAX_LINKS)),
  openToWork: z.boolean(),
  workTypes: z.array(z.enum(WORK_TYPES)),
  workRoles: z.string().trim().max(100, "At most 100 characters"),
  workLocations: z.array(z.enum(WORK_LOCATIONS)),
  workCity: z.string().trim().max(60, "At most 60 characters"),
  showRoadmapProgress: z.boolean(),
});

export type ProfileFormState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.input<typeof profileSchema>, string[]>>;
  /** Saved values, echoed back so the form shows what was stored. */
  saved?: { handle: string | null; publicId: string };
};

export async function saveProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const me = await requireUser("/settings/profile");

  const parsed = profileSchema.safeParse({
    handle: String(formData.get("handle") ?? ""),
    headline: String(formData.get("headline") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    links: formData.getAll("links").map(String),
    openToWork: formData.get("openToWork") === "on",
    workTypes: formData.getAll("workTypes").map(String),
    workRoles: String(formData.get("workRoles") ?? ""),
    workLocations: formData.getAll("workLocations").map(String),
    workCity: String(formData.get("workCity") ?? ""),
    showRoadmapProgress: formData.get("showRoadmapProgress") === "on",
  });
  if (!parsed.success) {
    return { error: "Fix the highlighted fields.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const data = parsed.data;

  // Once chosen, a username can be changed but not removed (it is the profile's address).
  if (!data.handle && me.handle) {
    return { error: "Fix the highlighted fields.", fieldErrors: { handle: ["Choose a username (it can be changed, not removed)"] } };
  }
  if (data.handle && data.handle !== me.handle) {
    const [taken] = await db
      .select({ id: user.id })
      .from(user)
      .where(and(ne(user.id, me.id), or(eq(user.handle, data.handle), eq(user.publicId, data.handle))))
      .limit(1);
    if (taken) return { error: "Fix the highlighted fields.", fieldErrors: { handle: ["That username is taken"] } };
  }

  try {
    await db
      .update(user)
      .set({
        handle: data.handle || null,
        headline: data.headline || null,
        bio: data.bio || null,
        links: data.links.map((url) => ({ url })),
        openToWork: data.openToWork,
        workTypes: data.workTypes,
        workRoles: data.workRoles || null,
        workLocations: data.workLocations,
        workCity: data.workCity || null,
        showRoadmapProgress: data.showRoadmapProgress,
      })
      .where(eq(user.id, me.id));
  } catch (e) {
    // Unique violation: someone took the handle between the check and the update.
    if (e instanceof Error && /unique|duplicate/i.test(e.message + String((e as { cause?: unknown }).cause ?? ""))) {
      return { error: "Fix the highlighted fields.", fieldErrors: { handle: ["That username is taken"] } };
    }
    throw e;
  }

  updateTag(profileTags.profiles);
  updateTag(profileTags.profile(me.id));
  return {
    ok: true,
    message: data.handle && data.handle !== me.handle ? `Saved. Your profile is now at /u/${data.handle}` : "Saved.",
    saved: { handle: data.handle || null, publicId: me.publicId },
  };
}
