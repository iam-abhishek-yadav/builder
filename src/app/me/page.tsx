import { redirect } from "next/navigation";
import { Suspense } from "react";
import { profilePath } from "@/lib/profiles/handle";
import { requireUser } from "@/lib/session";

/** Stable link to "my profile" (used in the user menu): redirects to the canonical profile URL. */
export default function MePage() {
  return (
    <Suspense>
      <RedirectToProfile />
    </Suspense>
  );
}

async function RedirectToProfile() {
  const me = await requireUser("/me");
  redirect(profilePath(me));
  return null;
}
