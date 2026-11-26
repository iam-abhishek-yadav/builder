"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { learnSections } from "@/lib/learn/sections";
import { cn } from "@/lib/utils";

const isUnder = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

function linkClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
    active ? "text-foreground" : "text-muted-foreground",
  );
}

export function NavLinks() {
  const pathname = usePathname();
  const launchpadActive = isUnder(pathname, "/launchpad") || pathname.startsWith("/p/");
  const learnActive = learnSections.some((s) => isUnder(pathname, s.href));
  return (
    <>
      <Link href="/launchpad" className={linkClass(launchpadActive)} aria-current={launchpadActive ? "page" : undefined}>
        Launchpad
      </Link>
      <LearnMenu active={learnActive} pathname={pathname} />
    </>
  );
}

function LearnMenu({ active, pathname }: { active: boolean; pathname: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger openOnHover delay={80} closeDelay={150} className={cn(linkClass(active), "data-[popup-open]:text-foreground")}>
        Learn <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-72 p-1.5">
        {learnSections.map((s) => {
          const current = isUnder(pathname, s.href);
          return (
            <DropdownMenuItem
              key={s.href}
              render={<Link href={s.href} aria-current={current ? "page" : undefined} />}
              className="items-start gap-3 rounded-lg p-2.5"
            >
              <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border", current && "border-brand text-brand")}>
                <s.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.description}</span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Plain links without the menu; used as the Suspense fallback. */
export function NavLinksStatic() {
  return (
    <>
      <Link href="/launchpad" className={linkClass(false)}>
        Launchpad
      </Link>
      <Link href="/learn" className={linkClass(false)}>
        Learn <ChevronDown className="size-3.5 opacity-60" />
      </Link>
    </>
  );
}
