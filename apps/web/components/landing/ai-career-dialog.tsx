"use client";

import { useState } from "react";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function AiCareerDialog({
  trigger,
}: {
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setInput("");
      setLoading(false);
      setResponse(null);
    }
  }

  function generateGuidance() {
    const goal = input.trim();
    if (!goal || loading) return;

    setLoading(true);
    window.setTimeout(() => {
      setResponse(
        `Based on your goal to “${goal}”, start with an Executive Resume template, then refine your narrative in Profile Creator so marketing or adjacent skills read as product outcomes. Lead with metrics-driven achievements recruiters can scan in seconds.`,
      );
      setLoading(false);
    }, 1400);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="gap-0 p-0 sm:max-w-xl" showCloseButton>
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="font-display flex items-center gap-2 text-xl font-semibold">
            <Brain className="size-5 text-primary" />
            AI Career Counselor
          </DialogTitle>
          <DialogDescription className="text-base">
            Tell me about your career goals or current role, and I&apos;ll
            suggest the best Builder tools and templates for your journey.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-6 py-5">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-32 resize-none bg-muted/60 text-base md:text-base"
            placeholder="e.g. I'm a Senior Marketing Manager looking to move into Tech Product Management..."
          />
          {response ? (
            <div className="rounded-xl border border-primary/20 bg-secondary/50 p-4">
              <p className="mb-1 text-xs font-bold tracking-wide text-primary uppercase">
                AI Suggestion
              </p>
              <p className="text-base leading-relaxed text-foreground">
                {response}
              </p>
            </div>
          ) : null}
          <Button
            type="button"
            size="lg"
            className="h-11 w-full"
            disabled={loading || !input.trim()}
            onClick={generateGuidance}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles />
                Generate Guidance
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
