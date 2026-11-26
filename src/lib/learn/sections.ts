import { BookOpen, Code2, Route } from "lucide-react";

/** Everything under "Learn": used by the header menu and the Learn hub tabs. */
export const learnSections = [
  { href: "/learn", label: "Articles", description: "Deep dives and case studies", icon: BookOpen },
  { href: "/roadmaps", label: "Roadmaps", description: "Step-by-step paths with progress", icon: Route },
  { href: "/practice", label: "DSA sheets", description: "Curated problem lists like Blind 75", icon: Code2 },
] as const;

export type LearnSectionHref = (typeof learnSections)[number]["href"];
