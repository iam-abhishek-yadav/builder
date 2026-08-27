import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { requireDbUser } from "@/lib/current-user";
import { loadJobProfile } from "@/lib/job-profile";
import { profileToResume, resumeFilename } from "@/lib/resume";

export const metadata: Metadata = {
  title: "Resume | Builder",
  description: "Preview your resume.",
};

export default async function ResumePreviewPage() {
  await auth.protect();
  const user = await requireDbUser();
  if (!user) {
    redirect("/sign-in");
  }

  const profile = await loadJobProfile(user.id);
  const resume = profileToResume(profile, user.email ?? "");
  const filename = resumeFilename(resume.name);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Resume
            </h1>
            <p className="mt-2 text-muted-foreground">
              This is the PDF you download — same layout, same fonts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/profile" />}
            >
              Back to profile
            </Button>
            <Button
              nativeButton={false}
              render={
                <a href="/profile/resume/pdf?download=1" download={filename} />
              }
            >
              Download PDF
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <object
            title="Resume preview"
            data="/profile/resume/pdf"
            type="application/pdf"
            className="h-[min(1100px,calc(100dvh-12rem))] w-full bg-white"
          >
            <p className="p-6 text-sm text-muted-foreground">
              Open the{" "}
              <a className="underline" href="/profile/resume/pdf">
                resume PDF
              </a>{" "}
              if it does not display here.
            </p>
          </object>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
