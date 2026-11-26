import type { Metadata } from "next";
import { Suspense } from "react";
import { SheetEditor } from "@/components/practice/sheet-editor";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "New sheet", robots: { index: false } };

export default function NewSheetPage() {
  return (
    <Suspense fallback={<div className="h-[70vh] animate-pulse bg-muted/40" />}>
      <NewSheet />
    </Suspense>
  );
}

async function NewSheet() {
  await requireAdmin();
  return <SheetEditor sheet={null} />;
}
