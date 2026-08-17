import type { Metadata } from "next";
import { requireAuth } from "@/lib/require-auth";
import { OutreachApp } from "@/components/outreach/outreach-app";

export const metadata: Metadata = {
  title: "Builder | Outreach",
  description:
    "Generate personalized recruiter emails from your saved resume and a pasted job description.",
};

export default async function OutreachPage() {
  await requireAuth();
  return <OutreachApp />;
}
