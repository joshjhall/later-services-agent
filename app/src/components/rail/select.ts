import type { Route } from "@/router";

/** The fixed widget library (registry in widgets.tsx). The rail never shows anything else. */
export type WidgetId = "summary" | "activity" | "next-message" | "compare";

/** What the selector knows about the data in view. Add a fact here to use it in a rule. */
export interface RailFacts {
  /** Campaigns in view (scope.ts). One means a single-campaign screen. */
  campaigns: number;
  /** Queued messages in scope that haven't gone out yet. */
  scheduled: number;
}

export const MIN_WIDGETS = 2;
export const MAX_WIDGETS = 4;

/**
 * The one place the rail's widgets are chosen (principles §8: selected, never generated).
 * Change a rule here to change the rail everywhere.
 *
 * In production a model would make this choice, picking 2–4 widgets whose declared
 * data (`accepts` in widgets.tsx) fits what's in view. As patterns settle, a rule
 * like this one takes over that choice (principles §3). An empty list hides the rail.
 */
export function selectRail(route: Route, facts: RailFacts): WidgetId[] {
  if (facts.campaigns === 0) return [];
  const picks: WidgetId[] = [];

  switch (route.view) {
    case "today":
    case "account":
      picks.push("summary");
      if (facts.scheduled > 0) picks.push("next-message");
      picks.push("activity");
      break;
    case "campaign":
    case "lineup":
      picks.push("summary", "compare");
      if (facts.scheduled > 0) picks.push("next-message");
      picks.push("activity");
      break;
    default:
      // Goal, roster, and activity are focused tasks or already the full record: no rail.
      return [];
  }

  return picks.length >= MIN_WIDGETS ? picks.slice(0, MAX_WIDGETS) : [];
}
