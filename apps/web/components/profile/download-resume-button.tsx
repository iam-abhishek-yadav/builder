import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DownloadResumeButton() {
  return (
    <>
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href="/profile/resume" />}
      >
        Preview resume
      </Button>
      <Button
        variant="outline"
        nativeButton={false}
        render={<a href="/profile/resume/pdf?download=1" />}
      >
        Download PDF
      </Button>
    </>
  );
}
