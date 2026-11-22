import { Bot, Cog, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Actor } from "@/domain/types";
import { cn } from "@/lib/utils";

/** Who wrote an activity entry: `system`, `agent`, or a person's name. Never inferred from text. */
export function ActorChip({ actor, className }: { actor: Actor; className?: string }) {
  if (actor === "system")
    return (
      <Badge variant="outline" className={className}>
        <Cog aria-hidden /> system
      </Badge>
    );
  if (actor === "agent")
    return (
      <Badge className={cn("bg-success-container text-on-success-container", className)}>
        <Bot aria-hidden /> agent
      </Badge>
    );
  return (
    <Badge variant="secondary" className={className}>
      <User aria-hidden /> {actor}
    </Badge>
  );
}
