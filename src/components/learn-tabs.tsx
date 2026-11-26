import Link from "next/link";
import { learnSections, type LearnSectionHref } from "@/lib/learn/sections";
import { cn } from "@/lib/utils";

/** Tabs across the Learn hub: Articles · Roadmaps · DSA sheets. */
export function LearnTabs({ active }: { active: LearnSectionHref }) {
  return (
    <nav aria-label="Learn" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1 rounded-lg border p-1 text-sm">
        {learnSections.map((s) => {
          const current = s.href === active;
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-1.5 whitespace-nowrap transition-colors",
                  current ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <s.icon className="size-4" />
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
