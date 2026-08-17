export const OUTREACH_STORAGE_KEY = "builder_outreach_drafts";
export const PLAN_ACK_KEY = "builder_outreach_plan_ack";

export function hasAcknowledgedPlan() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PLAN_ACK_KEY) === "1";
}

export function acknowledgePlan() {
  localStorage.setItem(PLAN_ACK_KEY, "1");
}

export type OutreachDraft = {
  id: string;
  jobTitle: string;
  company: string;
  recruiterName: string;
  jobDescription: string;
  subject: string;
  body: string;
  createdAt: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDraftId() {
  return uid();
}

export function loadDrafts(): OutreachDraft[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(OUTREACH_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOutreachDraft);
  } catch {
    return [];
  }
}

export function saveDrafts(drafts: OutreachDraft[]) {
  localStorage.setItem(OUTREACH_STORAGE_KEY, JSON.stringify(drafts));
}

function isOutreachDraft(value: unknown): value is OutreachDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.id === "string" &&
    typeof draft.jobTitle === "string" &&
    typeof draft.company === "string" &&
    typeof draft.subject === "string" &&
    typeof draft.body === "string" &&
    typeof draft.createdAt === "string"
  );
}

export function jdSnippet(jobDescription: string, max = 140) {
  const compact = jobDescription.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1)}…`;
}
