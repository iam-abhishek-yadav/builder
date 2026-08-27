import { auth } from "@clerk/nextjs/server";
import { requireDbUser } from "@/lib/current-user";
import { loadJobProfile } from "@/lib/job-profile";
import { profileToResume, resumeFilename } from "@/lib/resume";
import { buildResumePdf } from "@/lib/resume-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await auth.protect();
  const user = await requireDbUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const profile = await loadJobProfile(user.id);
  const resume = profileToResume(profile, user.email ?? "");
  const bytes = await buildResumePdf(resume);
  const filename = resumeFilename(resume.name);
  const download = new URL(request.url).searchParams.get("download") === "1";
  const encoded = encodeURIComponent(filename);

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "no-store",
    },
  });
}
