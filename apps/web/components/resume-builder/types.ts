export type ResumeTemplate = "executive" | "modern" | "minimal";

export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "custom";

export type SectionEntry = {
  id: string;
  primary: string;
  secondary: string;
  description: string;
};

export type ResumeSection = {
  id: string;
  type: SectionType;
  title: string;
  entries: SectionEntry[];
};

export type ResumeData = {
  name: string;
  title: string;
  sections: ResumeSection[];
  template: ResumeTemplate;
  /** @deprecated migrated into sections */
  experiences?: Array<{
    id: number;
    company: string;
    role: string;
    desc: string;
  }>;
};

export const RESUME_STORAGE_KEY = "builder_resume";

export const SECTION_CATALOG: {
  type: SectionType;
  label: string;
  defaultTitle: string;
}[] = [
  { type: "summary", label: "Summary", defaultTitle: "Summary" },
  { type: "experience", label: "Experience", defaultTitle: "Experience" },
  { type: "education", label: "Education", defaultTitle: "Education" },
  { type: "skills", label: "Skills", defaultTitle: "Skills" },
  { type: "projects", label: "Projects", defaultTitle: "Projects" },
  { type: "custom", label: "Custom", defaultTitle: "Custom Section" },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEntry(
  partial?: Partial<SectionEntry>,
): SectionEntry {
  return {
    id: uid(),
    primary: "",
    secondary: "",
    description: "",
    ...partial,
  };
}

export function createSection(
  type: SectionType,
  title?: string,
): ResumeSection {
  const catalog = SECTION_CATALOG.find((item) => item.type === type);
  const defaultTitle = title ?? catalog?.defaultTitle ?? "Section";

  if (type === "summary") {
    return {
      id: uid(),
      type,
      title: defaultTitle,
      entries: [
        createEntry({
          description:
            "Product-minded engineer with a focus on polished UX and reliable systems.",
        }),
      ],
    };
  }

  if (type === "skills") {
    return {
      id: uid(),
      type,
      title: defaultTitle,
      entries: [
        createEntry({
          primary: "Languages",
          description: "TypeScript, Python, Go",
        }),
        createEntry({
          primary: "Tools",
          description: "React, Next.js, Node.js, PostgreSQL",
        }),
      ],
    };
  }

  if (type === "education") {
    return {
      id: uid(),
      type,
      title: defaultTitle,
      entries: [
        createEntry({
          primary: "University Name",
          secondary: "B.S. Computer Science",
          description: "Relevant coursework, honors, or activities.",
        }),
      ],
    };
  }

  if (type === "projects") {
    return {
      id: uid(),
      type,
      title: defaultTitle,
      entries: [
        createEntry({
          primary: "Project Name",
          secondary: "React · Node.js",
          description: "What you built and the outcome.",
        }),
      ],
    };
  }

  if (type === "experience") {
    return {
      id: uid(),
      type,
      title: defaultTitle,
      entries: [
        createEntry({
          primary: "Builder Inc",
          secondary: "Software Engineer",
          description:
            "Leading AI integrations for career development tools.",
        }),
      ],
    };
  }

  return {
    id: uid(),
    type: "custom",
    title: defaultTitle,
    entries: [createEntry()],
  };
}

export function getDefaultSections(): ResumeSection[] {
  return [
    createSection("summary"),
    createSection("experience"),
    createSection("education"),
    createSection("skills"),
  ];
}

export const DEFAULT_RESUME: ResumeData = {
  name: "",
  title: "",
  sections: [],
  template: "executive",
};

export function isResumeTemplate(value: string | null): value is ResumeTemplate {
  return value === "executive" || value === "modern" || value === "minimal";
}

export function normalizeResumeData(saved: Partial<ResumeData>): ResumeData {
  let sections = saved.sections;

  if (!sections?.length && saved.experiences?.length) {
    sections = [
      createSection("summary"),
      {
        id: uid(),
        type: "experience",
        title: "Experience",
        entries: saved.experiences.map((exp) =>
          createEntry({
            primary: exp.company,
            secondary: exp.role,
            description: exp.desc,
          }),
        ),
      },
      createSection("education"),
      createSection("skills"),
    ];
  }

  return {
    name: saved.name ?? "",
    title: saved.title ?? "",
    sections: sections?.length ? sections : getDefaultSections(),
    template:
      saved.template && isResumeTemplate(saved.template)
        ? saved.template
        : "executive",
  };
}

export function entryPlaceholders(type: SectionType): {
  primary: string;
  secondary: string;
  description: string;
} {
  switch (type) {
    case "experience":
      return {
        primary: "Company",
        secondary: "Role",
        description: "Describe your impact...",
      };
    case "education":
      return {
        primary: "School",
        secondary: "Degree",
        description: "Details, honors, coursework...",
      };
    case "skills":
      return {
        primary: "Category",
        secondary: "",
        description: "Skill list (comma-separated)...",
      };
    case "projects":
      return {
        primary: "Project",
        secondary: "Stack / link",
        description: "What you built...",
      };
    case "summary":
      return {
        primary: "",
        secondary: "",
        description: "Short professional summary...",
      };
    default:
      return {
        primary: "Heading",
        secondary: "Subheading",
        description: "Details...",
      };
  }
}
