import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Container, Eyebrow } from "@/components/container";
import { StudioNav } from "@/components/studio-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { listAllSheets } from "@/lib/practice/queries";

export const metadata: Metadata = { title: "Sheets · Studio", robots: { index: false } };

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export default function StudioSheetsPage() {
  return (
    <Container className="py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-8">
        <div className="space-y-2">
          <Eyebrow>Studio</Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight">DSA sheets</h1>
          <p className="text-muted-foreground">Curated problem lists for the Practice section.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StudioNav active="sheets" />
          <Link href="/studio/sheets/new" className={buttonVariants()}>
            <Plus /> New sheet
          </Link>
        </div>
      </header>
      <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-muted/50" />}>
        <SheetTable />
      </Suspense>
    </Container>
  );
}

async function SheetTable() {
  await requireAdmin();
  const sheets = await listAllSheets();
  if (sheets.length === 0) {
    return <div className="mt-6 rounded-xl border border-dashed p-12 text-center text-muted-foreground">No sheets yet.</div>;
  }
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left font-mono text-xs tracking-wider text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Problems</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updated (UTC)</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sheets.map((s) => (
            <tr key={s.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <Link href={`/studio/sheets/${s.id}`} className="font-medium hover:text-brand">
                  {s.title}
                </Link>
                {s.featured ? <span className="ml-2 font-mono text-[10px] tracking-wider text-brand uppercase">Featured</span> : null}
                <div className="font-mono text-xs text-muted-foreground">/practice/{s.slug}</div>
              </td>
              <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.topics.reduce((n, t) => n + t.problems.length, 0)}</td>
              <td className="px-4 py-3">
                <Badge variant={s.status === "published" ? "default" : "outline"}>{s.status === "published" ? "Published" : "Draft"}</Badge>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{dateFormat.format(s.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
