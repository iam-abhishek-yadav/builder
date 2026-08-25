import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#0b1c30] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <span className="font-display text-2xl font-bold">Builder</span>
          <p className="mt-3 text-sm leading-6 text-white/60">
            One-stop platform for builders — from first project to staff+.
          </p>
        </div>
        <div className="flex flex-wrap gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <span className="mb-1 font-semibold">Platform</span>
            <Link href="/#features" className="text-white/60 hover:text-white">
              Features
            </Link>
            <Link href="/#who" className="text-white/60 hover:text-white">
              Who it&apos;s for
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="mb-1 font-semibold">Account</span>
            <Link href="/sign-in" className="text-white/60 hover:text-white">
              Log in
            </Link>
            <Link href="/sign-up" className="text-white/60 hover:text-white">
              Get started
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl border-t border-white/10 px-4 py-5 text-sm text-white/45 sm:px-8">
        © {new Date().getFullYear()} Builder. All rights reserved.
      </div>
    </footer>
  );
}
