import { crumbs, LABELS, type Route } from "@/router";

/**
 * What Find or ask can suggest while you type (information-architecture.md §1).
 * Everything here is scripted for the demo; edit freely during a live change.
 */
export type PaletteItem = {
  id: string;
  group: "Go to" | "Do";
  label: string;
  /** Extra words that should also match, e.g. the account a campaign belongs to. */
  keywords?: string[];
  /** Where choosing the item takes you. */
  route?: Route;
  /** A confirmation shown for scripted actions. */
  toast?: string;
};

type World = {
  accounts: { id: string; name: string }[];
  campaigns: { id: string; accountId: string; name: string }[];
  creators: { id: string; name: string; handle: string }[];
};

/** Label for the one activity record (people and system), shared with the breadcrumb. */
export const ACTIVITY_LABEL = LABELS.activity;

/** Scripted actions. Each one either navigates or confirms with a toast. */
const ACTIONS: PaletteItem[] = [
  {
    id: "do-nudge-ana",
    group: "Do",
    label: "Nudge Ana",
    keywords: ["remind", "draft", "reyes"],
    route: { view: "today" },
    toast: "Ana is in Today: choose how to follow up.",
  },
  {
    id: "do-ana-brief",
    group: "Do",
    label: "Open Ana's brief",
    keywords: ["sparkling", "citrus", "reyes"],
    route: { view: "campaign", id: "cmp-sparkling-launch" },
  },
  {
    id: "do-review-lumen-goal",
    group: "Do",
    label: "Review the Spring serum goal",
    keywords: ["lumen", "goal", "brief"],
    route: { view: "goal", id: "cmp-spring-serum" },
  },
  {
    id: "do-review-lineup",
    group: "Do",
    label: "Review the Holiday gifting lineup",
    keywords: ["brightside", "creators", "lineup"],
    route: { view: "lineup", id: "cmp-holiday-gifting" },
  },
];

export function buildItems(world: World): PaletteItem[] {
  const accountName = (id: string) => world.accounts.find((a) => a.id === id)?.name ?? "";
  const places: PaletteItem[] = [
    {
      id: "go-today",
      group: "Go to",
      label: "Today",
      keywords: ["portfolio", "inbox"],
      route: { view: "today" },
    },
    ...world.accounts.map<PaletteItem>((a) => ({
      id: `go-${a.id}`,
      group: "Go to",
      label: a.name,
      keywords: ["account"],
      route: { view: "account", id: a.id },
    })),
    ...world.campaigns.map<PaletteItem>((c) => ({
      id: `go-${c.id}`,
      group: "Go to",
      label: c.name,
      keywords: ["campaign", accountName(c.accountId)],
      route: { view: "campaign", id: c.id },
    })),
    // Creators have no page of their own yet, so they land on the roster.
    ...world.creators.map<PaletteItem>((c) => ({
      id: `go-${c.id}`,
      group: "Go to",
      label: c.name,
      keywords: ["creator", c.handle],
      route: { view: "roster" },
    })),
    {
      id: "go-roster",
      group: "Go to",
      label: "Roster",
      keywords: ["creators"],
      route: { view: "roster" },
    },
    {
      id: "go-activity",
      group: "Go to",
      label: ACTIVITY_LABEL,
      keywords: ["log", "history", "undo"],
      route: { view: "activity" },
    },
  ];
  return [...places, ...ACTIONS];
}

/** Every word in the query must appear in the label or keywords. Empty query matches all. */
export function filterItems(items: PaletteItem[], query: string): PaletteItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return items;
  return items.filter((item) => {
    const text = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
    return words.every((w) => text.includes(w));
  });
}

type Places = Pick<World, "accounts" | "campaigns">;

/** Breadcrumb labels for the route; a stale or broken link falls back to the portfolio. */
function placeLabels(route: Route, world: Places): string[] {
  const trail = crumbs(route, world);
  const labels = trail.map((c) => c.label);
  return trail.at(-1)?.notFound ? labels.slice(0, 1) : labels;
}

/** The current object, named for "Start a conversation about …". */
export function subjectFor(route: Route, world: Places): string {
  const labels = placeLabels(route, world);
  if (labels.length === 1) return "your portfolio";
  if (route.view === "goal" || route.view === "lineup") {
    return `the ${labels.at(-2)} ${labels.at(-1)?.toLowerCase()}`;
  }
  return labels.at(-1) ?? "this page";
}

/** Where the conversation is anchored, shown as its context line. */
export function contextLine(route: Route, world: Places): string {
  return placeLabels(route, world).join(" › ");
}
