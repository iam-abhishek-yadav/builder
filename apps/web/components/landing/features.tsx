import {
  Briefcase,
  FileText,
  Mail,
  Rocket,
  Sparkles,
  UserRound,
} from "lucide-react";

const FEATURES = [
  {
    id: "profile",
    title: "Profile",
    body: "A public identity from intern to staff+. Skills, work, education, and what you are open to.",
    icon: UserRound,
    className: "md:col-span-2 md:row-span-2",
  },
  {
    id: "jobs",
    title: "Jobs",
    body: "Founders post roles. Builders browse and apply with the profile they already keep here.",
    icon: Briefcase,
    className: "md:col-span-2",
  },
  {
    id: "launch",
    title: "Launch",
    body: "List a project or a shipping update so other builders can see what you are making.",
    icon: Rocket,
    className: "md:col-span-2",
  },
  {
    id: "practice",
    title: "Practice",
    body: "AI mock interviews first, grounded in your story. DSA and drills come later.",
    icon: Sparkles,
    className: "md:col-span-2",
  },
  {
    id: "resume",
    title: "Resume",
    body: "One structured resume that feeds your profile and applications.",
    icon: FileText,
    className: "md:col-span-2",
  },
  {
    id: "outreach",
    title: "Outreach",
    body: "Recruiter emails that cite work you actually did.",
    icon: Mail,
    className: "md:col-span-2",
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
            Rolling out in stages. Create an account now so you are here when
            each piece goes live.
          </p>
        </div>

        <ul className="grid gap-4 md:grid-cols-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const featured = feature.id === "profile";
            return (
              <li
                key={feature.id}
                id={feature.id}
                className={`scroll-mt-24 ${feature.className}`}
              >
                <article
                  className={`flex h-full flex-col rounded-2xl border border-border bg-card p-6 ${
                    featured ? "min-h-[18rem] justify-between" : ""
                  }`}
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                        Soon
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {feature.body}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
