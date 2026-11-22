import { groupByNeed, type Need } from "@/agent/needs";
import type { Proposal } from "@/agent/rules";

const listFormat = new Intl.ListFormat("en-US", { type: "conjunction" });

/** How each non-urgent need reads after a count, e.g. "2 ready to move". */
const REST: Record<Exclude<Need, "now">, string> = {
  ready: "ready to move",
  waiting: "waiting on someone",
  todo: "to do later",
};

const items = (n: number) => `${n} open item${n === 1 ? "" : "s"}`;

/**
 * Output class "summary in context" (design-system/02-ai/output-classes.md): what
 * needs attention here and why, in a few sentences. Deterministic stand-in for a
 * model-written summary; it only reorganizes proposals that already exist.
 */
export function summarize(open: Pick<Proposal, "kind" | "severity" | "title">[]): string {
  if (open.length === 0) return "Nothing needs you here. The agent is handling it.";

  const groups = groupByNeed(open);
  const first = `Start with “${groups[0].items[0].title}”.`;
  const counts = groups
    .filter((g): g is typeof g & { need: keyof typeof REST } => g.need !== "now")
    .map((g) => `${g.items.length} ${REST[g.need]}`);
  const now = groups.find((g) => g.need === "now")?.items.length ?? 0;

  if (now === 0)
    return `Nothing urgent in ${items(open.length)}: ${listFormat.format(counts)}. ${first}`;
  const lead =
    now === open.length
      ? open.length === 1
        ? "The one open item needs you now."
        : `All ${items(open.length)} need you now.`
      : `${now} of ${items(open.length)} need${now === 1 ? "s" : ""} you now.`;
  const rest = counts.length ? ` The rest: ${listFormat.format(counts)}.` : "";
  return `${lead} ${first}${rest}`;
}
