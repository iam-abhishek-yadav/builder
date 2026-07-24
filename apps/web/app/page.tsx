import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, FileText, Star, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Reveal } from "@/components/landing/reveal";
import { HeroSection } from "@/components/landing/hero-section";
import { SiteHeader } from "@/components/landing/site-header";

const testimonials = [
  {
    quote:
      "Builder completely changed how I present my engineering projects. The portfolio flow is intuitive and looks amazing.",
    name: "Sarah Jenkins",
    role: "Senior Dev @ TechCorp",
    initials: "SJ",
  },
  {
    quote:
      "I rebuilt my resume in an afternoon and started getting recruiter replies the same week. Clean templates, zero ATS drama.",
    name: "Marcus Chen",
    role: "PM @ Northline",
    initials: "MC",
  },
  {
    quote:
      "The living profile is what I send instead of a PDF bio. Recruiters actually spend time on it.",
    name: "Aisha Rahman",
    role: "Design Lead @ Studio 9",
    initials: "AR",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />

        <section
          id="features"
          className="bg-muted py-16 md:py-24"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-7xl px-6">
            <Reveal className="mb-12 text-center md:mb-16">
              <h2
                id="features-heading"
                className="font-display mb-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
              >
                Tools for modern professionals
              </h2>
              <p className="text-base text-muted-foreground">
                Everything you need to showcase your expertise and value.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              <Reveal className="md:col-span-8">
                <Link href="/profile-creation" className="block h-full">
                  <Card className="feature-tile ambient-shadow h-full ring-border/60">
                    <CardContent className="flex flex-col gap-8 p-6 md:flex-row md:items-center md:gap-10 md:p-8">
                      <div className="md:w-1/2">
                        <span className="mb-4 inline-flex rounded-lg bg-secondary p-3 text-primary">
                          <User className="size-6" />
                        </span>
                        <CardTitle className="font-display mb-3 text-2xl font-semibold">
                          Dynamic professional profile
                        </CardTitle>
                        <CardDescription className="mb-4 text-base leading-relaxed">
                          A living document of your career
                          achievements—searchable, interactive, and built for
                          recruiters.
                        </CardDescription>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-sm font-medium text-primary">
                            <CheckCircle2 className="size-4" />
                            SEO optimized
                          </li>
                          <li className="flex items-center gap-2 text-sm font-medium text-primary">
                            <CheckCircle2 className="size-4" />
                            Skill endorsements
                          </li>
                        </ul>
                      </div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-accent md:w-1/2">
                        <Image
                          src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80"
                          alt="Professional reviewing a profile on a laptop"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 40vw"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>

              <Reveal className="md:col-span-4">
                <Link
                  id="templates"
                  href="/resume-builder"
                  className="block h-full"
                >
                  <Card className="feature-tile ambient-shadow flex h-full flex-col ring-border/60">
                    <CardHeader className="pb-2">
                      <span className="mb-2 inline-flex w-fit rounded-lg bg-secondary p-3 text-primary">
                        <FileText className="size-6" />
                      </span>
                      <CardTitle className="font-display text-2xl font-semibold">
                        Resume builder
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        ATS-friendly templates that keep their style. Export to
                        PDF in seconds.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-2">
                      <div className="relative aspect-[5/3] overflow-hidden rounded-lg bg-accent">
                        <Image
                          src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80"
                          alt="Clean resume document on a desk"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          className="bg-accent py-16 md:py-24"
          aria-labelledby="love-heading"
        >
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <h2
                id="love-heading"
                className="font-display mb-12 text-center text-3xl font-semibold tracking-tight text-foreground md:mb-16 md:text-4xl"
              >
                Loved by professionals
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
              {testimonials.map((item) => (
                <Reveal key={item.name}>
                  <figure>
                    <div
                      className="mb-3 flex gap-0.5 text-primary"
                      aria-label="5 out of 5 stars"
                    >
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className="size-4 fill-current"
                        />
                      ))}
                    </div>
                    <blockquote className="mb-4 text-base leading-relaxed text-foreground italic">
                      “{item.quote}”
                    </blockquote>
                    <figcaption className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        {item.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.role}
                        </p>
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-[#d3e4fe]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-10 px-6 py-16 md:flex-row">
          <div className="flex max-w-xs flex-col gap-3">
            <span className="font-display text-2xl font-bold text-foreground">
              Builder
            </span>
            <p className="text-sm leading-5 text-muted-foreground">
              Building the professional home for the next generation of industry
              leaders.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-10 md:ml-20 md:max-w-md">
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-sm font-semibold text-foreground">
                Product
              </span>
              <Link
                href="/#features"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Features
              </Link>
              <Link
                href="/resume-builder"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Resume Builder
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-sm font-semibold text-foreground">
                Company
              </span>
              <Link
                href="/profile-creation"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Get started
              </Link>
              <Link
                href="/#features"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Why Builder
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-7xl items-center border-t border-border px-6 py-6 text-muted-foreground">
          <span className="text-sm">
            © {new Date().getFullYear()} Builder. All rights reserved.
          </span>
        </div>
      </footer>
    </>
  );
}
