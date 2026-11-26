"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/learn/markdown";
import { cn } from "@/lib/utils";

/** "On this page" list that highlights the section currently being read. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="space-y-3 text-sm">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">On this page</p>
      <ul className="space-y-2 border-l">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l py-0.5 transition-colors hover:text-foreground",
                item.depth === 3 ? "pl-6" : "pl-3",
                active === item.id ? "border-brand text-foreground" : "border-transparent text-muted-foreground",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
