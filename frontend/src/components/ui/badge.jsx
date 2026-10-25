import { cn } from "@/lib/utils";

const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    destructive: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    muted: "bg-muted text-muted-foreground border-border",
};

export function Badge({ children, variant = "default", className }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                variants[variant] || variants.default,
                className
            )}
        >
            {children}
        </span>
    );
}

export function statusBadge(status) {
    const map = {
        active: "success", present: "success", approved: "success", finalized: "success",
        probation: "warning", late: "warning", pending: "warning", half_day: "warning",
        inactive: "destructive", rejected: "destructive", absent: "destructive", missing_checkout: "destructive",
        cancelled: "muted",
    };
    return map[status] || "muted";
}