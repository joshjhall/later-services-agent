import { Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LaneBadge } from "@/components/widgets/LaneBadge";
import { useStore } from "@/domain/store";
import { PageHeader } from "./PageHeader";

/** What the agent did on its own: the audit trail that earns autonomy. */
export function LogView() {
  const { log } = useStore();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agent log"
        description="Everything the agent did without asking, and every decision you made. Undo where it's still safe."
      />
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {log.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
              <LaneBadge lane={l.action.startsWith("CM ") ? "human" : "auto"} />
              <div className="grid min-w-0 flex-1">
                <span className="text-sm font-medium">{l.action}</span>
                <span className="text-xs text-muted-foreground">
                  {l.target} · {l.at}
                </span>
              </div>
              {l.undoable && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast("Undo is simulated in the prototype.")}
                >
                  <Undo2 /> Undo
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
