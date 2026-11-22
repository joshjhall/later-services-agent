import { Phone } from "lucide-react";
import type { Proposal } from "@/agent/rules";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useStore } from "@/domain/store";
import { LaneBadge } from "./LaneBadge";

/**
 * The hard moment's human step: the agent can't make the call, but it can
 * make the call take two minutes. Opens from "Call <name>" on a quiet-creator
 * proposal; the outcome buttons resolve that proposal.
 */
export function CallPrepSheet({
  proposal: p,
  open,
  onOpenChange,
}: {
  proposal: Proposal;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { resolve } = useStore();
  const first = p.title.split(" ")[0];
  // Reuse the card's own labels so the same action reads the same everywhere.
  const swap = p.options.find((o) => o.id === "swap");
  const finish = (optionId: string) => {
    resolve(p, optionId);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Call brief: {first}</SheetTitle>
          <SheetDescription>{p.summary}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-4 pb-4 text-sm">
          <section className="grid gap-2">
            <h3 className="font-medium">What the agent knows</h3>
            <dl className="grid gap-1.5">
              {p.evidence.map((e) => (
                <div key={e.label} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{e.label}</dt>
                  <dd className="text-right font-medium">{e.value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-muted-foreground">
              Last contact Nov 11: {first} confirmed the brief and asked about the product shipment,
              which arrived Nov 13.
            </p>
          </section>
          <Separator />
          <section className="grid gap-2">
            <h3 className="font-medium">Ask</h3>
            <ol className="grid list-decimal gap-1.5 pl-5">
              <li>Is everything okay? (Lead with this; she's usually on time.)</li>
              <li>Can she deliver a draft by Friday, Nov 20?</li>
              <li>Anything blocking: product, brief, payment?</li>
            </ol>
          </section>
          <section className="grid gap-2">
            <h3 className="font-medium">If she says…</h3>
            <ul className="grid gap-1.5">
              <li>
                <span className="font-medium">“Friday works”</span>: extend 2 days. Go-live holds;
                the agent reschedules the workback.
              </li>
              <li>
                <span className="font-medium">“Next week”</span>: go-live slips past Nov 24. Swap to
                the backup, or move her to wave 2.
              </li>
              <li>
                <span className="font-medium">No answer</span>: leave a voicemail. The agent
                prepares the swap so it's one click this afternoon.
              </li>
            </ul>
          </section>
        </div>
        <SheetFooter className="mt-auto border-t">
          <p className="text-xs text-muted-foreground">How did it go?</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => finish("extend")}>
              <Phone /> She'll deliver Friday
            </Button>
            {swap && (
              <Button size="sm" variant="outline" onClick={() => finish("swap")}>
                {swap.label}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
              No answer yet
            </Button>
          </div>
          <LaneBadge lane="human" />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
