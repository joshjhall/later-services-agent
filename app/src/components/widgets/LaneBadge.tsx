import { Bot, Handshake, User } from "lucide-react";
import type { Lane } from "@/agent/rules";
import { cn } from "@/lib/utils";

const LANES = {
  auto: { icon: Bot, label: "Automatic", cls: "bg-success-container text-on-success-container" },
  propose: { icon: Handshake, label: "Needs approval", cls: "bg-accent text-accent-foreground" },
  human: {
    icon: User,
    label: "A person only",
    cls: "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border",
  },
} as const;

/**
 * Who acts: the autonomy split from framing §5, shown on every action. `label` overrides
 * the lane's wording for one use (an auto-lane option the agent left for the CM reads
 * "Pre-approved"); the lane's icon and colour stay.
 */
export function LaneBadge({
  lane,
  label: override,
  className,
}: {
  lane: Lane;
  label?: string;
  className?: string;
}) {
  const { icon: Icon, label: laneLabel, cls } = LANES[lane];
  const label = override ?? laneLabel;
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
