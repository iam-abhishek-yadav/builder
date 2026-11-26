import Link from "next/link";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";

const columns = [
  {
    title: "Build",
    links: [
      { href: "/launchpad", label: "Launchpad" },
      { href: "/launch", label: "Launch a project" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/learn", label: "Articles" },
      { href: "/roadmaps", label: "Roadmaps" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <Container className="grid gap-10 py-12 sm:grid-cols-[1fr_auto_auto] sm:gap-16">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            A home for engineers who ship: launch what you build and learn from real engineering.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="space-y-3 text-sm">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
    </footer>
  );
}
