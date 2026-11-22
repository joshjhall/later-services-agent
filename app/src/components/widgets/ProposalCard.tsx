import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { draftFor } from "@/agent/drafts";
import type { Proposal } from "@/agent/rules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@/domain/store";
import { cn } from "@/lib/utils";
import { href } from "@/router";
import { CallPrepSheet } from "./CallPrepSheet";
import { DraftSheet } from "./DraftSheet";
import { LaneBadge } from "./LaneBadge";

const SEVERITY = {
  critical: { label: "Needs you now", cls: "bg-destructive text-destructive-foreground" },
  warning: { label: "Soon", cls: "bg-warning-container text-on-warning-container" },
  info: { label: "When ready", cls: "bg-info-container text-on-info-container" },
} as const;

/** Every card names its output class (design-system/02-ai/output-classes.md). */
const outputClass = (p: Proposal) =>
  p.kind === "info-request" ? "Information request" : "Proposal";

const TONE = { good: "text-success", bad: "text-destructive", neutral: "text-foreground" } as const;

/**
 * The core widget pattern: what the agent proposes, the evidence per
 * criterion (not a single score), its confidence, and actions tagged with
 * who will carry them out. Resolving is idempotent and recorded.
 */
export function ProposalCard({ proposal: p, compact }: { proposal: Proposal; compact?: boolean }) {
  const { resolve, resolved, world } = useStore();
  const done = resolved[p.id];
  const campaign = world.campaigns.find((c) => c.id === p.campaignId);
  const account = world.accounts.find((a) => a.id === campaign?.accountId);
  const sev = SEVERITY[p.severity];
  const [calling, setCalling] = useState(false);
  const [drafting, setDrafting] = useState<string | null>(null);
  const draft = drafting ? draftFor(p.id, drafting) : undefined;

  // Some options open a working view or a draft instead of resolving in place.
  const act = (optionId: string) => {
    if (draftFor(p.id, optionId)) {
      setDrafting(optionId);
      return;
    }
    if (optionId === "call") {
      setCalling(true);
      return;
    }
    const opensView =
      optionId === "open" && (p.kind === "state-goal" || p.kind === "approve-lineup");
    if (opensView) {
      location.hash = href({ view: p.kind === "state-goal" ? "goal" : "lineup", id: p.campaignId });
      return;
    }
    resolve(p, optionId);
  };

  return (
    <Card className={cn("gap-4", done && "opacity-70")} data-severity={p.severity}>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={sev.cls}>{sev.label}</Badge>
          <span className="text-xs font-medium text-muted-foreground">{outputClass(p)}</span>
          <span className="text-xs text-muted-foreground">
            {account?.name} · {campaign?.name}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">Confidence: {p.confidence}</span>
        </div>
        <CardTitle className="text-base">{p.title}</CardTitle>
        <CardDescription>{p.summary}</CardDescription>
      </CardHeader>

      {p.assumption && (
        <CardContent>
          <dl className="grid gap-y-2 text-sm">
            <div className="grid gap-0.5 border-b border-border/60 pb-1.5">
              <dt className="text-muted-foreground">Assumed</dt>
              <dd className="font-medium">{p.assumption}</dd>
            </div>
            <div className="grid gap-0.5 border-b border-border/60 pb-1.5">
              <dt className="text-muted-foreground">If wrong</dt>
              <dd className="font-medium">{p.ifWrong}</dd>
            </div>
          </dl>
        </CardContent>
      )}

      {!compact && (
        <CardContent>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {p.evidence.map((e) => (
              <div
                key={e.label}
                className="flex justify-between gap-3 border-b border-border/60 pb-1.5"
              >
                <dt className="text-muted-foreground">{e.label}</dt>
                <dd className={cn("text-right font-medium", TONE[e.tone ?? "neutral"])}>
                  {e.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      )}

      <CardFooter className="flex flex-wrap items-center gap-2">
        {done ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="size-4" aria-hidden /> {done.label} · logged
          </span>
        ) : (
          p.options.map((o) => (
            <div key={o.id} className="flex flex-col items-start gap-1">
              <Button
                size="sm"
                variant={o.primary ? "default" : "outline"}
                onClick={() => act(o.id)}
              >
                {o.label}
              </Button>
              <LaneBadge lane={o.lane} className="text-[10px]" />
            </div>
          ))
        )}
      </CardFooter>
      {p.kind === "quiet-creator" && (
        <CallPrepSheet proposal={p} open={calling} onOpenChange={setCalling} />
      )}
      {draft && drafting && (
        <DraftSheet
          key={draft.id}
          draft={draft}
          answers={{ proposal: p, optionId: drafting }}
          open
          onOpenChange={(o) => !o && setDrafting(null)}
        />
      )}
    </Card>
  );
}
