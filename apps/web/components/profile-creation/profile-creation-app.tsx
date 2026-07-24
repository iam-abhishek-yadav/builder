"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Link2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CreatorHubSidebar,
  CreatorHubTopBar,
} from "@/components/creator-hub/sidebar";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PROFILE,
  loadProfile,
  PROFILE_STEPS,
  saveProfile,
  type ProfileData,
} from "./types";

const TOTAL_STEPS = PROFILE_STEPS.length;

export function ProfileCreationApp() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  useEffect(() => {
    void Promise.resolve().then(() => {
      setProfile(loadProfile());
      setHydrated(true);
    });
  }, []);

  const meta = PROFILE_STEPS[step - 1];
  const progress = (step / TOTAL_STEPS) * 100;

  function updateField<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    if (step < TOTAL_STEPS) {
      setDirection("next");
      setStep((value) => value + 1);
      return;
    }
    saveProfile(profile);
    router.push("/resume-builder");
  }

  function goPrev() {
    if (step <= 1) return;
    setDirection("prev");
    setStep((value) => value - 1);
  }

  function skipStep() {
    goNext();
  }

  function onPhotoSelected(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      // Keep storage reasonable for localStorage.
      if (result.length > 750_000) {
        updateField("photoDataUrl", "");
        return;
      }
      updateField("photoDataUrl", result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex min-h-dvh overflow-x-hidden bg-background text-foreground">
      <CreatorHubSidebar active="profile" />

      <main className="relative min-h-dvh flex-1 md:ml-64">
        <CreatorHubTopBar
          active="profile"
          title="Create Profile"
          trailing={
            <span className="text-xs font-medium text-muted-foreground sm:text-sm">
              Step {step} of {TOTAL_STEPS}
            </span>
          }
        />

        <div className="h-1 w-full bg-accent">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground md:hidden">
          <span className="font-semibold text-foreground">{meta.title}</span>
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-12">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {meta.title}
            </h1>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">
              {meta.subtitle}
            </p>
          </div>

          <div className="relative min-h-[420px] sm:min-h-[500px]">
            <section
              key={step}
              className={cn(
                "w-full space-y-6 duration-300",
                direction === "next" ? "animate-fade-up" : "animate-fade-in",
              )}
            >
              {step === 1 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex min-w-0 flex-col gap-2">
                    <Label htmlFor="form-name">Full Name</Label>
                    <Input
                      id="form-name"
                      value={profile.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="e.g. Julian Montgomery"
                      className="h-11 bg-muted focus-visible:ring-inset"
                      disabled={!hydrated}
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-2">
                    <Label htmlFor="form-title">Professional Title</Label>
                    <Input
                      id="form-title"
                      value={profile.title}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                      placeholder="e.g. Senior Brand Designer"
                      className="h-11 bg-muted focus-visible:ring-inset"
                      disabled={!hydrated}
                    />
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-end justify-between gap-3">
                    <Label htmlFor="form-bio">Professional Bio</Label>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Sparkles className="size-3.5" />
                      AI Generate · Coming soon
                    </span>
                  </div>
                  <Textarea
                    id="form-bio"
                    value={profile.bio}
                    onChange={(event) => updateField("bio", event.target.value)}
                    placeholder="Tell your career story..."
                    rows={8}
                    className="min-h-48 resize-none bg-muted text-base focus-visible:ring-inset md:text-base"
                    disabled={!hydrated}
                  />
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-muted p-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#0077B5] text-white">
                      <Link2 className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Label
                        htmlFor="form-linkedin"
                        className="mb-1 text-xs text-muted-foreground"
                      >
                        LinkedIn Profile
                      </Label>
                      <Input
                        id="form-linkedin"
                        type="url"
                        value={profile.linkedin}
                        onChange={(event) =>
                          updateField("linkedin", event.target.value)
                        }
                        placeholder="linkedin.com/in/username"
                        className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                        disabled={!hydrated}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50 p-8 sm:p-12">
                  <div className="relative mb-6">
                    <div className="flex size-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-accent shadow-xl">
                      {profile.photoDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.photoDataUrl}
                          alt="Profile preview"
                          className="size-full object-cover"
                        />
                      ) : (
                        <UserRound className="size-16 text-muted-foreground/50" />
                      )}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      className="absolute right-1 bottom-1 size-10 rounded-full shadow-lg"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload photo"
                    >
                      <Camera />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        onPhotoSelected(event.target.files?.[0])
                      }
                    />
                  </div>
                  <p className="max-w-sm text-center text-sm text-muted-foreground">
                    Upload a clear headshot. You can skip this and add one later.
                  </p>
                  {profile.photoDataUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-3 text-muted-foreground"
                      onClick={() => updateField("photoDataUrl", "")}
                    >
                      Remove photo
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>

          <footer className="mt-10 flex items-center justify-between border-t border-border pt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={goPrev}
              className={cn(
                "text-muted-foreground",
                step === 1 && "invisible pointer-events-none",
              )}
            >
              <ArrowLeft />
              Back
            </Button>
            <div className="flex items-center gap-2 sm:gap-4">
              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={skipStep}
                  className="text-muted-foreground"
                >
                  Skip
                </Button>
              ) : null}
              <Button type="button" onClick={goNext} className="px-6 sm:px-8">
                <span>{step === TOTAL_STEPS ? "Finish" : "Continue"}</span>
                <ArrowRight />
              </Button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
