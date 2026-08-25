import { HeroCtas } from "@/components/landing/hero-ctas";

const PREVIEW = [
  { label: "Profile", hint: "Be findable" },
  { label: "Jobs", hint: "Post or apply" },
  { label: "Launch", hint: "Ship in public" },
  { label: "Practice", hint: "Interview ready" },
] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0b1c30] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute -top-24 right-0 h-[28rem] w-[28rem] rounded-full bg-primary/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-28">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white/80 uppercase">
            From intern to staff+
          </p>
          <h1 className="font-display text-4xl leading-[1.1] font-bold tracking-tight md:text-6xl">
            A home base for people who{" "}
            <span className="text-primary italic">ship.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-7 text-white/70">
            Show your work, find a role, launch a project, and practice for
            interviews — one account, whether you just started or you&apos;ve
            been building for years.
          </p>
          <div className="mt-8">
            <HeroCtas />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PREVIEW.map((item, index) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              style={{ minHeight: index % 2 === 0 ? "9.5rem" : "8rem" }}
            >
              <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-primary uppercase">
                0{index + 1}
              </p>
              <p className="font-display mt-3 text-xl font-semibold">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-white/55">{item.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
