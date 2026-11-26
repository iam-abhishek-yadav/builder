"use client";

import { useEffect, useId, useState } from "react";

/** Renders a ```mermaid code block. Mermaid is loaded lazily, only on pages that use it. */
export function MermaidDiagram({ chart }: { chart: string }) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        // "strict" makes Mermaid sanitize labels and disable click handlers / scripts.
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral", fontFamily: "inherit" });
        const result = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(result.svg);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Invalid diagram");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="not-prose my-6 rounded-xl border border-destructive/40 p-4 text-sm">
        <p className="font-medium text-destructive">Diagram error</p>
        <pre className="mt-2 overflow-x-auto text-xs whitespace-pre-wrap text-muted-foreground">{chart}</pre>
      </div>
    );
  }

  return (
    <figure className="not-prose my-6 overflow-x-auto rounded-xl border bg-background p-4">
      {svg ? (
        // Mermaid output is sanitized by securityLevel: "strict".
        <div className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="h-40 animate-pulse rounded-lg bg-muted" aria-label="Loading diagram" />
      )}
    </figure>
  );
}
