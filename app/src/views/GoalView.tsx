import { CheckCircle2, FileText, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { clientEmailDraft, goalDrafts } from "@/agent/drafts";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DraftSheet } from "@/components/widgets/DraftSheet";
import { LaneBadge } from "@/components/widgets/LaneBadge";
import { useStore } from "@/domain/store";
import type { Objective } from "@/domain/types";
import { PageHeader } from "./PageHeader";

/**
 * Stating the goal (flows §2). The agent drafts from the brief; the CM edits
 * and confirms. Targets are agreed with the client, so "confirm" here means
 * "ready to send", not "final".
 */
export function GoalView({ id }: { id: string }) {
  const { world, proposals, resolved } = useStore();
  const draft = goalDrafts[id];
  const campaign = world.campaigns.find((c) => c.id === id);
  const [objective, setObjective] = useState<Objective>(draft?.objective.proposed ?? "awareness");
  const [targets, setTargets] = useState(() =>
    Object.fromEntries((draft?.kpis ?? []).map((k) => [k.metric, k.target])),
  );
  const proposal = proposals.find((p) => p.id === `goal:${id}`);
  const done = proposal && resolved[proposal.id];
  const account = world.accounts.find((a) => a.id === campaign?.accountId);
  const [drafting, setDrafting] = useState(false);

  if (!draft || !campaign || !account)
    return <PageHeader title="No goal draft for this campaign" />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Goal: ${campaign.name}`}
        description="The agent drafted this from the client brief. Edit anything, then confirm it's ready for the client."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" aria-hidden /> What the agent read
          </CardTitle>
          <CardDescription>{draft.source}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {draft.extracted.map((e) => (
              <div
                key={e.label}
                className="flex justify-between gap-3 border-b border-border/60 pb-1.5"
              >
                <dt className="text-muted-foreground">{e.label}</dt>
                <dd className="text-right font-medium">{e.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Objective</CardTitle>
            <LaneBadge lane="propose" />
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            value={objective}
            onValueChange={(v) => v && setObjective(v as Objective)}
          >
            <ToggleGroupItem
              value="awareness"
              className="data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground data-[state=on]:border-secondary-foreground/30"
            >
              Awareness
            </ToggleGroupItem>
            <ToggleGroupItem
              value="consideration"
              className="data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground data-[state=on]:border-secondary-foreground/30"
            >
              Consideration
            </ToggleGroupItem>
            <ToggleGroupItem
              value="conversion"
              className="data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground data-[state=on]:border-secondary-foreground/30"
            >
              Conversion
            </ToggleGroupItem>
          </ToggleGroup>
          <CardDescription>
            <span className="font-medium text-foreground">Why {draft.objective.proposed}:</span>{" "}
            {draft.objective.why}
            {objective !== draft.objective.proposed && (
              <span className="mt-1 block text-warning">
                You changed the objective. The agent will redraft KPIs and the lineup criteria to
                match.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI</TableHead>
                <TableHead className="w-32">Target</TableHead>
                <TableHead>Benchmark the agent used</TableHead>
                <TableHead>How it's measured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draft.kpis.map((k) => (
                <TableRow key={k.metric}>
                  <TableCell className="font-medium">{k.metric}</TableCell>
                  <TableCell>
                    <Input
                      id={`target-${k.metric}`}
                      aria-label={`${k.metric} target`}
                      value={targets[k.metric]}
                      onChange={(e) => setTargets((t) => ({ ...t, [k.metric]: e.target.value }))}
                      className="h-8 tabular-nums"
                    />
                  </TableCell>
                  <TableCell className="whitespace-normal text-sm text-muted-foreground">
                    {k.benchmark}
                  </TableCell>
                  <TableCell className="whitespace-normal text-sm text-muted-foreground">
                    {k.method}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquareText className="size-4" aria-hidden /> Questions for the client
            </CardTitle>
            <LaneBadge lane="propose" />
          </div>
          <CardDescription>
            Gaps the agent found. They go to the client with the KPI framework.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid list-decimal gap-2 pl-5 text-sm">
            {draft.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-3">
          {done ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="size-4" aria-hidden /> Ready for client · logged
            </span>
          ) : (
            <>
              <Button onClick={() => setDrafting(true)}>Confirm and draft client email</Button>
              <LaneBadge lane="human" />
              <Badge variant="outline" className="ml-auto">
                Targets are agreed with the client, not here
              </Badge>
            </>
          )}
        </CardFooter>
      </Card>
      {/* Mounted only while open, so "Not yet" drops edits and reopening redrafts from the screen. */}
      {drafting && (
        <DraftSheet
          draft={clientEmailDraft({ goal: draft, campaign, account, objective, targets })}
          answers={proposal && { proposal, optionId: "open", action: "Confirmed goal" }}
          open
          onOpenChange={setDrafting}
        />
      )}
    </div>
  );
}
