import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

const MODES = [
  { mode: "light", icon: Sun, label: "Light" },
  { mode: "system", icon: Monitor, label: "System" },
  { mode: "dark", icon: Moon, label: "Dark" },
] as const;

/** Seed picker + light/system/dark switch. For exploring palettes live. */
export function ThemeControls() {
  const { seed, setSeed, mode, setMode } = useTheme();
  return (
    <div className="flex items-center gap-1">
      <label
        className="relative size-8 cursor-pointer overflow-hidden rounded-full border"
        title={`Seed ${seed}`}
      >
        <span className="sr-only">Theme seed color</span>
        <span className="absolute inset-0" style={{ background: seed }} />
        <input
          id="theme-seed"
          type="color"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      {MODES.map(({ mode: m, icon: Icon, label }) => (
        <Button
          key={m}
          size="icon"
          variant={mode === m ? "secondary" : "ghost"}
          aria-label={label}
          aria-pressed={mode === m}
          onClick={() => setMode(m)}
        >
          <Icon />
        </Button>
      ))}
    </div>
  );
}
