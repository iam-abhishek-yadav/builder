import { auth } from "@clerk/nextjs/server";

export function requireAuth() {
  return auth.protect({ unauthenticatedUrl: "/sign-in" });
}
