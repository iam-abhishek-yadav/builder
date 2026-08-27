import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateRange, formatMonthYear } from "@/lib/format-date";
import type { JobProfileData } from "@/lib/job-profile";

const OPEN_TO: Record<string, string> = {
  internship: "Internship",
  full_time: "Full-time",
  contract: "Contract",
  not_looking: "Not looking",
};

const PROFICIENCIES: Record<string, string> = {
  basic: "Basic",
  conversational: "Conversational",
  fluent: "Fluent",
  native: "Native",
};

function experienceLabel(years: number, months: number) {
  const parts = [
    years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : null,
    months > 0 ? `${months} ${months === 1 ? "month" : "months"}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "New to work";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

function Entry({
  title,
  subtitle,
  body,
}: {
  title: string;
  subtitle?: string;
  body?: string;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="font-medium">{title}</p>
      {subtitle ? (
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
      {body ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
          {body}
        </p>
      ) : null}
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      {label}
    </a>
  );
}

export function ProfileView({
  email,
  data,
  isOwner,
}: {
  email: string;
  data: JobProfileData;
  isOwner: boolean;
}) {
  const links = [
    data.linkedinUrl ? { href: data.linkedinUrl, label: "LinkedIn" } : null,
    data.githubUrl ? { href: data.githubUrl, label: "GitHub" } : null,
    data.portfolioUrl ? { href: data.portfolioUrl, label: "Portfolio" } : null,
    data.xUrl ? { href: data.xUrl, label: "X" } : null,
  ].filter((item): item is { href: string; label: string } => item !== null);

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {data.name || email || "Builder"}
            </h1>
            {data.headline ? (
              <p className="mt-1 text-lg text-foreground/80">{data.headline}</p>
            ) : null}
            <p className="mt-2 text-sm text-muted-foreground">
              {[
                email && data.name ? email : null,
                data.location,
                experienceLabel(data.experienceYears, data.experienceMonths),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          {isOwner ? (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/profile" />}
            >
              Edit profile
            </Button>
          ) : null}
        </div>
        {data.bio ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
            {data.bio}
          </p>
        ) : null}
        {data.openTo.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {data.openTo.map((item) => (
              <Badge key={item} variant="secondary">
                Open to {OPEN_TO[item] ?? item}
              </Badge>
            ))}
          </div>
        ) : null}
        {links.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-4">
            {links.map((link) => (
              <ExternalLink key={link.label} href={link.href} label={link.label} />
            ))}
          </div>
        ) : null}
      </section>

      {data.experiences.length > 0 ? (
        <Section title="Experience">
          {data.experiences.map((item, index) => (
            <Entry
              key={`exp-${index}`}
              title={item.title}
              subtitle={[
                item.organization,
                item.location,
                formatDateRange(item.startDate, item.endDate, item.isCurrent),
              ]
                .filter(Boolean)
                .join(" · ")}
              body={item.description}
            />
          ))}
        </Section>
      ) : null}

      {data.projects.length > 0 ? (
        <Section title="Projects">
          {data.projects.map((item, index) => (
            <div key={`proj-${index}`} className="rounded-xl border border-border p-4">
              <p className="font-medium">{item.name}</p>
              {item.tags ? (
                <p className="mt-0.5 text-sm text-muted-foreground">{item.tags}</p>
              ) : null}
              {item.description ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
                  {item.description}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-4">
                {item.liveUrl ? (
                  <ExternalLink href={item.liveUrl} label="Live" />
                ) : null}
                {item.githubUrl ? (
                  <ExternalLink href={item.githubUrl} label="GitHub" />
                ) : null}
              </div>
            </div>
          ))}
        </Section>
      ) : null}

      {data.educations.length > 0 ? (
        <Section title="Education">
          {data.educations.map((item, index) => (
            <Entry
              key={`edu-${index}`}
              title={item.school}
              subtitle={[
                item.degree,
                item.field,
                formatDateRange(item.startDate, item.endDate),
              ]
                .filter(Boolean)
                .join(" · ")}
              body={item.description}
            />
          ))}
        </Section>
      ) : null}

      {data.skills.length > 0 ? (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}

      {data.certifications.length > 0 ? (
        <Section title="Certifications">
          {data.certifications.map((item, index) => (
            <div key={`cert-${index}`} className="rounded-xl border border-border p-4">
              <p className="font-medium">{item.name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[item.issuer, item.issuedAt ? formatMonthYear(item.issuedAt) : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {item.credentialUrl ? (
                <div className="mt-3">
                  <ExternalLink href={item.credentialUrl} label="Credential" />
                </div>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}

      {data.languages.length > 0 ? (
        <Section title="Languages">
          <div className="flex flex-wrap gap-1.5">
            {data.languages.map((item) => (
              <Badge key={item.name} variant="secondary">
                {item.name} · {PROFICIENCIES[item.proficiency] ?? item.proficiency}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}

      {data.awards.length > 0 ? (
        <Section title="Awards">
          {data.awards.map((item, index) => (
            <div key={`award-${index}`} className="rounded-xl border border-border p-4">
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[item.issuer, item.awardedAt ? formatMonthYear(item.awardedAt) : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {item.description ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
                  {item.description}
                </p>
              ) : null}
              {item.url ? (
                <div className="mt-3">
                  <ExternalLink href={item.url} label="Link" />
                </div>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}

      {data.publications.length > 0 ? (
        <Section title="Publications">
          {data.publications.map((item, index) => (
            <div key={`pub-${index}`} className="rounded-xl border border-border p-4">
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[item.venue, item.publishedAt ? formatMonthYear(item.publishedAt) : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {item.description ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
                  {item.description}
                </p>
              ) : null}
              {item.url ? (
                <div className="mt-3">
                  <ExternalLink href={item.url} label="Link" />
                </div>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}

      {data.volunteerRoles.length > 0 ? (
        <Section title="Volunteer">
          {data.volunteerRoles.map((item, index) => (
            <div key={`vol-${index}`} className="rounded-xl border border-border p-4">
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[
                  item.organization,
                  formatDateRange(item.startDate, item.endDate),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {item.description ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
                  {item.description}
                </p>
              ) : null}
              {item.url ? (
                <div className="mt-3">
                  <ExternalLink href={item.url} label="Link" />
                </div>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}
    </div>
  );
}
