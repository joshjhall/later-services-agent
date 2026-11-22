import { ProposalCard } from "@/components/widgets/ProposalCard";
import { DEMO_TODAY } from "@/domain/fixtures";
import { useStore } from "@/domain/store";
import { PageHeader } from "./PageHeader";

/** Cross-account decision queue, ranked by consequence × time (flows §8). */
export function TodayView() {
  const { proposals, resolved, activity } = useStore();
  const open = proposals.filter((p) => !resolved[p.id]);
  // Matches the copy below: only what the agent did alone, not the system or people.
  const handled = activity.filter((e) => e.actor === "agent" && e.at === DEMO_TODAY).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Today"
        description={`${open.length} decisions need you. The agent handled ${handled} things on its own today.`}
      />
      <div className="grid items-start gap-4 xl:grid-cols-2">
        {proposals.map((p, i) => (
          <ProposalCard key={p.id} proposal={p} compact={i > 3} />
        ))}
      </div>
    </div>
  );
}
