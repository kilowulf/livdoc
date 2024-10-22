"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

// TooltipProvider Component:
// This component acts as the context provider for tooltips, ensuring proper state management and behavior.
export const TooltipProvider = TooltipPrimitive.Provider;

// Tooltip Root Component:
// Represents the root of the tooltip element, managing its state (open/close).
export const Tooltip = TooltipPrimitive.Root;

// TooltipTrigger Component:
// Acts as the trigger for the tooltip (e.g., a button or icon that when hovered or focused, shows the tooltip).
export const TooltipTrigger = TooltipPrimitive.Trigger;

// TooltipContent Component:
// This component is responsible for rendering the actual tooltip content. It uses `forwardRef` to manage refs.
// - The tooltip content will be positioned relative to the trigger and can be customized with `className` and `sideOffset`.
// - `sideOffset`: The distance between the trigger and the tooltip.
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>, // The type of the tooltip content element (HTML div).
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> // Props passed without ref (e.g., className, sideOffset).
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref} // Forwarded ref for accessing the content element
    sideOffset={sideOffset} // Controls the offset from the trigger (default is 4px)
    className={cn(
      // Default styles for the tooltip content including animations, background, text color, and positioning
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className // Merge any additional class names passed through props
    )}
    {...props} // Spread remaining props (e.g., children or additional configuration)
  />
));

TooltipContent.displayName = TooltipPrimitive.Content.displayName; // Ensures proper display name for debugging or dev tools
