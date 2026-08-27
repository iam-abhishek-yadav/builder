import { renderToBuffer } from "@react-pdf/renderer";
import { ResumeDocument } from "@/lib/resume-document";
import { registerResumeFonts } from "@/lib/resume-fonts";
import type { ResumeDoc } from "@/lib/resume";

export async function buildResumePdf(resume: ResumeDoc) {
  registerResumeFonts();
  return renderToBuffer(<ResumeDocument resume={resume} />);
}
