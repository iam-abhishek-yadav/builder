import Link from "next/link";
import { AuthButtons } from "@/components/landing/auth-buttons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8 md:h-20">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            className="font-display shrink-0 text-2xl font-bold tracking-tight text-foreground"
          >
            Builder
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/#features"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              Platform
            </Link>
            <Link
              href="/#who"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              Who it&apos;s for
            </Link>
          </div>
        </div>
        <AuthButtons />
      </nav>
    </header>
  );
}
