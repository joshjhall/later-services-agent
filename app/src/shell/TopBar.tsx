import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useStore } from "@/domain/store";
import { crumbs, href, type Route } from "@/router";
import { FindOrAskButton } from "./FindOrAsk";

/** Where am I (breadcrumb), and how do I get somewhere else (Find or ask). */
export function TopBar({ route }: { route: Route }) {
  const { world } = useStore();
  const trail = crumbs(route, world);
  return (
    <header className="sticky top-0 z-10 grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b bg-background px-4">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
        <span className="text-sm font-semibold">Later</span>
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap">
            {trail.map((c, i) => (
              <Fragment key={c.to ? href(c.to) : "current"}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem className="min-w-0">
                  {c.to ? (
                    <BreadcrumbLink href={href(c.to)} className="truncate">
                      {c.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="truncate">{c.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex w-[min(24rem,40vw)] justify-center">
        <FindOrAskButton />
      </div>
      <div className="grid justify-self-end text-right leading-tight">
        <span className="text-sm">
          <span className="font-medium">Maya</span>
          <span className="text-muted-foreground"> · Account Manager</span>
        </span>
        <span className="text-xs text-muted-foreground">
          Prototype · fictional data · demo date Nov 18, 2026
        </span>
      </div>
    </header>
  );
}
