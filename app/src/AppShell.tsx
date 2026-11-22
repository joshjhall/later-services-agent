import { Building2, Inbox, ScrollText, Users } from "lucide-react";
import type { ReactNode } from "react";
import { FindOrAskPalette } from "@/components/palette/FindOrAskPalette";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/domain/store";
import { href, type Route, useRoute } from "@/router";
import { useFindOrAskShortcut } from "@/shell/FindOrAsk";
import { ShellLayout } from "@/shell/ShellLayout";
import { TopBar } from "@/shell/TopBar";
import { ThemeControls } from "@/theme/ThemeControls";
import { AccountView } from "@/views/AccountView";
import { ActivityView } from "@/views/ActivityView";
import { CampaignView } from "@/views/CampaignView";
import { GoalView } from "@/views/GoalView";
import { LineupView } from "@/views/LineupView";
import { RosterView } from "@/views/RosterView";
import { TodayView } from "@/views/TodayView";

function View({ route }: { route: Route }) {
  switch (route.view) {
    case "account":
      return <AccountView id={route.id} />;
    case "campaign":
      return <CampaignView id={route.id} />;
    case "goal":
      return <GoalView id={route.id} />;
    case "lineup":
      return <LineupView id={route.id} />;
    case "roster":
      return <RosterView />;
    case "activity":
      return <ActivityView />;
    default:
      return <TodayView />;
  }
}

/** Widgets for the right rail, chosen by context (#11). `null` hides the rail. */
function railFor(_route: Route): ReactNode {
  return null;
}

export function AppShell() {
  const route = useRoute();
  useFindOrAskShortcut();
  const { world, proposals, resolved } = useStore();
  const open = proposals.filter((p) => !resolved[p.id]);
  const openFor = (accountId: string) =>
    open.filter((p) => world.campaigns.find((c) => c.id === p.campaignId)?.accountId === accountId)
      .length;
  const activeAccount =
    route.view === "account"
      ? route.id
      : route.view === "campaign"
        ? world.campaigns.find((c) => c.id === route.id)?.accountId
        : undefined;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="px-4 py-3">
            <span className="text-sm font-semibold">Services Agent</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={route.view === "today"}>
                    <a href={href({ view: "today" })}>
                      <Inbox /> Today
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{open.length}</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Accounts</SidebarGroupLabel>
              <SidebarMenu>
                {world.accounts.map((a) => (
                  <SidebarMenuItem key={a.id}>
                    <SidebarMenuButton asChild isActive={activeAccount === a.id}>
                      <a href={href({ view: "account", id: a.id })}>
                        <Building2 /> {a.name}
                      </a>
                    </SidebarMenuButton>
                    {openFor(a.id) > 0 && <SidebarMenuBadge>{openFor(a.id)}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Creators and activity</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={route.view === "roster"}>
                    <a href={href({ view: "roster" })}>
                      <Users /> Roster
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={route.view === "activity"}>
                    <a href={href({ view: "activity" })}>
                      <ScrollText /> Activity
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="px-3 py-3">
            <ThemeControls />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <TopBar route={route} />
          <ShellLayout rail={railFor(route)}>
            <View route={route} />
          </ShellLayout>
        </SidebarInset>
      </SidebarProvider>
      <FindOrAskPalette route={route} />
      <Toaster />
    </TooltipProvider>
  );
}
