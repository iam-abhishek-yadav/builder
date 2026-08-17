import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  serializeResume,
  type ResumeData,
  type ResumeSection,
  type SectionEntry,
} from "@/components/resume-builder/types";

type GenerateBody = {
  jobTitle?: unknown;
  company?: unknown;
  recruiterName?: unknown;
  jobDescription?: unknown;
  resume?: unknown;
};

const SYSTEM_PROMPT = `You write concise recruiter cold emails for job seekers.

Rules:
- Use only facts from the resume. Never invent employers, titles, dates, skills, or metrics.
- Tie 2-3 resume points to requirements in the job description.
- 120-180 words. No fluff. No "I hope this finds you well."
- If a recruiter name is given, greet them by first name. Otherwise start with "Hi,".
- Return JSON only with keys "subject" and "body".`;

export async function POST(request: Request) {
  await auth.protect();

  let payload: GenerateBody;
  try {
    payload = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const jobDescription = asTrimmedString(payload.jobDescription);
  const resume = asResumeData(payload.resume);
  if (!jobDescription) {
    return NextResponse.json(
      { error: "A job description is required" },
      { status: 400 },
    );
  }
  if (!resume) {
    return NextResponse.json(
      { error: "A saved resume is required" },
      { status: 400 },
    );
  }

  const jobTitle = asTrimmedString(payload.jobTitle);
  const company = asTrimmedString(payload.company);
  const recruiterName = asTrimmedString(payload.recruiterName);
  const resumeText = serializeResume(resume);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      demo: true,
      subject: mockSubject(jobTitle, company, resume.name),
      body: mockBody({ jobTitle, company, recruiterName, resume }),
    });
  }

  const userPrompt = [
    `Resume:\n${resumeText}`,
    `Job title: ${jobTitle || "(not provided)"}`,
    `Company: ${company || "(not provided)"}`,
    `Recruiter: ${recruiterName || "(not provided)"}`,
    `Job description:\n${jobDescription}`,
  ].join("\n\n");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI error", response.status, detail);
      return NextResponse.json(
        { error: "The language model could not generate a draft" },
        { status: 502 },
      );
    }

    const completion = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = completion.choices?.[0]?.message?.content;
    const parsed = parseModelJson(content);
    if (!parsed) {
      return NextResponse.json(
        { error: "The language model returned an unreadable draft" },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not reach the language model" },
      { status: 502 },
    );
  }
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asResumeData(value: unknown): ResumeData | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Partial<ResumeData>;
  if (typeof data.name !== "string" || typeof data.title !== "string") {
    return null;
  }
  if (!Array.isArray(data.sections)) return null;
  const sections = data.sections.filter(isResumeSection);
  return {
    name: data.name,
    title: data.title,
    sections,
    template:
      data.template === "modern" || data.template === "minimal"
        ? data.template
        : "executive",
  };
}

function isResumeSection(value: unknown): value is ResumeSection {
  if (!value || typeof value !== "object") return false;
  const section = value as Partial<ResumeSection>;
  return (
    typeof section.id === "string" &&
    typeof section.title === "string" &&
    Array.isArray(section.entries) &&
    section.entries.every(isSectionEntry)
  );
}

function isSectionEntry(value: unknown): value is SectionEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<SectionEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.primary === "string" &&
    typeof entry.secondary === "string" &&
    typeof entry.description === "string"
  );
}

function parseModelJson(content: string | undefined): {
  subject: string;
  body: string;
} | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as { subject?: unknown; body?: unknown };
    if (typeof parsed.subject !== "string" || typeof parsed.body !== "string") {
      return null;
    }
    const subject = parsed.subject.trim();
    const body = parsed.body.trim();
    if (!subject || !body) return null;
    return { subject, body };
  } catch {
    return null;
  }
}

function mockSubject(jobTitle: string, company: string, name: string) {
  const role = jobTitle || "the role";
  const at = company ? ` at ${company}` : "";
  const who = name ? ` — ${name}` : "";
  return `[Demo] ${role}${at}${who}`;
}

function mockBody({
  jobTitle,
  company,
  recruiterName,
  resume,
}: {
  jobTitle: string;
  company: string;
  recruiterName: string;
  resume: ResumeData;
}) {
  const greeting = recruiterName
    ? `Hi ${recruiterName.split(" ")[0]},`
    : "Hi,";
  const role = jobTitle || "this role";
  const at = company ? ` at ${company}` : "";
  const summary =
    resume.sections
      .flatMap((section) => section.entries)
      .map((entry) => entry.description)
      .find((text) => text.trim()) ?? resume.title;

  return `${greeting}

This is a demo draft because OPENAI_API_KEY is not configured. In production, Builder would match ${resume.name || "the candidate"}'s resume to ${role}${at} and cite only real experience.

${summary ? `From the saved resume: ${summary}` : "Add detail to the resume to give the model more to work with."}

I'd welcome a short conversation if this looks like a fit.

Best,
${resume.name || "Your name"}`;
}
