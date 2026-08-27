import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/profile/profile-form";
import { DownloadResumeButton } from "@/components/profile/download-resume-button";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { requireDbUser } from "@/lib/current-user";
import { loadJobProfile } from "@/lib/job-profile";
import { profileHref } from "@/lib/profile-path";

export const metadata: Metadata = {
  title: "Profile | Builder",
  description: "Edit your job profile.",
};

export default async function ProfilePage() {
  await auth.protect();
  const user = await requireDbUser();
  if (!user) {
    redirect("/sign-in");
  }

  const initial = await loadJobProfile(user.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Your profile
            </h1>
            <p className="mt-2 text-muted-foreground">
              This is your job profile — work, projects, certs, and the rest.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DownloadResumeButton />
            {user.email ? (
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={profileHref(user.email)} />}
              >
                View public profile
              </Button>
            ) : null}
          </div>
        </div>
        <ProfileForm initial={initial} email={user.email ?? ""} />
      </main>
      <SiteFooter />
    </>
  );
}
