import Link from "next/link";
import { cn } from "@/lib/utils";

const items = [
  { href: "/studio", label: "Articles", key: "articles" },
  { href: "/studio/roadmaps", label: "Roadmaps", key: "roadmaps" },
  { href: "/studio/topics", label: "Topics", key: "topics" },
] as const;

export function StudioNav({ active }: { active: (typeof items)[number]["key"] }) {
  return (
    <nav className="flex w-fit gap-1 rounded-lg border p-1 text-sm" aria-label="Studio">
      {items.map((i) => (
        <Link
          key={i.key}
          href={i.href}
          aria-current={active === i.key ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 transition-colors",
            active === i.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
