import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    number: "01",
    kicker: "Start with the role",
    eyebrow: "A sharper first message.",
    title: "Personalized emails, not templates.",
    body: "Your resume and the job description become one argument: why you fit this role, with metrics the listing actually asks for. No invented employers, no generic filler.",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
    alt: "Resume and notes on a desk",
  },
  {
    number: "02",
    kicker: "Your profile, ready",
    eyebrow: "The source of truth is already here.",
    title: "Resume first. Outreach second.",
    body: "Build your resume in Builder. Outreach reads that structured profile so every draft can cite real titles, teams, and outcomes—without uploading a PDF again.",
    href: "/resume-builder",
    hrefLabel: "Open resume builder",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    alt: "Professional reviewing a profile on a laptop",
  },
  {
    number: "03",
    kicker: "Any job board",
    eyebrow: "The listing is the brief.",
    title: "Paste a job from anywhere.",
    body: "Copy a description from LinkedIn, Indeed, or a company careers page. Drop it in. We write against that exact role instead of a vague job title.",
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
    alt: "Person browsing job listings on a laptop",
  },
  {
    number: "04",
    kicker: "Keep the thread",
    eyebrow: "No more spreadsheet archaeology.",
    title: "Draft history, in one place.",
    body: "Every generated email stays listed by company and date so you know who you wrote to, what you said, and which version you actually sent.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    alt: "Organized notes and a laptop for tracking work",
  },
  {
    number: "05",
    kicker: "Send from your inbox",
    eyebrow: "You stay in control of send.",
    title: "Copy, or open in mail.",
    body: "This version does not connect Gmail. Copy the draft or open it in your mail client with one click—you review, you send.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    alt: "Inbox on a laptop screen",
  },
  {
    number: "06",
    kicker: "Roles without borders",
    eyebrow: "Remote, on-site, anywhere.",
    title: "Write outreach for any market.",
    body: "Target hiring managers at startups across time zones. The draft is about your fit—geography is just another line in the job description.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    alt: "Team collaborating around a table",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-background py-16 md:py-24"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <Reveal className="mb-12 md:mb-20">
          <p className="mb-3 text-sm font-semibold tracking-wide text-primary uppercase">
            How Builder works
          </p>
          <h2
            id="how-heading"
            className="font-display max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            From job discovery to a send-ready draft.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Builder turns your saved resume and a pasted job description into a
            recruiter email you can actually send.
          </p>
        </Reveal>

        <ol className="space-y-16 md:space-y-24">
          {STEPS.map((step, index) => {
            const reverse = index % 2 === 1;
            return (
              <li key={step.number}>
                <Reveal>
                  <article
                    className={cn(
                      "grid items-center gap-8 md:grid-cols-2 md:gap-14",
                    )}
                  >
                    <div className={cn(reverse && "md:order-2")}>
                      <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                        {step.number} / {step.kicker}
                      </p>
                      <p className="font-display mb-2 text-lg text-muted-foreground italic">
                        {step.eyebrow}
                      </p>
                      <h3 className="font-display mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                        {step.title}
                      </h3>
                      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                      {"href" in step ? (
                        <Link
                          href={step.href}
                          className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
                        >
                          {step.hrefLabel}
                        </Link>
                      ) : null}
                    </div>
                    <div
                      className={cn(
                        "relative aspect-4/3 overflow-hidden rounded-xl bg-accent ring-1 ring-border/60",
                        reverse && "md:order-1",
                      )}
                    >
                      <Image
                        src={step.image}
                        alt={step.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
