import { z } from "zod";

/** Paths and words a builder can't take as their handle. */
const RESERVED = new Set([
  "admin", "administrator", "api", "app", "auth", "billing", "blog", "bookmarks", "builder", "builders",
  "dashboard", "docs", "edit", "help", "home", "jobs", "launch", "launchpad", "learn", "login", "logout",
  "me", "new", "null", "p", "privacy", "profile", "profiles", "register", "roadmap", "roadmaps", "root",
  "search", "settings", "ship", "sign-in", "sign-up", "signin", "signup", "staff", "studio", "support",
  "system", "terms", "tools", "u", "undefined", "user", "users", "www",
]);

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "At least 3 characters")
  .max(30, "At most 30 characters")
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Lowercase letters, numbers and dashes (not at the start or end)")
  .refine((h) => !h.includes("--"), "No double dashes")
  .refine((h) => !RESERVED.has(h), "That username is reserved");

/** Suggests a valid handle from a Clerk/GitHub username or name (may still be taken). */
export function suggestHandle(source: string | null | undefined) {
  const base = (source ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 30);
  return handleSchema.safeParse(base).success ? base : "";
}

/** The canonical profile path: the handle once chosen, otherwise the permanent public id. */
export function profilePath(u: { handle: string | null; publicId: string }) {
  return `/u/${u.handle ?? u.publicId}`;
}

/** 8-char lowercase base36 id, e.g. "k7f2m9xq". */
export function randomPublicId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
}
