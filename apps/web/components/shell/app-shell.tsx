import type { ReactNode } from "react";
import Link from "next/link";
import { AuthButtons } from "@/components/shell/auth-buttons";
import { SidebarNav } from "@/components/shell/sidebar-nav";

export function AppShell({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl">
      <aside className="sticky top-0 hidden h-dvh w-52 shrink-0 flex-col px-4 py-6 lg:flex">
        <Link
          href="/launchpad"
          className="mb-8 flex items-center gap-2 px-1 text-foreground"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#0b1c30] text-xs font-bold text-white">
            B
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Builder
          </span>
        </Link>
        <SidebarNav />
        <p className="mt-auto px-3 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Builder
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 px-4 py-3 lg:justify-end lg:px-6 lg:pt-4">
          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <Link
              href="/launchpad"
              className="font-display shrink-0 text-lg font-bold tracking-tight"
            >
              Builder
            </Link>
            <SidebarNav compact />
          </div>
          <AuthButtons />
        </header>

        <div className="flex flex-1 gap-10 px-4 pb-10 lg:px-6">
          <div className="min-w-0 flex-1">{children}</div>
          {aside ? (
            <aside className="sticky top-6 hidden w-72 shrink-0 self-start xl:block">
              {aside}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
