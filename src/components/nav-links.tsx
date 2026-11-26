"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/launchpad", label: "Launchpad" },
  { href: "/learn", label: "Learn" },
  { href: "/roadmaps", label: "Roadmaps" },
] as const;

function linkClass(active: boolean) {
  return cn(
    "rounded-md px-2.5 py-1.5 text-sm transition-colors hover:text-foreground",
    active ? "text-foreground" : "text-muted-foreground",
  );
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/launchpad" && pathname.startsWith("/p/"));
        return (
          <Link key={item.href} href={item.href} className={linkClass(active)} aria-current={active ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

/** Same links without active state; used as the Suspense fallback. */
export function NavLinksStatic() {
  return (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className={linkClass(false)}>
          {item.label}
        </Link>
      ))}
    </>
  );
}
