import type { ReactNode } from "react";
import { useStore } from "@/domain/store";
import type { Route } from "@/router";
import { pendingIn, scopeOf } from "./scope";
import { selectRail } from "./select";
import { WidgetCard } from "./widgets";

/**
 * The context rail: 2–4 widgets from the fixed library, chosen by `selectRail`.
 * Returns `null` when nothing fits, so the layout gives the core the full width.
 */
export function useRail(route: Route): ReactNode {
  const { world, sent } = useStore();
  const scope = scopeOf(route, world.campaigns);
  const ids = selectRail(route, {
    campaigns: scope.length,
    scheduled: pendingIn(world.scheduledMessages, scope, sent).length,
  });
  if (ids.length === 0) return null;
  return (
    <div className="grid gap-4">
      {ids.map((id) => (
        <WidgetCard key={id} id={id} scope={scope} />
      ))}
    </div>
  );
}
