const LEVELS = [
  "Student",
  "Intern",
  "Junior",
  "Mid",
  "Senior",
  "Staff+",
] as const;

export function WhoItsFor() {
  return (
    <section
      id="who"
      className="scroll-mt-24 border-b border-border bg-muted/60 py-14 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Who it&apos;s for
        </p>
        <h2 className="font-display mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Same platform. Different starting line.
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Freshers lead with projects and coursework. Experienced builders lead
          with roles and launches. Nobody gets a lesser product.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <li
              key={level}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground"
            >
              {level}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
