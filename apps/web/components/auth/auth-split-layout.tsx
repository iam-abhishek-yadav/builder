import type { ReactNode } from "react";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export const clerkAuthAppearance = {
  elements: {
    rootBox: "w-full m-0 h-auto min-h-0",
    cardBox: "w-full bg-transparent shadow-none border-0 p-0",
    card: "w-full bg-transparent shadow-none p-0 gap-5",
    header: "gap-1 text-left",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "h-11 rounded-lg border-border bg-card text-foreground hover:bg-muted",
    formFieldInput:
      "h-11 rounded-lg border-input bg-card text-foreground",
    formButtonPrimary:
      "h-11 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90",
    footer: "bg-transparent",
    footerAction: "bg-transparent",
  },
} as const;

const STEPS = [
  { n: "01", label: "Save a resume" },
  { n: "02", label: "Paste a job" },
  { n: "03", label: "Send the draft" },
] as const;

export function AuthSplitLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <AuthPageShell>
      <div className="auth-split grid min-h-dvh bg-card lg:grid-cols-2">
        <div className="flex flex-col border-border px-6 py-7 sm:px-10 lg:border-r">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-tight text-foreground"
            >
              Builder
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Back to site
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[24rem] flex-1 flex-col justify-center py-12">
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              Recruiter outreach
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 mb-8 text-sm leading-6 text-muted-foreground">
              {subtitle}
            </p>
            {children}
          </div>
        </div>

        <aside className="relative hidden overflow-hidden bg-[#0b1c30] lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_-10%,rgb(26_86_219/0.45),transparent_55%),radial-gradient(700px_420px_at_10%_110%,rgb(211_228_254/0.16),transparent_50%)]" />

          <div className="relative flex w-full flex-col justify-between gap-10 px-12 py-12 xl:px-16 xl:py-14">
            <div>
              <p className="text-sm font-semibold tracking-wide text-white/55 uppercase">
                How it works
              </p>
              <h2 className="font-display mt-3 max-w-xl text-4xl leading-tight font-semibold text-white xl:text-5xl">
                From job post to a send-ready email.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/70">
                Builder reads your resume, matches it to the listing, and writes
                a cold email you can copy into your inbox.
              </p>
            </div>

            <div className="max-w-xl rounded-2xl bg-white p-6 text-foreground shadow-[0_24px_60px_rgb(0_0_0/0.28)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                  Outreach draft
                </p>
                <p className="text-xs text-muted-foreground">
                  Northline · Design
                </p>
              </div>
              <p className="mt-4 text-sm font-semibold">
                Application for Staff Product Designer
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Hi Alex — I led the onboarding redesign that cut time-to-value
                by 38%. I would bring the same systems thinking to Northline’s
                design team, starting with the workflow you described in the
                listing.
              </p>
            </div>

            <ol className="grid max-w-xl grid-cols-3 gap-4">
              {STEPS.map((step) => (
                <li key={step.n} className="text-white">
                  <p className="font-display text-sm text-white/45">{step.n}</p>
                  <p className="mt-1 text-sm font-medium text-white/90">
                    {step.label}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </AuthPageShell>
  );
}
