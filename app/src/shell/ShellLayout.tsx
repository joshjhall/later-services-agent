import type { ReactNode } from "react";

/**
 * Core context plus an optional right rail (information-architecture.md §1).
 * With no rail, the core spans the full width; the rail never holds primary actions.
 */
export function ShellLayout({ rail, children }: { rail?: ReactNode; children: ReactNode }) {
  return (
    <div className={rail ? "grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,28%)]" : undefined}>
      <main className="mx-auto w-full max-w-6xl p-6">{children}</main>
      {rail && (
        <aside aria-label="Context rail" className="border-l p-4">
          {rail}
        </aside>
      )}
    </div>
  );
}
