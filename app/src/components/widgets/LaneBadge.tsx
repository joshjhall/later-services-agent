import { Bot, Handshake, User } from "lucide-react";
import type { Lane } from "@/agent/rules";
import { cn } from "@/lib/utils";

const LANES = {
  auto: { icon: Bot, label: "Agent acts", cls: "bg-success-container text-on-success-container" },
  propose: { icon: Handshake, label: "Agent proposes", cls: "bg-accent text-accent-foreground" },
  human: {
    icon: User,
    label: "You decide",
    cls: "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border",
  },
} as const;

/** Who acts: the autonomy split from framing §5, shown on every action. */
export function LaneBadge({ lane, className }: { lane: Lane; className?: string }) {
  const { icon: Icon, label, cls } = LANES[lane];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        cls,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {label}
    </span>
  );
}
