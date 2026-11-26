import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

/**
 * Admins have `publicMetadata.role === "admin"` in Clerk (set via the Dashboard or
 * Backend API). Calls Clerk's API, so use it only on admin pages and actions.
 */
export async function isAdmin() {
  const user = await currentUser();
  return user?.publicMetadata?.role === "admin";
}

/** For admin-only pages and actions: non-admins get a 404 rather than a hint that it exists. */
export async function requireAdmin() {
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") notFound();
  return user;
}
