import { HeroCtas } from "@/components/landing/hero-ctas";

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

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-8 md:py-28">
        <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white/80 uppercase">
          From intern to staff+
        </p>
        <h1 className="font-display max-w-3xl text-4xl leading-[1.1] font-bold tracking-tight md:text-6xl">
          A home base for people who{" "}
          <span className="text-primary italic">ship.</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-7 text-white/70">
          Put your work in one place and keep it current — whether you just
          started or you&apos;ve been building for years.
        </p>
        <div className="mt-8">
          <HeroCtas />
        </div>
      </div>
    </section>
  );
}
