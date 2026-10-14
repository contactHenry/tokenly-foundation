import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Moon, Plus, Sun } from "@/components/icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { IconTile } from "@/components/tokenly/primitives";
import { navGroups } from "@/components/tokenly/nav";
import { setDarkMode, useIsDark } from "@/components/tokenly/theme";
import { useRole } from "@/components/tokenly/workspace-store";

/** ⌘K / Ctrl+K quick search: jump to any page or run a common action. */
export function CommandMenu({ onTopUp }: { onTopUp: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dark = useIsDark();
  const { can } = useRole();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const run = (action: () => void) => {
    setOpen(false);
    action();
  };
  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages and actions…" />
        <CommandList>
          <CommandEmpty>Nothing matches that.</CommandEmpty>
          <CommandGroup heading="Go to">
            {navGroups.flatMap((group) =>
              group.items.map((page) => (
                <CommandItem
                  key={page.to}
                  value={`${page.label} ${page.description}`}
                  onSelect={() => run(() => void navigate({ to: page.to }))}
                  className="gap-3"
                >
                  <IconTile icon={page.icon} tone={page.tone} size="sm" />
                  <span className="min-w-0">
                    <span className="block font-medium">{page.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {page.description}
                    </span>
                  </span>
                </CommandItem>
              )),
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            {can("manageBilling") && (
              <CommandItem value="Top up credits" onSelect={() => run(onTopUp)}>
                <Plus />
                Top up credits
              </CommandItem>
            )}
            <CommandItem
              value={dark ? "Switch to light mode" : "Switch to dark mode"}
              onSelect={() => run(() => setDarkMode(!dark))}
            >
              {dark ? <Sun /> : <Moon />}
              {dark ? "Switch to light mode" : "Switch to dark mode"}
            </CommandItem>
            <CommandItem
              value="Design system components"
              onSelect={() => run(() => void navigate({ to: "/design-system" }))}
            >
              <BookOpen />
              Design system
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
