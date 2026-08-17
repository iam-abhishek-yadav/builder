import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#d3e4fe]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-10 px-4 py-16 sm:px-8 md:flex-row">
        <div className="flex max-w-xs flex-col gap-3">
          <span className="font-display text-2xl font-bold text-foreground">
            Builder
          </span>
          <p className="text-sm leading-5 text-muted-foreground">
            An AI outreach workspace that turns your resume into personalized
            recruiter emails.
          </p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-10 md:ml-20 md:max-w-lg md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="mb-1 text-sm font-semibold text-foreground">
              Product
            </span>
            <Link
              href="/outreach"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Outreach
            </Link>
            <Link
              href="/resume-builder"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Resume
            </Link>
            <Link
              href="/profile-creation"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Profile
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="mb-1 text-sm font-semibold text-foreground">
              Get started
            </span>
            <Link
              href="/#how-it-works"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              How it works
            </Link>
            <Link
              href="/outreach"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Start outreach
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="mb-1 text-sm font-semibold text-foreground">
              Company
            </span>
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/#how-it-works"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Why Builder
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl items-center border-t border-border px-4 py-6 text-muted-foreground sm:px-8">
        <span className="text-sm">
          © {new Date().getFullYear()} Builder. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
