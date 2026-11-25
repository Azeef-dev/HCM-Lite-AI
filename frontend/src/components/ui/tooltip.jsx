import { cn } from "cn"
import { Tooltip as TooltipPrimitive } from "radix-ui"

const TooltipProvider = TooltipPrimitive.Provider

function Tooltip({ ...props }) {
    return <TooltipPrimitive.Root {...props} />
}

function TooltipTrigger({ ...props }) {
    return <TooltipPrimitive.Trigger {...props} />
}

function TooltipContent({ className, sideOffset = 6, children, ...props }) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                sideOffset={sideOffset}
                className={cn(
                    "z-50 overflow-hidden rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                    className
                )}
                {...props}
            >
                {children}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }