"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GetStartedButton } from "@/components/landing/get-started-button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[min(92vh,880px)] items-end overflow-hidden">
      <div className="absolute inset-0 animate-fade-in">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=80"
          alt="Bright modern workspace with desk and natural light"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="hero-wash absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-20 pb-16 sm:px-8 md:pb-24">
        <div className="max-w-2xl">
          <p className="font-display animate-fade-up mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Builder
          </p>
          <h1 className="font-display animate-fade-up mb-6 text-4xl leading-tight font-bold tracking-tight text-foreground md:text-5xl md:leading-[1.15]">
            From job post to recruiter email,{" "}
            <span className="font-display text-primary italic">
              in one sitting.
            </span>
          </h1>
          <p className="animate-fade-up-delay mb-8 max-w-lg text-lg leading-7 text-muted-foreground">
            Paste a role, use your saved resume, and get a cold email that
            cites your real work—then copy it into your inbox.
          </p>
          <div className="animate-fade-up-delay flex flex-wrap items-center gap-3">
            <GetStartedButton className="ambient-shadow h-12 px-8 text-sm">
              Start outreach
            </GetStartedButton>
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/resume-builder" />}
              className="h-12 px-6 text-sm"
            >
              Build resume
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
