import type { Metadata } from "next";
import { requireAuth } from "@/lib/require-auth";
import { ProfileCreationApp } from "@/components/profile-creation/profile-creation-app";

export const metadata: Metadata = {
  title: "Create Your Profile | Builder",
  description:
    "Set up your professional identity, bio, links, and portrait in a few guided steps.",
};

export default async function ProfileCreationPage() {
  await requireAuth();
  return <ProfileCreationApp />;
}
