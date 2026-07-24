"use client";

import { useEffect, useId, useRef, useState } from "react";

export function AiCareerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="bg-surface w-full max-w-xl rounded-2xl ambient-shadow overflow-hidden animate-fade-up"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <div className="flex items-center gap-sm text-secondary">
            <PsychologyIcon />
            <h3
              id={titleId}
              className="font-display text-headline-sm font-semibold"
            >
              AI Career Counselor
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-lg">
          <p className="text-body-md text-on-surface-variant mb-lg">
            Tell me about your career goals or current role, and I&apos;ll
            suggest the best Builder tools and templates for your journey.
          </p>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full h-32 p-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary outline-none transition-all resize-none text-body-md mb-md"
            placeholder="e.g. I'm a Senior Marketing Manager looking to move into Tech Product Management..."
          />
          {response ? (
            <div className="mb-md p-md bg-secondary-container/40 border border-secondary/20 rounded-xl animate-fade-in">
              <p className="text-label-sm text-secondary font-bold mb-1 uppercase tracking-wide">
                AI Suggestion
              </p>
              <p className="text-body-md text-on-surface leading-relaxed">
                {response}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={generateGuidance}
            disabled={loading || !input.trim()}
            className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl text-label-md font-semibold flex items-center justify-center gap-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <SpinnerIcon />
                Thinking...
              </>
            ) : (
              <>
                <SparkIcon />
                Generate Guidance
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PsychologyIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 3c-3.87 0-7 3.13-7 7 0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 11.08V16h-4v-1.92c-1.79-.88-3-2.71-3-4.78 0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.07-1.21 3.9-3 4.78zM9 21h6v1H9v-1z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
        fill="currentColor"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2l1.2 6.2L19 10l-5.8 1.8L12 18l-1.2-6.2L5 10l5.8-1.8L12 2zm7 10 0.7 3.3L23 16l-3.3.7L19 20l-.7-3.3L15 16l3.3-.7L19 12zM5 14l.6 2.8L8.5 17.5 5.6 18.1 5 21l-.6-2.9L1.5 17.5l2.9-.7L5 14z"
        fill="currentColor"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
