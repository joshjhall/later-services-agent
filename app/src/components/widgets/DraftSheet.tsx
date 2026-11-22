import { Send } from "lucide-react";
import { useState } from "react";
import type { MessageDraft } from "@/agent/drafts";
import type { Proposal } from "@/agent/rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { CURRENT_USER, useStore } from "@/domain/store";
import { LaneBadge } from "./LaneBadge";

/**
 * Output class "draft" (design-system/02-ai/output-classes.md): the agent wrote
 * it, a person reviews, edits, and sends. Nothing leaves until Send; after
 * that it's a permanent entry in the activity record. Closing records nothing.
 */
export function DraftSheet({
  draft,
  answers,
  open,
  onOpenChange,
}: {
  draft: MessageDraft;
  /** The proposal this draft resolves when sent, and as which option. */
  answers?: { proposal: Proposal; optionId: string };
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { send } = useStore();
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            Draft: {draft.kind} to {draft.to}
          </SheetTitle>
          <SheetDescription>
            The agent drafted this. Edit anything; nothing goes out until you send it.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
          <div className="grid gap-1.5">
            <Label htmlFor={`${draft.id}-subject`}>Subject</Label>
            <Input
              id={`${draft.id}-subject`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`${draft.id}-body`}>Message</Label>
            <Textarea
              id={`${draft.id}-body`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-64"
            />
          </div>
        </div>
        <SheetFooter className="mt-auto border-t">
          <p className="text-xs text-muted-foreground">
            Goes out from {CURRENT_USER}'s team. A sent message can't be undone.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                send({ ...draft, subject, body }, answers);
                onOpenChange(false);
              }}
            >
              <Send /> Send
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
              Not yet
            </Button>
            <LaneBadge lane="human" className="ml-auto" />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
