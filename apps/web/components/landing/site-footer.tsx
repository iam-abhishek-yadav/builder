export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-8">
        <span className="font-display text-sm font-semibold text-foreground">
          Builder
        </span>
        <span className="text-sm text-muted-foreground">
          © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
