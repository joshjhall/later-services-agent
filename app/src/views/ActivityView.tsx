import { Lock, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ActorChip } from "@/components/widgets/ActorChip";
import { useStore } from "@/domain/store";
import { type ActivityEntry, isUndoable } from "@/domain/types";
import { PageHeader } from "./PageHeader";

/** How a permanent entry is marked: it left the system, so a correction is a new action. */
const permanentLabel = (e: ActivityEntry) => (e.effect === "spend" ? "Spent" : "Sent");

/** One record, any actor (principles §2): the history the whole pod reads. */
export function ActivityView() {
  const { activity } = useStore();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Activity"
        description="One history for the whole pod: the system, the agent, and every person. Undo where it's still safe."
      />
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {activity.map((e) => (
            <div
              key={e.id}
              data-testid="activity-entry"
              className="flex flex-wrap items-center gap-3 px-6 py-3"
            >
              <ActorChip actor={e.actor} />
              <div className="grid min-w-0 flex-1">
                <span className="text-sm font-medium">{e.action}</span>
                <span className="text-xs text-muted-foreground">
                  {e.target} · {e.at}
                </span>
              </div>
              {isUndoable(e) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast("Undo is simulated in the prototype.")}
                >
                  <Undo2 /> Undo
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 text-xs text-muted-foreground">
                  <Lock className="size-3" aria-hidden />
                  <span className="sr-only">Permanent: </span>
                  {permanentLabel(e)}
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
