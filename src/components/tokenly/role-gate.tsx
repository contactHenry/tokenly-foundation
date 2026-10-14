import type { ReactElement } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { deniedReason, useRole, type Permission } from "./workspace-store";

/** Renders children normally when allowed; otherwise renders the fallback (a disabled copy) wrapped in an explanatory tooltip. */
export function Gate({
  perm,
  children,
  disabled,
}: {
  perm: Permission;
  children: ReactElement;
  disabled: ReactElement;
}) {
  const { role, can } = useRole();
  if (can(perm)) return children;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={deniedReason(role)}
          >
            {disabled}
          </span>
        </TooltipTrigger>
        <TooltipContent>{deniedReason(role)}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
