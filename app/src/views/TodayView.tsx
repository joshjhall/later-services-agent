import { ProposalCard } from "@/components/widgets/ProposalCard";
import { useStore } from "@/domain/store";
import { PageHeader } from "./PageHeader";

/** Cross-account decision queue, ranked by consequence × time (flows §8). */
export function TodayView() {
  const { proposals, resolved, log } = useStore();
  const open = proposals.filter((p) => !resolved[p.id]);
  const handled = log.filter((l) => l.at === "2026-11-18").length;

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
