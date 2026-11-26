import GithubSlugger from "github-slugger";

/**
 * Roadmap outline format (Markdown-like, written in Studio):
 *
 *   ## Stage title
 *   Optional stage description (any non-list lines).
 *
 *   - Step title :: optional one-line description
 *   - (optional) Nice-to-have step :: ...
 *   - (alt) Alternative to the previous step :: ...
 *     - [Resource label](https://example.com)
 *     - learn: some-article-slug        (links a Learn article)
 *     - Any other indented line adds detail text to the step.
 *
 * Each step gets a stable `key` ("stage-slug/step-slug") used for progress tracking.
 * Renaming a stage or step changes its key, so readers' progress on it resets.
 */

export type StepKind = "core" | "optional" | "alt";
export type Resource = { label: string; url: string };

export type RoadmapStep = {
  key: string;
  title: string;
  kind: StepKind;
  summary: string;
  details: string[];
  resources: Resource[];
  articleSlugs: string[];
};

export type RoadmapStage = {
  key: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
};

export type ParsedOutline = {
  stages: RoadmapStage[];
  stepCount: number;
  stepKeys: string[];
  /** Human-readable problems, with 1-based line numbers. */
  errors: string[];
};

// The URL runs to the final ")" so URLs containing parentheses still work.
const LINK = /^\[([^\]]+)\]\((https?:\/\/\S+)\)\s*$/;
const BARE_URL = /^(https?:\/\/\S+)$/;
const LEARN = /^learn:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*$/i;
const KIND = /^\((optional|alt|alternative)\)\s*/i;

export function parseOutline(source: string): ParsedOutline {
  const stages: RoadmapStage[] = [];
  const errors: string[] = [];
  const stageSlugger = new GithubSlugger();
  let stepSlugger = new GithubSlugger();
  let stage: RoadmapStage | null = null;
  let step: RoadmapStep | null = null;
  const descLines: string[] = [];

  const flushDescription = () => {
    if (stage && descLines.length) stage.description = descLines.join(" ").trim();
    descLines.length = 0;
  };

  source.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.replace(/\s+$/, "");
    const lineNo = i + 1;
    if (!line.trim()) return;

    const heading = /^##\s+(.+)$/.exec(line);
    if (heading) {
      flushDescription();
      const title = heading[1].trim();
      stage = { key: stageSlugger.slug(title), title, description: "", steps: [] };
      stepSlugger = new GithubSlugger();
      stages.push(stage);
      step = null;
      return;
    }
    if (/^#\s/.test(line)) return; // a top-level title line is allowed and ignored

    const top = /^[-*]\s+(.+)$/.exec(line);
    if (top) {
      if (!stage) {
        errors.push(`Line ${lineNo}: add a "## Stage" heading before the first step.`);
        return;
      }
      flushDescription();
      let text = top[1].trim();
      let kind: StepKind = "core";
      const marker = KIND.exec(text);
      if (marker) {
        kind = marker[1].toLowerCase() === "optional" ? "optional" : "alt";
        text = text.slice(marker[0].length);
      }
      const [title, ...rest] = text.split("::");
      const cleanTitle = title.trim();
      if (!cleanTitle) {
        errors.push(`Line ${lineNo}: step has no title.`);
        return;
      }
      step = {
        key: `${stage.key}/${stepSlugger.slug(cleanTitle)}`,
        title: cleanTitle,
        kind,
        summary: rest.join("::").trim(),
        details: [],
        resources: [],
        articleSlugs: [],
      };
      stage.steps.push(step);
      return;
    }

    const nested = /^\s+[-*]\s+(.+)$/.exec(line) ?? /^\s{2,}(\S.*)$/.exec(line);
    if (nested && step) {
      const text = nested[1].trim();
      const link = LINK.exec(text);
      const bare = BARE_URL.exec(text);
      const learn = LEARN.exec(text);
      if (link) step.resources.push({ label: link[1].trim(), url: link[2] });
      else if (bare) step.resources.push({ label: new URL(bare[1]).hostname.replace(/^www\./, ""), url: bare[1] });
      else if (learn) step.articleSlugs.push(learn[1].toLowerCase());
      else step.details.push(text);
      return;
    }

    if (stage && !step) {
      descLines.push(line.trim());
      return;
    }
    if (!stage) {
      errors.push(`Line ${lineNo}: text before the first "## Stage" heading is ignored.`);
      return;
    }
    // Plain text after steps: treat as detail of the last step.
    step?.details.push(line.trim());
  });
  flushDescription();

  if (stages.length === 0) errors.push('Add at least one stage ("## Stage title").');
  for (const s of stages) if (s.steps.length === 0) errors.push(`Stage "${s.title}" has no steps.`);

  const stepKeys = stages.flatMap((s) => s.steps.map((st) => st.key));
  return { stages, stepCount: stepKeys.length, stepKeys, errors };
}

// ---- Serializing (used by the visual editor) ----

export type DraftStep = {
  title: string;
  kind: StepKind;
  summary: string;
  details: string[];
  resources: Resource[];
  articleSlugs: string[];
};
export type DraftStage = { title: string; description: string; steps: DraftStep[] };

/** Keeps user text from being re-read as outline syntax. */
const oneLine = (s: string) => s.replace(/\s*\r?\n\s*/g, " ").trim();
const safeTitle = (s: string) => oneLine(s).replace(/::/g, ":").replace(KIND, "").replace(/^#+\s*/, "");
const safeText = (s: string) => oneLine(s).replace(/^([-*]|#+)\s+/, "");

/** Inverse of parseOutline: renders stages/steps back to outline text. */
export function serializeOutline(stages: DraftStage[]): string {
  const out: string[] = [];
  for (const stage of stages) {
    const title = safeTitle(stage.title);
    if (!title) continue;
    out.push(`## ${title}`);
    const description = safeText(stage.description);
    if (description) out.push(description);
    out.push("");
    for (const step of stage.steps) {
      const stepTitle = safeTitle(step.title);
      if (!stepTitle) continue;
      const marker = step.kind === "optional" ? "(optional) " : step.kind === "alt" ? "(alt) " : "";
      const summary = oneLine(step.summary);
      out.push(`- ${marker}${stepTitle}${summary ? ` :: ${summary}` : ""}`);
      for (const r of step.resources) {
        const url = r.url.trim();
        if (!/^https?:\/\/\S+$/.test(url)) continue;
        const label = oneLine(r.label).replace(/[[\]]/g, "") || new URL(url).hostname.replace(/^www\./, "");
        out.push(`  - [${label}](${url})`);
      }
      for (const slug of step.articleSlugs) if (slug.trim()) out.push(`  - learn: ${slug.trim()}`);
      for (const d of step.details) {
        const text = safeText(d);
        if (text) out.push(`  - ${text}`);
      }
    }
    out.push("");
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
