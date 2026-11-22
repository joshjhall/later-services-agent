import { ChevronRight } from "lucide-react";
import { groupByNeed } from "@/agent/needs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ProposalCard } from "@/components/widgets/ProposalCard";
import { DEMO_TODAY } from "@/domain/fixtures";
import { useStore } from "@/domain/store";
import { href } from "@/router";
import { PageHeader } from "./PageHeader";

/**
 * The portfolio grouped by what's needed (information-architecture.md §3).
 * Grouping lives in `needOf` (agent/needs.ts); rank order (flows §8) holds within each group.
 */
export function TodayView() {
  const { world, proposals, resolved, activity } = useStore();
  const open = proposals.filter((p) => !resolved[p.id]);
  // Matches the copy below: only what the agent did alone, not the system or people.
  const handled = activity.filter((e) => e.actor === "agent" && e.at === DEMO_TODAY).length;
  // Resolved cards stay in their group so the "logged" confirmation is visible.
  const groups = groupByNeed(proposals);
  const onTrack = world.campaigns.filter((c) => !open.some((p) => p.campaignId === c.id));
  let shown = 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Today"
        description={`${open.length} decisions need you. The agent handled ${handled} things on its own today.`}
      />
      {groups.map((g) => (
        <section key={g.need} aria-labelledby={`need-${g.need}`} className="flex flex-col gap-3">
          <h2 id={`need-${g.need}`} className="text-sm font-semibold">
            {g.label} <span className="font-normal text-muted-foreground">· {g.items.length}</span>
          </h2>
          <div className="grid items-start gap-4 xl:grid-cols-2">
            {g.items.map((p) => (
              <ProposalCard key={p.id} proposal={p} compact={shown++ > 3} />
            ))}
          </div>
        </section>
      ))}
      <Collapsible>
        <section aria-labelledby="need-on-track" className="flex flex-col gap-3">
          <h2 id="need-on-track" className="text-sm font-semibold">
            <CollapsibleTrigger className="group flex items-center gap-1 hover:underline">
              <ChevronRight
                className="size-4 transition-transform group-data-[state=open]:rotate-90"
                aria-hidden
              />
              On track{" "}
              <span className="font-normal text-muted-foreground">
                · {onTrack.length} {onTrack.length === 1 ? "campaign" : "campaigns"}
              </span>
            </CollapsibleTrigger>
          </h2>
          <CollapsibleContent>
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
              <p className="text-sm text-muted-foreground">Every campaign needs something today.</p>
            )}
          </CollapsibleContent>
        </section>
      </Collapsible>
    </div>
  );
}
