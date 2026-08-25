"use server";

import { auth } from "@clerk/nextjs/server";
import { LANGUAGE_SET } from "@/lib/profile-options";
import { saveJobProfile, type JobProfileData } from "@/lib/job-profile";
import { requireDbUser } from "@/lib/current-user";

export async function saveProfileAction(data: JobProfileData) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { ok: false, error: "You need to sign in first." };
  }

  const user = await requireDbUser();
  if (!user) {
    return { ok: false, error: "Could not load your account." };
  }

  const experiences = data.experiences.filter(
    (item) => item.title.trim() && item.organization.trim(),
  );
  const educations = data.educations.filter((item) => item.school.trim());
  const projects = data.projects.filter((item) => item.name.trim());
  const certifications = data.certifications.filter((item) => item.name.trim());
  const languages = data.languages.filter((item) =>
    LANGUAGE_SET.has(item.name.trim()),
  );
  const awards = data.awards.filter((item) => item.title.trim());
  const publications = data.publications.filter((item) => item.title.trim());
  const volunteer = data.volunteerRoles.filter(
    (item) => item.title.trim() && item.organization.trim(),
  );

  try {
    await saveJobProfile(user.id, {
      ...data,
      experiences,
      educations,
      projects,
      certifications,
      languages,
      awards,
      publications,
      volunteerRoles: volunteer,
    });
    return { ok: true as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save your profile.";
    return { ok: false as const, error: message };
  }
}
