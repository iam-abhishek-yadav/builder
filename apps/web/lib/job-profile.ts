import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  awards,
  certifications,
  educations,
  experiences,
  languages,
  profiles,
  projects,
  publications,
  users,
  volunteerRoles,
  type NamedLink,
} from "@/db/schema";
import { decodeProfileId } from "@/lib/profile-path";
import { LANGUAGE_SET, SKILL_SET } from "@/lib/profile-options";

export type JobProfileData = {
  experienceYears: number;
  experienceMonths: number;
  name: string;
  headline: string;
  bio: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  xUrl: string;
  skills: string[];
  openTo: string[];
  experiences: {
    title: string;
    organization: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }[];
  educations: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  projects: {
    name: string;
    description: string;
    liveUrl: string;
    githubUrl: string;
    tags: string;
    startDate: string;
    endDate: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    issuedAt: string;
    expiresAt: string;
    credentialUrl: string;
  }[];
  languages: {
    name: string;
    proficiency: string;
  }[];
  awards: {
    title: string;
    issuer: string;
    awardedAt: string;
    description: string;
    url: string;
  }[];
  publications: {
    title: string;
    venue: string;
    publishedAt: string;
    description: string;
    url: string;
  }[];
  volunteerRoles: {
    title: string;
    organization: string;
    startDate: string;
    endDate: string;
    description: string;
    url: string;
  }[];
};

function emptyProfile(): JobProfileData {
  return {
    experienceYears: 0,
    experienceMonths: 0,
    name: "",
    headline: "",
    bio: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    xUrl: "",
    skills: [],
    openTo: [],
    experiences: [],
    educations: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    publications: [],
    volunteerRoles: [],
  };
}

function namedUrl(links: NamedLink[] | null | undefined, label: string) {
  return (
    links?.find((link) => link.label.toLowerCase() === label.toLowerCase())
      ?.url ?? ""
  );
}

function toLinks(
  entries: { label: string; url: string }[],
): NamedLink[] {
  return entries
    .map((entry) => ({
      label: entry.label.trim(),
      url: entry.url.trim(),
    }))
    .filter((entry) => entry.url.length > 0);
}

function dateOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function loadJobProfile(userId: string) {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      profile: true,
      experiences: { orderBy: [asc(experiences.sortOrder)] },
      educations: { orderBy: [asc(educations.sortOrder)] },
      projects: { orderBy: [asc(projects.sortOrder)] },
      certifications: { orderBy: [asc(certifications.sortOrder)] },
      languages: { orderBy: [asc(languages.sortOrder)] },
      awards: { orderBy: [asc(awards.sortOrder)] },
      publications: { orderBy: [asc(publications.sortOrder)] },
      volunteerRoles: { orderBy: [asc(volunteerRoles.sortOrder)] },
    },
  });

  if (!row) {
    return emptyProfile();
  }

  const profile = row.profile;

  return {
    experienceYears: profile?.experienceYears ?? 0,
    experienceMonths: profile?.experienceMonths ?? 0,
    name: profile?.name ?? "",
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    location: profile?.location ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
    githubUrl: profile?.githubUrl ?? "",
    portfolioUrl: profile?.portfolioUrl ?? "",
    xUrl: profile?.xUrl ?? "",
    skills: (profile?.skills ?? []).filter((skill) => SKILL_SET.has(skill)),
    openTo: profile?.openTo ?? [],
    experiences: row.experiences.map((item) => ({
      title: item.title,
      organization: item.organization,
      location: item.location ?? "",
      startDate: item.startDate ?? "",
      endDate: item.endDate ?? "",
      isCurrent: item.isCurrent,
      description: item.description ?? "",
    })),
    educations: row.educations.map((item) => ({
      school: item.school,
      degree: item.degree ?? "",
      field: item.field ?? "",
      startDate: item.startDate ?? "",
      endDate: item.endDate ?? "",
      description: item.description ?? "",
    })),
    projects: row.projects.map((item) => ({
      name: item.name,
      description: item.description ?? "",
      liveUrl: namedUrl(item.links, "Live"),
      githubUrl: namedUrl(item.links, "GitHub"),
      tags: (item.tags ?? []).join(", "),
      startDate: item.startDate ?? "",
      endDate: item.endDate ?? "",
    })),
    certifications: row.certifications.map((item) => ({
      name: item.name,
      issuer: item.issuer ?? "",
      issuedAt: item.issuedAt ?? "",
      expiresAt: item.expiresAt ?? "",
      credentialUrl: namedUrl(item.links, "Credential"),
    })),
    languages: row.languages
      .filter((item) => LANGUAGE_SET.has(item.name))
      .map((item) => ({
        name: item.name,
        proficiency: item.proficiency,
      })),
    awards: row.awards.map((item) => ({
      title: item.title,
      issuer: item.issuer ?? "",
      awardedAt: item.awardedAt ?? "",
      description: item.description ?? "",
      url: namedUrl(item.links, "Link"),
    })),
    publications: row.publications.map((item) => ({
      title: item.title,
      venue: item.venue ?? "",
      publishedAt: item.publishedAt ?? "",
      description: item.description ?? "",
      url: namedUrl(item.links, "Link"),
    })),
    volunteerRoles: row.volunteerRoles.map((item) => ({
      title: item.title,
      organization: item.organization,
      startDate: item.startDate ?? "",
      endDate: item.endDate ?? "",
      description: item.description ?? "",
      url: namedUrl(item.links, "Link"),
    })),
  } satisfies JobProfileData;
}

export async function loadPublicProfile(profileId: string) {
  const email = decodeProfileId(profileId);
  if (!email) {
    return null;
  }

  const row = await db.query.users.findFirst({
    where: sql`lower(${users.email}) = ${email}`,
    columns: { id: true, email: true },
  });

  if (!row) {
    return null;
  }

  return {
    userId: row.id,
    email: row.email ?? email,
    profile: await loadJobProfile(row.id),
  };
}

const OPEN_TO = [
  "internship",
  "full_time",
  "contract",
  "not_looking",
] as const;
const PROFICIENCIES = [
  "basic",
  "conversational",
  "fluent",
  "native",
] as const;

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function clampExperience(years: number, months: number) {
  const totalMonths = Math.max(
    0,
    Math.round((Number.isFinite(years) ? years : 0) * 12 + (Number.isFinite(months) ? months : 0)),
  );
  return {
    experienceYears: Math.min(60, Math.floor(totalMonths / 12)),
    experienceMonths: totalMonths % 12,
  };
}

export async function saveJobProfile(userId: string, data: JobProfileData) {
  const { experienceYears, experienceMonths } = clampExperience(
    data.experienceYears,
    data.experienceMonths,
  );

  const skills = data.skills.filter((skill) => SKILL_SET.has(skill));
  const openTo = data.openTo.filter((item): item is (typeof OPEN_TO)[number] =>
    OPEN_TO.includes(item as (typeof OPEN_TO)[number]),
  );

  await db.transaction(async (tx) => {
    await tx
      .insert(profiles)
      .values({
        userId,
        experienceYears,
        experienceMonths,
        name: data.name.trim() || null,
        headline: data.headline.trim() || null,
        bio: data.bio.trim() || null,
        location: data.location.trim() || null,
        linkedinUrl: data.linkedinUrl.trim() || null,
        githubUrl: data.githubUrl.trim() || null,
        portfolioUrl: data.portfolioUrl.trim() || null,
        xUrl: data.xUrl.trim() || null,
        skills,
        openTo,
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          experienceYears,
          experienceMonths,
          name: data.name.trim() || null,
          headline: data.headline.trim() || null,
          bio: data.bio.trim() || null,
          location: data.location.trim() || null,
          linkedinUrl: data.linkedinUrl.trim() || null,
          githubUrl: data.githubUrl.trim() || null,
          portfolioUrl: data.portfolioUrl.trim() || null,
          xUrl: data.xUrl.trim() || null,
          skills,
          openTo,
        },
      });

    await tx.delete(experiences).where(eq(experiences.userId, userId));
    if (data.experiences.length > 0) {
      const currentIndex = data.experiences.findLastIndex((item) => item.isCurrent);
      await tx.insert(experiences).values(
        data.experiences.map((item, index) => {
          const isCurrent = index === currentIndex;
          return {
            userId,
            title: item.title.trim(),
            organization: item.organization.trim(),
            location: item.location.trim() || null,
            startDate: dateOrNull(item.startDate),
            endDate: isCurrent ? null : dateOrNull(item.endDate),
            isCurrent,
            description: item.description.trim() || null,
            sortOrder: index,
          };
        }),
      );
    }

    await tx.delete(educations).where(eq(educations.userId, userId));
    if (data.educations.length > 0) {
      await tx.insert(educations).values(
        data.educations.map((item, index) => ({
          userId,
          school: item.school.trim(),
          degree: item.degree.trim() || null,
          field: item.field.trim() || null,
          startDate: dateOrNull(item.startDate),
          endDate: dateOrNull(item.endDate),
          description: item.description.trim() || null,
          sortOrder: index,
        })),
      );
    }

    await tx.delete(projects).where(eq(projects.userId, userId));
    if (data.projects.length > 0) {
      await tx.insert(projects).values(
        data.projects.map((item, index) => ({
          userId,
          name: item.name.trim(),
          description: item.description.trim() || null,
          links: toLinks([
            { label: "Live", url: item.liveUrl },
            { label: "GitHub", url: item.githubUrl },
          ]),
          tags: parseList(item.tags),
          startDate: dateOrNull(item.startDate),
          endDate: dateOrNull(item.endDate),
          sortOrder: index,
        })),
      );
    }

    await tx.delete(certifications).where(eq(certifications.userId, userId));
    if (data.certifications.length > 0) {
      await tx.insert(certifications).values(
        data.certifications.map((item, index) => ({
          userId,
          name: item.name.trim(),
          issuer: item.issuer.trim() || null,
          issuedAt: dateOrNull(item.issuedAt),
          expiresAt: dateOrNull(item.expiresAt),
          links: toLinks([{ label: "Credential", url: item.credentialUrl }]),
          sortOrder: index,
        })),
      );
    }

    await tx.delete(languages).where(eq(languages.userId, userId));
    const knownLanguages = data.languages.filter((item) =>
      LANGUAGE_SET.has(item.name.trim()),
    );
    if (knownLanguages.length > 0) {
      await tx.insert(languages).values(
        knownLanguages.map((item, index) => ({
          userId,
          name: item.name.trim(),
          proficiency: PROFICIENCIES.includes(
            item.proficiency as (typeof PROFICIENCIES)[number],
          )
            ? (item.proficiency as (typeof PROFICIENCIES)[number])
            : "fluent",
          sortOrder: index,
        })),
      );
    }

    await tx.delete(awards).where(eq(awards.userId, userId));
    if (data.awards.length > 0) {
      await tx.insert(awards).values(
        data.awards.map((item, index) => ({
          userId,
          title: item.title.trim(),
          issuer: item.issuer.trim() || null,
          awardedAt: dateOrNull(item.awardedAt),
          description: item.description.trim() || null,
          links: toLinks([{ label: "Link", url: item.url }]),
          sortOrder: index,
        })),
      );
    }

    await tx.delete(publications).where(eq(publications.userId, userId));
    if (data.publications.length > 0) {
      await tx.insert(publications).values(
        data.publications.map((item, index) => ({
          userId,
          title: item.title.trim(),
          venue: item.venue.trim() || null,
          publishedAt: dateOrNull(item.publishedAt),
          description: item.description.trim() || null,
          links: toLinks([{ label: "Link", url: item.url }]),
          sortOrder: index,
        })),
      );
    }

    await tx.delete(volunteerRoles).where(eq(volunteerRoles.userId, userId));
    if (data.volunteerRoles.length > 0) {
      await tx.insert(volunteerRoles).values(
        data.volunteerRoles.map((item, index) => ({
          userId,
          title: item.title.trim(),
          organization: item.organization.trim(),
          startDate: dateOrNull(item.startDate),
          endDate: dateOrNull(item.endDate),
          description: item.description.trim() || null,
          links: toLinks([{ label: "Link", url: item.url }]),
          sortOrder: index,
        })),
      );
    }
  });
}
