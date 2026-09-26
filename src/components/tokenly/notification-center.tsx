import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Bell, CheckCheck, CircleCheck, KeyRound, OctagonAlert, SlidersHorizontal, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { activityEvents, alerts } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { relative } from "./format";
import { useWorkspace, workspaceActions } from "./workspace-store";

type Item = { id: string; title: string; description: string; date: string; kind: "alert" | "activity"; severity: "healthy" | "warning" | "critical" | "info"; icon: typeof Bell; initiallyRead: boolean; link: { to: "/limits" | "/usage" | "/billing" | "/projects" | "/activity"; search?: Record<string, string> } };
const alertLinks: Record<string, Item["link"]> = {
  alt_01: { to: "/limits", search: { project: "prj_03" } },
  alt_02: { to: "/usage", search: { project: "prj_01", from: "2026-09-12", to: "2026-09-24" } },
  alt_03: { to: "/billing" }, alt_04: { to: "/limits" }, alt_05: { to: "/billing" },
};
export const notificationItems: Item[] = [
  ...alerts.map(a => ({ id: a.id, title: a.title, description: a.description, date: a.date, kind: "alert" as const, severity: a.severity, icon: a.severity === "critical" ? OctagonAlert : a.severity === "warning" ? AlertTriangle : CircleCheck, initiallyRead: a.read, link: alertLinks[a.id] ?? { to: "/limits" as const } })),
  ...activityEvents.filter(e => e.type !== "alert").map(e => ({ id: e.id, title: e.title, description: e.detail, date: e.date, kind: "activity" as const, severity: "info" as const, icon: e.type === "key" ? KeyRound : e.type === "top-up" ? Wallet : SlidersHorizontal, initiallyRead: e.date < "2026-09-20", link: e.type === "key" ? { to: "/projects" as const, ...(e.projectId ? { search: { project: e.projectId } } : {}) } : e.type === "top-up" ? { to: "/billing" as const } : { to: "/limits" as const, ...(e.projectId ? { search: { project: e.projectId } } : {}) } })),
].sort((a, b) => b.date.localeCompare(a.date));

const tone = { healthy: "text-success", warning: "text-warning", critical: "text-critical", info: "text-muted-foreground" };
export function NotificationCenter() {
  const { readNotifications } = useWorkspace();
  const [tab, setTab] = useState("all"), [open, setOpen] = useState(false);
  const isRead = (i: Item) => i.initiallyRead || readNotifications.includes(i.id);
  const unread = notificationItems.filter(i => !isRead(i));
  const list = tab === "unread" ? unread : tab === "alerts" ? notificationItems.filter(i => i.kind === "alert") : notificationItems;
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread.length} unread`} title="Notifications"><Bell />{unread.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-critical px-1 text-[10px] font-semibold leading-4 text-primary-foreground">{unread.length}</span>}</Button></PopoverTrigger>
    <PopoverContent align="end" className="w-[min(24rem,calc(100vw-1rem))] p-0">
      <div className="flex items-center justify-between border-b px-4 py-3"><span className="text-sm font-semibold">Notifications</span><Button variant="ghost" size="sm" className="h-7 text-xs" disabled={!unread.length} onClick={() => { workspaceActions.markRead(unread.map(i => i.id)); toast.success("All notifications marked as read"); }}><CheckCheck className="size-3.5" />Mark all read</Button></div>
      <Tabs value={tab} onValueChange={setTab} className="border-b px-3 py-2"><TabsList className="h-8 w-full"><TabsTrigger value="all" className="flex-1 text-xs">All</TabsTrigger><TabsTrigger value="unread" className="flex-1 text-xs">Unread{unread.length ? ` (${unread.length})` : ""}</TabsTrigger><TabsTrigger value="alerts" className="flex-1 text-xs">Alerts</TabsTrigger></TabsList></Tabs>
      <ul className="max-h-96 overflow-y-auto">{list.length ? list.map(i => { const I = i.icon, read = isRead(i); return <li key={i.id} className="border-b last:border-0"><Link to={i.link.to} search={(i.link.search ?? {}) as never} onClick={() => { workspaceActions.markRead([i.id]); setOpen(false); }} className="flex gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none"><I className={cn("mt-0.5 size-4 shrink-0", tone[i.severity])} aria-hidden /><span className="min-w-0 flex-1"><span className={cn("block text-sm", !read && "font-semibold")}>{i.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{i.description}</span><span className="mt-1 block text-[11px] text-muted-foreground">{relative(i.date)}{i.kind === "alert" ? ` · ${i.severity === "critical" ? "Critical" : i.severity === "warning" ? "Warning" : "Resolved"}` : ""}</span></span>{!read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"><span className="sr-only">Unread</span></span>}</Link></li>; }) : <li className="p-8 text-center text-sm text-muted-foreground">You're all caught up.</li>}</ul>
      <div className="border-t p-2"><Button asChild variant="ghost" size="sm" className="w-full text-xs"><Link to="/activity" onClick={() => setOpen(false)}>View all activity</Link></Button></div>
    </PopoverContent></Popover>;
}
