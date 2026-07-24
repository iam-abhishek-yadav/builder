"use client";

import { cn } from "@/lib/utils";
import type { ResumeSection, ResumeTemplate } from "./types";

export function ResumePreview({
  name,
  title,
  sections,
  template,
  className,
}: {
  name: string;
  title: string;
  sections: ResumeSection[];
  template: ResumeTemplate;
  className?: string;
}) {
  return (
    <article
      id="resume-preview"
      className={cn(
        "resume-shadow w-full max-w-[700px] bg-white p-8 text-[#0b1c30] transition-all duration-500 sm:min-h-[990px] sm:p-12",
        `template-${template}`,
        className,
      )}
    >
      <header className="preview-header mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-[#0b1c30] sm:text-4xl">
          {name.trim() || "Your Name"}
        </h1>
        <p className="text-xl font-medium text-[#1a56db]">
          {title.trim() || "Professional Title"}
        </p>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="mb-4 border-b border-[#c6c6cd] pb-2 text-lg font-bold tracking-wide text-[#0b1c30] uppercase">
              {section.title.trim() || "Section"}
            </h2>

            {section.type === "summary" ? (
              <p className="text-sm leading-relaxed text-[#45464d]">
                {section.entries[0]?.description.trim() ||
                  "Write a short professional summary..."}
              </p>
            ) : section.type === "skills" ? (
              <div className="space-y-3">
                {section.entries.map((entry) => (
                  <div key={entry.id} className="text-sm">
                    {entry.primary.trim() ? (
                      <span className="font-bold text-[#0b1c30]">
                        {entry.primary.trim()}:{" "}
                      </span>
                    ) : null}
                    <span className="text-[#45464d]">
                      {entry.description.trim() || "List your skills..."}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {section.entries.map((entry) => (
                  <div key={entry.id}>
                    <div className="mb-1 font-bold text-[#0b1c30]">
                      {entry.primary.trim() ||
                        (section.type === "education"
                          ? "School"
                          : section.type === "projects"
                            ? "Project"
                            : "Company")}
                    </div>
                    {entry.secondary.trim() ? (
                      <div className="mb-2 text-sm font-semibold text-[#1a56db]">
                        {entry.secondary.trim()}
                      </div>
                    ) : null}
                    <p className="text-sm leading-relaxed text-[#45464d]">
                      {entry.description.trim() || "Add details..."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
