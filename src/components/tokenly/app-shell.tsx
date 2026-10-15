import { useProjectsStore } from "@/components/tokenly/projects-store";
import { useLimitsStore } from "@/components/tokenly/limits-store";
import { NotificationCenter } from "@/components/tokenly/notification-center";
import { ROLES, useRole, workspaceActions } from "@/components/tokenly/workspace-store";
import { toast } from "sonner";
import { TopUpDialog } from "@/components/tokenly/billing-view";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Moon,
  Settings,
  Sun,
  Check,
  X,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { CommandMenu } from "@/components/tokenly/command-menu";
import { navGroups } from "@/components/tokenly/nav";
import { setDarkMode, useIsDark } from "@/components/tokenly/theme";
import { Logo } from "@/components/tokenly/logo";
import { organization, teamMembers } from "@/lib/mock";

export type DateSelection = {
  label: "Today" | "7d" | "30d" | "90d" | "Custom";
  from: string;
  to: string;
};
const lastDay = "2026-09-26";
function dateDaysBack(days: number) {
  const date = new Date(`${lastDay}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
const RangeContext = createContext<{
  range: DateSelection;
  setRange: (range: DateSelection) => void;
}>({ range: { label: "30d", from: dateDaysBack(29), to: lastDay }, setRange: () => {} });
export function useDateRange() {
  return useContext(RangeContext).range;
}
/*
 * Navigation: grey rail, quiet items. The selected item is solid ink (black in light mode,
 * white in dark) with inverted text and a bare line icon: no tile, no tint.
 */
const navButton =
  "h-9 gap-2.5 px-2.5 text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:font-medium data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground group-data-[collapsible=icon]:!p-2 [&>svg]:size-[18px]";
const titles: Record<string, string> = {
  "/": "Overview",
  "/usage": "Usage",
  "/projects": "Projects & Keys",
  "/limits": "Limits & Alerts",
  "/billing": "Billing",
  "/activity": "Activity",
  "/settings": "Settings",
  "/design-system": "Design system",
};
function SideNavigation() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { setOpenMobile, state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const projectsState = useProjectsStore(),
    limitsState = useLimitsStore();
  return (
    <Sidebar collapsible="icon" className="border-sidebar-border/60">
      <SidebarHeader className="p-3 pt-4 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-1">
          {collapsed ? (
            <button
              type="button"
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="flex items-center rounded-md px-1.5 py-1"
              onClick={() => toggleSidebar()}
            >
              <Logo />
            </button>
          ) : (
            <Link
              to="/"
              aria-label="Tokenly home"
              className="flex items-center rounded-md px-1.5 py-1"
              onClick={() => setOpenMobile(false)}
            >
              <Logo />
            </Link>
          )}
          <SidebarTrigger
            className="ml-auto size-8 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
            title="Collapse sidebar"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="mt-3 h-10 w-full justify-start gap-2 px-2 shadow-none hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
              title="Workspace"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-md border bg-card text-[11px] font-semibold">
                A
              </span>
              <span className="flex-1 truncate text-left text-xs font-medium group-data-[collapsible=icon]:hidden">
                {organization.name}
                <span className="block text-[10px] font-normal text-muted-foreground">
                  {organization.plan}
                </span>
              </span>
              <ChevronDown className="size-3 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuItem>{organization.name} · Current</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0 pt-1">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1.5">
            <SidebarGroupLabel className="h-7 px-2 text-[11px] font-medium text-muted-foreground/80">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={path === item.to}
                      className={navButton}
                    >
                      <Link to={item.to} onClick={() => setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="mt-1 h-11 w-full justify-start gap-2 px-2 hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
              title="User menu"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                {teamMembers[0]?.initials ?? "HN"}
              </span>
              <span className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                <span className="block truncate text-xs font-semibold">
                  {teamMembers[0]?.name ?? "Workspace owner"}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {teamMembers[0]?.email ?? ""}
                </span>
              </span>
              <ChevronDown className="size-3 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-52">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/design-system">
                <CircleHelp />
                Design system
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/"
                onClick={() => {
                  workspaceActions.startOnboarding({
                    projects: projectsState.projects.length,
                    keys: projectsState.keys.length,
                    budgets: limitsState.budgets.length,
                  });
                  toast.success("Showing the new-account setup checklist");
                }}
              >
                <CircleHelp />
                Show setup checklist
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Preview as role
            </DropdownMenuLabel>
            {ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onSelect={() => {
                  workspaceActions.setViewAs(r === "Owner" ? null : r);
                  toast.success(r === "Owner" ? "Back to your own view" : `Previewing as ${r}`);
                }}
              >
                {r}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
function DatePicker() {
  const { range, setRange } = useContext(RangeContext);
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 gap-2 bg-card text-[13px] shadow-none"
          aria-label={`Date range: ${range.label}`}
        >
          <CalendarDays className="size-4 text-muted-foreground" />
          <span>
            {range.label === "Custom"
              ? `${range.from} – ${range.to}`
              : `Last ${range.label === "Today" ? "day" : range.label}`}
          </span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Date range</p>
        {(["Today", "7d", "30d", "90d"] as const).map((label) => (
          <Button
            key={label}
            variant="ghost"
            className="h-9 w-full justify-between"
            onClick={() => {
              setRange({
                label,
                from: dateDaysBack(label === "Today" ? 0 : Number(label.slice(0, -1)) - 1),
                to: lastDay,
              });
              setOpen(false);
            }}
          >
            {label === "Today" ? "Today" : `Last ${label}`}
            {range.label === label && <span className="text-primary-ink">✓</span>}
          </Button>
        ))}
        <div className="mt-2 border-t pt-3">
          <p className="text-center text-xs font-medium text-muted-foreground">Custom range</p>
          <div className="mx-auto mt-3 flex max-w-56 flex-col items-stretch gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">From</span>
              <Input
                type="date"
                aria-label="From date"
                max={to}
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="h-9 w-full justify-center text-center text-xs"
              />
            </label>
            <ArrowDown className="mx-auto size-3.5 text-muted-foreground" aria-hidden />
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">To</span>
              <Input
                type="date"
                aria-label="To date"
                min={from}
                max={lastDay}
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="h-9 w-full justify-center text-center text-xs"
              />
            </label>
          </div>
          <Button
            className="mx-auto mt-3 flex w-full max-w-56"
            size="sm"
            disabled={!from || !to || from > to}
            onClick={() => {
              setRange({ label: "Custom", from, to });
              setOpen(false);
            }}
          >
            <Check />
            Apply range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
function ThemeToggle() {
  const dark = useIsDark();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      onClick={() => setDarkMode(!dark)}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [range, setRange] = useState<DateSelection>({
    label: "30d",
    from: dateDaysBack(29),
    to: lastDay,
  });
  const [topUpOpen, setTopUpOpen] = useState(false);
  return (
    <RangeContext.Provider value={{ range, setRange }}>
      <SidebarProvider>
        <SideNavigation />
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger
                className="size-8 shrink-0 text-muted-foreground md:hidden"
                title="Toggle sidebar"
              />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <CommandMenu onTopUp={() => setTopUpOpen(true)} />
              <div className="hidden sm:block">
                <DatePicker />
              </div>
              <ThemeToggle />
              <NotificationCenter />
            </div>
          </header>
          <div className="flex items-center justify-end border-b border-border/70 bg-background px-4 py-2 sm:hidden">
            <DatePicker />
          </div>
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-6xl">
              <ViewAsBanner />
              {/* Keyed by path so each page eases in on navigation (skipped for reduced motion). */}
              <div
                key={path}
                className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 ease-out"
              >
                {children}
              </div>
            </div>
          </main>
        </SidebarInset>
        <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
      </SidebarProvider>
    </RangeContext.Provider>
  );
}

function ViewAsBanner() {
  const { role } = useRole();
  if (role === "Owner") return null;
  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/15 bg-accent/50 px-4 py-2.5 text-sm"
    >
      <span>
        Previewing as <strong>{role}</strong>. Actions this role can't take are disabled.
      </span>
      <Button
        size="sm"
        variant="outline"
        className="h-7 bg-card"
        onClick={() => workspaceActions.setViewAs(null)}
      >
        <X />
        Exit preview
      </Button>
    </div>
  );
}
