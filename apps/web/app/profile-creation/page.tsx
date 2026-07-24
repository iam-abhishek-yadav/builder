import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { ProfileCreationApp } from "@/components/profile-creation/profile-creation-app";

export const metadata: Metadata = {
  title: "Create Your Profile | Builder",
  description:
    "Set up your professional identity, bio, links, and portrait in a few guided steps.",
};

export default async function ProfileCreationPage() {
  await auth.protect();
  return <ProfileCreationApp />;
}
