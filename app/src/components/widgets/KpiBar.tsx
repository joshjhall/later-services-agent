import { fmt } from "@/agent/rules";
import { Progress } from "@/components/ui/progress";
import { type Kpi, kpiPct } from "@/domain/types";

/**
 * One KPI's pacing: the metric, "actual / target", and a progress bar. Owns the bar's
 * accessible wiring so every view reads the same: named by the metric, valued "actual of target".
 */
export function KpiBar({ kpi: k }: { kpi: Kpi }) {
  return (
    <div className="grid gap-1.5">
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
  );
}
