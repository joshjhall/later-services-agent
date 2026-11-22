import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type Fit, type LineupCandidate, lineupDrafts } from "@/agent/drafts";
import { fmt } from "@/agent/rules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LaneBadge } from "@/components/widgets/LaneBadge";
import { useStore } from "@/domain/store";
import { cn } from "@/lib/utils";
import { PageHeader } from "./PageHeader";

export type Pick = "core" | "backup" | "out";

/** Totals for the lineup summary; `over` gates internal approval. */
export function lineupTotals(
  candidates: LineupCandidate[],
  picks: Record<string, Pick>,
  feeBudget: number,
) {
  const core = candidates.filter((c) => picks[c.handle] === "core");
  const fees = core.reduce((s, c) => s + c.fee, 0);
  return {
    count: core.length,
    fees,
    backups: Object.values(picks).filter((p) => p === "backup").length,
    over: fees > feeBudget,
    /** Lineup members with open details. Shown, never a gate. */
    open: core.filter((c) => c.missing?.length).length,
  };
}

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

const FIT: Record<Fit, { label: string; cls: string }> = {
  met: { label: "Met", cls: "bg-success-container text-on-success-container" },
  partly: { label: "Partly", cls: "bg-warning-container text-on-warning-container" },
  not: {
    label: "Not met",
    cls: "bg-[var(--md-error-container)] text-[var(--md-on-error-container)]",
  },
};

/**
 * Reviewing the proposed lineup (flows §4). Evidence per criterion, flags up
 * front, and an internal gate before anything reaches the client.
 */
export function LineupView({ id }: { id: string }) {
  const { world, proposals, resolve, resolved } = useStore();
  const draft = lineupDrafts[id];
  const campaign = world.campaigns.find((c) => c.id === id);
  const [picks, setPicks] = useState<Record<string, Pick>>(() =>
    Object.fromEntries(
      (draft?.candidates ?? []).map((c) => [
        c.handle,
        c.criteria.some((k) => k.fit === "not") ? "out" : c.role,
      ]),
    ),
  );
  const proposal = proposals.find((p) => p.id === `lineup:${id}`);
  const done = proposal && resolved[proposal.id];

  const totals = useMemo(
    () => lineupTotals(draft?.candidates ?? [], picks, draft?.budget.creatorFees ?? 0),
    [draft, picks],
  );

  if (!draft || !campaign) return <PageHeader title="No proposed lineup for this campaign" />;
  const { over } = totals;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Lineup: ${campaign.name}`}
        description="The agent searched the roster first, then the wider index, against the criteria you approved."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          {draft.candidates.map((c) => {
            const pick = picks[c.handle];
            return (
              <Card key={c.handle} className={cn("gap-3", pick === "out" && "opacity-60")}>
                <CardHeader className="gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{c.creatorName}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {c.handle} · {c.platform} · {c.tier}
                    </span>
                    {c.fromRoster ? (
                      <Badge variant="secondary">On roster</Badge>
                    ) : (
                      <Badge variant="outline">New to us</Badge>
                    )}
                    {c.missing?.length ? (
                      <Badge className="bg-warning-container text-on-warning-container">
                        Needs: {listFormat.format(c.missing)}
                      </Badge>
                    ) : null}
                    <span className="ml-auto text-sm tabular-nums text-muted-foreground">
                      {fmt(c.fee, "$")} · reach ~{c.forecastReach}
                    </span>
                  </div>
                  {c.flag && (
                    <p className="flex items-start gap-1.5 rounded-md bg-warning-container px-2.5 py-1.5 text-sm text-on-warning-container">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {c.flag}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                    {c.criteria.map((k) => (
                      <div key={k.label} className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-0.5 inline-flex w-16 shrink-0 justify-center rounded px-1.5 py-0.5 text-xs font-medium",
                            FIT[k.fit].cls,
                          )}
                        >
                          {FIT[k.fit].label}
                        </span>
                        <div className="grid">
                          <dt className="font-medium">{k.label}</dt>
                          <dd className="text-muted-foreground">{k.note}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    value={pick}
                    disabled={!!done}
                    onValueChange={(v) => v && setPicks((p) => ({ ...p, [c.handle]: v as Pick }))}
                    aria-label={`Role for ${c.creatorName}`}
                  >
                    <ToggleGroupItem
                      value="core"
                      className="data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground data-[state=on]:border-secondary-foreground/30"
                    >
                      In lineup
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="backup"
                      className="data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground data-[state=on]:border-secondary-foreground/30"
                    >
                      Backup
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="out"
                      className="data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground data-[state=on]:border-secondary-foreground/30"
                    >
                      Remove
                    </ToggleGroupItem>
                  </ToggleGroup>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="gap-4 xl:sticky xl:top-4">
          <CardHeader>
            <CardTitle className="text-base">Your lineup</CardTitle>
            <CardDescription>Approved criteria: {draft.criteria.join(" · ")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span>Creators</span>
              <span className="tabular-nums">
                {totals.count} + {totals.backups} backup
              </span>
            </div>
            <div className="flex justify-between">
              <span>Creator fees</span>
              <span className={cn("tabular-nums", over && "font-medium text-destructive")}>
                {fmt(totals.fees, "$")} / {fmt(draft.budget.creatorFees, "$")}
              </span>
            </div>
            {totals.open > 0 && (
              <div className="flex justify-between">
                <span>Open items</span>
                <span>
                  {totals.open} {totals.open === 1 ? "member still needs" : "members still need"}{" "}
                  details
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Amplification reserve</span>
              <span className="tabular-nums">{fmt(draft.budget.reserve, "$")}</span>
            </div>
            <div className="flex justify-between">
              <span>Agent forecast</span>
              <span>{draft.forecast}</span>
            </div>
            {done ? (
              <span className="inline-flex items-center gap-1.5 text-success">
                <CheckCircle2 className="size-4" aria-hidden /> Internal gate passed · logged
              </span>
            ) : (
              <div className="flex flex-col items-start gap-1.5 pt-2">
                <Button
                  disabled={over}
                  onClick={() => {
                    if (proposal) resolve(proposal, "open");
                    toast(
                      "Lineup approved internally. The agent is drafting the client deck for your review.",
                    );
                  }}
                >
                  <ShieldCheck /> Approve lineup
                </Button>
                <LaneBadge lane="human" />
                <p className="text-xs text-muted-foreground">
                  {over
                    ? "Over the creator-fee budget. Remove or swap someone first."
                    : "Nothing goes to the client until you present it."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
