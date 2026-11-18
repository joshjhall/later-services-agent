import { ThemeControls } from "@/theme/ThemeControls";

/** Placeholder shell: proves the seed-generated palette end to end. */
export function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Later Services Agent</h1>
        <ThemeControls />
      </header>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-3">
        {[
          "primary",
          "secondary",
          "accent",
          "muted",
          "destructive",
          "success",
          "warning",
          "info",
        ].map((s) => (
          <div key={s} className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <div className="h-12 rounded-md border" style={{ background: `var(--${s})` }} />
            {s}
          </div>
        ))}
      </div>
    </main>
  );
}
