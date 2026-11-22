import { goalDrafts, lineupDrafts } from "@/agent/drafts";
import { PHASE_TAB, proposalTab } from "@/agent/needs";
import { daysBetween, fmt } from "@/agent/rules";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignWidget } from "@/components/widgets/CampaignWidget";
import { ProposalCard } from "@/components/widgets/ProposalCard";
import { DEMO_TODAY } from "@/domain/fixtures";
import { useStore } from "@/domain/store";
import { type CampaignPhase, campaignPhase, kpiPct } from "@/domain/types";
import { CAMPAIGN_TABS, type CampaignTab, href } from "@/router";
import { PageHeader } from "./PageHeader";

const TAB_PHASE: Record<CampaignTab, CampaignPhase> = { plan: "Plan", make: "Make", run: "Run" };

/**
 * Campaign detail in three tabs, Plan, Make, and Run (information-architecture.md §4),
 * opening on the campaign's current phase. Each tab carries its own proposals.
 * Plan links out to the goal and lineup flows; Make holds the creator × deliverable
 * board (framing §2, correction 1); Run holds KPI pacing.
 */
export function CampaignView({ id, tab }: { id: string; tab?: CampaignTab }) {
  const { world, proposals, resolved } = useStore();
  const c = world.campaigns.find((x) => x.id === id);
  if (!c) return <PageHeader title="Campaign not found" />;
  const account = world.accounts.find((a) => a.id === c.accountId);
  const rows = world.partnerships
    .filter((p) => p.campaignId === id)
    .map((p) => ({
      p,
      creator: world.creators.find((cr) => cr.id === p.creatorId),
      items: world.deliverables.filter((d) => d.partnershipId === p.id),
    }));

  const mine = proposals.filter((p) => p.campaignId === id);
  const inTab = (t: CampaignTab) => mine.filter((p) => proposalTab(p) === t);
  const openIn = (t: CampaignTab) => inTab(t).filter((p) => !resolved[p.id]).length;
  const cards = (t: CampaignTab) => inTab(t).map((p) => <ProposalCard key={p.id} proposal={p} />);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={c.name} description={account?.name} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Tabs
          value={tab ?? PHASE_TAB[campaignPhase(c)]}
          onValueChange={(t) => {
            location.hash = href({ view: "campaign", id, tab: t as CampaignTab });
          }}
          className="min-w-0"
        >
          <TabsList>
            {CAMPAIGN_TABS.map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                aria-label={openIn(t) ? `${TAB_PHASE[t]}, ${openIn(t)} open` : TAB_PHASE[t]}
              >
                {TAB_PHASE[t]}
                {openIn(t) > 0 && (
                  <Badge variant="secondary" aria-hidden>
                    {openIn(t)}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="plan" className="flex flex-col gap-4">
            {cards("plan")}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plan</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {goalDrafts[id] && (
                  <a href={href({ view: "goal", id })} className="font-medium hover:underline">
                    Goal and KPIs →
                  </a>
                )}
                {lineupDrafts[id] && (
                  <a href={href({ view: "lineup", id })} className="font-medium hover:underline">
                    Lineup →
                  </a>
                )}
                {!goalDrafts[id] && !lineupDrafts[id] && (
                  <p>
                    {campaignPhase(c) === "Plan"
                      ? "No goal or lineup draft to review yet."
                      : "The goal and lineup were settled before this campaign moved on."}
                  </p>
                )}
                <p className="text-muted-foreground capitalize">
                  {c.objective} · {c.kpis.map((k) => k.metric).join(", ") || "No KPIs yet"}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="make" className="flex flex-col gap-4">
            {cards("make")}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Creators and deliverables</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Creator</TableHead>
                      <TableHead>Deliverable</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Draft due</TableHead>
                      <TableHead>Go-live</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.flatMap(({ p, creator, items }) =>
                      (items.length ? items : [null]).map((d) => (
                        <TableRow key={`${p.id}-${d?.id ?? "none"}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="size-7">
                                <AvatarFallback>{creator?.name.slice(0, 1)}</AvatarFallback>
                              </Avatar>
                              <div className="grid">
                                <span className="font-medium">{creator?.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {creator?.handle}
                                </span>
                              </div>
                              {p.status === "backup" && <Badge variant="outline">Backup</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>{d?.kind ?? "—"}</TableCell>
                          <TableCell>
                            {d ? <Badge variant="secondary">{d.stage}</Badge> : "—"}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {d ? `${d.draftDue} (${daysBetween(DEMO_TODAY, d.draftDue)}d)` : "—"}
                          </TableCell>
                          <TableCell className="tabular-nums">{d?.goLive ?? "—"}</TableCell>
                        </TableRow>
                      )),
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="run" className="flex flex-col gap-4">
            {cards("run")}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pacing against targets</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {c.kpis.length ? (
                  c.kpis.map((k) => (
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
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No results yet. Pacing shows here once the first post is live.
                  </p>
                )}
                <p className="text-xs text-muted-foreground tabular-nums">
                  Amplification reserve {fmt(c.reserve, "$")}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <CampaignWidget campaign={c} />
      </div>
    </div>
  );
}
