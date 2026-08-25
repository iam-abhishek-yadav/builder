"use client";

import Link from "next/link";
import {
  Briefcase,
  FileText,
  Mail,
  Rocket,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Show } from "@clerk/nextjs";

const FEATURES = [
  {
    id: "profile",
    title: "Profile",
    body: "A public identity from intern to staff+. Skills, work, education, and what you are open to.",
    icon: UserRound,
    live: true,
  },
  {
    id: "jobs",
    title: "Jobs",
    body: "Founders post roles. Builders browse and apply with the profile they already keep here.",
    icon: Briefcase,
    live: false,
  },
  {
    id: "launch",
    title: "Launch",
    body: "List a project or a shipping update so other builders can see what you are making.",
    icon: Rocket,
    live: false,
  },
  {
    id: "practice",
    title: "Practice",
    body: "AI mock interviews first, grounded in your story. DSA and drills come later.",
    icon: Sparkles,
    live: false,
  },
  {
    id: "resume",
    title: "Resume",
    body: "One structured resume that feeds your profile and applications.",
    icon: FileText,
    live: false,
  },
  {
    id: "outreach",
    title: "Outreach",
    body: "Recruiter emails that cite work you actually did.",
    icon: Mail,
    live: false,
  },
] as const;

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 bg-background py-16 md:py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-primary uppercase">
              The platform
            </p>
            <h2
              id="features-heading"
              className="font-display max-w-xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
            >
              Six pieces. One account.
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
            Profile is live. The rest rolls out next — same account.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const card = (
              <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                    {feature.live ? "Live" : "Soon"}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </article>
            );

            return (
              <li key={feature.id} id={feature.id} className="scroll-mt-24">
                {feature.live ? (
                  <>
                    <Show when="signed-in">
                      <Link href="/profile" className="block h-full">
                        {card}
                      </Link>
                    </Show>
                    <Show when="signed-out">{card}</Show>
                  </>
                ) : (
                  card
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
