import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { Award, Briefcase, ChevronUp, Code2, Link2, MapPin, MessageSquare, Pencil, Rocket } from "lucide-react";
import { Container } from "@/components/container";
import { buttonVariants } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { profilePath } from "@/lib/profiles/handle";
import { getProfileByKey, getProfileRoadmaps, getProfileWork, type PublicProfile } from "@/lib/profiles/queries";
import { getSheetProgress } from "@/lib/practice/queries";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/u/[key]">): Promise<Metadata> {
  const { key } = await params;
  const profile = await getProfileByKey(key);
  if (!profile) return { title: "Builder not found" };
  const title = profile.handle ? `${profile.name} (@${profile.handle})` : profile.name;
  return {
    title,
    description: profile.headline ?? profile.bio ?? `${profile.name} on Builder One Stop`,
    alternates: { canonical: profilePath(profile) },
  };
}

export default function ProfilePage({ params }: PageProps<"/u/[key]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile params={params} />
    </Suspense>
  );
}

const memberSince = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const workTypeLabel = { "full-time": "Full-time", contract: "Contract / freelance", internship: "Internship" } as const;
const locationLabel = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" } as const;

async function Profile({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const profile = await getProfileByKey(key);
  if (!profile) notFound();

  // One canonical URL per builder: the handle once chosen, lowercase.
  const canonical = profilePath(profile);
  if (`/u/${key}` !== canonical) permanentRedirect(canonical);

  const [viewer, work, roadmaps, practice] = await Promise.all([
    getCurrentUser(),
    getProfileWork(profile.id),
    profile.showRoadmapProgress ? getProfileRoadmaps(profile.id) : Promise.resolve([]),
    profile.showPracticeProgress ? getSheetProgress(profile.id).then((l) => l.filter((x) => x.solved > 0)) : Promise.resolve([]),
  ]);
  const isOwner = viewer?.id === profile.id;
  const finished = roadmaps.filter((r) => r.finished);

  return (
    <Container className="py-12">
      <ProfileHeader profile={profile} isOwner={isOwner} />

      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
        <Stat label="Launches" value={work.launches.length} />
        <Stat label="Upvotes received" value={work.totalVotes} />
        <Stat label="Skills shipped" value={work.skills.length} />
        {profile.showRoadmapProgress ? (
          <Stat label="Roadmaps finished" value={finished.length} />
        ) : (
          <Stat label="Member since" text={memberSince.format(profile.createdAt)} />
        )}
      </dl>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="launches">
          <SectionTitle id="launches" icon={Rocket} title="Launches" count={work.launches.length} />
          {work.launches.length ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {work.launches.map((p) => (
                <li key={p.id} className="group relative flex flex-col rounded-xl border bg-card p-4 transition-colors hover:border-foreground/25">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/p/${p.slug}`} className="font-medium after:absolute after:inset-0 group-hover:text-brand">
                      {p.name}
                    </Link>
                    <span className="flex shrink-0 items-center gap-0.5 rounded-md border px-1.5 py-0.5 font-mono text-xs tabular-nums">
                      <ChevronUp className="size-3.5" /> {p.voteCount}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.tagline}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3.5" /> {p.commentCount}
                    </span>
                    {p.techStack.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              text={isOwner ? "You haven't launched anything yet. Your launches show up here as proof of work." : "No launches yet."}
              action={isOwner ? { href: "/launch", label: "Launch a project" } : undefined}
            />
          )}
        </section>

        <div className="space-y-12">
          <section aria-labelledby="skills">
            <SectionTitle id="skills" icon={Briefcase} title="Skills from their work" />
            {work.skills.length ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {work.skills.map((s) => (
                  <li key={s.name} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                    {s.name}
                    <span className="font-mono text-xs text-muted-foreground">
                      {s.projects} {s.projects === 1 ? "project" : "projects"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Skills appear from the tech stack of launched projects.</p>
            )}
          </section>

          {profile.showRoadmapProgress ? (
            <section aria-labelledby="roadmaps">
              <SectionTitle id="roadmaps" icon={Award} title="Roadmaps" />
              {roadmaps.length ? (
                <ul className="mt-4 space-y-3">
                  {roadmaps.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/roadmaps/${r.slug}`} className="group block rounded-xl border p-4 transition-colors hover:border-foreground/25">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium group-hover:text-brand">{r.title}</span>
                          {r.finished ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-brand-foreground">
                              <Award className="size-3.5" /> Finished
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground tabular-nums">{r.percent}%</span>
                          )}
                        </div>
                        <div
                          className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                          role="progressbar"
                          aria-valuenow={r.percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${r.title} progress`}
                        >
                          <div className="h-full rounded-full bg-brand" style={{ width: `${r.percent}%` }} />
                        </div>
                        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                          {r.coreDone}/{r.coreTotal} core steps
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty
                  text={isOwner ? "Tick off steps on a roadmap and your progress shows up here." : "No roadmap progress yet."}
                  action={isOwner ? { href: "/roadmaps", label: "Pick a roadmap" } : undefined}
                />
              )}
            </section>
          ) : null}

          {profile.showPracticeProgress ? (
            <section aria-labelledby="practice">
              <SectionTitle id="practice" icon={Code2} title="DSA practice" />
              {practice.length ? (
                <ul className="mt-4 space-y-3">
                  {practice.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/practice/${s.slug}`} className="group block rounded-xl border p-4 transition-colors hover:border-foreground/25">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium group-hover:text-brand">{s.title}</span>
                          {s.solved === s.total ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-brand-foreground">
                              <Award className="size-3.5" /> Complete
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground tabular-nums">
                              {s.solved}/{s.total}
                            </span>
                          )}
                        </div>
                        <div
                          className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                          role="progressbar"
                          aria-valuenow={s.percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${s.title} progress`}
                        >
                          <div className="h-full rounded-full bg-brand" style={{ width: `${s.percent}%` }} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty
                  text={isOwner ? "Solve problems on a DSA sheet and your progress shows up here." : "No problems solved yet."}
                  action={isOwner ? { href: "/practice", label: "Open DSA sheets" } : undefined}
                />
              )}
            </section>
          ) : null}

          {isOwner && (!profile.showRoadmapProgress || !profile.showPracticeProgress) ? (
            <section className="rounded-xl border border-dashed p-5 text-sm">
              <p className="font-medium">Show your progress?</p>
              <p className="mt-1 text-muted-foreground">
                Roadmap and DSA progress are hidden by default. Turn them on in settings to show them here.
              </p>
              <Link href="/settings/profile#visibility" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}>
                Profile settings
              </Link>
            </section>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

function ProfileHeader({ profile, isOwner }: { profile: PublicProfile; isOwner: boolean }) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <UserAvatar name={profile.name} image={profile.image} className="size-20 text-xl sm:size-24" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{profile.name}</h1>
            <p className="font-mono text-sm text-muted-foreground">
              {profile.handle ? `@${profile.handle}` : `/u/${profile.publicId}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.openToWork ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-600" aria-hidden /> Open to work
              </span>
            ) : null}
            {isOwner ? (
              <Link href="/settings/profile" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Pencil /> Edit profile
              </Link>
            ) : null}
          </div>
        </div>
        {profile.headline ? <p className="text-lg">{profile.headline}</p> : null}
        {profile.bio ? <p className="max-w-2xl whitespace-pre-line text-muted-foreground">{profile.bio}</p> : null}
        {profile.links.length ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {profile.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer nofollow me" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                  <Link2 className="size-3.5" /> {linkLabel(l.url)}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {profile.openToWork && (profile.workTypes.length || profile.workRoles || profile.workLocations.length || profile.workCity) ? (
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 rounded-lg bg-muted/50 px-3 py-2 text-sm">
            {profile.workRoles ? (
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-muted-foreground" /> {profile.workRoles}
              </span>
            ) : null}
            {profile.workTypes.length ? <span>{profile.workTypes.map((t) => workTypeLabel[t]).join(" · ")}</span> : null}
            {profile.workLocations.length || profile.workCity ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-foreground" />
                {[profile.workLocations.map((l) => locationLabel[l]).join(" / "), profile.workCity].filter(Boolean).join(" · ")}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function linkLabel(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/\/$/, "");
    if (host === "github.com") return `GitHub${path ? ` ${path.slice(1)}` : ""}`;
    if (host === "x.com" || host === "twitter.com") return `X${path ? ` @${path.slice(1)}` : ""}`;
    if (host.endsWith("linkedin.com")) return "LinkedIn";
    return host + (path && path.length < 20 ? path : "");
  } catch {
    return url;
  }
}

function SectionTitle({ id, icon: Icon, title, count }: { id: string; icon: typeof Rocket; title: string; count?: number }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      <Icon className="size-4 text-muted-foreground" />
      {title}
      {typeof count === "number" ? <span className="font-mono text-sm font-normal text-muted-foreground">{count}</span> : null}
    </h2>
  );
}

function Stat({ label, value, text }: { label: string; value?: number; text?: string }) {
  return (
    <div className="bg-background px-4 py-4">
      <dt className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">{label}</dt>
      <dd className={cn("mt-1 font-semibold tabular-nums", text ? "text-base" : "text-2xl")}>{text ?? value}</dd>
    </div>
  );
}

function Empty({ text, action }: { text: string; action?: { href: string; label: string } }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm">
      <p className="text-muted-foreground">{text}</p>
      {action ? (
        <Link href={action.href} className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <Container className="py-12">
      <div className="flex gap-6">
        <div className="size-24 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-muted/70" />
        </div>
      </div>
      <div className="mt-10 h-20 animate-pulse rounded-xl bg-muted/50" />
      <div className="mt-12 h-64 animate-pulse rounded-xl bg-muted/40" />
    </Container>
  );
}
