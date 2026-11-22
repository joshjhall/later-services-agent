import type { Proposal } from "@/agent/rules";
import type { ActivityEntry, Campaign, ScheduledMessage } from "@/domain/types";
import type { Route } from "@/router";

/**
 * What the rail's widgets are about: the campaigns in view. Data only; which
 * widgets to show is `selectRail` (select.ts).
 */
export function scopeOf(route: Route, campaigns: Pick<Campaign, "id" | "accountId">[]): string[] {
  switch (route.view) {
    case "today":
      return campaigns.map((c) => c.id);
    case "account":
      return campaigns.filter((c) => c.accountId === route.id).map((c) => c.id);
    case "campaign":
    case "lineup":
    case "goal":
      return campaigns.some((c) => c.id === route.id) ? [route.id] : [];
    default:
      return [];
  }
}

/**
 * Whether an activity entry is about a campaign. Entries name campaigns by short
 * name ("Rio Castillo · Sparkling Citrus" for "Sparkling Citrus launch"), so match
 * the last segment as a prefix, or the full name anywhere.
 */
export function isAbout(entry: Pick<ActivityEntry, "target">, campaignName: string): boolean {
  const last = entry.target.split(" · ").at(-1) ?? "";
  return entry.target.includes(campaignName) || (last !== "" && campaignName.startsWith(last));
}

export function activityIn(
  entries: ActivityEntry[],
  campaigns: Pick<Campaign, "id" | "name">[],
  scope: string[],
): ActivityEntry[] {
  const names = campaigns.filter((c) => scope.includes(c.id)).map((c) => c.name);
  // Match by id where an entry carries one; text matching is only a fallback.
  return entries.filter((e) =>
    e.campaignId ? scope.includes(e.campaignId) : names.some((n) => isAbout(e, n)),
  );
}

/** Queued messages in scope that haven't gone out yet, soonest first. */
export function pendingIn(
  messages: ScheduledMessage[],
  scope: string[],
  sent: Record<string, unknown>,
): ScheduledMessage[] {
  return messages
    .filter((m) => scope.includes(m.campaignId) && !sent[m.id])
    .sort((a, b) => a.sendAt.localeCompare(b.sendAt));
}

export function openIn(
  proposals: Proposal[],
  resolved: Record<string, unknown>,
  scope: string[],
): Proposal[] {
  return proposals.filter((p) => scope.includes(p.campaignId) && !resolved[p.id]);
}
