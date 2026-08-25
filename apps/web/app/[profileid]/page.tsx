import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ProfileView } from "@/components/profile/profile-view";
import { requireDbUser } from "@/lib/current-user";
import { loadPublicProfile } from "@/lib/job-profile";

export async function generateMetadata({
  params,
}: PageProps<"/[profileid]">): Promise<Metadata> {
  const { profileid } = await params;
  const result = await loadPublicProfile(profileid);
  const title = result?.profile.name || result?.email;
  return {
    title: title ? `${title} | Builder` : "Profile | Builder",
    description: result?.profile.headline || "Job profile on Builder.",
  };
}

export default async function PublicProfilePage({
  params,
}: PageProps<"/[profileid]">) {
  await auth.protect();
  const viewer = await requireDbUser();
  if (!viewer) {
    redirect("/sign-in");
  }

  const { profileid } = await params;
  const result = await loadPublicProfile(profileid);
  if (!result) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8">
        <ProfileView
          email={result.email}
          data={result.profile}
          isOwner={viewer.id === result.userId}
        />
      </main>
      <SiteFooter />
    </>
  );
}
