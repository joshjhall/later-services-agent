import { createContext, type ReactNode, use, useMemo, useState } from "react";
import { deriveProposals, type Proposal } from "@/agent/rules";
import * as fx from "./fixtures";
import type { AgentLogEntry } from "./types";

interface Resolution {
  optionId: string;
  label: string;
  at: string;
}

interface Store {
  world: typeof fx;
  proposals: Proposal[];
  /** Keyed by proposal id, so resolving twice is a no-op (framing §6). */
  resolved: Record<string, Resolution>;
  resolve: (p: Proposal, optionId: string) => void;
  log: AgentLogEntry[];
}

const Ctx = createContext<Store | null>(null);

/** In-memory demo state. Resolutions reset on reload, by design. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const [log, setLog] = useState(fx.agentLog);
  const proposals = useMemo(() => deriveProposals(fx), []);

  const value = useMemo<Store>(
    () => ({
      world: fx,
      proposals,
      resolved,
      log,
      resolve: (p, optionId) => {
        if (resolved[p.id]) return; // idempotent
        const label = p.options.find((o) => o.id === optionId)?.label ?? optionId;
        setResolved((r) => ({ ...r, [p.id]: { optionId, label, at: fx.DEMO_TODAY } }));
        setLog((l) => [
          {
            id: `log-${p.id}`,
            at: fx.DEMO_TODAY,
            action: `CM chose "${label}"`,
            target: p.title,
            undoable: true,
          },
          ...l,
        ]);
      },
    }),
    [proposals, resolved, log],
  );
  return <Ctx value={value}>{children}</Ctx>;
}

export function useStore(): Store {
  const s = use(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}
