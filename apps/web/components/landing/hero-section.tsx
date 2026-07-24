"use client";

import Image from "next/image";
import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiCareerDialog } from "@/components/landing/ai-career-dialog";

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

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20 pb-16 md:pb-24">
        <div className="max-w-2xl">
          <p className="font-display animate-fade-up mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Builder
          </p>
          <h1 className="font-display animate-fade-up mb-6 text-4xl leading-tight font-bold tracking-tight text-foreground md:text-5xl md:leading-[1.15]">
            Your career,{" "}
            <span className="font-display text-primary italic">
              all in one place.
            </span>
          </h1>
          <p className="animate-fade-up-delay mb-8 max-w-lg text-lg leading-7 text-muted-foreground">
            Profiles, resumes, and portfolios that help you land the role you
            want—built for modern professionals.
          </p>
          <div className="animate-fade-up-delay flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/resume-builder" />}
              className="ambient-shadow h-12 px-8 text-sm"
            >
              Start Building Free
            </Button>
            <AiCareerDialog
              trigger={
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-primary px-8 text-sm text-primary"
                >
                  <Brain />
                  AI Career Advice
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
