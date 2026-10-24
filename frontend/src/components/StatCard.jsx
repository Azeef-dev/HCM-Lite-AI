import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const colorMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    destructive: "bg-red-500/10 text-red-600 dark:text-red-400",
    info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export default function StatCard({ label, value, icon: Icon, color = "primary", hint }) {
    return (
        <Card className="hover:shadow-md transition-shadow border-border/70">
            <CardContent className="p-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
                    <p className="text-2xl font-bold mt-1.5 truncate">{value}</p>
                    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
                </div>
                {Icon && (
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", colorMap[color])}>
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}