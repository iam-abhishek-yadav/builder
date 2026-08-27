import { formatDateRange, formatMonthYear } from "@/lib/format-date";
import type { JobProfileData } from "@/lib/job-profile";

export type ResumeLink = {
  href: string;
  label: string;
};

export type ResumeEntry = {
  leftTitle: string;
  rightTitle?: string;
  leftSubtitle?: string;
  rightSubtitle?: string;
  items: string[];
};

export type ResumeDoc = {
  name: string;
  headline?: string;
  email?: string;
  location?: string;
  links: ResumeLink[];
  summary?: string;
  experience: ResumeEntry[];
  projects: ResumeEntry[];
  skills?: string;
  education: ResumeEntry[];
  certifications: ResumeEntry[];
  languages?: string;
  awards: ResumeEntry[];
  publications: ResumeEntry[];
  volunteer: ResumeEntry[];
};

const PROFICIENCIES: Record<string, string> = {
  basic: "Basic",
  conversational: "Conversational",
  fluent: "Fluent",
  native: "Native",
};

function text(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

function bullets(value: string | undefined) {
  if (!value) {
    return [];
  }
  return value
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

function href(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function pathLabel(url: string, prefix: string) {
  try {
    const parsed = new URL(href(url));
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      return `${prefix}/${parts.join("/")}`;
    }
  } catch {
    /* use host */
  }
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function dates(start: string, end: string, current = false) {
  return text(formatDateRange(start, end, current));
}

export function profileToResume(data: JobProfileData, email: string): ResumeDoc {
  const links: ResumeLink[] = [];
  if (text(data.linkedinUrl)) {
    links.push({
      href: href(data.linkedinUrl),
      label: pathLabel(data.linkedinUrl, "linkedin"),
    });
  }
  if (text(data.githubUrl)) {
    links.push({
      href: href(data.githubUrl),
      label: pathLabel(data.githubUrl, "github"),
    });
  }
  if (text(data.portfolioUrl)) {
    links.push({
      href: href(data.portfolioUrl),
      label: data.portfolioUrl.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
    });
  }
  if (text(data.xUrl)) {
    links.push({
      href: href(data.xUrl),
      label: pathLabel(data.xUrl, "x"),
    });
  }

  return {
    name: text(data.name) || text(email) || "Resume",
    headline: text(data.headline),
    email: text(email),
    location: text(data.location),
    links,
    summary: text(data.bio),
    experience: data.experiences.map((item) => ({
      leftTitle: item.title.trim(),
      rightTitle: dates(item.startDate, item.endDate, item.isCurrent),
      leftSubtitle: text(item.organization),
      rightSubtitle: text(item.location),
      items: bullets(text(item.description)),
    })),
    projects: data.projects.map((item) => ({
      leftTitle: item.tags.trim()
        ? `${item.name.trim()}  |  ${item.tags.trim()}`
        : item.name.trim(),
      rightTitle: dates(item.startDate, item.endDate),
      items: bullets(text(item.description)),
    })),
    skills: data.skills.length > 0 ? data.skills.join(", ") : undefined,
    education: data.educations.map((item) => {
      const degreeField = [text(item.degree), text(item.field)]
        .filter(Boolean)
        .join(" -- ");
      return {
        leftTitle: degreeField || item.school.trim(),
        rightTitle: dates(item.startDate, item.endDate),
        leftSubtitle: degreeField ? item.school.trim() : undefined,
        items: bullets(text(item.description)),
      };
    }),
    certifications: data.certifications.map((item) => ({
      leftTitle: item.name.trim(),
      rightTitle: item.issuedAt ? formatMonthYear(item.issuedAt) : undefined,
      leftSubtitle: text(item.issuer),
      items: [],
    })),
    languages:
      data.languages.length > 0
        ? data.languages
            .map((item) => {
              const level = PROFICIENCIES[item.proficiency];
              return level ? `${item.name} (${level})` : item.name;
            })
            .join(", ")
        : undefined,
    awards: data.awards.map((item) => ({
      leftTitle: item.title.trim(),
      rightTitle: item.awardedAt ? formatMonthYear(item.awardedAt) : undefined,
      leftSubtitle: text(item.issuer),
      items: bullets(text(item.description)),
    })),
    publications: data.publications.map((item) => ({
      leftTitle: item.title.trim(),
      rightTitle: item.publishedAt
        ? formatMonthYear(item.publishedAt)
        : undefined,
      leftSubtitle: text(item.venue),
      items: bullets(text(item.description)),
    })),
    volunteer: data.volunteerRoles.map((item) => ({
      leftTitle: item.title.trim(),
      rightTitle: dates(item.startDate, item.endDate),
      leftSubtitle: text(item.organization),
      items: bullets(text(item.description)),
    })),
  };
}

export function resumeFilename(name: string) {
  const slug =
    name
      .trim()
      .normalize("NFKD")
      .replace(/[^\w]+/g, "-")
      .replace(/^-+|-+$/g, "") || "resume";
  return `${slug}-resume.pdf`;
}
