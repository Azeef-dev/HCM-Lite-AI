import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DropdownSelect({
    value,
    onChange,
    options, // [{ value: string, label: string }]
    placeholder = "Select…",
    className,
    triggerClassName,
    size = "default",
}) {
    const selected = options.find((o) => o.value === value);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size={size === "sm" ? "sm" : "default"}
                    className={cn(
                        "justify-between font-normal min-w-[150px] bg-background",
                        size === "sm" ? "h-9" : "h-10",
                        triggerClassName
                    )}
                >
                    <span className={cn("truncate", !selected && "text-muted-foreground")}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn("min-w-[200px] max-h-72 overflow-y-auto", className)} align="start">
                {options.map((o) => (
                    <DropdownMenuItem
                        key={o.value}
                        onClick={() => onChange(o.value)}
                        className="justify-between cursor-pointer"
                    >
                        <span className="truncate">{o.label}</span>
                        {o.value === value && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}