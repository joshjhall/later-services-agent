import { Pencil, Send } from "lucide-react";
import { type ComponentType, useState } from "react";
import { fmt } from "@/agent/rules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ActorChip } from "@/components/widgets/ActorChip";
import { DraftSheet } from "@/components/widgets/DraftSheet";
import { useStore } from "@/domain/store";
import type { Benchmark, Comparison } from "@/domain/types";
import { href } from "@/router";
import { activityIn, openIn, pendingIn } from "./scope";
import type { WidgetId } from "./select";
import { firstOf, summarize } from "./summary";

/** Every widget gets the same input: the campaigns in view. It fetches and shapes its own data. */
export interface WidgetProps {
  scope: string[];
}

/**
 * The widget contract (design-system/03-pattern/widget-rail.md): a title, the data
 * it accepts, and a component that handles its own space, volume, and empty state.
 */
export interface WidgetSpec {
  title: string;
  accepts: string[];
  Widget: ComponentType<WidgetProps>;
}

function Empty({ children }: { children: string }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function SummaryWidget({ scope }: WidgetProps) {
  const { proposals, resolved } = useStore();
  const open = openIn(proposals, resolved, scope);
  const first = firstOf(open);
  return (
    <div className="grid gap-2">
      <p className="text-sm">{summarize(open)}</p>
      {first && (
        <a
          href={href({ view: "campaign", id: first.campaignId })}
          className="text-sm font-medium text-primary hover:underline"
        >
          Go to it
        </a>
      )}
    </div>
  );
}

const ACTIVITY_LIMIT = 3;

function ActivityWidget({ scope }: WidgetProps) {
  const { activity, world } = useStore();
  const recent = activityIn(activity, world.campaigns, scope).slice(0, ACTIVITY_LIMIT);
  if (recent.length === 0) return <Empty>No activity here yet.</Empty>;
  return (
    <ul className="grid gap-3">
      {recent.map((e) => (
        <li key={e.id} className="grid gap-1 text-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ActorChip actor={e.actor} /> {e.at}
          </div>
          <span>{e.action}</span>
        </li>
      ))}
      <li>
        <a href={href({ view: "activity" })} className="text-xs text-primary hover:underline">
          All activity
        </a>
      </li>
    </ul>
  );
}

function NextMessageWidget({ scope }: WidgetProps) {
  const { send, sent, world } = useStore();
  const [editing, setEditing] = useState(false);
  const next = pendingIn(world.scheduledMessages, scope, sent)[0];
  if (!next) return <Empty>Nothing scheduled.</Empty>;
  return (
    <div className="grid gap-2 text-sm">
      <p className="text-xs text-muted-foreground">
        {next.sendAt} · {next.kind} to {next.to}
      </p>
      <p className="font-medium">{next.subject}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          <Pencil /> Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => send(next)}>
          <Send /> Send now
        </Button>
      </div>
      <DraftSheet key={next.id} draft={next} open={editing} onOpenChange={setEditing} />
    </div>
  );
}

/** One row: a label and a bar scaled to the largest value shown. */
function Bar({
  label,
  value,
  max,
  unit,
  mark,
}: {
  label: string;
  value: number;
  max: number;
  unit?: Benchmark["unit"];
  mark?: boolean;
}) {
  return (
    <li className="grid gap-1" aria-current={mark ? "true" : undefined}>
      <div className="flex justify-between gap-2 text-xs">
        <span className={mark ? "font-semibold" : "text-muted-foreground"}>
          {label}
          {mark && " (this one)"}
        </span>
        <span className="tabular-nums">{fmt(value, unit)}</span>
      </div>
      <Progress value={max > 0 ? (value / max) * 100 : 0} />
    </li>
  );
}

/**
 * One widget, any amount of data (appendix A10): 0 comparables falls back to the
 * category benchmark, 1 shows side by side, more shows a ranked list with this one marked.
 */
export function CompareView({
  name,
  comparison,
  benchmark,
}: {
  name: string;
  comparison?: Comparison;
  benchmark?: Benchmark;
}) {
  const peers = comparison?.peers ?? [];
  if (!comparison || peers.length === 0)
    return (
      <div className="grid gap-2" data-layout="none">
        <Empty>No comparable campaigns yet.</Empty>
        {benchmark && (
          <p className="text-sm">
            Category benchmark: {benchmark.metric} {fmt(benchmark.value, benchmark.unit)}.
          </p>
        )}
      </div>
    );

  const { metric, unit, value } = comparison;
  const rows = [...peers, { name, value, mark: true }].sort((a, b) => b.value - a.value);
  const max = rows[0].value;
  const rank = rows.findIndex((r) => "mark" in r) + 1;

  if (peers.length === 1)
    return (
      <div className="grid gap-2" data-layout="pair">
        <p className="text-xs text-muted-foreground">{metric}, side by side</p>
        <ul className="grid gap-2">
          <Bar label={name} value={value} max={max} unit={unit} mark />
          <Bar label={peers[0].name} value={peers[0].value} max={max} unit={unit} />
        </ul>
      </div>
    );

  return (
    <div className="grid gap-2" data-layout="ranked">
      <p className="text-xs text-muted-foreground">
        {metric}: {rank} of {rows.length} similar campaigns
      </p>
      <ol className="grid gap-2">
        {rows.map((r) => (
          <Bar
            key={r.name}
            label={r.name}
            value={r.value}
            max={max}
            unit={unit}
            mark={"mark" in r}
          />
        ))}
      </ol>
    </div>
  );
}

function CompareWidget({ scope }: WidgetProps) {
  const { world } = useStore();
  const campaign = world.campaigns.find((c) => c.id === scope[0]);
  if (scope.length !== 1 || !campaign) return <Empty>Open a campaign to compare it.</Empty>;
  const industry = world.accounts.find((a) => a.id === campaign.accountId)?.industry ?? "";
  return (
    <CompareView
      name={campaign.name}
      comparison={world.comparisons.find((c) => c.campaignId === campaign.id)}
      benchmark={world.benchmarks[industry]}
    />
  );
}

/** The fixed library. `selectRail` picks from these ids; nothing outside it can appear. */
export const WIDGETS: Record<WidgetId, WidgetSpec> = {
  summary: { title: "Summary", accepts: ["open proposals"], Widget: SummaryWidget },
  activity: { title: "Recent activity", accepts: ["activity record"], Widget: ActivityWidget },
  "next-message": {
    title: "Next scheduled message",
    accepts: ["scheduled messages"],
    Widget: NextMessageWidget,
  },
  compare: {
    title: "Compare to similar campaigns",
    accepts: ["one campaign", "comparable campaigns", "category benchmark"],
    Widget: CompareWidget,
  },
};

/** A widget in its card. The rail's only layout. */
export function WidgetCard({ id, scope }: { id: WidgetId; scope: string[] }) {
  const { title, Widget } = WIDGETS[id];
  return (
    <Card size="sm" className="gap-3" data-widget={id}>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Widget scope={scope} />
      </CardContent>
    </Card>
  );
}
