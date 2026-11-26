import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Pages that need a signed-in user. Server Actions still check auth themselves.
// Note: "/launch" must not be a prefix pattern, or it would also match "/launchpad".
const isProtectedRoute = createRouteMatcher(["/launch", "/launch/(.*)", "/bookmarks(.*)", "/studio(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
