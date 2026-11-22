import { useEffect, useState } from "react";

/**
 * Minimal hash routes, so any view can be deep-linked during the demo.
 *   #today · #account/<id> · #campaign/<id> · #goal/<id> · #lineup/<id> · #roster · #activity
 *   (#log is kept as an alias for #activity so older links still land.)
 */
export type Route =
  | { view: "today" }
  | { view: "account"; id: string }
  | { view: "campaign"; id: string }
  | { view: "goal"; id: string }
  | { view: "lineup"; id: string }
  | { view: "roster" }
  | { view: "activity" };

export function parse(hash: string): Route {
  const [view, id] = hash.replace(/^#\/?/, "").split("/");
  if (view === "account" && id) return { view, id };
  if ((view === "campaign" || view === "goal" || view === "lineup") && id) return { view, id };
  if (view === "roster" || view === "activity") return { view };
  if (view === "log") return { view: "activity" };
  return { view: "today" };
}

export const href = (r: Route) => `#${"id" in r ? `${r.view}/${r.id}` : r.view}`;

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash));
  useEffect(() => {
    const on = () => setRoute(parse(location.hash));
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return route;
}

/** One step in the top bar's breadcrumb. `to` is absent on the current page. */
export type Crumb = { label: string; to?: Route };

type Places = {
  accounts: { id: string; name: string }[];
  campaigns: { id: string; accountId: string; name: string }[];
};

/** Portfolio › account › campaign › step, derived from the route (information-architecture.md §1). */
export function crumbs(route: Route, world: Places): Crumb[] {
  const trail: Crumb[] = [{ label: "Portfolio", to: { view: "today" } }];
  const notFound = () => [...trail, { label: "Not found" }];

  if (route.view === "roster") trail.push({ label: "Roster", to: route });
  else if (route.view === "log") trail.push({ label: "Agent log", to: route });
  else if (route.view === "account") {
    const account = world.accounts.find((a) => a.id === route.id);
    if (!account) return notFound();
    trail.push({ label: account.name, to: route });
  } else if (route.view !== "today") {
    const campaign = world.campaigns.find((c) => c.id === route.id);
    const account = world.accounts.find((a) => a.id === campaign?.accountId);
    if (!campaign || !account) return notFound();
    trail.push(
      { label: account.name, to: { view: "account", id: account.id } },
      { label: campaign.name, to: { view: "campaign", id: campaign.id } },
    );
    if (route.view === "goal") trail.push({ label: "Goal", to: route });
    if (route.view === "lineup") trail.push({ label: "Lineup", to: route });
  }

  const { label } = trail[trail.length - 1];
  return [...trail.slice(0, -1), { label }];
}
