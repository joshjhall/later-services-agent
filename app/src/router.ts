import { useEffect, useState } from "react";

/**
 * Minimal hash routes, so any view can be deep-linked during the demo.
 *   #today · #account/<id> · #campaign/<id> · #goal/<id> · #lineup/<id> · #roster · #log
 */
export type Route =
  | { view: "today" }
  | { view: "account"; id: string }
  | { view: "campaign"; id: string }
  | { view: "goal"; id: string }
  | { view: "lineup"; id: string }
  | { view: "roster" }
  | { view: "log" };

export function parse(hash: string): Route {
  const [view, id] = hash.replace(/^#\/?/, "").split("/");
  if (view === "account" && id) return { view, id };
  if ((view === "campaign" || view === "goal" || view === "lineup") && id) return { view, id };
  if (view === "roster" || view === "log") return { view };
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
