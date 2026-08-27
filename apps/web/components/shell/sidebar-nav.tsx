"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    href: "/launchpad",
    label: "Launchpad",
    icon: Rocket,
    active: (pathname: string) =>
      pathname === "/" || pathname.startsWith("/launchpad"),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    active: (pathname: string) => pathname.startsWith("/profile"),
  },
] as const;

export function SidebarNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex", compact ? "items-center gap-1" : "flex-col gap-1")}>
      {items.map((item) => {
        const Icon = item.icon;
        const current = item.active(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-lg text-sm font-medium transition-colors",
              compact ? "px-2.5 py-1.5" : "px-3 py-2",
              current
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className={compact ? "hidden sm:inline" : undefined}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
