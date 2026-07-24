"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AiCareerModal } from "./ai-career-modal";

export function SiteHeader() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/40 h-20 flex items-center">
        <nav className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-lg">
            <Link
              href="/"
              className="font-display text-headline-md font-bold text-primary tracking-tight"
            >
              Builder
            </Link>
            <div className="hidden md:flex gap-md items-center">
              <a
                href="#features"
                className="text-on-surface-variant hover:text-secondary transition-colors text-label-md font-semibold"
              >
                Features
              </a>
              <a
                href="#templates"
                className="text-on-surface-variant hover:text-secondary transition-colors text-label-md font-semibold"
              >
                Templates
              </a>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button
              type="button"
              className="text-secondary text-label-md font-semibold px-4 py-2 hover:bg-surface-container-low transition-all duration-200 active:scale-95 rounded-lg"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="hidden sm:inline-flex border border-secondary/30 text-secondary text-label-md font-semibold px-4 py-2.5 rounded-lg hover:bg-surface-container-low transition-all duration-200 active:scale-95"
            >
              AI Advice
            </button>
            <a
              href="#get-started"
              className="bg-secondary text-on-secondary text-label-md font-semibold px-6 py-2.5 rounded-lg ambient-shadow hover:opacity-90 transition-all duration-200 active:scale-95"
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>
      {aiOpen ? (
        <AiCareerModal open onClose={() => setAiOpen(false)} />
      ) : null}
    </>
  );
}

export function HeroSection() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[min(92vh,880px)] flex items-end overflow-hidden">
        <div className="absolute inset-0 animate-fade-in">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=80"
            alt="Bright modern workspace with desk and natural light"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 hero-wash" />
        </div>

        <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter pt-xl pb-lg md:pb-xl">
          <div className="max-w-xl">
            <p className="font-display text-headline-md md:text-[40px] font-bold text-primary tracking-tight mb-md animate-fade-up">
              Builder
            </p>
            <h1 className="font-display text-display-mobile md:text-display-lg text-on-background mb-md animate-fade-up">
              Your career,{" "}
              <span className="text-secondary italic">all in one place.</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant mb-lg max-w-lg animate-fade-up-delay">
              Profiles, resumes, and portfolios that help you land the role you
              want—built for modern professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-md animate-fade-up-delay">
              <a
                id="get-started"
                href="#features"
                className="bg-secondary text-on-secondary px-lg py-4 rounded-lg text-label-md font-semibold ambient-shadow hover:opacity-90 transition-all active:scale-[0.98] text-center"
              >
                Start Building Free
              </a>
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                className="border border-secondary text-secondary px-lg py-4 rounded-lg text-label-md font-semibold hover:bg-surface/70 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M13 3c-3.87 0-7 3.13-7 7 0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 11.08V16h-4v-1.92c-1.79-.88-3-2.71-3-4.78 0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.07-1.21 3.9-3 4.78zM9 21h6v1H9v-1z"
                    fill="currentColor"
                  />
                </svg>
                AI Career Advice
              </button>
            </div>
          </div>
        </div>
      </section>
      {aiOpen ? (
        <AiCareerModal open onClose={() => setAiOpen(false)} />
      ) : null}
    </>
  );
}
