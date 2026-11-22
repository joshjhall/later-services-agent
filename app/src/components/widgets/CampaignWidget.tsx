import { fmt } from "@/agent/rules";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/domain/store";
import { type Campaign, campaignPhase, kpiPct } from "@/domain/types";
import { href } from "@/router";

/** Secondary text after the phase, e.g. "Plan · reviewing lineup". */
const STAGE: Record<Campaign["stage"], string> = {
  goal: "stating the goal",
  lineup: "reviewing lineup",
  production: "in production",
  live: "live",
  wrap: "wrapping up",
};

/**
 * One widget, many states: the same campaign card shows what the campaign
 * needs right now (its top open proposal), then KPI pacing and budget.
 */
export function CampaignWidget({ campaign: c }: { campaign: Campaign }) {
  const { proposals, resolved } = useStore();
  const open = proposals.filter((p) => p.campaignId === c.id && !resolved[p.id]);
  const top = open[0];

  return (
    <Card className="gap-4">
      <CardHeader className="gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            <a href={href({ view: "campaign", id: c.id })} className="hover:underline">
              {c.name}
            </a>
          </CardTitle>
          <Badge variant="secondary">
            {campaignPhase(c)} <span className="opacity-70">· {STAGE[c.stage]}</span>
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground capitalize">
          {c.objective} · {c.start} → {c.end}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {top ? (
          <a
            href={href({ view: "campaign", id: c.id })}
            className="rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground hover:brightness-95"
          >
            <span className="font-medium">Needs you:</span> {top.title}
            {open.length > 1 && <span className="opacity-75"> · +{open.length - 1} more</span>}
          </a>
        ) : (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Nothing needs you. The agent is handling it.
          </p>
        )}
        {c.kpis.map((k) => (
          <div key={k.metric} className="grid gap-1.5">
            <div className="flex justify-between text-sm">
              <span>{k.metric}</span>
              <span className="tabular-nums text-muted-foreground">
                {fmt(k.actual, k.unit)} / {fmt(k.target, k.unit)}
              </span>
            </div>
            <Progress
              value={kpiPct(k)}
              aria-label={k.metric}
              getValueLabel={() => `${fmt(k.actual, k.unit)} of ${fmt(k.target, k.unit)}`}
            />
          </div>
        ))}
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>
            Committed {fmt(c.committed, "$")} of {fmt(c.budget, "$")}
          </span>
          <span>Reserve {fmt(c.reserve, "$")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
