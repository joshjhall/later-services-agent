import { daysBetween } from "@/agent/rules";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CampaignWidget } from "@/components/widgets/CampaignWidget";
import { ProposalCard } from "@/components/widgets/ProposalCard";
import { DEMO_TODAY } from "@/domain/fixtures";
import { useStore } from "@/domain/store";
import { PageHeader } from "./PageHeader";

/**
 * Campaign detail: the creator × deliverable board (framing §2, correction 1)
 * plus this campaign's open proposals. Goal and lineup flows hang off here.
 */
export function CampaignView({ id }: { id: string }) {
  const { world, proposals } = useStore();
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={c.name} description={account?.name} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          {proposals
            .filter((p) => p.campaignId === id)
            .map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
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
        </div>
        <CampaignWidget campaign={c} />
      </div>
    </div>
  );
}
