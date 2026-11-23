import { ChevronRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { proposalTab, splitToday } from "@/agent/needs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ProposalCard } from "@/components/widgets/ProposalCard";
import { DEMO_TODAY } from "@/domain/fixtures";
import { CURRENT_USER, useStore } from "@/domain/store";
import { href } from "@/router";
import { PageHeader } from "./PageHeader";

/** A collapsed group at the foot of Today: a heading with a count, opened on click. */
function Folded({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: string;
  children: ReactNode;
}) {
  return (
    <Collapsible>
      <section aria-labelledby={id} className="flex flex-col gap-3">
        <h2 id={id} className="text-sm font-semibold">
          <CollapsibleTrigger className="group flex items-center gap-1 hover:underline">
            <ChevronRight
              className="size-4 transition-transform group-data-[state=open]:rotate-90"
              aria-hidden
            />
            {title} <span className="font-normal text-muted-foreground">· {count}</span>
          </CollapsibleTrigger>
        </h2>
        <CollapsibleContent>{children}</CollapsibleContent>
      </section>
    </Collapsible>
  );
}

/**
 * The portfolio grouped by what's needed (information-architecture.md §3).
 * Grouping lives in `needOf` and `splitToday` (agent/needs.ts); rank order (flows §8) holds
 * within each group.
 */
export function TodayView() {
  const { world, proposals, resolved, activity } = useStore();
  const open = proposals.filter((p) => !resolved[p.id]);
  // Matches the copy below: only what the agent did alone, not the system or people.
  const agentCount = activity.filter((e) => e.actor === "agent" && e.at === DEMO_TODAY).length;
  // Settled = resolved before this visit (the agent's auto-run included): it goes to Handled
  // today. A card resolved here stays in its group, showing "logged", until you navigate away.
  const [settledIds] = useState(() => new Set(Object.keys(resolved)));
  const { groups, handled } = splitToday(
    proposals,
    (p) => settledIds.has(p.id) && Boolean(resolved[p.id]),
  );
  // On track = no card in a need group, so a campaign never shows twice in the queue.
  const onTrack = world.campaigns.filter(
    (c) => !groups.some((g) => g.items.some((p) => p.campaignId === c.id)),
  );
  const campaignName = (id: string) => world.campaigns.find((c) => c.id === id)?.name ?? id;
  let shown = 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Today"
        description={`${open.length} decisions need you. The agent handled ${agentCount} things on its own today.`}
      />
      {groups.map((g) => (
        <section key={g.need} aria-labelledby={`need-${g.need}`} className="flex flex-col gap-3">
          <h2 id={`need-${g.need}`} className="text-sm font-semibold">
            {g.label}{" "}
            <span className="font-normal text-muted-foreground">
              · {g.items.filter((p) => !resolved[p.id]).length}
            </span>
          </h2>
          <div className="grid items-start gap-4 xl:grid-cols-2">
            {g.items.map((p) => (
              <ProposalCard key={p.id} proposal={p} compact={shown++ > 3} />
            ))}
          </div>
        </section>
      ))}
      {handled.length > 0 && (
        <Folded id="need-handled" title="Handled today" count={String(handled.length)}>
          <ul className="flex flex-col gap-1 text-sm">
            {handled.map((p) => {
              const done = resolved[p.id];
              return (
                <li key={p.id}>
                  <span className="font-medium">{done.label}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {done.by === "agent" ? "done by the agent" : `by ${done.by ?? CURRENT_USER}`}{" "}
                    · {p.title} ·{" "}
                  </span>
                  <a
                    href={href({ view: "campaign", id: p.campaignId, tab: proposalTab(p) })}
                    className="hover:underline"
                  >
                    {campaignName(p.campaignId)}
                  </a>
                </li>
              );
            })}
          </ul>
        </Folded>
      )}
      <Folded
        id="need-on-track"
        title="On track"
        count={`${onTrack.length} ${onTrack.length === 1 ? "campaign" : "campaigns"}`}
      >
        {onTrack.length ? (
          <ul className="flex flex-col gap-1 text-sm">
            {onTrack.map((c) => (
              <li key={c.id}>
                <a href={href({ view: "campaign", id: c.id })} className="hover:underline">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            None yet: every campaign has a card above.
          </p>
        )}
      </Folded>
    </div>
  );
}
