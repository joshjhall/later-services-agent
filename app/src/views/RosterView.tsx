import { fmt } from "@/agent/rules";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/domain/store";
import { cn } from "@/lib/utils";
import { PageHeader } from "./PageHeader";

/** Creator-centric secondary view: the bench, with agent-maintained reliability. */
export function RosterView() {
  const { world } = useStore();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roster"
        description="Creators the pod knows and trusts. Reliability is updated by the agent as it works."
      />
      <Card>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead className="text-right">Followers</TableHead>
                <TableHead className="text-right">On time</TableHead>
                <TableHead className="text-right">Revisions</TableHead>
                <TableHead className="text-right">Reply</TableHead>
                <TableHead className="text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {world.creators.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="grid">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.handle} · {c.platform} · {c.tier}
                        {c.representedBy && ` · via ${c.representedBy}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-64 whitespace-normal text-sm">
                    {c.audience}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.verticals.map((v) => (
                        <Badge key={v} variant="outline">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(c.followers)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      c.onTimeRate < 0.85 && "text-destructive",
                    )}
                  >
                    {Math.round(c.onTimeRate * 100)}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {c.avgRevisions.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{c.responsiveHours}h</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(c.rate, "$")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
