import { cn } from "@/lib/utils";

export default function StatCard({ label, value, icon: Icon, accent = "primary", suffix }) {
    const accents = {
        primary: "bg-primary/10 text-primary",
        success: "bg-emerald-500/10 text-emerald-600",
        warning: "bg-amber-500/10 text-amber-600",
        destructive: "bg-red-500/10 text-red-600",
        info: "bg-sky-500/10 text-sky-600",
    };
    return (
        <div className="bg-card border rounded-xl p-5 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold mt-2">
                    {value}
                    {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
                </p>
            </div>
            {Icon && (
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", accents[accent])}>
                    <Icon className="h-5 w-5" />
                </div>
            )}
        </div>
    );
}