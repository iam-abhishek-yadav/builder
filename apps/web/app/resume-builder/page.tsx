import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { ResumeBuilderApp } from "@/components/resume-builder/resume-builder-app";

export const metadata: Metadata = {
  title: "Builder | Resume Builder",
  description:
    "Build ATS-friendly resumes with live preview, templates, and AI-assisted descriptions.",
};

export default async function ResumeBuilderPage() {
  await auth.protect();

  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
          Loading resume builder…
        </div>
      }
    >
      <ResumeBuilderApp />
    </Suspense>
  );
}
