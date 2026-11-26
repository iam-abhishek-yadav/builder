import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, Tags } from "lucide-react";
import { Container, Eyebrow } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { listAllArticles } from "@/lib/learn/queries";

export const metadata: Metadata = { title: "Studio", robots: { index: false } };

export default function StudioPage() {
  return (
    <Container className="py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-8">
        <div className="space-y-2">
          <Eyebrow>Studio</Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">Write, edit and publish Learn articles. Only admins can see this page.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/studio/topics" className={buttonVariants({ variant: "outline" })}>
            <Tags /> Topics
          </Link>
          <Link href="/studio/new" className={buttonVariants()}>
            <Plus /> New article
          </Link>
        </div>
      </header>
      <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-muted/50" />}>
        <ArticleTable />
      </Suspense>
    </Container>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

async function ArticleTable() {
  await requireAdmin();
  const articles = await listAllArticles();
  if (articles.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        No articles yet. Write the first one.
      </div>
    );
  }
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left font-mono text-xs tracking-wider text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Topic</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updated (UTC)</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {articles.map((a) => (
            <tr key={a.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <Link href={`/studio/${a.id}`} className="font-medium hover:text-brand">
                  {a.title}
                </Link>
                <div className="font-mono text-xs text-muted-foreground">/learn/{a.slug}</div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{a.topic.name}{a.featured ? <span className="ml-2 font-mono text-[10px] tracking-wider text-brand uppercase">Featured</span> : null}</td>
              <td className="px-4 py-3">
                <Badge variant={a.status === "published" ? "default" : "outline"}>
                  {a.status === "published" ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{dateFormat.format(a.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
