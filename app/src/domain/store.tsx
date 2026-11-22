import { createContext, type ReactNode, use, useMemo, useState } from "react";
import { deriveProposals, type Proposal } from "@/agent/rules";
import * as fx from "./fixtures";
import type { ActivityEntry } from "./types";

/** The signed-in person in the demo; decisions are recorded under this name. */
export const CURRENT_USER = "Maya";

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
  activity: ActivityEntry[];
}

const Ctx = createContext<Store | null>(null);

/** In-memory demo state. Resolutions reset on reload, by design. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const [activity, setActivity] = useState(fx.activity);
  const proposals = useMemo(() => deriveProposals(fx), []);

  const value = useMemo<Store>(
    () => ({
      world: fx,
      proposals,
      resolved,
      activity,
      resolve: (p, optionId) => {
        if (resolved[p.id]) return; // idempotent
        const option = p.options.find((o) => o.id === optionId);
        const label = option?.label ?? optionId;
        setResolved((r) => ({ ...r, [p.id]: { optionId, label, at: fx.DEMO_TODAY } }));
        setActivity((a) => [
          {
            id: `act-${p.id}`,
            at: fx.DEMO_TODAY,
            actor: CURRENT_USER,
            action: `Chose "${label}"`,
            target: p.title,
            effect: option?.effect ?? "internal",
          },
          ...a,
        ]);
      },
    }),
    [proposals, resolved, activity],
  );
  return <Ctx value={value}>{children}</Ctx>;
}

export function useStore(): Store {
  const s = use(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}
